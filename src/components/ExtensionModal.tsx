import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Download, Chrome, CheckCircle2, Copy, Sparkles, Mic, Pin, 
  ExternalLink, Layers, ArrowRight, ShieldCheck 
} from "lucide-react";

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtensionModal({ isOpen, onClose }: ExtensionModalProps) {
  const [copiedPath, setCopiedPath] = useState(false);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText("/chrome-extension");
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-[#111217] border border-[#23242B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#23242B] bg-[#09090B]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-[#4F8CFF]/20">
                <Chrome className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  IdeaVault Chrome Extension
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/30 uppercase tracking-wider">
                    Manifest V3
                  </span>
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Save web inspiration, YouTube videos, and voice memos directly from Chrome
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#23242B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#A1A1AA]">
            {/* Primary Action CTA */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#4F8CFF]/10 via-[#8B5CF6]/10 to-transparent border border-[#4F8CFF]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-semibold text-base mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#4F8CFF]" />
                  Ready to Install
                </h4>
                <p className="text-xs text-[#A1A1AA]">
                  Download the extension package or load directly from project source.
                </p>
              </div>

              <a
                href="/ideavault-extension.zip"
                download="ideavault-extension.zip"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4F8CFF] hover:bg-[#3b76e6] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4F8CFF]/25 transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Extension (.zip)
              </a>
            </div>

            {/* Quick Install Guide */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                How to Install in Google Chrome
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#23242B] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#23242B] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <p className="text-white font-medium text-xs mb-0.5">Download or locate folder</p>
                    <p className="text-xs text-zinc-400">
                      Unzip <code className="text-[#4F8CFF] font-mono">ideavault-extension.zip</code> or use the <code className="text-white font-mono">/chrome-extension</code> workspace directory.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#23242B] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#23242B] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <p className="text-white font-medium text-xs mb-0.5">Open Chrome Extensions Manager</p>
                    <p className="text-xs text-zinc-400">
                      Navigate to <code className="text-[#4F8CFF] font-mono select-all">chrome://extensions</code> in your Chrome browser address bar.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#23242B] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#23242B] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <p className="text-white font-medium text-xs mb-0.5">Enable Developer Mode & Load Unpacked</p>
                    <p className="text-xs text-zinc-400">
                      Toggle <strong>Developer mode</strong> (top-right), click <strong>Load unpacked</strong>, and select the extension folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Breakdown */}
            <div className="space-y-3 pt-2 border-t border-[#23242B]">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Extension Highlights
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#09090B]/60 border border-[#23242B] space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Pin className="w-3.5 h-3.5 text-red-400" />
                    Pinterest & Social
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Captures Pin images and video thumbnails automatically without cluttering title/description.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#09090B]/60 border border-[#23242B] space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    Voice Notes
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Record thoughts on the fly. Gemini transcribes and generates 3-6 word titles automatically.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#09090B]/60 border border-[#23242B] space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Smart Collections
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Detects domain automatically and routes to YouTube, Instagram, Pinterest, or custom folders.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#09090B]/60 border border-[#23242B] space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Single Auth
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Syncs seamlessly with your existing IdeaVault login session and Supabase tables.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#23242B] bg-[#09090B] flex items-center justify-between">
            <button
              onClick={handleCopyPath}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors font-mono"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedPath ? "Copied path to clipboard!" : "Copy local folder path: /chrome-extension"}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#181920] hover:bg-[#23242B] text-white text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
