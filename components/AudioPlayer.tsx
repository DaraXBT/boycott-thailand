
import React, { useRef, useState, useEffect } from 'react';
import { Music2, AlertCircle, Loader2 } from 'lucide-react';

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.6;

    const handleCanPlay = () => {
        setIsLoading(false);
        // Attempt autoplay once loaded
        audio.play()
            .then(() => {
                setIsPlaying(true);
                setHasError(false);
            })
            .catch(() => {
                // Autoplay blocked, expected
                setIsPlaying(false);
            });
    };

    audio.addEventListener('canplay', handleCanPlay);
    
    // Check if already ready
    if (audio.readyState >= 3) {
        handleCanPlay();
    }

    // Interaction listeners to unlock audio context if needed
    const unlockAudio = () => {
        if (audio.paused && !hasError) {
            // We don't force play here, just let the user click the button.
            // But we can ensure audio context is resumed if we were using Web Audio API (not used here).
        }
        removeListeners();
    };

    const removeListeners = () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        removeListeners();
    };
  }, [hasError]);

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
                console.error("Toggle play failed:", err);
                setIsPlaying(false);
            });
      }
    }
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const audioEl = e.currentTarget;
      // Only set global error if the audio element itself failed (all sources failed)
      if (audioEl.error) {
          console.error(`Audio Error: ${audioEl.error.code} - ${audioEl.error.message}`);
          setHasError(true);
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        onError={handleAudioError}
        playsInline
      >
        <source src="/khmer.mp3" type="audio/mpeg" />
        <source src="khmer.mp3" type="audio/mpeg" />
      </audio>
      
      <button 
        onClick={togglePlay}
        disabled={hasError}
        className={`group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all duration-500 backdrop-blur-md border shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
          hasError 
            ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/50 dark:border-red-800 dark:text-red-400 cursor-not-allowed'
            : isPlaying 
                ? 'bg-slate-900/90 border-slate-700 text-white dark:bg-white/90 dark:border-white/20 dark:text-slate-900' 
                : 'bg-white/80 border-slate-200 text-slate-500 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-400'
        }`}
      >
        <div className={`w-7 h-7 flex items-center justify-center rounded-full ${
            hasError 
              ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200'
              : isPlaying 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800'
        } transition-colors duration-500`}>
             {hasError ? (
                 <AlertCircle className="w-3.5 h-3.5" />
             ) : isLoading ? (
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
                {hasError ? 'Cannot Load Audio' : 'គន់មើលទៅមេឃ'}
            </span>
            <span className="text-[8px] opacity-70 leading-none uppercase tracking-wider font-sans font-medium">
                {hasError ? 'File Missing?' : (isLoading ? 'Loading...' : (isPlaying ? 'On Air' : 'Tap to Play'))}
            </span>
        </div>
      </button>
    </div>
  );
};

export default AudioPlayer;
