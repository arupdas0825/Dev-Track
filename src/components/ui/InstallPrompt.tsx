"use client";

import React, { useEffect, useState } from "react";
import { GlassEffect } from "@/components/ui/liquid-glass";
import { Download, Share, X, Smartphone } from "lucide-react";
import { subscribeToAuthChanges } from "@/lib/firebase";
import { DevTrackUser } from "@/types/user";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [user, setUser] = useState<DevTrackUser | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Only show for logged-in users
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Check standalone and install prompt readiness
  useEffect(() => {
    if (!user) {
      setIsVisible(false);
      return;
    }

    // Check if already dismissed or already installed
    const isDismissed = localStorage.getItem("devtrack_install_dismissed") === "true";
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isDismissed || isStandalone) {
      return;
    }

    // Check if iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setIsVisible(true);
    }

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem("devtrack_install_dismissed", "true");
    setIsVisible(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch (err) {
      console.error("Install prompt error:", err);
    } finally {
      localStorage.setItem("devtrack_install_dismissed", "true");
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (!isVisible || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100%-3rem)] md:w-96 rounded-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
      <GlassEffect className="rounded-2xl p-4 shadow-2xl border border-border/80 bg-surface/90">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              {isIOS ? <Smartphone size={18} /> : <Download size={18} />}
            </div>
            <div>
              <h4 className="text-sm font-bold font-space-grotesk text-text-primary leading-tight">
                Install DevTrack
              </h4>
              <p className="text-[11px] font-mono text-accent">Native App & Offline Mode</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Dismiss install prompt"
          >
            <X size={15} />
          </button>
        </div>

        {isIOS ? (
          <div className="text-xs text-text-secondary font-sans space-y-2 pt-1">
            <p className="leading-relaxed">
              Install DevTrack to your home screen for quick access and full-screen experience:
            </p>
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-background/60 border border-border/50 text-[11px] text-text-primary font-mono">
              <span>1. Tap</span>
              <Share size={13} className="text-accent inline mx-0.5" />
              <span>Share in Safari menu</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-background/60 border border-border/50 text-[11px] text-text-primary font-mono">
              <span>2. Select</span>
              <span className="font-bold text-accent">&quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Install DevTrack on your device for lightning-fast access, native performance, and offline capabilities.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 px-3 rounded-lg bg-surface border border-border hover:bg-surface-secondary text-text-secondary text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Not Now
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2 px-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                <span>Install App</span>
              </button>
            </div>
          </div>
        )}
      </GlassEffect>
    </div>
  );
}
