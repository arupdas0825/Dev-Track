"use client";

import { useState } from "react";
import { UserDashboardData, GitHubRepository } from "@/types";
import { formatBytes } from "@/lib/utils";

interface RepositoriesTabProps {
  data: UserDashboardData;
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

export default function RepositoriesTab({ data }: RepositoriesTabProps) {
  const { repositories } = data;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [activeModalRepo, setActiveModalRepo] = useState<GitHubRepository | null>(null);

  // Get unique languages for filter
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

  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = selectedLanguage === "All" || repo.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
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
      {/* Repository Health Panel */}
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

      {/* Repositories Grid */}
      {filteredRepos.length === 0 ? (
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-12 text-center text-[#8B949E] text-xs">
          No repositories found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map(repo => {
            const score = getQualityScore(repo);
            const classInfo = getScoreClassification(score);
            const updatedTime = getRelativeTime(repo.pushed_at || repo.updated_at);

            return (
              <div
                key={repo.id}
                className="rounded-xl border border-[#30363D] bg-[#161B22]/30 hover:bg-[#161B22]/60 hover:border-[#58A6FF]/50 transition-all p-5 flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
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
                      </div>
                      <div className="text-[9px] text-[#8B949E] mt-0.5">
                        Updated {updatedTime}
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${classInfo.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${classInfo.dot}`} />
                      <span>QA {score}%</span>
                    </div>
                  </div>

                  {repo.description ? (
                    <p className="text-xs text-[#8B949E] leading-relaxed line-clamp-2 min-h-[32px]">
                      {repo.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#8B949E]/40 italic leading-relaxed min-h-[32px]">
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
                    <button
                      onClick={() => setActiveModalRepo(repo)}
                      className="px-2 py-0.5 rounded border border-[#30363D] bg-[#0D1117] text-[#58A6FF] hover:border-[#58A6FF] transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Inspection Modal */}
      {activeModalRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#161B22] border border-[#30363D] rounded-xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-[#58A6FF] uppercase font-bold tracking-wider">Repository Inspection</span>
                <h3 className="text-lg font-bold text-[#F0F6FC] mt-1">{activeModalRepo.name}</h3>
                <a
                  href={activeModalRepo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#58A6FF] hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>View on GitHub</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <button
                onClick={() => setActiveModalRepo(null)}
                className="text-[#8B949E] hover:text-[#F0F6FC] p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#8B949E] leading-relaxed">
              {activeModalRepo.description || "No description provided for this codebase."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] uppercase block">Primary Stack</span>
                <span className="font-bold text-[#F0F6FC] mt-0.5 block">{activeModalRepo.language || "Markdown"}</span>
              </div>
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] uppercase block">Codebase Size</span>
                <span className="font-bold text-[#F0F6FC] mt-0.5 block">{formatBytes((activeModalRepo.size || 0) * 1024)}</span>
              </div>
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] uppercase block">Stargazers</span>
                <span className="font-bold text-[#D29922] mt-0.5 block">⭐ {activeModalRepo.stargazers_count}</span>
              </div>
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] uppercase block">Forks</span>
                <span className="font-bold text-[#58A6FF] mt-0.5 block">🍴 {activeModalRepo.forks_count}</span>
              </div>
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] uppercase block">Open Issues</span>
                <span className="font-bold text-[#F85149] mt-0.5 block">🔴 {activeModalRepo.open_issues_count || 0}</span>
              </div>
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D]">
                <span className="text-[10px] text-[#8B949E] uppercase block">Last Updated</span>
                <span className="font-bold text-[#3FB950] mt-0.5 block">{getRelativeTime(activeModalRepo.pushed_at || activeModalRepo.updated_at)}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setActiveModalRepo(null)}
                className="px-4 py-2 bg-[#1F6FEB] text-white rounded-lg text-xs font-bold hover:bg-[#1F6FEB]/90 cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
