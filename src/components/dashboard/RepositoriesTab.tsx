"use client";

import { useState } from "react";
import { UserDashboardData, GitHubRepository } from "@/types";
import { formatBytes } from "@/lib/utils";

interface RepositoriesTabProps {
  data: UserDashboardData;
}

export default function RepositoriesTab({ data }: RepositoriesTabProps) {
  const { repositories } = data;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // Get unique languages for filter
  const languagesList = ["All", ...Array.from(new Set(repositories.map(r => r.language).filter(Boolean))) as string[]];

  // Helper to compute individual repo quality score (0-100)
  const getQualityScore = (repo: GitHubRepository): number => {
    let base = 50;
    
    // Description weight (15 pts)
    if (repo.description && repo.description.trim().length > 0) {
      base += Math.min(15, repo.description.trim().length * 0.1);
    }
    
    // Original vs Fork weight (15 pts)
    if (!repo.fork) {
      base += 15;
    }
    
    // Community Interest weight (15 pts)
    const starForkCount = (repo.stargazers_count || 0) + (repo.forks_count || 0);
    if (starForkCount > 0) {
      base += Math.min(15, Math.log2(starForkCount + 1) * 3);
    }

    // Issues hygiene weight (10 pts)
    const openIssues = repo.open_issues_count || 0;
    if (openIssues === 0) {
      base += 10;
    } else if (openIssues < 5) {
      base += 5;
    }
    
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
    <div className="space-y-6">
      
      {/* Repository Health Panel */}
      {repositories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Most Starred */}
          {mostStarred && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-mono font-bold text-[#8B949E] uppercase tracking-wider block">Most Starred</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={mostStarred.name}>{mostStarred.name}</div>
              <div className="text-[10px] font-mono text-[#D29922] flex items-center gap-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{mostStarred.stargazers_count} Stars</span>
              </div>
            </div>
          )}

          {/* Most Active (Forks) */}
          {mostActive && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-mono font-bold text-[#8B949E] uppercase tracking-wider block">Most Active</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={mostActive.name}>{mostActive.name}</div>
              <div className="text-[10px] font-mono text-[#58A6FF] flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4" />
                </svg>
                <span>{mostActive.forks_count} Forks</span>
              </div>
            </div>
          )}

          {/* Largest */}
          {largest && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-mono font-bold text-[#8B949E] uppercase tracking-wider block">Largest Codebase</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={largest.name}>{largest.name}</div>
              <div className="text-[10px] font-mono text-[#8B949E]">
                <span>{formatBytes((largest.size || 0) * 1024)}</span>
              </div>
            </div>
          )}

          {/* Fastest Growing (Most Recently Pushed) */}
          {fastestGrowing && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 space-y-1">
              <span className="text-[9px] font-mono font-bold text-[#8B949E] uppercase tracking-wider block">Recently Active</span>
              <div className="text-xs font-bold text-[#F0F6FC] truncate" title={fastestGrowing.name}>{fastestGrowing.name}</div>
              <div className="text-[10px] font-mono text-[#3FB950]">
                <span>{new Date(fastestGrowing.pushed_at || fastestGrowing.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Card */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] placeholder:text-[#8B949E]/50 focus:border-[#58A6FF] focus:outline-none text-xs font-semibold"
          />
          <svg className="absolute left-3 top-3.5 h-3.5 w-3.5 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Language Filters */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {languagesList.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
                selectedLanguage === lang
                  ? "bg-[#1F6FEB] border-[#58A6FF] text-[#F0F6FC]"
                  : "bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1C2128]"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories Display List */}
      {filteredRepos.length === 0 ? (
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-12 text-center text-[#8B949E] text-xs">
          No repositories found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map(repo => {
            const score = getQualityScore(repo);
            const classInfo = getScoreClassification(score);
            return (
              <div
                key={repo.id}
                className="rounded-xl border border-[#30363D] bg-[#161B22]/20 hover:bg-[#161B22]/40 hover:border-[#30363D]/80 transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold font-space-grotesk text-sm text-[#F0F6FC] hover:text-[#58A6FF] transition-colors flex items-center gap-1.5"
                    >
                      <span className="truncate max-w-[180px] sm:max-w-xs">{repo.name}</span>
                      <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 text-[#8B949E] transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>

                    <div className={`flex items-center gap-1.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${classInfo.color}`} title="Computed Repository Quality Index">
                      <span className={`h-1.5 w-1.5 rounded-full ${classInfo.dot}`} />
                      <span>QA {score}%</span>
                    </div>
                  </div>

                  {repo.fork && (
                    <span className="inline-flex text-[8px] font-mono font-bold text-[#8B949E] bg-[#161B22] border border-[#30363D] px-1.5 py-0.5 rounded">
                      Forked
                    </span>
                  )}

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

                {/* Foot Indicators */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#30363D]/40 mt-4 pt-4 text-[10px] text-[#8B949E] font-mono">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1 font-semibold text-[#F0F6FC]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#58A6FF" }} />
                        {repo.language}
                      </span>
                    )}
                    <span>{formatBytes((repo.size || 0) * 1024)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Stars">
                      <svg className="h-3.5 w-3.5 text-[#D29922]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1" title="Forks">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4" />
                      </svg>
                      {repo.forks_count}
                    </span>
                    {repo.open_issues_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[#F85149]" title="Open Issues">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F85149] animate-pulse mr-0.5" />
                        {repo.open_issues_count}
                      </span>
                    )}
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
