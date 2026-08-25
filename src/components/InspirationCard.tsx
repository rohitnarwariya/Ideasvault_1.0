import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Folder, Star, ArrowUpRight, Image as ImageIcon, Instagram, Youtube, Globe, Pin, FileText, Code2, Music, Linkedin } from "lucide-react";
import { Inspiration } from "../types";
import { fetchPreviewImage } from "../lib/preview";

interface InspirationCardProps {
  key?: string;
  inspiration: Inspiration;
  onToggleFavorite: (id: string) => void;
  onViewInspiration: (insp: Inspiration) => void;
  onUpdateImage?: (id: string, imageUrl: string) => void;
}

export const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000&auto=format&fit=crop";

export function isInvalidOrInstagramPlaceholder(url?: string | null): boolean {
  if (!url || typeof url !== "string" || url.trim() === "") return true;
  const lower = url.toLowerCase().trim();
  if (
    lower.includes("instagram.com/static") ||
    lower.includes("static.cdninstagram.com") ||
    lower.includes("instagram.com/rsrc.php") ||
    lower.includes("netflix") ||
    lower.includes("favicon") ||
    (lower.includes("instagram") && (lower.includes("logo") || lower.includes("glyph") || lower.includes("icon") || lower.includes("brand") || lower.includes("assets") || lower.includes("null")))
  ) {
    return true;
  }
  return false;
}

