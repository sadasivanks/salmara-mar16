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
    const { email } = req.body || {};
    
    if (!email) {
      return res.status(400).json({ errors: [{ message: "Email is required." }] });
    }

    const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN ;
    const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

    if (!adminToken) {
      console.error("Shopify Admin Token missing");
      return res.status(500).json({ error: "SHOPIFY_ADMIN_API_ACCESS_TOKEN is not configured" });
    }

    // 1. Find customers by search (fuzzy)
    const customerQuery = `
      query getCustomersBySearch($query: String!) {
        customers(first: 10, query: $query) {
          edges {
            node {
              id
              email
              phone
              defaultAddress {
                phone
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
      return res.status(400).json({ errors: findData.errors });
    }

    const customerEdges = findData?.data?.customers?.edges || [];
    
    // 2. Strict filtering for EXACT email match
    const customer = customerEdges.find((edge: any) => 
      edge.node.email.toLowerCase().trim() === email.toLowerCase().trim()
    )?.node;

    if (!customer) {
      console.error(`[RESET PWD ERROR] No exact email match found for: ${email}`);
      return res.status(404).json({ errors: [{ message: "Account not found with this exact email." }] });
    }

    // Capture and clean phone number
    // Priority: Profile Phone > Default Address Phone
    const rawPhone = customer.phone || customer.defaultAddress?.phone;

    if (!rawPhone) {
      console.error(`[RESET PWD ERROR] No phone number found for customer: ${email}`);
      return res.status(400).json({ 
        errors: [{ message: "This account doesn't have a linked phone number for recovery. Please contact support." }] 
      });
    }

    const sanitizedPhone = rawPhone.trim().replace(/\s+/g, ''); // Remove spaces
    const formattedPhone = sanitizedPhone.replace(/^\+/, ''); // Remove + for Edumarc

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 4. Store OTP in Metafields via Admin API
    const updateMetafieldsMutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id }
          userErrors { field message }
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
              { namespace: "custom_auth", key: "otp", value: otp, type: "single_line_text_field" },
              { namespace: "custom_auth", key: "otp_expires", value: otpExpiry, type: "single_line_text_field" }
            ]
          }
        }
      }),
    });

    const updateData = await updateRes.json() as any;
    if (updateData.errors || updateData.data?.customerUpdate?.userErrors?.length > 0) {
      console.error("Metafield Update Errors:", updateData.errors || updateData.data.customerUpdate.userErrors);
      return res.status(500).json({ error: "Failed to securely store reset code" });
    }

    // 5. Send Real SMS via Edumarc
    const smsApiKey = process.env.EDUMARC_SMS_API_KEY;
    const senderId = process.env.EDUMARC_SENDER_ID || "SLMAYU";
    const templateId = process.env.EDUMARC_TEMPLATE_ID;
    const smsMessage = `Your login OTP for Salmara Ayurveda is ${otp}. Valid for 2 minutes. Do not share this code. SLMAYU`;
    
    if (!smsApiKey || !templateId) {
      console.error("[RESET PWD ERROR] SMS configuration missing");
      return res.status(500).json({ errors: [{ message: "SMS service not configured." }] });
    }

    try {
      const smsRes = await fetch('https://smsapi.edumarcsms.com/api/v1/sendsms', {
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
      if (!smsRes.ok || smsData.status === 'error') {
        throw new Error(smsData.message || "SMS provider error");
      }
    } catch (smsErr: any) {
      console.error("[RESET PWD ERROR] SMS delivery failed:", smsErr);
      return res.status(500).json({ 
        errors: [{ message: `Failed to send recovery SMS: ${smsErr.message}` }] 
      });
    }

    res.status(200).json({
      success: true,
      email: customer.email,
      phoneHint: sanitizedPhone.replace(/.(?=.{4})/g, '*') // Use sanitized version for hint
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: error.message });
  }
}
