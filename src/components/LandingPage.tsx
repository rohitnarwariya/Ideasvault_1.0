import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Lock, Play, ArrowRight, Sparkles, Chrome, Mic, Search, Layers, Compass, HelpCircle, 
  ChevronDown, ChevronUp, Star, Check 
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
      a: "Standard bookmarking only saves URLs. Months later, you forget exactly what part of that video or page inspired you. IdeaVault saves the *context*. Our AI companion instantly processes the link, note, or voice memo to draft a structured blueprint explaining why it works, why you saved it, and how to adapt it."
    },
    {
      q: "Can I record raw thoughts directly as voice memos?",
      a: "Absolutely. IdeaVault has an integrated mobile-friendly voice dictate engine. You can speak freely about your inspiration on the go, and our system automatically transcribes it and distills key copywriting hooks, storytelling pacing, or layout rules from your monologue."
    },
    {
      q: "Does the Chrome Extension sync in real-time?",
      a: "Yes. The IdeaVault browser extension allows you to secure inspirations from YouTube, Instagram Reels, Pinterest, Reddit, or any article with a single click. It instantly syncs with your main dashboard, running background AI blueprints asynchronously so they are ready when you open the vault."
    },
    {
      q: "How does the Google Gemini AI integration analyze visual elements?",
      a: "By utilizing multimodal Gemini models, IdeaVault inspects reference images, source metadata, and user-provided notes to extract visual hierarchies, spacing rules (like Bauhaus grid styles), color palettes, and structural layouts."
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
            <a href="#extension" className="hover:text-white transition-colors">Extension</a>
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
      <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center pt-16 pb-40 px-6 text-center relative z-10 overflow-hidden max-w-7xl mx-auto">
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

        {/* Vertically Centered Main Content Wrapper */}
        <div className="flex-1 flex flex-col justify-center items-center z-10 py-10">
          
          {/* Headline */}
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

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-[700px] text-xs sm:text-sm md:text-base text-[#A1A1AA] leading-relaxed mb-10 font-sans font-medium text-center mx-auto"
          >
            Save YouTube videos, Instagram Reels, X posts, articles, and voice notes.
            IdeaVault uses AI to organize every inspiration so you always remember why you saved it.
          </motion.p>

          {/* Buttons */}
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

          {/* Social Proof */}
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

        </div>

        {/* Bottom Label */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full border-t border-[#23242B]/40 pt-10 z-10 absolute bottom-6 left-0 right-0 px-6"
        >
          <p className="text-[10px] font-mono tracking-[0.25em] text-[#4F8CFF] font-bold uppercase flex items-center justify-center gap-1.5 mb-2">
            <span className="text-[#8B5CF6] text-xs">◆</span> CAPTURE FROM ANYWHERE
          </p>
        </motion.div>
      </section>

      {/* Dashboard Preview / Immediate Visual Swipe Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
            Immediate Visual Swipe
          </div>
          <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">A CINEMATIC DIGITAL VAULT</h2>
          <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
            Beautifully cataloged visual cards containing real-time source metadata, custom edited context notes, and advanced AI blueprints.
          </p>
        </div>

        {/* Mock UI Showcase exactly as screens */}
        <div className="bg-[#111217] rounded-2xl border border-[#23242B] shadow-2xl p-6 relative group overflow-hidden max-w-5xl mx-auto">
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
              <p className="text-xs text-brand-muted font-medium">Showing live curated bookmarks with AI organization</p>
            </div>
            <button 
              onClick={onStart}
              className="text-xs font-mono bg-[#09090B] border border-[#23242B] hover:border-brand-primary/50 text-brand-primary px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              + Capture Link
            </button>
          </div>

          {/* Miniature responsive grid matching Screenshot 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pinterest Card from screenshots */}
            <div className="bg-[#09090B]/60 p-4 rounded-xl border border-[#23242B] relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-red-950 text-red-400 border border-red-900 uppercase">
                  📌 Pinterest
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-green-950 text-green-400 border border-green-900">
                  AI Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">Minimalist Grid Layout & Photo...</h4>
              <p className="text-[10px] text-brand-muted mt-2 italic line-clamp-3 bg-brand-card/40 p-2 rounded border border-[#23242B]/40 font-mono">
                "Brilliant combination of Bauhaus spacing rules and high-contrast color blocks..."
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
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-green-950 text-green-400 border border-green-900">
                  AI Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">Dynamic Swipe Transitions for Reels</h4>
              <p className="text-[10px] text-brand-muted mt-2 italic line-clamp-3 bg-brand-card/40 p-2 rounded border border-[#23242B]/40 font-mono">
                "Using quick, matching frame focal movements. It keeps the viewer engaged during structural cuts..."
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
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-green-950 text-green-400 border border-green-900">
                  AI Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">Linear App Dashboard Design...</h4>
              <p className="text-[10px] text-brand-muted mt-2 italic line-clamp-3 bg-brand-card/40 p-2 rounded border border-[#23242B]/40 font-mono">
                "The dark mode mesh grid background adds incredible depth without cluttering the UI..."
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
          <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">EVERY IDEA, SECURELY ANCHORED</h2>
          <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
            Engineered meticulously for creators, planners, and strategists who need zero friction and high retrievability.
          </p>
        </div>

        {/* 3x2 bento grid exactly styled like Screenshot 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-primary/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-[#4F8CFF] mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Save Inspiration</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Instantly capture YouTube videos, Pinterest images, Instagram reels, and website inspiration with a single click.
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
              Find references instantly by title, platform, notes, or tags. Never waste hours digging through bookmarks again.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-secondary/40 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#b5921c]/10 text-[#d4af37] text-[8px] font-mono tracking-widest px-2 py-0.5 rounded border border-[#b5921c]/30 uppercase font-semibold">
              AI BETA
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">AI Auto-Organization</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              AI intelligently tags, categorizes, and indexes your saved ideas based on the source metadata.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-secondary/40 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#b5921c]/10 text-[#d4af37] text-[8px] font-mono tracking-widest px-2 py-0.5 rounded border border-[#b5921c]/30 uppercase font-semibold">
              AI BETA
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
              <Chrome className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Chrome Extension</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Save inspiration directly from your browser as you browse the web without opening the dashboard.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#111217] p-6 rounded-2xl border border-[#23242B] hover:border-brand-secondary/40 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#b5921c]/10 text-[#d4af37] text-[8px] font-mono tracking-widest px-2 py-0.5 rounded border border-[#b5921c]/30 uppercase font-semibold">
              AI BETA
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#23242B] flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">Voice Memo Capture</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans font-medium">
              Dictate voice thoughts instantly while saving an idea to log exactly why you found it inspiring.
            </p>
          </div>
        </div>
      </section>

      {/* Chrome Extension Spotlight Section */}
      <section id="extension" className="bg-gradient-to-b from-[#09090B] via-[#111217]/20 to-[#09090B] border-t border-b border-[#23242B] py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-6 uppercase">
              <Chrome className="w-3.5 h-3.5" /> CHROME EXTENSION
            </div>
            <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white mb-6">
              SAVES ON THE FLY, NO TABS REQUIRED
            </h2>
            <p className="text-brand-muted text-sm font-sans font-medium leading-relaxed mb-8">
              Keep your creative focus unbroken. While browsing Pinterest, listening to podcasts on Spotify, or scrolling Instagram reels, click the IdeaVault chrome widget to secure the asset instantly.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Real-time Backend Sync</h4>
                  <p className="text-[11px] text-brand-muted font-medium">Leverages single Supabase synchronization immediately</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Multimodal File Support</h4>
                  <p className="text-[11px] text-brand-muted font-medium">Handles screenshot snippets and raw bookmark descriptions</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onStart}
              className="mt-10 px-6 py-3 bg-[#111217] border border-[#23242B] text-white font-bold rounded-xl hover:bg-[#1a1b22] active:scale-95 text-xs font-mono tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              INSTALL COMPANION EXTENSION <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#09090B] p-8 rounded-2xl border border-[#23242B] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
            
            <div className="border border-[#23242B] bg-[#111217] p-5 rounded-xl shadow-lg relative z-10">
              <div className="flex items-center justify-between border-b border-[#23242B] pb-3 mb-4">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2 uppercase">
                  <Lock className="w-3.5 h-3.5 text-brand-primary" /> IdeaVault Clipper
                </span>
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-brand-muted font-bold">Inspiration Link</label>
                  <div className="bg-[#09090B] px-3 py-2 rounded border border-[#23242B] text-xs text-brand-muted truncate font-mono mt-1">
                    https://youtube.com/watch?v=F384k9d...
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-brand-muted font-bold">Saved Notes</label>
                  <div className="bg-[#09090B] px-3 py-2 rounded border border-[#23242B] text-xs text-brand-muted mt-1 italic font-sans font-medium">
                    "I love the split-screen zoom transition at 0:14!"
                  </div>
                </div>
              </div>

              <button 
                onClick={onStart}
                className="w-full py-3.5 bg-[#4F8CFF] text-white font-bold rounded-xl shadow-[0_0_15px_rgba(79,140,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                Secure Blueprint <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Idea-to-Action Blueprint Section */}
      <section className="bg-[#09090B] py-24 border-t border-[#23242B] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#8B5CF6] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
              THE PIPELINE
            </div>
            <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">THE IDEA-TO-ACTION BLUEPRINT</h2>
            <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
              How IdeaVault turns raw saved visual links into structured, production-ready blueprints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Save Reference", desc: "Paste any sudden creative link or file directly into your vault folder instantly." },
              { num: "02", title: "State Intention", desc: "Write a quick description or record an audio memo outlining exactly why this inspired you." },
              { num: "03", title: "AI Decomposition", desc: "Our Gemini AI isolates the underlying hooks, tags, structural pacing, and tags instantly." },
              { num: "04", title: "Content Launch", desc: "Export the structured blueprint to script your next high-retention post or video." }
            ].map((step) => (
              <div key={step.num} className="relative group">
                <div className="w-10 h-10 rounded-full bg-[#111217] border border-[#23242B] flex items-center justify-center text-xs font-mono font-bold text-white mb-6 group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors">
                  {step.num}
                </div>
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">{step.title}</h3>
                <p className="text-xs text-brand-muted font-sans font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineered for Creators Section */}
      <section className="bg-[#09090B] py-24 relative z-10 border-t border-[#23242B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
              DISCIPLINES
            </div>
            <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">ENGINEERED FOR CREATORS</h2>
            <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
              See how different high-output disciplines streamline references directly into practical workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: "YouTube / TikTok", tagColor: "bg-blue-950 text-blue-400 border-blue-900",
                title: "Video Creators & Animators",
                desc: "Deconstruct viral storytelling formulas, timestamp high-pacing video sections, and secure b-roll references with specific action tags."
              },
              {
                tag: "Moodboards / Figma", tagColor: "bg-purple-950 text-purple-400 border-purple-900",
                title: "UI/UX & Graphic Designers",
                desc: "Build curated digital swipe files of premium typography layout pairings, grid grids, cinematic color palettes, and motion presets."
              },
              {
                tag: "SaaS Swipe Files", tagColor: "bg-emerald-950 text-emerald-400 border-emerald-900",
                title: "Copywriters & Strategists",
                desc: "Archive high-converting email headers, landing page hooks, micro-interactions, and persuasive structural outlines for clients."
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
            <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">LOVED BY ELITE VISUAL THINKERS</h2>
            <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
              How content builders, art directors, and strategists leverage their visual swipe vaults daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "\"IdeaVault changed how I script my YouTube videos. I used to bookmark and forget; now I lock down exactly why a hook inspired me.\"",
                name: "Alex Rivers", role: "YouTube Creator • 420K Subs",
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              },
              {
                quote: "\"As a UI/UX designer, Pinterest and Instagram are my playgrounds, but saving is messy. IdeaVault acts as my secondary brain.\"",
                name: "Sofia Chen", role: "Lead Product Designer",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
              },
              {
                quote: "\"The ability to save a reference and record a voice memo explaining my creative direction is incredibly helpful for content planning.\"",
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
      <section className="bg-[#09090B] py-24 border-t border-[#23242B] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#8B5CF6] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
              SAAS PLANS
            </div>
            <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white">SIMPLE PRICING</h2>
            <p className="text-brand-muted text-sm max-w-xl mx-auto mt-4 font-sans font-medium">
              IdeaVault is currently running a free local Sandbox database for independent early-adopters.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-[#111217] p-10 rounded-[2rem] border border-[#23242B] relative">
            <div className="absolute -top-3 -right-3 bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] font-mono font-bold tracking-[0.2em] px-4 py-1.5 rounded-full uppercase">
              ACTIVE SANDBOX FREE
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Creator Sandbox Tier</h3>
            <p className="text-sm text-brand-muted mb-8 font-sans font-medium">The absolute sandbox suite to secure, analyze, and tag custom inspiration entries.</p>
            
            <div className="flex items-end gap-2 mb-8 border-b border-[#23242B] pb-8">
              <span className="font-display font-bold text-5xl text-white">$0</span>
              <span className="text-sm font-mono text-brand-muted mb-1">/ Month (Free)</span>
            </div>

            <ul className="space-y-4 mb-10">
              {[
                { text: "Infinite Inspiration Vault Entries", active: true },
                { text: "Custom Organized Visual Boards", active: true },
                { text: "Instant Voice Note capture & transcriptions", active: true },
                { text: "Secure server-side Gemini 3.5 AI Analysis", active: true },
                { text: "Pro Team Collaboration Workspace (Soon)", active: false }
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-sans font-medium">
                  {item.active ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#23242B]" />
                  )}
                  <span className={item.active ? "text-white" : "text-brand-muted"}>{item.text}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={onStart}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all cursor-pointer"
            >
              Get Started Instantly
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24 relative z-10 border-t border-[#23242B]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#23242B] bg-[#111217] text-[#4F8CFF] text-[9px] font-bold tracking-[0.2em] mb-4 uppercase">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </div>
          <h2 className="font-display font-normal text-3xl md:text-[80px] uppercase tracking-tight leading-none text-white text-center">FREQUENTLY ANSWERED</h2>
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF]">YOUR NEXT CREATOR BLUEPRINT.</span>
          </h2>
          <p className="text-brand-muted text-base max-w-2xl mx-auto font-sans leading-relaxed mb-12 font-medium">
            Create collections, transcribe instant voice directions, and unlock deconstructed insights. No credit card required.
          </p>
          <button 
            onClick={onStart}
            className="px-10 py-5 bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] text-white font-bold rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer uppercase tracking-widest text-sm"
          >
            SECURE YOUR PRIVATE VAULT <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#09090B] border-t border-[#23242B] pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 border-b border-[#23242B] pb-16">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="font-display font-normal text-lg uppercase tracking-wider text-white">IdeaVault</span>
              </div>
              <p className="text-sm text-brand-muted font-sans font-medium leading-relaxed max-w-sm">
                Securely anchor references, transcribe voice intentions, and analyze the strategy behind viral content with Gemini 3.5 AI.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Features</a></li>
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Workflow</a></li>
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Use Cases</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Sandbox</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Pricing Plans</a></li>
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Login Profile</a></li>
                <li><a href="#" className="text-sm text-brand-muted hover:text-white transition-colors font-sans font-medium">Create Sandbox</a></li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Creator Swipe</h4>
              <p className="text-sm text-brand-muted font-sans font-medium leading-relaxed">
                Transforming static bookmarks into responsive creator blueprint workflows.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-mono text-brand-muted">
              IdeaVault © 2026. Designed with ultimate architectural precision. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-brand-muted">
              <Check className="w-3 h-3 text-emerald-400" /> Made with Precision & Crafts for Digital Mindset.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
