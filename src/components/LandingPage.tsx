import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Lock, Play, ArrowRight, Sparkles, Chrome, Mic, Search, Layers, Compass, HelpCircle, 
  ChevronDown, ChevronUp, Star, Check, Link, Pencil, Folder, CheckCircle2
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

interface FloatingCardProps {
  platform: string;
  stats: string;
  notes: string;
  className: string;
  yRange: number[];
  duration: number;
}

const PLATFORMS = [
  {
    name: "YouTube",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    name: "Instagram",
    icon: (
      <svg className="h-6 w-auto stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    )
  },
  {
    name: "Pinterest",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.02 0 1.513.769 1.513 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z"/>
      </svg>
    )
  },
  {
    name: "X (Twitter)",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  {
    name: "Reddit",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-4.566 3.868a.342.342 0 0 0-.087.48c.53.743 1.341 1.152 2.222 1.152.88 0 1.692-.409 2.223-1.153a.343.343 0 0 0-.555-.396c-.4.561-1.018.868-1.668.868-.65 0-1.269-.307-1.668-.868a.342.342 0 0 0-.467-.083z"/>
      </svg>
    )
  },
  {
    name: "LinkedIn",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    )
  },
  {
    name: "TikTok",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.33 1.54-1.32 2.54.01 1.08.61 2.08 1.56 2.6.9.48 2.03.48 2.95.02.97-.49 1.62-1.5 1.61-2.58.01-5.52-.01-11.04.01-16.56z"/>
      </svg>
    )
  },
  {
    name: "GitHub",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    )
  },
  {
    name: "Medium",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
      </svg>
    )
  },
  {
    name: "Notion",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.876c-.42-.326-.981-.7-2.055-.606L3.339 2.296c-.42.047-.56.28-.373.466zM2.5 7.241v14.415c0 .7.42.98 1.027.933l15.127-.886c.653-.047.887-.513.887-1.026V6.308c0-.513-.233-.793-.746-.746L3.387 6.448c-.513.047-.887.28-.887.793zm14.194.886c.047.373 0 .746-.373.793l-.793.14v10.598c.466.233.933.233 1.353.093.373-.14.373-.42.373-.746V8.127c0-.28-.14-.42-.56-.373zm-4.342 1.307c0-.233-.14-.373-.373-.326l-3.315.28c-.28 0-.373.187-.373.42l.093.513c.093.28.326.326.653.28l1.307-.14v8.03l-4.155-8.918c-.233-.513-.56-.746-1.12-.7l-2.008.14c-.28 0-.373.14-.373.373v10.551c0 .28.14.42.56.373l1.167-.093c.28 0 .373-.14.373-.373v-7.844l4.248 8.965c.233.466.607.653 1.074.607l2.288-.14c.28 0 .42-.14.42-.42V9.434z"/>
      </svg>
    )
  },
  {
    name: "Dribbble",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm9.83 11.13c-.22-.05-2.83-.62-5.74-.27-.08-.18-.16-.36-.24-.54-1.25-2.73-2.83-5.06-2.99-5.31 3.58 1.13 6.36 3.82 8.97 6.12zM11.38 3.82c.2.3.1.2 3.01 5.39-2.91.88-6.62 1.19-10.42 1.12-.01-.06-.01-.12-.02-.18C4.54 6.39 7.6 3.96 11.38 3.82zM3.1 12.01c0-.12.01-.25.01-.37 3.95.07 7.84-.25 10.87-1.18.25.53.48 1.08.7 1.63-2.61.85-4.82 2.87-6.52 5.32-.08.12-.17.24-.25.37-2.88-1.39-4.81-3.33-4.81-5.77zm8.9 9.87c.07-.1.14-.2.21-.3 1.68-2.43 3.82-4.39 6.37-5.22.88 2.37 1.25 4.72 1.34 5.36-2.22 1.36-4.9 1.76-7.92.16zm9.21-1.85c-.09-.59-.44-2.84-1.27-5.11 2.76-.39 5.16.14 5.36.19-.24 1.83-1.63 4.01-4.09 4.92z"/>
      </svg>
    )
  },
  {
    name: "Behance",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-1.356 2.21-2.68 2.723-.88.337-1.874.408-2.822.259-1.23-.191-2.313-.821-3.076-1.803-.836-1.077-1.226-2.483-1.127-3.834.103-1.428.74-2.71 1.762-3.627.99-.893 2.302-1.328 3.633-1.226 1.341.103 2.583.74 3.42 1.782.723.896 1.11 2.062 1.036 3.208h-7.79c.026.89.378 1.681.996 2.226.634.562 1.488.75 2.298.546.732-.187 1.285-.71 1.545-1.426l2.805.172zm-3.013-4.526c-.459-.427-1.11-.607-1.725-.494-.657.123-1.206.568-1.439 1.196h4.591c-.241-.295-.802-.572-1.427-.702zM8.228 12.186c.928.32 1.634 1.026 1.894 1.956.241.86.082 1.783-.424 2.518-.53.771-1.378 1.246-2.299 1.314-1.235.089-2.482.026-3.722.026H0V6h4.088c1.107 0 2.215-.026 3.32.026.837.039 1.642.385 2.197 1.01.554.624.787 1.455.632 2.278-.135.719-.607 1.332-1.242 1.687l-.767.185zm-4.551-4.102v2.859h2.32c.601 0 1.229.043 1.748-.282.4-.249.605-.72.548-1.182-.058-.461-.38-.842-.821-.98-.44-.138-.908-.106-1.365-.106l-2.43.023zm0 4.939v3.314h2.515c.66 0 1.353.048 1.921-.31.464-.294.708-.85.639-1.391-.069-.539-.444-.984-.961-1.144-.515-.159-1.062-.122-1.597-.122H3.677z"/>
      </svg>
    )
  },
  {
    name: "Figma",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4zM4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4zm0-8c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4zm8-4h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0zm8 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z"/>
      </svg>
    )
  },
  {
    name: "Product Hunt",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M13.604 8.4h-3.406v3.6h3.406c.994 0 1.8-.806 1.8-1.8s-.806-1.8-1.8-1.8zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.604 14.4h-3.406V18H7.8V6h5.804c2.32 0 4.2 1.88 4.2 4.2s-1.88 4.2-4.2 4.2z"/>
      </svg>
    )
  },
  {
    name: "RSS / Article",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20 5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56m0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
      </svg>
    )
  },
  {
    name: "Podcast",
    icon: (
      <svg className="h-6 w-auto stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="8" y1="22" x2="16" y2="22"/>
      </svg>
    )
  },
  {
    name: "Chrome",
    icon: (
      <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
        <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.991 5.991 0 0 1 12 6h10.233A12.001 12.001 0 0 0 12 0zm-8.831 5.626A11.954 11.954 0 0 0 0 12c0 5.98 4.381 10.936 10.152 11.848l3.954-6.849A5.998 5.998 0 0 1 6 12c0-1.611.636-3.074 1.678-4.159zM12 18a5.992 5.992 0 0 1-5.196-3H2.85A11.987 11.987 0 0 0 12 24c6.627 0 12-5.373 12-12 0-.693-.059-1.371-.17-2.031H13.626A5.98 5.98 0 0 1 12 18z"/>
        <circle cx="12" cy="12" r="3.5"/>
      </svg>
    )
  }
];

