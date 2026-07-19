'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Flame, 
  Trophy, 
  Terminal, 
  Star, 
  Sparkles, 
  ExternalLink,
  Calendar,
  Gift
} from 'lucide-react';

export const TrendingSidebar: React.FC = () => {
  const trendingDevs = [
    { name: 'Sarah Chen', username: 'sarah_ai', score: 968, archetype: 'LLM Systems' },
    { name: 'Marcus Vance', username: 'mvance', score: 942, archetype: 'Rust Core' },
    { name: 'Elena Rostova', username: 'erostova', score: 925, archetype: 'Cloud Native' },
  ];

  const trendingProjects = [
    { name: 'vector-db-core', stars: '4.2k', desc: 'Ultra-fast SIMD vector database in Rust', lang: 'Rust' },
    { name: 'next-ai-agent', stars: '2.8k', desc: 'Autonomous full-stack AI coding assistant', lang: 'TypeScript' },
  ];

  const upcomingHackathons = [
    { name: 'Global AI Identity Hack 2026', prize: '$50,000', date: 'Jul 28 - Aug 2' },
    { name: 'Open Source Cloud Challenge', prize: '$25,000', date: 'Aug 10 - Aug 15' },
  ];

  return (
    <div className="space-y-6">
      {/* Leaderboard Card */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Weekly Leaderboard
            </h4>
          </div>
          <span className="text-[10px] font-bold text-indigo-400">Global Top 3</span>
        </div>

        <div className="space-y-3">
          {trendingDevs.map((dev, idx) => (
            <div
              key={dev.username}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 p-2.5 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  #{idx + 1}
                </span>
                <div>
                  <Link href={`/u/${dev.username}`} className="text-xs font-bold text-white hover:text-indigo-400">
                    {dev.name}
                  </Link>
                  <p className="text-[10px] text-slate-400">{dev.archetype}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Flame className="h-3 w-3 fill-amber-400" />
                <span>{dev.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Projects */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Trending Repositories
            </h4>
          </div>
          <Link href="/projects" className="text-[10px] font-bold text-indigo-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {trendingProjects.map((proj) => (
            <div
              key={proj.name}
              className="rounded-2xl border border-white/5 bg-slate-950/40 p-3 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{proj.name}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Star className="h-3 w-3 fill-amber-300" /> {proj.stars}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{proj.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hackathons & AI News */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Featured Hackathons
            </h4>
          </div>
        </div>

        <div className="space-y-3">
          {upcomingHackathons.map((h) => (
            <div
              key={h.name}
              className="rounded-2xl border border-white/5 bg-slate-950/40 p-3"
            >
              <h5 className="text-xs font-bold text-white">{h.name}</h5>
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">Prize Pool: {h.prize}</span>
                <span className="text-slate-400">{h.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
