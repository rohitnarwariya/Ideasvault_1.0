import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Star, Folder, ExternalLink, Sparkles, Filter, Plus, Trash2, 
  ChevronRight, ArrowUpRight, Grid, HelpCircle, Key, Lock 
} from "lucide-react";
import { Inspiration } from "../types";

interface DashboardProps {
  inspirations: Inspiration[];
  boards: { id: string; name: string }[];
  activeBoard: string;
  onBoardChange: (boardId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddInspiration: () => void;
  onToggleFavorite: (id: string) => void;
  onViewInspiration: (insp: Inspiration) => void;
  onAddNewBoard: (boardName: string) => void;
  onDelete: (id: string) => void;
}

export default function Dashboard({
  inspirations,
  boards,
  activeBoard,
  onBoardChange,
  searchQuery,
  onSearchChange,
  onAddInspiration,
  onToggleFavorite,
  onViewInspiration,
  onAddNewBoard,
  onDelete
}: DashboardProps) {
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onAddNewBoard(newBoardName.trim());
      setNewBoardName("");
      setIsAddingBoard(false);
    }
  };

  // Calculate counts dynamically for boards
  const getBoardCount = (boardName: string) => {
    if (boardName === "★ All") {
      return inspirations.length;
    }
    return inspirations.filter(item => item.board.toLowerCase() === boardName.toLowerCase()).length;
  };

  // Filtered list based on active board and search query
  const filteredInspirations = inspirations.filter(item => {
    // Board matching
    const matchesBoard = 
      activeBoard === "all" || 
      item.board.toLowerCase().includes(activeBoard.toLowerCase()) || 
      (activeBoard === "random-ideas" && item.board.toLowerCase().includes("random")) ||
      (activeBoard === "youtube" && item.board.toLowerCase().includes("youtube")) ||
      (activeBoard === "instagram" && item.board.toLowerCase().includes("instagram")) ||
      (activeBoard === "pinterest" && item.board.toLowerCase().includes("pinterest"));

    // Search query matching
    const matchesSearch = 
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.platform.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesBoard && matchesSearch;
  });  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 text-white font-sans selection:bg-[#4F8CFF]/30">
      
      {/* Title block with trigger to capture modal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#23242B] mb-8">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#4F8CFF] font-bold uppercase">secured creative repository</span>
          <h1 className="font-display font-normal text-4xl md:text-6xl uppercase tracking-wide text-white mt-1 leading-none">
            Inspiration <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6]">Vault</span>
          </h1>
          <p className="text-xs text-brand-muted mt-2.5 font-mono">
            Save. Remember. Create. — Deep AI Context Blueprints Active
          </p>
        </div>

        <button
          onClick={onAddInspiration}
          className="px-6 py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer self-start md:self-center uppercase tracking-widest font-semibold"
        >
          + SAVE INSPIRATION <Sparkles className="w-4 h-4 fill-current text-white" />
        </button>
      </div>

      {/* Filter boards strip & Search panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-center">
        
        {/* Navigation Collections Tabs */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
          {boards.map(b => {
            const count = getBoardCount(b.name);
            const isActive = activeBoard === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onBoardChange(b.id)}
                className={`text-xs font-mono px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? "bg-gradient-to-r from-[#8B5CF6]/15 to-[#4F8CFF]/15 border-[#4F8CFF] text-white font-bold shadow-[0_0_15px_rgba(79,140,255,0.1)]" 
                    : "bg-[#111217] border-[#23242B] text-brand-muted hover:text-white hover:border-brand-muted/30 hover:bg-[#1a1b22]"
                }`}
              >
                <span className="uppercase tracking-wider">{b.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  isActive ? "bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white" : "bg-[#09090B] text-brand-muted"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* New collection custom adder */}
          {isAddingBoard ? (
            <form onSubmit={handleCreateBoard} className="flex items-center gap-2">
              <input 
                type="text"
                required
                autoFocus
                placeholder="Collection name..."
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="bg-[#09090B] text-xs text-white border border-[#4F8CFF]/60 px-3 py-2 rounded-xl focus:outline-none w-36 font-mono"
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-mono text-xs px-3 py-2 rounded-xl font-bold hover:opacity-95 cursor-pointer shadow-md"
              >
                Add
              </button>
              <button 
                type="button" 
                onClick={() => setIsAddingBoard(false)}
                className="text-xs text-brand-muted font-mono px-2 py-1 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingBoard(true)}
              className="text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#23242B] border-dashed text-brand-muted hover:text-white hover:border-brand-muted/40 hover:bg-[#111217]/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Collection
            </button>
          )}
        </div>

        {/* Dynamic Search Box */}
        <div className="lg:col-span-4 relative">
          <input
            type="text"
            placeholder="Search vault (e.g. Bauhaus, retention)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#111217] border border-[#23242B] rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/50 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-muted" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-3 text-[9px] font-mono text-brand-muted bg-[#09090B] px-2 py-1 rounded hover:text-white border border-[#23242B] transition-colors"
            >
              CLEAR
            </button>
          )}
        </div>

      </div>

      {/* Main locked results header */}
      <div className="flex items-center justify-between border-b border-[#23242B] pb-4 mb-6">
        <h2 className="text-[10px] font-mono tracking-[0.2em] text-brand-muted uppercase flex items-center gap-1.5 font-bold">
          <Lock className="w-3.5 h-3.5 text-[#4F8CFF]" /> {activeBoard.toUpperCase() === "ALL" ? "ALL" : activeBoard.replace("-", " ").toUpperCase()} LOCKED INSPIRATIONS
        </h2>
        <span className="text-[10px] font-mono text-brand-muted">
          Showing {filteredInspirations.length} of {inspirations.length} items
        </span>
      </div>

      {/* Grid List */}
      {filteredInspirations.length === 0 ? (
        <div className="bg-[#111217] border border-[#23242B] rounded-2xl p-16 text-center shadow-xl">
          <HelpCircle className="w-12 h-12 text-[#23242B] mx-auto mb-4" />
          <h3 className="font-display font-black uppercase text-lg text-white mb-1">No secured blueprints found</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
            Try adjusting your search query or selecting a different board. If this board is empty, secure your first creative inspiration.
          </p>
          <button
            onClick={onAddInspiration}
            className="mt-6 bg-[#09090B] hover:bg-[#111217] text-[#4F8CFF] border border-[#23242B] hover:border-[#4F8CFF]/40 font-mono text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            + Secure First Inspiration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspirations.map(insp => (
            <motion.div
              key={insp.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-[#111217] rounded-3xl border border-[#23242B] hover:border-[#4F8CFF]/40 hover:shadow-[0_0_25px_rgba(79,140,255,0.06)] transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
            >
              
              {/* Image Thumbnail header preview if has image */}
              {insp.imageUrl && (
                <div className="h-40 overflow-hidden border-b border-[#23242B]/60 relative">
                  <img referrerPolicy="no-referrer" src={insp.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="thumbnail" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111217] to-transparent opacity-60" />
                </div>
              )}

              {/* Main card metadata and title */}
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4.5">
                  {/* Platform Indicator */}
                  <span className={`px-3 py-1 rounded-full text-[8px] font-mono border uppercase tracking-widest font-semibold ${
                    insp.platform === "YOUTUBE" ? "bg-red-950/40 text-red-400 border-red-900/30" :
                    insp.platform === "INSTAGRAM" ? "bg-purple-950/40 text-purple-400 border-purple-900/30" :
                    insp.platform === "PINTEREST" ? "bg-rose-950/40 text-rose-400 border-rose-900/30" :
                    insp.platform === "WEBSITE" ? "bg-teal-950/40 text-teal-400 border-teal-900/30" :
                    "bg-zinc-950/40 text-zinc-400 border-zinc-900/30"
                  }`}>
                    {insp.platform === "PINTEREST" ? "📌 Pinterest" :
                     insp.platform === "INSTAGRAM" ? "📸 Instagram" :
                     insp.platform === "YOUTUBE" ? "📹 youtube" :
                     `🌐 ${insp.platform}`}
                  </span>

                  {/* AI Pipeline Status */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-mono font-bold border uppercase tracking-wider ${
                      insp.aiStatus === "ready" 
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" 
                        : "bg-red-950/40 text-red-400 border-red-900/30"
                    }`}>
                      {insp.aiStatus === "ready" ? "AI Ready" : "AI Failed"}
                    </span>

                    {/* Star Favorite icon toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(insp.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        insp.isFavorite 
                          ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-500" 
                          : "bg-[#09090B] border-[#23242B] text-brand-muted hover:text-white"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${insp.isFavorite ? "fill-yellow-500" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 
                  onClick={() => onViewInspiration(insp)}
                  className="font-display font-normal text-xl tracking-wide uppercase text-white group-hover:text-[#4F8CFF] cursor-pointer transition-colors leading-tight line-clamp-2"
                >
                  {insp.title}
                </h3>

                {/* Notes Snippet */}
                <div 
                  onClick={() => onViewInspiration(insp)}
                  className="mt-4 p-4 bg-[#09090B] border border-[#23242B] rounded-2xl cursor-pointer hover:bg-[#09090B]/90 hover:border-[#4F8CFF]/20 transition-all duration-300"
                >
                  <p className="text-[11px] text-brand-muted italic line-clamp-3 leading-relaxed font-sans font-medium">
                    {insp.notes || "No added details."}
                  </p>
                </div>

                {/* Tags inside card */}
                {insp.tags && insp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {insp.tags.map(t => (
                      <span key={t} className="text-[9px] font-mono bg-[#09090B] px-2.5 py-0.5 rounded-full text-brand-muted border border-[#23242B]/40">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#09090B]/40 border-t border-[#23242B]/40 flex items-center justify-between text-[9px] font-mono text-brand-muted">
                <span className="flex items-center gap-1 font-bold uppercase tracking-tight">
                  <Folder className="w-3 h-3 text-[#4F8CFF]" /> {insp.board.replace(/[^\w\s]/g, "").trim()}
                </span>
                
                <div className="flex items-center gap-3">
                  <span>{insp.createdAt}</span>
                  {insp.url && (
                    <a 
                      href={insp.url} 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="text-brand-muted hover:text-[#4F8CFF] transition-colors"
                      title="Visit reference link"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
