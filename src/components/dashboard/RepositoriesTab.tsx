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

  // Helper to compute individual repo quality score on the fly if not set
  const getQualityScore = (repo: GitHubRepository): number => {
    if (repo.qualityScore) return repo.qualityScore;
    
    let base = 60;
    if (repo.description && repo.description.trim().length > 0) base += 15;
    if (!repo.fork) base += 15;
    if (repo.stargazers_count > 100) base += 10;
    else if (repo.stargazers_count > 10) base += 7;
    else if (repo.stargazers_count > 0) base += 4;
    
    if (repo.open_issues_count === 0) base += 10;
    else if (repo.open_issues_count < 5) base += 5;
    
    // Cap at 100
    return Math.min(100, base);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-success border-success/30 bg-success/5";
    if (score >= 75) return "text-accent border-accent/30 bg-accent/5";
    if (score >= 50) return "text-warning border-warning/30 bg-warning/5";
    return "text-danger border-danger/30 bg-danger/5";
  };

  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLanguage = selectedLanguage === "All" || repo.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="rounded-xl border border-border bg-surface p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none text-xs font-semibold"
          />
          <svg className="absolute left-3 top-3.5 h-3.5 w-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Language Quick-select scroll */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {languagesList.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all focus:outline-none ${
                selectedLanguage === lang
                  ? "bg-accent border-accent text-white"
                  : "bg-surface-secondary border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repositories Display Table/List */}
      {filteredRepos.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-secondary text-sm">
          No repositories found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map(repo => {
            const score = getQualityScore(repo);
            const scoreColor = getScoreColor(score);
            return (
              <div
                key={repo.id}
                className="rounded-xl border border-border bg-surface hover:border-border/80 transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold font-space-grotesk text-sm text-text-primary hover:text-accent transition-colors flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-xs">{repo.name}</span>
                      <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>

                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${scoreColor}`} title="Computed Repository Quality Index">
                      Quality: {score}%
                    </div>
                  </div>

                  {repo.fork && (
                    <span className="inline-flex text-[9px] font-semibold text-text-secondary bg-surface-secondary border border-border px-1.5 py-0.25 rounded">
                      Forked
                    </span>
                  )}

                  {repo.description ? (
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 min-h-[32px]">
                      {repo.description}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary/40 italic leading-relaxed min-h-[32px]">
                      No description provided.
                    </p>
                  )}
                </div>

                {/* Foot Indicators */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 mt-4 pt-4 text-[10px] text-text-secondary font-mono">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1 font-semibold text-text-primary">
                        <span className="h-2 w-2 rounded-full bg-accent" style={{ backgroundColor: "#2F81F7" }} />
                        {repo.language}
                      </span>
                    )}
                    <span>{formatBytes((repo.size || 0) * 1024)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Stargazers">
                      <svg className="h-3.5 w-3.5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1" title="Forks">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      {repo.forks_count}
                    </span>
                    {repo.open_issues_count > 0 && (
                      <span className="flex items-center gap-0.5 text-danger" title="Open Issues">
                        <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse mr-0.5" />
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
