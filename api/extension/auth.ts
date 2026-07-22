import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== "" && 
  !supabaseUrl.includes("placeholder")
);

const getSupabase = () => {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
};

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password, action } = req.body || {};

  try {
    const supabase = getSupabase();

    if (!supabase) {
      // Local fallback mode when Supabase credentials are not present
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const userName = email.split("@")[0] || "Creator";
      return res.status(200).json({
        success: true,
        user: {
          id: "demo-user",
          email,
          name: userName,
          avatar: ""
        },
        session: {
          access_token: "demo-access-token-123",
          user_id: "demo-user"
        },
        supabaseConfigured: false
      });
    }

    if (action === "verify_session") {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token required" });
      }
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: "Invalid session token" });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Creator",
          avatar: user.user_metadata?.avatar_url || ""
        },
        session: { access_token: token, user_id: user.id },
        supabaseConfigured: true
      });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Standard login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message || "Invalid login credentials" });
    }

    const u = data.user;
    return res.status(200).json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || u.email?.split("@")[0] || "Creator",
        avatar: u.user_metadata?.avatar_url || ""
      },
      session: data.session,
      supabaseConfigured: true
    });

  } catch (err: any) {
    console.error("Extension auth error:", err);
    return res.status(500).json({ error: err.message || "Authentication failed" });
  }
}
