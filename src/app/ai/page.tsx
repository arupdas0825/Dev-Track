'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Code2, 
  Zap, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Brain,
  Lightbulb,
  Check
} from 'lucide-react';

export default function AISuitePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'github' | 'resume' | 'projects' | 'career' | 'coding'>('profile');
  const [resumeText, setResumeText] = useState('');
  const [atsResult, setAtsResult] = useState<any>(null);

  const handleAnalyzeResume = () => {
    setAtsResult({
      score: 94,
      strengths: [
        'Strong technical keywords (TypeScript, Rust, Next.js App Router, RAG)',
        'Quantifiable engineering impact metrics included',
        'Verified open source repository contributions'
      ],
      suggestions: [
        'Add link to your DevTrack 2.0 verified Developer Card',
        'Elaborate on SIMD optimization experience in vector databases'
      ]
    });
  };

  const modules = [
    { id: 'profile', label: 'Profile Review', icon: Cpu },
    { id: 'github', label: 'GitHub Analysis', icon: Brain },
    { id: 'resume', label: 'Resume Review', icon: FileText },
    { id: 'projects', label: 'Project Suggestions', icon: Lightbulb },
    { id: 'career', label: 'Career Insights', icon: TrendingUp },
    { id: 'coding', label: 'Coding Insights', icon: Code2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-purple-950/60 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DevTrack AI Intelligence Layer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              AI-Powered Developer Insights & Analytics
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time deep analysis of code quality, architecture archetypes, resume ATS optimization, and personalized career trajectories.
            </p>
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {modules.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile Review */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Developer Profile Audit</h3>
                    <p className="text-xs text-indigo-400 font-semibold">Architectural Archetype: Systems Kernel Creator</p>
                  </div>
                </div>
                <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  99.4% AI Score
                </span>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>
                  Your profile displays exceptional repository clean ratio, verified commit frequency, and high community engagement across open source codebases.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Primary Superpower</span>
                    <h5 className="text-sm font-bold text-white">High-Performance Asynchronous Systems</h5>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Suggested Upgrade</span>
                    <h5 className="text-sm font-bold text-purple-300">WASM SIMD Vector Acceleration</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Profile Strengths</h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/30 p-3 rounded-2xl border border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>99.8% Type Safety in TypeScript repos</span>
                </div>
                <div className="flex items-start gap-2 text-cyan-300 bg-cyan-950/30 p-3 rounded-2xl border border-cyan-800/40">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Verified 100+ Star Open Source Repository</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GitHub Analysis */}
        {activeTab === 'github' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-white text-base">Deep AI GitHub Code Analysis</h3>
            <p className="text-xs text-slate-300">Evaluating 14,200+ commits across 90+ repositories.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Commit Consistency</span>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">98.5%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Code Clean Ratio</span>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">99.1%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">PR Acceptance</span>
                <p className="text-xl font-bold text-purple-400 font-mono mt-1">96.0%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Security Hygiene</span>
                <p className="text-xl font-bold text-indigo-400 font-mono mt-1">100%</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Resume Review */}
        {activeTab === 'resume' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Paste Resume / CV for Real-time ATS Evaluation</h3>
              <p className="text-xs text-slate-400">
                Our AI model evaluates your resume against top technical standards, keyword optimization, and GitHub alignment.
              </p>
            </div>

            <textarea
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your technical resume markdown or text here..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-mono"
            />

            <button
              onClick={handleAnalyzeResume}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Run AI ATS Audit</span>
            </button>

            {atsResult && (
              <div className="mt-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">ATS Compatibility Score</h4>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">{atsResult.score}/100</span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-200">Strengths:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {atsResult.strengths.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Project Suggestions */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px] font-mono font-bold">High Impact</span>
              <h4 className="font-bold text-white text-base">Distributed Vector Similarity Cache</h4>
              <p className="text-xs text-slate-300">Rust + WASM SIMD memory allocator to speed up local RAG query execution.</p>
            </div>
            <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40 text-[10px] font-mono font-bold">Recommended</span>
              <h4 className="font-bold text-white text-base">Next.js Realtime Presence Hook</h4>
              <p className="text-xs text-slate-300">Zero-dependency WebSocket hook with optimistic conflict resolution.</p>
            </div>
          </div>
        )}

        {/* Tab 5 & 6: Career & Coding Insights */}
        {(activeTab === 'career' || activeTab === 'coding') && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-white text-base">Engineering Trajectory Insights</h3>
            <p className="text-xs text-slate-300">
              Your coding profile maps to high-growth Staff Engineer and Tech Lead roles across Silicon Valley & EU startups.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
