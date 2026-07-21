import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
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
export function getSimulatedAnalysis(notes: string, url: string, targetPlatform?: string, customTitle?: string) {
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

  // Generate a realistic title
  let generatedTitle = customTitle || "Creative Layout System";
  if (!customTitle) {
    if (guessedPlatform === "YOUTUBE") generatedTitle = "Hook-Driven Video Storytelling";
    else if (guessedPlatform === "INSTAGRAM") generatedTitle = "Dynamic Transition Showcase";
    else if (guessedPlatform === "PINTEREST") generatedTitle = "Minimalist Grid & Spacing Study";
    else if (guessedPlatform === "LINKEDIN") generatedTitle = "Text-First Informational Carousel";
    else if (notes.trim()) {
      generatedTitle = notes.split(".").filter(Boolean)[0]?.substring(0, 45) || "Custom Inspired Design";
    }
  }

  // Pre-configured elegant mock analyses based on platforms or notes
  if (guessedPlatform === "PINTEREST" || normalizedNotes.includes("grid") || normalizedNotes.includes("bauhaus")) {
    return {
      title: generatedTitle,
      platform: "PINTEREST",
      tags: ["Bauhaus", "Grid System", "Visual Rhythm", "Asymmetry"],
      creativeInsight: "A masterclass in balancing rigid structural alignment with bold visual contrast. By blending mathematical Bauhaus spacing rules with stark, high-contrast color blocks, this style transforms standard portfolio grids into premium, editorial-grade layouts.",
      whyItWorks: "The combination of strict geometric order and unexpected color pops creates dynamic tension. It satisfies the eye's need for structure while highlighting key focal points, making cards instantly engaging without feeling cluttered.",
      sequentialBlueprint: [
        "Establish the Grid: Map out a strict, multi-column CSS or design grid with mathematically consistent spacing.",
        "Define the Palette: Choose a minimal base (black/white) and pair it with one or two high-contrast block colors for focal cards.",
        "Position Key Assets: Place high-resolution, cropped image overlays asymmetrically to the text block.",
        "Apply the Bauhaus Rules: Refine the layout by removing unnecessary decorative elements and maximizing white space."
      ],
      howToAdapt: [
        "Implement a strict mathematical grid system (like 4px, 8px, or 16px increments) for consistent outer margins and inner gutters.",
        "Use high-contrast color blocking—such as stark black, cream, and a single vibrant primary accent color—to separate different portfolio categories.",
        "Integrate asymmetrical text placement within cards, leaving deliberate negative space to mimic high-end print editorial designs.",
        "Use ultra-thin, sharp 1px grid borders to enclose content and frame image overlays."
      ]
    };
  }

  if (guessedPlatform === "YOUTUBE" || normalizedNotes.includes("video") || normalizedNotes.includes("hook")) {
    return {
      title: generatedTitle,
      platform: "YOUTUBE",
      tags: ["Retention", "Hook", "Cinematic", "Storytelling"],
      creativeInsight: "This framework centers around immediate narrative disruption, followed by an elegant build-up of suspense. Rather than introducing the product, the hook focuses on a specific frustration or curious visual pattern, creating a dramatic loop that demands resolution.",
      whyItWorks: "By utilizing high-contrast visual cues and syncopated bass swells, the editor creates a sensory anchor that keeps viewers from swiping away in the first crucial three seconds.",
      sequentialBlueprint: [
        "Create Immediate Contrast: Open with an ultra-short, unexpected visual state or extreme close-up.",
        "Build the Problem: Articulate a core creative struggle within 4 seconds using text overlays.",
        "Anchor with Bass: Sync visual cuts directly with a rhythmic bass drop or audio swell.",
        "Introduce the Solution Loop: Pivot smoothly to the core demonstration while leaving the final outcome unresolved."
      ],
      howToAdapt: [
        "Draft the hook script focusing entirely on the viewer's immediate reaction rather than the brand's features.",
        "Design standard text templates with high-impact sans-serif fonts in heavy weights (e.g. bold caps with yellow highlights).",
        "Introduce visual cuts every 1.5 to 2.5 seconds to maintain high optical stimulation in short-form content.",
        "End the teaser precisely before the reveal to drive click-throughs and higher retention rates."
      ]
    };
  }

  if (guessedPlatform === "INSTAGRAM" || normalizedNotes.includes("transition") || normalizedNotes.includes("reel")) {
    return {
      title: generatedTitle,
      platform: "INSTAGRAM",
      tags: ["Short-form", "Swipe", "Visual Flow", "Engagement"],
      creativeInsight: "A seamless, continuous-motion transition guide that makes short-form video feel hyper-premium. It uses physical camera pans and tracking matching directions to blend two separate scenes into a unified visual experience.",
      whyItWorks: "The continuous movement tricks the brain into seeing a single action, avoiding the sudden visual jar of standard hard cuts and holding viewer attention longer.",
      sequentialBlueprint: [
        "Map the Motion Vectors: Define matching enter and exit camera directions for both clips (e.g., left-to-right).",
        "Capture with High Framerate: Shoot the transition moment at 60fps or higher to allow smooth velocity ramping.",
        "Apply Speed Ramping: Accelerate the frames right around the cut, creating a seamless blur effect.",
        "Sound Bridge Setup: Overlay a swift whoosh sound effect exactly at the transition point to mask the edit."
      ],
      howToAdapt: [
        "Plan your clips with directional storyboard sketches to align transition vectors before shooting.",
        "Use custom speed curves (easy-in, easy-out) in your editing software to fine-tune motion velocity.",
        "Keep the focal point in the identical quadrant of the frame across both shots for visual continuity.",
        "Leverage background elements (like matching wall colors or lighting setups) to make transitions even more deceptive."
      ]
    };
  }

  // Default elegant fallback for website and general things
  return {
    title: generatedTitle,
    platform: guessedPlatform,
    tags: ["Visual Design", "Layout", "Aesthetic", "Inspiration"],
    creativeInsight: `An exceptional showcase of premium ${guessedPlatform.toLowerCase()} styling, utilizing generous negative space, strict typography, and clean borders. It values restraint over decoration, producing a highly polished and intuitive layout.`,
    whyItWorks: "The clean structure minimizes cognitive load, letting the primary asset or message shine. Elegant subtle grid lines and rich dark colors anchor the components, conveying premium tech brand quality.",
    sequentialBlueprint: [
      "Establish Core Layout Constraints: Define standard grid spacing and off-black card background panels.",
      "Inject Subtle Accents: Apply micro-borders of dark graphite and occasional neon gradients for interactive states.",
      "Apply Typography Rules: Couple massive, wide-tracking display headers with tiny monospaced status indicators.",
      "Polishing Interactions: Introduce soft glows and custom spring transitions on hover and tap gestures."
    ],
    howToAdapt: [
      "Utilize dark theme variables centering on #09090B and clean card containers styled with #111217.",
      "Refrain from adding noisy visual indicators or telemetry clutter in margins. Prioritize high breathing room.",
      "Implement thin, 1px borders of #23242B to cleanly segregate content modules.",
      "Style active badges using subtle translucent background pills with sharp text to retain a minimal aesthetic."
    ]
  };
}
