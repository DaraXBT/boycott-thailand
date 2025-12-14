
import React, { useRef, useState, useEffect } from 'react';
import { Music2 } from 'lucide-react';

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume to a reasonable level
    audio.volume = 0.6;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setHasError(false);
      } catch (err) {
        // Autoplay blocked. This is expected in modern browsers.
        console.log("Autoplay blocked. Waiting for interaction...");
        setIsPlaying(false);
        
        // Add one-time listeners to unlock audio on first user interaction
        const unlockAudio = () => {
           if (audio.paused) {
             audio.play()
                .then(() => {
                    setIsPlaying(true);
                    setHasError(false);
                })
                .catch(e => console.error("Play failed after interaction"));
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
        
        // Cleanup function for the effect
        return removeListeners;
      }
    };

    playAudio();
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
            .catch(e => {
                console.error("Toggle play failed");
                setIsPlaying(false);
            });
      }
    }
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      // When using <source> tags, the error event fires on the <source> element if it fails.
      // React's onError captures this. However, if the <audio> element itself hasn't failed (e.g. it might try another source),
      // e.currentTarget.error will be null. We should only treat it as a fatal error if audio.error exists.
      
      const audioEl = e.currentTarget;
      
      if (audioEl.error) {
        console.error(`Audio loading error: Code ${audioEl.error.code}, Message: ${audioEl.error.message}`);
        setHasError(true);
        setIsPlaying(false);
      } else {
        // This is likely a non-fatal error from a <source> tag.
        // We log it as a warning but don't hide the player yet, hoping a fallback works.
        console.warn("Audio source failed to load, trying fallback...");
      }
  };

  if (hasError) return null; // Hide player if broken

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        onError={handleAudioError}
      >
        <source src="/khmer.mp3" type="audio/mpeg" />
        <source src="khmer.mp3" type="audio/mpeg" />
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
            isPlaying ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
        } transition-colors duration-500`}>
             {isPlaying ? (
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
                {isPlaying ? 'On Air' : 'Tap to Play'}
            </span>
        </div>
      </button>
    </div>
  );
};

export default AudioPlayer;
