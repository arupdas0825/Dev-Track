'use client';

import React, { useState, useEffect, use } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DeveloperCard, DeveloperCardData } from '@/components/card/DeveloperCard';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  Flame, 
  Star, 
  GitFork, 
  GitCommit, 
  Award, 
  ShieldCheck, 
  FolderGit2, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  CheckCircle2, 
  Share2, 
  Download, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Activity
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username || 'shadcn';

  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'posts' | 'achievements'>('overview');
  const [profileData, setProfileData] = useState<DeveloperCardData>({
    username: username,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
    bio: 'Software engineer building modern developer identity tools, design systems, and distributed web applications.',
    location: 'San Francisco, CA',
    publicRepos: 34,
    followers: 1240,
    totalStars: 4890,
    totalCommits: 3120,
    score: 915,
    rankTitle: 'Principal Developer',
    archetype: 'Full-Stack Systems Architect',
    topLanguages: [
      { name: 'TypeScript', percent: 65, color: '#3178C6' },
      { name: 'Rust', percent: 20, color: '#DEA584' },
      { name: 'Go', percent: 15, color: '#00ADD8' },
    ],
    contributions: [12, 18, 24, 15, 30, 22, 35, 28, 40, 32, 29, 38, 45, 50],
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Try to fetch public profile live from GitHub API
    fetch(`https://api.github.com/users/${username}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((gh) => {
        if (gh) {
          setProfileData({
            username: gh.login,
            name: gh.name || gh.login,
            avatarUrl: gh.avatar_url,
            bio: gh.bio || 'Building scalable systems, open-source software, and developer tools.',
            location: gh.location || 'Global Remote',
            publicRepos: gh.public_repos || 24,
            followers: gh.followers || 310,
            totalStars: Math.floor((gh.followers || 50) * 5),
            totalCommits: Math.floor((gh.public_repos || 15) * 90),
            score: Math.min(999, Math.floor(750 + (gh.public_repos * 2) + (gh.followers * 0.4))),
            rankTitle: 'Top Developer',
            archetype: 'Core Software Architect',
            topLanguages: [
              { name: 'TypeScript', percent: 60, color: '#3178C6' },
              { name: 'Python', percent: 25, color: '#3572A5' },
              { name: 'Rust', percent: 15, color: '#DEA584' },
            ],
            contributions: [8, 14, 20, 25, 30, 22, 18, 32, 28, 35, 42, 38, 45, 52],
          });
        }
      })
      .catch(() => {});
  }, [username]);

  const pinnedProjects = [
    {
      id: 'p1',
      title: 'DevTrack 2.0 Core Engine',
      desc: 'Developer Identity Platform transforming GitHub commits into verified scores and profile cards.',
      stars: '3.4k',
      forks: '290',
      lang: 'TypeScript',
      url: 'https://github.com/shadcn/ui'
    },
    {
      id: 'p2',
      title: 'simd-vector-store',
      desc: 'High-performance in-memory vector similarity index compiled to WebAssembly.',
      stars: '1.8k',
      forks: '120',
      lang: 'Rust',
      url: 'https://github.com/torvalds/linux'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Banner Header */}
      <div className="relative h-64 w-full bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-950 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#6366F1_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Profile Header Block */}
        <div className="relative -mt-20 z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={profileData.avatarUrl}
              alt={profileData.name}
              className="h-28 w-28 rounded-3xl object-cover ring-4 ring-slate-950 shadow-2xl bg-slate-900"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {profileData.name}
                </h1>
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-indigo-400">@{profileData.username}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {profileData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                  {profileData.archetype}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Joined DevTrack 2026
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs & Score Ring */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-300">
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>Score: {profileData.score}</span>
            </div>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all"
            >
              <Users className="h-4 w-4" />
              <span>Follow</span>
            </button>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-2 border-b border-white/10 pb-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'projects', label: 'Pinned Projects' },
            { id: 'posts', label: 'Posts & Updates' },
            { id: 'achievements', label: 'Achievements & Badges' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Main Content (Col 1-8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Section */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">About</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {profileData.bio} Specialized in building ultra-fast developer platforms, distributed backend systems, and modern Web frontend applications with strict type safety.
              </p>
            </div>

            {/* Pinned Repositories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-indigo-400" />
                  <span>Pinned Repositories</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white font-mono">{proj.title}</span>
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white"
                        >
                          <GithubIcon className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{proj.desc}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                      <span className="font-semibold text-indigo-300">{proj.lang}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-amber-300" /> {proj.stars}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <GitFork className="h-3.5 w-3.5" /> {proj.forks}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Activity Pulse Heatmap */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>GitHub Contribution Graph</span>
                </h3>
                <span className="text-xs font-semibold text-emerald-400">1,489 Contributions in 2026</span>
              </div>

              <div className="grid grid-cols-14 gap-2 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
                {profileData.contributions.map((c, i) => (
                  <div
                    key={i}
                    title={`${c} contributions`}
                    className={`h-8 rounded-lg ${
                      c > 35 ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : c > 20 ? 'bg-indigo-600/80' : 'bg-indigo-950/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Developer Card Preview (Col 9-12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Live Developer Card
              </span>
              <DeveloperCard data={profileData} onRequireAuth={() => setIsAuthOpen(true)} />
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        actionTitle="Sign in to Interact"
      />
    </div>
  );
}
