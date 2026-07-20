'use client';

import React from 'react';

export interface DevTrackLogoProps {
  className?: string;
  size?: number;
}

export const DevTrackLogo: React.FC<DevTrackLogoProps> = ({ className = '', size = 38 }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      {/* Outer Glowing Ring */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse-glow" />
      
      {/* Container Box */}
      <div 
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/40 shadow-xl overflow-hidden"
      >
        {/* Decorative Radial Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/25 via-transparent to-transparent pointer-events-none" />

        {/* Custom Vector Terminal Code Icon */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-white transform group-hover:scale-110 transition-transform duration-300"
        >
          {/* Terminal Bracket > */}
          <path
            d="M10 12L20 20L10 28"
            stroke="url(#logo_grad_1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Code Underscore _ */}
          <path
            d="M22 28H30"
            stroke="url(#logo_grad_2)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Electric Pulse Indicator Dot */}
          <circle cx="30" cy="12" r="2.5" fill="#38BDF8" className="animate-ping" />
          <circle cx="30" cy="12" r="2.5" fill="#38BDF8" />

          {/* Gradients */}
          <defs>
            <linearGradient id="logo_grad_1" x1="10" y1="12" x2="20" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#C084FC" />
            </linearGradient>
            <linearGradient id="logo_grad_2" x1="22" y1="28" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
