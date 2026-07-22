'use client';

import React from 'react';

export interface DevTrackLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const DevTrackLogo: React.FC<DevTrackLogoProps> = ({ 
  className = '', 
  size = 38,
  animated = true
}) => {
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      {/* Outer Breathing Ambient Glow */}
      {animated && (
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500/50 via-indigo-500/50 to-purple-600/50 opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse-glow" />
      )}
      
      {/* Official Brand Logo Container */}
      <div 
        style={{ width: size, height: size }}
        className={`relative z-10 flex items-center justify-center ${animated ? 'animate-logo-float' : ''}`}
      >
        <img
          src="/devtrack-logo.png"
          alt="DevTrack Official Brand Logo"
          width={size}
          height={size}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300 antialiased"
        />
      </div>
    </div>
  );
};

