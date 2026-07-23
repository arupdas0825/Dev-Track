'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Users, Plus, Sparkles, Briefcase } from 'lucide-react';
import { MovingBorder } from '@/components/ui/moving-border';

interface MobileBottomNavProps {
  activeTabOverride?: string;
  user?: any;
  onOpenComposer?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTabOverride,
  user,
  onOpenComposer,
}) => {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (activeTabOverride) return activeTabOverride;
    if (pathname === '/' || pathname === '/feed') return 'home';
    if (pathname.startsWith('/network') || pathname.startsWith('/connections')) return 'network';
    if (pathname.startsWith('/ai')) return 'ai';
    if (pathname.startsWith('/jobs')) return 'jobs';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden w-full bg-slate-950/95 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-2xl border-t border-slate-800/80 light:border-slate-200/90 px-3 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.4)] transition-colors">
      <div className="flex items-center justify-between max-w-md mx-auto relative">

        {/* 1. Home */}
        <Link
          href="/feed"
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl active:scale-95 transition-all text-center min-w-[56px]"
        >
          {activeTab === 'home' && (
            <motion.div
              layoutId="mobileActiveTabPill"
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-indigo-500/20 to-purple-500/15 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Home
            className={`relative z-10 w-5 h-5 transition-colors ${
              activeTab === 'home'
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                : 'text-slate-400'
            }`}
          />
          <span
            className={`relative z-10 text-[10px] font-medium tracking-tight mt-0.5 ${
              activeTab === 'home' ? 'text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Home
          </span>
        </Link>

        {/* 2. Connections */}
        <Link
          href="/network"
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl active:scale-95 transition-all text-center min-w-[56px]"
        >
          {activeTab === 'network' && (
            <motion.div
              layoutId="mobileActiveTabPill"
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-indigo-500/20 to-purple-500/15 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Users
            className={`relative z-10 w-5 h-5 transition-colors ${
              activeTab === 'network'
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                : 'text-slate-400'
            }`}
          />
          <span
            className={`relative z-10 text-[10px] font-medium tracking-tight mt-0.5 ${
              activeTab === 'network' ? 'text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Connections
          </span>
        </Link>

        {/* 3. Center Floating Create Button with MovingBorder Shader */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={onOpenComposer}
            className="relative w-13 h-13 rounded-full overflow-hidden p-[1.5px] focus:outline-none active:scale-90 transition-all shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            aria-label="Create Post"
          >
            {/* Moving Border Outer Glow Shell */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <MovingBorder duration={2200} rx="50%" ry="50%">
                <div className="h-16 w-16 opacity-90 bg-[radial-gradient(var(--cyan-400)_40%,transparent_60%)]" />
              </MovingBorder>
            </div>

            {/* Inner Dark Glass Circle */}
            <div className="relative z-10 w-full h-full rounded-full bg-slate-900 border border-slate-700/80 backdrop-blur-xl flex items-center justify-center text-cyan-400 group-hover:text-white transition-colors">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* 4. AI Insights */}
        <Link
          href="/ai"
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl active:scale-95 transition-all text-center min-w-[56px]"
        >
          {activeTab === 'ai' && (
            <motion.div
              layoutId="mobileActiveTabPill"
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-indigo-500/20 to-purple-500/15 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Sparkles
            className={`relative z-10 w-5 h-5 transition-colors ${
              activeTab === 'ai'
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                : 'text-slate-400'
            }`}
          />
          <span
            className={`relative z-10 text-[10px] font-medium tracking-tight mt-0.5 ${
              activeTab === 'ai' ? 'text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            AI Insights
          </span>
        </Link>

        {/* 5. Job Analyzer */}
        <Link
          href="/jobs"
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl active:scale-95 transition-all text-center min-w-[56px]"
        >
          {activeTab === 'jobs' && (
            <motion.div
              layoutId="mobileActiveTabPill"
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-indigo-500/20 to-purple-500/15 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Briefcase
            className={`relative z-10 w-5 h-5 transition-colors ${
              activeTab === 'jobs'
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                : 'text-slate-400'
            }`}
          />
          <span
            className={`relative z-10 text-[10px] font-medium tracking-tight mt-0.5 ${
              activeTab === 'jobs' ? 'text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Job Analyzer
          </span>
        </Link>

      </div>
    </nav>
  );
};
