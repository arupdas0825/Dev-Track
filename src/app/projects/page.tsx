'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { 
  FolderGit2, 
  Star, 
  GitFork, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Code2, 
  Rocket, 
  Heart
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import Link from 'next/link';

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    {
      id: 'devtrack-2',
      title: 'DevTrack 2.0 Identity Platform',
      tagline: 'Developer identity engine transforming GitHub commits into verified scores and visual cards.',
      category: 'Developer Tools',
      stars: 4890,
      forks: 320,
      lang: 'TypeScript',
      author: 'shadcn',
      demoUrl: 'https://devtrack.io',
      githubUrl: 'https://github.com/shadcn/ui',
      aiScore: '99.4%'
    },
    {
      id: 'vector-db-simd',
      title: 'simd-vector-db',
      tagline: 'Ultra-fast SIMD vector similarity index written in Rust for real-time LLM retrieval.',
      category: 'AI & Data',
      stars: 3120,
      forks: 210,
      lang: 'Rust',
      author: 'sarah_ai',
      demoUrl: 'https://vectordb.dev',
      githubUrl: 'https://github.com/torvalds/linux',
      aiScore: '98.7%'
    },
    {
      id: 'next-agent-swarm',
      title: 'Next Agent Swarm',
      tagline: 'Multi-agent orchestration framework built on Next.js App Router and Web Workers.',
      category: 'AI & Machine Learning',
      stars: 2450,
      forks: 180,
      lang: 'TypeScript',
      author: 'gaearon',
      demoUrl: 'https://agentswarm.dev',
      githubUrl: 'https://github.com/gaearon/redux',
      aiScore: '97.2%'
    }
  ];

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3">
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>Project Showcase</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Open-Source & Developer Projects
            </h1>
            <p className="mt-2 text-xs text-slate-400 max-w-xl">
              Explore production-grade tools, libraries, and applications built by the DevTrack developer ecosystem.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title, stack, or tech..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="group rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[11px] font-bold text-indigo-300">
                    {proj.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{proj.aiScore} AI Score</span>
                  </div>
                </div>

                <Link href={`/projects/${proj.id}`}>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {proj.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {proj.tagline}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">@{proj.author}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-300" /> {proj.stars}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <GitFork className="h-3.5 w-3.5" /> {proj.forks}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                    {proj.lang}
                  </span>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>View Showcase</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
