'use client';

import React, { useRef, useState } from 'react';
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
  X,
  Loader2
} from 'lucide-react';
import { exportCardToPNG, exportCardToPDF, isUserAuthenticated } from '@/lib/exportCard';

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
  pullRequests?: number | string | null;
  totalContributions?: number | string | null;
  currentStreak?: number | string | null;
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
  isLoading?: boolean;
  onRequireAuth?: (action: string) => void;
  onClose?: () => void;
  interactive?: boolean;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({
  data,
  isLoading = false,
  onRequireAuth,
  onClose,
  interactive = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportPNG = async () => {
    if (!isUserAuthenticated()) {
      if (onRequireAuth) onRequireAuth('Download PNG');
      return;
    }
    if (!cardRef.current) return;
    setIsExportingPNG(true);
    try {
      await exportCardToPNG(cardRef.current, data.username);
    } catch (err: any) {
      console.error('PNG export failed:', err);
      alert(err.message || 'Failed to export Developer Card to PNG.');
    } finally {
      setIsExportingPNG(false);
    }
  };

  const handleExportPDF = async () => {
    if (!isUserAuthenticated()) {
      if (onRequireAuth) onRequireAuth('Download PDF');
      return;
    }
    if (!cardRef.current) return;
    setIsExportingPDF(true);
    try {
      await exportCardToPDF(cardRef.current, data.username);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert(err.message || 'Failed to export Developer Card to PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleShare = () => {
    if (!isUserAuthenticated()) {
      if (onRequireAuth) onRequireAuth('Share Card');
      return;
    }
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(`Copied Developer Card link to clipboard: ${url}`);
    }
  };

  const getTierColorClass = (t: DeveloperTier) => {
    switch (t) {
      case 'Emerald':
        return 'border-emerald-500/40 bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-emerald-500/10 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.25)]';
      case 'Diamond':
        return 'border-cyan-500/40 bg-gradient-to-r from-cyan-500/25 via-sky-500/15 to-blue-500/10 text-cyan-300 shadow-[0_0_14px_rgba(6,182,212,0.25)]';
      case 'Gold':
        return 'border-amber-500/40 bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.25)]';
      case 'Silver':
        return 'border-slate-400/40 bg-gradient-to-r from-slate-400/25 via-slate-300/15 to-slate-400/10 text-slate-200 shadow-[0_0_14px_rgba(148,163,184,0.2)]';
      default:
        return 'border-amber-700/40 bg-gradient-to-r from-amber-700/25 via-orange-600/15 to-amber-700/10 text-amber-400 shadow-[0_0_14px_rgba(217,119,6,0.2)]';
    }
  };

  const getGradeBadgeClass = (g: DeveloperGrade) => {
    switch (g) {
      case 'A+':
      case 'A':
        return 'border-amber-400/40 bg-gradient-to-r from-amber-400/20 via-yellow-500/10 to-amber-400/20 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]';
      case 'B+':
      case 'B':
        return 'border-indigo-400/40 bg-indigo-500/15 text-indigo-300';
      default:
        return 'border-slate-500/40 bg-slate-800/50 text-slate-300';
    }
  };

  const calculatedInfo = getDeveloperCardInfo(data);
  const tier = data.tier || calculatedInfo.tier;
  const tierEmoji = data.tierEmoji || calculatedInfo.tierEmoji;
  const grade = data.grade || calculatedInfo.grade;
  const top3Languages = (data.topLanguages && data.topLanguages.length > 0)
    ? data.topLanguages.slice(0, 3)
    : calculatedInfo.topLanguages;

  const pullRequestsDisplay = data.pullRequests !== undefined && data.pullRequests !== null 
    ? data.pullRequests 
    : 'Not Available from GitHub';

  const totalContribsDisplay = data.totalContributions !== undefined && data.totalContributions !== null
    ? data.totalContributions
    : 'Not Available from GitHub';

  const streakDisplay = data.currentStreak !== undefined && data.currentStreak !== null
    ? (typeof data.currentStreak === 'number' ? `${data.currentStreak} days` : data.currentStreak)
    : 'Not Available from GitHub';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-[380px] sm:max-w-[400px] overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-900/95 p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-slate-100 font-sans"
    >
      {/* Background Ambient Reflection */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

      {/* 1. TOP HEADER: Tier (Left), Grade (Right), Close (Far Right) */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-4 border-b border-white/10">
        {/* Left: Prestigious Tier Badge */}
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getTierColorClass(tier)}`}>
          <span className="text-sm">{tierEmoji}</span>
          <span className="tracking-wide uppercase text-[11px] font-extrabold">{tier} Developer</span>
        </div>

        {/* Right Group: Developer Grade Badge & Optional Close Button */}
        <div className="flex items-center gap-2">
          {/* Grade Badge */}
          <div className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-extrabold backdrop-blur-md ${getGradeBadgeClass(grade)}`}>
            <span className="text-amber-400">★</span>
            <span>Grade {grade}</span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DEVELOPER IDENTITY HEADER */}
      <div className="relative z-10 mt-4 flex items-center gap-3.5">
        <div className="relative shrink-0">
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-lg bg-slate-900"
          />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white truncate tracking-tight">
              {data.name}
            </h2>
          </div>
          <p className="text-xs font-bold text-indigo-400 font-mono truncate">
            @{data.username}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-medium pt-0.5">
            {data.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="truncate max-w-[110px]">{data.location}</span>
              </span>
            )}
            {data.blog && (
              <span className="flex items-center gap-1 text-slate-400">
                <Globe className="h-3 w-3 text-indigo-400 shrink-0" />
                <span className="truncate max-w-[100px] font-mono">{data.blog}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. CORE METRICS TELEMETRY GRID */}
      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2.5 text-center">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Repos</span>
          {isLoading ? (
            <div className="mx-auto mt-1.5 h-4 w-10 animate-pulse rounded bg-slate-800" />
          ) : (
            <span className="text-sm sm:text-base font-extrabold text-white mt-0.5 block font-mono">
              {data.publicRepos}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2.5 text-center">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Total Stars</span>
          {isLoading ? (
            <div className="mx-auto mt-1.5 h-4 w-10 animate-pulse rounded bg-slate-800" />
          ) : (
            <span className="text-sm sm:text-base font-extrabold text-amber-300 mt-0.5 block font-mono">
              {data.totalStars}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2.5 text-center">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Followers</span>
          {isLoading ? (
            <div className="mx-auto mt-1.5 h-4 w-10 animate-pulse rounded bg-slate-800" />
          ) : (
            <span className="text-sm sm:text-base font-extrabold text-indigo-300 mt-0.5 block font-mono">
              {data.followers}
            </span>
          )}
        </div>
      </div>

      {/* DETAILED STATS (PRs, Contributions, Streak) */}
      <div className="relative z-10 mt-2 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2 text-center">
          <span className="text-[9px] uppercase font-mono text-slate-400 block">Pull Requests</span>
          {isLoading ? (
            <div className="mx-auto mt-1 h-3.5 w-12 animate-pulse rounded bg-slate-800" />
          ) : (
            <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
              {pullRequestsDisplay}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2 text-center">
          <span className="text-[9px] uppercase font-mono text-slate-400 block">Contributions</span>
          {isLoading ? (
            <div className="mx-auto mt-1 h-3.5 w-12 animate-pulse rounded bg-slate-800" />
          ) : (
            <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
              {totalContribsDisplay}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-2 text-center">
          <span className="text-[9px] uppercase font-mono text-slate-400 block">Current Streak</span>
          {isLoading ? (
            <div className="mx-auto mt-1 h-3.5 w-12 animate-pulse rounded bg-slate-800" />
          ) : (
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block truncate">
              {streakDisplay}
            </span>
          )}
        </div>
      </div>

      {/* 4. TOP LANGUAGES BREAKDOWN */}
      <div className="relative z-10 mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Top Languages</span>
          <span>GitHub Activity</span>
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

      {/* 5. COMPACT ACTION BUTTONS (EXCLUDED FROM PNG/PDF CAPTURE VIA data-export-exclude) */}
      {interactive && (
        <div
          data-export-exclude="true"
          className="relative z-10 mt-4 grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10"
        >
          <button
            type="button"
            onClick={handleExportPNG}
            disabled={isExportingPNG}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExportingPNG ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
            ) : (
              <Download className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            )}
            <span>{isExportingPNG ? 'PNG...' : 'PNG'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExportingPDF ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400 shrink-0" />
            ) : (
              <Download className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            )}
            <span>{isExportingPDF ? 'PDF...' : 'PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5 shrink-0" />
            <span>Share</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default DeveloperCard;
