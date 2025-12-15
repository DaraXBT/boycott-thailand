
import React, { useRef, useState, useEffect } from 'react';
import { Loader2, Play, AlertCircle } from 'lucide-react';

// --- CONFIGURATION ---
// Using Cambodian National Anthem (Nokor Reach) as a default working stream.
// You can replace this with "/khmer.mp3" if you add the file to your public folder later.
const AUDIO_URL = "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/83/Nokoreach_-_Instrumental.ogg/Nokoreach_-_Instrumental.ogg.mp3";

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
        const code = audio.error ? audio.error.code : 'Unknown';
        console.warn(`Audio playback issue (Code ${code}). Please ensure the audio URL is accessible.`);
        
        setHasError(true);
        setIsLoading(false);
        setIsPlaying(false);
    };

    // Attach listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    // Trigger load (explicitly helpful even with src attr in some edge cases)
    audio.load();

    return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.pause();
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    
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

  // If there's an error, we hide the player to keep the UI beautiful
  if (hasError) {
      return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 
        FIX: Applied src directly to audio element instead of child <source> tag.
        React handles specific media attributes better on the parent element.
      */}
      <audio 
        ref={audioRef} 
        src={AUDIO_URL}
        loop 
        preload="auto" 
        playsInline 
      />
      
      <button 
        onClick={togglePlay}
        disabled={hasError}
        className={`group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-500 backdrop-blur-md border shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
          hasError
            ? 'bg-red-50 border-red-200 cursor-not-allowed opacity-90'
            : isPlaying 
                ? 'bg-slate-900/90 border-slate-700 text-white dark:bg-white/90 dark:border-white/20 dark:text-slate-900' 
                : 'bg-white/80 border-slate-200 text-slate-500 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-400'
        }`}
      >
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            hasError 
                ? 'bg-red-100 text-red-600'
                : isPlaying 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800'
        } transition-colors duration-500 relative overflow-hidden`}>
             {hasError ? (
                 <AlertCircle className="w-4 h-4" />
             ) : isLoading ? (
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
            <span className={`text-[10px] font-bold leading-none font-['Kantumruy_Pro'] whitespace-nowrap mb-0.5 ${hasError ? 'text-red-800' : ''}`}>
               {hasError ? 'Audio Error' : 'បទ នគររាជ'}
            </span>
            <span className={`text-[8px] opacity-70 leading-none uppercase tracking-wider font-sans font-medium ${hasError ? 'text-red-600' : ''}`}>
                {hasError ? 'File Missing' : (isLoading ? 'Loading...' : (isPlaying ? 'Playing' : 'National Anthem'))}
            </span>
        </div>
      </button>
    </div>
  );
};

export default AudioPlayer;
