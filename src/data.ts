import { Inspiration, Board } from "./types";

export const INITIAL_BOARDS: Board[] = [
  { id: "all", name: "★ All" },
  { id: "random-ideas", name: "💡 Random Ideas" },
  { id: "youtube", name: "📹 youtube" },
  { id: "instagram", name: "📸 Instagram" },
  { id: "pinterest", name: "📌 Pinterest" },
];

export const INITIAL_INSPIRATIONS: Inspiration[] = [
  {
    id: "insp-1",
    title: "hey i want this",
    url: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    notes: "“hey i want this”",
    tags: ["Raw Inspiration", "Direct Cut"],
    platform: "YOUTUBE",
    board: "📹 youtube",
    createdAt: "Jul 19, 2026",
    isFavorite: false,
    imageUrl: "https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg",
    aiStatus: "failed",
    aiAnalysis: null
  },
  {
    id: "insp-2",
    title: "Dynamic Swipe Transitions for Reels",
    url: "https://instagram.com/reel/C838v94Jd0s",
    notes: "“Using quick, matching frame focal movements. It keeps the viewer engaged during structural cuts, making simple concepts feel...”",
    tags: ["Retention", "Speed Ramp", "Motion Flow"],
    platform: "INSTAGRAM",
    board: "📸 Instagram",
    createdAt: "Jul 19, 2026",
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "A masterclass in rapid focal alignment and directional flow. By accelerating camera whips at the transition edge and keeping subjects framed in the exact visual quadrant, this style provides flawless visual continuation.",
      whyItWorks: "Continuous motion vectors trick the user's perception of cutting points, removing physical boundaries. It completely eliminates visual friction, inducing a hypnotic scrolling loop.",
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
    }
  },
  {
    id: "insp-3",
    title: "Minimalist Grid Layout & Photo Grid",
    url: "https://pinterest.com/pin/28491028302",
    notes: "“Brilliant combination of Bauhaus spacing rules and high-contrast color blocks. Ideal reference for styling a premium portfolio card grid.”",
    tags: ["Bauhaus", "Grid System", "Visual Rhythm", "Asymmetry"],
    platform: "PINTEREST",
    board: "📌 Pinterest",
    createdAt: "Jul 19, 2026",
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "A masterclass in balancing rigid structural alignment with bold visual contrast. By blending mathematical Bauhaus spacing rules with stark, high-contrast color blocks, this style transforms standard portfolio grids into premium, editorial-grade layouts.",
      whyItWorks: "The combination of strict geometric order and unexpected color pops creates dynamic tension. It satisfies the eye's need for structure while highlighting key focal points, making portfolio cards instantly engaging without feeling cluttered.",
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
    }
  },
  {
    id: "insp-4",
    title: "Linear App Dashboard Design Patterns",
    url: "https://linear.app/features/issue-tracking",
    notes: "“The dark mode mesh grid background adds incredible depth without cluttering the UI. Floating card elements with glowing border...”",
    tags: ["Depth Layering", "Sleek UI", "Subtle Glow", "Mesh Grid"],
    platform: "WEBSITE",
    board: "💡 Random Ideas",
    createdAt: "Jul 19, 2026",
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "A masterclass in depth-layering through mesh overlays, micro-borders, and high-frequency grids. It uses a very dark space combined with glowing vector details to establish immediate technical premium quality.",
      whyItWorks: "Thin borders and grid-aligned components mirror physical engineering blueprints, eliciting feelings of precision, structure, and immense craftsmanship.",
      sequentialBlueprint: [
        "Establish background base (#09090B) and thin grid pattern layout.",
        "Add #111217 solid floating card containers with 1px border (#23242B).",
        "Introduce soft radial blue/purple glows behind primary cards to imply depth.",
        "Couple light caps headers with tiny monospaced typography indicators."
      ],
      howToAdapt: [
        "Style using high contrast off-black (#09090B, #111217) and steel grey borders (#23242B).",
        "Keep active badge glows very subtle: 1px blur with a soft radial shadow.",
        "Use 12px or 14px tracking for uppercase displays to feel premium.",
        "Add subtle linear animation on focus or hover transitions."
      ]
    }
  },
  {
    id: "insp-5",
    title: "Retention-Hook Video Blueprint",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    notes: "“Teaser loop with immediate visual pattern interrupt to spike retentiveness on shorts”",
    tags: ["Retention", "Hook", "Cinematic"],
    platform: "YOUTUBE",
    board: "📹 youtube",
    createdAt: "Jul 18, 2026",
    isFavorite: true,
    imageUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "This framework centers around immediate narrative disruption, followed by an elegant build-up of suspense. Rather than introducing the product, the hook focuses on a specific frustration or curious visual pattern.",
      whyItWorks: "By utilizing high-contrast visual cues and syncopated bass swells, the editor creates a sensory anchor that keeps viewers from swiping away in the first crucial three seconds.",
      sequentialBlueprint: [
        "Create Immediate Contrast: Open with an ultra-short, unexpected visual state.",
        "Build the Problem: Articulate a core creative struggle within 4 seconds.",
        "Anchor with Bass: Sync visual cuts directly with a rhythmic bass drop.",
        "Introduce the Solution Loop: Pivot smoothly while leaving the outcome unresolved."
      ],
      howToAdapt: [
        "Draft the hook script focusing entirely on immediate audience reaction.",
        "Design standard text templates with high-impact sans-serif fonts in heavy weights.",
        "Introduce visual cuts every 1.5 to 2.5 seconds to maintain high optical stimulation.",
        "End the teaser precisely before the reveal to drive click-throughs."
      ]
    }
  },
  {
    id: "insp-6",
    title: "Arc Browser Visual Tab System",
    url: "https://arc.net",
    notes: "“Using sidebar vertical grids with subtle active border lighting for tabs”",
    tags: ["UI Layout", "Sidebar", "Dynamic Borders"],
    platform: "WEBSITE",
    board: "💡 Random Ideas",
    createdAt: "Jul 17, 2026",
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "Utilizes vertical-oriented, floating side navigation panes that dock and undock dynamically. Tab items feature active glow rings and background translucence.",
      whyItWorks: "Maximizes horizontal screen space for modern 16:9 displays, while grouping related utilities into context-aware tabs that feel integrated with the browser engine.",
      sequentialBlueprint: [
        "Setup left sidebar layout using flex rows and custom scroll gates.",
        "Apply variable width triggers based on screen drag actions.",
        "Render active tabs using a soft translucent background and glowing vertical line.",
        "Optimize click navigation using fast memory states to avoid layout jumps."
      ],
      howToAdapt: [
        "Adopt vertical nav menus for apps with high widescreen usage.",
        "Use 1px clean vertical dividers of #23242B.",
        "Implement spring physics on tab changes using motion tools.",
        "Render a tiny badge showing shortcut hints for keyboard power-users."
      ]
    }
  },
  {
    id: "insp-7",
    title: "Premium Dark Interface Layout",
    url: "https://vercel.com",
    notes: "“Linear-inspired off-black grid card elements with neon accents”",
    tags: ["Off-black", "Minimalism", "Vercel Style"],
    platform: "WEBSITE",
    board: "💡 Random Ideas",
    createdAt: "Jul 16, 2026",
    isFavorite: true,
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "A perfect application of minimal luxury interfaces. Focuses on extremely large display typography, tiny subtexts, and razor-sharp 1px dark grey grid lines.",
      whyItWorks: "The heavy negative space mimics luxury art galleries, raising the perceived value of the product and directing all focus to core features.",
      sequentialBlueprint: [
        "Define layout with 1px absolute coordinates.",
        "Embed subtle radial background grid via CSS linear gradients.",
        "Style buttons with flat dark tones and tiny crisp white text.",
        "Fade cards in using staggered delays during entrance transitions."
      ],
      howToAdapt: [
        "Never use saturated solid blacks; utilize elegant #09090B instead.",
        "Use thin font weights for body text and thick, uppercase styles for headings.",
        "Restrict borders to 1px thickness and use #23242B color values.",
        "Include plenty of open negative space to elevate breathing room."
      ]
    }
  },
  {
    id: "insp-8",
    title: "B-Roll Framing & Cinematic Angle",
    url: "https://instagram.com/reel/cinematic",
    notes: "“Asymmetrical rule of thirds framing using warm retro grading filters”",
    tags: ["Rule of Thirds", "Cinematography", "Retro Grading"],
    platform: "INSTAGRAM",
    board: "📸 Instagram",
    createdAt: "Jul 15, 2026",
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "Centers around beautiful cinematic portrait captures with warm amber grading. Subjects are positioned asymmetrical to the text overlay.",
      whyItWorks: "The off-center subject alignment creates a natural visual path for the eyes to scan the copy first, then transition to the motion asset.",
      sequentialBlueprint: [
        "Place the primary subject exactly on the left vertical third coordinate.",
        "Position typography text blocks on the right two-thirds area.",
        "Grade with retro, warm film LUT presets emphasizing rich ambers.",
        "Apply slow 1.1x scaling keyframes to simulate a physical camera crawl."
      ],
      howToAdapt: [
        "Compose shots with deliberate negative space in one half of the frame.",
        "Rely on natural directional lighting to add texture and depth shadows.",
        "Add an ultra-thin grain filter at 3% opacity for vintage texture.",
        "Keep text lines very short—no more than 3 words per line—to preserve clean composition."
      ]
    }
  },
  {
    id: "insp-9",
    title: "Interactive Bento Grid Layout",
    url: "https://apple.com/ios",
    notes: "“Bento layout for dashboard summary charts with spring hover scale animations”",
    tags: ["Bento Layout", "Spring Animation", "Apple Style"],
    platform: "WEBSITE",
    board: "💡 Random Ideas",
    createdAt: "Jul 14, 2026",
    isFavorite: true,
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop",
    aiStatus: "ready",
    aiAnalysis: {
      creativeInsight: "Arranges statistical visualizations, icons, and status values into varying sizes of rounded blocks, creating a grid reminiscent of bento boxes.",
      whyItWorks: "The blocky visual variation organizes complex, unrelated metrics into clean, bite-sized visual units that feel incredibly easy to consume.",
      sequentialBlueprint: [
        "Map out a CSS grid layout using multi-span grid columns.",
        "Define distinct dark background values (#111217) for the bento items.",
        "Inject micro-charts or key metrics inside each card container.",
        "Add subtle 1.02x scale transitions on hover states."
      ],
      howToAdapt: [
        "Vary bento box columns between span-1, span-2, and full-span configurations.",
        "Apply a smooth rounded-2xl border radius to all grid items.",
        "Use a consistent spacing gap of 16px or 24px between boxes.",
        "Highlight the most crucial card with a subtle purple or blue border."
      ]
    }
  }
];
