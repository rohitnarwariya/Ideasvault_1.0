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

  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "title" | "favorites">("latest");
  const [showSortMenu, setShowSortMenu] = useState(false);

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
    { id: "all", name: "★ ALL" },
    { id: "all-videos", name: "📹 ALL VIDEOS" },
    ...boards
      .filter(b => b.id !== "all" && b.id !== "all-videos" && b.name !== "★ All" && b.name !== "📹 All Videos")
      .map(b => ({
        id: b.id,
        name: b.name.toUpperCase()
      }))
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

  // Filtered and sorted list based on active board, search query, and sort criteria
  const filteredInspirations = inspirations
    .filter(item => {
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
    })
    .sort((a, b) => {
      if (sortBy === "favorites") {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "oldest") {
        return (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0);
      }
      // default "latest"
      return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
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
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 md:py-8 relative z-10 text-white font-sans selection:bg-[#4F8CFF]/30 pb-28 md:pb-12">
      
      {/* 1. Title Block & Action Buttons (Hero Section) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-6 pb-3.5 sm:pb-5 border-b border-[#23242B] mb-3.5 sm:mb-5">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-wider text-white leading-none">
            INSPIRATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6]">VAULT</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-brand-muted mt-1.5 sm:mt-2 font-mono">
            Save. Remember. Create. — Deep AI Context Blueprints Active
          </p>
        </div>

        {/* Action Buttons: 2-column on mobile, inline on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <a
            href="/ideavault-extension.zip"
            download="ideavault-extension.zip"
            className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#111217] hover:bg-[#181920] border border-[#23242B] text-white font-sans font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider min-h-[42px]"
          >
            <Chrome className="w-4 h-4 text-[#4F8CFF] shrink-0" />
            <span className="truncate">EXTENSION</span>
          </a>

          <button
            onClick={onAddInspiration}
            className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider min-h-[42px]"
          >
            <span className="whitespace-nowrap">+ SAVE IDEA</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Filter Boards Strip */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          {navigationTabs.map(b => {
            const count = getBoardCount(b.id, b.name);
            const isActive = activeBoard === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onBoardChange(b.id)}
                className={`text-xs font-mono px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer shrink-0 min-h-[38px] ${
                  isActive 
                    ? "bg-gradient-to-r from-[#8B5CF6]/20 to-[#4F8CFF]/20 border-[#4F8CFF] text-white font-bold shadow-[0_0_15px_rgba(79,140,255,0.15)]" 
                    : "bg-[#111217] border-[#23242B] text-brand-muted hover:text-white hover:border-brand-muted/30 hover:bg-[#1a1b22]"
                }`}
              >
                <span className="uppercase tracking-wider whitespace-nowrap text-[11px] sm:text-xs">{b.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive ? "bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white" : "bg-[#09090B] text-brand-muted"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* New collection custom adder */}
          {isAddingBoard ? (
            <form onSubmit={handleCreateBoard} className="flex items-center gap-1.5 shrink-0">
              <input 
                type="text"
                required
                autoFocus
                placeholder="Collection..."
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="bg-[#09090B] text-xs text-white border border-[#4F8CFF]/60 px-3 py-2 rounded-xl focus:outline-none w-32 font-mono min-h-[38px]"
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-mono text-xs px-3 py-2 rounded-xl font-bold hover:opacity-95 cursor-pointer shadow-md min-h-[38px]"
              >
                Add
              </button>
              <button 
                type="button" 
                onClick={() => setIsAddingBoard(false)}
                className="text-xs text-brand-muted font-mono px-2 py-1 hover:text-white cursor-pointer min-h-[38px] flex items-center"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingBoard(true)}
              className="text-xs font-mono px-3.5 py-2 rounded-xl border border-[#23242B] border-dashed text-brand-muted hover:text-white hover:border-brand-muted/40 hover:bg-[#111217]/50 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[38px] whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> <span className="uppercase text-[11px] sm:text-xs">Collection</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Search Bar (Full width, placed below filters) */}
      <div className="relative mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search vault (e.g. Bauhaus, retention)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#111217] border border-[#23242B] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/50 transition-colors min-h-[42px]"
        />
        <Search className="absolute left-3.5 top-3 sm:top-3.5 w-4 h-4 text-brand-muted" />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-2 sm:top-2.5 text-[9px] font-mono text-brand-muted bg-[#09090B] px-2 py-1 rounded-lg hover:text-white border border-[#23242B] transition-colors cursor-pointer"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* 4. Idea Count & Sorting Controls Bar */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-[#23242B] text-[11px] font-mono text-brand-muted">
        <span>
          Showing {filteredInspirations.length} of {inspirations.length} items
        </span>

        {/* Sort Controls */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(prev => !prev)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-[#111217]"
          >
            <span className="capitalize">Sort: {sortBy === "latest" ? "Latest" : sortBy === "oldest" ? "Oldest" : sortBy === "favorites" ? "Favorites" : "Title"}</span>
            <span className="text-[9px]">▾</span>
          </button>

          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-[#111217] border border-[#23242B] rounded-xl shadow-xl z-30 py-1 overflow-hidden">
              {[
                { id: "latest", label: "Latest" },
                { id: "oldest", label: "Oldest" },
                { id: "favorites", label: "Favorites" },
                { id: "title", label: "Title (A-Z)" }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSortBy(item.id as any);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                    sortBy === item.id ? "text-[#4F8CFF] bg-[#4F8CFF]/10 font-bold" : "text-brand-muted hover:text-white hover:bg-[#1a1b22]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile 2-Column Grid & Desktop Responsive Gallery */}
      {filteredInspirations.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[#111217] border border-[#23242B] rounded-2xl py-12 px-6 sm:px-8 flex flex-col items-center justify-center text-center shadow-xl w-full max-w-xl mx-auto my-8"
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
        /* PINTEREST MASONRY (Columns on Desktop, 2-column Grid on Mobile) */
        <div className="grid grid-cols-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 md:gap-5 md:space-y-5 md:block">
          {filteredInspirations.map(insp => (
            <div key={insp.id} className="md:break-inside-avoid md:mb-5">
              <InspirationCard
                inspiration={insp}
                onToggleFavorite={onToggleFavorite}
                onViewInspiration={onViewInspiration}
              />
            </div>
          ))}
        </div>
      ) : (
        /* STANDARD 2-COLUMN MOBILE GRID / 3-4-5 COLUMN DESKTOP GRID */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4">
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
