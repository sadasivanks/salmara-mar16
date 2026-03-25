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

  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
  const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;

  if (!storeDomain || !adminToken) {
    return res.status(500).json({ error: "Shopify credentials missing" });
  }

  if (req.method === "GET") {
    const customerId = req.query.customerId as string;
    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }

    try {
      const query = `
        query getCustomerWishlist($id: ID!) {
          customer(id: $id) {
            metafield(namespace: "custom", key: "wishlist") { value }
          }
        }
      `;
      const response = await fetch(shopifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
        body: JSON.stringify({ query, variables: { id: customerId } }),
      });
      const data = await response.json() as any;
      const wishlistValue = data?.data?.customer?.metafield?.value;
      return res.status(200).json({ wishlist: wishlistValue ? JSON.parse(wishlistValue) : [] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { customerId, productIds } = req.body;
      if (!customerId || !productIds) {
        return res.status(400).json({ error: "customerId and productIds are required" });
      }

      const mutation = `
        mutation customerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id }
            userErrors { field message }
          }
        }
      `;
      const response = await fetch(shopifyUrl, {
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
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
