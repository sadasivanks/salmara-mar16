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
    const { name, email, phone_number, category, user_text } = req.body || {};

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    // Get lazily initialized client
    const supabase = getSupabaseClient();

    // Insert into contact_us table
    const { data, error } = await supabase
      .from('contact_us')

      .insert([
        { 
          name,
          email: email.toLowerCase(), 
          phone_number,
          category,
          user_text,
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
    console.error('Contact Submission Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
