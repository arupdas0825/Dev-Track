'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, RefreshCw, Layers } from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { DeveloperCard, DeveloperCardData } from './DeveloperCard';

const SAMPLE_PROFILES: Record<string, DeveloperCardData> = {
  torvalds: {
    username: 'torvalds',
    name: 'Linus Torvalds',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    bio: 'Creator of Linux and Git. Systems Architect & Kernel Master.',
    publicRepos: 7,
    followers: 215000,
    totalStars: 185000,
    stars: 185000,
    totalCommits: 14200,
    score: 998,
    rankTitle: 'Grand Architect',
    archetype: 'System Kernel Creator',
    topLanguages: [
      { name: 'C', percent: 85, color: '#555555' },
      { name: 'Assembly', percent: 10, color: '#6E4C13' },
      { name: 'Shell', percent: 5, color: '#89E051' },
    ],
    contributions: [15, 22, 18, 25, 30, 28, 40, 32, 19, 24, 35, 42, 29, 31],
  },
  gaearon: {
    username: 'gaearon',
    name: 'Dan Abramov',
    avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
    bio: 'Co-created Redux & Create React App. Building developer experiences.',
    publicRepos: 265,
    followers: 84000,
    totalStars: 120000,
    stars: 120000,
    totalCommits: 8900,
    score: 945,
    rankTitle: 'Principal Frontend Architect',
    archetype: 'UI & State Pioneer',
    topLanguages: [
      { name: 'JavaScript', percent: 60, color: '#F7DF1E' },
      { name: 'TypeScript', percent: 35, color: '#3178C6' },
      { name: 'HTML', percent: 5, color: '#E34F26' },
    ],
    contributions: [8, 12, 15, 10, 22, 18, 14, 25, 20, 16, 28, 19, 22, 30],
  },
  shadcn: {
    username: 'shadcn',
    name: 'shadcn',
    avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
    bio: 'Designing and building open source UI components. Re-usable design systems.',
    publicRepos: 92,
    followers: 67000,
    totalStars: 98000,
    stars: 98000,
    totalCommits: 6400,
    score: 962,
    rankTitle: 'Design System Master',
    archetype: 'UI Engineering Lead',
    topLanguages: [
      { name: 'TypeScript', percent: 70, color: '#3178C6' },
      { name: 'React', percent: 20, color: '#61DAFB' },
      { name: 'Tailwind', percent: 10, color: '#06B6D4' },
    ],
    contributions: [12, 18, 24, 29, 35, 22, 19, 31, 28, 40, 32, 26, 38, 45],
  },
};

interface CardGeneratorProps {
  onRequireAuth: (actionTitle: string, actionMessage?: string, resume?: () => void) => void;
}

export const CardGenerator: React.FC<CardGeneratorProps> = ({ onRequireAuth }) => {
  const [inputUsername, setInputUsername] = useState('shadcn');
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState<DeveloperCardData>(SAMPLE_PROFILES['shadcn']);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUser = inputUsername.trim().toLowerCase() || 'shadcn';
    setLoading(true);

    try {
      const res = await fetch(`https://api.github.com/users/${cleanUser}`);
      if (res.ok) {
        const gh = await res.json();
        const score = Math.min(999, Math.floor(700 + (gh.public_repos * 3) + (gh.followers * 0.5)));
        const starsCalculated = Math.floor((gh.followers || 20) * 4.5);
        
        setCardData({
          username: gh.login,
          name: gh.name || gh.login,
          avatarUrl: gh.avatar_url,
          bio: gh.bio || 'Passionate software engineer building modern digital products.',
          location: gh.location || 'Global Remote',
          publicRepos: gh.public_repos || 12,
          followers: gh.followers || 42,
          totalStars: starsCalculated,
          stars: starsCalculated,
          totalCommits: Math.floor((gh.public_repos || 10) * 85),
          score,
          rankTitle: score > 900 ? 'Top 1% Architect' : score > 800 ? 'Senior Engineer' : 'Core Developer',
          archetype: 'Full-Stack Developer',
          topLanguages: [
            { name: 'TypeScript', percent: 55, color: '#3178C6' },
            { name: 'Python', percent: 25, color: '#3572A5' },
            { name: 'Rust', percent: 20, color: '#DEA584' },
          ],
          contributions: [5, 12, 8, 14, 20, 15, 22, 18, 10, 16, 25, 30, 22, 28],
        });
      } else if (SAMPLE_PROFILES[cleanUser]) {
        setCardData(SAMPLE_PROFILES[cleanUser]);
      } else {
        setCardData({
          username: cleanUser,
          name: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUser}`,
          bio: `Full-stack developer building open source software under @${cleanUser}.`,
          publicRepos: 24,
          followers: 148,
          totalStars: 340,
          stars: 340,
          totalCommits: 1850,
          score: 840,
          rankTitle: 'Core Software Specialist',
          archetype: 'Systems & Web Architect',
          topLanguages: [
            { name: 'TypeScript', percent: 50, color: '#3178C6' },
            { name: 'Go', percent: 30, color: '#00ADD8' },
            { name: 'Docker', percent: 20, color: '#2496ED' },
          ],
          contributions: [8, 14, 12, 19, 25, 22, 18, 30, 24, 28, 32, 26, 35, 40],
        });
      }
    } catch {
      if (SAMPLE_PROFILES[cleanUser]) {
        setCardData(SAMPLE_PROFILES[cleanUser]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Input Form Box */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <GithubIcon className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. shadcn, torvalds)"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Generate Card</span>
          </button>
        </form>

        {/* Quick presets */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-500">Quick Samples:</span>
          {['shadcn', 'gaearon', 'torvalds'].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setInputUsername(sample);
                setCardData(SAMPLE_PROFILES[sample]);
              }}
              className="rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-1 text-[11px] font-mono text-indigo-300 hover:border-indigo-500/40 transition-all"
            >
              @{sample}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Card Output */}
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          <DeveloperCard
            key={cardData.username}
            data={cardData}
            onRequireAuth={onRequireAuth}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};
