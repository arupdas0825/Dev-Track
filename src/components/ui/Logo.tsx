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
      <img
        src="/devtrack-logo.png"
        alt="DevTrack Logo"
        width={size}
        height={size}
        className="flex-shrink-0 object-contain transition-all duration-300 hover:scale-[1.03] hover:drop-shadow-[0_0_12px_rgba(88,166,255,0.6)] antialiased"
        style={{ width: size, height: size }}
      />

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
