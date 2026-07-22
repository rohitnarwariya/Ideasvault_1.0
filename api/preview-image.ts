import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    // 1. YouTube instant extraction
    const youtubeMatch = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];
      // Check if maxresdefault exists via HEAD request or return maxresdefault with hqdefault fallback
      const maxresUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      try {
        const headRes = await fetch(maxresUrl, { method: "HEAD" });
        if (headRes.ok) {
          return res.status(200).json({ success: true, previewImage: maxresUrl });
        }
      } catch (e) {
        // Fallback
      }
      return res.status(200).json({
        success: true,
        previewImage: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      });
    }

    // 2. GitHub instant extraction
    const githubMatch = targetUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (githubMatch && githubMatch[1] && githubMatch[2]) {
      const owner = githubMatch[1];
      const repo = githubMatch[2].replace(/\.git$/i, "");
      if (owner !== "topics" && owner !== "features" && owner !== "pricing") {
        return res.status(200).json({
          success: true,
          previewImage: `https://opengraph.githubassets.com/1/${owner}/${repo}`
        });
      }
    }

    // 3. Fetch HTML page to parse Open Graph & Twitter Card images
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return res.status(200).json({ success: false, previewImage: null, message: "Page response not OK" });
    }

    const html = await response.text();

    const getMetaContent = (names: string[]): string | null => {
      for (const name of names) {
        // Escaped regex search for meta tags
        const regex1 = new RegExp(`<meta\\s+[^>]*?(?:property|name|itemprop)=["']${name}["']\\s+[^>]*?content=["']([^"']+)["']`, 'i');
        const regex2 = new RegExp(`<meta\\s+[^>]*?content=["']([^"']+)["']\\s+[^>]*?(?:property|name|itemprop)=["']${name}["']`, 'i');
        
        const m1 = html.match(regex1);
        if (m1 && m1[1]) return m1[1];
        const m2 = html.match(regex2);
        if (m2 && m2[1]) return m2[1];
      }
      return null;
    };

    let rawImg = getMetaContent([
      "og:image",
      "og:image:secure_url",
      "og:image:url",
      "twitter:image",
      "twitter:image:src",
      "pinterest:image",
      "image",
    ]);

    // Fallback: check link rel="image_src"
    if (!rawImg) {
      const linkMatch = html.match(/<link\s+[^>]*?rel=["'](?:image_src|shortcut icon)["']\s+[^>]*?href=["']([^"']+)["']/i);
      if (linkMatch && linkMatch[1]) {
        rawImg = linkMatch[1];
      }
    }

    // Fallback: check prominent <img> tag inside <article> or <main>
    if (!rawImg) {
      const imgMatch = html.match(/<(?:article|main)[^>]*>[\s\S]*?<img\s+[^>]*?src=["']([^"']+)["']/i) ||
                       html.match(/<img\s+[^>]*?src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1] && !imgMatch[1].endsWith(".svg") && !imgMatch[1].includes("icon")) {
        rawImg = imgMatch[1];
      }
    }

    if (!rawImg) {
      return res.status(200).json({ success: false, previewImage: null });
    }

    // Resolve relative image URLs
    let resolvedImage = rawImg.trim();
    if (resolvedImage.startsWith("//")) {
      resolvedImage = `https:${resolvedImage}`;
    } else if (resolvedImage.startsWith("/")) {
      try {
        const parsedBase = new URL(targetUrl);
        resolvedImage = `${parsedBase.origin}${resolvedImage}`;
      } catch (e) {
        // keep raw
      }
    } else if (!resolvedImage.startsWith("http://") && !resolvedImage.startsWith("https://")) {
      try {
        resolvedImage = new URL(resolvedImage, targetUrl).href;
      } catch (e) {
        // keep raw
      }
    }

    return res.status(200).json({
      success: true,
      previewImage: resolvedImage,
    });

  } catch (err: any) {
    console.warn("Preview image fetch error:", err.message);
    return res.status(200).json({
      success: false,
      previewImage: null,
      error: err.message,
    });
  }
}
