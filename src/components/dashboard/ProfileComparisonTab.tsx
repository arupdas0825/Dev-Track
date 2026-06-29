"use client";

import { useState } from "react";
import { UserDashboardData } from "@/types";
import { fetchGitHubDashboardData } from "@/lib/github";
import { Users, Search, Award, Flame, Star, FolderGit2, Sparkles } from "lucide-react";

interface ProfileComparisonTabProps {
  currentUserData: UserDashboardData;
}

export default function ProfileComparisonTab({ currentUserData }: ProfileComparisonTabProps) {
  const [compareUsername, setCompareUsername] = useState("");
  const [targetData, setTargetData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareUsername.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGitHubDashboardData(compareUsername.trim());
      if (result) {
        setTargetData(result);
      } else {
        setError("Could not find GitHub user data.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load comparison profile.");
    } finally {
      setLoading(false);
    }
  };

  const user1 = currentUserData;
  const user2 = targetData;

  const getContribCount = (d: UserDashboardData) =>
    d.contributions.totalCommits + d.contributions.totalPRs + d.contributions.totalIssues;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-xl border border-border bg-[#161B22]/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-accent" />
          <h2 className="text-base font-bold font-space-grotesk text-text-primary">
            Developer Benchmarking & Profile Comparison
          </h2>
        </div>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          Compare developer metrics, activity streaks, and language mastery side-by-side with any GitHub engineer.
        </p>

        <form onSubmit={handleSearchCompare} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Enter GitHub username (e.g. torvalds)..."
              value={compareUsername}
              onChange={(e) => setCompareUsername(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-accent text-xs font-bold text-white hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? "Searching..." : "Compare"}
          </button>
        </form>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-accent/40 bg-[#161B22]/90 p-6 shadow-md relative">
          <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/20 text-accent">
            Active Profile
          </div>
          <div className="flex items-center gap-4 border-b border-border pb-4 mb-4">
            <img
              src={user1.profile.avatar_url}
              alt={user1.profile.login}
              className="h-14 w-14 rounded-full border border-border object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-text-primary font-space-grotesk">
                {user1.profile.name || user1.profile.login}
              </h3>
              <p className="text-xs text-text-secondary font-mono">@{user1.profile.login}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
              <span className="text-text-secondary flex items-center gap-2"><Award size={14} className="text-blue-400" /> Developer Grade</span>
              <span className="font-bold text-text-primary font-mono text-sm">{user1.score.grade} ({user1.score.overall}/100)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
              <span className="text-text-secondary flex items-center gap-2"><Flame size={14} className="text-orange-400" /> Current Streak</span>
              <span className="font-bold text-text-primary font-mono">{user1.contributions.currentStreak} Days</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
              <span className="text-text-secondary flex items-center gap-2"><Sparkles size={14} className="text-emerald-400" /> Total Contributions</span>
              <span className="font-bold text-text-primary font-mono">{getContribCount(user1)}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
              <span className="text-text-secondary flex items-center gap-2"><Star size={14} className="text-amber-400" /> Total Stars</span>
              <span className="font-bold text-text-primary font-mono">{user1.contributions.totalStarsEarned}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
              <span className="text-text-secondary flex items-center gap-2"><FolderGit2 size={14} className="text-purple-400" /> Repositories</span>
              <span className="font-bold text-text-primary font-mono">{user1.profile.public_repos}</span>
            </div>
          </div>
        </div>

        {user2 ? (
          <div className="rounded-xl border border-border bg-[#161B22]/90 p-6 shadow-md relative animate-fadeIn">
            <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-secondary text-text-secondary">
              Comparison Target
            </div>
            <div className="flex items-center gap-4 border-b border-border pb-4 mb-4">
              <img
                src={user2.profile.avatar_url}
                alt={user2.profile.login}
                className="h-14 w-14 rounded-full border border-border object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-text-primary font-space-grotesk">
                  {user2.profile.name || user2.profile.login}
                </h3>
                <p className="text-xs text-text-secondary font-mono">@{user2.profile.login}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
                <span className="text-text-secondary flex items-center gap-2"><Award size={14} className="text-blue-400" /> Developer Grade</span>
                <span className="font-bold text-text-primary font-mono text-sm">{user2.score.grade} ({user2.score.overall}/100)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
                <span className="text-text-secondary flex items-center gap-2"><Flame size={14} className="text-orange-400" /> Current Streak</span>
                <span className="font-bold text-text-primary font-mono">{user2.contributions.currentStreak} Days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
                <span className="text-text-secondary flex items-center gap-2"><Sparkles size={14} className="text-emerald-400" /> Total Contributions</span>
                <span className="font-bold text-text-primary font-mono">{getContribCount(user2)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
                <span className="text-text-secondary flex items-center gap-2"><Star size={14} className="text-amber-400" /> Total Stars</span>
                <span className="font-bold text-text-primary font-mono">{user2.contributions.totalStarsEarned}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border">
                <span className="text-text-secondary flex items-center gap-2"><FolderGit2 size={14} className="text-purple-400" /> Repositories</span>
                <span className="font-bold text-text-primary font-mono">{user2.profile.public_repos}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface/10 p-8 flex flex-col items-center justify-center text-center">
            <Users className="h-10 w-10 text-text-secondary/40 mb-3" />
            <h4 className="text-sm font-bold text-text-primary font-space-grotesk">Select a Developer to Compare</h4>
            <p className="text-xs text-text-secondary max-w-xs mt-1 leading-relaxed">
              Search any public GitHub username above to compare scores, repositories, and contribution velocity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
