import { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory token cache (valid for the lifetime of the serverless instance)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getShiprocketToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials missing');
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.token) {
    throw new Error(data.message || 'Shiprocket login failed');
  }

  cachedToken = data.token;
  // Tokens are usually valid for 10 days. We'll cache for 9 days to be safe.
  tokenExpiry = now + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  try {
    const token = await getShiprocketToken();

    if (action === 'track') {
      const { awb } = req.query;
      if (!awb) return res.status(400).json({ error: 'AWB code required' });

      console.log(`Shiprocket: Tracking AWB ${awb}`);
      const trackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const responseText = await trackRes.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Shiprocket Track Parsing Error:', responseText);
        return res.status(trackRes.status).json({ 
          error: 'Logistics provider returned an invalid response format', 
          raw: responseText.substring(0, 500) 
        });
      }
      return res.status(trackRes.status).json(data);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error: any) {
    console.error('Shiprocket Proxy Exception:', error.message);
    res.status(500).json({ error: 'Internal Logistics Proxy Error', message: error.message });
  }
}
