"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserDashboardData, GitHubRepository } from "@/types";
import { formatBytes } from "@/lib/utils";
import { Pin, Star, GitFork, AlertCircle, Heart, Eye } from "lucide-react";

interface RepositoriesTabProps {
  data: UserDashboardData;
  githubToken?: string;
}

function getRelativeTime(dateStr?: string): string {
  if (!dateStr) return "recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

export default function RepositoriesTab({ data, githubToken }: RepositoriesTabProps) {
  const { repositories, profile } = data;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  
  // Customization & Pinned states
  const [pinnedRepoIds, setPinnedRepoIds] = useState<number[]>([]);

  // Load pinned state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devtrack_pinned_repos");
      if (saved) {
        try {
          setPinnedRepoIds(JSON.parse(saved));
        } catch (e) {
          console.error("Failed parsing pinned repos", e);
        }
      }
    }
  }, []);

  // Helper to unique languages list
  const languagesList = ["All", ...Array.from(new Set(repositories.map(r => r.language).filter(Boolean))) as string[]];

  // Helper to compute individual repo quality score (0-100)
  const getQualityScore = (repo: GitHubRepository): number => {
    let base = 50;
    if (repo.description && repo.description.trim().length > 0) {
      base += Math.min(15, repo.description.trim().length * 0.1);
    }
    if (!repo.fork) base += 15;
    const starForkCount = (repo.stargazers_count || 0) + (repo.forks_count || 0);
    if (starForkCount > 0) base += Math.min(15, Math.log2(starForkCount + 1) * 3);
    const openIssues = repo.open_issues_count || 0;
    if (openIssues === 0) base += 10;
    else if (openIssues < 5) base += 5;
    return Math.min(100, Math.round(base));
  };

  const getScoreClassification = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-[#3FB950] border-[#238636]/30 bg-[#238636]/10", dot: "bg-[#3FB950]" };
    if (score >= 75) return { label: "Very Good", color: "text-[#58A6FF] border-[#1F6FEB]/30 bg-[#1F6FEB]/10", dot: "bg-[#58A6FF]" };
    if (score >= 60) return { label: "Good", color: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10", dot: "bg-[#D29922]" };
    return { label: "Fair", color: "text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10", dot: "bg-[#F85149]" };
  };

  const togglePin = (repoId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid expanding card when pinning
    const updated = pinnedRepoIds.includes(repoId)
      ? pinnedRepoIds.filter(id => id !== repoId)
      : [...pinnedRepoIds, repoId];
    
    setPinnedRepoIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_pinned_repos", JSON.stringify(updated));
    }
  };

  // Sort and filter repositories
  const sortedAndFilteredRepos = [...repositories]
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLanguage = selectedLanguage === "All" || repo.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      const aPinned = pinnedRepoIds.includes(a.id);
      const bPinned = pinnedRepoIds.includes(b.id);
      
      // Pin priority
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Default: sort by stargazers count desc, then date
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime();
    });

  // Health Panel Derivations
  const mostStarred = repositories.length > 0 ? 
    [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count)[0] : null;
  const mostActive = repositories.length > 0 ? 
    [...repositories].sort((a, b) => b.forks_count - a.forks_count)[0] : null;
  const largest = repositories.length > 0 ? 
    [...repositories].sort((a, b) => b.size - a.size)[0] : null;
  const fastestGrowing = repositories.length > 0 ? 
    [...repositories].sort((a, b) => new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime())[0] : null;

  return (
    <div className="space-y-6 font-mono">
      {/* Repository Health Overview Panel */}
      {repositories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mostStarred && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">Most Starred</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={mostStarred.name}>{mostStarred.name}</div>
              <div className="text-[10px] text-[#D29922] flex items-center gap-1">
                ⭐ {mostStarred.stargazers_count} Stars
              </div>
            </div>
          )}
          {mostActive && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">Most Active</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={mostActive.name}>{mostActive.name}</div>
              <div className="text-[10px] text-[#58A6FF] flex items-center gap-1">
                🍴 {mostActive.forks_count} Forks
              </div>
            </div>
          )}
          {largest && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">Largest Codebase</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={largest.name}>{largest.name}</div>
              <div className="text-[10px] text-[#8B949E]">
                {formatBytes((largest.size || 0) * 1024)}
              </div>
            </div>
          )}
          {fastestGrowing && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">Recently Active</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={fastestGrowing.name}>{fastestGrowing.name}</div>
              <div className="text-[10px] text-[#3FB950]">
                Updated {getRelativeTime(fastestGrowing.pushed_at || fastestGrowing.updated_at)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Card */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] placeholder:text-[#8B949E]/50 focus:border-[#58A6FF] focus:outline-none text-xs font-semibold"
          />
          <svg className="absolute left-3 top-3 h-3.5 w-3.5 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {languagesList.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLanguage === lang
                  ? "bg-[#1F6FEB] border-[#58A6FF] text-white"
                  : "bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories List */}
      {sortedAndFilteredRepos.length === 0 ? (
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-12 text-center text-[#8B949E] text-xs">
          No repositories found matching current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredRepos.map(repo => {
            const score = getQualityScore(repo);
            const classInfo = getScoreClassification(score);
            const updatedTime = getRelativeTime(repo.pushed_at || repo.updated_at);
            const isPinned = pinnedRepoIds.includes(repo.id);
            const owner = profile.login || "demo";

            return (
              <div
                key={repo.id}
                onClick={() => router.push(`/repository/${repo.name}?owner=${owner}`)}
                className="rounded-xl border transition-all p-5 flex flex-col justify-between group shadow-sm cursor-pointer bg-[#161B22]/30 border-[#30363D] hover:bg-[#161B22]/60 hover:border-[#58A6FF]/40"
              >
                <div className="w-full">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // Avoid navigation when clicking direct GitHub link
                          className="font-bold font-space-grotesk text-sm text-[#F0F6FC] hover:text-[#58A6FF] transition-colors truncate"
                        >
                          {repo.name}
                        </a>
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#30363D] bg-[#0D1117] text-[#8B949E]">
                          {repo.private ? "Private" : "Public"}
                        </span>
                        {repo.fork && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#30363D] bg-[#161B22] text-[#8B949E]">
                            Forked
                          </span>
                        )}
                        {isPinned && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 font-bold flex items-center gap-1">
                            <Pin size={8} className="fill-amber-400" />
                            Pinned
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-[#8B949E] mt-0.5">
                        Updated {updatedTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => togglePin(repo.id, e)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isPinned
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-amber-400 hover:border-amber-500/30"
                        }`}
                        title={isPinned ? "Unpin Repository" : "Pin Repository to Top"}
                      >
                        <Pin size={11} className={isPinned ? "fill-amber-400" : ""} />
                      </button>

                      <div className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${classInfo.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${classInfo.dot}`} />
                        <span>QA {score}%</span>
                      </div>
                    </div>
                  </div>

                  {repo.description ? (
                    <p className="text-xs text-[#8B949E] leading-relaxed mt-2 line-clamp-2">
                      {repo.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8B949E]/40 italic leading-relaxed mt-2">
                      No description provided.
                    </p>
                  )}
                </div>

                {/* Footer Metrics & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#30363D]/40 mt-4 pt-4 text-[10px] text-[#8B949E]">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1 font-semibold text-[#F0F6FC]">
                        <span className="h-2 w-2 rounded-full bg-[#58A6FF]" />
                        {repo.language}
                      </span>
                    )}
                    <span>{formatBytes((repo.size || 0) * 1024)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Stars">
                      ⭐ {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1" title="Forks">
                      🍴 {repo.forks_count}
                    </span>
                    {repo.open_issues_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[#F85149]" title="Open Issues">
                        🔴 {repo.open_issues_count}
                      </span>
                    )}
                    <span className="text-[#58A6FF] group-hover:text-white transition-colors flex items-center gap-0.5 text-[10px] font-bold">
                      Inspect Intelligence →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
