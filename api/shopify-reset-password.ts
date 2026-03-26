import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shopify-Access-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, otp, newPassword } = req.body || {};
    
    if (!email || !otp) {
      return res.status(400).json({ errors: [{ message: "Email and OTP are required." }] });
    }

    const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

    if (!adminToken) {
      return res.status(500).json({ error: "SHOPIFY_ADMIN_API_ACCESS_TOKEN is not configured" });
    }

    // 1. Fetch customer OTP and current data
    const customerQuery = `
      query getCustomerOtp($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              email
              otp: metafield(namespace: "custom_auth", key: "otp") { value }
              otpExpires: metafield(namespace: "custom_auth", key: "otp_expires") { value }
            }
          }
        }
      }
    `;

    const findRes = await fetch(shopifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
      body: JSON.stringify({ query: customerQuery, variables: { query: `email:${email}` } }),
    });

    const findData = await findRes.json() as any;
    const customer = findData?.data?.customers?.edges?.[0]?.node;

    if (!customer) {
      return res.status(404).json({ errors: [{ message: "Account not found." }] });
    }

    const storedOtp = customer.otp?.value;
    const expiresAt = customer.otpExpires?.value;

    // 2. Validate OTP
    if (!storedOtp || storedOtp !== otp) {
      return res.status(401).json({ errors: [{ message: "Invalid verification code." }] });
    }

    if (!expiresAt || new Date() > new Date(expiresAt)) {
      return res.status(401).json({ errors: [{ message: "Verification code has expired." }] });
    }

    // 3. If newPassword is provided, update it and clear OTP
    if (newPassword) {
      const updateMutation = `
        mutation customerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id }
            userErrors { field message }
          }
        }
      `;

      const updateRes = await fetch(shopifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
        body: JSON.stringify({
          query: updateMutation,
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

      const updateData = await updateRes.json() as any;
      const userErrors = updateData.data?.customerUpdate?.userErrors || [];

      if (updateData.errors || userErrors.length > 0) {
        console.error("Reset Password Errors:", updateData.errors || userErrors);
        return res.status(500).json({ errors: userErrors.length > 0 ? userErrors : [{ message: "Failed to update password." }] });
      }

      return res.status(200).json({ success: true, message: "Password updated successfully." });
    }

    // 4. Just verify OTP
    res.status(200).json({ success: true, message: "OTP verified." });

  } catch (error: any) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: error.message });
  }
}
