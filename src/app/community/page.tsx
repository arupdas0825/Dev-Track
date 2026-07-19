'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { 
  Users, 
  Code2, 
  Cpu, 
  ShieldCheck, 
  Cloud, 
  Globe, 
  Sparkles, 
  ArrowRight,
  Trophy,
  GraduationCap,
  Calendar,
  Gift,
  Server
} from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Frontend',
    'Backend',
    'AI',
    'Machine Learning',
    'Cloud',
    'Cyber Security',
    'Universities',
    'Events',
    'Hackathons',
  ];

  const groups = [
    { name: 'Frontend Guild', category: 'Frontend', members: '14.2k', desc: 'React, Next.js, WebAssembly, CSS tokens & UI performance.', icon: Code2, color: 'text-indigo-400' },
    { name: 'Backend Systems', category: 'Backend', members: '12.8k', desc: 'Distributed databases, Go routers, Rust microservices, gRPC.', icon: Server, color: 'text-cyan-400' },
    { name: 'AI & Machine Learning', category: 'AI', members: '18.9k', desc: 'LLM fine-tuning, autonomous agents, RAG, PyTorch & CUDA.', icon: Cpu, color: 'text-purple-400' },
    { name: 'Machine Learning Research', category: 'Machine Learning', members: '10.5k', desc: 'Transformers, diffusion models, model quantization, benchmarks.', icon: Sparkles, color: 'text-purple-300' },
    { name: 'Cloud Native & DevOps', category: 'Cloud', members: '9.4k', desc: 'Kubernetes, Docker, Terraform, serverless edge networks.', icon: Cloud, color: 'text-cyan-400' },
    { name: 'Cyber Security & Audit', category: 'Cyber Security', members: '6.8k', desc: 'Code vulnerability scanning, zero-trust, cryptanalysis.', icon: ShieldCheck, color: 'text-emerald-400' },
    { name: 'University Developers', category: 'Universities', members: '15.1k', desc: 'Student engineering chapters, research labs, campus hackathons.', icon: GraduationCap, color: 'text-amber-400' },
    { name: 'Global Tech Events', category: 'Events', members: '8.3k', desc: 'Virtual summits, keynote streams, local developer meetups.', icon: Calendar, color: 'text-pink-400' },
    { name: 'Hackathon League 2026', category: 'Hackathons', members: '22.4k', desc: 'Monthly hackathons, team matching, project submissions, prizes.', icon: Gift, color: 'text-amber-300' },
  ];

  const filteredGroups = activeCategory === 'All' 
    ? groups 
    : groups.filter(g => g.category === activeCategory || g.name.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3">
            <Users className="h-3.5 w-3.5" />
            <span>Developer Ecosystem</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            DevTrack Communities & Guilds
          </h1>
          <p className="mt-2 text-xs text-slate-400 max-w-xl">
            Connect with domain experts, participate in technical discussions, and join specialized engineering guilds.
          </p>
        </div>

        {/* Category Selection Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 bg-slate-900/60 border border-white/5 hover:border-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.name}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 ${group.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-300">
                      {group.members} Developers
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{group.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{group.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                    <span>Join Guild</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

