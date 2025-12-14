
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Music2 } from 'lucide-react';

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const startAudio = async () => {
        if (audioRef.current) {
            try {
                audioRef.current.volume = 0.4;
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (err) {
                // Autoplay was prevented.
                // We don't set isPlaying(true) here because it's not actually playing.
                // Instead, we wait for the first interaction.
                console.log("Autoplay waiting for interaction");
            }
        }
    };

    startAudio();

    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Playback failed:", e));
      }
    };

    // Listen for any interaction to trigger audio
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2">
      <audio ref={audioRef} src="/khmer.mp3" loop preload="auto" />
      
      <button 
        onClick={togglePlay}
        className={`group flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all duration-300 backdrop-blur-xl border shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
          isPlaying 
            ? 'bg-slate-900/80 border-slate-700 text-white dark:bg-white/90 dark:border-white/20 dark:text-slate-900' 
            : 'bg-white/80 border-slate-200 text-slate-600 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-300'
        }`}
      >
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            isPlaying ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
        } transition-colors duration-300`}>
             {isPlaying ? (
                 <div className="flex gap-0.5 items-end justify-center h-3 pb-0.5">
                    <span className="w-0.5 bg-white animate-[bounce_0.8s_infinite] rounded-full h-2"></span>
                    <span className="w-0.5 bg-white animate-[bounce_1s_infinite] rounded-full h-3"></span>
                    <span className="w-0.5 bg-white animate-[bounce_0.6s_infinite] rounded-full h-1.5"></span>
                 </div>
             ) : (
                <Music2 className="w-4 h-4" />
             )}
        </div>

        <div className="flex flex-col items-start overflow-hidden">
            <span className="text-[10px] font-bold leading-tight font-['Kantumruy_Pro'] whitespace-nowrap">
                គន់មើលទៅមេឃ
            </span>
            <span className="text-[8px] opacity-70 leading-none uppercase tracking-wider font-sans">
                {isPlaying ? 'Playing' : 'Paused'}
            </span>
        </div>
      </button>
    </div>
  );
};

export default AudioPlayer;
