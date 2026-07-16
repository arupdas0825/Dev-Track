"use client";

import Link from "next/link";
import Logo from "../ui/Logo";
import { ArrowUp, ExternalLink, Activity } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative w-full border-t border-[#30363D]/60 bg-[#0D1117] py-12 md:py-20 overflow-hidden font-mono mt-auto">
      {/* Large subtle background brand typography */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[12vw] font-extrabold text-[#161B22]/20 select-none pointer-events-none tracking-widest font-display uppercase print:hidden">
        DEVTRACK
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-[#30363D]/40">
          {/* Brand Info Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Logo size={28} showText={true} textSize="text-base" />
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed max-w-xs">
              Repository Intelligence & Developer DNA sequencing. Synthesizing software footprint analytics into actionable engineering assets.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/arupdas0825/Dev-Track"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                title="GitHub Repository"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                title="LinkedIn Profile"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-[10px] text-text-secondary">
              <li><Link href="/#features" className="hover:text-text-primary transition-colors">Features</Link></li>
              <li><Link href="/#score-engine" className="hover:text-text-primary transition-colors">Score Engine</Link></li>
              <li><Link href="/#wrapped" className="hover:text-text-primary transition-colors">Wrapped Dashboard</Link></li>
              <li><Link href="/dashboard?user=demo" className="hover:text-text-primary transition-colors">Interactive Demo</Link></li>
            </ul>
          </div>

          {/* Resources links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-[10px] text-text-secondary">
              <li>
                <a
                  href="https://docs.github.com/en/rest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors flex items-center gap-1"
                >
                  <span>GitHub REST API</span>
                  <ExternalLink size={10} />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.github.com/en/graphql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors flex items-center gap-1"
                >
                  <span>GitHub GraphQL</span>
                  <ExternalLink size={10} />
                </a>
              </li>
              <li><Link href="/#score-engine" className="hover:text-text-primary transition-colors">Scoring Benchmarks</Link></li>
            </ul>
          </div>

          {/* Developers links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Developers</h4>
            <ul className="space-y-2 text-[10px] text-text-secondary">
              <li><Link href="/#features" className="hover:text-text-primary transition-colors">API Docs</Link></li>
              <li><Link href="/#features" className="hover:text-text-primary transition-colors">Changelog</Link></li>
              <li className="flex items-center gap-1.5 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span>API Status: Normal</span>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-[10px] text-text-secondary">
              <li><Link href="/#features" className="hover:text-text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/#features" className="hover:text-text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/#features" className="hover:text-text-primary transition-colors">Security Disclosures</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Meta Details Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[9px] text-text-secondary font-mono">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span>© {currentYear} DevTrack. All rights reserved.</span>
            <span>•</span>
            <span>Version: <strong className="text-text-primary">v3.5.0-beta</strong></span>
            <span>•</span>
            <span>Build: <strong className="text-text-primary">3.5.0.2026</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#3FB950] font-semibold bg-[#238636]/10 px-1.5 py-0.5 rounded border border-[#238636]/20">
              <Activity size={10} className="animate-pulse" /> Operational
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-[#161B22]/50 hover:bg-[#161B22] text-xs text-text-secondary hover:text-text-primary transition-all duration-300 active:scale-95 cursor-pointer print:hidden"
            title="Back to Top"
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
