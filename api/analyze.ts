import { GoogleGenAI, Type } from "@google/genai";

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

// Simulated mock analysis generator for offline fallback
function getSimulatedAnalysis(notes: string, url: string, targetPlatform?: string, customTitle?: string, voiceTranscript?: string) {
  const normalizedNotes = (notes || "").toLowerCase();
  
  // Try to guess a platform if none provided
  let guessedPlatform = targetPlatform || "WEBSITE";
  if (!targetPlatform || targetPlatform === "OTHER") {
    if (url.includes("youtube.com") || url.includes("youtu.be")) guessedPlatform = "YOUTUBE";
    else if (url.includes("instagram.com")) guessedPlatform = "INSTAGRAM";
    else if (url.includes("pinterest.com") || url.includes("pin.it")) guessedPlatform = "PINTEREST";
    else if (url.includes("reddit.com")) guessedPlatform = "REDDIT";
    else if (url.includes("github.com")) guessedPlatform = "GITHUB";
    else if (url.includes("linkedin.com")) guessedPlatform = "LINKEDIN";
    else if (url.includes("spotify.com") || url.includes("apple.com/podcasts")) guessedPlatform = "PODCAST";
  }

  // Generate a realistic title (3-6 words) based on Voice Transcript or Notes
  let generatedTitle = customTitle || "";
  if (!customTitle) {
    const textToUse = (voiceTranscript && voiceTranscript.trim() !== "") ? voiceTranscript : notes;
    if (textToUse && textToUse.trim() !== "") {
      const words = textToUse.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        const cleanWords = words.slice(0, 5).map(w => w.replace(/[^\w\s-]/g, ''));
        generatedTitle = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      }
    }
    
    if (!generatedTitle || generatedTitle.trim() === "") {
      if (guessedPlatform === "YOUTUBE") generatedTitle = "Cinematic Video Creation";
      else if (guessedPlatform === "INSTAGRAM") generatedTitle = "Fast Short Form Hook";
      else if (guessedPlatform === "PINTEREST") generatedTitle = "Minimal Web Spacing";
      else if (guessedPlatform === "LINKEDIN") generatedTitle = "Editorial Typography Layout";
      else generatedTitle = "Custom Aesthetic Inspiration";
    }
  }

  return {
    title: generatedTitle,
    platform: guessedPlatform,
    tags: ["Visual Design", "Layout", "Aesthetic", "Inspiration"],
    creativeInsight: "",
    whyItWorks: "",
    sequentialBlueprint: [],
    howToAdapt: []
  };
}

export default async function handler(req: any, res: any) {
  // Only allow POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { notes, url, platform, board, title, voiceTranscript } = req.body || {};

  try {
    const client = getGeminiClient();
    if (!client) {
      console.log("No Gemini API Key found. Returning handcrafted simulated analysis.");
      const analysis = getSimulatedAnalysis(notes, url, platform, title, voiceTranscript);
      return res.status(200).json(analysis);
    }

    let sourceTextForTitle = "";
    if (voiceTranscript && voiceTranscript.trim() !== "") {
      sourceTextForTitle = voiceTranscript.trim();
    } else if (notes && notes.trim() !== "") {
      sourceTextForTitle = notes.trim();
    } else if (url && url.trim() !== "") {
      sourceTextForTitle = `URL: ${url.trim()}`;
    } else {
      sourceTextForTitle = "Inspiration from Board: " + (board || "Random Ideas");
    }

    const systemPrompt = `
You are the advanced AI core of 'IdeaVault'.
Your primary task is to generate a short, human-readable, and clear title for a saved inspiration item.

Rules for Title:
- It MUST be between 3 to 6 words long.
- It MUST be clear, human-readable, and describe the inspiration.
- It MUST come directly from describing the provided source text (the Voice Transcript or the Written Description).
- Do NOT use technical jargon unless mentioned in the text.
- Do NOT invent fake concepts not supported by the source text.
- If the source text is very simple, describe it cleanly (e.g. "Cinematic Low-Key Lighting", "Fast Instagram Hook", "Minimal Landing Page", "Smooth Camera Movement", "Bold Typography Layout").
- If a user-provided custom title is specified in the input, you MUST return that custom title EXACTLY without modifying, polishing, or changing it.
`;

    const userPrompt = `
Generate the title and tags based on the following:
- Source Text for Title: "${sourceTextForTitle}"
- Input Notes/Thoughts: "${notes || ""}"
- Source Link/URL: "${url || ""}"
- Target Board: "${board || "Random Ideas"}"
- User Provided Title: "${title || ""}"
- User Indicated Platform: "${platform || "OTHER"}"
`;

    // Retry and fallback model logic
    const models = ["gemini-3.6-flash", "gemini-3.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const model of models) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Analyze attempt ${attempt}/3 with model ${model}`);
          response = await client.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { 
                    type: Type.STRING, 
                    description: "Generate a 3-6 word clear, human-readable title describing the inspiration based on the source text (voice transcript preferred, or written description). Do NOT use AI-invented jargon. If a custom title is provided, return it exactly." 
                  },
                  platform: { 
                    type: Type.STRING, 
                    description: "The normalized platform name. Must be one of: YOUTUBE, INSTAGRAM, PINTEREST, WEBSITE, REDDIT, PODCAST, LINKEDIN, GITHUB, OTHER" 
                  },
                  tags: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }, 
                    description: "3-4 keywords summarizing the style or technique from the description. E.g. ['Lighting', 'Camera Pan', 'Transitions']" 
                  }
                },
                required: ["title", "platform", "tags"]
              }
            }
          });
          if (response) break;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const errCode = err?.status || err?.code || (err?.error?.code) || 0;
          console.warn(`Analyze attempt ${attempt} with model ${model} failed (code: ${errCode}): ${errMsg}`);
          
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
      throw lastError || new Error("All analyze attempts failed");
    }

    const parsedResponse = JSON.parse(response.text || "{}");
    
    // Ensure that if a title was provided, we use it exactly
    if (title && title.trim() !== "") {
      parsedResponse.title = title.trim();
    }

    // Set other properties to empty/defaults to prevent schema issues
    parsedResponse.creativeInsight = "";
    parsedResponse.whyItWorks = "";
    parsedResponse.sequentialBlueprint = [];
    parsedResponse.howToAdapt = [];

    res.status(200).json(parsedResponse);
  } catch (err: any) {
    console.error("Gemini API error:", err);
    const analysis = getSimulatedAnalysis(notes, url, platform, title, voiceTranscript);
    res.status(200).json(analysis);
  }
}