function FloatingCard({ platform, stats, notes, className, yRange, duration }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: [0.18, 0.28, 0.18],
        y: yRange 
      }}
      transition={{
        opacity: { duration: duration + 1, repeat: Infinity, ease: "easeInOut" },
        y: { duration: duration, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`hidden lg:block absolute bg-[#111217]/40 border border-[#23242B]/75 p-5 rounded-2xl shadow-xl w-[260px] text-left select-none pointer-events-none filter blur-[0.4px] hover:blur-none hover:opacity-95 transition-all duration-300 backdrop-blur-md z-0 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono font-bold tracking-wider text-brand-muted uppercase bg-[#09090B]/60 px-2 py-0.5 rounded-full border border-[#23242B]/50">
          {platform}
        </span>
        <span className="text-[9px] font-mono text-brand-muted/70">{stats}</span>
      </div>
      <p className="text-[10px] text-[#A1A1AA]/90 font-sans leading-relaxed">
        {notes}
      </p>
    </motion.div>
  );
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does IdeaVault differ from standard bookmarking tools?",
      a: "Standard bookmarking only saves URLs. Months later, you forget why you saved them. IdeaVault saves the link together with your notes and voice thoughts, keeping your inspiration context clear whenever you're ready to create."
    },
    {
      q: "Can I record raw thoughts directly as voice memos?",
      a: "Yes. IdeaVault lets you record voice notes directly as you save ideas. Your audio is automatically transcribed so you can easily review your thoughts later."
    },
    {
      q: "Does the Chrome Extension sync in real-time?",
      a: "Yes. The browser extension lets you save inspiration from YouTube, Instagram, Pinterest, X, or any article with a single click. Everything syncs instantly to your workspace."
    },
    {
      q: "What kind of content can I save?",
      a: "You can save links from YouTube, Instagram, Pinterest, X, articles, websites, and custom voice notes. Everything is stored cleanly with preview thumbnails and your notes."
    }
  ];

  return (
    <div id="landing-container" className="min-h-screen bg-brand-bg text-white grid-bg relative overflow-x-hidden selection:bg-brand-primary/30">
      {/* Decorative ambient glows from the theme layout */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#4F8CFF15] to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30vh] right-1/4 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-[#23242B] bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-xl text-white">IdeaVault</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-widest uppercase text-brand-muted">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a 
              href="#extension" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('extension')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#4F8CFF] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Chrome className="w-3.5 h-3.5 text-[#4F8CFF]" /> Extension
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-6">
            <button 
              onClick={onLogin}
              className="text-[11px] font-bold tracking-widest uppercase text-brand-muted hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onStart}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white text-[11px] font-bold tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-20 sm:pt-28 pb-12 sm:pb-16 overflow-hidden flex flex-col justify-center items-center text-center z-10 w-full">
        {/* Radial subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#8B5CF6]/4 to-[#4F8CFF]/4 blur-[160px] rounded-full pointer-events-none z-0" />

        {/* Floating Reference Cards */}
        <FloatingCard 
          platform="Instagram Reel"
          stats="1.1M views - viral hook"
          notes="Pattern interrupt: opens with the exact objection viewers already have, then flips on beat 2."
          className="left-[4%] top-[12%]"
          yRange={[0, -12, 0]}
          duration={7}
        />
        <FloatingCard 
          platform="TikTok Video"
          stats="2.3M views - hook breakdown"
          notes="Stop scrolling if you've been using the wrong moisturizer... Frame-by-frame analyzed."
          className="right-[4%] top-[15%]"
          yRange={[0, -15, 0]}
          duration={8}
        />
        <FloatingCard 
          platform="LinkedIn Carousel"
          stats="12 slides - 4.2K reactions"
          notes="Slide 1 — 'Why I stopped chasing the algorithm'. Clean spacing and bold serif header."
          className="left-[6%] bottom-[24%]"
          yRange={[0, -10, 0]}
          duration={6.5}
        />
        <FloatingCard 
          platform="YouTube Intro"
          stats="Timestamp 0:14"
          notes="High-contrast text flash synced with custom swell audio effect."
          className="left-[1%] bottom-[6%] text-[9px]"
          yRange={[0, -8, 0]}
          duration={9}
        />
        <FloatingCard 
          platform="Pinterest Swipe"
          stats="Saved: Visuals"
          notes="Bauhaus typography style with giant letterforms contrasted by tiny monospace detail text."
          className="right-[6%] bottom-[26%]"
          yRange={[0, -14, 0]}
          duration={7.5}
        />
        <FloatingCard 
          platform="SaaS Landing Page"
          stats="Swipe: Stripe Billing"
          notes="Elegant interactive visual slider presenting immediate self-checkout value."
          className="right-[2%] bottom-[8%]"
          yRange={[0, -11, 0]}
          duration={8.5}
        />

        {/* Hero Core Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          
          {/* 1. Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[28px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[92px] font-normal leading-tight tracking-[-0.04em] uppercase max-w-7xl mx-auto mb-8 font-display select-none text-center"
          >
            <span className="inline-block text-white mr-2 sm:mr-4">NEVER FORGET</span>
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#4F8CFF] py-2">
              WHY YOU SAVED IT
            </span>
          </motion.h1>

          {/* 3. CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 max-w-md mx-auto w-full sm:w-auto"
          >
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white text-[11px] font-bold tracking-widest uppercase rounded-full shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:scale-105 active:scale-95 hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 font-semibold"
            >
              START FOR FREE <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-[#111217]/50 backdrop-blur-md border border-[#23242B] hover:border-white/20 text-white text-[11px] font-bold tracking-widest uppercase rounded-full hover:bg-[#1a1b24]/80 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group font-semibold"
            >
              <Play className="w-3.5 h-3.5 text-[#4F8CFF] group-hover:scale-110 transition-transform fill-[#4F8CFF]" /> WATCH DEMO
            </button>
          </motion.div>

          {/* 4. Creator Rating */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full border-2 border-[#09090B] object-cover" alt="creator" />
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full border-2 border-[#09090B] object-cover" alt="creator" />
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full border-2 border-[#09090B] object-cover" alt="creator" />
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full border-2 border-[#09090B] object-cover" alt="creator" />
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full border-2 border-[#09090B] object-cover" alt="creator" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex text-yellow-500 gap-0.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs text-brand-muted font-mono tracking-wide">4.9/5 from 1,200+ creators</span>
            </div>
          </motion.div>

          {/* 5. Generous Breathing Space & 6. Works with your favorite platforms Label */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-20 sm:mt-24 mb-7 text-center"
          >
            <p className="text-[10px] font-mono tracking-[0.25em] text-[#4F8CFF] font-bold uppercase flex items-center justify-center gap-1.5">
              <span className="text-[#8B5CF6] text-xs">◆</span> WORKS WITH YOUR FAVORITE PLATFORMS
            </p>
          </motion.div>

          {/* 7. Spacing (24-32px) & 8. Platform Logos Infinite Scrolling Marquee */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="w-full relative overflow-hidden group py-5 sm:py-6"
          >
            {/* Left Fade Gradient Mask */}
            <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#09090B] via-[#09090B]/85 to-transparent z-10 pointer-events-none" />

            {/* Right Fade Gradient Mask */}
            <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#09090B] via-[#09090B]/85 to-transparent z-10 pointer-events-none" />

            {/* Marquee Track with CSS Keyframes */}
            <div className="flex w-max items-center animate-marquee group-hover:[animation-play-state:paused] pointer-events-auto">
              {[...PLATFORMS, ...PLATFORMS].map((platform, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 px-7 sm:px-9 text-[#A1A1AA] opacity-60 hover:opacity-100 hover:text-white transition-all duration-300 cursor-pointer select-none shrink-0"
                >
                  <div className="h-6 w-auto flex items-center justify-center text-current">
                    {platform.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-sans font-medium tracking-tight whitespace-nowrap">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Dashboard Preview / Visual Workspace Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
            YOUR WORKSPACE
          </div>
          <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">A CLEAN HOME FOR YOUR IDEAS</h2>
          <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
            Beautifully cataloged visual cards containing preview images, source links, and your custom notes.
          </p>
        </div>

        {/* Mock UI Showcase */}
        <div 
          className="bg-[#111217] rounded-2xl border border-[#23242B] shadow-2xl p-6 relative group overflow-hidden max-w-5xl mx-auto h-[470px] flex flex-col justify-between"
          style={{ height: '470px' }}
        >
          {/* Top chrome style control buttons */}
          <div className="flex items-center justify-between border-b border-[#23242B] pb-4 mb-6">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="bg-[#09090B] px-4 py-1 rounded-full border border-[#23242B] text-[10px] font-mono text-brand-muted w-1/2 text-center">
              app.ideavault.io/vault/creative-inspiration
            </div>
            <div className="w-6" />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-display font-black text-white flex items-center gap-2 uppercase tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" /> Visual Inspiration Grid
              </h3>
              <p className="text-xs text-brand-muted font-medium">Showing your curated collections</p>
            </div>
            <button 
              onClick={onStart}
              className="text-xs font-mono bg-[#09090B] border border-[#23242B] hover:border-brand-primary/50 text-brand-primary px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              + Save Idea
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pinterest Card */}
            <div 
              className="bg-[#09090B]/60 p-4 rounded-xl border border-[#23242B] relative h-[250px] flex flex-col justify-between"
              style={{ height: '250px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-red-950 text-red-400 border border-red-900 uppercase">
                  📌 Pinterest
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                  Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">Minimalist Grid Layout & Photo...</h4>
              <p className="text-[10px] text-brand-muted mt-2 italic line-clamp-3 bg-brand-card/40 p-2 rounded border border-[#23242B]/40 font-mono">
                "Clean grid spacing with high-contrast color blocks and generous whitespace..."
              </p>
              <div className="flex items-center justify-between text-[8px] font-mono text-brand-muted mt-4 pt-2 border-t border-[#23242B]/40">
                <span>📁 Pinterest</span>
                <span>Jul 19, 2026</span>
              </div>
            </div>

            {/* Instagram Card */}
            <div className="bg-[#09090B]/60 p-4 rounded-xl border border-[#23242B] relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900 uppercase">
                  📸 Instagram
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                  Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">Dynamic Swipe Transitions for Reels</h4>
              <p className="text-[10px] text-brand-muted mt-2 italic line-clamp-3 bg-brand-card/40 p-2 rounded border border-[#23242B]/40 font-mono">
                "Quick frame transitions keeping the subject centered for seamless loops..."
              </p>
              <div className="flex items-center justify-between text-[8px] font-mono text-brand-muted mt-4 pt-2 border-t border-[#23242B]/40">
                <span>📁 Instagram</span>
                <span>Jul 19, 2026</span>
              </div>
            </div>

            {/* Website Card */}
            <div className="bg-[#09090B]/60 p-4 rounded-xl border border-[#23242B] relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-teal-950 text-teal-400 border border-teal-900 uppercase">
                  🌐 Website
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                  Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">Linear App Dashboard Design...</h4>
              <p className="text-[10px] text-brand-muted mt-2 italic line-clamp-3 bg-brand-card/40 p-2 rounded border border-[#23242B]/40 font-mono">
                "Dark theme canvas with clean typography and subtle borders..."
              </p>
              <div className="flex items-center justify-between text-[8px] font-mono text-brand-muted mt-4 pt-2 border-t border-[#23242B]/40">
                <span>📁 Random Ideas</span>
                <span>Jul 19, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
            Core Capabilities
          </div>
          <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">EVERY IDEA, ORGANIZED AND READY</h2>
          <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
            Designed for creators, designers, and writers who want a fast, distraction-free space for inspiration.
          </p>
        </div>

        {/* 3x2 bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-primary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#4F8CFF] mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Save Inspiration</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Instantly capture YouTube videos, Pinterest images, Instagram reels, and website ideas in one click.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-primary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#4F8CFF] mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Organize into Collections</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Group references into custom visual boards tailored to your projects, channels, or design themes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-primary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#4F8CFF] mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Instant Unified Search</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Find ideas instantly by title, platform, notes, or tags whenever inspiration strikes.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-secondary/40 transition-all duration-300 group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Auto-Organization</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Smartly categorizes and indexes your saved ideas based on source details and tags.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-secondary/40 transition-all duration-300 group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
              <Chrome className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Chrome Extension</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Save inspiration directly from your browser as you browse the web without leaving your flow.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-secondary/40 transition-all duration-300 group relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Voice Notes</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Record quick voice notes when saving an idea to log exactly why you found it inspiring.
            </p>
          </div>
        </div>
      </section>

      {/* Chrome Extension Spotlight Section */}
      <section id="extension" className="bg-gradient-to-b from-[#09090B] via-[#111217]/50 to-[#09090B] border-t border-b border-[#23242B] py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* SECTION TITLE */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[10px] font-bold tracking-[0.2em] mb-4 uppercase">
              ⚡ CHROME EXTENSION
            </div>
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white mb-4">
              Capture Inspiration From Anywhere
            </h2>
            <p className="text-brand-muted text-sm sm:text-base font-sans font-medium leading-relaxed">
              The IdeaVault Chrome Extension lets you save ideas directly from your browser without interrupting your workflow. Whether you're watching YouTube, scrolling Instagram, browsing Pinterest, reading blogs, or exploring X, you can capture the idea instantly with one click.
            </p>
          </div>

          {/* LEFT SIDE (Browser + Extension Popup UI) & RIGHT SIDE (Vertical Flow) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* LEFT SIDE: Realistic Chrome Browser with Popup Open */}
            <div className="lg:col-span-6 relative">
              <div className="bg-[#111217] border border-[#23242B] rounded-2xl shadow-2xl overflow-hidden group">
                {/* Chrome Toolbar / Address Bar */}
                <div className="bg-[#181920] border-b border-[#23242B] px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                  </div>
                  {/* Address Bar */}
                  <div className="flex-1 bg-[#09090B] border border-[#23242B] rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA] font-mono truncate">
                      <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">https://instagram.com/reel/C3x9K2pM...</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">100%</span>
                  </div>
                  {/* Extension Icon in Browser Bar */}
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#4F8CFF]/20 ring-2 ring-[#4F8CFF]/50">
                    <Chrome className="w-4 h-4" />
                  </div>
                </div>

                {/* Browser Content Area showing website background with popup layered over it */}
                <div className="p-4 sm:p-6 bg-[#09090B] relative min-h-[460px] flex items-center justify-center">
                  {/* Subtle underlying background webpage preview */}
                  <div className="absolute inset-4 rounded-xl border border-[#23242B]/50 bg-[#111217]/40 backdrop-blur-sm p-4 filter blur-[1px] opacity-30 pointer-events-none select-none flex flex-col justify-between">
                    <div className="h-32 bg-[#23242B]/40 rounded-lg w-full mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 bg-[#23242B]/60 rounded w-3/4" />
                      <div className="h-3 bg-[#23242B]/40 rounded w-1/2" />
                    </div>
                  </div>

                  {/* IdeaVault Extension Popup Window Mockup */}
                  <div className="relative z-10 w-full max-w-[340px] bg-[#111217] border border-[#23242B] rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between border-b border-[#23242B] pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-xs">
                          💡
                        </div>
                        <span className="font-bold text-xs text-white">Save Inspiration</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-[#181920] border border-[#23242B] px-2 py-0.5 rounded-full text-[#A1A1AA]">
                          creator@ideavault.io
                        </span>
                      </div>
                    </div>

                    {/* Website Thumbnail & Platform Badge */}
                    <div className="flex gap-2.5 bg-[#09090B] border border-[#23242B] p-2 rounded-xl items-center">
                      <img 
                        referrerPolicy="no-referrer"
                        src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=120&q=80" 
                        alt="thumbnail" 
                        className="w-12 h-12 object-cover rounded-lg border border-[#23242B] bg-black shrink-0"
                      />
                      <div className="flex-1 overflow-hidden text-left">
                        <span className="inline-flex items-center gap-1 bg-[#E1306C]/10 border border-[#E1306C]/20 text-[#E1306C] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          📸 INSTAGRAM
                        </span>
                        <p className="text-[10px] text-[#A1A1AA] truncate mt-0.5 font-mono">
                          https://instagram.com/reel...
                        </p>
                      </div>
                    </div>

                    {/* Title Input */}
                    <div className="text-left">
                      <label className="text-[9px] font-bold text-[#A1A1AA] block mb-1 tracking-wider uppercase">TITLE</label>
                      <div className="bg-[#09090B] border border-[#23242B] rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold truncate">
                        Cinematic Storytelling Transitions
                      </div>
                    </div>

                    {/* Description Input */}
                    <div className="text-left">
                      <label className="text-[9px] font-bold text-[#A1A1AA] block mb-1 tracking-wider uppercase">DESCRIPTION</label>
                      <div className="bg-[#09090B] border border-[#23242B] rounded-lg p-2 text-[11px] text-[#A1A1AA] leading-relaxed min-h-[50px]">
                        I love how the creator builds suspense before every reveal. The camera movement and smooth transitions would work perfectly for my next travel reel.
                      </div>
                      {/* Voice Note Button Directly Below Textarea */}
                      <button className="mt-1.5 w-full py-1.5 bg-[#181920] border border-[#23242B] text-[#A1A1AA] hover:text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                        <Mic className="w-3 h-3 text-[#8B5CF6]" /> Record Voice
                      </button>
                    </div>

                    {/* Collection Selector */}
                    <div className="text-left">
                      <label className="text-[9px] font-bold text-[#A1A1AA] block mb-1 tracking-wider uppercase">COLLECTION</label>
                      <div className="bg-[#09090B] border border-[#23242B] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium flex items-center justify-between">
                        <span>📸 Instagram Storytelling Ideas</span>
                        <ChevronDown className="w-3 h-3 text-[#A1A1AA]" />
                      </div>
                    </div>

                    {/* Save Inspiration Button */}
                    <button className="w-full py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#4F8CFF]/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 mt-1">
                      <Sparkles className="w-3.5 h-3.5" /> Save Inspiration
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Vertical Flow Explaining How Extension Works */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              <div className="mb-2">
                <h3 className="text-xl font-bold text-white tracking-tight mb-1">How It Works</h3>
                <p className="text-xs text-brand-muted font-sans font-medium">Capture any idea in less than 10 seconds.</p>
              </div>

              {[
                {
                  step: "①",
                  icon: Compass,
                  title: "Find Inspiration",
                  desc: "Discover ideas while scrolling Instagram, YouTube, Pinterest or any website."
                },
                {
                  step: "②",
                  icon: Chrome,
                  title: "Open IdeaVault",
                  desc: "Click the Chrome extension without leaving the page."
                },
                {
                  step: "③",
                  icon: Mic,
                  title: "Save Why It Inspired You",
                  desc: "Write a quick note or record your thoughts before you forget."
                },
                {
                  step: "④",
                  icon: Sparkles,
                  title: "Create Later",
                  desc: "Everything is organized inside your IdeaVault dashboard, ready whenever you need it."
                }
              ].map((item, index, arr) => {
                const Icon = item.icon;
                const isLast = index === arr.length - 1;
                return (
                  <div key={item.title} className="relative flex items-start gap-4 group">
                    {/* Vertical Connecting Line */}
                    {!isLast && (
                      <div className="absolute left-[21px] top-11 bottom-[-24px] w-[2px] bg-gradient-to-b from-[#4F8CFF]/40 via-[#23242B] to-[#23242B]" />
                    )}
                    {/* Icon Badge */}
                    <div className="w-11 h-11 rounded-xl bg-[#111217] border border-[#23242B] group-hover:border-[#4F8CFF]/60 group-hover:bg-[#181920] flex items-center justify-center text-[#4F8CFF] shrink-0 transition-all shadow-md z-10">
                      <Icon className="w-5 h-5" />
                    </div>
                    {/* Step Content */}
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#8B5CF6]">{item.step}</span>
                        <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                      </div>
                      <p className="text-xs text-brand-muted mt-1 leading-relaxed font-sans font-medium max-w-md">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* FEATURE HIGHLIGHTS: Four Small Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <div className="bg-[#111217] p-5 rounded-2xl border border-[#23242B] hover:border-[#4F8CFF]/40 transition-all text-left">
              <div className="w-9 h-9 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#4F8CFF] mb-3 text-sm font-bold">
                ⚡
              </div>
              <h4 className="text-sm font-bold text-white mb-1">One Click Save</h4>
              <p className="text-xs text-brand-muted leading-relaxed font-sans">
                Save inspiration without switching tabs.
              </p>
            </div>

            <div className="bg-[#111217] p-5 rounded-2xl border border-[#23242B] hover:border-[#8B5CF6]/40 transition-all text-left">
              <div className="w-9 h-9 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#8B5CF6] mb-3 text-sm font-bold">
                🎙
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Voice Notes</h4>
              <p className="text-xs text-brand-muted leading-relaxed font-sans">
                Record your thoughts instantly.
              </p>
            </div>

            <div className="bg-[#111217] p-5 rounded-2xl border border-[#23242B] hover:border-[#4F8CFF]/40 transition-all text-left">
              <div className="w-9 h-9 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#4F8CFF] mb-3 text-sm font-bold">
                🖼
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Auto Metadata</h4>
              <p className="text-xs text-brand-muted leading-relaxed font-sans">
                Automatically captures title, URL and thumbnail.
              </p>
            </div>

            <div className="bg-[#111217] p-5 rounded-2xl border border-[#23242B] hover:border-[#8B5CF6]/40 transition-all text-left">
              <div className="w-9 h-9 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#8B5CF6] mb-3 text-sm font-bold">
                ☁
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Instant Sync</h4>
              <p className="text-xs text-brand-muted leading-relaxed font-sans">
                Everything syncs to your IdeaVault account.
              </p>
            </div>
          </div>

          {/* DOWNLOAD AREA: Centered CTA Card */}
          <div className="bg-gradient-to-r from-[#111217] via-[#181920] to-[#111217] border border-[#23242B] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#4F8CFF]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-2xl sm:text-3xl font-display font-normal uppercase tracking-tight text-white mb-3">
              Ready to Save Ideas Faster?
            </h3>
            <p className="text-brand-muted text-sm max-w-lg mx-auto font-sans leading-relaxed mb-8">
              Install the IdeaVault Chrome Extension and start capturing inspiration in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <a
                href="/ideavault-extension.zip"
                download="ideavault-extension.zip"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#4F8CFF]/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                ⬇ Download Chrome Extension
              </a>
              <a
                href="/ideavault-extension.zip"
                download="ideavault-extension.zip"
                className="text-xs text-[#4F8CFF] hover:text-white font-semibold font-mono underline underline-offset-4 cursor-pointer transition-colors"
              >
                Installation Guide
              </a>
            </div>

            <p className="text-[11px] text-zinc-500 font-mono">
              Chrome Web Store release coming soon.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#09090B] py-24 border-t border-[#23242B] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono tracking-[0.2em] text-[#4F8CFF] font-bold uppercase mb-3">
              HOW IT WORKS
            </p>
            <h2 
              className="font-display text-[67px] leading-[59px] tracking-tight text-white mb-4 max-w-2xl mx-auto uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '67px', lineHeight: '59px' }}
            >
              Capture an idea.<br />
              Never lose the reason behind it.
            </h2>
            <p className="text-brand-muted text-[15px] max-w-xl mx-auto font-sans leading-relaxed">
              Save inspiration from anywhere, organize it into collections, and come back whenever you're ready to create.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                num: "01",
                icon: Link,
                title: "Save",
                desc: "Paste a YouTube, Instagram, Pinterest, article, or website link."
              },
              {
                num: "02",
                icon: Pencil,
                title: "Add Context",
                desc: "Write why you saved it or record a quick voice note."
              },
              {
                num: "03",
                icon: Folder,
                title: "Organize",
                desc: "Everything is automatically sorted into the right collection."
              },
              {
                num: "04",
                icon: Search,
                title: "Find Later",
                desc: "Search, filter, and revisit ideas whenever inspiration strikes."
              }
            ].map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.num}
                  className="bg-[#111217] border border-[#23242B] rounded-2xl p-6 relative flex flex-col justify-between hover:-translate-y-[3px] hover:border-[#4F8CFF] hover:shadow-md hover:shadow-[#4F8CFF]/5 transition-all duration-200 group"
                >
                  <span className="absolute top-6 right-6 text-xs font-mono text-zinc-500">
                    {card.num}
                  </span>

                  <div>
                    <div className="w-9 h-9 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-zinc-400 mb-6">
                      <IconComponent className="w-4 h-4 text-zinc-300" />
                    </div>

                    <h3 className="text-white font-medium text-lg mb-2">
                      {card.title}
                    </h3>

                    <p className="text-brand-muted text-[15px] leading-relaxed font-sans">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Built for Creators Section */}
      <section className="bg-[#09090B] py-24 relative z-10 border-t border-[#23242B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
              DISCIPLINES
            </div>
            <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">BUILT FOR CREATORS</h2>
            <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
              See how different creators organize inspiration directly into their workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: "YouTube / TikTok", tagColor: "bg-blue-950 text-blue-400 border-blue-900",
                title: "Video Creators & Animators",
                desc: "Save video hooks, pacing references, and editing styles with time notes."
              },
              {
                tag: "Moodboards / Figma", tagColor: "bg-purple-950 text-purple-400 border-purple-900",
                title: "UI/UX & Visual Designers",
                desc: "Build curated visual swipe files of typography, color palettes, grids, and layouts."
              },
              {
                tag: "Copywriting / Strategy", tagColor: "bg-emerald-950 text-emerald-400 border-emerald-900",
                title: "Writers & Strategists",
                desc: "Collect landing page headlines, content hooks, and campaign outlines."
              }
            ].map((card, i) => (
              <div key={i} className="bg-[#111217] p-8 rounded-3xl border border-[#23242B] hover:border-[#4F8CFF]/40 transition-colors group cursor-pointer relative">
                <div className="absolute top-8 right-8 text-[#23242B] group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5 -rotate-45" />
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wider mb-8 ${card.tagColor}`}>
                  {card.tag}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{card.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed font-sans font-medium">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Buzz Section */}
      <section className="bg-[#09090B] py-24 border-t border-[#23242B] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#FACC15] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
              COMMUNITY BUZZ
            </div>
            <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">LOVED BY CREATORS</h2>
            <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
              How content creators, designers, and writers organize their inspiration daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "\"IdeaVault changed how I script my videos. I used to save links and forget them; now I always remember why an idea inspired me.\"",
                name: "Alex Rivers", role: "YouTube Creator • 420K Subs",
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              },
              {
                quote: "\"As a UI/UX designer, Pinterest and Instagram are my playgrounds, but saving was messy. IdeaVault keeps everything organized in one place.\"",
                name: "Sofia Chen", role: "Lead Product Designer",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
              },
              {
                quote: "\"Being able to save a link and record a quick voice note explaining my thoughts is incredible for project planning.\"",
                name: "Liam Becker", role: "Creative Director",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
              }
            ].map((t, i) => (
              <div key={i} className="bg-[#111217] p-8 rounded-3xl border border-[#23242B]">
                <div className="flex gap-1 mb-6 text-[#FACC15]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-sm text-brand-muted italic leading-relaxed mb-8 font-sans font-medium">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <img referrerPolicy="no-referrer" src={t.img} className="w-10 h-10 rounded-full grayscale" alt={t.name} />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-brand-muted font-mono uppercase tracking-wider mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-[#09090B] py-24 border-t border-[#23242B] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono tracking-[0.2em] text-[#4F8CFF] font-bold uppercase mb-3">
              PRICING
            </p>
            <h2 className="font-sans font-medium text-3xl md:text-5xl tracking-tight text-white leading-tight mb-4 max-w-2xl mx-auto">
              One simple plan.
            </h2>
            <p className="text-brand-muted text-[15px] max-w-xl mx-auto font-sans leading-relaxed">
              Everything you need to capture, organize, and revisit your best ideas.
            </p>
          </div>

          <div className="max-w-[520px] mx-auto bg-[#111217] p-8 md:p-10 rounded-[24px] border border-[#23242B] hover:border-[#4F8CFF] hover:shadow-md hover:shadow-[#4F8CFF]/5 transition-all duration-200 text-left">
            <h3 className="text-white font-medium text-2xl mb-2">Free</h3>
            
            <div className="mb-2">
              <span className="font-sans font-medium text-5xl text-white">₹0</span>
            </div>

            <p className="text-brand-muted text-[15px] font-sans mb-8">
              Perfect for creators getting started.
            </p>

            <ul className="space-y-3.5 mb-8 border-t border-[#23242B] pt-8">
              {[
                "Unlimited saved ideas",
                "Unlimited collections",
                "Save from YouTube, Instagram, Pinterest, X and websites",
                "Voice notes with transcription",
                "AI-generated title (when title is left empty)",
                "Search and organize your inspiration",
                "Chrome Extension (Coming Soon)",
                "Secure cloud sync"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-zinc-300 font-sans">
                  <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={onStart}
              className="w-full py-3.5 bg-white text-black font-medium text-sm rounded-xl hover:bg-zinc-200 active:scale-[0.99] transition-all cursor-pointer"
            >
              Start Free
            </button>

            <p className="text-center text-xs text-brand-muted/70 font-sans mt-3">
              No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24 relative z-10 border-t border-[#23242B]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </div>
          <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white text-center">FREQUENTLY ASKED QUESTIONS</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-[#111217] border border-[#23242B] rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 text-left flex items-center justify-between text-white font-sans text-sm font-semibold hover:bg-[#09090B]/40 transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#4F8CFF]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                )}
              </button>
              
              {activeFaq === idx && (
                <div className="px-6 pb-5 text-xs text-brand-muted font-sans leading-relaxed border-t border-[#23242B]/40 pt-4 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#111217] border-t border-[#23242B] py-32 relative z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#4F8CFF]/10 to-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-display font-normal text-4xl md:text-[110px] tracking-tight leading-[0.9] uppercase mb-8">
            TURN INSPIRATION INTO<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF]">YOUR NEXT PROJECT.</span>
          </h2>
          <p className="text-brand-muted text-base max-w-2xl mx-auto font-sans leading-relaxed mb-12 font-medium">
            Save ideas from anywhere, organize them into collections, and always remember why you saved them.
          </p>
          <button 
            onClick={onStart}
            className="px-10 py-5 bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] text-white font-bold rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer uppercase tracking-widest text-sm"
          >
            START SAVING IDEAS <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#09090B] border-t border-[#23242B] pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 border-b border-[#23242B] pb-16">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="font-display font-normal text-lg uppercase tracking-wider text-white">IdeaVault</span>
              </div>
              <p className="text-sm text-brand-muted font-sans font-medium leading-relaxed max-w-sm">
                Save ideas, voice notes, and links in one place so they're easy to find when you need them.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">How it Works</a></li>
                <li><a href="#pricing" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Pricing</a></li>
                <li><a href="#faq" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">FAQ</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Account</h4>
              <ul className="space-y-4">
                <li><button onClick={onLogin} className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium text-left cursor-pointer">Log In</button></li>
                <li><button onClick={onStart} className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium text-left cursor-pointer">Create Account</button></li>
                <li><button onClick={onStart} className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium text-left cursor-pointer">Dashboard</button></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#extension" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Chrome Extension</a></li>
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Roadmap</a></li>
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-mono text-brand-muted">
              © 2026 IdeaVault. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-brand-muted">
              <Check className="w-3 h-3 text-emerald-400" /> Built for creators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
