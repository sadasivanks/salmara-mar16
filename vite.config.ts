import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import dns from "node:dns";

// Force IPv4-first DNS resolution to fix "fetch failed" (undici) issues on some local networks
dns.setDefaultResultOrder("ipv4first");

/**
 * Vite plugin that creates a server-side proxy endpoint at /api/shopify-admin.
 * This keeps the Admin API access token on the server and never exposes it to the browser.
 */
function shopifyAdminProxy(): Plugin {
  return {
    name: "shopify-admin-proxy",
    configureServer(server) {
      // Pre-load all environment variables once at startup for performance
      const env = loadEnv("development", process.cwd(), "");
      const adminToken = (env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || env.VITE_SHOPIFY_ADMIN_API_ACCESS_TOKEN)?.trim();
      const storeDomain = (env.VITE_SHOPIFY_STORE_DOMAIN || "salmara-5.myshopify.com").trim();
      const apiVersion = (env.VITE_SHOPIFY_API_VERSION || "2024-01").trim();
      const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
      
      const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

      // Shared fetch helper with timeout and retry logic
      const secureFetch = async (url: string, options: any, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout per attempt
          
          try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            return response;
          } catch (error: any) {
            const isLastRetry = i === retries - 1;
            const isTimeout = error.name === 'AbortError';
            const isNetworkError = error.name === 'TypeError' || error.message?.includes('fetch failed');
            
            if (isLastRetry) {
              console.error(`[SECURE FETCH] Final failure for ${url}:`, error.message);
              throw error;
            }
            
            if (isTimeout || isNetworkError) {
              const backoff = (i + 1) * 2000;
              console.warn(`[SECURE FETCH] Attempt ${i + 1} failed (${error.name}). Retrying in ${backoff}ms...`);
              await new Promise(resolve => setTimeout(resolve, backoff));
              continue;
            }
            
            throw error; // If it's not a timeout or network error, don't retry
          } finally {
            clearTimeout(timeoutId);
          }
        }
        throw new Error("Maximum retries reached");
      };

      // --- 1. General Admin API Proxy ---
      server.middlewares.use("/api/shopify-admin", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          if (!adminToken) throw new Error("SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing");
          
          const shopifyRes = await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body,
          });

          const data = await shopifyRes.text();
          res.writeHead(shopifyRes.status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(data);
        } catch (error: any) {
          console.error("[Shopify Admin Proxy Error]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            error: "Shopify Admin Proxy Fetch Failed", 
            message: error.message,
            isTimeout: error.name === 'AbortError' || error.message?.includes('Maximum retries reached')
          }));
        }
      });

      // --- 1b. Registration Proxy (Atomic Creation + OTP) ---
      server.middlewares.use("/api/shopify-register", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          const { input } = JSON.parse(body);
          if (!adminToken) throw new Error("SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing");

          // 1. Create Customer with pending tag
          const createMutation = `
            mutation customerCreate($input: CustomerInput!) {
              customerCreate(input: $input) {
                customer { id email phone tags }
                userErrors { field message }
              }
            }
          `;

          const createRes = await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({ query: createMutation, variables: { input } }),
          });

          const createData = await createRes.json() as any;
          const customer = createData?.data?.customerCreate?.customer;
          const errors = createData?.data?.customerCreate?.userErrors;

          if (errors?.length > 0 || !customer) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, errors: errors || [{ message: "Creation failed" }] }));
            return;
          }

          // 2. Generate OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

          // 3. Store OTP in Metafields
          const updateMutation = `
            mutation update($input: CustomerInput!) {
              customerUpdate(input: $input) { customer { id } }
            }
          `;
          await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({
              query: updateMutation,
              variables: {
                input: {
                  id: customer.id,
                  metafields: [
                    { namespace: "custom_auth", key: "otp", value: otp, type: "single_line_text_field" },
                    { namespace: "custom_auth", key: "otp_expires", value: otpExpiry, type: "single_line_text_field" }
                  ]
                }
              }
            }),
          });

          console.log(`\n📦 [REGISTRATION] New User: ${customer.email}`);
          console.log(`🔑 [REGISTRATION] Generated OTP: ${otp}\n`);

          // 4. Send SMS via Edumarc
          if (customer.phone) {
            const smsApiKey = "56682895f69247d386c1c38121485c36";
            const senderId = "SLMAYU";
            const templateId = "1707176959332051773";
            const smsMessage = `Your login OTP for Salmara Ayurveda is ${otp}. Valid for 2 minutes. Do not share this code. SLMAYU`;
            const formattedPhone = customer.phone.replace(/^\+/, '');

            console.log(`[AUTH] Sending registration OTP to ${formattedPhone}...`);
            try {
              const smsRes = await secureFetch('https://smsapi.edumarcsms.com/api/v1/sendsms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': smsApiKey },
                body: JSON.stringify({
                  message: smsMessage,
                  senderId: senderId,
                  number: [formattedPhone],
                  templateId: templateId
                })
              });
              const smsData = await smsRes.json() as any;
              console.log(`[AUTH] Registration SMS API Response:`, JSON.stringify(smsData));
            } catch (smsErr) {
              console.error("[AUTH ERROR] Registration SMS delivery failed:", smsErr);
            }
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, customer }));
        } catch (error: any) {
          console.error("[Shopify Register Proxy Error]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // --- 2. Login Proxy ---
      server.middlewares.use("/api/shopify-login", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          const { email, password } = JSON.parse(body);
          console.log(`[LOGIN PROXY] Attempting login for: ${email}`);
          
          if (!adminToken) throw new Error("SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing");
          
          const customerQuery = `
            query getCustomerByEmail($query: String!) {
              customers(first: 1, query: $query) {
                edges {
                  node {
                    id
                    email
                    firstName
                    lastName
                    phone
                    tags
                    password: metafield(namespace: "custom_auth", key: "password") { value }
                    cartId: metafield(namespace: "custom_auth", key: "cart_id") { value }
                    cartJson: metafield(namespace: "custom_auth", key: "cart_json") { value }
                  }
                }
              }
            }
          `;

          const response = await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({ query: customerQuery, variables: { query: `email:${email}` } }),
          });

          const data = await response.json() as any;
          const customer = data?.data?.customers?.edges?.[0]?.node;

          if (!customer) {
            console.warn(`[LOGIN PROXY] No customer found with email: ${email}`);
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "Invalid email or password." }] }));
            return;
          }

          if (customer.password?.value !== password) {
            console.warn(`[LOGIN PROXY] Password mismatch for: ${email}`);
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "Invalid email or password." }] }));
            return;
          }

          // Generate OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

          // Check if verification is required
          const isPending = customer.tags?.includes("pending_verification");
          if (isPending) {
            console.log(`[LOGIN PROXY] Unverified user login blocked: ${email}`);
          }

          const updateMetaMutation = `
            mutation customerUpdate($input: CustomerInput!) {
              customerUpdate(input: $input) {
                customer { id }
                userErrors { field message }
              }
            }
          `;

          await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({
              query: updateMetaMutation,
              variables: {
                input: {
                  id: customer.id,
                  metafields: [
                    { namespace: "custom_auth", key: "otp", value: otp, type: "single_line_text_field" },
                    { namespace: "custom_auth", key: "otp_expires", value: otpExpiry, type: "single_line_text_field" }
                  ]
                }
              }
            }),
          });

          console.log(`[LOGIN PROXY] OTP for ${email}: ${otp}`);

          // 6. Send Real SMS via Edumarc
          const smsApiKey = "56682895f69247d386c1c38121485c36";
          const senderId = "SLMAYU";
          const templateId = "1707176959332051773";
          const smsMessage = `Your login OTP for Salmara Ayurveda is ${otp}. Valid for 2 minutes. Do not share this code. SLMAYU`;
          
          const customerPhone = customer.phone;

          if (!customerPhone) {
            console.error(`[AUTH ERROR] No phone number found for customer: ${email}`);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "No phone number linked to this account. Please contact support." }] }));
            return;
          }

          // Format phone number: Remove '+' 
          const formattedPhone = customerPhone.replace(/^\+/, '');

          console.log(`[AUTH] Sending SMS OTP to ${formattedPhone}...`);

          try {
            const smsRes = await secureFetch('https://smsapi.edumarcsms.com/api/v1/sendsms', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json', 
                'apikey': smsApiKey 
              },
              body: JSON.stringify({
                message: smsMessage,
                senderId: senderId,
                number: [formattedPhone],
                templateId: templateId
              })
            });

            const smsData = await smsRes.json() as any;
            console.log(`[AUTH] SMS API Response:`, JSON.stringify(smsData));

            if (!smsRes.ok || smsData.status === 'error') {
              throw new Error(smsData.message || "SMS provider error");
            }
          } catch (smsErr: any) {
            console.error("[AUTH ERROR] SMS delivery failed:", smsErr);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: `Failed to send SMS: ${smsErr.message}` }] }));
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            requiresOtp: true,
            requiresVerification: isPending,
            email: customer.email,
            phoneHint: customerPhone.replace(/.(?=.{4})/g, '*')
          }));
        } catch (error: any) {
          console.error("[Shopify Login Proxy Error]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            error: error.message,
            isTimeout: error.name === 'AbortError' || error.message?.includes('Maximum retries reached')
          }));
        }
      });

      // --- 2b. OTP Verification Proxy ---
      server.middlewares.use("/api/shopify-verify-otp", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          const { email, otp } = JSON.parse(body);
          if (!adminToken) throw new Error("SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing");

          const customerQuery = `
            query getCustomerOtp($query: String!) {
              customers(first: 1, query: $query) {
                edges {
                  node {
                    id
                    email
                    firstName
                    lastName
                    phone
                    tags
                    otp: metafield(namespace: "custom_auth", key: "otp") { value }
                    otpExpires: metafield(namespace: "custom_auth", key: "otp_expires") { value }
                    cartId: metafield(namespace: "custom_auth", key: "cart_id") { value }
                  }
                }
              }
            }
          `;

          const response = await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({ query: customerQuery, variables: { query: `email:${email}` } }),
          });

          const data = await response.json() as any;
          const customer = data?.data?.customers?.edges?.[0]?.node;

          if (!customer) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "Session expired or invalid user." }] }));
            return;
          }

          if (customer.otp?.value !== otp || !customer.otpExpires?.value || new Date() > new Date(customer.otpExpires.value)) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "Invalid or expired verification code." }] }));
            return;
          }

          // Clear OTP and optionally remove pending tag
          const isPending = customer.tags?.includes("pending_verification");
          const updatedTags = isPending 
            ? customer.tags.filter((t: string) => t !== "pending_verification")
            : undefined;

          const clearMutation = `
            mutation customerUpdate($input: CustomerInput!) {
              customerUpdate(input: $input) { customer { id } }
            }
          `;
          await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({
              query: clearMutation,
              variables: {
                input: {
                  id: customer.id,
                  tags: updatedTags,
                  metafields: [
                    { namespace: "custom_auth", key: "otp", value: "", type: "single_line_text_field" },
                    { namespace: "custom_auth", key: "otp_expires", value: "", type: "single_line_text_field" }
                  ]
                }
              }
            }),
          });

          const userData = {
            id: customer.id,
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            shopifyCartId: customer.cartId?.value
          };

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, user: userData }));
        } catch (error: any) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // --- 3. Reviews Proxy ---
      server.middlewares.use("/api/reviews", async (req, res) => {
        if (!storeDomain || !adminToken) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Shopify credentials missing" }));
          return;
        }

        if (req.method === "GET") {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const productId = url.searchParams.get("product_id");
          const productIds = url.searchParams.get("product_ids");

          if (!productId && !productIds) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "product_id or product_ids is required" }));
            return;
          }

          try {
            if (productId) {
              const query = `
                query getProductReviews($id: ID!) {
                  product(id: $id) {
                    metafield(namespace: "custom", key: "reviews") { value }
                  }
                }
              `;

              const response = await secureFetch(shopifyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
                body: JSON.stringify({ query, variables: { id: productId } }),
              });

              const data = await response.json() as any;
              const metafieldValue = data?.data?.product?.metafield?.value;
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(metafieldValue ? JSON.parse(metafieldValue) : []));
            } else {
              // Bulk fetch
              const ids = productIds!.split(',');
              const query = `
                query getBulkReviews($ids: [ID!]!) {
                  nodes(ids: $ids) {
                    ... on Product {
                      id
                      metafield(namespace: "custom", key: "reviews") { value }
                    }
                  }
                }
              `;

              const response = await secureFetch(shopifyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
                body: JSON.stringify({ query, variables: { ids } }),
              });

              const data = await response.json() as any;
              const nodes = data?.data?.nodes || [];
              const results = nodes.map((node: any) => ({
                id: node?.id,
                reviews: node?.metafield?.value ? JSON.parse(node.metafield.value) : []
              }));
              
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(results));
            }
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to fetch reviews", message: err.message }));
          }
          return;
        }

        if (req.method === "POST") {
          let body = "";
          for await (const chunk of req) body += chunk;

          try {
            const { productId, customerId, rating, reviewText, customerName } = JSON.parse(body);

            // 1. Verify purchase
            const purchaseQuery = `
              query getCustomerOrders($id: ID!) {
                customer(id: $id) {
                  orders(first: 50) {
                    edges {
                      node {
                        lineItems(first: 50) {
                          edges {
                            node { product { id } }
                          }
                        }
                      }
                    }
                  }
                }
              }
            `;

            const shopifyRes = await secureFetch(shopifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
              body: JSON.stringify({ query: purchaseQuery, variables: { id: customerId } }),
            });

            const shopifyData = await shopifyRes.json() as any;
            const orders = shopifyData?.data?.customer?.orders?.edges || [];
            const getNumericId = (gid: string) => gid?.split('/').pop();
            const targetProductIdNum = getNumericId(productId);

            const hasPurchased = orders.some((order: any) =>
              order.node.lineItems.edges.some((li: any) => {
                const boughtProductId = li.node.product?.id;
                return boughtProductId === productId || (boughtProductId && getNumericId(boughtProductId) === targetProductIdNum);
              })
            );

            if (!hasPurchased) {
              res.writeHead(403, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Only verified customers can leave a review." }));
              return;
            }

            // 2. Fetch and Update
            const reviewsQuery = `
              query getProductReviews($id: ID!) {
                product(id: $id) {
                  metafield(namespace: "custom", key: "reviews") { value }
                }
              }
            `;

            const getRes = await secureFetch(shopifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
              body: JSON.stringify({ query: reviewsQuery, variables: { id: productId } }),
            });

            const getData = await getRes.json() as any;
            const currentReviews = JSON.parse(getData?.data?.product?.metafield?.value || "[]");
            
            const newReview = {
              id: Date.now().toString(),
              product_id: productId,
              customer_id: customerId,
              rating: Number(rating),
              review_text: reviewText,
              customer_name: customerName,
              created_at: new Date().toISOString()
            };

            const updateMutation = `
              mutation productUpdate($input: ProductInput!) {
                productUpdate(input: $input) {
                  product { id }
                  userErrors { field message }
                }
              }
            `;

            const updateRes = await secureFetch(shopifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
              body: JSON.stringify({
                query: updateMutation,
                variables: {
                  input: {
                    id: productId,
                    metafields: [{
                      namespace: "custom",
                      key: "reviews",
                      value: JSON.stringify([...currentReviews, newReview]),
                      type: "json"
                    }]
                  }
                }
              }),
            });

            const updateData = await updateRes.json() as any;
            const userErrors = updateData?.data?.productUpdate?.userErrors || [];
            
            if (userErrors.length > 0) throw new Error(userErrors[0].message);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, review: newReview }));
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message || "Internal server error" }));
          }
          return;
        }

        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not allowed" }));
      });

      // --- 4. Subscriptions Proxy ---
      server.middlewares.use("/api/user-subscribe", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          const { email, userId } = JSON.parse(body);
          if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials missing");

          // Check if email exists
          const checkRes = await secureFetch(`${supabaseUrl}/rest/v1/subscribes?email=eq.${email.toLowerCase()}`, {
            headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
          });

          const existing = await checkRes.json() as any[];
          if (existing && existing.length > 0) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, alreadySubscribed: true }));
            return;
          }

          // Insert new
          const response = await secureFetch(`${supabaseUrl}/rest/v1/subscribes`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
            body: JSON.stringify({ email: email.toLowerCase(), user_id: userId || null, is_subscribed: true }),
          });

          if (!response.ok) throw new Error("Failed to subscribe");

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        } catch (error: any) {
          console.error("[SUBSCRIBE PROXY ERROR]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // --- 4b. Contact Us Proxy ---
      server.middlewares.use("/api/contact_us", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          const { name, email, phone_number, category, user_text } = JSON.parse(body);
          if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials missing");

          const response = await secureFetch(`${supabaseUrl}/rest/v1/contact_us`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              "apikey": supabaseKey, 
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=representation"
            },
            body: JSON.stringify({ 
              name, 
              email: email.toLowerCase(), 
              phone_number, 
              category, 
              user_text 
            }),
          });

          if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Failed to record inquiry: ${errorMsg}`);
          }

          const data = await response.json();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data }));
        } catch (error: any) {
          console.error("[CONTACT PROXY ERROR]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // --- 4c. User Doubt Proxy ---
      server.middlewares.use("/api/user_doubt", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          const { name, email, message } = JSON.parse(body);
          if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials missing");

          const response = await secureFetch(`${supabaseUrl}/rest/v1/user_doubt`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              "apikey": supabaseKey, 
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=representation"
            },
            body: JSON.stringify({ 
              name, 
              email: email.toLowerCase(), 
              message 
            }),
          });

          if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Failed to record doubt: ${errorMsg}`);
          }

          const data = await response.json();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data }));
        } catch (error: any) {
          console.error("[USER DOUBT PROXY ERROR]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
 
      // --- 5. Checkout Logging Relay ---
      server.middlewares.use("/api/log-checkout", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end();
          return;
        }
        let body = "";
        for await (const chunk of req) body += chunk;
        try {
          const { url, source, items } = JSON.parse(body);
          console.log("\x1b[36m%s\x1b[0m", `[CHECKOUT EVENT] Source: ${source}`);
          console.log("\x1b[33m%s\x1b[0m", `URL: ${url}`);
          if (items) console.log(`Items: ${JSON.stringify(items)}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(400);
          res.end();
        }
      });
 
      // --- 6. Wishlist Proxy ---
      server.middlewares.use("/api/wishlist", async (req, res) => {
        if (!storeDomain || !adminToken) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Shopify credentials missing" }));
          return;
        }

        const url = new URL(req.url!, `http://${req.headers.host}`);

        if (req.method === "GET") {
          const customerId = url.searchParams.get("customerId");
          if (!customerId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "customerId is required" }));
            return;
          }

          try {
            const query = `
              query getCustomerWishlist($id: ID!) {
                customer(id: $id) {
                  metafield(namespace: "custom", key: "wishlist") { value }
                }
              }
            `;
            const response = await secureFetch(shopifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
              body: JSON.stringify({ query, variables: { id: customerId } }),
            });
            const data = await response.json() as any;
            const wishlistValue = data?.data?.customer?.metafield?.value;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ wishlist: wishlistValue ? JSON.parse(wishlistValue) : [] }));
          } catch (error: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: error.message }));
          }
        } else if (req.method === "POST") {
          let body = "";
          for await (const chunk of req) body += chunk;

          try {
            const { customerId, productIds } = JSON.parse(body);
            const mutation = `
              mutation customerUpdate($input: CustomerInput!) {
                customerUpdate(input: $input) {
                  customer { id }
                  userErrors { field message }
                }
              }
            `;
            const response = await secureFetch(shopifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
              body: JSON.stringify({
                query: mutation,
                variables: {
                  input: {
                    id: customerId,
                    metafields: [{ namespace: "custom", key: "wishlist", value: JSON.stringify(productIds), type: "json" }]
                  }
                }
              }),
            });
            const data = await response.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
          } catch (error: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: error.message }));
          }
        }
      });
 
      // --- 9. Admin Login Proxy (Supabase-based) ---
      server.middlewares.use("/api/admin-auth-login", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end();
          return;
        }
 
        let body = "";
        for await (const chunk of req) body += chunk;
 
        try {
          console.log("\x1b[32m[ADMIN AUTH v4] Processing request...\x1b[0m");
          const { email, password } = JSON.parse(body);
          const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
          const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
          
          console.log("[ADMIN LOGIN DEBUG] Credentials check:", { 
            hasUrl: !!supabaseUrl, 
            hasKey: !!supabaseKey,
            keyPrefix: supabaseKey ? supabaseKey.substring(0, 10) + "..." : "none"
          });

          if (!supabaseUrl || !supabaseKey) {
            const missing = !supabaseUrl ? "VITE_SUPABASE_URL" : "VITE_SUPABASE_ANON_KEY";
            console.error(`[ADMIN LOGIN ERROR] Supabase credential missing: ${missing}`);
            throw new Error(`Supabase credential missing: ${missing}`);
          }

          // Initialize local Supabase client with service key for role-joining
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Query users and join roles
          const { data: user, error: userError } = await (supabase
            .from("users")
            .select("*, roles(role_name)")
            .eq("email", email.toLowerCase())
            .single() as any);

          if (userError || !user) {
            console.error("[ADMIN LOGIN ERROR] User not found or Supabase error:", userError);
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid email or password." }));
            return;
          }

          console.log("[ADMIN LOGIN DEBUG] User found:", user.email, "Internal Structure:", JSON.stringify(user, null, 2));

          // Use bcrypt for secure password comparison
          if (!bcrypt.compareSync(password, user.password)) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid email or password." }));
            return;
          }
 
          // Extract role name safely
          const roleName = user.roles?.role_name || (Array.isArray(user.roles) ? user.roles[0]?.role_name : null);
          console.log("[ADMIN LOGIN DEBUG] Detected Role:", roleName);

          if (!roleName || roleName.toLowerCase() !== "admin") {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Access Denied: Administrative role required." }));
            return;
          }
 
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.roles.role_name
            }
          }));
        } catch (error: any) {
          console.error("[Admin Login Proxy Error]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
 
      // --- 8. Admin REST Checkout Proxy ---
      server.middlewares.use("/api/shopify-checkout-rest", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end();
          return;
        }
 
        let body = "";
        for await (const chunk of req) body += chunk;
 
        const checkoutUrl = `https://${storeDomain}/admin/api/${apiVersion}/checkouts.json`;
 
        try {
          if (!adminToken) throw new Error("Admin Token missing");
          
          const response = await secureFetch(checkoutUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": adminToken,
            },
            body,
          });
 
          const data = await response.text();
          
          if (!response.ok) {
            console.error(`\x1b[31m[Shopify REST Error ${response.status}]\x1b[0m`, data);
          }
          
          res.writeHead(response.status, { "Content-Type": "application/json" });
          res.end(data);
        } catch (error: any) {
          console.error("[Shopify REST Proxy Exception]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            error: error.message,
            isTimeout: error.name === 'AbortError' || error.message?.includes('Maximum retries reached')
          }));
        }
      });
 

      // --- 10. Sync Cart Proxy (Metafield-based) ---
      server.middlewares.use("/api/shopify-sync-cart", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end();
          return;
        }

        let body = "";
        for await (const chunk of req) body += chunk;

        try {
          const { customerId, cartJson } = JSON.parse(body);
          if (!adminToken) throw new Error("Admin Token missing");

          const mutation = `
            mutation customerUpdate($input: CustomerInput!) {
              customerUpdate(input: $input) {
                customer { id }
                userErrors { field message }
              }
            }
          `;

          const response = await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({
              query: mutation,
              variables: {
                input: {
                  id: customerId,
                  metafields: [{
                    namespace: "custom_auth",
                    key: "cart_json",
                    value: cartJson,
                    type: "json"
                  }]
                }
              }
            }),
          });

          const data = await response.json();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data));
        } catch (error: any) {
          console.error("[Shopify Sync Cart Proxy Error]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // --- 11. Request Password Reset Proxy ---
      server.middlewares.use("/api/shopify-request-reset", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        for await (const chunk of req) body += chunk;
        try {
          const { email } = JSON.parse(body);
          if (!adminToken) throw new Error("SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing");
          
          const customerQuery = `
            query getCustomerByEmail($query: String!) {
              customers(first: 1, query: $query) {
                edges { node { id email phone } }
              }
            }
          `;
          const response = await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({ query: customerQuery, variables: { query: `email:${email}` } }),
          });
          const data = await response.json() as any;
          const customer = data?.data?.customers?.edges?.[0]?.node;

          if (!customer) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "Account not found with this email." }] }));
            return;
          }
          if (!customer.phone) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "No phone number linked to this account for recovery." }] }));
            return;
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

          await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({
              query: `mutation update($input: CustomerInput!) { customerUpdate(input: $input) { customer { id } } }`,
              variables: {
                input: {
                  id: customer.id,
                  metafields: [
                    { namespace: "custom_auth", key: "otp", value: otp, type: "single_line_text_field" },
                    { namespace: "custom_auth", key: "otp_expires", value: otpExpiry, type: "single_line_text_field" }
                  ]
                }
              }
            }),
          });

          // Send SMS via Edumarc
          const smsApiKey = "56682895f69247d386c1c38121485c36";
          const smsMessage = `Your login OTP for Salmara Ayurveda is ${otp}. Valid for 2 minutes. Do not share this code. SLMAYU`;
          const formattedPhone = customer.phone.replace(/^\+/, '');
          
          try {
            await secureFetch('https://smsapi.edumarcsms.com/api/v1/sendsms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'apikey': smsApiKey },
              body: JSON.stringify({
                message: smsMessage,
                senderId: "SLMAYU",
                number: [formattedPhone],
                templateId: "1707176959332051773"
              })
            });
          } catch (smsErr) {
            console.error("[RESET PWD PROXY] SMS failed:", smsErr);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            email: customer.email,
            phoneHint: customer.phone.replace(/.(?=.{4})/g, '*')
          }));
        } catch (error: any) {
          console.error("[RESET PWD PROXY ERROR]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      // --- 12. Reset Password Proxy ---
      server.middlewares.use("/api/shopify-reset-password", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        for await (const chunk of req) body += chunk;
        try {
          const { email, otp, newPassword } = JSON.parse(body);
          if (!adminToken) throw new Error("SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing");

          const query = `
            query getOtp($query: String!) {
              customers(first: 1, query: $query) {
                edges { node { 
                  id 
                  otp: metafield(namespace: "custom_auth", key: "otp") { value }
                  otpExpires: metafield(namespace: "custom_auth", key: "otp_expires") { value }
                } }
              }
            }
          `;
          const response = await secureFetch(shopifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
            body: JSON.stringify({ query, variables: { query: `email:${email}` } }),
          });
          const data = await response.json() as any;
          const customer = data?.data?.customers?.edges?.[0]?.node;

          if (!customer || customer.otp?.value !== otp || new Date() > new Date(customer.otpExpires?.value)) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ errors: [{ message: "Invalid or expired verification code." }] }));
            return;
          }

          if (newPassword) {
            await secureFetch(shopifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
              body: JSON.stringify({
                query: `mutation update($input: CustomerInput!) { customerUpdate(input: $input) { customer { id } } }`,
                variables: {
                  input: {
                    id: customer.id,
                    metafields: [
                      { namespace: "custom_auth", key: "password", value: newPassword, type: "single_line_text_field" },
                      { namespace: "custom_auth", key: "otp", value: "", type: "single_line_text_field" },
                      { namespace: "custom_auth", key: "otp_expires", value: "", type: "single_line_text_field" }
                    ]
                  }
                }
              }),
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: "Password updated successfully." }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: "OTP verified." }));
          }
        } catch (error: any) {
          console.error("[RESET CONFIRM PROXY ERROR]", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  assetsInclude: ["**/*.JPG"],
  plugins: [
    react(),
    shopifyAdminProxy(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupIds: false,
                removeViewBox: false,
              },
            },
          },
          'sortAttrs',
          {
            name: 'addAttributesToSVGElement',
            params: {
              attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
            },
          },
        ],
      },
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
      avif: {
        lossless: true,
      },
      cache: true,
      cacheLocation: undefined,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
