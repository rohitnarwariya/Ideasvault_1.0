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

const DEFAULT_COLLECTIONS = [
  { id: "col-all", name: "📁 All Inspirations", icon: "📁" },
  { id: "col-yt", name: "📹 YouTube", icon: "📹" },
  { id: "col-ig", name: "📸 Instagram", icon: "📸" },
  { id: "col-pin", name: "📌 Pinterest", icon: "📌" },
  { id: "col-x", name: "🐦 X (Twitter)", icon: "🐦" },
  { id: "col-reddit", name: "🤖 Reddit", icon: "🤖" },
  { id: "col-linkedin", name: "💼 LinkedIn", icon: "💼" },
  { id: "col-ui", name: "🎨 UI Inspiration", icon: "🎨" },
  { id: "col-random", name: "💡 Random Ideas", icon: "💡" }
];

export default async function handler(req: Request, res: Response) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = (req.query.userId as string) || req.body?.userId;

  try {
    if (!isSupabaseConfigured || !userId || userId === "demo-user") {
      return res.status(200).json({
        success: true,
        collections: DEFAULT_COLLECTIONS
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      return res.status(200).json({
        success: true,
        collections: DEFAULT_COLLECTIONS
      });
    }

    const collections = data.map((c: any) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || "💡"
    }));

    return res.status(200).json({
      success: true,
      collections
    });

  } catch (err: any) {
    console.error("Extension collections error:", err);
    return res.status(200).json({
      success: true,
      collections: DEFAULT_COLLECTIONS
    });
  }
}
