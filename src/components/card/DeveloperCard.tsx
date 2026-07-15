"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserDashboardData } from "@/types";
import { Shield } from "lucide-react";
import CountUp from "@/components/ui/CountUp";

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
    (data.languages && data.languages.length > 0 ? data.languages[0].name : "JavaScript");
    
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

interface DeveloperCardProps {
  data: UserDashboardData;
  className?: string;
  animate?: boolean;
}

export default function DeveloperCard({ data, className = "", animate = true }: DeveloperCardProps) {
  const info = getDeveloperCardInfo(data);

  // Parse Join Date & Location
  const joinDate = data.profile?.created_at
    ? new Date(data.profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jul 2018";
  const locationText = data.profile?.location || "Global Ecosystem";

  // Dynamic Skill Chips (max 3)
  const getSkillChips = (): string[] => {
    const chips: string[] = [];
    const langs = data.languages || [];
    const topLangLower = info.topLanguage.toLowerCase();
    
    const hasAI = langs.some(l => ["python", "jupyter notebook", "r"].includes(l.name.toLowerCase())) ||
      (data.aiInsights?.suggestedTechnologies || []).some(t => t.toLowerCase().includes("ai") || t.toLowerCase().includes("ml"));
    if (hasAI) chips.push("AI Ready");

    const hasOS = (data.contributions?.totalPRs || 0) >= 5 || (data.contributions?.longestStreak || 0) >= 14 || (data.contributions?.totalIssues || 0) >= 5;
    if (hasOS) chips.push("Open Source");

    if (["typescript", "javascript", "html", "css", "vue", "react"].includes(topLangLower)) {
      if (langs.length >= 3 && langs.some(l => ["python", "go", "rust", "c++", "java", "ruby", "php"].includes(l.name.toLowerCase()))) {
        chips.push("Full Stack");
      } else {
        chips.push("Frontend");
      }
    } else if (["rust", "go", "c", "c++", "java", "python", "ruby", "php", "c#"].includes(topLangLower)) {
      chips.push("Backend");
    } else {
      chips.push("Full Stack");
    }

    const unique = Array.from(new Set(chips));
    if (unique.length < 2 && !unique.includes("Full Stack")) unique.push("Full Stack");
    return unique.slice(0, 3);
  };
  const skillChips = getSkillChips();

  // Role and Ranking calculation
  const primaryRole = (info.role || "Software Engineer").split("/")[0].trim();
  const rankingText = info.score >= 95 ? "Top 1%" : info.score >= 90 ? "Top 5%" : info.score >= 85 ? "Top 9%" : info.score >= 80 ? "Top 15%" : info.score >= 70 ? "Top 25%" : "Top 35%";

  // Repository Health Percentages (3 Bars)
  const consistencyPercent = Math.min(100, Math.round(((data.score?.categories?.consistency?.score || 16) / 20) * 100));
  const repoQualityPercent = Math.min(100, Math.round(((data.score?.categories?.repoQuality?.score || 16) / 20) * 100));
  const openSourcePercent = Math.min(100, Math.round(((data.score?.categories?.openSource?.score || 10) / 15) * 100));

  // Top Language & Collapsed Languages
  const topLangObj = data.languages?.[0];
  const topLangName = topLangObj?.name || info.topLanguage || "JavaScript";
  const topLangPercent = topLangObj ? Math.round(topLangObj.percentage) : 100;
  const topLangColor = topLangObj?.color || "#58a6ff";
  const otherLangsCount = data.languages && data.languages.length > 1 ? data.languages.length - 1 : 0;

  // GitHub Snapshot Metrics
  const totalCommits = data.contributions?.totalCommits || data.wrapped?.totalCommits || 0;

  // Footer date calculation
  const lastUpdated = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.9 } : {}}
      animate={animate ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full max-w-[340px] sm:max-w-[360px] rounded-[24px] border border-blue-500/25 bg-[#10141B]/90 p-4 sm:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.65),0_0_50px_rgba(59,130,246,0.12)] backdrop-blur-2xl font-mono text-text-primary overflow-hidden group ${className}`}
    >
      {/* Gloss highlight sweeping once across the card over 900ms */}
      {animate && (
        <motion.div
          initial={{ left: "-120%" }}
          animate={{ left: "120%" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 w-3/5 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none z-30"
        />
      )}

      {/* Soft ambient glows */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* 1. Header: Verified Developer Snapshot */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.08] text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="font-semibold uppercase tracking-wider text-emerald-400">Verified Developer Snapshot</span>
        </div>
      </div>

      {/* 2. Top Section: Profile, Name, Username, Verified Badge, Location & Join Date */}
      <div className="relative z-10 pt-3 pb-2.5 flex items-center gap-3.5">
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-b from-blue-500/40 to-transparent blur-sm opacity-70" />
          {info.avatarUrl ? (
            <motion.img
              initial={animate ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              src={info.avatarUrl}
              alt={info.username}
              className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border border-white/15 shadow-xl bg-[#151921]"
            />
          ) : (
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-[#151921] border border-white/15 flex items-center justify-center text-blue-400 font-bold text-lg shadow-xl">
              {info.username.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base sm:text-lg font-bold font-space-grotesk text-white tracking-tight truncate">
              {info.name}
            </h3>
            <Shield size={14} className="text-blue-400 fill-blue-400/20 shrink-0" />
          </div>
          <p className="text-[11px] font-semibold text-blue-400 truncate mt-0.5 font-mono">
            @{info.username}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-text-secondary font-mono">
            <span className="truncate">📍 {locationText}</span>
            <span className="text-white/20">•</span>
            <span className="shrink-0">Joined {joinDate}</span>
          </div>
        </div>
      </div>

      {/* 3. Small Skill Chips (Max 3) */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-white/[0.08]">
        {skillChips.map((chip, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-white/[0.06] border border-white/10 text-white shadow-sm"
          >
            {chip}
          </span>
        ))}
      </div>

      {/* 4. Center Section: Grade, Score, Ranking & Role */}
      <div className="relative z-10 py-2.5 flex items-center justify-between border-b border-white/[0.08]">
        <div>
          <span className="text-[9px] uppercase font-mono tracking-widest text-text-secondary block mb-0.5">
            Primary Role
          </span>
          <span className="text-sm sm:text-base font-bold font-space-grotesk text-white block truncate max-w-[160px]">
            {primaryRole}
          </span>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-wider">
            {rankingText}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-right shrink-0">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-text-secondary block mb-0.5">
              Grade
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-space-grotesk text-[#3FB950] tracking-tight leading-none">
              {info.grade}
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-text-secondary block mb-0.5">
              Score
            </span>
            <div className="text-lg sm:text-xl font-extrabold font-space-grotesk text-white leading-none">
              {animate ? <CountUp end={info.score} duration={900} /> : info.score}
              <span className="text-[11px] sm:text-xs font-normal text-text-secondary">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Repository Health (Exactly 3 Bars: Consistency, Repo Quality, Open Source Impact) */}
      <div className="relative z-10 py-2.5 space-y-2 border-b border-white/[0.08] font-mono">
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-text-secondary">Consistency</span>
            <span className="font-bold text-white">
              {animate ? <CountUp end={consistencyPercent} duration={900} suffix="%" /> : `${consistencyPercent}%`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={animate ? { width: "0%" } : { width: `${consistencyPercent}%` }}
              animate={{ width: `${consistencyPercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-text-secondary">Repository Quality</span>
            <span className="font-bold text-white">
              {animate ? <CountUp end={repoQualityPercent} duration={900} suffix="%" /> : `${repoQualityPercent}%`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={animate ? { width: "0%" } : { width: `${repoQualityPercent}%` }}
              animate={{ width: `${repoQualityPercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full bg-purple-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-text-secondary">Open Source Impact</span>
            <span className="font-bold text-white">
              {animate ? <CountUp end={openSourcePercent} duration={900} suffix="%" /> : `${openSourcePercent}%`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={animate ? { width: "0%" } : { width: `${openSourcePercent}%` }}
              animate={{ width: `${openSourcePercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 6. Top Language & Collapsed Languages */}
      <div className="relative z-10 py-2 flex items-center justify-between border-b border-white/[0.08] font-mono text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: topLangColor }} />
          <span className="font-bold text-white truncate">{topLangName}</span>
          <span className="text-text-secondary font-medium shrink-0">
            {animate ? <CountUp end={topLangPercent} duration={900} suffix="%" /> : `${topLangPercent}%`}
          </span>
        </div>
        {otherLangsCount > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-text-secondary text-[10px] font-medium shrink-0 ml-2">
            +{otherLangsCount} Languages
          </span>
        )}
      </div>

      {/* 7. GitHub Snapshot (Compact Grid: Repos, Stars, Network, Commits, Streak) */}
      <div className="relative z-10 py-2.5 grid grid-cols-5 gap-1 text-center font-mono border-b border-white/[0.08]">
        <div className="py-0.5 min-w-0">
          <span className="text-[8px] uppercase font-bold tracking-wider text-text-secondary block truncate">REPOS</span>
          <span className="text-xs sm:text-sm font-bold text-white font-space-grotesk mt-0.5 block truncate">
            {animate ? <CountUp end={info.repos} duration={900} /> : info.repos}
          </span>
        </div>
        <div className="py-0.5 border-l border-white/[0.08] min-w-0">
          <span className="text-[8px] uppercase font-bold tracking-wider text-text-secondary block truncate">STARS</span>
          <span className="text-xs sm:text-sm font-bold text-white font-space-grotesk mt-0.5 block truncate">
            {animate ? <CountUp end={info.stars} duration={900} /> : info.stars.toLocaleString()}
          </span>
        </div>
        <div className="py-0.5 border-l border-white/[0.08] min-w-0">
          <span className="text-[8px] uppercase font-bold tracking-wider text-text-secondary block truncate">NETWORK</span>
          <span className="text-xs sm:text-sm font-bold text-white font-space-grotesk mt-0.5 block truncate">
            {animate ? <CountUp end={info.followers} duration={900} /> : info.followers.toLocaleString()}
          </span>
        </div>
        <div className="py-0.5 border-l border-white/[0.08] min-w-0">
          <span className="text-[8px] uppercase font-bold tracking-wider text-text-secondary block truncate">COMMITS</span>
          <span className="text-xs sm:text-sm font-bold text-white font-space-grotesk mt-0.5 block truncate">
            {animate ? <CountUp end={totalCommits} duration={900} /> : totalCommits.toLocaleString()}
          </span>
        </div>
        <div className="py-0.5 border-l border-white/[0.08] min-w-0">
          <span className="text-[8px] uppercase font-bold tracking-wider text-text-secondary block truncate">STREAK</span>
          <span className="text-xs sm:text-sm font-bold text-white font-space-grotesk mt-0.5 block truncate">
            {animate ? <CountUp end={info.currentStreak} duration={900} suffix="d" /> : `${info.currentStreak}d`}
          </span>
        </div>
      </div>

      {/* 8. Footer: Powered by DevTrack, Developer ID, Last Updated */}
      <div className="relative z-10 pt-2 flex items-center justify-between text-[8px] sm:text-[9px] text-text-secondary font-mono tracking-tight gap-1">
        <span className="truncate">Powered by DevTrack</span>
        <span className="text-white font-bold shrink-0">ID: #{info.idHash}</span>
        <span className="shrink-0">Updated {lastUpdated}</span>
      </div>
    </motion.div>
  );
}
