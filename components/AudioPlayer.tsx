
import React, { useRef, useState, useEffect } from 'react';
import { Music2, Loader2 } from 'lucide-react';

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume to be non-intrusive
    audio.volume = 0.4;

    const onMetadataLoaded = () => {
        setIsLoading(false);
    };

    const onCanPlay = () => {
        setIsLoading(false);
        // Only attempt autoplay if not already playing and no error
        if (audio.paused && !hasError) {
             const playPromise = audio.play();
             
             if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => {
                        // Autoplay blocked by browser policy - normal behavior
                        // We simply stay in "paused" state and let user click to play
                        setIsPlaying(false);
                    });
             }
        }
    };

    // Safety timeout in case events fail to fire
    const safetyTimeout = setTimeout(() => {
        if (isLoading) setIsLoading(false);
    }, 2000);

    audio.addEventListener('loadedmetadata', onMetadataLoaded);
    audio.addEventListener('canplay', onCanPlay);
    
    // Check immediate state
    if (audio.readyState >= 1) setIsLoading(false);
    if (audio.readyState >= 3) onCanPlay();

    return () => {
        audio.removeEventListener('loadedmetadata', onMetadataLoaded);
        audio.removeEventListener('canplay', onCanPlay);
        clearTimeout(safetyTimeout);
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
                console.error("Manual play failed:", err);
                // If manual play fails, it might be a source error
                if (audioRef.current?.error) setHasError(true);
                setIsPlaying(false);
            });
      }
    }
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const audioEl = e.currentTarget;
      if (audioEl.error) {
          console.error(`Audio Error: ${audioEl.error.code} - ${audioEl.error.message}`);
          setHasError(true);
          setIsLoading(false);
      }
  };

  if (hasError) return null; // Hide completely if file missing

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
