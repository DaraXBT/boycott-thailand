
import React, { useRef, useState, useEffect } from 'react';
import { Music2, Loader2, AlertCircle } from 'lucide-react';

// --- CONFIGURATION ---
// Option 1: Paste a direct URL to your hosted mp3 file here.
// NOTE: Google Drive "view" links need to be converted to "download" links to stream directly.
const EXTERNAL_AUDIO_URL = "https://docs.google.com/uc?export=download&id=1mHwKJir2h2MBSv0qZbRkrTkR4Ey8cNOZ"; 

// Option 2: Local files (Ensure khmer.mp3 is inside the 'public' folder of your project)
const LOCAL_PATH_1 = "/music/khmer.mp3";
const LOCAL_PATH_2 = "/khmer.mp3";

// Option 3: Fallback (A reliable test stream to prove the player works if others fail)
const FALLBACK_TEST_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3"; 

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume
    audio.volume = 0.5;

    const onCanPlay = () => {
        setIsLoading(false);
        setHasError(false);
        
        // Attempt autoplay
        if (audio.paused) {
             const playPromise = audio.play();
             if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch((error) => {
                        console.log("Autoplay prevented:", error);
                        setIsPlaying(false);
                    });
             }
        }
    };

    const onError = (e: Event | React.SyntheticEvent) => {
        console.error("Audio Error Event:", e);
        // If the audio element itself errors out (not just a source), we show the error state
        if (audio.error) {
            console.error("Media Error Code:", audio.error.code, audio.error.message);
            setHasError(true);
            setIsLoading(false);
        }
    };

    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError); 
    
    // Check state immediately in case it loaded before listeners attached
    if (audio.readyState >= 3) onCanPlay();

    return () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
            .then(() => {
                setIsPlaying(true);
                setHasError(false);
            })
            .catch((err) => {
                console.error("Play failed:", err);
                setIsPlaying(false);
            });
      }
    }
  };

  if (hasError) {
      return (
        <div className="fixed bottom-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-red-50/90 border border-red-200 shadow-sm backdrop-blur-md">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-red-800">Music Failed</span>
             </div>
        </div>
      );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 
          The audio element with multiple sources. 
          The browser tries them in order from top to bottom.
      */}
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        playsInline
      >
        {/* 1. Priority: External URL (Google Drive Direct Link) */}
        {EXTERNAL_AUDIO_URL && <source src={EXTERNAL_AUDIO_URL} type="audio/mpeg" />}
        
        {/* 2. Priority: Local Music Folder */}
        <source src={LOCAL_PATH_1} type="audio/mpeg" />
        
        {/* 3. Priority: Local Root Folder */}
        <source src={LOCAL_PATH_2} type="audio/mpeg" />

        {/* 4. Fallback: Known working internet URL */}
        <source src={FALLBACK_TEST_URL} type="audio/mpeg" />
      </audio>
      
      <button 
        onClick={togglePlay}
        className={`group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-500 backdrop-blur-md border shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
          isPlaying 
            ? 'bg-slate-900/90 border-slate-700 text-white dark:bg-white/90 dark:border-white/20 dark:text-slate-900' 
            : 'bg-white/80 border-slate-200 text-slate-500 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-400'
        }`}
      >
        <div className={`w-7 h-7 flex items-center justify-center rounded-full ${
            isPlaying 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-800'
        } transition-colors duration-500`}>
             {isLoading ? (
                 <Loader2 className="w-3.5 h-3.5 animate-spin" />
             ) : isPlaying ? (
                 <div className="flex gap-0.5 items-end justify-center h-2.5 pb-0.5">
                    <span className="w-0.5 bg-white animate-[bounce_0.8s_infinite] rounded-full h-1.5"></span>
                    <span className="w-0.5 bg-white animate-[bounce_1s_infinite] rounded-full h-2.5"></span>
                    <span className="w-0.5 bg-white animate-[bounce_0.6s_infinite] rounded-full h-1"></span>
                 </div>
             ) : (
                <Music2 className="w-3.5 h-3.5" />
             )}
        </div>

        <div className="flex flex-col items-start overflow-hidden">
            <span className="text-[10px] font-bold leading-none font-['Kantumruy_Pro'] whitespace-nowrap mb-0.5">
               គន់មើលទៅមេឃ 
            </span>
            <span className="text-[8px] opacity-70 leading-none uppercase tracking-wider font-sans font-medium">
                {isLoading ? 'Loading...' : (isPlaying ? 'Playing' : 'Play Music')}
            </span>
        </div>
      </button>
    </div>
  );
};

export default AudioPlayer;
