"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
  showTagline?: boolean;
  animated?: boolean;
}

export default function Logo({
  className,
  size = 36,
  showText = false,
  textSize = "text-lg",
  showTagline = false,
  animated = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <div className="relative flex items-center justify-center">
        {/* Elegant Soft Breathing Ambient Glow */}
        {animated && (
          <div
            className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-500/40 via-indigo-500/40 to-purple-600/40 opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100 animate-pulse-glow"
          />
        )}
        <img
          src="/devtrack-logo.png"
          alt="DevTrack Brand Logo"
          width={size}
          height={size}
          className={cn(
            "relative z-10 flex-shrink-0 object-contain transition-all duration-300 group-hover:scale-105 antialiased",
            animated && "animate-logo-float"
          )}
          style={{ width: size, height: size }}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={cn("font-bold tracking-tight font-space-grotesk text-text-primary leading-none", textSize)}>
            Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC]">Track</span>
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

