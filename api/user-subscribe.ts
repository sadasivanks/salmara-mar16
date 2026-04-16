import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

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

    const emailLower = email.toLowerCase();

    // First check if the email already exists to avoid unique constraint issues with upsert
    const { data: existingRecord, error: searchError } = await supabase
      .from('subscribes')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (searchError) {
      console.error('Supabase Search Error:', searchError);
      return res.status(500).json({ error: searchError.message });
    }

    let data, error;

    if (existingRecord) {
      // Update the existing record
      const updateResponse = await supabase
        .from('subscribes')
        .update({
          user_id: userId || existingRecord.user_id || null,
          is_subscribed: true
        })
        .eq('email', emailLower)
        .select();
        
      data = updateResponse.data;
      error = updateResponse.error;
    } else {
      // Insert completely new record
      const insertResponse = await supabase
        .from('subscribes')
        .insert([
          { 
            email: emailLower, 
            user_id: userId || null,
            is_subscribed: true 
          }
        ])
        .select();
        
      data = insertResponse.data;
      error = insertResponse.error;
    }

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
