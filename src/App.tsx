import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  INITIAL_BOARDS, 
  INITIAL_INSPIRATIONS 
} from "./data";
import { Inspiration, Board } from "./types";
import { supabase } from "./lib/supabase";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import AnalysisPage from "./components/AnalysisPage";
import SaveModal from "./components/SaveModal";
import { Lock, Sparkles, LogOut, ArrowRight, ShieldCheck, X } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard" | "analysis">("landing");
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [activeBoard, setActiveBoard] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  
  // Real Supabase Auth State
  const [user, setUser] = useState<{ id?: string; name: string; email: string; avatar: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper: Convert Base64 dataURL to Blob
  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Helper: Upload file to storage with dynamic cascading fallback
  const uploadToStorage = async (bucketName: string, filePath: string, fileData: Blob | File): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: true
        });
      if (error) {
        console.warn(`Upload to bucket "${bucketName}" failed:`, error.message);
        return null;
      }
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      console.warn(`Exception uploading to bucket "${bucketName}":`, err);
      return null;
    }
  };

  // Helper: Load collections and ideas from Supabase
  const loadUserData = async (userId: string) => {
    try {
      const { data: cols, error: colsErr } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId);

      if (colsErr) throw colsErr;

      const { data: ideaRows, error: ideasErr } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ideasErr) throw ideasErr;

      const mappedBoards: Board[] = (cols || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || undefined
      }));

      const mappedInspirations: Inspiration[] = (ideaRows || []).map((item: any) => {
        let notes = "";
        let tags = ["Aesthetics", "SaaS Layout"];
        let aiAnalysis = null;
        let isFavorite = false;
        let imageUrl = item.image_url || undefined;

        if (Array.isArray(item.ai_tags)) {
          tags = item.ai_tags;
        } else if (typeof item.ai_tags === 'string' && item.ai_tags) {
          try {
            const parsedTags = JSON.parse(item.ai_tags);
            tags = Array.isArray(parsedTags) ? parsedTags : item.ai_tags.split(',').map((t: string) => t.trim());
          } catch {
            tags = item.ai_tags.split(',').map((t: string) => t.trim());
          }
        }

        if (item.ai_summary) {
          try {
            const parsed = typeof item.ai_summary === 'string' ? JSON.parse(item.ai_summary) : item.ai_summary;
            if (parsed && typeof parsed === 'object') {
              notes = parsed.notes || "";
              if (parsed.aiAnalysis) aiAnalysis = parsed.aiAnalysis;
              if (parsed.isFavorite !== undefined) isFavorite = parsed.isFavorite;
              if (parsed.imageUrl) imageUrl = parsed.imageUrl;
              if (parsed.tags && Array.isArray(parsed.tags)) tags = parsed.tags;
            } else if (typeof item.ai_summary === 'string') {
              notes = item.ai_summary;
              aiAnalysis = {
                creativeInsight: item.ai_summary,
                whyItWorks: "Excellent architectural layout and color palette.",
                sequentialBlueprint: ["Examine card structure", "Incorporate glowing border elements"],
                howToAdapt: ["Apply balanced negative space to cards"]
              };
            }
          } catch {
            notes = item.ai_summary;
            aiAnalysis = {
              creativeInsight: item.ai_summary,
              whyItWorks: "Excellent architectural layout and color palette.",
              sequentialBlueprint: ["Examine card structure", "Incorporate glowing border elements"],
              howToAdapt: ["Apply balanced negative space to cards"]
            };
          }
        }

        if (!notes && item.voice_transcript) {
          notes = `[Voice Memo Transcript]: "${item.voice_transcript}"`;
        }

        return {
          id: item.id,
          title: item.title,
          url: item.url || "",
          notes: notes,
          tags: tags,
          platform: item.platform || "OTHER",
          board: mappedBoards.find(b => b.id === item.collection_id)?.name || "💡 Random Ideas",
          createdAt: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isFavorite: isFavorite,
          imageUrl: imageUrl,
          voiceUrl: item.voice_url || undefined,
          aiStatus: item.ai_status || "ready",
          aiAnalysis: aiAnalysis
        };
      });

      if (mappedBoards.length === 0) {
        setBoards(INITIAL_BOARDS);
      } else {
        setBoards(mappedBoards);
      }

      setInspirations(mappedInspirations);

    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Auth Session & State Monitoring
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        const u = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Creator",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        };
        setUser(u);
        loadUserData(session.user.id);
        setView("dashboard");
      } else {
        setInspirations(INITIAL_INSPIRATIONS);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        const u = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Creator",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        };
        setUser(u);
        loadUserData(session.user.id);
        setView("dashboard");
      } else {
        setUser(null);
        setInspirations(INITIAL_INSPIRATIONS);
        setBoards(INITIAL_BOARDS);
        setView("landing");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setShowAuthModal(false);
        setView("dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              name: authEmail.split("@")[0]
            }
          }
        });
        if (error) throw error;
        if (data.session) {
          setShowAuthModal(false);
          setView("dashboard");
        } else {
          setAuthError("Sign up successful! Please check your email inbox to verify your account.");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setAuthError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStartFree = () => {
    if (user) {
      setView("dashboard");
    } else {
      setAuthMode("signup");
      setAuthError(null);
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("landing");
  };

  // Add new folder collection board
  const handleAddNewBoard = async (boardName: string) => {
    if (!user) return;
    const cleanName = boardName.startsWith("💡") ? boardName : `💡 ${boardName}`;
    const newCollId = crypto.randomUUID();
    const newBoard: Board = {
      id: newCollId,
      name: cleanName
    };
    setBoards(prev => [...prev, newBoard]);

    const { error } = await supabase
      .from('collections')
      .insert({
        id: newCollId,
        name: cleanName,
        user_id: user.id,
        icon: "💡"
      });

    if (error) {
      console.error("Error creating collection:", error);
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async (id: string) => {
    let newFavStatus = false;
    setInspirations(prev => prev.map(item => {
      if (item.id === id) {
        newFavStatus = !item.isFavorite;
        return { ...item, isFavorite: newFavStatus };
      }
      return item;
    }));

    if (selectedInspiration && selectedInspiration.id === id) {
      setSelectedInspiration(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('ideas')
      .select('ai_summary')
      .eq('id', id)
      .single();

    if (!fetchErr && existing) {
      try {
        const parsed = typeof existing.ai_summary === 'string' ? JSON.parse(existing.ai_summary) : existing.ai_summary;
        const updated = {
          ...parsed,
          isFavorite: newFavStatus
        };
        await supabase
          .from('ideas')
          .update({ ai_summary: JSON.stringify(updated) })
          .eq('id', id);
      } catch {
        await supabase
          .from('ideas')
          .update({ ai_summary: JSON.stringify({ isFavorite: newFavStatus }) })
          .eq('id', id);
      }
    }
  };

  // Edit in-place title
  const handleSaveTitle = async (id: string, newTitle: string) => {
    setInspirations(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
    if (selectedInspiration && selectedInspiration.id === id) {
      setSelectedInspiration(prev => prev ? { ...prev, title: newTitle } : null);
    }

    const { error } = await supabase
      .from('ideas')
      .update({ title: newTitle })
      .eq('id', id);

    if (error) {
      console.error("Error updating title:", error);
    }
  };

  // Delete inspiration
  const handleDeleteInspiration = async (id: string) => {
    setInspirations(prev => prev.filter(item => item.id !== id));
    if (selectedInspiration && selectedInspiration.id === id) {
      setSelectedInspiration(null);
      setView("dashboard");
    }

    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting inspiration:", error);
    }
  };

  // Capture & Analyze Pipeline
  const handleSaveInspiration = async (newFields: Partial<Inspiration>) => {
    if (!user) return;
    const ideaId = crypto.randomUUID();
    const boardName = newFields.board || "💡 Random Ideas";
    
    // Find or create Collection ID in Supabase
    let collectionId = null;
    let existingBoard = boards.find(b => b.name === boardName || b.id === boardName);

    if (!existingBoard) {
      const newCollId = crypto.randomUUID();
      const { data: newColl, error: newCollErr } = await supabase
        .from('collections')
        .insert({
          id: newCollId,
          name: boardName,
          user_id: user.id,
          icon: "💡"
        })
        .select('*');

      if (newCollErr) {
        console.error("Error creating collection:", newCollErr);
      } else if (newColl && newColl.length > 0) {
        existingBoard = {
          id: newColl[0].id,
          name: newColl[0].name,
          icon: newColl[0].icon || undefined
        };
        setBoards(prev => [...prev, existingBoard!]);
      }
    }

    collectionId = existingBoard ? existingBoard.id : null;

    // Handle reference image file uploads to Supabase Storage with dynamic bucket-cascading fallback
    let finalImageUrl = newFields.imageUrl;
    if (newFields.imageUrl && newFields.imageUrl.startsWith("data:image/")) {
      try {
        const blob = dataURLtoBlob(newFields.imageUrl);
        const ext = blob.type.split('/')[1] || 'png';
        const filename = `${user.id}/${Date.now()}.${ext}`;
        
        let uploadedUrl = await uploadToStorage('images', filename, blob);
        if (!uploadedUrl) {
          uploadedUrl = await uploadToStorage('attachments', filename, blob);
        }
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } catch (err) {
        console.warn("Image upload exception, utilizing inline base64:", err);
      }
    }

    // Handle voice memo upload to Supabase Storage with dynamic bucket-cascading fallback
    let finalVoiceUrl = newFields.voiceUrl;
    if (newFields.voiceUrl && newFields.voiceUrl === "simulated-voice.mp3") {
      try {
        const silentBlob = new Blob([new Uint8Array(100)], { type: 'audio/mp3' });
        const filename = `${user.id}/${Date.now()}.mp3`;
        
        let uploadedUrl = await uploadToStorage('voice_recordings', filename, silentBlob);
        if (!uploadedUrl) {
          uploadedUrl = await uploadToStorage('recordings', filename, silentBlob);
        }
        if (!uploadedUrl) {
          uploadedUrl = await uploadToStorage('attachments', filename, silentBlob);
        }
        if (uploadedUrl) {
          finalVoiceUrl = uploadedUrl;
        }
      } catch (err) {
        console.warn("Voice memo upload exception:", err);
      }
    }

    // Extract voice transcript if present
    const voiceTranscript = newFields.notes?.includes('[Voice Memo Transcript]: "') ? 
      newFields.notes.split('[Voice Memo Transcript]: "')[1]?.replace(/"$/, '') || null : null;

    // Pre-insert Pending row to Supabase to secure the transaction
    const initialAiSummary = {
      notes: newFields.notes || "",
      isFavorite: false,
      imageUrl: finalImageUrl || null,
      tags: ["AI Loading"]
    };

    const dbPayload = {
      id: ideaId,
      title: newFields.title || "Securing Creative Layout...",
      url: newFields.url || "",
      platform: newFields.platform || "OTHER",
      voice_url: finalVoiceUrl || null,
      voice_transcript: voiceTranscript,
      ai_status: "pending",
      ai_summary: JSON.stringify(initialAiSummary),
      ai_tags: ["AI Loading"],
      user_id: user.id,
      collection_id: collectionId,
      created_at: new Date().toISOString()
    };

    const draftItem: Inspiration = {
      id: ideaId,
      title: dbPayload.title,
      url: dbPayload.url,
      notes: newFields.notes || "",
      tags: ["AI Loading"],
      platform: dbPayload.platform,
      board: boardName,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      isFavorite: false,
      imageUrl: finalImageUrl || undefined,
      voiceUrl: finalVoiceUrl || undefined,
      aiStatus: "pending",
      aiAnalysis: null
    };

    // Insert pending draft in local state instantly for extreme UI responsiveness
    setInspirations(prev => [draftItem, ...prev]);

    const { error: dbInsertErr } = await supabase.from('ideas').insert(dbPayload);
    if (dbInsertErr) {
      console.error("Supabase insert error:", dbInsertErr);
    }

    try {
      // Connect to server proxy API for real Gemini processing
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          notes: draftItem.notes,
          url: draftItem.url,
          board: boardName,
          title: newFields.title,
          platform: draftItem.platform
        })
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();

      const updatedAiSummary = {
        notes: draftItem.notes,
        isFavorite: false,
        imageUrl: finalImageUrl || null,
        tags: data.tags || ["Aesthetics", "SaaS Layout"],
        aiAnalysis: {
          creativeInsight: data.creativeInsight,
          whyItWorks: data.whyItWorks,
          sequentialBlueprint: data.sequentialBlueprint,
          howToAdapt: data.howToAdapt
        }
      };

      // Overwrite raw parameters with premium structural responses from Gemini
      setInspirations(prev => prev.map(item => {
        if (item.id === ideaId) {
          return {
            ...item,
            title: data.title || item.title,
            platform: data.platform || item.platform,
            tags: data.tags || ["Aesthetics", "SaaS Layout"],
            aiStatus: "ready",
            aiAnalysis: updatedAiSummary.aiAnalysis
          };
        }
        return item;
      }));

      // Update in Supabase
      await supabase
        .from('ideas')
        .update({
          title: data.title || dbPayload.title,
          platform: data.platform || dbPayload.platform,
          ai_status: "ready",
          ai_summary: JSON.stringify(updatedAiSummary),
          ai_tags: data.tags || ["Aesthetics", "SaaS Layout"]
        })
        .eq('id', ideaId);

    } catch (err) {
      console.error("Pipeline failure, applying local offline analysis:", err);
      
      const failedAiSummary = {
        notes: draftItem.notes,
        isFavorite: false,
        imageUrl: finalImageUrl || null,
        tags: ["Custom Design"]
      };

      setInspirations(prev => prev.map(item => {
        if (item.id === ideaId) {
          return {
            ...item,
            title: newFields.title || "Custom Aesthetic System",
            aiStatus: "failed",
            tags: ["Custom Design"]
          };
        }
        return item;
      }));

      // Update status to failed in Supabase
      await supabase
        .from('ideas')
        .update({
          title: newFields.title || "Custom Aesthetic System",
          ai_status: "failed",
          ai_summary: JSON.stringify(failedAiSummary),
          ai_tags: ["Custom Design"]
        })
        .eq('id', ideaId);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg grid-bg relative overflow-x-hidden text-white font-sans selection:bg-brand-primary/30">
      {/* Decorative ambient glows from the theme layout */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#4F8CFF15] to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30vh] right-1/4 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Dynamic top bar in dashboard */}
      {view !== "landing" && (
        <header className="border-b border-brand-border bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div 
              onClick={() => {
                setView("landing");
                setSelectedInspiration(null);
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-sm text-white block leading-none">IdeaVault</span>
                <p className="text-[8px] font-mono tracking-[0.2em] text-brand-muted uppercase mt-0.5 leading-none">CREATOR BLUEPRINTS</p>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-brand-bg border border-brand-border text-[10px] font-mono text-brand-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                  <span>CREATOR PLAN ACTIVE</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <img referrerPolicy="no-referrer" src={user.avatar} className="w-8 h-8 rounded-full border border-brand-border object-cover" alt="avatar" />
                  <div className="text-left leading-none hidden sm:block">
                    <span className="text-xs font-semibold text-white block">{user.name}</span>
                    <span className="text-[9px] text-brand-muted font-mono">{user.email}</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-brand-bg border border-brand-border hover:border-red-900/40 text-brand-muted hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Switch Router */}
      <main>
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div key="landing-view">
              <LandingPage 
                onStart={handleStartFree} 
                onLogin={() => setShowAuthModal(true)} 
              />
            </motion.div>
          )}

          {view === "dashboard" && (
            <motion.div key="dashboard-view">
              <Dashboard 
                inspirations={inspirations}
                boards={boards}
                activeBoard={activeBoard}
                onBoardChange={setActiveBoard}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddInspiration={() => setShowSaveModal(true)}
                onToggleFavorite={handleToggleFavorite}
                onViewInspiration={(insp) => {
                  setSelectedInspiration(insp);
                  setView("analysis");
                }}
                onAddNewBoard={handleAddNewBoard}
                onDelete={handleDeleteInspiration}
              />
            </motion.div>
          )}

          {view === "analysis" && selectedInspiration && (
            <motion.div key="analysis-view">
              <AnalysisPage 
                inspiration={selectedInspiration}
                onBack={() => {
                  setView("dashboard");
                  setSelectedInspiration(null);
                }}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteInspiration}
                onSaveTitle={handleSaveTitle}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Save Inspiration Modal overlay */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveModal 
            onClose={() => setShowSaveModal(false)}
            boards={boards.map(b => b.name)}
            onSave={handleSaveInspiration}
          />
        )}
      </AnimatePresence>

      {/* Auth credentials input Modal overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111217] border border-[#23242B] rounded-3xl w-full max-w-sm p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-brand-muted hover:text-white p-1 rounded-lg border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-primary/20">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display font-normal text-3xl text-white uppercase tracking-wide">
                  {authMode === "login" ? "Access IdeaVault" : "Create Account"}
                </h3>
                <p className="text-xs text-brand-muted mt-2 font-medium font-sans">
                  {authMode === "login" ? "Authenticate creator account credentials" : "Join the premium creator vault ecosystem"}
                </p>
              </div>

              {authError && (
                <div className={`p-3 rounded-xl border text-[11px] mb-4 text-center leading-relaxed font-mono uppercase tracking-wide font-bold ${
                  authError.includes("successful") || authError.includes("check your email")
                    ? "bg-teal-950/40 text-teal-400 border-teal-900/40"
                    : "bg-red-950/40 text-red-400 border-red-900/40"
                }`}>
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">Email address</label>
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="E.g., rohit@ideavault.io"
                    className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">Security password</label>
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/60"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold text-xs tracking-widest py-3.5 rounded-xl mt-6 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer uppercase"
                >
                  {authLoading ? (
                    "AUTHENTICATING..."
                  ) : (
                    <>
                      {authMode === "login" ? "SECURE SECRETS ACCESS" : "PROVISION NEW ACCESS"} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#23242B] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setAuthError(null);
                  }}
                  className="text-[10px] font-mono tracking-wider text-brand-muted hover:text-white uppercase font-bold cursor-pointer transition-colors"
                >
                  {authMode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
