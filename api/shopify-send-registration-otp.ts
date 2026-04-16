import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shopify-Access-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, phone } = req.body || {};
    if (!email || !phone) {
      return res.status(400).json({ error: "Email and phone are required" });
    }

    const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
    const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';

    if (!adminToken) {
      return res.status(500).json({ error: "SHOPIFY_ADMIN_API_ACCESS_TOKEN is missing" });
    }

    // Format phone for check
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) formattedPhone = `+91${formattedPhone}`;
      else if (formattedPhone.length > 10) formattedPhone = `+${formattedPhone}`;
      else formattedPhone = `+91${formattedPhone}`; // Fallback heuristic
    }

    // 1. Check if user exists by email OR phone
    const checkQuery = `
      query searchCustomers($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    // We check via email or phone string
    const queryStr = `email:"${email}" OR phone:"${formattedPhone}"`;

    const findRes = await fetch(shopifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken! },
      body: JSON.stringify({ query: checkQuery, variables: { query: queryStr } }),
    });

    const findData = await findRes.json() as any;
    const existing = findData?.data?.customers?.edges;

    if (existing && existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        errors: [{ message: "An account with this email or phone number already exists." }] 
      });
    }

    // 2. Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // 3. Create stateless HMAC hash
    // We bind it specifically to the exact email and phone so it cannot be hijacked for another user
    const payload = `${email}:${formattedPhone}:${otp}:${expiry}`;
    const hash = crypto.createHmac('sha256', jwtSecret).update(payload).digest('hex');

    console.log(`\n📦 [REGISTRATION PRE-VERIFY] Generating OTP for: ${email} | ${formattedPhone}`);
    // OTP deliberately NOT logged for security in production, but we ensure it matches DLT rules
    // console.log(`🔑 [REGISTRATION PRE-VERIFY] Generated OTP: ${otp}\n`); 

    // 4. Send SMS via Edumarc
    const smsApiKey = process.env.EDUMARC_SMS_API_KEY;
    const senderId = process.env.EDUMARC_SENDER_ID || "SLMAYU";
    const templateId = process.env.EDUMARC_TEMPLATE_ID;
    // DLT Template rule: Must match EXACTLY including '2 minutes' or providers block it.
    const smsMessage = `Your login OTP for Salmara Ayurveda is ${otp}. Valid for 2 minutes. Do not share this code. SLMAYU`;
    const cleanPhone = formattedPhone.replace(/^\+/, '');

    if (!smsApiKey || !templateId) {
      console.error("[AUTH ERROR] SMS configuration missing");
      return res.status(500).json({ error: "SMS service not configured on server" });
    }

    try {
      console.log(`[AUTH] Dispatching SMS via Edumarc to ${cleanPhone}...`);
      const smsRes = await fetch('https://smsapi.edumarcsms.com/api/v1/sendsms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': smsApiKey },
        body: JSON.stringify({
          message: smsMessage,
          senderId: senderId,
          number: [cleanPhone],
          templateId: templateId
        })
      });
      
      const smsData = await smsRes.json() as any;
      console.log(`[AUTH] Edumarc Response Status: ${smsRes.status} | Data:`, JSON.stringify(smsData));

      if (!smsRes.ok || smsData.status === 'error' || smsData.responseCode === 'error') {
        throw new Error(smsData.message || smsData.response || "SMS provider rejected message");
      }
      
      console.log(`[AUTH] Registration OTP sent successfully to ${cleanPhone}`);
    } catch (smsErr: any) {
      console.error("[AUTH ERROR] SMS delivery failed:", smsErr.message);
      return res.status(500).json({ error: `Message delivery failed: ${smsErr.message}` });
    }

    const phoneHint = formattedPhone.replace(/.(?=.{4})/g, '*');

    // Return hash, expiry, phoneHint (DO NOT return OTP)
    res.status(200).json({ 
      success: true, 
      hash, 
      expiry, 
      phoneHint 
    });

  } catch (error: any) {
    console.error("[Shopify Send OTP Error]", error);
    res.status(500).json({ error: error.message });
  }
}
