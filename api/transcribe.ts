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

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [audioPart, prompt]
    });

    const transcript = response.text || "";
    res.status(200).json({ transcript: transcript.trim() });
  } catch (err: any) {
    console.error("Transcription API error:", err);
    res.status(500).json({ error: "Unable to transcribe voice. Please try again." });
  }
}
