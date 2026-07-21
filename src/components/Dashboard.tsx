import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Star, Folder, ExternalLink, Sparkles, Filter, Plus, Trash2, 
  ChevronRight, ArrowUpRight, Grid, HelpCircle, Key, Lock, Play, X, Lightbulb, Bookmark 
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

      {/* Grid List */}
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
              className="bg-[#111217] rounded-3xl border border-[#23242B] hover:border-[#3a3b45] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer"
              onClick={() => onViewInspiration(insp)}
            >
              {/* Optional Thumbnail: Only show an image if the user actually uploaded one */}
              {insp.imageUrl && (
                <div className="h-44 overflow-hidden border-b border-[#23242B]/30 relative">
                  <img 
                    referrerPolicy="no-referrer" 
                    src={insp.imageUrl} 
                    className="w-full h-full object-cover" 
                    alt="Inspiration reference" 
                  />
                </div>
              )}

              {/* Main Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Platform Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono border uppercase tracking-wider font-semibold ${
                      insp.platform === "YOUTUBE" ? "bg-red-950/20 text-red-400 border-red-900/30" :
                      insp.platform === "INSTAGRAM" ? "bg-purple-950/20 text-purple-400 border-purple-900/30" :
                      insp.platform === "PINTEREST" ? "bg-rose-950/20 text-rose-400 border-rose-900/30" :
                      insp.platform === "WEBSITE" ? "bg-teal-950/20 text-teal-400 border-teal-900/30" :
                      "bg-zinc-950/20 text-zinc-400 border-zinc-900/30"
                    }`}>
                      {insp.platform === "PINTEREST" ? "📌 Pinterest" :
                       insp.platform === "INSTAGRAM" ? "📸 Instagram" :
                       insp.platform === "YOUTUBE" ? "📹 YouTube" :
                       `🌐 ${insp.platform}`}
                    </span>

                    {/* Small saved date */}
                    <span className="text-[10px] font-mono text-brand-muted/70">{insp.createdAt}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-sans font-bold text-xl text-white group-hover:text-[#4F8CFF] transition-colors leading-tight line-clamp-2">
                    {insp.title}
                  </h3>

                  {/* Description: Why I saved this */}
                  {(insp.notes || insp.voiceTranscript) && (
                    <p className="mt-4 text-xs text-brand-muted/90 line-clamp-3 leading-relaxed font-sans">
                      {insp.notes || insp.voiceTranscript}
                    </p>
                  )}

                  {/* Tags */}
                  {insp.tags && insp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {insp.tags.map(t => (
                        <span key={t} className="text-[9px] font-mono bg-[#09090B]/60 px-2.5 py-0.5 rounded text-brand-muted border border-[#23242B]/30">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Footer Section */}
              <div className="px-6 py-4 bg-[#09090B]/20 border-t border-[#23242B]/30 flex items-center justify-between text-[10px] font-mono text-brand-muted">
                {/* Collection / Board */}
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#4F8CFF]">
                  <Folder className="w-3.5 h-3.5" /> {insp.board.replace(/[^\w\s]/g, "").trim()}
                </span>

                <div className="flex items-center gap-4">
                  {/* Favorite Toggle at Bottom */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(insp.id);
                    }}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      insp.isFavorite 
                        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" 
                        : "bg-[#09090B] border-[#23242B]/80 text-brand-muted hover:text-white"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${insp.isFavorite ? "fill-yellow-500" : ""}`} />
                  </button>

                  {/* Visit Source Icon */}
                  {insp.url && (
                    <a 
                      href={insp.url} 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-[#23242B]/80 bg-[#09090B] text-brand-muted hover:text-[#4F8CFF] hover:border-[#4F8CFF]/30 transition-colors"
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
