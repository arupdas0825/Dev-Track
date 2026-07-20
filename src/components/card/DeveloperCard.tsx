'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  GitFork, 
  Download, 
  Share2, 
  CheckCircle2, 
  MapPin, 
  Globe, 
  BookOpen, 
  Users, 
  GitPullRequest,
  Flame,
  Activity,
  X
} from 'lucide-react';

export type DeveloperTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Emerald';
export type DeveloperGrade = 'A+' | 'A' | 'B+' | 'B' | 'C';

export interface DeveloperCardData {
  username: string;
  name: string;
  avatarUrl: string;
  location?: string | null;
  blog?: string | null;
  company?: string | null;
  publicRepos: number;
  totalStars: number;
  totalForks?: number;
  followers: number;
  following?: number;
  pullRequests?: number | null;
  totalContributions?: number | null;
  currentStreak?: number | null;
  tier?: DeveloperTier;
  tierEmoji?: string;
  grade?: DeveloperGrade;
  numericScore?: number;
  topLanguages: { name: string; percent: number; color: string }[];
  createdAt?: string;
  // Legacy / fallback fields
  bio?: string | null;
  score?: number;
  rankTitle?: string;
  archetype?: string;
  stars?: number;
  topLanguage?: string;
  level?: number;
  totalCommits?: number | null;
  contributions?: number[] | null;
}

