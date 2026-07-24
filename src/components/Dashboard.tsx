import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Star, Folder, ExternalLink, Sparkles, Filter, Plus, Trash2, 
  ChevronRight, ArrowUpRight, Grid, HelpCircle, Key, Lock, Play, X, Lightbulb, Bookmark, Chrome 
} from "lucide-react";
import { Inspiration } from "../types";
import InspirationCard from "./InspirationCard";

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
  const [activeWatchVideoId, setActiveWatchVideoId] = useState<string | null>(null);
  const [activeWatchVideoTitle, setActiveWatchVideoTitle] = useState<string>("");

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onAddNewBoard(newBoardName.trim());
      setNewBoardName("");
      setIsAddingBoard(false);
    }
  };

  // Helper to detect if an inspiration is a video
  const isItemVideo = (item: Inspiration) => {
    return (
      item.platform === "YOUTUBE" || 
      item.platform === "INSTAGRAM" || 
      item.platform === "PODCAST" ||
      item.board.toLowerCase().includes("youtube") ||
      item.board.toLowerCase().includes("instagram") ||
      item.board.toLowerCase().includes("video") ||
      item.url.toLowerCase().includes("youtube.com") ||
      item.url.toLowerCase().includes("youtu.be") ||
      item.url.toLowerCase().includes("instagram.com")
    );
  };

  // Helper to extract YouTube ID
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Construct our unified collections/navigation tabs:
  // - Virtual tab "★ All" (id: "all")
  // - Virtual tab "📹 All Videos" (id: "all-videos")
  // - Followed by other boards, filtering out duplicates
  const navigationTabs = [
    { id: "all", name: "★ All" },
    { id: "all-videos", name: "📹 All Videos" },
    ...boards.filter(b => b.id !== "all" && b.id !== "all-videos" && b.name !== "★ All" && b.name !== "📹 All Videos")
  ];

  // Unbiased, robust matching helper function for board/collection filtering
  const matchesBoardFilter = (item: Inspiration, boardId: string, boardName: string) => {
    if (boardId === "all") {
      return true;
    }
    if (boardId === "all-videos") {
      return isItemVideo(item);
    }

    const nameLower = boardName.toLowerCase();
    const idLower = boardId.toLowerCase();

    // Check direct collection ID / UUID match
    const hasDirectIdMatch = 
      (item.collectionId && item.collectionId === boardId) || 
      (item.collection_id && item.collection_id === boardId);

    // Check name match (case insensitive)
    const hasNameMatch = 
      nameLower && 
      (item.board.toLowerCase() === nameLower || 
       item.board.toLowerCase().includes(nameLower) || 
       nameLower.includes(item.board.toLowerCase()));

    const isInstagramBoard = idLower === "instagram" || nameLower.includes("instagram");
    const isYoutubeBoard = idLower === "youtube" || nameLower.includes("youtube");
    const isPinterestBoard = idLower === "pinterest" || nameLower.includes("pinterest");
    const isRandomBoard = idLower === "random-ideas" || nameLower.includes("random");

    if (isInstagramBoard) {
      return (item.platform?.toLowerCase() === "instagram") || hasDirectIdMatch || hasNameMatch;
    } else if (isYoutubeBoard) {
      return (item.platform?.toLowerCase() === "youtube") || hasDirectIdMatch || hasNameMatch;
    } else if (isPinterestBoard) {
      return (item.platform?.toLowerCase() === "pinterest") || hasDirectIdMatch || hasNameMatch;
    } else if (isRandomBoard) {
      return item.board.toLowerCase().includes("random") || hasDirectIdMatch || hasNameMatch;
    }

    return hasDirectIdMatch || hasNameMatch;
  };

  // Calculate counts dynamically for boards
  const getBoardCount = (boardId: string, boardName: string) => {
    return inspirations.filter(item => matchesBoardFilter(item, boardId, boardName)).length;
  };

  // Filtered list based on active board and search query
  const filteredInspirations = inspirations.filter(item => {
    const activeBoardObj = boards.find(b => b.id === activeBoard);
    const activeBoardName = activeBoardObj ? activeBoardObj.name : "";
    
    const matchesBoard = matchesBoardFilter(item, activeBoard, activeBoardName);

    // Search query matching
    const matchesSearch = 
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.platform.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesBoard && matchesSearch;
  });

  // Assign and log exactly as requested
  const ideas = inspirations;
  const selectedCollection = activeBoard;
  const filteredIdeas = filteredInspirations;

  console.log("All ideas:", ideas);
  console.log("Selected collection:", selectedCollection);
  console.log("Filtered ideas:", filteredIdeas);

  // Determine clean collection name for dynamic empty states
  const activeBoardObj = boards.find(b => b.id === activeBoard);
  const isAll = activeBoard === "all";
  const isAllVideos = activeBoard === "all-videos";
  const cleanBoardName = activeBoardObj 
    ? activeBoardObj.name.replace(/^[★📹💡📌📸🌐\s]+/, "").trim() 
    : "";

  const hasSearch = searchQuery.trim() !== "";
  
  const emptyHeading = hasSearch 
    ? "No matching ideas found" 
    : isAll 
      ? "No ideas yet" 
      : isAllVideos 
        ? "No videos saved yet" 
        : `No ideas in ${cleanBoardName} yet`;

  const emptyDescription = hasSearch 
    ? `We couldn't find any ideas matching "${searchQuery}".` 
    : isAll 
      ? "Save your first idea to start building your personal inspiration library." 
      : isAllVideos 
        ? "Save your first video inspiration to start building your library." 
        : `Save your first ${cleanBoardName} inspiration.`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 text-white font-sans selection:bg-[#4F8CFF]/30">
      
      {/* Title block with trigger to capture modal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#23242B] mb-8">
        <div>
          <h1 className="font-display font-normal text-4xl md:text-6xl uppercase tracking-wide text-white mt-1 leading-none">
            Inspiration <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6]">Vault</span>
          </h1>
          <p className="text-xs text-brand-muted mt-2.5 font-mono">
            Save. Remember. Create. — Deep AI Context Blueprints Active
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <a
            href="/ideavault-extension.zip"
            download="ideavault-extension.zip"
            className="px-4 py-3 bg-[#111217] hover:bg-[#181920] border border-[#23242B] text-white font-sans font-medium rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Chrome className="w-4 h-4 text-[#4F8CFF]" />
            Chrome Extension
          </a>

          <button
            onClick={onAddInspiration}
            className="px-6 py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest font-semibold"
          >
            + SAVE INSPIRATION <Sparkles className="w-4 h-4 fill-current text-white" />
          </button>
        </div>
      </div>

      {/* Filter boards strip & Search panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-center">
        
        {/* Navigation Collections Tabs */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
          {navigationTabs.map(b => {
            const count = getBoardCount(b.id, b.name);
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
        <span className="text-[10px] font-mono text-brand-muted">
          Showing {filteredInspirations.length} of {inspirations.length} items
        </span>
      </div>

      {/* Grid or Masonry List */}
      {filteredInspirations.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[#111217] border border-[#23242B] rounded-2xl py-12 px-8 flex flex-col items-center justify-center text-center shadow-xl w-full max-w-xl mx-auto my-8"
        >
          <Folder className="w-8 h-8 text-brand-muted/70 mb-4 stroke-[1.25]" />
          <h3 className="font-sans font-medium text-lg text-white mb-2">
            {emptyHeading}
          </h3>
          <p className="text-xs text-brand-muted max-w-sm leading-relaxed mb-6">
            {emptyDescription}
          </p>
          <button
            onClick={onAddInspiration}
            className="bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] text-white font-sans font-bold rounded-xl px-5 py-2.5 text-xs shadow-md hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(79,140,255,0.25)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            + Save First Idea
          </button>
        </motion.div>
      ) : (cleanBoardName.toLowerCase().includes("pinterest") || activeBoard.toLowerCase().includes("pinterest")) ? (
        /* PINTEREST MASONRY GALLERY */
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredInspirations.map(insp => (
            <motion.div
              key={insp.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="break-inside-avoid bg-[#111217] rounded-2xl border border-[#23242B] hover:border-[#3a3b45] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group mb-6"
              onClick={() => onViewInspiration(insp)}
            >
              {/* Large Image Preview (main focus) */}
              {insp.imageUrl ? (
                <div className="w-full overflow-hidden bg-[#09090B]">
                  <img
                    referrerPolicy="no-referrer"
                    src={insp.imageUrl}
                    alt={insp.title}
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-[#09090B] border-b border-[#23242B] flex flex-col items-center justify-center p-6 text-center text-brand-muted">
                  <div className="w-10 h-10 rounded-full bg-[#111217] border border-[#23242B] flex items-center justify-center mb-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-brand-muted/70">
                    No Preview Available
                  </span>
                </div>
              )}

              {/* Bottom Card Content */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  {/* Title */}
                  <h3 className="font-sans font-semibold text-sm text-white group-hover:text-[#4F8CFF] transition-colors leading-snug line-clamp-2">
                    {insp.title}
                  </h3>

                  {/* Description: 2 lines max */}
                  {(insp.notes || insp.voiceTranscript) && (
                    <p className="mt-2 text-xs text-brand-muted/80 line-clamp-2 leading-relaxed font-sans">
                      {insp.notes || insp.voiceTranscript}
                    </p>
                  )}
                </div>

                {/* Small Footer */}
                <div className="mt-4 pt-3 border-t border-[#23242B]/40 flex items-center justify-between text-[10px] font-mono text-brand-muted">
                  <span>{insp.createdAt}</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-400 border border-rose-900/40 font-bold uppercase tracking-wider flex items-center gap-1">
                    📌 Pinterest
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* STANDARD GRID FOR ALL COLLECTIONS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspirations.map(insp => (
            <InspirationCard
              key={insp.id}
              inspiration={insp}
              onToggleFavorite={onToggleFavorite}
              onViewInspiration={onViewInspiration}
            />
          ))}
        </div>
      )}

      {/* Watch Video Modal */}
      <AnimatePresence>
        {activeWatchVideoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111217] border border-[#23242B] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#23242B] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#4F8CFF] font-bold uppercase">LIVE WATCH MODE</span>
                  <h3 className="font-display font-normal text-xl text-white uppercase tracking-wide truncate max-w-md sm:max-w-xl">
                    {activeWatchVideoTitle}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setActiveWatchVideoId(null);
                    setActiveWatchVideoTitle("");
                  }}
                  className="text-brand-muted hover:text-white p-2 rounded-xl border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Player Body */}
              <div className="p-6 bg-[#09090B]">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#23242B] shadow-inner">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${activeWatchVideoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#111217] border-t border-[#23242B] text-center text-[10px] font-mono text-brand-muted">
                DEEP CREATIVE RETENTION FLOW BLUEPRINT ANALYSIS CORRELATED
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
