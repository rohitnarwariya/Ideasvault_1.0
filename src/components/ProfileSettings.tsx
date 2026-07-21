import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Calendar, 
  CreditCard, 
  Trash2, 
  Edit3, 
  Camera, 
  AlertTriangle, 
  Check, 
  Plus, 
  X, 
  Loader2, 
  ArrowLeft,
  Mail,
  Heart,
  FolderOpen
} from "lucide-react";
import { Board } from "../types";

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  interests?: string[];
  created_at?: string;
}

interface ProfileSettingsProps {
  user: { id?: string; name: string; email: string; avatar: string };
  profile: Profile | null;
  boards: Board[];
  onProfileUpdate: (updatedProfile: Profile) => Promise<boolean>;
  onBack: () => void;
  onAddNewBoard: (boardName: string) => Promise<void>;
  onRenameBoard: (boardId: string, newName: string) => Promise<void>;
  onDeleteBoard: (boardId: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  uploadToStorage: (bucketName: string, filePath: string, fileData: Blob | File) => Promise<string | null>;
}

export default function ProfileSettings({
  user,
  profile,
  boards,
  onProfileUpdate,
  onBack,
  onAddNewBoard,
  onRenameBoard,
  onDeleteBoard,
  onDeleteAccount,
  uploadToStorage
}: ProfileSettingsProps) {
  // Local state for profile edits
  const [username, setUsername] = useState(profile?.username || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  
  // Local UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Avatar upload states
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collections states
  const [newCollectionName, setNewCollectionName] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionValue, setEditingCollectionValue] = useState("");
  const [isAddingCollection, setIsAddingCollection] = useState(false);

  // Modals / Confirmation Dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteBoardConfirm, setShowDeleteBoardConfirm] = useState<string | null>(null);

  // List of interests
  const INTEREST_OPTIONS = [
    "YouTube",
    "Instagram",
    "Pinterest",
    "Reddit",
    "X",
    "LinkedIn",
    "Podcasts",
    "Articles"
  ];

  // Helper to generate initials
  const getInitials = (name: string) => {
    if (!name || name === "Complete Profile") return "CP";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const currentInitials = getInitials(username || user.name || "CP");

  // Toggle interest
  const handleToggleInterest = (option: string) => {
    if (interests.includes(option)) {
      setInterests(prev => prev.filter(item => item !== option));
    } else {
      setInterests(prev => [...prev, option]);
    }
  };

  // Profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Username is required.");
      return;
    }
    
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const updatedProfile: Profile = {
        id: profile?.id || user.id || "",
        username: username.trim(),
        full_name: fullName.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
        interests: interests,
        created_at: profile?.created_at
      };

      const success = await onProfileUpdate(updatedProfile);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg("Failed to save profile changes. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.id) return;
    
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      
      const uploadedUrl = await uploadToStorage('ideas', filePath, file);
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        // Save immediately or let the user click save
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        setErrorMsg("Failed to upload image. Please check your storage bucket.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Create Collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    setIsAddingCollection(true);
    try {
      await onAddNewBoard(newCollectionName.trim());
      setNewCollectionName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingCollection(false);
    }
  };

  // Rename Collection
  const handleSaveRenameCollection = async (boardId: string) => {
    if (!editingCollectionValue.trim()) return;
    try {
      await onRenameBoard(boardId, editingCollectionValue.trim());
      setEditingCollectionId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Collection
  const handleDeleteCollection = async (boardId: string) => {
    try {
      await onDeleteBoard(boardId);
      setShowDeleteBoardConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 text-white">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between mb-8 border-b border-[#23242B] pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-[#111217] border border-[#23242B] rounded-xl hover:border-brand-muted/40 text-brand-muted hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-semibold text-2xl tracking-tight text-white uppercase">Profile Settings</h1>
          </div>
        </div>

        {/* Saved feedback */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Settings Saved Successfully
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-2xl flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: NAVIGATION / CARD QUICK DETAILS */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111217] border border-[#23242B] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6]" />
            <div className="flex flex-col items-center text-center mt-4">
              
              {/* Profile Avatar Spot */}
              <div className="relative group w-24 h-24 mb-4">
                {avatarUrl ? (
                  <img 
                    referrerPolicy="no-referrer" 
                    src={avatarUrl} 
                    className="w-full h-full rounded-full border-2 border-brand-primary object-cover shadow-xl" 
                    alt="profile avatar" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center font-display font-bold text-3xl text-white shadow-xl">
                    {currentInitials}
                  </div>
                )}
                
                {/* Overlay Trigger for File upload */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#4F8CFF]" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <h2 className="font-display font-medium text-lg text-white truncate max-w-full">
                {username || "Complete Profile"}
              </h2>
              <p className="text-[10px] text-brand-muted font-mono mt-0.5 truncate max-w-full">
                {user.email}
              </p>

              {bio && (
                <p className="text-xs text-brand-muted mt-4 font-sans line-clamp-3 bg-[#09090B] p-3 rounded-2xl border border-[#23242B] w-full text-left italic">
                  "{bio}"
                </p>
              )}

              <div className="w-full border-t border-[#23242B] mt-6 pt-5 space-y-3.5">
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span className="flex items-center gap-1.5 font-sans"><Calendar className="w-3.5 h-3.5" /> Created At</span>
                  <span className="font-mono text-white text-[11px]">
                    {new Date(profile?.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span className="flex items-center gap-1.5 font-sans"><CreditCard className="w-3.5 h-3.5" /> Plan Tier</span>
                  <span className="inline-flex items-center bg-gradient-to-r from-[#4F8CFF]/15 to-[#8B5CF6]/15 border border-[#4F8CFF]/30 text-xs px-2.5 py-0.5 rounded-full font-bold text-[#4F8CFF]">
                    CREATOR PLAN
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111217] border border-[#23242B] rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-1">Quick Instructions</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              • Provide a valid <b>Avatar URL</b> or upload an image by clicking on your avatar.
            </p>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              • Interests defined here guide your creator preference profiles.
            </p>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              • Collections can be added, renamed, or deleted securely below.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: TABS/SECTIONS OF PROFILE FORM */}
        <div className="md:col-span-2 space-y-8">
          
          {/* SECTION 1 & 2: PERSONAL INFORMATION & INTERESTS */}
          <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="bg-[#111217] border border-[#23242B] rounded-3xl p-6 md:p-8 space-y-6">
              
              <div className="border-b border-[#23242B] pb-4">
                <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4F8CFF]" /> Personal Information
                </h3>
                <p className="text-[11px] text-brand-muted mt-0.5">Maintain your workspace creator profile parameters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">Username *</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Rohit"
                    className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">Full Name (optional)</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">Avatar Image URL (optional)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
                  />
                  {avatarUrl && (
                    <button 
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="px-3 bg-[#09090B] border border-[#23242B] hover:border-red-900/40 text-brand-muted hover:text-red-400 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                      title="Clear image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">Creator Bio (optional)</label>
                <textarea 
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary about your creative workflows..."
                  className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-sans resize-none"
                />
              </div>

              {/* SECTION 2: INTERESTS */}
              <div className="border-t border-[#23242B] pt-6 mt-6">
                <div className="pb-3">
                  <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#8B5CF6]" /> Creative Interests
                  </h3>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Select the platforms and formats you create on. 
                    <span className="text-[#8B5CF6] font-semibold ml-1">Note: These are preferences and do not auto-create collections.</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 select-none pt-2">
                  {INTEREST_OPTIONS.map((option) => {
                    const isSelected = interests.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleToggleInterest(option)}
                        className={`px-3 py-2.5 text-xs border rounded-xl text-left font-sans transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-white font-semibold shadow-inner" 
                            : "border-[#23242B] bg-[#09090B] text-brand-muted hover:border-brand-muted/40 hover:text-white"
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "border-[#23242B] bg-[#09090B]"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SAVE PROFILE ACTION BUTTON */}
              <div className="border-t border-[#23242B] pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] text-white font-sans font-bold text-xs tracking-widest px-6 py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer uppercase"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> SAVING CHANGES...
                    </>
                  ) : (
                    <>
                      SAVE CHANGES <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>

          {/* SECTION 3: COLLECTIONS MANAGEMENT */}
          <div className="bg-[#111217] border border-[#23242B] rounded-3xl p-6 md:p-8 space-y-6">
            <div className="border-b border-[#23242B] pb-4">
              <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#4F8CFF]" /> Collections Management
              </h3>
              <p className="text-[11px] text-brand-muted mt-0.5">Manage, rename, delete, or create collections inside your IdeaVault.</p>
            </div>

            {/* Quick Add Collection Inline */}
            <div className="flex gap-2 bg-[#09090B] p-3 rounded-2xl border border-[#23242B]">
              <input 
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCollection();
                  }
                }}
                placeholder="E.g., Client Work, Reels Hooks, Startup Copy..."
                className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-brand-muted/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreateCollection}
                disabled={isAddingCollection || !newCollectionName.trim()}
                className="px-4 py-2 bg-[#23242B] hover:bg-[#34353f] hover:text-[#4F8CFF] disabled:opacity-30 disabled:hover:bg-[#23242B] disabled:hover:text-white text-white font-mono text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isAddingCollection ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> CREATE
                  </>
                )}
              </button>
            </div>

            {/* Collections List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {boards.map((board) => {
                const isEditing = editingCollectionId === board.id;
                
                return (
                  <div 
                    key={board.id}
                    className="flex items-center justify-between p-3.5 bg-[#09090B] border border-[#23242B] rounded-2xl hover:border-brand-muted/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                      <span className="text-lg shrink-0">{board.icon || "💡"}</span>
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editingCollectionValue}
                          onChange={(e) => setEditingCollectionValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveRenameCollection(board.id);
                            } else if (e.key === "Escape") {
                              setEditingCollectionId(null);
                            }
                          }}
                          className="flex-1 bg-[#111217] border border-[#4F8CFF]/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white truncate">{board.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveRenameCollection(board.id)}
                            className="p-1.5 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/25 border border-[#10B981]/20 rounded-lg transition-all cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCollectionId(null)}
                            className="p-1.5 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/20 rounded-lg transition-all cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCollectionId(board.id);
                              setEditingCollectionValue(board.name);
                            }}
                            className="p-1.5 bg-[#111217] border border-[#23242B] text-brand-muted hover:text-white hover:border-brand-muted/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center"
                            title="Rename"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Confirm delete trigger */}
                          <button
                            type="button"
                            onClick={() => setShowDeleteBoardConfirm(board.id)}
                            className="p-1.5 bg-[#111217] border border-[#23242B] text-brand-muted hover:text-red-400 hover:border-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center"
                            title="Delete collection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>



          {/* SECTION 5: DANGER ZONE */}
          <div className="bg-red-950/10 border border-red-900/20 rounded-3xl p-6 md:p-8 space-y-5">
            <div>
              <h3 className="font-display font-medium text-lg text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Danger Zone
              </h3>
              <p className="text-[11px] text-red-300/80 mt-1">
                Permanently delete your entire workspace, all collections, cataloged inspirations, transcripts, and account profile details. This operation is 100% irreversible.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-950/30 hover:bg-red-900/40 border border-red-900/35 text-red-400 hover:text-red-300 font-sans font-bold text-xs tracking-wider px-5 py-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 uppercase"
              >
                <Trash2 className="w-4 h-4" /> PERMANENTLY DELETE ACCOUNT
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL 1: CONFIRM ACCOUNT DELETION */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111217] border border-red-900/40 rounded-3xl w-full max-w-md p-8 shadow-2xl relative"
            >
              <button 
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-5 right-5 text-brand-muted hover:text-white p-1 rounded-lg border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400 mx-auto mb-4 shadow-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-xl text-white uppercase tracking-wide">
                  Confirm Permanent Deletion
                </h3>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                  Are you absolutely certain? This will completely wipe all of your folders, recorded voice memos, AI insights, and database profiles from the Supabase ecosystem. This cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-[#1A1B23] border border-[#23242B] text-brand-muted hover:text-white hover:border-brand-muted/40 font-mono text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowDeleteConfirm(false);
                    await onDeleteAccount();
                  }}
                  className="flex-1 bg-red-900/80 hover:bg-red-800 text-white font-mono text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  Yes, Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CONFIRM COLLECTION DELETION */}
      <AnimatePresence>
        {showDeleteBoardConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111217] border border-red-[#23242B] rounded-3xl w-full max-w-md p-8 shadow-2xl relative"
            >
              <button 
                type="button"
                onClick={() => setShowDeleteBoardConfirm(null)}
                className="absolute top-5 right-5 text-brand-muted hover:text-white p-1 rounded-lg border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400 mx-auto mb-4 shadow-lg">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-xl text-white uppercase tracking-wide">
                  Delete Collection
                </h3>
                <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                  Are you sure you want to delete this collection? <b>All inspirations saved under this collection will also be deleted from the database.</b> This cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteBoardConfirm(null)}
                  className="flex-1 bg-[#1A1B23] border border-[#23242B] text-brand-muted hover:text-white hover:border-brand-muted/40 font-mono text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer uppercase animate-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCollection(showDeleteBoardConfirm)}
                  className="flex-1 bg-red-900/80 hover:bg-red-800 text-white font-mono text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-none"
                >
                  Yes, Delete Collection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