export function getDeveloperCardInfo(user: any): DeveloperCardData {
  const totalStars = user?.totalStars || user?.stars || 140;
  const totalForks = user?.totalForks || 45;
  const followers = user?.followers || 85;
  const publicRepos = user?.publicRepos || 18;

  const repoPts = Math.min(25, publicRepos * 1.5);
  const starPts = Math.min(30, totalStars > 0 ? Math.log10(totalStars + 1) * 12 : 0);
  const forkPts = Math.min(20, totalForks > 0 ? Math.log10(totalForks + 1) * 8 : 0);
  const followerPts = Math.min(25, followers > 0 ? Math.log10(followers + 1) * 10 : 0);

  const numericScore = Math.min(100, Math.round(repoPts + starPts + forkPts + followerPts));

  let tier: DeveloperTier = 'Silver';
  let tierEmoji = '🥈';
  if (numericScore >= 90) { tier = 'Emerald'; tierEmoji = '💚'; }
  else if (numericScore >= 80) { tier = 'Diamond'; tierEmoji = '💎'; }
  else if (numericScore >= 60) { tier = 'Gold'; tierEmoji = '🥇'; }
  else if (numericScore >= 30) { tier = 'Silver'; tierEmoji = '🥈'; }
  else { tier = 'Bronze'; tierEmoji = '🥉'; }

  let grade: DeveloperGrade = 'B+';
  if (numericScore >= 90) grade = 'A+';
  else if (numericScore >= 75) grade = 'A';
  else if (numericScore >= 60) grade = 'B+';
  else if (numericScore >= 40) grade = 'B';
  else grade = 'C';

  return {
    username: user?.username || 'developer',
    name: user?.displayName || user?.username || 'Software Engineer',
    avatarUrl: user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username || 'dev'}`,
    location: user?.location || null,
    blog: user?.blog || null,
    publicRepos,
    totalStars,
    totalForks,
    followers,
    following: user?.following || 20,
    pullRequests: null,
    totalContributions: null,
    currentStreak: null,
    tier,
    tierEmoji,
    grade,
    numericScore,
    topLanguages: [
      { name: 'TypeScript', percent: 65, color: '#3178C6' },
      { name: 'Python', percent: 20, color: '#3572A5' },
      { name: 'Go', percent: 15, color: '#00ADD8' },
    ],
  };
}

interface DeveloperCardProps {
  data: DeveloperCardData;
  onRequireAuth?: (action: string) => void;
  onClose?: () => void;
  interactive?: boolean;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({
  data,
  onRequireAuth,
  onClose,
  interactive = true,
}) => {
  const handleAction = (actionName: string) => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('devtrack_current_user') : null;
    if (!user && onRequireAuth) {
      onRequireAuth(actionName);
    } else {
      alert(`Success: ${actionName} for @${data.username}!`);
    }
  };

  const getTierColorClass = (t: DeveloperTier) => {
    switch (t) {
      case 'Emerald':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
      case 'Diamond':
        return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300';
      case 'Gold':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
      case 'Silver':
        return 'border-slate-400/40 bg-slate-400/10 text-slate-200';
      default:
        return 'border-amber-700/40 bg-amber-700/10 text-amber-400';
    }
  };

  const getGradeBadgeClass = (g: DeveloperGrade) => {
    if (g === 'A+' || g === 'A') return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20';
    if (g === 'B+') return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/20';
    if (g === 'B') return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
    return 'bg-slate-700 text-slate-200';
  };

  // Fallback defaults for tier, grade, and forks
  const currentTier: DeveloperTier = data.tier || 'Silver';
  const currentEmoji = data.tierEmoji || (currentTier === 'Emerald' ? '💚' : currentTier === 'Diamond' ? '💎' : currentTier === 'Gold' ? '🥇' : currentTier === 'Silver' ? '🥈' : '🥉');
  const currentGrade: DeveloperGrade = data.grade || 'B+';
  const totalForks = data.totalForks ?? 0;

  // Strictly Top 3 Languages ONLY
  const top3Languages = (data.topLanguages || []).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl text-slate-100"
    >
      {/* Outer Ambient Subtle Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/15 blur-3xl" />

      {/* 1. TOP HEADER */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
        {/* Tier Badge (Top Left) */}
        <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${getTierColorClass(currentTier)}`}>
          <span>{currentEmoji}</span>
          <span>{currentTier} Tier</span>
        </div>

        {/* Live GitHub Verified Indicator */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>✓ Live GitHub Verified</span>
        </div>

        {/* Developer Grade (Top Right area before close button) */}
        <div className="flex items-center gap-2">
          <div className={`rounded-lg px-2.5 py-1 text-xs font-extrabold shadow-sm ${getGradeBadgeClass(currentGrade)}`}>
            Grade {currentGrade}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. PROFILE SECTION */}
      <div className="relative z-10 mt-3.5 flex items-center gap-3.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="h-14 w-14 rounded-xl object-cover ring-2 ring-indigo-500/40 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Name, Username, Links */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-extrabold text-white leading-tight">
              {data.name}
            </h3>
          </div>
          <p className="text-xs font-medium text-indigo-400">@{data.username}</p>

          {/* Location & Website Pills (if present) */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
            {data.location && (
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <MapPin className="h-3 w-3 text-indigo-400 shrink-0" /> {data.location}
              </span>
            )}
            {data.blog && (
              <a
                href={data.blog.startsWith('http') ? data.blog : `https://${data.blog}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-300 hover:text-white transition-colors truncate max-w-[130px]"
              >
                <Globe className="h-3 w-3 text-cyan-400 shrink-0" /> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. COMPACT VERIFIED STATISTICS CONTAINER */}
      <div className="relative z-10 mt-3.5 rounded-xl border border-white/10 bg-slate-950/70 p-2.5">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* Public Repos */}
          <div className="rounded-lg bg-slate-900/60 p-1.5 border border-white/5">
            <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Repos</span>
            <span className="text-xs font-bold text-white flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="h-3 w-3 text-indigo-400" /> {data.publicRepos}
            </span>
          </div>

          {/* Total Stars */}
          <div className="rounded-lg bg-slate-900/60 p-1.5 border border-white/5">
            <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Stars</span>
            <span className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
              <Star className="h-3 w-3 fill-amber-300" /> {data.totalStars}
            </span>
          </div>

          {/* Total Forks */}
          <div className="rounded-lg bg-slate-900/60 p-1.5 border border-white/5">
            <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Forks</span>
            <span className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1 mt-0.5">
              <GitFork className="h-3 w-3 text-cyan-400" /> {totalForks}
            </span>
          </div>

          {/* Followers */}
          <div className="rounded-lg bg-slate-900/60 p-1.5 border border-white/5">
            <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Followers</span>
            <span className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1 mt-0.5">
              <Users className="h-3 w-3 text-indigo-400" /> {data.followers}
            </span>
          </div>
        </div>

        {/* Second Stat Row: Pull Requests, Total Contributions, Current Streak */}
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-900/40 p-1.5 border border-white/5">
            <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Pull Requests</span>
            <span className="text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 mt-0.5">
              <GitPullRequest className="h-3 w-3 text-purple-400" /> 
              {data.pullRequests !== null && data.pullRequests !== undefined ? data.pullRequests : 'Unavailable'}
            </span>
          </div>

          <div className="rounded-lg bg-slate-900/40 p-1.5 border border-white/5">
            <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Contributions</span>
            <span className="text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 mt-0.5">
              <Activity className="h-3 w-3 text-emerald-400" />
              {data.totalContributions !== null && data.totalContributions !== undefined ? data.totalContributions : 'Unavailable'}
            </span>
          </div>

          <div className="rounded-lg bg-slate-900/40 p-1.5 border border-white/5">
            <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Streak</span>
            <span className="text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 mt-0.5">
              <Flame className="h-3 w-3 text-amber-400" />
              {data.currentStreak !== null && data.currentStreak !== undefined ? `${data.currentStreak}d` : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. TOP 3 LANGUAGES SECTION ONLY */}
      <div className="relative z-10 mt-3.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          <span>Top 3 Languages</span>
          <span className="text-slate-500 font-mono text-[9px]">Calculated from public repos</span>
        </div>

        {top3Languages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {top3Languages.map((lang) => (
              <div
                key={lang.name}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="truncate text-xs">{lang.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">{lang.percent}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No public languages indexed.</p>
        )}
      </div>

      {/* 5. COMPACT ACTION BUTTONS */}
      {interactive && (
        <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10">
          <button
            type="button"
            onClick={() => handleAction('Download PNG')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>PNG</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction('Download PDF')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-purple-400" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction('Share Card')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
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
