"use client";

import { useState, useEffect } from "react";
import { GitHubRepository } from "@/types";
import { useTheme } from "@/components/ui/ThemeContext";
import { Palette, RefreshCw, Clock, ArrowRight } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: GitHubRepository[];
  onSelectTab: (tab: string) => void;
  onSelectRepo: (repoName: string) => void;
  onRefreshData?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  repositories,
  onSelectTab,
  onSelectRepo,
  onRefreshData,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { openModal } = useTheme();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("devtrack_recent_searches");
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 4);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_recent_searches", JSON.stringify(updated));
    }
  };

  const tabs = [
    { id: "overview", label: "Overview Tab", icon: "📊", action: () => onSelectTab("overview") },
    { id: "repos", label: "Repositories Tab", icon: "📦", action: () => onSelectTab("repos") },
    { id: "contrib", label: "Contributions Tab", icon: "⚡", action: () => onSelectTab("contrib") },
    { id: "lang", label: "Language Ecosystem", icon: "🌐", action: () => onSelectTab("lang") },
    { id: "score", label: "Developer Score Engine", icon: "🎯", action: () => onSelectTab("score") },
    { id: "ai", label: "AI Insights & Roadmap", icon: "🤖", action: () => onSelectTab("ai") },
    { id: "compare", label: "Developer Comparison Tool", icon: "👥", action: () => onSelectTab("compare") },
    { id: "wrapped", label: "GitHub Wrapped", icon: "🎁", action: () => onSelectTab("wrapped") },
    { id: "settings", label: "Settings", icon: "⚙️", action: () => onSelectTab("settings") },
    { id: "team-overview", label: "Team Workspace: Overview", icon: "👥", action: () => onSelectTab("team-overview") },
    { id: "team-members", label: "Team Workspace: Members Directory", icon: "👤", action: () => onSelectTab("team-members") },
    { id: "team-analytics", label: "Team Workspace: Organization Analytics", icon: "📈", action: () => onSelectTab("team-analytics") },
    { id: "team-repos", label: "Team Workspace: Repositories", icon: "📂", action: () => onSelectTab("team-repos") },
    { id: "team-leaderboard", label: "Team Workspace: Leaderboard", icon: "🏆", action: () => onSelectTab("team-leaderboard") },
    { id: "team-sprint", label: "Team Workspace: Sprint Dashboard", icon: "🏃‍♂️", action: () => onSelectTab("team-sprint") },
    { id: "team-activity", label: "Team Workspace: Live Activity Feed", icon: "⚡", action: () => onSelectTab("team-activity") },
    { id: "team-reports", label: "Team Workspace: Reports", icon: "📄", action: () => onSelectTab("team-reports") },
    { id: "team-settings", label: "Team Workspace: Settings", icon: "⚙️", action: () => onSelectTab("team-settings") },
  ];

  const quickActions = [
    {
      id: "action_theme",
      label: "Switch Theme Settings",
      icon: "🎨",
      action: () => {
        openModal();
      },
    },
    {
      id: "action_refresh",
      label: "Refresh GitHub Data Sync",
      icon: "🔄",
      action: () => {
        if (onRefreshData) onRefreshData();
      },
    },
  ];

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRepos = repositories.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(query.toLowerCase()))
  );

  const allFlatItems = [
    ...filteredActions.map((a) => ({ type: "action", ...a })),
    ...filteredTabs.map((t) => ({ type: "tab", ...t })),
    ...filteredRepos.slice(0, 6).map((r) => ({
      type: "repo",
      id: r.id.toString(),
      label: r.name,
      icon: "📁",
      action: () => onSelectRepo(r.name),
    })),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (!isOpen || allFlatItems.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allFlatItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allFlatItems.length) % allFlatItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = allFlatItems[selectedIndex];
        if (item) {
          if (query) addRecentSearch(query);
          item.action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, allFlatItems, selectedIndex, query]);

  if (!isOpen) return null;

  let currentGlobalIndex = 0;

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
            placeholder="Search repositories, tabs, actions (Arrow keys to navigate, Enter to run)..."
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
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} /> Recent Searches
              </div>
              <div className="flex flex-wrap gap-1.5 px-3 py-1">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="px-2 py-1 rounded bg-surface border border-border text-[11px] text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* System Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
                System & Quick Actions
              </div>
              <div className="space-y-1">
                {filteredActions.map((act) => {
                  const isSelected = currentGlobalIndex === selectedIndex;
                  const indexToUse = currentGlobalIndex++;
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        if (query) addRecentSearch(query);
                        act.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(indexToUse)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#1C2128] text-[#58A6FF] border border-[#58A6FF]/40"
                          : "text-[#F0F6FC] hover:bg-[#1C2128] hover:text-[#58A6FF]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{act.icon}</span>
                        <span className="font-bold">{act.label}</span>
                      </span>
                      <span className="text-[10px] text-[#8B949E]">Run Command</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          {filteredTabs.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
                Dashboard Tabs
              </div>
              <div className="space-y-1">
                {filteredTabs.map((t) => {
                  const isSelected = currentGlobalIndex === selectedIndex;
                  const indexToUse = currentGlobalIndex++;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (query) addRecentSearch(query);
                        t.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(indexToUse)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#1C2128] text-[#58A6FF] border border-[#58A6FF]/40"
                          : "text-[#F0F6FC] hover:bg-[#1C2128] hover:text-[#58A6FF]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </span>
                      <span className="text-[10px] text-[#8B949E]">Jump to tab</span>
                    </button>
                  );
                })}
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
                {filteredRepos.slice(0, 6).map((repo) => {
                  const isSelected = currentGlobalIndex === selectedIndex;
                  const indexToUse = currentGlobalIndex++;
                  return (
                    <button
                      key={repo.id}
                      onClick={() => {
                        if (query) addRecentSearch(query);
                        onSelectRepo(repo.name);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(indexToUse)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left group ${
                        isSelected
                          ? "bg-[#1C2128] text-[#58A6FF] border border-[#58A6FF]/40"
                          : "text-[#F0F6FC] hover:bg-[#1C2128] hover:text-[#58A6FF]"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold truncate">{repo.name}</div>
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
                  );
                })}
              </div>
            </div>
          )}

          {/* Zero Results */}
          {allFlatItems.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8B949E]">
              No repositories, actions or tabs matching &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#30363D] bg-[#0D1117] flex justify-between items-center text-[10px] text-[#8B949E]">
          <span>Tip: Use ↑ ↓ arrows to select, Enter to confirm</span>
          <span>Global Raycast Search</span>
        </div>
      </div>
    </div>
  );
}
