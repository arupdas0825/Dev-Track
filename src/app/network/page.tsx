'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { DeveloperTier } from '@/components/card/DeveloperCard';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  Sparkles, 
  Star, 
  GitFork, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Building,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';

interface DeveloperConnection {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  tier: DeveloperTier;
  score: number;
  followers: number;
  topLanguage: string;
  location?: string;
  isFollowing?: boolean;
  mutualCount?: number;
}

const SUGGESTED_DEVELOPERS: DeveloperConnection[] = [
  {
    id: 'dev_1',
    username: 'torvalds',
    name: 'Linus Torvalds',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    bio: 'Creator of Linux & Git. Kernel Architect.',
    tier: 'Emerald',
    score: 998,
    followers: 215000,
    topLanguage: 'C',
    location: 'Portland, OR',
    isFollowing: false,
    mutualCount: 42,
  },
  {
    id: 'dev_2',
    username: 'gaearon',
    name: 'Dan Abramov',
    avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
    bio: 'Co-created Redux & Create React App.',
    tier: 'Diamond',
    score: 945,
    followers: 84000,
    topLanguage: 'TypeScript',
    location: 'London, UK',
    isFollowing: true,
    mutualCount: 18,
  },
  {
    id: 'dev_3',
    username: 'shadcn',
    name: 'shadcn',
    avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
    bio: 'Building re-usable open source design systems.',
    tier: 'Diamond',
    score: 962,
    followers: 67000,
    topLanguage: 'TypeScript',
    location: 'San Francisco, CA',
    isFollowing: false,
    mutualCount: 29,
  },
  {
    id: 'dev_4',
    username: 'siddharth',
    name: 'Siddharth Kshetrapal',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
    bio: 'Design systems engineer & UI architect.',
    tier: 'Gold',
    score: 890,
    followers: 32000,
    topLanguage: 'JavaScript',
    location: 'Berlin, Germany',
    isFollowing: false,
    mutualCount: 12,
  },
  {
    id: 'dev_5',
    username: 'rich-harris',
    name: 'Rich Harris',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1162160?v=4',
    bio: 'Creator of Svelte & Rollup.',
    tier: 'Diamond',
    score: 955,
    followers: 52000,
    topLanguage: 'JavaScript',
    location: 'New York, NY',
    isFollowing: false,
    mutualCount: 24,
  },
  {
    id: 'dev_6',
    username: 'antfu',
    name: 'Anthony Fu',
    avatarUrl: 'https://avatars.githubusercontent.com/u/11247099?v=4',
    bio: 'Fanatical open sourcerer. Vue & Vite core team.',
    tier: 'Emerald',
    score: 978,
    followers: 49000,
    topLanguage: 'TypeScript',
    location: 'Tokyo, Japan',
    isFollowing: false,
    mutualCount: 31,
  },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<'network' | 'following' | 'followers' | 'requests'>('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [developers, setDevelopers] = useState<DeveloperConnection[]>(SUGGESTED_DEVELOPERS);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('devtrack_current_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  const toggleFollow = (id: string) => {
    setDevelopers((prev) =>
      prev.map((dev) =>
        dev.id === id ? { ...dev, isFollowing: !dev.isFollowing } : dev
      )
    );
  };

  const filteredDevs = developers.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.bio.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'following') return dev.isFollowing && matchesSearch;
    if (activeTab === 'followers') return matchesSearch;
    if (activeTab === 'requests') return dev.mutualCount && dev.mutualCount > 20 && matchesSearch;
    return matchesSearch;
  });

  const followingCount = developers.filter((d) => d.isFollowing).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <Users className="h-3.5 w-3.5" />
              <span>DevTrack Developer Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Manage Your Professional Connections
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect with verified engineers, follow open source architects, and discover mutual collaborators across the global developer ecosystem.
            </p>
          </div>
        </div>

        {/* Network Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Connections</span>
            <p className="text-xl font-bold text-cyan-400 font-mono mt-0.5">{followingCount + 142}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Following</span>
            <p className="text-xl font-bold text-purple-400 font-mono mt-0.5">{followingCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Followers</span>
            <p className="text-xl font-bold text-indigo-400 font-mono mt-0.5">384</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Pending Requests</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">3</p>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'network', label: 'Suggested Network', count: developers.length },
              { id: 'following', label: 'Following', count: followingCount },
              { id: 'followers', label: 'Followers', count: 384 },
              { id: 'requests', label: 'Requests', count: 3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-slate-800 text-slate-300">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, tech..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Developers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevs.map((dev) => (
            <div
              key={dev.id}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700/80 transition-all space-y-4 shadow-lg group"
            >
              {/* Dev Header */}
              <div className="flex items-start gap-3">
                <Link href={`/u/${dev.username}`} className="shrink-0 group-hover:scale-105 transition-transform">
                  <TierAvatar
                    src={dev.avatarUrl}
                    alt={dev.name}
                    tier={dev.tier}
                    size="md"
                    className="w-12 h-12 rounded-2xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/u/${dev.username}`} className="hover:underline">
                    <h3 className="font-bold text-white text-sm truncate">{dev.name}</h3>
                  </Link>
                  <p className="text-xs font-mono text-cyan-400 truncate">@{dev.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {dev.tier}
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 font-semibold">
                      Score: {dev.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {dev.bio}
              </p>

              {/* Location & Mutual Info */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-3">
                {dev.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {dev.location}
                  </span>
                )}
                {dev.mutualCount && (
                  <span className="text-indigo-400 font-semibold">
                    {dev.mutualCount} mutual connections
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toggleFollow(dev.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    dev.isFollowing
                      ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/40'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:opacity-95'
                  }`}
                >
                  {dev.isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/u/${dev.username}`}
                  className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 active:scale-95 transition-all"
                  aria-label="View Profile"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
