"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserDashboardData } from "@/types";
import { 
  Sparkles, 
  Terminal, 
  Shield, 
  Award, 
  Zap, 
  Flame, 
  FolderGit2, 
  Star, 
  Users, 
  Code2, 
  Calendar,
  CheckCircle2,
  Trophy
} from "lucide-react";

export interface DeveloperCardInfo {
  score: number;
  grade: string;
  username: string;
  name: string;
  avatarUrl: string;
  location: string;
  role: string;
  topLanguage: string;
  repos: number;
  stars: number;
  followers: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  badge: "Mythic" | "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze";
  archetype: string;
  dna: string;
  idHash: string;
}

export function getDeveloperCardInfo(data: UserDashboardData): DeveloperCardInfo {
  const score = data.score?.overall || 0;
  const grade = data.score?.grade || "N/A";
  const username = data.profile?.login || "anonymous";
  const name = data.profile?.name || username;
  const avatarUrl = data.profile?.avatar_url || "";
  const location = data.profile?.location || "Global Ecosystem";
  const role = data.aiInsights?.careerDirection || "Software Engineer";
  
  const topLanguage = data.wrapped?.mostUsedLanguage || 
    (data.languages && data.languages.length > 0 ? data.languages[0].name : "Markdown");
    
  const repos = data.repositories?.length || data.profile?.public_repos || 0;
  const stars = data.contributions?.totalStarsEarned || 
    (data.repositories ? data.repositories.reduce((a, b) => a + (b.stargazers_count || 0), 0) : 0);
  const followers = data.profile?.followers || 0;
  const currentStreak = data.contributions?.currentStreak || 0;
  const longestStreak = data.contributions?.longestStreak || 0;
  const level = Math.max(1, Math.floor(score / 5) + 1);

  let badge: "Mythic" | "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze" = "Bronze";
  if (score >= 95) badge = "Mythic";
  else if (score >= 90) badge = "Diamond";
  else if (score >= 80) badge = "Platinum";
  else if (score >= 70) badge = "Gold";
  else if (score >= 60) badge = "Silver";

  // Determine Archetype
  let archetype = "Code Craftsman";
  if (longestStreak >= 30) {
    archetype = "Consistency Master";
  } else if (data.contributions && data.contributions.totalPRs >= 25) {
    archetype = "Open Source Hero";
  } else if (["Rust", "C", "C++", "Go", "Shell"].includes(topLanguage)) {
    archetype = "Terminal Ninja";
  } else if (["TypeScript", "JavaScript", "HTML", "CSS"].includes(topLanguage) && (data.score?.categories?.repoQuality?.score || 0) >= 16) {
    archetype = "Frontend Wizard";
  } else if ((data.languages && data.languages.some(l => l.name === "Python")) || (data.aiInsights?.suggestedTechnologies && data.aiInsights.suggestedTechnologies.some(t => t.toLowerCase().includes("ai") || t.toLowerCase().includes("ml") || t.toLowerCase().includes("torch")))) {
    archetype = "AI Explorer";
  } else if ((data.score?.categories?.repoQuality?.score || 0) >= 18) {
    archetype = "Clean Architect";
  } else if (data.contributions && data.contributions.totalCommits >= 400) {
    archetype = "Fast Builder";
  } else if (data.contributions && data.contributions.totalIssues >= 15) {
    archetype = "Bug Hunter";
  }

  // Determine DNA
  let dna = "Fullstack Blueprint";
  if (data.languages && data.languages.length >= 4) {
    dna = "Polyglot Architecture";
  } else if (data.languages && data.languages.length > 0 && data.languages[0].percentage > 65) {
    dna = `${topLanguage} Core Specialist`;
  }

  const idHash = (data.profile?.id ? Math.abs(data.profile.id).toString(16).toUpperCase().padStart(8, '0') : "DEV-8899A0");

  return {
    score,
    grade,
    username,
    name,
    avatarUrl,
    location,
    role,
    topLanguage,
    repos,
    stars,
    followers,
    currentStreak,
    longestStreak,
    level,
    badge,
    archetype,
    dna,
    idHash
  };
}

