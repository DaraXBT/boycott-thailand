
import React, { useRef, useState, useEffect } from 'react';
import { Loader2, Play } from 'lucide-react';

// --- CONFIGURATION ---
// Local File (Must be in 'public/khmer.mp3')
const AUDIO_URL = "/khmer.mp3";

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset volume
    audio.volume = 0.5;

    const handleCanPlay = () => {
        setIsLoading(false);
        setHasError(false);
        
        // Attempt autoplay only if we haven't already interacted
        // (Browsers might block this, which is fine)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch((err) => {
                    console.log("Autoplay paused (waiting for user interaction):", err);
                    setIsPlaying(false);
                });
        }
    };

    const handleError = () => {
        // Code 4 usually means MEDIA_ELEMENT_ERROR: Format error
        // In SPA context, this often happens if the file is missing and the server returns index.html (text/html)
        // instead of the audio file.
        const code = audio.error ? audio.error.code : 'Unknown';
        console.warn(`Audio playback issue (Code ${code}). Please ensure 'public/khmer.mp3' exists.`);
        
        // We set error state but don't crash the component
        setHasError(true);
        setIsLoading(false);
        setIsPlaying(false);
    };

    // Attach listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    // Trigger load to ensure source changes are picked up
    audio.load();

    return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.pause();
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
                console.error("Playback failed:", err);
                setIsPlaying(false);
            });
      }
    }
  };

  // If error, we hide the player to avoid clutter, 
  // or show a small error state if debugging is needed.
  if (hasError) {
      return null; 
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <audio ref={audioRef} loop preload="auto" playsInline>
          <source src={AUDIO_URL} type="audio/mpeg" />
      </audio>
      
      <button 
        onClick={togglePlay}
        className={`group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-500 backdrop-blur-md border shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
          isPlaying 
            ? 'bg-slate-900/90 border-slate-700 text-white dark:bg-white/90 dark:border-white/20 dark:text-slate-900' 
            : 'bg-white/80 border-slate-200 text-slate-500 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-400'
        }`}
      >
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            isPlaying 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-800'
        } transition-colors duration-500 relative overflow-hidden`}>
             {isLoading ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
             ) : isPlaying ? (
                 <>
                    <div className="flex gap-0.5 items-end justify-center h-3 pb-0.5 relative z-10">
                        <span className="w-0.5 bg-white animate-[bounce_0.8s_infinite] rounded-full h-1.5"></span>
                        <span className="w-0.5 bg-white animate-[bounce_1s_infinite] rounded-full h-2.5"></span>
                        <span className="w-0.5 bg-white animate-[bounce_0.6s_infinite] rounded-full h-1"></span>
                    </div>
                 </>
             ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
             )}
        </div>

        <div className="flex flex-col items-start overflow-hidden min-w-[60px]">
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