// Helper to determine platform badge info
export function getPlatformInfo(platform: string, url: string) {
  const platUpper = (platform || "").toUpperCase();
  const urlLower = (url || "").toLowerCase();

  if (platUpper === "YOUTUBE" || urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
    return {
      label: "YOUTUBE",
      iconType: "youtube",
      emoji: "📹",
      bgClass: "bg-red-950/30 text-red-400 border-red-900/40",
      aspectRatio: "aspect-video" // 16:9
    };
  }
  if (platUpper === "INSTAGRAM" || urlLower.includes("instagram.com") || urlLower.includes("instagr.am")) {
    return {
      label: "INSTAGRAM",
      iconType: "instagram",
      emoji: "📸",
      bgClass: "bg-purple-950/30 text-purple-400 border-purple-900/40",
      aspectRatio: "aspect-[4/5]"
    };
  }
  if (platUpper === "PINTEREST" || urlLower.includes("pinterest.com") || urlLower.includes("pin.it")) {
    return {
      label: "PINTEREST",
      iconType: "pinterest",
      emoji: "📌",
      bgClass: "bg-rose-950/30 text-rose-400 border-rose-900/40",
      aspectRatio: "aspect-[3/4]"
    };
  }
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
    return {
      label: "X (TWITTER)",
      iconType: "x",
      emoji: "𝕏",
      bgClass: "bg-sky-950/30 text-sky-400 border-sky-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (platUpper === "REDDIT" || urlLower.includes("reddit.com") || urlLower.includes("redd.it")) {
    return {
      label: "REDDIT",
      iconType: "reddit",
      emoji: "👽",
      bgClass: "bg-orange-950/30 text-orange-400 border-orange-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (platUpper === "LINKEDIN" || urlLower.includes("linkedin.com")) {
    return {
      label: "LINKEDIN",
      iconType: "linkedin",
      emoji: "💼",
      bgClass: "bg-blue-950/30 text-blue-400 border-blue-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("tiktok.com")) {
    return {
      label: "TIKTOK",
      iconType: "tiktok",
      emoji: "🎵",
      bgClass: "bg-cyan-950/30 text-cyan-400 border-cyan-900/40",
      aspectRatio: "aspect-[9/16]"
    };
  }
  if (urlLower.includes("medium.com")) {
    return {
      label: "MEDIUM",
      iconType: "article",
      emoji: "✍️",
      bgClass: "bg-emerald-950/30 text-emerald-400 border-emerald-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("github.com") || platUpper === "GITHUB") {
    return {
      label: "GITHUB",
      iconType: "github",
      emoji: "🐙",
      bgClass: "bg-violet-950/30 text-violet-400 border-violet-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("dev.to") || urlLower.includes("hashnode.com") || urlLower.includes("substack.com") || urlLower.includes("blog")) {
    return {
      label: "ARTICLE",
      iconType: "article",
      emoji: "📰",
      bgClass: "bg-teal-950/30 text-teal-400 border-teal-900/40",
      aspectRatio: "aspect-video"
    };
  }
  return {
    label: (platform || "WEBSITE").toUpperCase(),
    iconType: "website",
    emoji: "🌐",
    bgClass: "bg-zinc-900/80 text-zinc-300 border-zinc-800",
    aspectRatio: "aspect-video"
  };
}

function PlatformBadgeIcon({ iconType, emoji }: { iconType: string; emoji: string }) {
  switch (iconType) {
    case "instagram":
      return <Instagram className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    case "youtube":
      return <Youtube className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    case "pinterest":
      return <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    case "website":
      return <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    case "github":
      return <Code2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    case "tiktok":
      return <Music className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    case "linkedin":
      return <Linkedin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    case "article":
      return <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />;
    default:
      return <span className="text-[10px] leading-none">{emoji}</span>;
  }
}

export default function InspirationCard({
  inspiration,
  onToggleFavorite,
  onViewInspiration,
  onUpdateImage
}: InspirationCardProps) {
  const initialValid = inspiration.imageUrl && !isInvalidOrInstagramPlaceholder(inspiration.imageUrl)
    ? inspiration.imageUrl
    : null;

  const [imageUrl, setImageUrl] = useState<string>(initialValid || DEFAULT_FALLBACK_IMAGE);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(!initialValid && Boolean(inspiration.url));

  // Automatically fetch preview image if missing
  useEffect(() => {
    const raw = inspiration.imageUrl;
    if (raw && !isInvalidOrInstagramPlaceholder(raw)) {
      setImageUrl(raw);
      setIsLoadingImage(false);
      return;
    }

    if (inspiration.url) {
      setIsLoadingImage(true);
      fetchPreviewImage(inspiration.url)
        .then(fetchedImg => {
          setIsLoadingImage(false);
          if (fetchedImg && !isInvalidOrInstagramPlaceholder(fetchedImg)) {
            setImageUrl(fetchedImg);
            if (onUpdateImage) {
              onUpdateImage(inspiration.id, fetchedImg);
            }
          } else {
            setImageUrl(DEFAULT_FALLBACK_IMAGE);
          }
        })
        .catch(() => {
          setIsLoadingImage(false);
          setImageUrl(DEFAULT_FALLBACK_IMAGE);
        });
    } else {
      setIsLoadingImage(false);
      setImageUrl(DEFAULT_FALLBACK_IMAGE);
    }
  }, [inspiration.id, inspiration.imageUrl, inspiration.url]);

  const platformInfo = getPlatformInfo(inspiration.platform, inspiration.url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-[#111217] rounded-2xl md:rounded-3xl border border-[#23242B] hover:border-[#3a3b45] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer group shadow-lg"
      onClick={() => onViewInspiration(inspiration)}
    >
      {/* 1. Preview Image / Thumbnail (Proportional 16:10) */}
      <div className="w-full aspect-[16/10] overflow-hidden relative bg-[#09090B] border-b border-[#23242B]/40 shrink-0">
        {isLoadingImage ? (
          <div className="w-full h-full bg-[#1a1b22] animate-pulse flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-brand-muted/30 animate-pulse" />
          </div>
        ) : (
          <img
            loading="lazy"
            referrerPolicy="no-referrer"
            src={imageUrl || DEFAULT_FALLBACK_IMAGE}
            alt={inspiration.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              if (imageUrl !== DEFAULT_FALLBACK_IMAGE) {
                setImageUrl(DEFAULT_FALLBACK_IMAGE);
              }
              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        )}
      </div>

      {/* 2. Main Card Content Area (Compact, Clean, No Long Description Block) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Row 1: Platform Badge & Saved Date */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
            <span className={`px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-mono border uppercase tracking-wider font-bold flex items-center gap-1 shrink-0 ${platformInfo.bgClass}`}>
              <PlatformBadgeIcon iconType={platformInfo.iconType} emoji={platformInfo.emoji} />
              <span className="truncate max-w-[70px] sm:max-w-none">{platformInfo.label}</span>
            </span>

            <span className="text-[8px] sm:text-[9px] font-mono text-brand-muted/70 truncate">
              {inspiration.createdAt}
            </span>
          </div>

          {/* Row 2: Title */}
          <h3 className="font-sans font-bold text-xs sm:text-[13px] text-white group-hover:text-[#4F8CFF] transition-colors leading-snug line-clamp-2">
            {inspiration.title}
          </h3>
        </div>

        {/* Row 3: Tags + Mobile Actions */}
        <div className="mt-2 pt-1.5 flex items-center justify-between gap-1.5">
          {/* Tags */}
          <div className="flex items-center gap-1 flex-wrap overflow-hidden max-h-5">
            {inspiration.tags && inspiration.tags.length > 0 ? (
              inspiration.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="text-[8px] font-mono bg-[#09090B] px-1.5 py-0.5 rounded text-brand-muted border border-[#23242B]/60 truncate max-w-[65px] sm:max-w-[85px]"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-[8px] font-mono text-brand-muted/40">
                #{inspiration.board.replace(/[^\w\s]/g, "").trim().split(" ")[0] || "Idea"}
              </span>
            )}
          </div>

          {/* Mobile Favorite Trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(inspiration.id);
              }}
              className={`p-1 rounded-md border transition-all cursor-pointer ${
                inspiration.isFavorite
                  ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-500"
                  : "bg-[#09090B] border-[#23242B] text-brand-muted hover:text-white"
              }`}
              title={inspiration.isFavorite ? "Favorited" : "Favorite"}
            >
              <Star className={`w-2.5 h-2.5 ${inspiration.isFavorite ? "fill-yellow-500" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Desktop Bottom Footer Section */}
      <div className="hidden md:flex px-3 py-1.5 bg-[#09090B]/50 border-t border-[#23242B]/40 items-center justify-between text-[9px] font-mono text-brand-muted">
        {/* Collection / Board */}
        <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[#4F8CFF] truncate max-w-[120px]">
          <Folder className="w-3 h-3 shrink-0" />
          <span className="truncate">{inspiration.board.replace(/[^\w\s]/g, "").trim()}</span>
        </span>

        <div className="flex items-center gap-1">
          {/* Favorite Star Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(inspiration.id);
            }}
            className={`p-1 rounded-md border transition-all cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center ${
              inspiration.isFavorite
                ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-500"
                : "bg-[#09090B] border-[#23242B] text-brand-muted hover:text-white"
            }`}
            title={inspiration.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-2.5 h-2.5 ${inspiration.isFavorite ? "fill-yellow-500" : ""}`} />
          </button>

          {/* Open Reference Link */}
          {inspiration.url && (
            <a
              href={inspiration.url}
              target="_blank"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md border border-[#23242B] bg-[#09090B] text-brand-muted hover:text-[#4F8CFF] hover:border-[#4F8CFF]/40 transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
              title="Open source URL"
            >
              <ArrowUpRight className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
