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
    const productId = req.query.product_id as string;

    if (!productId) {
      return res.status(400).json({ error: "product_id is required" });
    }

    try {
      const query = `
        query getProductReviews($id: ID!) {
          product(id: $id) {
            metafield(namespace: "custom", key: "reviews") { value }
          }
        }
      `;

      const response = await fetch(shopifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken },
        body: JSON.stringify({ query, variables: { id: productId } }),
      });

      const data = await response.json() as any;
      const metafieldValue = data?.data?.product?.metafield?.value;
      return res.status(200).json(metafieldValue ? JSON.parse(metafieldValue) : []);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch reviews", message: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { productId, customerId, rating, reviewText, customerName } = req.body;

      if (!productId || !customerId || !rating) {
        return res.status(400).json({ error: "Missing required review fields" });
      }

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

      const shopifyRes = await fetch(shopifyUrl, {
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
        return res.status(403).json({ error: "Only verified customers can leave a review." });
      }

      // 2. Fetch current reviews
      const reviewsQuery = `
        query getProductReviews($id: ID!) {
          product(id: $id) {
            metafield(namespace: "custom", key: "reviews") { value }
          }
        }
      `;

      const getRes = await fetch(shopifyUrl, {
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

      // 3. Update metafield
      const updateMutation = `
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id }
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

      return res.status(200).json({ success: true, review: newReview });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
