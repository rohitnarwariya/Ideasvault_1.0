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
import ProfileSettings, { Profile } from "./components/ProfileSettings";
import { Lock, Sparkles, LogOut, ArrowRight, ShieldCheck, X, ChevronLeft, Plus, Check } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard" | "analysis" | "profile">("landing");
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [activeBoard, setActiveBoard] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  
  // Real Supabase Auth State
  const [user, setUser] = useState<{ id?: string; name: string; email: string; avatar: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Onboarding Wizard State
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [signupUsername, setSignupUsername] = useState<string>("");
  const [signupCreations, setSignupCreations] = useState<string[]>([]);
  const [signupCollections, setSignupCollections] = useState<string[]>([
    "YouTube", "Instagram", "Pinterest", "UI Inspiration"
  ]);
  const [customCollections, setCustomCollections] = useState<string[]>([]);
  const [customCollectionInput, setCustomCollectionInput] = useState<string>("");

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
        console.warn(`Upload to bucket "${bucketName}" failed, falling back to local preview:`, error.message);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(fileData);
        });
      }
      
      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        return publicUrl;
      }
      return null;
    } catch (err) {
      console.warn(`Exception uploading to bucket "${bucketName}", falling back to local preview:`, err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(fileData);
      });
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

        let observations = "";
        let actionItems = [
          { text: "Try this transition", checked: false },
          { text: "Test this hook", checked: false },
          { text: "Use same color palette", checked: false },
          { text: "Recreate lighting", checked: false }
        ];

        if (item.ai_summary) {
          try {
            const parsed = typeof item.ai_summary === 'string' ? JSON.parse(item.ai_summary) : item.ai_summary;
            if (parsed && typeof parsed === 'object') {
              notes = parsed.notes || "";
              if (parsed.aiAnalysis) aiAnalysis = parsed.aiAnalysis;
              if (parsed.isFavorite !== undefined) isFavorite = parsed.isFavorite;
              if (parsed.imageUrl) imageUrl = parsed.imageUrl;
              if (parsed.tags && Array.isArray(parsed.tags)) tags = parsed.tags;
              if (parsed.observations !== undefined && parsed.observations !== null) {
                observations = parsed.observations;
              }
              if (parsed.actionItems && Array.isArray(parsed.actionItems)) {
                actionItems = parsed.actionItems;
              }
            } else if (typeof item.ai_summary === 'string') {
              notes = item.ai_summary;
              aiAnalysis = null;
            }
          } catch {
            notes = item.ai_summary;
            aiAnalysis = null;
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
          collectionId: item.collection_id,
          collection_id: item.collection_id,
          createdAt: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isFavorite: isFavorite,
          imageUrl: imageUrl,
          voiceUrl: item.voice_url || undefined,
          aiStatus: item.ai_status || "ready",
          aiAnalysis: aiAnalysis,
          observations: observations,
          actionItems: actionItems
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

  // Helper: Fetch Profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn("Profile row not found. Creating a default profile.");
        } else {
          throw error;
        }
      }

      if (data) {
        setProfile(data);
        setUser(prev => prev ? {
          ...prev,
          name: data.username || "Complete Profile",
          avatar: data.avatar_url || ""
        } : null);
      } else {
        const defaultProf: Profile = {
          id: userId,
          username: "",
          full_name: "",
          avatar_url: "",
          bio: "",
          interests: [],
          created_at: new Date().toISOString()
        };
        
        await supabase.from('profiles').insert([defaultProf]);
        setProfile(defaultProf);
        setUser(prev => prev ? {
          ...prev,
          name: "Complete Profile",
          avatar: ""
        } : null);
      }
    } catch (err: any) {
      console.warn("Error loading profile from Supabase profiles (using local fallback):", err);
      const cached = localStorage.getItem(`profile_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        setUser(prev => prev ? {
          ...prev,
          name: parsed.username || "Complete Profile",
          avatar: parsed.avatar_url || ""
        } : null);
      } else {
        const fallbackProf: Profile = {
          id: userId,
          username: "",
          interests: [],
          created_at: new Date().toISOString()
        };
        setProfile(fallbackProf);
        setUser(prev => prev ? {
          ...prev,
          name: "Complete Profile",
          avatar: ""
        } : null);
      }
    }
  };

  // Helper: Profile Update
  const handleProfileUpdate = async (updatedProfile: Profile): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(updatedProfile);

      if (error) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updatedProfile)
          .eq('id', user.id);
        if (updateErr) throw updateErr;
      }

      setProfile(updatedProfile);
      setUser(prev => prev ? {
        ...prev,
        name: updatedProfile.username || "Complete Profile",
        avatar: updatedProfile.avatar_url || ""
      } : null);

      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      return true;
    } catch (err) {
      console.warn("Error updating profile in Supabase profiles (using local fallback):", err);
      setProfile(updatedProfile);
      setUser(prev => prev ? {
        ...prev,
        name: updatedProfile.username || "Complete Profile",
        avatar: updatedProfile.avatar_url || ""
      } : null);
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      return true;
    }
  };

  // Helper: Rename Collection Folder
  const handleRenameBoard = async (boardId: string, newName: string) => {
    if (!user) return;
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, name: newName } : b));
    setInspirations(prev => prev.map(item => {
      if (item.collectionId === boardId) {
        return { ...item, board: newName };
      }
      return item;
    }));

    const { error } = await supabase
      .from('collections')
      .update({ name: newName })
      .eq('id', boardId);

    if (error) {
      console.error("Error renaming collection:", error);
    }
  };

  // Helper: Delete Collection Folder
  const handleDeleteBoard = async (boardId: string) => {
    if (!user) return;
    setBoards(prev => prev.filter(b => b.id !== boardId));
    setInspirations(prev => prev.filter(item => item.collectionId !== boardId));

    const { error: collErr } = await supabase
      .from('collections')
      .delete()
      .eq('id', boardId);

    if (collErr) {
      console.error("Error deleting collection:", collErr);
    }

    const { error: ideaErr } = await supabase
      .from('ideas')
      .delete()
      .eq('collection_id', boardId);

    if (ideaErr) {
      console.error("Error deleting ideas in collection:", ideaErr);
    }
  };

  // Helper: Delete User Account
  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await supabase.from('ideas').delete().eq('user_id', user.id);
      await supabase.from('collections').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      localStorage.removeItem(`profile_${user.id}`);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setView("landing");
    } catch (err) {
      console.error("Error during account deletion:", err);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setView("landing");
    }
  };

  // History sync router view
  useEffect(() => {
    if (view === "profile" && window.location.pathname !== "/profile") {
      window.history.pushState({}, "", "/profile");
    } else if (view === "dashboard" && window.location.pathname !== "/dashboard" && window.location.pathname !== "/analysis") {
      window.history.pushState({}, "", "/dashboard");
    } else if (view === "landing" && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  }, [view]);

  // Auth Session & State Monitoring
  useEffect(() => {
    // Address bar entry point synchronization
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/profile") {
        setView("profile");
      } else if (path === "/dashboard" || path === "/analysis") {
        setView("dashboard");
      } else {
        setView("landing");
      }
    };
    
    window.addEventListener("popstate", handlePopState);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        const u = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Creator",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || ""
        };
        setUser(u);
        loadUserData(session.user.id);
        fetchProfile(session.user.id);
        
        // Match address bar URL initial status
        const path = window.location.pathname;
        if (path === "/profile") {
          setView("profile");
        } else {
          setView("dashboard");
        }
      } else {
        setInspirations(INITIAL_INSPIRATIONS);
        setView("landing");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        const u = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Creator",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || ""
        };
        setUser(u);
        loadUserData(session.user.id);
        fetchProfile(session.user.id);
        
        const path = window.location.pathname;
        if (path === "/profile") {
          setView("profile");
        } else {
          setView("dashboard");
        }
      } else {
        setUser(null);
        setProfile(null);
        setInspirations(INITIAL_INSPIRATIONS);
        setBoards(INITIAL_BOARDS);
        setView("landing");
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("popstate", handlePopState);
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
              name: signupUsername || authEmail.split("@")[0],
              creations: signupCreations
            }
          }
        });
        if (error) throw error;

        const userId = data.user?.id;
        if (userId) {
          const DEFAULT_COLLECTION_ICONS: Record<string, string> = {
            "YouTube": "📹",
            "Instagram": "📸",
            "Pinterest": "📌",
            "X (Twitter)": "🐦",
            "LinkedIn": "💼",
            "Reddit": "🤖",
            "Articles": "📄",
            "Podcasts": "🎙️",
            "UI Inspiration": "🎨",
            "Marketing": "📈",
            "Copywriting": "✍️",
            "Ads": "📢",
            "Branding": "🏷️"
          };

          // Generate the collections object array
          const collectionsToInsert = [
            ...signupCollections.map(name => {
              const icon = DEFAULT_COLLECTION_ICONS[name] || "💡";
              return {
                id: crypto.randomUUID(),
                name: `${icon} ${name}`,
                user_id: userId,
                icon: icon
              };
            }),
            ...customCollections.map(name => ({
              id: crypto.randomUUID(),
              name: `💡 ${name}`,
              user_id: userId,
              icon: "💡"
            }))
          ];

          if (collectionsToInsert.length > 0) {
            const { error: insertErr } = await supabase
              .from('collections')
              .insert(collectionsToInsert);
            if (insertErr) {
              console.error("Error creating onboarding collections:", insertErr);
            }
          }

          // Automatically create a row inside the profiles table during signup
          try {
            const { error: profileErr } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                username: signupUsername || authEmail.split("@")[0],
                email: authEmail,
                interests: signupCreations,
                created_at: new Date().toISOString()
              });

            if (profileErr) {
              console.warn("Inserting with email failed, retrying without email field...", profileErr);
              const { error: retryErr } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  username: signupUsername || authEmail.split("@")[0],
                  interests: signupCreations,
                  created_at: new Date().toISOString()
                });
              if (retryErr) {
                console.warn("Error creating user profile in Supabase profiles (using local fallback):", retryErr);
              }
            }

            // Write to local storage fallback cache
            localStorage.setItem(`profile_${userId}`, JSON.stringify({
              id: userId,
              username: signupUsername || authEmail.split("@")[0],
              interests: signupCreations,
              created_at: new Date().toISOString()
            }));
          } catch (profileExc) {
            console.warn("Exception creating user profile during signup (using local fallback):", profileExc);
          }
        }

        if (data.session) {
          const u = {
            id: userId,
            name: signupUsername || authEmail.split("@")[0],
            email: authEmail,
            avatar: ""
          };
          setUser(u);
          if (userId) {
            await loadUserData(userId);
            await fetchProfile(userId);
          }
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
      setOnboardingStep(1);
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

  // Resilient helper to update observations, action items, tags, and custom notes in Supabase
  const handleUpdateInspirationDetails = async (id: string, updates: Partial<Inspiration>) => {
    setInspirations(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (selectedInspiration && selectedInspiration.id === id) {
      setSelectedInspiration(prev => prev ? { ...prev, ...updates } : null);
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('ideas')
      .select('ai_summary')
      .eq('id', id)
      .single();

    if (!fetchErr && existing) {
      try {
        const parsed = typeof existing.ai_summary === 'string' ? JSON.parse(existing.ai_summary) : existing.ai_summary;
        const updatedSummary = {
          ...parsed,
          notes: updates.notes !== undefined ? updates.notes : (parsed?.notes || ""),
          observations: updates.observations !== undefined ? updates.observations : parsed?.observations,
          actionItems: updates.actionItems !== undefined ? updates.actionItems : parsed?.actionItems,
          tags: updates.tags !== undefined ? updates.tags : parsed?.tags
        };

        const dbUpdatePayload: any = {
          ai_summary: JSON.stringify(updatedSummary)
        };

        if (updates.tags !== undefined) {
          dbUpdatePayload.ai_tags = updates.tags;
        }

        await supabase
          .from('ideas')
          .update(dbUpdatePayload)
          .eq('id', id);
      } catch (err) {
        console.error("Error stringifying updates:", err);
      }
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
    let existingBoard = boards.find(b => {
      if (b.id === boardName) return true;
      const cleanB = b.name.replace(/[^\w\s]/g, "").trim().toLowerCase();
      const cleanTarget = boardName.replace(/[^\w\s]/g, "").trim().toLowerCase();
      return cleanB === cleanTarget;
    });

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
    const voiceTranscript = newFields.voiceTranscript || (newFields.notes?.includes('[Voice Memo Transcript]: "') ? 
      newFields.notes.split('[Voice Memo Transcript]: "')[1]?.replace(/"$/, '') || null : null);

    const generateLocalTitle = (notes?: string, vt?: string | null, plat?: string) => {
      const textToUse = (vt && vt.trim() !== "") ? vt : notes;
      if (textToUse && textToUse.trim() !== "") {
        const words = textToUse.trim().split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          const cleanWords = words.slice(0, 5).map(w => w.replace(/[^\w\s-]/g, ''));
          return cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        }
      }
      if (plat && plat !== "OTHER") {
        return `Inspiration from ${plat.charAt(0).toUpperCase() + plat.slice(1).toLowerCase()}`;
      }
      return "Custom Aesthetic Inspiration";
    };

    const initialTitle = newFields.title?.trim() || generateLocalTitle(newFields.notes, voiceTranscript, newFields.platform);

    // Pre-insert Pending row to Supabase to secure the transaction
    const initialAiSummary = {
      notes: newFields.notes || "",
      isFavorite: false,
      imageUrl: finalImageUrl || null,
      tags: ["Aesthetics", "SaaS Layout"]
    };

    const dbPayload = {
      id: ideaId,
      title: initialTitle,
      url: newFields.url || "",
      platform: newFields.platform || "OTHER",
      voice_url: finalVoiceUrl || null,
      voice_transcript: voiceTranscript,
      ai_status: "pending",
      ai_summary: JSON.stringify(initialAiSummary),
      ai_tags: ["Aesthetics", "SaaS Layout"],
      user_id: user.id,
      collection_id: collectionId,
      created_at: new Date().toISOString()
    };

    const draftItem: Inspiration = {
      id: ideaId,
      title: dbPayload.title,
      url: dbPayload.url,
      notes: newFields.notes || "",
      tags: [],
      platform: dbPayload.platform,
      board: boardName,
      collectionId: collectionId,
      collection_id: collectionId,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      isFavorite: false,
      imageUrl: finalImageUrl || undefined,
      voiceUrl: finalVoiceUrl || undefined,
      aiStatus: "ready", // Set to ready by default since we are creator-focused now
      aiAnalysis: null,
      observations: "",
      actionItems: [
        { text: "Try this transition", checked: false },
        { text: "Test this hook", checked: false },
        { text: "Use same color palette", checked: false },
        { text: "Recreate lighting", checked: false }
      ]
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
          platform: draftItem.platform,
          voiceTranscript: voiceTranscript
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
            title: initialTitle,
            aiStatus: "ready",
            tags: ["Custom Design"]
          };
        }
        return item;
      }));

      // Update status to failed in Supabase
      await supabase
        .from('ideas')
        .update({
          title: initialTitle,
          ai_status: "ready",
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
              </div>
            </div>

            {user && (() => {
              const usernameDisplay = user.name || "Complete Profile";
              const isUsernameMissing = !user.name || user.name === "Complete Profile";
              const getInitials = (name: string) => {
                if (!name || name === "Complete Profile") return "CP";
                const parts = name.trim().split(/\s+/);
                if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              };
              const initials = getInitials(usernameDisplay);

              return (
                <div className="flex items-center gap-5">
                  {/* Clickable user profile info block */}
                  <div 
                    onClick={() => setView("profile")}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all group select-none"
                    title="Open Profile Settings"
                  >
                    {user.avatar ? (
                      <img 
                        referrerPolicy="no-referrer" 
                        src={user.avatar} 
                        className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-[#4F8CFF] object-cover transition-colors" 
                        alt="avatar" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center font-display font-bold text-base text-white border-2 border-transparent group-hover:border-white/20 transition-all shadow-inner">
                        {initials}
                      </div>
                    )}
                    <div className="text-left hidden sm:block">
                      <span className={`text-sm font-semibold block leading-tight group-hover:text-[#4F8CFF] transition-colors ${isUsernameMissing ? "text-yellow-400 font-bold" : "text-white"}`}>
                        {usernameDisplay}
                      </span>
                      <span className="text-[10px] text-brand-muted font-mono leading-none">{user.email}</span>
                    </div>
                  </div>

                  {/* Proper bordered Logout button */}
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-red-400 bg-[#111217] border border-[#23242B] hover:border-red-900/35 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              );
            })()}
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
                allInspirations={inspirations}
                onBack={() => {
                  setView("dashboard");
                  setSelectedInspiration(null);
                }}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteInspiration}
                onSaveTitle={handleSaveTitle}
                onUpdateInspiration={handleUpdateInspirationDetails}
              />
            </motion.div>
          )}

          {view === "profile" && (
            <motion.div key="profile-view">
              <ProfileSettings 
                user={user!}
                profile={profile}
                boards={boards}
                onProfileUpdate={handleProfileUpdate}
                onBack={() => setView("dashboard")}
                onAddNewBoard={handleAddNewBoard}
                onRenameBoard={handleRenameBoard}
                onDeleteBoard={handleDeleteBoard}
                onDeleteAccount={handleDeleteAccount}
                uploadToStorage={uploadToStorage}
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
              className={`bg-[#111217] border border-[#23242B] rounded-3xl w-full p-8 shadow-2xl relative transition-all duration-300 ${
                authMode === "signup" ? "max-w-md" : "max-w-sm"
              }`}
            >
              {/* Back button (Only in signup mode and step > 1) */}
              {authMode === "signup" && onboardingStep > 1 && (
                <button 
                  type="button"
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="absolute top-5 left-5 text-brand-muted hover:text-white p-1 rounded-lg border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer flex items-center justify-center"
                  title="Back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-brand-muted hover:text-white p-1 rounded-lg border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Onboarding Step Indicator */}
              {authMode === "signup" && (
                <div className="flex justify-center gap-1.5 mb-6">
                  {[1, 2, 3, 4, 5].map((stepNum) => (
                    <div 
                      key={stepNum} 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        stepNum === onboardingStep 
                          ? "w-8 bg-[#4F8CFF]" 
                          : stepNum < onboardingStep 
                            ? "w-3 bg-[#4F8CFF]/40" 
                            : "w-3 bg-[#23242B]"
                      }`} 
                    />
                  ))}
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                {authMode === "login" ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-primary/20">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-normal text-3xl text-white uppercase tracking-wide">
                      Access IdeaVault
                    </h3>
                    <p className="text-xs text-brand-muted mt-2 font-medium font-sans">
                      Authenticate creator account credentials
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-primary/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-normal text-3xl text-white uppercase tracking-wide">
                      CREATE YOUR VAULT
                    </h3>
                    <p className="text-xs text-brand-muted mt-2 font-medium font-sans">
                      Set up your creative workspace in under a minute.
                    </p>
                  </>
                )}
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

              {authMode === "login" ? (
                /* LOGIN MODE */
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
                        SECURE SECRETS ACCESS <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* ONBOARDING SIGNUP MODE (5 Steps) */
                <div className="space-y-4">
                  {onboardingStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">USERNAME</label>
                        <input 
                          type="text" 
                          required
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          placeholder="e.g. Rohit"
                          className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && signupUsername.trim()) {
                              e.preventDefault();
                              setOnboardingStep(2);
                            }
                          }}
                        />
                        <p className="text-[10px] text-brand-muted mt-1.5 font-sans font-medium">
                          This will appear on your workspace.
                        </p>
                      </div>

                      <button 
                        type="button"
                        disabled={!signupUsername.trim()}
                        onClick={() => setOnboardingStep(2)}
                        className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold text-xs tracking-widest py-3.5 rounded-xl mt-6 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 disabled:shadow-none transition-all cursor-pointer uppercase"
                      >
                        CONTINUE <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {onboardingStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-2 font-bold">WHAT DO YOU CREATE?</label>
                        
                        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 select-none custom-scrollbar">
                          {[
                            "Video Editing",
                            "Content Creation",
                            "YouTube",
                            "Instagram",
                            "Graphic Design",
                            "UI/UX",
                            "Photography",
                            "Filmmaking",
                            "Motion Design",
                            "Marketing",
                            "Copywriting",
                            "Writing",
                            "Podcasting",
                            "Music",
                            "Business",
                            "Other"
                          ].map((option) => {
                            const isSelected = signupCreations.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSignupCreations(prev => prev.filter(o => o !== option));
                                  } else {
                                    setSignupCreations(prev => [...prev, option]);
                                  }
                                }}
                                className={`px-3 py-2 text-xs border rounded-xl text-left font-sans transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? "border-[#4F8CFF] bg-[#4F8CFF]/10 text-white font-semibold" 
                                    : "border-[#23242B] bg-[#09090B] text-brand-muted hover:border-brand-muted/40 hover:text-white"
                                }`}
                              >
                                <span>{option}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#4F8CFF]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={() => setOnboardingStep(3)}
                        className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold text-xs tracking-widest py-3.5 rounded-xl mt-6 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 disabled:shadow-none transition-all cursor-pointer uppercase"
                      >
                        CONTINUE <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {onboardingStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">EMAIL ADDRESS</label>
                        <input 
                          type="email" 
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && authEmail.trim() && authEmail.includes("@")) {
                              e.preventDefault();
                              setOnboardingStep(4);
                            }
                          }}
                        />
                      </div>

                      <button 
                        type="button"
                        disabled={!authEmail.trim() || !authEmail.includes("@")}
                        onClick={() => setOnboardingStep(4)}
                        className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold text-xs tracking-widest py-3.5 rounded-xl mt-6 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 disabled:shadow-none transition-all cursor-pointer uppercase"
                      >
                        CONTINUE <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {onboardingStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">CREATE PASSWORD</label>
                        <input 
                          type="password" 
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/60"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && authPassword.length >= 8) {
                              e.preventDefault();
                              setOnboardingStep(5);
                            }
                          }}
                        />
                      </div>

                      <button 
                        type="button"
                        disabled={authPassword.length < 8}
                        onClick={() => setOnboardingStep(5)}
                        className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold text-xs tracking-widest py-3.5 rounded-xl mt-6 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 disabled:shadow-none transition-all cursor-pointer uppercase"
                      >
                        CONTINUE <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {onboardingStep === 5 && (
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white block font-bold">CREATE YOUR FIRST COLLECTIONS</label>
                        <p className="text-[10px] text-brand-muted mb-3 font-sans font-medium">
                          Choose the collections you'd like IdeaVault to create automatically.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1 select-none custom-scrollbar mb-4">
                          {[
                            "YouTube",
                            "Instagram",
                            "Pinterest",
                            "X (Twitter)",
                            "LinkedIn",
                            "Reddit",
                            "Articles",
                            "Podcasts",
                            "UI Inspiration",
                            "Marketing",
                            "Copywriting",
                            "Ads",
                            "Branding"
                          ].map((name) => {
                            const isSelected = signupCollections.includes(name);
                            return (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSignupCollections(prev => prev.filter(n => n !== name));
                                  } else {
                                    setSignupCollections(prev => [...prev, name]);
                                  }
                                }}
                                className={`px-2.5 py-2 text-[11px] border rounded-xl text-left font-sans transition-all flex items-center gap-2 cursor-pointer ${
                                  isSelected 
                                    ? "border-[#4F8CFF] bg-[#4F8CFF]/10 text-white font-semibold" 
                                    : "border-[#23242B] bg-[#09090B] text-brand-muted hover:border-brand-muted/40 hover:text-white"
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                  isSelected ? "bg-[#4F8CFF] border-[#4F8CFF] text-white" : "border-[#23242B] bg-[#09090B]"
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className="truncate">{name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Collection Add Block */}
                        <div className="border-t border-[#23242B] pt-4">
                          <label className="text-[9px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">+ ADD CUSTOM COLLECTION</label>
                          
                          {customCollections.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {customCollections.map(name => (
                                <span key={name} className="inline-flex items-center gap-1 text-[9px] font-sans bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/25 px-2 py-0.5 rounded-lg">
                                  <span>{name}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => setCustomCollections(prev => prev.filter(n => n !== name))}
                                    className="text-brand-muted hover:text-red-400 transition-colors cursor-pointer"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              value={customCollectionInput}
                              onChange={(e) => setCustomCollectionInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = customCollectionInput.trim();
                                  if (val && !customCollections.includes(val) && !signupCollections.includes(val)) {
                                    setCustomCollections(prev => [...prev, val]);
                                    setCustomCollectionInput("");
                                  }
                                }
                              }}
                              placeholder="Collection Name"
                              className="flex-1 bg-[#09090B] border border-[#23242B] rounded-xl px-3 py-2 text-xs text-white placeholder-brand-muted/50 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = customCollectionInput.trim();
                                if (val && !customCollections.includes(val) && !signupCollections.includes(val)) {
                                  setCustomCollections(prev => [...prev, val]);
                                  setCustomCollectionInput("");
                                }
                              }}
                              className="px-3 bg-[#23242B] hover:bg-[#3a3b45] text-white rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> ADD
                            </button>
                          </div>
                          
                          <div className="text-[8px] text-brand-muted/60 mt-1.5 font-mono uppercase tracking-wider">
                            Examples: Client Work, Ideas, Startup, Reels, Hooks, Animations
                          </div>
                        </div>
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
                            CREATE MY VAULT <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[#23242B] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setOnboardingStep(1);
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
