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
  const [selectedBoard, setSelectedBoard] = useState(boards[1] || "💡 Random Ideas");
  const [platform, setPlatform] = useState<Platform>("OTHER");
  
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
    "Establishing secure connection to Gemini API...",
    "Uploading content parameters & metadata...",
    "Extracting creative copywriting hooks...",
    "Structuring vertical content blueprints...",
    "Running adapt-and-reuse guidelines...",
    "Cataloging secured asset to Supabase vault..."
  ];

  // Dynamically analyze URL to detect platform
  useEffect(() => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      setPlatform("YOUTUBE");
    } else if (lowerUrl.includes("instagram.com")) {
      setPlatform("INSTAGRAM");
    } else if (lowerUrl.includes("pinterest.com") || lowerUrl.includes("pin.it")) {
      setPlatform("PINTEREST");
    } else if (lowerUrl.includes("reddit.com")) {
      setPlatform("REDDIT");
    } else if (lowerUrl.includes("github.com")) {
      setPlatform("GITHUB");
    } else if (lowerUrl.includes("linkedin.com")) {
      setPlatform("LINKEDIN");
    } else if (lowerUrl.includes("spotify.com") || lowerUrl.includes("apple.com/podcasts")) {
      setPlatform("PODCAST");
    } else if (url.trim() !== "") {
      setPlatform("WEBSITE");
    } else {
      setPlatform("OTHER");
    }
  }, [url]);

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
                  // Replace the textarea content with the actual transcript
                  setNotes(data.transcript.trim());
                } else {
                  setNotes("");
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

    // Beautiful step-by-step pipeline countdown simulation
    for (let i = 1; i < analysisSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setAnalysisStep(i);
    }
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      await onSave({
        title: title.trim() || undefined,
        url: url.trim(),
        notes: notes.trim(),
        board: selectedBoard,
        platform: platform,
        imageUrl: imageFile || undefined,
        voiceUrl: recordSeconds > 0 ? "simulated-voice.mp3" : undefined
      });
      onClose();
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#09090B]/85 backdrop-blur-md selection:bg-[#4F8CFF]/30">
      
      {/* Dynamic AI Analysis loading pipeline overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#09090B]/95 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-[#4F8CFF]/20 border-t-[#4F8CFF] rounded-full animate-spin" />
              <Sparkles className="w-6 h-6 text-[#4F8CFF] absolute inset-0 m-auto animate-pulse" />
            </div>

            <motion.h3 
              key={analysisStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-normal text-3xl text-white tracking-wide uppercase"
            >
              CO-PILOT STRUCTURING ACTIVE
            </motion.h3>

            <p className="text-brand-muted text-xs font-mono mt-4 max-w-sm h-8 uppercase font-bold tracking-wider">
              {analysisSteps[analysisStep]}
            </p>

            <div className="w-48 bg-[#23242B] h-1 rounded-full mt-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#8B5CF6] to-[#4F8CFF] h-full transition-all duration-300 animate-pulse"
                style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
              />
            </div>
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
              <Sparkles className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] fill-current" /> Secure Inspiration
            </h2>
            <p className="text-[11px] text-brand-muted mt-1.5 font-medium leading-relaxed">Paste link, write notes, or dictate voice thoughts. Gemini models auto-structure creative blueprints.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-brand-muted hover:text-white p-1 rounded-lg border border-[#23242B] hover:border-brand-muted/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Main notes textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">
                Why did this inspire you? <span className="text-[#4F8CFF]">*</span>
              </label>
              <span className="text-[10px] font-mono text-brand-muted font-bold">{notes.length} characters</span>
            </div>
            
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., I love the mathematical Bauhaus grid spacing used in this portfolio card. It balances standard items cleanly..."
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

          {/* Reference URL section with real-time platform badge */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white block mb-1.5 font-bold">
              Reference Link / URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://pinterest.com/pin/..."
                className="w-full bg-[#09090B] border border-[#23242B] rounded-xl pl-10 pr-24 py-3.5 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-mono"
              />
              <Link2 className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-muted" />
              
              {/* Live Platform Indicator badge */}
              <div className="absolute right-3.5 top-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-mono border uppercase tracking-wider font-bold ${
                  platform === "YOUTUBE" ? "bg-red-950/60 text-red-400 border-red-900/40" :
                  platform === "INSTAGRAM" ? "bg-[#4F8CFF]/10 text-[#4F8CFF] border-[#4F8CFF]/25" :
                  platform === "PINTEREST" ? "bg-rose-950/60 text-rose-400 border-rose-900/40" :
                  platform === "WEBSITE" ? "bg-teal-950/60 text-teal-400 border-teal-900/40" :
                  platform === "OTHER" ? "bg-zinc-950 text-zinc-400 border-zinc-800" :
                  "bg-[#09090B] text-[#4F8CFF] border-[#23242B]"
                }`}>
                  {platform}
                </span>
              </div>
            </div>
          </div>

          {/* Image drag-and-drop simulated file uploader & Voice dictation split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Image attachment box */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-[#09090B] rounded-xl border border-dashed border-[#23242B] p-5 text-center flex flex-col justify-center items-center group cursor-pointer hover:border-[#4F8CFF]/40 transition-all duration-300"
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

            {/* Simulated Voice thought recorder */}
            <div className={`rounded-xl p-5 flex flex-col justify-between border ${
              isRecording ? "bg-red-950/10 border-red-900/40" : "bg-[#09090B] border-[#23242B]"
            }`}>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-brand-muted font-bold">SPEAK YOUR THOUGHTS</span>
                <p className="text-[10px] text-brand-muted mt-1 leading-relaxed font-medium">
                  Record up to 15 seconds. AI instantly processes speech into notes context.
                </p>
              </div>

              {isTranscribing ? (
                <div className="flex items-center gap-2 mt-4 bg-[#111217] border border-[#23242B] px-3 py-2.5 rounded-lg justify-center">
                  <div className="w-3.5 h-3.5 border-2 border-[#4F8CFF]/20 border-t-[#4F8CFF] rounded-full animate-spin" />
                  <span className="text-[10px] font-mono text-[#4F8CFF] font-bold uppercase tracking-wider">TRANSCRIBING AUDIO...</span>
                </div>
              ) : isRecording ? (
                <div className="flex items-center justify-between mt-4">
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
                <div className="space-y-2 mt-4">
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecord}
                    className="w-full bg-[#111217] hover:bg-[#09090B] border border-[#23242B] hover:border-[#4F8CFF]/50 text-white font-mono text-[9px] tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold uppercase"
                  >
                    <Mic className="w-3.5 h-3.5 text-[#4F8CFF]" /> ● RECORD AUDIO VOICE MEMO
                  </button>
                  {transcriptionError && (
                    <div className="text-[10px] text-red-400 font-mono font-bold flex items-center gap-1.5 uppercase justify-center bg-red-950/10 border border-red-900/30 py-1.5 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5" /> {transcriptionError}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Inspiration Title and Board selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block mb-1.5 font-bold">
                Inspiration Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auto-generated if left empty"
                className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white placeholder-brand-muted/40 focus:outline-none focus:border-[#4F8CFF]/60 font-sans font-medium"
              />
            </div>

            {/* Board Selection */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-brand-muted block mb-1.5 font-bold">
                Target Inspiration Board
              </label>
              <div className="relative">
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#23242B] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#4F8CFF]/60 appearance-none font-sans font-medium"
                >
                  {boards.map(board => (
                    <option key={board} value={board}>
                      {board.replace(/[^\w\s]/g, "").trim().toUpperCase()}
                    </option>
                  ))}
                </select>
                <Folder className="absolute right-4 top-3.5 w-4 h-4 text-brand-muted pointer-events-none" />
              </div>
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
              SECURE INSPIRATION <Sparkles className="w-4 h-4" />
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
