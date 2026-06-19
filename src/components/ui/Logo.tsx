"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
  showTagline?: boolean;
}

export default function Logo({
  className,
  size = 32,
  showText = false,
  textSize = "text-lg",
  showTagline = false,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 130 120"
        width={size}
        height={size * (120 / 130)}
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logo-grad-component" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2F81F7" />
            <stop offset="100%" stopColor="#8957e5" />
          </linearGradient>
          <linearGradient id="bar-grad-component" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#2F81F7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2F81F7" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="line-grad-component" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a371f7" />
            <stop offset="100%" stopColor="#8957e5" />
          </linearGradient>
        </defs>

        {/* Left Brackets */}
        <path d="M 20 48 L 12 58 L 20 68" fill="none" stroke="#2F81F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 25 44 L 19 72" fill="none" stroke="#8B949E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 26 48 L 34 58 L 26 68" fill="none" stroke="#2F81F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* C-loop D-Shape */}
        <path
          d="M 44 34 H 74 A 24 24 0 0 1 98 58 A 24 24 0 0 1 74 82 H 44 A 5 5 0 0 1 44 72 H 74 A 14 14 0 0 0 88 58 A 14 14 0 0 0 74 44 H 44 A 5 5 0 0 1 44 34 Z"
          fill="url(#logo-grad-component)"
        />

        {/* Inner Bars */}
        <rect x="52" y="64" width="4.5" height="8" rx="1.5" fill="url(#bar-grad-component)" />
        <rect x="61" y="56" width="4.5" height="16" rx="1.5" fill="url(#bar-grad-component)" />
        <rect x="70" y="48" width="4.5" height="24" rx="1.5" fill="url(#bar-grad-component)" />

        {/* Right Line Chart */}
        <path d="M 100 70 L 110 58 L 122 46" fill="none" stroke="url(#line-grad-component)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="70" r="3.5" fill="#0D1117" stroke="#a371f7" strokeWidth="2" />
        <circle cx="110" cy="58" r="3.5" fill="#0D1117" stroke="#a371f7" strokeWidth="2" />
        <circle cx="122" cy="46" r="3.5" fill="#8957e5" stroke="#F0F6FC" strokeWidth="1.5" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left select-none">
          <span className={cn("font-bold tracking-tight font-space-grotesk text-text-primary leading-none", textSize)}>
            Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F81F7] to-[#8957e5]">Track</span>
          </span>
          {showTagline && (
            <span className="text-[9px] font-mono tracking-wider text-text-secondary leading-none mt-1">
              TRACK. ANALYZE. ELEVATE.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
