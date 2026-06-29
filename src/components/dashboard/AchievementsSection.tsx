"use client";

import { useState } from "react";
import { UserDashboardData } from "@/types";
import { Trophy, CheckCircle, Lock, Sparkles } from "lucide-react";

interface AchievementsSectionProps {
  data: UserDashboardData;
}

interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  rarity: "Legendary" | "Epic" | "Rare" | "Common";
  current: number;
  target: number;
  unlocked: boolean;
  unlockedDate?: string;
}

export default function AchievementsSection({ data }: AchievementsSectionProps) {
  const { contributions, repositories } = data;
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  const totalContribs = contributions.totalCommits + contributions.totalPRs + contributions.totalIssues;

  const achievements: Achievement[] = [
    {
      id: "streak",
      title: "30 Day Streak",
      icon: "🔥",
      description: "Maintain a continuous contribution streak for 30 days.",
      rarity: "Epic",
      current: contributions.currentStreak,
      target: 30,
      unlocked: contributions.currentStreak >= 30,
      unlockedDate: contributions.currentStreak >= 30 ? "Unlocked May 2026" : undefined,
    },
    {
      id: "stars",
      title: "100 Stars Earned",
      icon: "⭐",
      description: "Accumulate at least 100 total stars across all your public repositories.",
      rarity: "Legendary",
      current: contributions.totalStarsEarned,
      target: 100,
      unlocked: contributions.totalStarsEarned >= 100,
      unlockedDate: contributions.totalStarsEarned >= 100 ? "Unlocked Apr 2026" : undefined,
    },
    {
      id: "open_source",
      title: "Open Source Contributor",
      icon: "🚀",
      description: "Contribute pull requests to open source repositories.",
      rarity: "Epic",
      current: Math.min(contributions.totalPRs, 10),
      target: 10,
      unlocked: contributions.totalPRs >= 1,
      unlockedDate: "Unlocked Mar 2026",
    },
    {
      id: "contribs",
      title: "1000 Contributions",
      icon: "💯",
      description: "Reach 1,000 total commits, pull requests, and code reviews on GitHub.",
      rarity: "Legendary",
      current: totalContribs,
      target: 1000,
      unlocked: totalContribs >= 1000,
      unlockedDate: totalContribs >= 1000 ? "Unlocked Jun 2026" : undefined,
    },
    {
      id: "docs",
      title: "Documentation Master",
      icon: "📚",
      description: "Maintain comprehensive documentation across public projects.",
      rarity: "Rare",
      current: repositories.length,
      target: 5,
      unlocked: true,
      unlockedDate: "Unlocked Feb 2026",
    },
    {
      id: "consistency",
      title: "Consistency Champion",
      icon: "🧠",
      description: "Demonstrate steady commit frequency across all 4 quarters of the year.",
      rarity: "Common",
      current: 4,
      target: 4,
      unlocked: true,
      unlockedDate: "Unlocked Jan 2026",
    },
  ];

  const getRarityBadge = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "Legendary":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Epic":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Rare":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "Common":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
            Developer Achievements
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold text-text-secondary">
          {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((item) => {
          const progressPct = Math.min(Math.round((item.current / item.target) * 100), 100);
          return (
            <div
              key={item.id}
              onClick={() => setSelectedBadge(item)}
              className={`relative rounded-xl border p-4 transition-all cursor-pointer group ${
                item.unlocked
                  ? "bg-surface/40 border-border hover:border-accent/50 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-surface/10 border-border/40 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl p-2 rounded-lg bg-surface border border-border group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${getRarityBadge(
                    item.rarity
                  )}`}
                >
                  {item.rarity}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-text-primary truncate">
                    {item.title}
                  </h4>
                  {item.unlocked && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary mb-1">
                  <span>{item.unlocked ? "Completed" : "Progress"}</span>
                  <span>
                    {item.current} / {item.target} ({progressPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.unlocked ? "bg-emerald-400" : "bg-accent"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-xl border border-border bg-[#161B22] p-6 text-center shadow-2xl space-y-4">
            <div className="text-5xl mx-auto p-4 rounded-2xl bg-surface border border-border w-20 h-20 flex items-center justify-center shadow-inner">
              {selectedBadge.icon}
            </div>
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getRarityBadge(selectedBadge.rarity)}`}>
                {selectedBadge.rarity} Badge
              </span>
              <h3 className="text-base font-bold font-space-grotesk text-text-primary mt-2">
                {selectedBadge.title}
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-surface/50 border border-border text-xs text-text-secondary font-mono">
              {selectedBadge.unlocked ? (
                <div className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Sparkles size={14} />
                  <span>{selectedBadge.unlockedDate || "Unlocked!"}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 text-text-secondary">
                  <Lock size={14} />
                  <span>Requires {selectedBadge.target - selectedBadge.current} more actions</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full rounded-lg bg-accent py-2 text-xs font-bold text-white hover:bg-accent/90 transition-colors"
            >
              Close Badge Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
