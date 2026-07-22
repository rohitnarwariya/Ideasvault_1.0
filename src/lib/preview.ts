/**
 * Client-side preview image resolution and caching service for IdeaVault
 */

const PREVIEW_CACHE_KEY_PREFIX = "ideavault_img_cache_";

export function getInstantPreviewImage(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const targetUrl = url.trim();

  // 1. Direct Image URLs
  if (/\.(jpeg|jpg|gif|png|webp|avif)(\?.*)?$/i.test(targetUrl)) {
    return targetUrl;
  }

  // 2. YouTube Video Thumbnails
  const youtubeMatch = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // 3. GitHub Repositories
  const githubMatch = targetUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
  if (githubMatch && githubMatch[1] && githubMatch[2]) {
    const owner = githubMatch[1];
    const repo = githubMatch[2].replace(/\.git$/i, "");
    if (!["topics", "features", "pricing", "marketplace", "settings", "explore"].includes(owner.toLowerCase())) {
      return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
    }
  }

  return null;
}

export async function fetchPreviewImage(url: string): Promise<string | null> {
  if (!url || typeof url !== "string") return null;
  const targetUrl = url.trim();

  // Check instant resolution first
  const instant = getInstantPreviewImage(targetUrl);
  if (instant) return instant;

  // Check Local Cache
  const cacheKey = `${PREVIEW_CACHE_KEY_PREFIX}${encodeURIComponent(targetUrl)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      if (cached === "__NONE__") return null;
      return cached;
    }
  } catch (e) {
    // LocalStorage quota or restricted
  }

  // Fetch from API
  try {
    const response = await fetch("/api/preview-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetUrl }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.success && data.previewImage) {
      try {
        localStorage.setItem(cacheKey, data.previewImage);
      } catch (e) {}
      return data.previewImage;
    } else {
      try {
        localStorage.setItem(cacheKey, "__NONE__");
      } catch (e) {}
    }
  } catch (err) {
    console.warn("Failed to fetch preview image:", err);
  }

  return null;
}
