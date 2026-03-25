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

  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
  const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/checkouts.json`;

  if (!storeDomain || !adminToken) {
    return res.status(500).json({ error: "Shopify credentials missing" });
  }

  try {
    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[Shopify REST Error ${response.status}]`, data);
    }
    
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("[Shopify REST Proxy Exception]", error);
    return res.status(500).json({ 
      error: error.message,
      isTimeout: error.name === 'AbortError' || error.message?.includes('Maximum retries reached')
    });
  }
}
