'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { DevTrackLogo } from '@/components/ui/DevTrackLogo';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  X,
  Bookmark,
  Users,
  Settings,
  SunMoon,
  HelpCircle,
  ShieldCheck,
  LogOut,
  LogIn,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface MobileHamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onOpenTheme?: () => void;
  onLogout?: () => Promise<void> | void;
  onOpenAuth?: () => void;
}

export const MobileHamburgerMenu: React.FC<MobileHamburgerMenuProps> = ({
  isOpen,
  onClose,
  user,
  onOpenTheme,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm block md:hidden"
          />

          {/* Slide-over Sheet Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800/80 shadow-2xl flex flex-col justify-between block md:hidden"
          >
            {/* Top Header */}
            <div>
              <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <DevTrackLogo className="w-7 h-7 text-cyan-400" />
                  <span className="font-mono font-bold text-base bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    DevTrack Menu
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 active:scale-95 transition-all"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Banner / Quick Info */}
              {user ? (
                <div className="p-4 border-b border-slate-800/60 bg-gradient-to-br from-slate-900/60 to-slate-950">
                  <div className="flex items-center gap-3">
                    <TierAvatar
                      src={user.avatarUrl || user.photoURL || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                      alt={user.name || user.username || 'User'}
                      tier={user.tier || 'Diamond'}
                      size="md"
                      className="w-12 h-12 rounded-xl ring-2 ring-cyan-500/40"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-100 text-sm truncate">{user.name || user.username}</h4>
                      <p className="text-xs font-mono text-cyan-400 truncate">@{user.username || 'developer'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                          {user.tier || 'Master Tier'}
                        </span>
                        <span className="text-[10px] font-mono text-purple-300">Score: {user.score || 920}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-slate-800/60 bg-gradient-to-r from-cyan-950/20 to-indigo-950/20">
                  <p className="text-xs text-slate-300 mb-3">Claim your verified developer identity & track your score.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth?.();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-xs text-slate-950 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In with GitHub
                  </button>
                </div>
              )}

              {/* Navigation Menu List */}
              <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                <p className="px-3 pt-2 pb-1 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Secondary Features
                </p>

                <Link
                  href="/projects?saved=true"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 text-slate-200 text-sm font-medium active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <span>Saved Projects</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>

                <Link
                  href="/community"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 text-slate-200 text-sm font-medium active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>Communities</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>

                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 text-slate-200 text-sm font-medium active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span>Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 text-slate-200 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <SunMoon className="w-4 h-4" />
                    </div>
                    <span>Theme Mode</span>
                  </div>
                  <ThemeToggle showLabel />
                </div>

                <p className="px-3 pt-4 pb-1 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Resources & Support
                </p>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 text-slate-300 text-sm font-medium active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span>Help & Docs</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                </a>

                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60 text-slate-300 text-sm font-medium active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>Privacy & Terms</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950">
              {user ? (
                <button
                  onClick={() => {
                    onClose();
                    onLogout?.();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-300 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <div className="text-center text-[11px] text-slate-500 font-mono">
                  DevTrack v2.0 • Native Mobile PWA
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
