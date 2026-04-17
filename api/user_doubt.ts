import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './lib/supabase';


export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!email || !name || !message) {
      return res.status(400).json({ error: 'Name, Email, and Message are required.' });
    }

    // Get lazily initialized client
    const supabase = getSupabaseClient();

    // Insert into user_doubt table
    const { data, error } = await supabase
      .from('user_doubt')

      .insert([
        { 
          name,
          email: email.toLowerCase(), 
          message,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('User Doubt Submission Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
