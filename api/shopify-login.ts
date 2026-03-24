import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ errors: [{ message: "Email and password are required." }] });
    }

    const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN ;
    const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

    if (!adminToken) {
      console.error("Shopify Admin Token missing");
      return res.status(500).json({ error: "SHOPIFY_ADMIN_API_ACCESS_TOKEN is not configured" });
    }

    // 1. Find customer by email and get their private metafield
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
              password: metafield(namespace: "custom_auth", key: "password") {
                value
              }
              cartId: metafield(namespace: "custom_auth", key: "cart_id") {
                value
              }
            }
          }
        }
      }
    `;

    const findRes = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({
        query: customerQuery,
        variables: { query: `email:${email}` }
      }),
    });

    const findData = await findRes.json() as any;
    
    if (findData.errors) {
      console.error("Shopify GraphQL Errors:", findData.errors);
      return res.status(401).json({ errors: findData.errors });
    }

    const customer = findData?.data?.customers?.edges?.[0]?.node;

    if (!customer) {
      return res.status(401).json({ errors: [{ message: "Email not found." }] });
    }

    const storedPassword = customer.password?.value;

    // 2. Simple password verification
    if (storedPassword !== password) {
      return res.status(401).json({ errors: [{ message: "Invalid password." }] });
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 4. Store OTP in Metafields via Admin API
    const updateMetafieldsMutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const updateRes = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({
        query: updateMetafieldsMutation,
        variables: {
          input: {
            id: customer.id,
            metafields: [
              {
                namespace: "custom_auth",
                key: "otp",
                value: otp,
                type: "single_line_text_field"
              },
              {
                namespace: "custom_auth",
                key: "otp_expires",
                value: otpExpiry,
                type: "single_line_text_field"
              }
            ]
          }
        }
      }),
    });

    const updateData = await updateRes.json() as any;
    if (updateData.errors || updateData.data?.customerUpdate?.userErrors?.length > 0) {
      console.error("Metafield Update Errors:", updateData.errors || updateData.data.customerUpdate.userErrors);
      return res.status(500).json({ error: "Failed to securely store OTP" });
    }

    // 5. Send Email (MOCK/PLACEHOLDER)
    // IMPORTANT: Replace this with your actual email service (Resend, SendGrid, etc.)
    console.log(`[AUTH] OTP for ${email}: ${otp}`);
    
    // Example for Resend:
    /*
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Salmara <auth@salmara.in>',
          to: [email],
          subject: 'Your Login OTP',
          html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`
        })
      });
    }
    */

    // 6. Return response to trigger OTP view
    res.status(200).json({
      success: true,
      requiresOtp: true,
      email: customer.email
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
}
