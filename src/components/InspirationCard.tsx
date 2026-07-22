import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Folder, Star, ArrowUpRight, Image as ImageIcon } from "lucide-react";
import { Inspiration } from "../types";
import { fetchPreviewImage } from "../lib/preview";

interface InspirationCardProps {
  key?: string;
  inspiration: Inspiration;
  onToggleFavorite: (id: string) => void;
  onViewInspiration: (insp: Inspiration) => void;
  onUpdateImage?: (id: string, imageUrl: string) => void;
}

// Helper to determine platform badge info
export function getPlatformInfo(platform: string, url: string) {
  const platUpper = (platform || "").toUpperCase();
  const urlLower = (url || "").toLowerCase();

  if (platUpper === "YOUTUBE" || urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
    return {
      label: "📹 YouTube",
      bgClass: "bg-red-950/25 text-red-400 border-red-900/40",
      aspectRatio: "aspect-video" // 16:9
    };
  }
  if (platUpper === "INSTAGRAM" || urlLower.includes("instagram.com") || urlLower.includes("instagr.am")) {
    return {
      label: "📸 Instagram",
      bgClass: "bg-purple-950/25 text-purple-400 border-purple-900/40",
      aspectRatio: "aspect-[4/5]"
    };
  }
  if (platUpper === "PINTEREST" || urlLower.includes("pinterest.com") || urlLower.includes("pin.it")) {
    return {
      label: "📌 Pinterest",
      bgClass: "bg-rose-950/25 text-rose-400 border-rose-900/40",
      aspectRatio: "aspect-[3/4]"
    };
  }
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
    return {
      label: "𝕏 X (Twitter)",
      bgClass: "bg-sky-950/25 text-sky-400 border-sky-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (platUpper === "REDDIT" || urlLower.includes("reddit.com") || urlLower.includes("redd.it")) {
    return {
      label: "👽 Reddit",
      bgClass: "bg-orange-950/25 text-orange-400 border-orange-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (platUpper === "LINKEDIN" || urlLower.includes("linkedin.com")) {
    return {
      label: "💼 LinkedIn",
      bgClass: "bg-blue-950/25 text-blue-400 border-blue-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("tiktok.com")) {
    return {
      label: "🎵 TikTok",
      bgClass: "bg-cyan-950/25 text-cyan-400 border-cyan-900/40",
      aspectRatio: "aspect-[9/16]"
    };
  }
  if (urlLower.includes("medium.com")) {
    return {
      label: "✍️ Medium",
      bgClass: "bg-emerald-950/25 text-emerald-400 border-emerald-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("behance.net")) {
    return {
      label: "🎨 Behance",
      bgClass: "bg-indigo-950/25 text-indigo-400 border-indigo-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("dribbble.com")) {
    return {
      label: "🏀 Dribbble",
      bgClass: "bg-pink-950/25 text-pink-400 border-pink-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (platUpper === "GITHUB" || urlLower.includes("github.com")) {
    return {
      label: "🐙 GitHub",
      bgClass: "bg-violet-950/25 text-violet-400 border-violet-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("producthunt.com")) {
    return {
      label: "🐱 Product Hunt",
      bgClass: "bg-amber-950/25 text-amber-400 border-amber-900/40",
      aspectRatio: "aspect-video"
    };
  }
  if (urlLower.includes("dev.to") || urlLower.includes("hashnode.com") || urlLower.includes("substack.com") || urlLower.includes("blog")) {
    return {
      label: "📰 Article",
      bgClass: "bg-teal-950/25 text-teal-400 border-teal-900/40",
      aspectRatio: "aspect-video"
    };
  }
  return {
    label: `🌐 ${platform || "Website"}`,
    bgClass: "bg-zinc-900/60 text-zinc-300 border-zinc-800",
    aspectRatio: "aspect-video"
  };
}

export default function InspirationCard({
  inspiration,
  onToggleFavorite,
  onViewInspiration,
  onUpdateImage
}: InspirationCardProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(inspiration.imageUrl);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(!inspiration.imageUrl && Boolean(inspiration.url));
  const [imageError, setImageError] = useState<boolean>(false);

  // Automatically fetch preview image if missing
  useEffect(() => {
    if (inspiration.imageUrl) {
      setImageUrl(inspiration.imageUrl);
      setIsLoadingImage(false);
      setImageError(false);
      return;
    }

    if (inspiration.url) {
      setIsLoadingImage(true);
      fetchPreviewImage(inspiration.url)
        .then(fetchedImg => {
          setIsLoadingImage(false);
          if (fetchedImg) {
            setImageUrl(fetchedImg);
            setImageError(false);
            if (onUpdateImage) {
              onUpdateImage(inspiration.id, fetchedImg);
            }
          } else {
            setImageError(true);
          }
        })
        .catch(() => {
          setIsLoadingImage(false);
          setImageError(true);
        });
    } else {
      setIsLoadingImage(false);
      setImageError(true);
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
      className="bg-[#111217] rounded-3xl border border-[#23242B] hover:border-[#3a3b45] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer group shadow-lg"
      onClick={() => onViewInspiration(inspiration)}
    >
      {/* 1. Preview Image Container */}
      {isLoadingImage ? (
        <div className="w-full h-48 bg-[#1a1b22] animate-pulse border-b border-[#23242B]/40 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-brand-muted/30 animate-pulse" />
        </div>
      ) : imageUrl && !imageError ? (
        <div className="w-full h-48 overflow-hidden border-b border-[#23242B]/40 relative bg-[#09090B]">
          <img
            loading="lazy"
            referrerPolicy="no-referrer"
            src={imageUrl}
            alt={inspiration.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        </div>
      ) : null}

      {/* 2. Main Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Platform Badge & Saved Date */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono border uppercase tracking-wider font-semibold ${platformInfo.bgClass}`}>
              {platformInfo.label}
            </span>

            <span className="text-[10px] font-mono text-brand-muted/70">
              {inspiration.createdAt}
            </span>
          </div>

          {/* User Title (ALWAYS preserved) */}
          <h3 className="font-sans font-bold text-lg md:text-xl text-white group-hover:text-[#4F8CFF] transition-colors leading-snug line-clamp-2">
            {inspiration.title}
          </h3>

          {/* User Description (ALWAYS preserved) */}
          {(inspiration.notes || inspiration.voiceTranscript) && (
            <p className="mt-3 text-xs text-brand-muted/90 line-clamp-3 leading-relaxed font-sans">
              {inspiration.notes || inspiration.voiceTranscript}
            </p>
          )}

          {/* Optional Tags */}
          {inspiration.tags && inspiration.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {inspiration.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[9px] font-mono bg-[#09090B]/60 px-2.5 py-0.5 rounded text-brand-muted border border-[#23242B]/40"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Footer Section */}
      <div className="px-6 py-3.5 bg-[#09090B]/40 border-t border-[#23242B]/40 flex items-center justify-between text-[10px] font-mono text-brand-muted">
        {/* Collection / Board */}
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#4F8CFF] truncate max-w-[140px]">
          <Folder className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{inspiration.board.replace(/[^\w\s]/g, "").trim()}</span>
        </span>

        <div className="flex items-center gap-3">
          {/* Favorite Star Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(inspiration.id);
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              inspiration.isFavorite
                ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-500"
                : "bg-[#09090B] border-[#23242B] text-brand-muted hover:text-white"
            }`}
            title={inspiration.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-3.5 h-3.5 ${inspiration.isFavorite ? "fill-yellow-500" : ""}`} />
          </button>

          {/* Open Reference Link */}
          {inspiration.url && (
            <a
              href={inspiration.url}
              target="_blank"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg border border-[#23242B] bg-[#09090B] text-brand-muted hover:text-[#4F8CFF] hover:border-[#4F8CFF]/40 transition-colors"
              title="Open source URL"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
