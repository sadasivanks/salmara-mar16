import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './lib/supabase';
import bcrypt from 'bcryptjs';


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
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, password } = req.body;
    
    // Get lazily initialized client (centralized helper)
    const supabase = getSupabaseClient();


    // Query users and join roles
    const { data: user, error: userError } = await (supabase
      .from("users")
      .select("*, roles(role_name)")
      .eq("email", email?.toLowerCase())
      .single() as any);

    if (userError || !user) {
      console.error("[ADMIN LOGIN ERROR] User not found or Supabase error:", userError);
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Use bcrypt for secure password comparison
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Extract role name safely
    const roleData = user.roles;
    const roleName = Array.isArray(roleData) ? roleData[0]?.role_name : roleData?.role_name;
    
    console.log("[ADMIN LOGIN DEBUG] Detected Role:", roleName);

    if (!roleName || roleName.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Access Denied: Administrative role required." });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName
      }
    });
  } catch (error: any) {
    console.error("[Admin Login Error]", error);
    return res.status(500).json({ error: error.message });
  }
}
