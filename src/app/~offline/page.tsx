"use client";

import React from "react";
import Logo from "@/components/ui/Logo";
import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 font-inter">
      <div className="max-w-md w-full p-8 rounded-2xl bg-surface border border-border shadow-xl flex flex-col items-center text-center space-y-6">
        <Logo size={48} showText textSize="text-2xl" showTagline />

        <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
          <WifiOff size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight font-space-grotesk text-text-primary">
            You&apos;re currently offline
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed font-sans">
            We couldn&apos;t connect to DevTrack. Please check your internet connection and try reloading the page.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-6 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-bold font-mono flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <RefreshCw size={16} className="animate-spin-hover" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