const badgeConfig: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  Mythic: {
    bg: "from-fuchsia-600/30 via-purple-600/30 to-pink-600/30",
    border: "border-fuchsia-500/60",
    text: "text-fuchsia-400",
    glow: "shadow-[0_0_25px_rgba(217,70,239,0.4)]"
  },
  Diamond: {
    bg: "from-cyan-600/30 via-blue-600/30 to-indigo-600/30",
    border: "border-cyan-400/60",
    text: "text-cyan-300",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.4)]"
  },
  Platinum: {
    bg: "from-slate-400/30 via-slate-500/30 to-slate-600/30",
    border: "border-slate-300/60",
    text: "text-slate-200",
    glow: "shadow-[0_0_20px_rgba(203,213,225,0.3)]"
  },
  Gold: {
    bg: "from-amber-600/30 via-yellow-600/30 to-orange-600/30",
    border: "border-amber-400/60",
    text: "text-amber-300",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.4)]"
  },
  Silver: {
    bg: "from-gray-500/30 via-gray-600/30 to-slate-500/30",
    border: "border-gray-400/60",
    text: "text-gray-300",
    glow: "shadow-[0_0_15px_rgba(156,163,175,0.3)]"
  },
  Bronze: {
    bg: "from-orange-700/30 via-amber-800/30 to-yellow-900/30",
    border: "border-orange-600/60",
    text: "text-orange-400",
    glow: "shadow-[0_0_15px_rgba(234,88,12,0.3)]"
  }
};

interface DeveloperCardProps {
  data: UserDashboardData;
  className?: string;
  animate?: boolean;
}

