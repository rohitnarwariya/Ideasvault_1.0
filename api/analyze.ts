import { Type } from "@google/genai";
import { getGeminiClient, getSimulatedAnalysis } from "./_utils";

export default async function handler(req: any, res: any) {
  // Only allow POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { notes, url, platform, board, title } = req.body || {};

  try {
    const client = getGeminiClient();
    if (!client) {
      // Return beautiful simulated content if API Key is not yet present
      console.log("No Gemini API Key found. Returning handcrafted simulated analysis.");
      const analysis = getSimulatedAnalysis(notes, url, platform, title);
      return res.status(200).json(analysis);
    }

    const systemPrompt = `
You are the advanced AI core of 'IdeaVault', a premium SaaS for creators. 
Your job is to analyze saved content inspirations (YouTube videos, Instagram Reels, Pinterest pins, Tweets, Articles) and provide a highly technical, structured "AI-powered context blueprint". 
You MUST explain:
1. Why it worked (Why it captured attention, what visual, pacing, or narrative technique succeeded).
2. Creative Insights (Visual styling, layout structures, copywriting devices).
3. A sequential step-by-step content blueprint on how the creator can recreate this.
4. Actionable adapt-and-reuse instructions.

Output MUST be strictly JSON mapping the provided schema. Be extremely specific, detailed, and write in a high-end premium tone (like Linear, Apple, or Vercel style - detailed, objective, highly analytical). Avoid vague generic filler text.
`;

    const userPrompt = `
Please analyze this saved inspiration:
- Input Notes/Thoughts: "${notes || "No notes provided"}"
- Source Link/URL: "${url || "No link provided"}"
- Target Board: "${board || "Random Ideas"}"
- User Provided Title: "${title || ""}"
- User Indicated Platform: "${platform || "OTHER"}"
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING, 
              description: "Generate a premium, descriptive title for this inspiration. Max 5-7 words. E.g. 'Minimalist Grid Layout & Bauhaus Overlay'. If a good title was provided, polish it." 
            },
            platform: { 
              type: Type.STRING, 
              description: "The normalized platform name. Must be one of: YOUTUBE, INSTAGRAM, PINTEREST, WEBSITE, REDDIT, PODCAST, LINKEDIN, GITHUB, OTHER" 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "3-4 highly technical keywords/tags summarizing the style or technique. E.g. ['Bauhaus', 'Rhythm', 'Speed Ramp', 'Visual Flow']" 
            },
            creativeInsight: { 
              type: Type.STRING, 
              description: "A highly detailed paragraph (2-3 sentences) detailing the visual aesthetics, copywriting techniques, design choices, or cinematography." 
            },
            whyItWorks: { 
              type: Type.STRING, 
              description: "A solid block of analysis (2-3 sentences) explaining the psychological, optical, or narrative reason why this specific pattern captured attention and why the user saved it." 
            },
            sequentialBlueprint: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Exactly 4 chronological, detailed steps to reconstruct this exact visual, structure, or content piece." 
            },
            howToAdapt: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Exactly 4 highly actionable, concrete guidelines/tips on how a creator can adapt and reuse this in their own project (e.g. layout ratios, video timing, typography weights)." 
            }
          },
          required: ["title", "platform", "tags", "creativeInsight", "whyItWorks", "sequentialBlueprint", "howToAdapt"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.status(200).json(parsedResponse);
  } catch (err: any) {
    console.error("Gemini API error:", err);
    // Return high-quality mock data instead of crashing
    const analysis = getSimulatedAnalysis(notes, url, platform, title);
    res.status(200).json(analysis);
  }
}
