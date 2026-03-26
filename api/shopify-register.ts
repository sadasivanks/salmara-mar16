import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shopify-Access-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { input } = req.body || {};
    if (!input) {
      return res.status(400).json({ error: "Missing registration input" });
    }

    const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

    if (!adminToken) {
      return res.status(500).json({ error: "SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing" });
    }

    // 1. Create Customer with pending tag
    const createMutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id email phone tags }
          userErrors { field message }
        }
      }
    `;

    const createRes = await fetch(shopifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
      body: JSON.stringify({ query: createMutation, variables: { input } }),
    });

    const createData = await createRes.json() as any;
    const customer = createData?.data?.customerCreate?.customer;
    const errors = createData?.data?.customerCreate?.userErrors;

    if (errors?.length > 0 || !customer) {
      return res.status(400).json({ success: false, errors: errors || [{ message: "Creation failed" }] });
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
    await fetch(shopifyUrl, {
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

    console.log(`\n📦 [PRODUCTION REGISTRATION] New User: ${customer.email}`);
    console.log(`🔑 [PRODUCTION REGISTRATION] Generated OTP: ${otp}\n`);

    // 4. Send SMS via Edumarc
    if (customer.phone) {
      const smsApiKey = "56682895f69247d386c1c38121485c36";
      const senderId = "SLMAYU";
      const templateId = "1707176959332051773";
      const smsMessage = `Your login OTP for Salmara Ayurveda is ${otp}. Valid for 2 minutes. Do not share this code. SLMAYU`;
      const formattedPhone = customer.phone.replace(/^\+/, '');

      console.log(`[AUTH] Sending production registration OTP to ${formattedPhone}...`);
      try {
        const smsRes = await fetch('https://smsapi.edumarcsms.com/api/v1/sendsms', {
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
        console.log(`[AUTH] Production Registration SMS API Response:`, JSON.stringify(smsData));
      } catch (smsErr) {
        console.error("[AUTH ERROR] Production Registration SMS delivery failed:", smsErr);
      }
    }

    res.status(200).json({ success: true, customer });
  } catch (error: any) {
    console.error("[Shopify Register Production Error]", error);
    res.status(500).json({ error: error.message });
  }
}
