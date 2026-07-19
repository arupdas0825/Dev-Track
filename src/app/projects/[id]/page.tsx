'use client';

import React, { use } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { 
  ExternalLink, 
  Star, 
  GitFork, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Heart, 
  MessageSquare,
  Share2,
  Bookmark
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SingleProjectPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Cover Header Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300">
              FEATURED PROJECT SHOWCASE
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Star className="h-4 w-4 fill-amber-300" /> 4,890 Stars
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                <GitFork className="h-4 w-4" /> 320 Forks
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              DevTrack 2.0 Identity Engine
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-3xl">
              Next-generation Developer Identity Platform that transforms GitHub commits, pull requests, and repositories into verified profile cards, real-time developer scores, and AI resume insights.
            </p>
          </div>

          {/* Action links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/shadcn/ui"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="https://devtrack.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 transition-all"
            >
              <ExternalLink className="h-4 w-4 text-indigo-400" />
              <span>Live Application Demo</span>
            </a>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Details (Col 1-8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* System Architecture */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>System Architecture Overview</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Architected with Next.js App Router, server action streaming, Tailwind CSS v4 design tokens, and AI scoring workers. Incorporates glassmorphism aesthetics and real-time state synchronization across user sessions.
              </p>
            </div>

            {/* AI Technical Review */}
            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6 backdrop-blur-xl space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>AI Codebase Audit</span>
              </h3>
              <div className="space-y-2 text-xs text-purple-200 leading-relaxed">
                <p>• Verified 99.4% type safety with zero strict null errors across 40+ modules.</p>
                <p>• Clean separation of concerns between Firebase Auth, GitHub REST API services, and client rendering.</p>
                <p>• Highly scalable modular architecture ready for high concurrency loading.</p>
              </div>
            </div>
          </div>

          {/* Right Tech Stack Sidebar (Col 9-12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['TypeScript', 'Next.js 16', 'Tailwind CSS', 'Framer Motion', 'Firebase', 'Zustand'].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
