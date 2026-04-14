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
    const { email, userId } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Get lazily initialized client
    const supabase = getSupabaseClient();

    // 1. Check if subscription already exists for this email
    const { data: existing, error: fetchError } = await supabase
      .from('subscribes')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    let result;
    if (existing) {
      // 2. Update existing subscription
      result = await supabase
        .from('subscribes')
        .update({ 
          user_id: userId || null,
          is_subscribed: true 
        })
        .eq('id', existing.id)
        .select();
    } else {
      // 3. Insert new subscription
      result = await supabase
        .from('subscribes')
        .insert({ 
          email: email.toLowerCase(), 
          user_id: userId || null,
          is_subscribed: true 
        })
        .select();
    }

    const { data, error } = result;


    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Subscription Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
