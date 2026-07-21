'use client';

import React from 'react';
import { DeveloperTier } from '@/components/card/DeveloperCard';

interface TierAvatarProps {
  src: string;
  alt: string;
  tier: DeveloperTier;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  imgClassName?: string;
  customSizeClass?: string; // used if size === 'custom'
}

export const TierAvatar: React.FC<TierAvatarProps> = ({
  src,
  alt,
  tier,
  size = 'md',
  className = '',
  imgClassName = '',
  customSizeClass = ''
}) => {
  // Map tier to gradient colors and glows
  const getTierStyles = (t: DeveloperTier) => {
    switch (t) {
      case 'Emerald':
        return {
          gradient: 'from-emerald-500 via-teal-400 to-emerald-600',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)] border-emerald-500/30',
          indicator: 'bg-emerald-400',
        };
      case 'Diamond':
        return {
          gradient: 'from-cyan-500 via-sky-400 to-blue-500',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)] border-cyan-500/30',
          indicator: 'bg-cyan-400',
        };
      case 'Gold':
        return {
          gradient: 'from-amber-400 via-yellow-300 to-amber-600',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-400/30',
          indicator: 'bg-amber-400',
        };
      case 'Silver':
        return {
          gradient: 'from-slate-400 via-slate-200 to-slate-500',
          glow: 'shadow-[0_0_16px_rgba(148,163,184,0.4)] border-slate-400/30',
          indicator: 'bg-slate-300',
        };
      default: // Bronze
        return {
          gradient: 'from-amber-700 via-orange-500 to-amber-900',
          glow: 'shadow-[0_0_16px_rgba(194,65,12,0.4)] border-amber-700/30',
          indicator: 'bg-amber-600',
        };
    }
  };

  const styles = getTierStyles(tier);

  // Map size categories to tailwind size classes
  const sizeClasses = {
    sm: 'h-8 w-8 rounded-xl p-[1.5px]',
    md: 'h-10 w-10 rounded-2xl p-[2px]',
    lg: 'h-16 w-16 rounded-[20px] p-[2.5px]',
    xl: 'h-28 w-28 rounded-3xl p-[3px]',
    custom: customSizeClass,
  };

  const currentSizeClass = sizeClasses[size];

  return (
    <div
      className={`relative group shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ${styles.glow} ${currentSizeClass} ${className}`}
    >
      {/* 1. Rotating Conic/Linear Light Sweep (motion-safe to honor user accessibility preferences) */}
      <div 
        className={`absolute inset-0 z-0 bg-gradient-to-tr ${styles.gradient} opacity-90 transition-transform duration-300 group-hover:scale-110 motion-safe:animate-[spin_8s_linear_infinite]`} 
      />

      {/* 2. Premium Shimmer Overlay Highlight (sweeps across border) */}
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full motion-safe:animate-[shimmer_4s_infinite_ease-in-out] pointer-events-none" />

      {/* 3. Outer border glass card housing */}
      <div className="absolute inset-[1px] bg-slate-950 rounded-[inherit] z-2" />

      {/* 4. Avatar Image Element */}
      <img
        src={src}
        alt={alt}
        className={`relative z-10 h-full w-full object-cover rounded-[inherit] ${imgClassName}`}
      />

      {/* Glow Effect on Hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md -z-10 bg-gradient-to-tr ${styles.gradient}`} />
    </div>
  );
};
