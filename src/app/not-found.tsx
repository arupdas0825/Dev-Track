// src/app/not-found.tsx
"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ArrowRight, HelpCircle } from "lucide-react";
import { ThemeProvider } from "@/components/ui/ThemeContext";

export default function NotFound() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden font-inter selection:bg-accent/30">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />

        <div className="text-center max-w-md mx-auto p-6 space-y-6 flex flex-col items-center">
          {/* Logo container */}
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-full bg-accent/25 blur-xl animate-pulse" />
            <Logo size={80} showText={false} className="relative z-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-danger/25 bg-danger/10 text-danger text-[10px] font-mono font-bold tracking-wider uppercase">
              <HelpCircle size={10} />
              <span>404 - Page Not Found</span>
            </div>
            <h1 className="text-2xl font-black font-space-grotesk text-text-primary tracking-tight">
              Lost in the Codebase
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed font-mono">
              The requested repository index or path does not exist on our telemetry servers.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 border border-transparent rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-accent/20 cursor-pointer"
          >
            <span>Return to Dashboard</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </ThemeProvider>
  );
}
