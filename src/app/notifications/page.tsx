'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Bell, Star, GitPullRequest, GitCommit, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 'n1',
      type: 'star',
      title: 'New Stargazer on DevTrack 2.0',
      description: '@shadcn starred your repository dev-track.',
      time: '10m ago',
      icon: Star,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      id: 'n2',
      type: 'follow',
      title: 'New GitHub Follower',
      description: '@torvalds started following your profile on GitHub.',
      time: '1h ago',
      icon: Users,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    },
    {
      id: 'n3',
      type: 'pr',
      title: 'Pull Request Merged',
      description: 'Your pull request #42 in simd-vector-store was successfully merged.',
      time: '3h ago',
      icon: GitPullRequest,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      id: 'n4',
      type: 'commit',
      title: 'Verified Telemetry Activity',
      description: 'DevTrack processed 14 new GitHub contributions for your profile card.',
      time: '1d ago',
      icon: CheckCircle2,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-md">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Notifications</h1>
              <p className="text-xs text-slate-400">Live GitHub events & DevTrack identity updates</p>
            </div>
          </div>

          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono font-bold text-indigo-300">
            {notifications.length} Unread
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const IconComp = n.icon;
            return (
              <div
                key={n.id}
                className="flex items-start gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl hover:border-indigo-500/40 transition-all"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${n.color}`}>
                  <IconComp className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-white truncate">{n.title}</h3>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{n.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-normal">{n.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
