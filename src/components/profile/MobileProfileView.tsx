'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { DeveloperCard, DeveloperCardData } from '@/components/card/DeveloperCard';
import {
  MapPin,
  Building,
  Link as LinkIcon,
  Award,
  Star,
  GitFork,
  ExternalLink,
  Code,
  Activity,
  Edit3,
  UserPlus,
  Check,
  TrendingUp,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MobileProfileViewProps {
  profileData: DeveloperCardData & {
    location?: string;
    company?: string;
    website?: string;
    followersCount?: number;
    followingCount?: number;
    grade?: string;
    aboutText?: string;
    achievements?: Array<{ id: string; title: string; desc: string; icon: string }>;
    topProjectsList?: Array<{ name: string; desc: string; stars: number; forks: number; lang: string; url: string }>;
  };
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  profileData,
  isOwnProfile = true,
  onEditProfile,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const defaultAbout =
    profileData.bio ||
    'Full-stack systems engineer passionate about open source, modern web architectures, and performance optimization.';

  const topProjects = profileData.topProjectsList || [
    {
      name: 'dev-track',
      desc: 'The professional network & verified identity platform for developers.',
      stars: 1240,
      forks: 185,
      lang: 'TypeScript',
      url: `https://github.com/${profileData.username}/dev-track`,
    },
    {
      name: 'hyper-cache-engine',
      desc: 'High-performance in-memory cache engine with custom memory allocator.',
      stars: 840,
      forks: 92,
      lang: 'C++',
      url: `https://github.com/${profileData.username}/hyper-cache-engine`,
    },
    {
      name: 'react-limelight-nav',
      desc: 'Fluid glass lighting animation hook for React web apps.',
      stars: 450,
      forks: 34,
      lang: 'TypeScript',
      url: `https://github.com/${profileData.username}/react-limelight-nav`,
    },
  ];

  const achievementsList = profileData.achievements || [
    { id: 'ach_1', title: 'Grand Architect', desc: 'Achieved 900+ DevScore on verified commits', icon: '🏆' },
    { id: 'ach_2', title: 'Kernel Contributor', desc: 'Merged pull requests into top open source repos', icon: '🚀' },
    { id: 'ach_3', title: '100+ Star Club', desc: 'Created open source projects starring over 100 stars', icon: '⭐' },
    { id: 'ach_4', title: 'Code Mastery', desc: 'Demonstrated exceptional code clean-ratio & safety', icon: '⚡' },
  ];

  return (
    <div className="w-full space-y-4 pb-20 block md:hidden">
      {/* CARD 1: Profile Header Stacked Card */}
      <section className="w-full bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/95 backdrop-blur-2xl border border-slate-800/90 light:border-slate-200/90 rounded-3xl overflow-hidden shadow-2xl transition-colors">
        {/* Cover Gradient Banner */}
        <div className="h-32 w-full bg-gradient-to-r from-cyan-900 via-indigo-900 to-purple-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.25),transparent_50%)]" />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
            Grade: {profileData.grade || 'A+'}
          </div>
        </div>

        {/* Header Content */}
        <div className="px-4 pb-5 pt-0 relative">
          {/* Avatar with animated Tier Frame */}
          <div className="-mt-14 mb-3 flex items-end justify-between">
            <div className="relative">
              <TierAvatar
                src={profileData.avatarUrl || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                alt={profileData.name || profileData.username || 'User'}
                tier={profileData.tier || 'Diamond'}
                size="lg"
                className="w-24 h-24 rounded-2xl ring-4 ring-slate-950 shadow-2xl"
              />
            </div>

            {/* Action Button */}
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                Edit Profile
              </button>
            ) : (
              <a
                href={`https://github.com/${profileData.username}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-slate-950 flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                <GithubIcon className="w-3.5 h-3.5 fill-slate-950" />
                Follow on GitHub
              </a>
            )}
          </div>

          {/* Name & Handles */}
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">{profileData.name || profileData.username}</h1>
            <p className="text-xs font-mono text-cyan-400">@{profileData.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                {profileData.rankTitle || 'Master Tier'}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-semibold">
                Score: {profileData.score || 920}/1000
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center font-mono">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-base font-bold text-slate-100">{profileData.publicRepos || 42}</span>
              <p className="text-[10px] text-slate-400">Repos</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-base font-bold text-cyan-400">
                {(profileData.followersCount || profileData.followers || 1420).toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-400">Followers</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-base font-bold text-indigo-400">
                {profileData.followingCount || 280}
              </span>
              <p className="text-[10px] text-slate-400">Following</p>
            </div>
          </div>
        </div>
      </section>

      {/* CARD 2: About Card */}
      <section className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-lg">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          About Developer
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{defaultAbout}</p>

        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{profileData.location || 'San Francisco, CA'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-purple-400" />
            <span>{profileData.company || 'Open Source Architect'}</span>
          </div>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            <a href={`https://${profileData.username}.dev`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
              https://{profileData.username}.dev
            </a>
          </div>
        </div>
      </section>

      {/* CARD 3: Signature Developer Card */}
      <section className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-lg">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Verified Identity Card
        </h3>
        <DeveloperCard data={profileData} />
      </section>

      {/* CARD 4: Top Projects Card */}
      <section className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            Top Projects
          </h3>
          <span className="text-[10px] font-mono text-cyan-400">{topProjects.length} Repos</span>
        </div>

        <div className="space-y-2.5">
          {topProjects.map((proj) => (
            <a
              key={proj.name}
              href={proj.url}
              target="_blank"
              rel="noreferrer"
              className="block p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 active:scale-98 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1">
                  {proj.name}
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  {proj.lang}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-2 font-sans">{proj.desc}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  {proj.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3 text-indigo-400" />
                  {proj.forks}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CARD 5: GitHub Analytics Card */}
      <section className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-lg space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          GitHub Analytics
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center font-mono">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-lg font-bold text-emerald-400">{(profileData.totalCommits || 2480).toLocaleString()}</span>
            <p className="text-[10px] text-slate-400">Total Commits</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-lg font-bold text-amber-400">{(profileData.totalStars || 1850).toLocaleString()}</span>
            <p className="text-[10px] text-slate-400">Total Stars</p>
          </div>
        </div>

        {/* Top Languages Progress Bar */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <p className="text-[11px] font-mono text-slate-400">Language Breakdown</p>
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
            {(profileData.topLanguages || [
              { name: 'TypeScript', percent: 65, color: '#3178C6' },
              { name: 'Rust', percent: 25, color: '#DEA584' },
              { name: 'Go', percent: 10, color: '#00ADD8' },
            ]).map((lang) => (
              <div key={lang.name} style={{ width: `${lang.percent}%`, backgroundColor: lang.color }} className="h-full" />
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>TypeScript (65%)</span>
            <span>Rust (25%)</span>
            <span>Go (10%)</span>
          </div>
        </div>
      </section>

      {/* CARD 6: Achievements Card */}
      <section className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 shadow-lg space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          Achievements & Badges
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {achievementsList.map((ach) => (
            <div key={ach.id} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xl">{ach.icon}</div>
              <h4 className="text-xs font-bold text-slate-200">{ach.title}</h4>
              <p className="text-[10px] text-slate-400 leading-tight">{ach.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
