"use client";

import { useState, useEffect } from "react";
import { GitHubRepository } from "@/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: GitHubRepository[];
  onSelectTab: (tab: string) => void;
  onSelectRepo: (repoUrl: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  repositories,
  onSelectTab,
  onSelectRepo,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery("");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: "overview", label: "Overview Tab", icon: "📊" },
    { id: "repos", label: "Repositories Tab", icon: "📦" },
    { id: "contrib", label: "Contributions Tab", icon: "⚡" },
    { id: "lang", label: "Language Ecosystem", icon: "🌐" },
    { id: "score", label: "Developer Index & Score", icon: "🎯" },
    { id: "ai", label: "AI Insights & Roadmap", icon: "🤖" },
    { id: "wrapped", label: "GitHub Wrapped", icon: "🎁" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRepos = repositories.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4 animate-fadeIn font-mono">
      <div
        className="w-full max-w-xl bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#30363D] flex items-center gap-3 bg-[#0D1117]">
          <svg className="h-5 w-5 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories, tabs, or metrics (Press Esc to exit)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none text-sm font-semibold"
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-[#161B22] border border-[#30363D] rounded text-[#8B949E]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-4 max-h-[60vh] scrollbar-thin">
          {/* Navigation Tabs */}
          {filteredTabs.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
                Dashboard Tabs
              </div>
              <div className="space-y-1">
                {filteredTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTab(t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#F0F6FC] hover:bg-[#1C2128] hover:text-[#58A6FF] transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                    <span className="text-[10px] text-[#8B949E]">Jump to tab</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Repositories */}
          {filteredRepos.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
                Public Repositories ({filteredRepos.length})
              </div>
              <div className="space-y-1">
                {filteredRepos.slice(0, 8).map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      onSelectRepo(repo.html_url);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#F0F6FC] hover:bg-[#1C2128] hover:text-[#58A6FF] transition-colors cursor-pointer text-left group"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-[#F0F6FC] group-hover:text-[#58A6FF] truncate">
                        {repo.name}
                      </div>
                      {repo.description && (
                        <div className="text-[10px] text-[#8B949E] truncate">
                          {repo.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-[#8B949E]">
                      {repo.language && (
                        <span className="px-1.5 py-0.5 bg-[#0D1117] rounded border border-[#30363D]">
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stargazers_count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zero Results */}
          {filteredTabs.length === 0 && filteredRepos.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8B949E]">
              No repositories or tabs matching &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#30363D] bg-[#0D1117] flex justify-between items-center text-[10px] text-[#8B949E]">
          <span>Tip: Use Ctrl + K to toggle anytime</span>
          <span>DevTrack Instant Search</span>
        </div>
      </div>
    </div>
  );
}
