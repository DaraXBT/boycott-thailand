import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Mid-animation switch (at 400ms) to ensure the icon changes while spinning
    setTimeout(() => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    }, 400);

    // End animation state (at 1200ms)
    setTimeout(() => {
      setIsAnimating(false);
    }, 1200);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center justify-center p-2 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div
        className={`theme-icon-transition flex items-center justify-center w-6 h-6 ${
          isAnimating ? 'rotate-[360deg] scale-110' : ''
        }`}
      >
        {theme === 'dark' ? (
          <Moon size={20} strokeWidth={2.5} className="text-slate-100" />
        ) : (
          <Sun size={20} strokeWidth={2.5} className="text-amber-500" />
        )}
      </div>
    </button>
  );
};