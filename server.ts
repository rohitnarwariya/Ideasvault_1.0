import express from "express";
import path from "path";
import dotenv from "dotenv";
import transcribeHandler from "./api/transcribe";
import analyzeHandler from "./api/analyze";
import pinterestMetadataHandler from "./api/pinterest-metadata";
import previewImageHandler from "./api/preview-image";
import extensionAuthHandler from "./api/extension/auth";
import extensionCollectionsHandler from "./api/extension/collections";
import extensionSaveHandler from "./api/extension/save";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Enable CORS for Chrome Extension origins
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const PORT = 3000;

// Mount serverless function handlers as Express routes for local development
app.post("/api/transcribe", transcribeHandler);
app.post("/api/analyze", analyzeHandler);
app.post("/api/pinterest-metadata", pinterestMetadataHandler);
app.post("/api/preview-image", previewImageHandler);

// Extension routes
app.post("/api/extension/auth", extensionAuthHandler);
app.get("/api/extension/collections", extensionCollectionsHandler);
app.post("/api/extension/collections", extensionCollectionsHandler);
app.post("/api/extension/save", extensionSaveHandler);

// Serve frontend assets in production / development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IdeaVault full-stack server running on http://localhost:${PORT}`);
  });
}

setupVite();
