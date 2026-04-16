import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shopify-Access-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { input, verification } = req.body || {};
    
    if (!input || !verification) {
      return res.status(400).json({ error: "Missing registration or verification data" });
    }

    const { hash, expiry, otp } = verification;
    const { email, phone } = input;

    if (!hash || !expiry || !otp || !email || !phone) {
      return res.status(400).json({ error: "Incomplete verification payload" });
    }

    // 1. Verify OTP Hash
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    // Must match the payload generated in shopify-send-registration-otp: `${email}:${phone}:${otp}:${expiry}`
    const expectedPayload = `${email}:${phone}:${otp}:${expiry}`;
    const expectedHash = crypto.createHmac('sha256', jwtSecret).update(expectedPayload).digest('hex');

    if (hash !== expectedHash) {
      return res.status(401).json({ success: false, errors: [{ message: "Invalid verification code." }] });
    }

    // 2. Verify Expiry
    if (Date.now() > expiry) {
      return res.status(401).json({ success: false, errors: [{ message: "Verification code has expired." }] });
    }

    // 3. OTP is Valid! Proceed to create the customer in Shopify
    const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

    if (!adminToken) {
      return res.status(500).json({ error: "SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing" });
    }

    const createMutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id email firstName lastName phone tags }
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
      return res.status(400).json({ success: false, errors: errors || [{ message: "Creation failed (likely user already exists or invalid data)." }] });
    }

    console.log(`\n✅ [REGISTRATION SUCCESS] OTP Verified. Customer created: ${customer.email}\n`);

    res.status(200).json({ success: true, customer });
  } catch (error: any) {
    console.error("[Shopify Register Production Error]", error);
    res.status(500).json({ error: error.message });
  }
}
