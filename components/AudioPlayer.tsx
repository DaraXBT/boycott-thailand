
import React, { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt autoplay on mount
    const attemptPlay = async () => {
        if (audioRef.current) {
            try {
                audioRef.current.volume = 0.5; // Start at 50% volume
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (err) {
                console.log("Autoplay prevented by browser policy. Waiting for interaction.");
                setIsPlaying(false);
            }
        }
    };
    attemptPlay();

    // Add a one-time click listener to document to unlock audio if autoplay failed
    const unlockAudio = () => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(e => console.error(e));
        }
        document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);

    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-1000">
      <audio ref={audioRef} src="/khmer.mp3" loop />
      
      <button 
        onClick={togglePlay}
        className={`group relative flex items-center gap-3 pl-2 pr-4 py-2 rounded-full shadow-2xl transition-all duration-500 ease-out border ${
          isPlaying 
            ? 'bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 border-slate-700 dark:border-slate-200' 
            : 'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white border-border hover:scale-105'
        } backdrop-blur-md`}
      >
        {/* Rotating Icon Container */}
        <div className={`relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden ${isPlaying ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-inner' : 'bg-slate-100 dark:bg-slate-700'} transition-all duration-500`}>
             <div className={`absolute inset-0 border-[3px] border-dashed border-white/20 rounded-full ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
             {isPlaying ? (
                 <div className="flex gap-0.5 items-end justify-center h-4 pb-1">
                    <span className="w-1 bg-white animate-[bounce_1s_infinite] rounded-full h-2"></span>
                    <span className="w-1 bg-white animate-[bounce_1.2s_infinite] rounded-full h-3"></span>
                    <span className="w-1 bg-white animate-[bounce_0.8s_infinite] rounded-full h-2"></span>
                 </div>
             ) : (
                 <Play className="w-4 h-4 ml-0.5 text-slate-500 dark:text-slate-300 relative z-10" fill="currentColor" />
             )}
        </div>

        <div className="flex flex-col text-left mr-1">
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-60 leading-none mb-1">
                {isPlaying ? 'Now Playing' : 'Music'}
            </span>
            <span className="text-xs font-bold leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] font-['Kantumruy_Pro']">
                គន់មើលទៅមេឃ
            </span>
        </div>

        {isPlaying && (
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;
