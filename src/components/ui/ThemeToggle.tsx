'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { mode, toggleThemeMode } = useTheme();

  const isLight = mode === 'light';

  return (
    <button
      onClick={toggleThemeMode}
      title={isLight ? 'Switch to Dark Theme' : 'Switch to Pure White Theme'}
      className={`relative inline-flex items-center gap-2 p-2 rounded-2xl transition-all duration-300 active:scale-95 border ${
        isLight
          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600 shadow-sm'
          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-cyan-400 shadow-md'
      } ${className}`}
      aria-label="Toggle Theme"
    >
      <motion.div
        key={mode}
        initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex items-center justify-center"
      >
        {isLight ? (
          <Moon className="w-4.5 h-4.5 fill-indigo-500 text-indigo-600 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
        ) : (
          <Sun className="w-4.5 h-4.5 fill-amber-400 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
        )}
      </motion.div>

      {showLabel && (
        <span className={`text-xs font-semibold font-mono tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
          {isLight ? 'Pure White' : 'Dark Theme'}
        </span>
      )}
    </button>
  );
};
