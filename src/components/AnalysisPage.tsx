import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Star, ExternalLink, Link2, Calendar, Folder, FileCheck, Play, Pause, 
  Volume2, Trash2, Edit2, Check, Sparkles, Plus, Trash, Tag, BookOpen, CheckSquare, 
  Square, Layers, FileText
} from "lucide-react";
import { Inspiration } from "../types";

interface AnalysisPageProps {
  inspiration: Inspiration;
  allInspirations?: Inspiration[];
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveTitle: (id: string, newTitle: string) => void;
  onUpdateInspiration?: (id: string, updates: Partial<Inspiration>) => void;
}

export default function AnalysisPage({ 
  inspiration, 
  allInspirations = [],
  onBack, 
  onToggleFavorite, 
  onDelete,
  onSaveTitle,
  onUpdateInspiration
}: AnalysisPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(30); // Simulated progress
  
  // Title Edit State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(inspiration.title);

  // Notes Edit State ("Why I Saved This")
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(inspiration.notes || "");

  // Key Takeaways / Tags State
  const [tags, setTags] = useState<string[]>(inspiration.tags || []);
  const [newTagText, setNewTagText] = useState("");

  // Observations State
  const [observations, setObservations] = useState(inspiration.observations || "");
  const [isSavingObservations, setIsSavingObservations] = useState(false);
  const observationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Action Items Checklist State
  const [actionItems, setActionItems] = useState<{ text: string; checked: boolean }[]>(
    inspiration.actionItems || [
      { text: "Try this transition", checked: false },
      { text: "Test this hook", checked: false },
      { text: "Use same color palette", checked: false },
      { text: "Recreate lighting", checked: false }
    ]
  );
  const [newActionText, setNewActionText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New clean states for premium redesign
  const [isEditingObservations, setIsEditingObservations] = useState(false);
  const [editedObservations, setEditedObservations] = useState(inspiration.observations || "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Sync state with props when inspiration changes (e.g. navigated or loaded)
  useEffect(() => {
    setEditedTitle(inspiration.title);
    setEditedNotes(inspiration.notes || "");
    setTags(inspiration.tags || []);
    setObservations(inspiration.observations || "");
    setEditedObservations(inspiration.observations || "");
    setActionItems(
      inspiration.actionItems || [
        { text: "Try this transition", checked: false },
        { text: "Test this hook", checked: false },
        { text: "Use same color palette", checked: false },
        { text: "Recreate lighting", checked: false }
      ]
    );
  }, [inspiration]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onSaveTitle(inspiration.id, editedTitle.trim());
      setIsEditingTitle(false);
    }
  };

  const handleSaveNotes = () => {
    if (onUpdateInspiration) {
      onUpdateInspiration(inspiration.id, { notes: editedNotes.trim() });
    }
    setIsEditingNotes(false);
  };

  // Observations autosave/debounce feel (saving to Supabase)
  const handleObservationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setObservations(val);
    setIsSavingObservations(true);

    if (observationsTimeoutRef.current) {
      clearTimeout(observationsTimeoutRef.current);
    }

    observationsTimeoutRef.current = setTimeout(() => {
      if (onUpdateInspiration) {
        onUpdateInspiration(inspiration.id, { observations: val });
      }
      setIsSavingObservations(false);
    }, 800);
  };

  // Checklist actions
  const handleToggleActionItem = (index: number) => {
    const updated = [...actionItems];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    setActionItems(updated);
    if (onUpdateInspiration) {
      onUpdateInspiration(inspiration.id, { actionItems: updated });
    }
  };

  const handleAddActionItem = () => {
    if (!newActionText.trim()) return;
    const updated = [...actionItems, { text: newActionText.trim(), checked: false }];
    setActionItems(updated);
    if (onUpdateInspiration) {
      onUpdateInspiration(inspiration.id, { actionItems: updated });
    }
    setNewActionText("");
  };

  const handleDeleteActionItem = (index: number) => {
    const updated = actionItems.filter((_, i) => i !== index);
    setActionItems(updated);
    if (onUpdateInspiration) {
      onUpdateInspiration(inspiration.id, { actionItems: updated });
    }
  };

  // Takeaways/Tags actions
  const handleAddTag = () => {
    if (!newTagText.trim()) return;
    const clean = newTagText.trim();
    if (!tags.includes(clean)) {
      const updated = [...tags, clean];
      setTags(updated);
      if (onUpdateInspiration) {
        onUpdateInspiration(inspiration.id, { tags: updated });
      }
    }
    setNewTagText("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    if (onUpdateInspiration) {
      onUpdateInspiration(inspiration.id, { tags: updated });
    }
  };

  const handleSaveObservations = () => {
    if (onUpdateInspiration) {
      onUpdateInspiration(inspiration.id, { observations: editedObservations.trim() });
    }
    setObservations(editedObservations.trim());
    setIsEditingObservations(false);
  };

  const getDomain = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  // Filter other inspirations in the same collection
  const relatedInspirations = allInspirations.filter(
    item => (item.collectionId === inspiration.collectionId || item.board === inspiration.board) && item.id !== inspiration.id
  );

  // Render simulated voice memo playback wave
  const renderVoiceNote = () => {
    if (!inspiration.voiceUrl) return null;
    return (
      <div className="bg-[#09090B] border border-[#23242B] rounded-2xl p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono tracking-widest text-[#4F8CFF] uppercase flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse text-[#4F8CFF]" /> SAVED VOICE THOUGHT
          </span>
          <span className="text-[9px] font-mono text-brand-muted">0:12 Recorded</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-[#4F8CFF] text-[#09090B] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current text-[#09090B]" /> : <Play className="w-4 h-4 fill-current ml-0.5 text-[#09090B]" />}
          </button>
          <div className="flex-1">
            <div className="flex items-end gap-0.5 h-6">
              {[4, 8, 12, 16, 14, 8, 4, 10, 18, 12, 6, 8, 15, 20, 12, 6, 4, 8, 14, 8, 4, 10, 16, 12, 6].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    isPlaying && i < audioProgress / 4 ? "bg-[#4F8CFF]" : "bg-[#23242B]"
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

  const isPinterest = 
    inspiration.platform === "PINTEREST" || 
    inspiration.board.toLowerCase().includes("pinterest") ||
    (Boolean(inspiration.url) && (inspiration.url.toLowerCase().includes("pinterest.com") || inspiration.url.toLowerCase().includes("pin.it")));

  if (isPinterest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto px-6 py-8 relative z-10 text-white font-sans selection:bg-[#4F8CFF]/30"
      >
        {/* Top Bar Navigation & Actions */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#23242B]">
          <button
            onClick={onBack}
            className="text-xs font-mono uppercase tracking-wider text-brand-muted hover:text-white px-3.5 py-2 rounded-xl bg-[#111217] border border-[#23242B] flex items-center gap-2 transition-all cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-[#4F8CFF]" /> Back to Vault
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleFavorite(inspiration.id)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                inspiration.isFavorite
                  ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-500"
                  : "bg-[#111217] border-[#23242B] text-brand-muted hover:text-white"
              }`}
            >
              <Star className={`w-4 h-4 ${inspiration.isFavorite ? "fill-yellow-500" : ""}`} />
            </button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-[#1b1c22]/90 border border-red-900/40 rounded-xl p-1">
                <span className="text-[10px] font-mono uppercase text-red-400 px-2 font-bold">Delete pin?</span>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-2.5 py-1 text-[10px] font-mono text-brand-muted">Cancel</button>
                <button onClick={() => { onDelete(inspiration.id); onBack(); }} className="px-2.5 py-1 text-[10px] font-mono bg-red-600 text-white rounded font-bold">Confirm</button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-10 h-10 rounded-xl bg-red-950/10 border border-red-900/30 text-red-400 flex items-center justify-center hover:bg-red-950/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Pinterest Visual Detail Card */}
        <div className="space-y-8">
          
          {/* TOP: Large Image */}
          {inspiration.imageUrl ? (
            <div className="w-full rounded-3xl overflow-hidden border border-[#23242B] bg-[#09090B] shadow-2xl relative max-h-[70vh] flex items-center justify-center">
              <img
                referrerPolicy="no-referrer"
                src={inspiration.imageUrl}
                alt={inspiration.title}
                className="w-full h-auto max-h-[70vh] object-contain cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              />
            </div>
          ) : (
            <div className="w-full h-64 rounded-3xl border border-[#23242B] bg-[#09090B] flex flex-col items-center justify-center p-8 text-center text-brand-muted">
              <div className="w-12 h-12 rounded-full bg-[#111217] border border-[#23242B] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-sm font-mono uppercase tracking-wider font-semibold text-brand-muted">
                No Preview Available
              </span>
            </div>
          )}

          {/* BELOW: User Title */}
          <div className="space-y-4">
            {isEditingTitle ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-[#111217] text-white font-sans font-semibold text-2xl md:text-3xl tracking-tight p-3.5 rounded-2xl border border-[#4F8CFF] focus:outline-none flex-1 font-sans"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); }}
                  onBlur={handleSaveTitle}
                  autoFocus
                />
              </div>
            ) : (
              <div className="group relative flex items-start justify-between gap-4">
                <div>
                  <h1 
                    className="font-sans font-semibold text-3xl md:text-4xl tracking-tight text-white leading-tight cursor-pointer"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {inspiration.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-xs font-mono text-brand-muted uppercase tracking-wider font-bold">
                    <span className="text-rose-400 flex items-center gap-1">📌 Pinterest</span>
                    <span>•</span>
                    <span>Saved {inspiration.createdAt}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 text-[#4F8CFF] hover:text-white p-2 rounded-lg bg-[#111217] border border-[#23242B] transition-opacity cursor-pointer flex-shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* BELOW: Why I saved this / User description */}
          <div className="pt-6 border-t border-[#23242B]/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">
                Why I saved this
              </h3>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs text-[#4F8CFF] hover:text-white transition-colors font-sans flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit Note
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full bg-[#111217] border border-[#23242B] focus:border-[#4F8CFF] p-4 rounded-xl text-base leading-relaxed text-white focus:outline-none min-h-[100px] font-sans"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setIsEditingNotes(false)} className="text-xs text-brand-muted px-3 py-1.5">Cancel</button>
                  <button onClick={handleSaveNotes} className="text-xs bg-[#4F8CFF] text-white font-semibold px-4 py-1.5 rounded-lg">Save</button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingNotes(true)}
                className="text-base text-white/90 leading-relaxed cursor-pointer hover:bg-white/[0.02] p-3 -m-3 rounded-xl transition-colors whitespace-pre-wrap font-sans"
              >
                {inspiration.notes || "Add why this inspired you..."}
              </div>
            )}
          </div>

          {/* Reference Link & Open on Pinterest button */}
          {inspiration.url && (
            <div className="pt-6 border-t border-[#23242B]/60 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">
                Reference Link
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111217] border border-[#23242B]">
                <div className="truncate text-xs font-mono text-brand-muted max-w-md">
                  {inspiration.url}
                </div>
                <a
                  href={inspiration.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                >
                  Open on Pinterest <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && inspiration.imageUrl && (
          <div 
            className="fixed inset-0 bg-[#09090B]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#23242B] shadow-2xl">
              <img 
                referrerPolicy="no-referrer" 
                src={inspiration.imageUrl} 
                className="max-w-full max-h-[85vh] object-contain" 
                alt="Full size preview" 
              />
              <div className="absolute top-4 right-4 bg-[#111217] border border-[#23242B] text-white text-xs px-3 py-1.5 rounded-lg font-mono font-bold hover:bg-[#23242B]">
                CLOSE
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

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

          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-[#1b1c22]/90 border border-red-900/40 rounded-xl p-1 animate-fade-in">
              <span className="text-[10px] font-mono uppercase text-red-400 px-2 font-bold">Are you sure?</span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase bg-[#111217] hover:bg-[#23242B] text-brand-muted hover:text-white transition-all cursor-pointer font-bold border border-[#23242B]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(inspiration.id);
                  onBack();
                }}
                className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase bg-red-600 hover:bg-red-700 text-white font-bold transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-11 h-11 rounded-xl bg-red-950/10 border border-red-900/30 text-red-400 flex items-center justify-center hover:bg-red-950/30 hover:border-red-900/50 transition-all cursor-pointer"
              title="Delete inspiration"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 mt-4">
        
        {/* LEFT COLUMN: ~70% width */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* TITLE */}
          <div className="space-y-4">
            {isEditingTitle ? (
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={editedTitle} 
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-[#111217] text-white font-sans font-semibold text-2xl md:text-3xl tracking-tight p-3 rounded-xl border border-[#4F8CFF] focus:outline-none flex-1 font-sans"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                  }}
                  onBlur={handleSaveTitle}
                  autoFocus
                />
              </div>
            ) : (
              <div className="group relative flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="font-sans font-semibold text-3xl md:text-4xl tracking-tight text-white leading-tight cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                    {inspiration.title}
                  </h1>
                  
                  {/* Platform • Date Saved (Instead of duplicate badges/cards) */}
                  <div className="flex items-center gap-2 mt-3 text-xs font-mono text-brand-muted uppercase tracking-wider font-bold">
                    <span className="text-[#4F8CFF]">{inspiration.platform}</span>
                    <span>•</span>
                    <span>{inspiration.createdAt}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 text-[#4F8CFF] hover:text-white p-2 rounded-lg bg-[#111217] border border-[#23242B] transition-opacity duration-200 cursor-pointer flex-shrink-0"
                  title="Edit title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* DESCRIPTION: Why I saved this */}
          <div className="pt-6 border-t border-[#23242B]/40">
            {isEditingNotes ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">Why I saved this</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditingNotes(false)}
                      className="text-xs text-brand-muted hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNotes}
                      className="text-xs text-[#4F8CFF] hover:text-white transition-colors font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full bg-[#111217] border border-[#23242B] focus:border-[#4F8CFF] p-4 rounded-xl text-base leading-relaxed text-white focus:outline-none min-h-[100px] font-sans"
                  autoFocus
                />
              </div>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">Why I saved this</h3>
                  <button 
                    onClick={() => setIsEditingNotes(true)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-[#4F8CFF] hover:text-white transition-opacity duration-200 flex items-center gap-1 font-sans"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div 
                  onClick={() => setIsEditingNotes(true)}
                  className="text-base text-white/90 leading-relaxed cursor-pointer hover:bg-white/[0.02] p-2 -m-2 rounded-lg transition-colors min-h-[40px] whitespace-pre-wrap font-sans font-normal"
                >
                  {inspiration.notes || "Add why this inspired you..."}
                </div>
              </div>
            )}
          </div>

          {/* ATTACHED MEDIA (Only shown if media exists) */}
          {inspiration.imageUrl && (
            <div className="pt-6 border-t border-[#23242B]/40 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">Attachment</h3>
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="rounded-xl overflow-hidden border border-[#23242B] cursor-zoom-in relative group transition-all hover:border-[#4F8CFF]/40 max-w-xl shadow-md"
              >
                <img 
                  referrerPolicy="no-referrer" 
                  src={inspiration.imageUrl} 
                  className="w-full h-auto object-cover max-h-96" 
                  alt="inspiration screenshot" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white bg-black/60 px-3 py-1.5 rounded-lg border border-[#23242B] font-mono uppercase font-bold tracking-wider">
                    Click to enlarge
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VOICE MEMO (if exists) */}
          {inspiration.voiceUrl && (
            <div className="pt-6 border-t border-[#23242B]/40">
              {renderVoiceNote()}
            </div>
          )}

          {/* PERSONAL NOTES */}
          <div className="pt-6 border-t border-[#23242B]/40">
            {isEditingObservations ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">Personal Notes</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditingObservations(false)}
                      className="text-xs text-brand-muted hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveObservations}
                      className="text-xs text-[#4F8CFF] hover:text-white transition-colors font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <textarea
                  value={editedObservations}
                  onChange={(e) => setEditedObservations(e.target.value)}
                  placeholder="Add personal notes, design lessons, or workflow ideas..."
                  className="w-full bg-[#111217] border border-[#23242B] focus:border-[#4F8CFF] p-4 rounded-xl text-sm leading-relaxed text-white focus:outline-none min-h-[150px] font-sans resize-y"
                  autoFocus
                />
              </div>
            ) : (
              <div className="group relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-brand-muted font-bold">Personal Notes</h3>
                  <button 
                    onClick={() => setIsEditingObservations(true)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-[#4F8CFF] hover:text-white transition-opacity duration-200 flex items-center gap-1 font-sans"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div 
                  onClick={() => setIsEditingObservations(true)}
                  className="text-sm text-brand-muted leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-white/[0.02] p-2 -m-2 rounded-lg transition-colors min-h-[60px]"
                >
                  {observations || "Add personal notes, design lessons, or workflow ideas..."}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: ~30% width */}
        <div className="lg:col-span-3 space-y-8 bg-[#111217] border border-[#23242B] rounded-2xl p-6 h-fit shadow-lg">
          
          {/* SOURCE */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-muted font-bold">Source</h4>
            {inspiration.url ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${getDomain(inspiration.url)}&sz=32`} 
                    alt="Source favicon" 
                    className="w-4 h-4 rounded-sm bg-white/10"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-xs font-mono text-white/90 font-bold tracking-tight max-w-[180px] truncate">
                    {getDomain(inspiration.url)}
                  </span>
                </div>
                <div className="truncate text-[10px] font-mono text-brand-muted max-w-[220px]">
                  {inspiration.url}
                </div>
                <a 
                  href={inspiration.url} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1 text-xs text-[#4F8CFF] hover:text-white transition-colors mt-1 font-semibold"
                >
                  Open Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <span className="text-xs text-brand-muted font-mono">No source link provided</span>
            )}
          </div>

          {/* TAGS */}
          <div className="space-y-3 pt-6 border-t border-[#23242B]/40">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-muted font-bold">Tags</h4>
            {tags.length === 0 ? (
              <p className="text-xs text-brand-muted font-medium italic">No tags added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="group relative inline-flex items-center gap-1 bg-[#1A1B23] hover:bg-[#23242B] border border-[#23242B] text-brand-secondary text-xs px-2.5 py-1 rounded-md font-sans transition-colors"
                  >
                    #{tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-400 hover:text-red-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Tag input inline */}
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="text" 
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                placeholder="Add tag..."
                className="bg-[#09090B] border border-[#23242B] focus:border-[#4F8CFF] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-brand-muted focus:outline-none flex-1 font-sans"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTag();
                }}
              />
              <button 
                onClick={handleAddTag}
                className="px-2.5 py-1.5 rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] hover:bg-[#4F8CFF] hover:text-[#09090B] border border-[#4F8CFF]/20 text-xs transition-all font-semibold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* COLLECTION */}
          <div className="space-y-1 pt-6 border-t border-[#23242B]/40">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-muted font-bold">Collection</h4>
            <div className="text-xs text-white font-medium uppercase tracking-wider">
              {inspiration.board.replace(/[^\w\s]/g, "").trim()}
            </div>
          </div>

          {/* DATE SAVED */}
          <div className="space-y-1 pt-6 border-t border-[#23242B]/40">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-muted font-bold">Saved Date</h4>
            <div className="text-xs text-white font-medium">
              {inspiration.createdAt}
            </div>
          </div>

        </div>

      </div>

      {/* LIGHTBOX FOR FULL MEDIA PREVIEW */}
      {isLightboxOpen && inspiration.imageUrl && (
        <div 
          className="fixed inset-0 bg-[#09090B]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#23242B] shadow-2xl">
            <img 
              referrerPolicy="no-referrer" 
              src={inspiration.imageUrl} 
              className="max-w-full max-h-[85vh] object-contain" 
              alt="Full size view" 
            />
            <div className="absolute top-4 right-4 bg-[#111217] border border-[#23242B] text-white text-xs px-3 py-1.5 rounded-lg font-mono font-bold hover:bg-[#23242B]">
              CLOSE
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
