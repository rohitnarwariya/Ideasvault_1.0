import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Sparkles, Link2, Mic, Upload, Folder, HelpCircle, FileText, Image, 
  Trash2, AlertCircle, CheckCircle, Volume2, Music 
} from "lucide-react";
import { Inspiration, Platform } from "../types";

interface SaveModalProps {
  onClose: () => void;
  onSave: (newInspiration: Partial<Inspiration>) => Promise<void>;
  boards: string[];
}

export default function SaveModal({ onClose, onSave, boards }: SaveModalProps) {
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(boards[1] || "💡 Random Ideas");
  const [platform, setPlatform] = useState<Platform>("OTHER");
  
  // Local boards tracking for auto-created collections
  const [localBoards, setLocalBoards] = useState<string[]>(boards);
  const [hasManuallySelectedBoard, setHasManuallySelectedBoard] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(true);

  const localBoardsRef = useRef<string[]>(localBoards);
  useEffect(() => {
    localBoardsRef.current = localBoards;
  }, [localBoards]);

  // Synchronize boards with parent prop additions
  useEffect(() => {
    setLocalBoards(prev => {
      const merged = [...prev];
      boards.forEach(b => {
        if (!merged.includes(b)) {
          merged.push(b);
        }
      });
      return merged;
    });
  }, [boards]);

  // Image attachment states
  const [imageFile, setImageFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // AI Pipeline progress states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  
  const analysisSteps = [
    { title: "Saving your idea", desc: "Organizing everything..." },
    { title: "Saving your idea", desc: "Adding to your library..." },
    { title: "Saving your idea", desc: "Almost done..." }
  ];

  const getStandardPlatform = (urlStr: string): Platform => {
    const lowerUrl = urlStr.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "YOUTUBE";
    if (lowerUrl.includes("instagram.com")) return "INSTAGRAM";
    if (lowerUrl.includes("pinterest.com") || lowerUrl.includes("pin.it")) return "PINTEREST";
    if (lowerUrl.includes("reddit.com")) return "REDDIT";
    if (lowerUrl.includes("github.com")) return "GITHUB";
    if (lowerUrl.includes("linkedin.com")) return "LINKEDIN";
    if (lowerUrl.includes("spotify.com") || lowerUrl.includes("apple.com/podcasts")) return "PODCAST";
    if (urlStr.trim() !== "") return "WEBSITE";
    return "OTHER";
  };

  const getDisplayPlatform = (urlStr: string): string => {
    const lowerUrl = urlStr.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "YOUTUBE";
    if (lowerUrl.includes("instagram.com")) return "INSTAGRAM";
    if (lowerUrl.includes("pinterest.com") || lowerUrl.includes("pin.it")) return "PINTEREST";
    if (lowerUrl.includes("x.com") || lowerUrl.includes("twitter.com")) return "X";
    if (lowerUrl.includes("reddit.com")) return "REDDIT";
    if (lowerUrl.includes("linkedin.com")) return "LINKEDIN";
    if (lowerUrl.includes("github.com")) return "GITHUB";
    if (lowerUrl.includes("medium.com") || lowerUrl.includes("substack.com") || lowerUrl.includes("dev.to")) return "ARTICLES";
    if (lowerUrl.includes("spotify.com") || lowerUrl.includes("apple.com/podcasts")) return "PODCASTS";
    if (urlStr.trim() !== "") return "WEBSITE";
    return "OTHER";
  };

  const getTargetCollectionName = (displayPlat: string): string => {
    switch (displayPlat) {
      case "YOUTUBE": return "YouTube";
      case "INSTAGRAM": return "Instagram";
      case "PINTEREST": return "Pinterest";
      case "X": return "X";
      case "REDDIT": return "Reddit";
      case "LINKEDIN": return "LinkedIn";
      case "GITHUB": return "GitHub";
      case "ARTICLES": return "Articles";
      case "PODCASTS": return "Podcasts";
      case "WEBSITE": return "Random Ideas";
      case "OTHER": default: return "Random Ideas";
    }
  };

  // Dynamically analyze URL to detect platform, update display platform, validate URL, and auto-select collection
  useEffect(() => {
    const trimmedUrl = url.trim();
    const stdPlat = getStandardPlatform(trimmedUrl);
    setPlatform(stdPlat);

    if (trimmedUrl === "") {
      setIsUrlValid(true);
      return;
    }

    // URL format validation regex
    const pattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})([\/\w.-]*)*\/?(\?.*)?$/i;
    setIsUrlValid(pattern.test(trimmedUrl));

    const displayPlat = getDisplayPlatform(trimmedUrl);
    const targetColl = getTargetCollectionName(displayPlat);

    if (!hasManuallySelectedBoard) {
      const cleanTarget = targetColl.toLowerCase();
      const existingBoard = localBoardsRef.current.find(b => {
        const cleanB = b.replace(/[^\w\s]/g, "").trim().toLowerCase();
        return cleanB === cleanTarget;
      });

      if (existingBoard) {
        setSelectedBoard(existingBoard);
      } else {
        // Automatically create and add the collection to localBoards if it doesn't exist
        setLocalBoards(prev => {
          if (!prev.includes(targetColl)) {
            return [...prev, targetColl];
          }
          return prev;
        });
        setSelectedBoard(targetColl);
      }
    }
  }, [url, hasManuallySelectedBoard]);

  // Voice memo recording timer and cleanup
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleToggleVoiceRecord = async () => {
    if (!isRecording) {
      setTranscriptionError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        audioChunksRef.current = [];

        let options = {};
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsTranscribing(true);
          try {
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              try {
                const base64Data = (reader.result as string).split(',')[1];
                
                // Immediately send to transcription endpoint
                const response = await fetch("/api/transcribe", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    audioData: base64Data,
                    mimeType: mimeType
                  })
                });

                if (!response.ok) {
                  throw new Error("Unable to transcribe voice. Please try again.");
                }

                const data = await response.json();
                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.transcript && data.transcript.trim() !== "") {
                  const transcriptText = data.transcript.trim();
                  setVoiceTranscript(transcriptText);
                  setNotes(prev => {
                    const trimmedPrev = prev.trim();
                    if (trimmedPrev) {
                      return `${trimmedPrev}\n\n${transcriptText}`;
                    }
                    return transcriptText;
                  });
                }
              } catch (err) {
                console.error("Transcription API error:", err);
                setTranscriptionError("Unable to transcribe voice. Please try again.");
              } finally {
                setIsTranscribing(false);
              }
            };
          } catch (err) {
            console.error("Error preparing audio file:", err);
            setTranscriptionError("Unable to transcribe voice. Please try again.");
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access error:", err);
        setTranscriptionError("Unable to transcribe voice. Please try again.");
      }
    } else {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Click quick notes shortcut tags
  const handleAddQuickTag = (tag: string) => {
    setNotes(prev => {
      const space = prev.trim() === "" ? "" : " ";
      return `${prev}${space}${tag}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() && !url.trim()) {
      alert("Please provide at least a short note or reference URL.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Beautiful step-by-step premium rotating simulation (700ms intervals)
    for (let i = 1; i < analysisSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setAnalysisStep(i);
    }
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      await onSave({
        title: title.trim() || undefined,
        url: url.trim(),
        notes: notes.trim(),
        board: selectedBoard,
        platform: platform,
        imageUrl: imageFile || undefined,
        voiceUrl: recordSeconds > 0 ? "simulated-voice.mp3" : undefined,
        voiceTranscript: voiceTranscript || undefined
      });
      onClose();
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  const displayPlatform = getDisplayPlatform(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#09090B]/85 backdrop-blur-md selection:bg-[#4F8CFF]/30">
      
      {/* Dynamic Saving loading pipeline overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#09090B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center animate-fade-in"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#111217] border border-[#23242B] rounded-2xl w-full max-w-[340px] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative"
            >
              {/* Subtle animated loader (20px) */}
              <div className="mb-4 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#4F8CFF]/20 border-t-[#4F8CFF] border-r-[#8B5CF6] rounded-full animate-spin" />
              </div>

              <motion.h3 
                key={`title-${analysisStep}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-sans font-medium text-base text-white tracking-tight"
              >
                {analysisSteps[analysisStep]?.title || "Saving your idea"}
              </motion.h3>

              <motion.p 
                key={`desc-${analysisStep}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-brand-muted font-sans mt-1.5"
              >
                {analysisSteps[analysisStep]?.desc || "Organizing everything..."}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111217] border border-[#23242B] rounded-3xl w-full max-w-[80%] shadow-2xl overflow-hidden relative font-sans"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#23242B] flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-normal text-white uppercase tracking-wide flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] fill-current" /> SAVE INSPIRATION
            </h2>
            <p className="text-[11px] text-brand-muted mt-1.5 font-medium leading-relaxed">Capture the idea before you forget why it mattered.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-brand-muted hover:text-white p-1 rounded-lg border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Inspiration Title */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block mb-1.5 font-bold">
              INSPIRATION TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Example: "Cinematic Slow Motion Lighting"'
              className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3.5 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-sans font-medium"
            />
            <p className="text-[10px] text-brand-muted mt-1.5 font-sans font-normal leading-relaxed">
              Optional. If left empty, IdeaVault will generate a short descriptive title from your notes or voice memo.
            </p>
          </div>

          {/* 2. Why did you save this? */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">
                WHY DID YOU SAVE THIS?
              </label>
              <span className="text-[10px] font-mono text-brand-muted font-bold">{notes.length} characters</span>
            </div>
            
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Example: "I love how the creator uses slow camera movement and soft lighting. I want to recreate this mood in my next video."'
              className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3.5 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 resize-none font-sans leading-relaxed font-medium"
            />

            {/* Quick tag attachments */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              <span className="text-[10px] font-mono text-brand-muted py-1 flex items-center font-bold uppercase tracking-wider">Add context tags:</span>
              {["+Hooks", "+Aesthetic Spacing", "+B-Roll Angle", "+Copywriting", "+Interactive Widget"].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddQuickTag(tag)}
                  className="text-[9px] font-mono px-3 py-1.5 rounded-full bg-[#09090B] border border-[#23242B] hover:border-[#4F8CFF]/50 text-brand-muted hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Voice Memo */}
          <div className={`rounded-xl p-5 border transition-all ${
            isRecording ? "bg-red-950/10 border-red-900/40" : "bg-[#09090B] border-[#23242B]"
          }`}>
            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">VOICE MEMO</span>
              <p className="text-[11px] text-brand-muted mt-1 leading-relaxed font-medium">
                Prefer speaking instead of typing? Record a short voice note and we'll place the transcript into your notes automatically.
              </p>
            </div>

            {isTranscribing ? (
              <div className="flex items-center gap-2 bg-[#111217] border border-[#23242B] px-3 py-2.5 rounded-lg justify-center">
                <div className="w-3.5 h-3.5 border-2 border-[#4F8CFF]/20 border-t-[#4F8CFF] rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-[#4F8CFF] font-bold uppercase tracking-wider">TRANSCRIBING AUDIO...</span>
              </div>
            ) : isRecording ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-mono text-red-400 font-bold">RECORDING: 0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}</span>
                </div>
                
                {/* Glowing simple waveform */}
                <div className="flex items-end gap-0.5 h-4 w-16">
                  <div className="flex-1 bg-red-400 h-2 animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="flex-1 bg-red-400 h-4 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  <div className="flex-1 bg-red-400 h-1 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="flex-1 bg-red-400 h-3 animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>

                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-[9px] uppercase font-bold cursor-pointer"
                >
                  Stop
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  className="w-full bg-[#111217] hover:bg-[#09090B] border border-[#23242B] hover:border-[#4F8CFF]/50 text-white font-mono text-[10px] tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold uppercase"
                >
                  <Mic className="w-3.5 h-3.5 text-[#4F8CFF]" /> Record Voice Memo
                </button>
                {transcriptionError && (
                  <div className="text-[10px] text-red-400 font-mono font-bold flex items-center gap-1.5 uppercase justify-center bg-red-950/10 border border-red-900/30 py-1.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5" /> {transcriptionError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Reference Link */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">
              REFERENCE LINK
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste any YouTube, Instagram, X, Pinterest, website, or article link."
                className="w-full bg-[#09090B] border border-[#23242B] rounded-xl pl-10 pr-24 py-3.5 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
              />
              <Link2 className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-muted" />
              
              {/* Live Platform Indicator badge */}
              <div className="absolute right-3.5 top-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-mono border uppercase tracking-wider font-bold ${
                  displayPlatform === "YOUTUBE" ? "bg-red-950/60 text-red-400 border-red-900/40" :
                  displayPlatform === "INSTAGRAM" ? "bg-[#4F8CFF]/10 text-[#4F8CFF] border-[#4F8CFF]/25" :
                  displayPlatform === "PINTEREST" ? "bg-rose-950/60 text-rose-400 border-rose-900/40" :
                  displayPlatform === "WEBSITE" ? "bg-teal-950/60 text-teal-400 border-teal-900/40" :
                  displayPlatform === "REDDIT" ? "bg-orange-950/60 text-orange-400 border-orange-900/40" :
                  displayPlatform === "LINKEDIN" ? "bg-blue-950/60 text-blue-400 border-blue-900/40" :
                  displayPlatform === "GITHUB" ? "bg-purple-950/60 text-purple-400 border-purple-900/40" :
                  displayPlatform === "X" ? "bg-zinc-900 text-zinc-300 border-zinc-700" :
                  displayPlatform === "ARTICLES" ? "bg-amber-950/60 text-amber-400 border-amber-900/40" :
                  displayPlatform === "PODCASTS" ? "bg-indigo-950/60 text-indigo-400 border-indigo-900/40" :
                  displayPlatform === "OTHER" ? "bg-zinc-950 text-zinc-400 border-zinc-800" :
                  "bg-[#09090B] text-[#4F8CFF] border-[#23242B]"
                }`}>
                  {displayPlatform}
                </span>
              </div>
            </div>
            {!isUrlValid && url.trim() !== "" && (
              <p className="text-[10px] text-red-400 font-sans mt-1.5 leading-relaxed font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Please enter a valid reference URL format.
              </p>
            )}
          </div>

          {/* 5. Reference Image */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block mb-1.5 font-bold">
              REFERENCE IMAGE
            </label>
            <p className="text-[11px] text-brand-muted mb-2 font-medium">
              Optional screenshot or image for visual reference.
            </p>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-[#09090B] rounded-xl border border-dashed border-[#23242B] p-5 text-center flex flex-col justify-center items-center group cursor-pointer hover:border-[#4F8CFF]/40 transition-all duration-300 min-h-[120px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              {imageFile ? (
                <div className="relative w-full max-h-32 rounded overflow-hidden">
                  <img referrerPolicy="no-referrer" src={imageFile} className="w-full h-full object-contain max-h-28" alt="uploaded reference" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-[#09090B] border border-[#23242B] hover:bg-red-950/40 text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-brand-muted group-hover:text-[#4F8CFF] transition-colors mb-2" />
                  <span className="text-[10px] font-mono text-white font-bold uppercase tracking-wider">Attach Reference Image</span>
                  <p className="text-[8px] text-brand-muted mt-1 uppercase font-bold tracking-wider">DRAG & DROP OR TAP TO SELECT</p>
                </>
              )}
            </div>
          </div>

          {/* 6. Collection */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block mb-1.5 font-bold">
              SAVE TO COLLECTION
            </label>
            <div className="relative">
              <select
                value={selectedBoard}
                onChange={(e) => {
                  setSelectedBoard(e.target.value);
                  setHasManuallySelectedBoard(true);
                }}
                className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#4F8CFF]/60 appearance-none font-sans font-medium uppercase"
              >
                {localBoards.map(board => (
                  <option key={board} value={board}>
                    {board.replace(/[^\w\s]/g, "").trim().toUpperCase()}
                  </option>
                ))}
              </select>
              <Folder className="absolute right-4 top-3.5 w-4 h-4 text-brand-muted pointer-events-none" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-5 border-t border-[#23242B]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono tracking-widest text-brand-muted hover:text-white px-4 py-2 transition-colors cursor-pointer font-bold uppercase"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] text-white font-sans font-bold text-xs tracking-widest px-6 py-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] cursor-pointer uppercase font-semibold"
            >
              SAVE TO VAULT <CheckCircle className="w-4 h-4" />
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
