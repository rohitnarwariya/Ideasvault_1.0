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

function setCorsHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
}

export default async function handler(req: Request, res: Response) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    url = "",
    title = "",
    description = "",
    notes = "",
    voiceTranscript = "",
    platform = "OTHER",
    board = "💡 Random Ideas",
    collectionId = null,
    imageUrl = "",
    userId = "demo-user",
    favIconUrl = ""
  } = req.body || {};

  try {
    const finalDescription = (notes || description || "").trim();
    const finalVoiceTranscript = voiceTranscript.trim();

    // Generate fallback title ONLY if title is empty
    let finalTitle = title.trim();
    if (!finalTitle) {
      if (finalVoiceTranscript) {
        // Create 3-6 word title from transcript
        const words = finalVoiceTranscript.split(/\s+/).filter(Boolean);
        finalTitle = words.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      } else if (finalDescription) {
        const words = finalDescription.split(/\s+/).filter(Boolean);
        finalTitle = words.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      } else {
        finalTitle = `Inspiration from ${platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}`;
      }
    }

    const ideaId = `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (!isSupabaseConfigured || userId === "demo-user") {
      return res.status(200).json({
        success: true,
        idea: {
          id: ideaId,
          title: finalTitle,
          url,
          notes: finalDescription,
          platform,
          board,
          createdAt: new Date().toISOString(),
          imageUrl,
          voiceTranscript: finalVoiceTranscript,
          aiStatus: "ready"
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Resolve or create collection
    let resolvedCollectionId = collectionId;
    if (!resolvedCollectionId && board) {
      const { data: cols } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId);

      let found = cols?.find((c: any) => c.name.toLowerCase().includes(board.toLowerCase()) || board.toLowerCase().includes(c.name.toLowerCase()));
      if (found) {
        resolvedCollectionId = found.id;
      } else {
        const newColId = `col-${Date.now()}`;
        const { data: newCol } = await supabase
          .from('collections')
          .insert({
            id: newColId,
            name: board.startsWith("💡") ? board : `💡 ${board}`,
            user_id: userId,
            icon: "💡"
          })
          .select('*')
          .single();
        if (newCol) {
          resolvedCollectionId = newCol.id;
        }
      }
    }

    const initialAiSummary = {
      notes: finalDescription,
      isFavorite: false,
      imageUrl: imageUrl || null,
      tags: [platform, "Chrome Extension"]
    };

    const dbPayload = {
      id: ideaId,
      title: finalTitle,
      url: url,
      platform: platform,
      voice_transcript: finalVoiceTranscript || null,
      ai_status: "ready",
      ai_summary: JSON.stringify(initialAiSummary),
      ai_tags: [platform, "Chrome Extension"],
      user_id: userId,
      collection_id: resolvedCollectionId || null,
      created_at: new Date().toISOString()
    };

    const { error: dbErr } = await supabase.from('ideas').insert(dbPayload);

    if (dbErr) {
      console.error("Extension save Supabase error:", dbErr);
      return res.status(500).json({ error: dbErr.message || "Failed to save idea" });
    }

    return res.status(200).json({
      success: true,
      idea: {
        id: ideaId,
        title: finalTitle,
        url,
        notes: finalDescription,
        platform,
        board,
        collection_id: resolvedCollectionId,
        createdAt: new Date().toISOString(),
        imageUrl,
        voiceTranscript: finalVoiceTranscript,
        aiStatus: "ready"
      }
    });

  } catch (err: any) {
    console.error("Extension save handler exception:", err);
    return res.status(500).json({ error: err.message || "Failed to save idea" });
  }
}
