'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Search, User, FolderGit2, Users, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UniversalSearchPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'devs' | 'projects' | 'communities'>('all');

  const devs = [
    { name: 'Linus Torvalds', username: 'torvalds', role: 'Kernel Architect', score: 998 },
    { name: 'Dan Abramov', username: 'gaearon', role: 'UI Pioneer', score: 945 },
    { name: 'shadcn', username: 'shadcn', role: 'Design System Master', score: 962 },
  ];

  const projects = [
    { title: 'DevTrack 2.0', lang: 'TypeScript', stars: '4.8k' },
    { title: 'simd-vector-db', lang: 'Rust', stars: '3.1k' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-white">Universal Search</h1>
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search developers, projects, repositories, or tech stack..."
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 pl-12 pr-6 py-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none backdrop-blur-xl shadow-2xl"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Developers</h3>
            <div className="space-y-3">
              {devs.map((d) => (
                <div key={d.username} className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${d.username}`}
                      alt={d.name}
                      className="h-9 w-9 rounded-xl"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{d.name}</h4>
                      <p className="text-[11px] text-slate-400">@{d.username} • {d.role}</p>
                    </div>
                  </div>
                  <Link href={`/u/${d.username}`} className="flex items-center gap-1 text-xs font-semibold text-indigo-400">
                    <span>View Identity</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
