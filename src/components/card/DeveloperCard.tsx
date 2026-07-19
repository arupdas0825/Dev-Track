'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Star, 
  GitFork, 
  GitCommit, 
  Zap, 
  Download, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Flame,
  ShieldCheck
} from 'lucide-react';

export interface DeveloperCardData {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  location?: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  stars?: number;
  topLanguage?: string;
  level?: number;
  totalCommits: number;
  score: number;
  rankTitle: string;
  archetype: string;
  topLanguages: { name: string; percent: number; color: string }[];
  contributions: number[];
}

export function getDeveloperCardInfo(user: any): DeveloperCardData {
  const totalStars = user?.totalStars || user?.stars || 890;
  return {
    username: user?.username || 'developer',
    name: user?.displayName || user?.username || 'Developer',
    avatarUrl: user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username || 'dev'}`,
    bio: user?.bio || 'Software architect & developer',
    publicRepos: user?.publicRepos || 18,
    followers: user?.followers || 140,
    totalStars,
    stars: totalStars,
    topLanguage: user?.topLanguage || 'TypeScript',
    level: user?.level || 42,
    totalCommits: user?.totalCommits || 2400,
    score: user?.score || 880,
    rankTitle: 'Top Developer',
    archetype: 'Systems Architect',
    topLanguages: [
      { name: 'TypeScript', percent: 60, color: '#3178C6' },
      { name: 'Rust', percent: 25, color: '#DEA584' },
      { name: 'Go', percent: 15, color: '#00ADD8' },
    ],
    contributions: [10, 15, 20, 25, 18, 30, 24, 32, 28, 35, 40, 45, 38, 50],
  };
}

interface DeveloperCardProps {
  data: DeveloperCardData;
  onRequireAuth?: (action: string) => void;
  interactive?: boolean;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({
  data,
  onRequireAuth,
  interactive = true
}) => {
  const handleAction = (actionName: string) => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('devtrack_current_user') : null;
    if (!user && onRequireAuth) {
      onRequireAuth(actionName);
    } else {
      alert(`Success: ${actionName} initiated for @${data.username}!`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl"
    >
      {/* Background Decorative Radial Glows */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-purple-500/20 blur-3xl" />

      {/* Card Header: Brand & Score Ring */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            DevTrack Identity Card
          </span>
        </div>

        {/* Developer Score Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
          <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span>Score: {data.score}</span>
        </div>
      </div>

      {/* Profile Main Content */}
      <div className="relative z-10 mt-6 flex items-start gap-4">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-xl transition-transform group-hover:scale-105"
          />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        {/* Info & Archetype */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xl font-bold text-white">
              {data.name}
            </h3>
          </div>
          <p className="text-xs font-medium text-indigo-400">@{data.username}</p>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300">
            <ShieldCheck className="h-3 w-3" />
            <span>{data.archetype}</span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-slate-400">
            {data.bio || 'Building scalable systems, open-source software, and developer tools.'}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="relative z-10 mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-white/5 bg-slate-950/50 p-3 text-center">
        <div>
          <span className="block text-xs font-medium text-slate-400">Repos</span>
          <span className="text-sm font-bold text-white">{data.publicRepos}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-400">Stars</span>
          <span className="text-sm font-bold text-amber-300 flex items-center justify-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-300" /> {data.totalStars || data.stars || 0}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-400">Commits</span>
          <span className="text-sm font-bold text-emerald-400">{data.totalCommits}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-400">Followers</span>
          <span className="text-sm font-bold text-indigo-300">{data.followers}</span>
        </div>
      </div>

      {/* Top Tech Stack Breakdown */}
      <div className="relative z-10 mt-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Primary Tech Stack
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.topLanguages.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-200"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              <span>{lang.name}</span>
              <span className="text-[10px] text-slate-400">{lang.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Heatmap Preview */}
      <div className="relative z-10 mt-5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="font-semibold uppercase tracking-wider">14-Day Activity Pulse</span>
          <span>Active Streak 🔥</span>
        </div>
        <div className="grid grid-cols-14 gap-1.5 rounded-xl border border-white/5 bg-slate-950/40 p-2.5">
          {data.contributions.map((count, idx) => {
            const intensity = count > 12 ? 'bg-indigo-500 shadow-indigo-500/50' : count > 6 ? 'bg-indigo-600/80' : count > 0 ? 'bg-indigo-900/60' : 'bg-slate-800/40';
            return (
              <div
                key={idx}
                title={`${count} contributions`}
                className={`h-5 rounded-md ${intensity} transition-all hover:scale-125`}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons (PNG, PDF, Share) */}
      {interactive && (
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => handleAction('Download PNG')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>PNG</span>
          </button>
          <button
            onClick={() => handleAction('Download PDF')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-purple-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleAction('Share Card')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DeveloperCard;
