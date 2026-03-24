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
    const { email, otp } = req.body || {};
    
    if (!email || !otp) {
      return res.status(400).json({ errors: [{ message: "Email and OTP are required." }] });
    }

    const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

    // 1. Fetch customer OTP metafields
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
              otp: metafield(namespace: "custom_auth", key: "otp") { value }
              otpExpires: metafield(namespace: "custom_auth", key: "otp_expires") { value }
              cartId: metafield(namespace: "custom_auth", key: "cart_id") { value }
            }
          }
        }
      }
    `;

    const findRes = await fetch(shopifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken! },
      body: JSON.stringify({ query: customerQuery, variables: { query: `email:${email}` } }),
    });

    const findData = await findRes.json() as any;
    const customer = findData?.data?.customers?.edges?.[0]?.node;

    if (!customer) {
      return res.status(401).json({ errors: [{ message: "Session expired or invalid user." }] });
    }

    const storedOtp = customer.otp?.value;
    const expiresAt = customer.otpExpires?.value;

    // 2. Validate OTP and Expiry
    if (!storedOtp || storedOtp !== otp) {
      return res.status(401).json({ errors: [{ message: "Invalid verification code." }] });
    }

    if (!expiresAt || new Date() > new Date(expiresAt)) {
      return res.status(401).json({ errors: [{ message: "Verification code has expired." }] });
    }

    // 3. Clear OTP after successful verification
    const clearOtpMutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id }
        }
      }
    `;

    await fetch(shopifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken! },
      body: JSON.stringify({
        query: clearOtpMutation,
        variables: {
          input: {
            id: customer.id,
            metafields: [
              { namespace: "custom_auth", key: "otp", value: "", type: "single_line_text_field" },
              { namespace: "custom_auth", key: "otp_expires", value: "", type: "single_line_text_field" }
            ]
          }
        }
      }),
    });

    // 4. Return success with full user session
    res.status(200).json({
      success: true,
      user: {
        id: customer.id,
        email: customer.email,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        shopifyCartId: customer.cartId?.value
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
