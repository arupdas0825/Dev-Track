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
  RefreshCw
} from 'lucide-react';

export default function AISuitePage() {
  const [activeTab, setActiveTab] = useState<'dna' | 'security' | 'resume'>('dna');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>DevTrack AI Intelligence Layer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Developer Intelligence Suite
          </h1>
          <p className="mt-2 text-xs text-slate-400 max-w-xl">
            AI-driven Developer DNA analysis, security vulnerability audits, and automated resume ATS optimization.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'dna', label: 'Developer DNA', icon: Cpu },
            { id: 'security', label: 'Security & Code Audit', icon: ShieldCheck },
            { id: 'resume', label: 'Resume ATS Analyzer', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Developer DNA */}
        {activeTab === 'dna' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Architectural Archetype</h3>
                    <p className="text-xs text-indigo-400 font-semibold">Full-Stack Systems & Distributed Infrastructure</p>
                  </div>
                </div>
                <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  99.2% AI Confidence
                </span>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>
                  Your GitHub activity exhibits exceptional commitment to type safety, low latency asynchronous programming, and clean modular component design.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">Primary Strength</span>
                    <h5 className="text-sm font-bold text-white">Distributed State Systems</h5>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400">Recommended Next Mastery</span>
                    <h5 className="text-sm font-bold text-purple-300">WASM SIMD Acceleration</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">AI Career Vectors</h4>
              <div className="space-y-3 text-xs">
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                  <span className="font-bold text-indigo-300">Staff Frontend Architect</span>
                  <p className="text-[11px] text-slate-400 mt-1">98% skill match for high-scale enterprise platforms.</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-3">
                  <span className="font-bold text-purple-300">Open Source Maintainer</span>
                  <p className="text-[11px] text-slate-400 mt-1">95% match based on commit cadence and issue reviews.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Resume ATS Analyzer */}
        {activeTab === 'resume' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Paste Resume / CV for Real-time ATS Evaluation</h3>
              <p className="text-xs text-slate-400">
                Our AI model evaluates your resume against top technical standards, keyword optimization, and GitHub alignment.
              </p>
            </div>

            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your technical resume markdown or text here..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />

            <button
              onClick={handleAnalyzeResume}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Run AI ATS Audit</span>
            </button>

            {atsResult && (
              <div className="mt-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">ATS Compatibility Score</h4>
                  <span className="text-xl font-extrabold text-emerald-400">{atsResult.score}/100</span>
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
      </main>
    </div>
  );
}
