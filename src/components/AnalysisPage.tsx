import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Star, ExternalLink, Link2, Calendar, Folder, FileCheck, Play, Pause, 
  Volume2, Trash2, Edit2, Check, Sparkles 
} from "lucide-react";
import { Inspiration } from "../types";

interface AnalysisPageProps {
  inspiration: Inspiration;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveTitle: (id: string, newTitle: string) => void;
}

export default function AnalysisPage({ 
  inspiration, 
  onBack, 
  onToggleFavorite, 
  onDelete,
  onSaveTitle
}: AnalysisPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(30); // Simulated progress
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(inspiration.title);

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onSaveTitle(inspiration.id, editedTitle.trim());
      setIsEditingTitle(false);
    }
  };

  const analysis = inspiration.aiAnalysis;

  // Render a lovely simulated voice memo play wave if there is a voice note
  const renderVoiceNote = () => {
    if (!inspiration.voiceUrl) return null;
    return (
      <div className="bg-brand-card border border-brand-border rounded-xl p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono tracking-widest text-brand-primary uppercase flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" /> SAVED VOICE THOUGHT
          </span>
          <span className="text-[9px] font-mono text-brand-muted">0:12 Recorded</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-brand-primary text-brand-bg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <div className="flex-1">
            {/* Animated waveform container */}
            <div className="flex items-end gap-0.5 h-6">
              {[4, 8, 12, 16, 14, 8, 4, 10, 18, 12, 6, 8, 15, 20, 12, 6, 4, 8, 14, 8, 4, 10, 16, 12, 6].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    isPlaying && i < audioProgress / 4 ? "bg-brand-primary" : "bg-brand-border"
                  }`} 
                  style={{ height: `${h}px` }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-7xl mx-auto px-6 py-12 relative z-10 font-sans text-white selection:bg-[#4F8CFF]/30"
    >
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23242B] pb-6 mb-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-[#4F8CFF] font-bold hover:text-white transition-colors cursor-pointer uppercase py-2.5 px-4 bg-[#111217]/50 hover:bg-[#111217] border border-[#23242B] rounded-xl hover:border-[#4F8CFF]/40"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO VAULT
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleFavorite(inspiration.id)}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              inspiration.isFavorite 
                ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-500" 
                : "bg-[#111217] border-[#23242B] text-brand-muted hover:text-white hover:border-brand-muted/30"
            }`}
            title="Favorite inspiration"
          >
            <Star className={`w-4 h-4 ${inspiration.isFavorite ? "fill-yellow-500" : ""}`} />
          </button>

          <button 
            onClick={() => {
              if (confirm("Are you sure you want to delete this locked inspiration blueprint?")) {
                onDelete(inspiration.id);
                onBack();
              }
            }}
            className="w-11 h-11 rounded-xl bg-red-950/10 border border-red-900/30 text-red-400 flex items-center justify-center hover:bg-red-950/30 hover:border-red-900/50 transition-all cursor-pointer"
            title="Delete inspiration"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Metadata panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Reference Input panel */}
          <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-6 shadow-xl">
            <h3 className="text-xs font-mono tracking-[0.2em] text-brand-muted uppercase mb-4 font-bold">SOURCE REFERENCE</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-brand-muted uppercase block mb-1.5 font-bold">Link / URL</label>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly 
                    value={inspiration.url || "No reference link attached"}
                    className="w-full bg-[#09090B] px-4 py-3 rounded-xl border border-[#23242B] text-xs text-brand-muted font-mono pr-10 focus:outline-none"
                  />
                  <Link2 className="absolute right-3.5 top-3.5 w-4 h-4 text-brand-border" />
                </div>
              </div>

              {inspiration.url && (
                <a 
                  href={inspiration.url} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="w-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#4F8CFF]/10 hover:from-[#8B5CF6]/20 hover:to-[#4F8CFF]/20 border border-[#23242B] hover:border-[#4F8CFF]/40 text-white font-mono text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold hover:scale-[1.02]"
                >
                  Visit Source <ExternalLink className="w-3.5 h-3.5 text-[#4F8CFF]" />
                </a>
              )}
            </div>
          </div>

          {/* Context details tags */}
          <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-mono tracking-[0.2em] text-brand-muted uppercase font-bold">SYSTEM INDEX</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2.5 border-b border-[#23242B]/40">
                <span className="text-brand-muted font-mono flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" /> Collection</span>
                <span className="font-bold text-[#4F8CFF] uppercase tracking-tight">{inspiration.board.replace(/[^\w\s]/g, "").trim()}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2.5 border-b border-[#23242B]/40">
                <span className="text-brand-muted font-mono flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Platform</span>
                <span className="font-bold text-brand-secondary uppercase tracking-tight">{inspiration.platform}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2.5">
                <span className="text-brand-muted font-mono flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Secured At</span>
                <span className="font-bold text-white uppercase tracking-tight">{inspiration.createdAt}</span>
              </div>
            </div>
          </div>

          {/* File attachment box */}
          <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-6 shadow-xl">
            <h3 className="text-xs font-mono tracking-[0.2em] text-brand-muted uppercase mb-4 font-bold">ATTACHED MEDIA</h3>
            
            {inspiration.imageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-[#23242B] relative group">
                <img referrerPolicy="no-referrer" src={inspiration.imageUrl} className="w-full h-auto object-cover max-h-56" alt="inspiration screenshot" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/80 to-transparent flex items-end p-3">
                  <span className="text-[10px] font-mono text-[#4F8CFF] font-bold">reference_screenshot.png</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#09090B] rounded-2xl border border-dashed border-[#23242B] p-8 text-center">
                <FileCheck className="w-8 h-8 text-brand-border mx-auto mb-2" />
                <p className="text-xs text-brand-muted font-medium">No physical file attachments provided.</p>
                <p className="text-[9px] font-mono text-brand-muted/60 mt-1">CONTEXT FULLY DIGESTED VIA TEXT/URL</p>
              </div>
            )}

            {renderVoiceNote()}
          </div>

        </div>

        {/* RIGHT COLUMN: AI Analysis & Interactive Blueprints */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Title area */}
          <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-8 shadow-xl">
            {isEditingTitle ? (
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={editedTitle} 
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-[#09090B] text-white font-display font-normal text-2xl md:text-3xl tracking-wide p-3 rounded-xl border border-[#4F8CFF] focus:outline-none flex-1 uppercase"
                />
                <button 
                  onClick={handleSaveTitle}
                  className="w-12 h-12 rounded-xl bg-green-950 text-green-400 border border-green-900/60 flex items-center justify-center hover:bg-green-900 hover:text-white cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display font-normal text-3xl md:text-5xl tracking-wide text-white leading-none uppercase">
                    {inspiration.title}
                  </h1>
                  <p className="text-xs text-brand-muted mt-3 font-mono flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#4F8CFF]" /> SECURED AI BLUEPRINT STATUS: <span className="text-emerald-400 font-bold uppercase">Locked & Cataloged</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="text-[#4F8CFF] hover:text-white p-2 rounded-xl bg-[#09090B] border border-[#23242B] transition-colors mt-1 cursor-pointer"
                  title="Edit title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Original typed notes citation snippet */}
            <div className="mt-6 p-4 rounded-2xl bg-[#09090B]/60 border border-[#23242B] italic text-xs leading-relaxed text-brand-muted font-sans font-medium relative">
              <span className="text-[#4F8CFF] font-serif font-extrabold text-3xl absolute -top-1 left-2 select-none opacity-20">“</span>
              <p className="pl-5 pr-2">{inspiration.notes || "No user thoughts provided. Generated strictly from URL metadata."}</p>
            </div>
          </div>

          {/* AI Core Split columns or Pending loader */}
          {inspiration.aiStatus === "pending" ? (
            <div className="bg-[#111217] rounded-2xl border border-[#23242B] p-12 text-center shadow-xl">
              <div className="w-10 h-10 border-4 border-[#4F8CFF]/20 border-t-[#4F8CFF] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-mono text-[#4F8CFF] uppercase tracking-widest font-bold">SECURED BLUEPRINT PIPELINE ACTIVE</p>
              <p className="text-xs text-brand-muted mt-2 font-medium">Connecting to Google Gemini API to structure creative metadata...</p>
            </div>
          ) : inspiration.aiStatus === "failed" || !analysis ? (
            <div className="bg-[#111217] rounded-2xl border border-[#23242B] p-8 shadow-xl text-center">
              <div className="max-w-md mx-auto py-6">
                <span className="px-3 py-1 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 text-[9px] font-mono tracking-widest uppercase mb-4 inline-block font-bold">
                  CO-PILOT ERROR
                </span>
                <h3 className="font-display font-black text-lg text-white mb-2 uppercase tracking-tight">Analysis Pipeline Interrupted</h3>
                <p className="text-xs text-brand-muted leading-relaxed font-medium">
                  IdeaVault was unable to digest deep creative blueprints for this asset. This typically happens when the saved notes are extremely short or the URL is restricted. 
                </p>
                <div className="mt-6 p-3 bg-[#09090B] rounded-lg border border-[#23242B] text-left font-mono text-[10px] text-brand-muted">
                  <p className="text-red-400 font-bold">LOG: AI_STATUS_FAILED</p>
                  <p className="mt-1">Reason: User provided raw title ("hey i want this") without sufficient structural context. Ready for manual notes editing.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Creative Insight & Why it works cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Creative Insight card */}
                <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-6 shadow-xl hover:border-[#4F8CFF]/30 hover:shadow-[0_0_20px_rgba(79,140,255,0.04)] transition-all duration-300">
                  <h3 className="text-[10px] font-mono tracking-widest text-[#4F8CFF] uppercase mb-3 flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF] animate-pulse" /> Creative Insight
                  </h3>
                  <p className="text-xs leading-relaxed text-brand-muted font-medium">
                    {analysis.creativeInsight}
                  </p>
                </div>

                {/* Why it works card */}
                <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-6 shadow-xl hover:border-brand-secondary/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)] transition-all duration-300">
                  <h3 className="text-[10px] font-mono tracking-widest text-brand-secondary uppercase mb-3 flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" /> Why It Works
                  </h3>
                  <p className="text-xs leading-relaxed text-brand-muted font-medium">
                    {analysis.whyItWorks}
                  </p>
                </div>
              </div>

              {/* Sequential Content Blueprint Timeline */}
              <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-8 shadow-xl">
                <h3 className="text-xs font-mono tracking-widest text-brand-muted uppercase mb-8 flex items-center gap-2 font-bold">
                  <span className="w-2.5 h-2.5 bg-[#4F8CFF] rounded-full shadow-lg shadow-[#4F8CFF]/50" /> SEQUENTIAL CONTENT BLUEPRINT
                </h3>

                <div className="relative pl-6 border-l border-[#23242B]/80 ml-3 space-y-8">
                  {analysis.sequentialBlueprint.map((step, idx) => {
                    const [stepTitle, stepDesc] = step.includes(":") ? step.split(":") : [`Step ${idx + 1}`, step];
                    return (
                      <div key={idx} className="relative">
                        {/* Bullet with numbers */}
                        <div className="absolute -left-[35px] top-0.5 w-[18px] h-[18px] rounded-full bg-[#09090B] border-2 border-[#4F8CFF] text-[#4F8CFF] text-[9px] font-mono font-bold flex items-center justify-center shadow-lg shadow-[#4F8CFF]/25">
                          {idx + 1}
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">
                          {stepTitle.trim()}
                        </h4>
                        <p className="text-xs text-brand-muted mt-1 leading-relaxed font-medium">
                          {stepDesc.trim()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How to Adapt & Reuse guidelines */}
              <div className="bg-[#111217] rounded-3xl border border-[#23242B] p-8 shadow-xl">
                <h3 className="text-xs font-mono tracking-widest text-brand-muted uppercase mb-6 flex items-center gap-2 font-bold">
                  <span className="w-2.5 h-2.5 bg-brand-secondary rounded-full shadow-lg shadow-brand-secondary/50" /> HOW TO ADAPT & REUSE
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.howToAdapt.map((tip, idx) => (
                    <div key={idx} className="p-4 bg-[#09090B] rounded-2xl border border-[#23242B]/60 hover:border-brand-secondary/40 transition-all duration-300">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-[10px] font-mono font-bold text-brand-secondary px-2.5 py-0.5 rounded-full bg-brand-secondary/10 border border-brand-secondary/20">
                          0{idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider font-bold">GUIDELINE</span>
                      </div>
                      <p className="text-xs text-brand-muted leading-relaxed font-medium">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