export default function DeveloperCard({ data, className = "", animate = true }: DeveloperCardProps) {
  const info = getDeveloperCardInfo(data);
  const badgeStyle = badgeConfig[info.badge] || badgeConfig.Bronze;

  return (
    <motion.div
      initial={animate ? { opacity: 0, rotateY: 15, scale: 0.95, y: 20 } : {}}
      animate={animate ? { opacity: 1, rotateY: 0, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
      className={`relative w-full max-w-[360px] sm:max-w-[390px] rounded-[24px] border border-white/15 bg-gradient-to-b from-[#161B22]/90 via-[#0D1117]/95 to-[#090D12] p-6 shadow-2xl font-mono text-text-primary overflow-hidden group ${badgeStyle.glow} ${className}`}
    >
      {/* Decorative ambient lighting overlays */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/20 blur-3xl pointer-events-none group-hover:bg-accent/30 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none group-hover:bg-purple-600/30 transition-all duration-700" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none opacity-40" />

      {/* Header: Special Badge + Level */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-border/40">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border bg-gradient-to-r ${badgeStyle.bg} ${badgeStyle.border}`}>
          <Trophy size={13} className={badgeStyle.text} />
          <span className={`text-[10px] font-bold uppercase tracking-wider font-space-grotesk ${badgeStyle.text}`}>
            {info.badge} TIER
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">LVL</span>
          <span className="px-2.5 py-0.5 rounded-md bg-accent/20 border border-accent/40 text-accent text-xs font-extrabold font-space-grotesk">
            {info.level}
          </span>
        </div>
      </div>

      {/* Avatar & Profile Identity */}
      <div className="relative z-10 pt-5 pb-4 flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent via-purple-500 to-pink-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
          {info.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.avatarUrl}
              alt={info.username}
              className="relative h-16 w-16 rounded-full object-cover border-2 border-[#161B22] shadow-xl"
            />
          ) : (
            <div className="relative h-16 w-16 rounded-full bg-[#161B22] border-2 border-accent/60 flex items-center justify-center text-accent font-bold text-lg">
              {info.username.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold font-space-grotesk text-text-primary truncate tracking-tight">
            {info.name}
          </h3>
          <p className="text-xs text-accent font-semibold truncate">
            @{info.username}
          </p>
          <p className="text-[10px] text-text-secondary truncate mt-0.5">
            📍 {info.location}
          </p>
        </div>
      </div>

      {/* Developer Archetype Banner */}
      <div className="relative z-10 my-2 p-3 rounded-xl border border-border/60 bg-[#161B22]/60 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/15 border border-accent/30 text-accent">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider block">ARCHETYPE</span>
            <span className="text-xs font-extrabold text-white font-space-grotesk">{info.archetype}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider block">SCORE</span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-lg font-extrabold font-space-grotesk text-[#3FB950]">
              {info.score}
            </span>
            <span className="text-[10px] text-text-secondary font-bold">({info.grade})</span>
          </div>
        </div>
      </div>

      {/* Role & DNA Pill */}
      <div className="relative z-10 mb-4 px-3 py-2 rounded-lg border border-purple-500/20 bg-purple-500/5 flex items-center justify-between text-[10px]">
        <span className="text-purple-300 font-semibold truncate pr-2">👑 {info.role}</span>
        <span className="text-accent font-mono font-bold shrink-0">🧬 {info.dna}</span>
      </div>

      {/* 6-Grid Stats Metrics */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 pt-2 pb-4 border-t border-border/40 text-center">
        <div className="p-2 rounded-lg bg-[#0D1117]/80 border border-border/50">
          <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
            <FolderGit2 size={11} className="text-accent" />
            <span className="text-[9px] uppercase font-bold">Repos</span>
          </div>
          <span className="text-xs font-bold font-space-grotesk text-text-primary">{info.repos}</span>
        </div>

        <div className="p-2 rounded-lg bg-[#0D1117]/80 border border-border/50">
          <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
            <Star size={11} className="text-amber-400" />
            <span className="text-[9px] uppercase font-bold">Stars</span>
          </div>
          <span className="text-xs font-bold font-space-grotesk text-text-primary">{info.stars.toLocaleString()}</span>
        </div>

        <div className="p-2 rounded-lg bg-[#0D1117]/80 border border-border/50">
          <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
            <Users size={11} className="text-purple-400" />
            <span className="text-[9px] uppercase font-bold">Network</span>
          </div>
          <span className="text-xs font-bold font-space-grotesk text-text-primary">{info.followers.toLocaleString()}</span>
        </div>

        <div className="p-2 rounded-lg bg-[#0D1117]/80 border border-border/50">
          <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
            <Code2 size={11} className="text-cyan-400" />
            <span className="text-[9px] uppercase font-bold">Stack</span>
          </div>
          <span className="text-[10px] font-bold font-space-grotesk text-text-primary truncate block">{info.topLanguage}</span>
        </div>

        <div className="p-2 rounded-lg bg-[#0D1117]/80 border border-border/50">
          <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
            <Zap size={11} className="text-[#3FB950]" />
            <span className="text-[9px] uppercase font-bold">Streak</span>
          </div>
          <span className="text-xs font-bold font-space-grotesk text-text-primary">{info.currentStreak}d</span>
        </div>

        <div className="p-2 rounded-lg bg-[#0D1117]/80 border border-border/50">
          <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
            <Flame size={11} className="text-orange-500" />
            <span className="text-[9px] uppercase font-bold">Best</span>
          </div>
          <span className="text-xs font-bold font-space-grotesk text-text-primary">{info.longestStreak}d</span>
        </div>
      </div>

      {/* Footer Identity Stamp */}
      <div className="relative z-10 pt-3 border-t border-border/40 flex items-center justify-between text-[9px] text-[#8B949E] font-mono">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3FB950] animate-pulse" />
          <span>DEVTRACK IDENTITY ID</span>
        </span>
        <span className="text-text-primary font-bold">#{info.idHash}</span>
      </div>
    </motion.div>
  );
}
