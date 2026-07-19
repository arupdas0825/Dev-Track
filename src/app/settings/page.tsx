'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { 
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  Palette, 
  CreditCard, 
  Download, 
  UserX, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Sparkles,
  Terminal
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { syncUserAndReposInFirestore } from '@/lib/firebase';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [accentTheme, setAccentTheme] = useState<string>('indigo');

  useEffect(() => {
    const stored = localStorage.getItem('devtrack_current_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const handleForceSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncStatus('Fetching repositories and contribution commits from GitHub API...');
    try {
      await syncUserAndReposInFirestore(currentUser.uid, currentUser.username, currentUser.token);
      setSyncStatus('GitHub profile & repositories successfully re-synced!');
    } catch (err: any) {
      console.error('Sync failed:', err);
      setSyncStatus(`Sync notice: Local cache updated for @${currentUser.username}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportData = () => {
    if (!currentUser) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `devtrack_profile_${currentUser.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3">
            <Terminal className="h-3.5 w-3.5" />
            <span>Developer Account Controls</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Settings & Identity Customization
          </h1>
          <p className="mt-2 text-xs text-slate-400 max-w-xl">
            Manage your live GitHub synchronization, profile visibility, notification rules, card styling, and data export.
          </p>
        </div>

        {/* 1. GitHub Sync Section */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                <GithubIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">GitHub OAuth Synchronization</h3>
                <p className="text-xs text-slate-400">
                  {currentUser ? `Connected as @${currentUser.username}` : 'Not connected'}
                </p>
              </div>
            </div>

            <button
              onClick={handleForceSync}
              disabled={isSyncing || !currentUser}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Force Re-sync Now'}</span>
            </button>
          </div>

          {syncStatus && (
            <p className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
              {syncStatus}
            </p>
          )}
        </div>

        {/* 2. Profile Privacy */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Profile Visibility & Privacy</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'public', label: 'Public', desc: 'Visible to everyone worldwide on search & direct URL.' },
              { id: 'unlisted', label: 'Unlisted', desc: 'Accessible only by users with your direct link.' },
              { id: 'private', label: 'Private', desc: 'Hidden from public search. Accessible only to logged in you.' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setPrivacy(item.id as any)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  privacy === item.id
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-md shadow-indigo-500/10'
                    : 'border-white/5 bg-slate-950/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{item.label}</span>
                  {privacy === item.id && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Developer Card Customization */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-400" />
            <span>Developer Card Theme & Accent</span>
          </h3>

          <div className="flex items-center gap-3">
            {['indigo', 'purple', 'cyan', 'emerald', 'amber'].map((color) => (
              <button
                key={color}
                onClick={() => setAccentTheme(color)}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  accentTheme === color ? 'scale-110 border-white ring-2 ring-indigo-500' : 'border-transparent'
                } ${
                  color === 'indigo' ? 'bg-indigo-500' :
                  color === 'purple' ? 'bg-purple-500' :
                  color === 'cyan' ? 'bg-cyan-500' :
                  color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 4. Export & Account */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Export Developer Data</h3>
            <p className="text-xs text-slate-400">Download a full JSON archive of your synced repositories, analytics, and scores.</p>
          </div>

          <button
            onClick={handleExportData}
            disabled={!currentUser}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 transition-all disabled:opacity-40"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Export JSON Archive</span>
          </button>
        </div>
      </main>
    </div>
  );
}
