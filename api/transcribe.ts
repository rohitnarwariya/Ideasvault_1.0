import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

function setCorsHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { audioData, mimeType } = req.body || {};

  if (!audioData) {
    return res.status(400).json({ error: "No audio data provided" });
  }

  try {
    const client = getGeminiClient();
    if (!client) {
      console.warn("Transcription requested but no Gemini API Key is configured.");
      return res.status(400).json({ error: "Unable to transcribe voice. Please try again." });
    }

    const audioPart = {
      inlineData: {
        data: audioData,
        mimeType: mimeType || "audio/webm"
      }
    };

    const prompt = `You are a high-quality speech transcription and cleanup engine for a creative notes app.

TASK:
1. Transcribe the spoken audio accurately.
2. Clean up the transcript according to these strict rules:
   - Keep the user's original meaning and writing style intact.
   - Automatically remove filler words (e.g., "um", "uh", "hmm", "you know", "like", "actually", "so yeah", "okay so").
   - Remove repeated words caused by hesitation or false starts (e.g., "this is... this is" -> "this is").
   - Preserve technical terms, proper nouns, creative jargon, and brand names.
   - Preserve sentence order and all meaningful thoughts. DO NOT summarize, compress, expand, or invent information.
   - Clean up grammar, add proper punctuation, and capitalize sentences correctly.
   - Ignore silence longer than 2 seconds and background noise.
   - If audio confidence is low or speech is faint, output the literal spoken words rather than hallucinating words.
   - If audio is silent or contains no speech, return empty transcript and empty title.

3. Title Generation:
   - Create a concise, descriptive title (3-6 words) based ONLY on what the user said.
   - Must be in Title Case.
   - NEVER use generic titles like "Untitled", "Voice Memo", "Audio Recording", "New Note", or "Idea".
   - Examples:
     Speech: "I love the split screen transition." -> Title: "Split Screen Transition"
     Speech: "This color palette feels very cinematic." -> Title: "Cinematic Color Palette"
     Speech: "I want to recreate this hook." -> Title: "Hook Recreation Idea"

Return a JSON object with this exact structure:
{
  "transcript": "Cleaned transcript text here",
  "title": "3-6 Word Descriptive Title"
}`;

    // Retry and fallback model logic
    const models = ["gemini-3.6-flash", "gemini-3.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const model of models) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Transcribe attempt ${attempt}/3 with model ${model}`);
          response = await client.models.generateContent({
            model: model,
            contents: [audioPart, prompt],
            config: {
              responseMimeType: "application/json",
            }
          });
          if (response) break;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const errCode = err?.status || err?.code || (err?.error?.code) || 0;
          console.warn(`Transcribe attempt ${attempt} with model ${model} failed (code: ${errCode}): ${errMsg}`);
          
          if (errCode === 400) {
            break; // Don't retry bad request
          }
          
          if (attempt < 3) {
            const delay = 1000 * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      if (response) break;
    }

    if (!response) {
      throw lastError || new Error("All transcription attempts failed");
    }

    let transcript = "";
    let generatedTitle = "";

    try {
      const rawText = response.text?.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim() || "{}";
      const parsed = JSON.parse(rawText);
      transcript = parsed.transcript || "";
      generatedTitle = parsed.title || "";
    } catch (e) {
      transcript = response.text || "";
    }

    res.status(200).json({ 
      transcript: transcript.trim(),
      title: generatedTitle.trim()
    });
  } catch (err: any) {
    console.error("Transcription API error:", err);
    res.status(500).json({ error: "Unable to transcribe voice. Please try again." });
  }
}
