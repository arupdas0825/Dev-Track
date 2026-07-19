'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Users, 
  Bookmark, 
  FolderGit2, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

interface LeftProfileSidebarProps {
  user: any;
  onRequireAuth?: () => void;
}

export const LeftProfileSidebar: React.FC<LeftProfileSidebarProps> = ({ user, onRequireAuth }) => {
  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Join Developer Feed</h3>
        <p className="text-xs text-slate-400">
          Sign in to post updates, bookmark repositories, follow top developers, and track your Developer Score.
        </p>
        <button
          onClick={onRequireAuth}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all"
        >
          <span>Claim Profile</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card Summary */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl">
        {/* Cover Header */}
        <div className="h-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 p-3 flex justify-end">
          <span className="h-6 rounded-lg bg-slate-950/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
            TOP 3% ARCHITECT
          </span>
        </div>

        <div className="p-5 pt-0 relative">
          {/* Avatar */}
          <div className="-mt-10 mb-3 flex justify-between items-end">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
              alt={user.displayName}
              className="h-16 w-16 rounded-2xl ring-4 ring-slate-900 object-cover shadow-xl"
            />
            <div className="flex items-center gap-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 text-xs font-bold text-indigo-300">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>890 PTS</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-white">{user.displayName || user.username}</h3>
          <p className="text-xs text-indigo-400 font-medium">@{user.username}</p>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[11px] text-purple-300 font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>Full-Stack Engineer</span>
          </div>

          {/* Followers / Following Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2 border-y border-white/5 py-3 text-center">
            <div>
              <span className="block text-[11px] text-slate-400">Followers</span>
              <span className="text-sm font-bold text-white">412</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Following</span>
              <span className="text-sm font-bold text-white">189</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="mt-4 space-y-1">
            <Link
              href={`/u/${user.username}`}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-indigo-400" />
                <span>My Developer Profile</span>
              </span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </Link>

            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
              <span className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-purple-400" />
                <span>Saved Projects</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">12</span>
            </div>

            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <span>Joined Communities</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Heatmap Snapshot */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Activity Pulse</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-400">18 Day Streak 🔥</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {Array.from({ length: 28 }).map((_, i) => {
            const active = i % 3 === 0 || i % 5 === 0;
            return (
              <div
                key={i}
                className={`h-4 rounded-md ${
                  active ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-slate-800/60'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
