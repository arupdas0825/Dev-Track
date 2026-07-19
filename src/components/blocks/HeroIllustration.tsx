'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  GitPullRequest, 
  Code2, 
  Cpu, 
  Terminal, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Activity,
  Zap,
  Globe
} from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-h-[min(520px,calc(100vh-6rem))] h-auto flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-900/60 p-6 backdrop-blur-2xl after:absolute after:bottom-0 after:left-0 after:right-0 after:h-12 after:bg-gradient-to-t after:from-slate-950/90 after:to-transparent after:pointer-events-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-[90px] animate-pulse-glow" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-600/20 blur-[90px] animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Central Interactive Workstation / AI Graph Hub */}
      <div className="relative z-10 w-full max-w-md space-y-4">
        {/* Floating Glass Node 1: AI Code Scanner */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                DevTrack AI Engine <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </h4>
              <p className="text-[11px] text-slate-400">Analyzing GitHub Repositories</p>
            </div>
          </div>
          <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
            Sample Analysis
          </span>
        </motion.div>

        {/* Central Floating Developer Ecosystem Graph Card */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="relative rounded-3xl border border-white/15 bg-gradient-to-tr from-slate-900/90 via-slate-950/95 to-slate-900/90 p-5 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-200">identity.pipeline.ts</span>
            </div>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            </div>
          </div>

          {/* Node Connections */}
          <div className="space-y-3 font-mono text-[11px]">
            <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-2.5 border border-white/5">
              <div className="flex items-center gap-2 text-indigo-300">
                <GitBranch className="h-3.5 w-3.5" />
                <span>main.octocat/repos</span>
              </div>
              <span className="text-emerald-400">Verified</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-2.5 border border-white/5">
              <div className="flex items-center gap-2 text-purple-300">
                <GitPullRequest className="h-3.5 w-3.5" />
                <span>1,240 Merged PRs</span>
              </div>
              <span className="text-indigo-400">+140 Score</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-2.5 border border-white/5">
              <div className="flex items-center gap-2 text-cyan-300">
                <Activity className="h-3.5 w-3.5" />
                <span>System Architecture Score</span>
              </div>
              <span className="text-amber-300">Top 1.2%</span>
            </div>
          </div>
        </motion.div>

        {/* Floating Node 3: Live Verification */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Global Developer Identity</h4>
              <p className="text-[11px] text-slate-400">Exportable PNG, PDF & Interactive Links</p>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        </motion.div>
      </div>
    </div>
  );
};
