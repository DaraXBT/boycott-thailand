
import React, { useRef, useState, useEffect } from 'react';
import { Loader2, Play, AlertCircle } from 'lucide-react';

// --- CONFIGURATION ---
// The SoundCloud link provided
const SC_TRACK_URL = "https://soundcloud.com/drv27/khmer";

// Declare SoundCloud Widget API types on window
declare global {
  interface Window {
    SC: any;
  }
}

const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // 1. Inject SoundCloud Widget API Script if not present
    const scriptId = 'sc-widget-api';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // 2. Initialize Widget once script is loaded
    const initWidget = () => {
        if (window.SC && iframeRef.current && !widgetRef.current) {
            try {
                const widget = window.SC.Widget(iframeRef.current);
                widgetRef.current = widget;
                
                widget.bind(window.SC.Widget.Events.READY, () => {
                    setIsReady(true);
                    setHasError(false);
                    widget.setVolume(50);
                    
                    // Attempt autoplay (might be blocked by browser policies)
                    widget.play(); 
                });

                // Sync UI state with Widget events
                widget.bind(window.SC.Widget.Events.PLAY, () => setIsPlaying(true));
                widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));
                
                // Handle looping manually
                widget.bind(window.SC.Widget.Events.FINISH, () => {
                    widget.seekTo(0);
                    widget.play();
                });

                widget.bind(window.SC.Widget.Events.ERROR, () => {
                    console.warn("SoundCloud Widget Error");
                    setHasError(true);
                });
            } catch (err) {
                console.error("Widget init error:", err);
            }
        }
    };

    // Poll for SC object availability
    const interval = setInterval(() => {
        if (window.SC) {
            initWidget();
            clearInterval(interval);
        }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (!widgetRef.current || !isReady || hasError) return;
    
    widgetRef.current.isPaused((paused: boolean) => {
        if (paused) {
            widgetRef.current.play();
        } else {
            widgetRef.current.pause();
        }
    });
  };

  // If critical error, hide component
  if (hasError) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hidden SoundCloud Iframe Widget */}
      <iframe
        ref={iframeRef}
        id="sc-widget"
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        // Clean URL to ensure permalink works
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(SC_TRACK_URL.split('?')[0])}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
        style={{ display: 'none' }} 
        title="SoundCloud Player"
      />
      
      <button 
        onClick={togglePlay}
        disabled={!isReady || hasError}
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
             ) : !isReady ? (
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
               {hasError ? 'Audio Error' : 'គន់មើលទៅមេឃ'}
            </span>
            <span className={`text-[8px] opacity-70 leading-none uppercase tracking-wider font-sans font-medium ${hasError ? 'text-red-600' : ''}`}>
                {hasError ? 'Stream Failed' : (!isReady ? 'Loading...' : (isPlaying ? 'Playing' : 'Play Music'))}
            </span>
        </div>
      </button>
    </div>
  );
};

export default AudioPlayer;
