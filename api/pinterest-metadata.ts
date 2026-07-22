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

    // Fetch page with standard browser headers to bypass simple bot blocks
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return res.status(200).json({ success: false, message: "Failed to fetch page" });
    }

    const html = await response.text();

    // Helper regex to extract OG or twitter meta tags
    const getMeta = (propertyNames: string[]): string | null => {
      for (const name of propertyNames) {
        // match property="og:..." content="..." or content="..." property="og:..."
        const regex1 = new RegExp(`<meta\\s+[^>]*?(?:property|name)=["']${name}["']\\s+[^>]*?content=["']([^"']+)["']`, 'i');
        const regex2 = new RegExp(`<meta\\s+[^>]*?content=["']([^"']+)["']\\s+[^>]*?(?:property|name)=["']${name}["']`, 'i');
        
        const m1 = html.match(regex1);
        if (m1 && m1[1]) return m1[1];
        const m2 = html.match(regex2);
        if (m2 && m2[1]) return m2[1];
      }
      return null;
    };

    // Extract title tag fallback
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : null;

    // Pinterest specific meta tag extraction
    let image = getMeta([
      "og:image",
      "og:image:secure_url",
      "twitter:image",
      "twitter:image:src",
      "pinterest:image"
    ]);

    let title = getMeta([
      "og:title",
      "twitter:title",
      "pinterest:title"
    ]) || pageTitle;

    let description = getMeta([
      "og:description",
      "twitter:description",
      "description"
    ]);

    let siteUrl = getMeta([
      "og:see_also",
      "og:url",
      "pinterest:url"
    ]) || response.url || targetUrl;

    // Clean up title (remove " | Pinterest", " - Pinterest", etc if present)
    if (title) {
      title = title.replace(/\s*[|\-–—]\s*Pinterest$/i, "").trim();
      title = title.replace(/^Pinterest\s*[|\-–—]\s*/i, "").trim();
    }

    // Clean up description
    if (description) {
      description = description.replace(/\s*[|\-–—]\s*Pinterest$/i, "").trim();
    }

    return res.status(200).json({
      success: true,
      previewImage: image || null,
      title: title || null,
      description: description || null,
      websiteUrl: siteUrl || targetUrl,
    });
  } catch (err: any) {
    console.warn("Pinterest OG metadata fetch error:", err.message);
    return res.status(200).json({
      success: false,
      error: err.message,
    });
  }
}
