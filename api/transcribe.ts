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

export default async function handler(req: any, res: any) {
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

    const prompt = "Please transcribe this audio. Output ONLY the exact transcribed spoken words. Do NOT add any notes, commentary, tags, formatting, or metadata. If the audio is completely silent or has no speech, output absolutely nothing.";

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
            contents: [audioPart, prompt]
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

    const transcript = response.text || "";
    res.status(200).json({ transcript: transcript.trim() });
  } catch (err: any) {
    console.error("Transcription API error:", err);
    res.status(500).json({ error: "Unable to transcribe voice. Please try again." });
  }
}
