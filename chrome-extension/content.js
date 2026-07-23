// IdeaVault Chrome Extension Content Script
// Extracts high-quality page metadata and platform-specific assets

function extractPageMetadata() {
  const url = window.location.href;
  const lowerUrl = url.toLowerCase();

  let platform = "OTHER";
  let title = document.title || "";
  let imageUrl = "";
  let favicon = "";
  let channelName = "";
  let duration = "";

  // Helper: Find meta property or name content
  const getMeta = (names) => {
    for (const name of names) {
      const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"], meta[itemprop="${name}"]`);
      if (el && el.getAttribute("content")) {
        return el.getAttribute("content").trim();
      }
    }
    return null;
  };

  // Extract Favicon
  const faviconEl = document.querySelector(`link[rel*="icon"], link[rel="shortcut icon"]`);
  if (faviconEl && faviconEl.getAttribute("href")) {
    favicon = faviconEl.getAttribute("href");
    if (favicon.startsWith("/")) {
      favicon = `${window.location.origin}${favicon}`;
    }
  } else {
    favicon = `${window.location.origin}/favicon.ico`;
  }

  // 1. YouTube Platform Extractor
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    platform = "YOUTUBE";
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else {
      imageUrl = getMeta(["og:image", "twitter:image"]) || "";
    }

    // Extract YouTube channel name
    const channelEl = document.querySelector("#channel-name a, [itemprop='author'] [itemprop='name'], #owner-name a");
    if (channelEl) {
      channelName = channelEl.textContent.trim();
    }

    // Extract YouTube duration
    const durationEl = document.querySelector(".ytp-time-duration");
    if (durationEl) {
      duration = durationEl.textContent.trim();
    }

    // Clean YouTube page title (remove " - YouTube")
    title = title.replace(/\s*-\s*YouTube$/i, "").trim();
  }

  // 2. Pinterest Platform Extractor
  else if (lowerUrl.includes("pinterest.com") || lowerUrl.includes("pin.it")) {
    platform = "PINTEREST";
    // Rule: Capture Pin image, Pin URL, Pin thumbnail.
    // NEVER use Pinterest title or description.
    imageUrl = getMeta(["og:image", "pinterest:image", "twitter:image"]) || "";
    
    if (!imageUrl) {
      const pinImg = document.querySelector('img[src*="pinimg.com/564x/"], img[src*="pinimg.com/736x/"], img[src*="pinimg.com/originals/"]');
      if (pinImg) {
        imageUrl = pinImg.src;
      }
    }

    // Clear title so user enters custom title according to requirements
    title = "";
  }

  // 3. Instagram Platform Extractor
  else if (lowerUrl.includes("instagram.com")) {
    platform = "INSTAGRAM";
    imageUrl = getMeta(["og:image", "twitter:image"]) || "";
    if (!imageUrl) {
      const mainImg = document.querySelector('article img[srcset], main img[srcset], video[poster]');
      if (mainImg) {
        imageUrl = mainImg.getAttribute("poster") || mainImg.getAttribute("src") || "";
      }
    }
    // Clean Instagram title
    title = title.replace(/\s*•\s*Instagram.*$/i, "").trim();
  }

  // 4. X (Twitter) Platform Extractor
  else if (lowerUrl.includes("x.com") || lowerUrl.includes("twitter.com")) {
    platform = "X";
    imageUrl = getMeta(["og:image", "twitter:image"]) || "";
    title = title.replace(/\s*\/\s*X$/i, "").replace(/\s*on Twitter.*$/i, "").trim();
  }

  // 5. Reddit Platform Extractor
  else if (lowerUrl.includes("reddit.com")) {
    platform = "REDDIT";
    imageUrl = getMeta(["og:image", "twitter:image"]) || "";
    title = title.replace(/\s*:\s*r\/.*$/i, "").trim();
  }

  // 6. LinkedIn Platform Extractor
  else if (lowerUrl.includes("linkedin.com")) {
    platform = "LINKEDIN";
    imageUrl = getMeta(["og:image", "twitter:image"]) || "";
    title = title.replace(/\s*\|\s*LinkedIn$/i, "").trim();
  }

  // 7. GitHub Platform Extractor
  else if (lowerUrl.includes("github.com")) {
    platform = "GITHUB";
    imageUrl = getMeta(["og:image", "twitter:image"]) || "";
  }

  // 8. Other Websites
  else {
    platform = "WEBSITE";
    imageUrl = getMeta(["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]) || "";
    
    if (!imageUrl) {
      // Find main image in article or main tag
      const mainImg = document.querySelector("article img, main img, body img");
      if (mainImg && mainImg.src && !mainImg.src.endsWith(".svg") && !mainImg.src.includes("data:image")) {
        imageUrl = mainImg.src;
      }
    }
  }

  return {
    url,
    title,
    imageUrl,
    favicon,
    platform,
    channelName,
    duration,
    savedDate: new Date().toISOString()
  };
}

// Message Listener for Popup requests
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request && request.type === "EXTRACT_METADATA") {
      const metadata = extractPageMetadata();
      sendResponse({ success: true, metadata });
    }
    return true;
  });
}

