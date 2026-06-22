"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchGitHubDashboardData } from "@/lib/github";
import { saveDeveloperMetrics, getSavedDeveloperMetrics, subscribeToAuthChanges, logOutUser, DevTrackUser, syncUserAndReposInFirestore, getUserFromFirestore } from "@/lib/firebase";
import { UserDashboardData } from "@/types";
import Navbar from "../layout/Navbar";
import OverviewTab from "./OverviewTab";
import RepositoriesTab from "./RepositoriesTab";
import ContributionsTab from "./ContributionsTab";
import LanguagesTab from "./LanguagesTab";
import ScoreTab from "./ScoreTab";
import AIInsightsTab from "./AIInsightsTab";
import WrappedTab from "./WrappedTab";
import SettingsTab from "./SettingsTab";
import { useTheme } from "@/components/ui/ThemeContext";
import { useGithubProfile } from "@/hooks/useGithubProfile";
import { useRepositories } from "@/hooks/useRepositories";
import { useAnalytics } from "@/hooks/useAnalytics";

type TabId = "overview" | "repos" | "contrib" | "lang" | "score" | "ai" | "wrapped" | "settings";

export default function DashboardContent() {
  const { interfaceSettings, layoutDensity } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [syncedData, setSyncedData] = useState<UserDashboardData | null>(null);
  const [githubToken, setGithubToken] = useState("");

  const usernameParam = searchParams.get("user") || "";

  // 1. Subscribe to Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load stored token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("devtrack_github_token") || "";
      setGithubToken(storedToken);
    }
  }, []);

  // Determine actual username to load
  let targetUser = usernameParam.trim();
  if (!targetUser) {
    if (currentUser) {
      targetUser = currentUser.username;
    } else {
      // Fallback to demo profile if not logged in and no query param
      targetUser = "demo";
    }
  }

  // Reset synced data when user changes
  useEffect(() => {
    setSyncedData(null);
  }, [targetUser]);

  // Load from hooks
  const { profile, loading: profileLoading, error: profileError } = useGithubProfile(targetUser, githubToken);
  const { repositories, loading: reposLoading, error: reposError } = useRepositories(targetUser, githubToken);
  const { languages, contributions, score, aiInsights, wrapped, loading: analyticsLoading, error: analyticsError } = useAnalytics(targetUser, githubToken);

  // Background Sync logic
  useEffect(() => {
    let isMounted = true;
    if (!targetUser || targetUser.toLowerCase() === "demo" || targetUser.toLowerCase() === "devtrack-demo") return;
    
    if (currentUser && currentUser.username.toLowerCase() === targetUser.toLowerCase()) {
      const runSync = async () => {
        try {
          const freshData = await syncUserAndReposInFirestore(currentUser.uid, targetUser, githubToken);
          if (isMounted) {
            setSyncedData(freshData);
          }
        } catch (e) {
          console.error("Background sync failed:", e);
        }
      };
      runSync();
    }
    return () => { isMounted = false; };
  }, [targetUser, currentUser, githubToken]);

  // Derive final dashboardData
  const dashboardData: UserDashboardData | null = syncedData || (
    profile && contributions && score && aiInsights && wrapped ? {
      profile,
      repositories,
      languages,
      contributions,
      score,
      aiInsights,
      wrapped
    } : null
  );

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState("");

  // 3. Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        setCommandSearchQuery("");
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isLoading = !dashboardData && (profileLoading || reposLoading || analyticsLoading);
  const error = !dashboardData ? (profileError || reposError || analyticsError) : null;

  const handleLogout = async () => {
    await logOutUser();
    setCurrentUser(null);
    router.push("/");
  };

  const handleTokenUpdate = (newToken: string) => {
    setGithubToken(newToken);
  };

  const handleLoginSuccess = (user: DevTrackUser) => {
    setCurrentUser(user);
    router.push(`/dashboard?user=${user.username}`);
  };

  const renderActiveTabContent = () => {
    if (!dashboardData) return null;

    switch (activeTab) {
      case "overview":
        return <OverviewTab data={dashboardData} />;
      case "repos":
        return <RepositoriesTab data={dashboardData} />;
      case "contrib":
        return <ContributionsTab data={dashboardData} />;
      case "lang":
        return <LanguagesTab data={dashboardData} />;
      case "score":
        return <ScoreTab data={dashboardData} />;
      case "ai":
        return <AIInsightsTab data={dashboardData} />;
      case "wrapped":
        return <WrappedTab data={dashboardData} />;
      case "settings":
        return <SettingsTab data={dashboardData} onTokenUpdate={handleTokenUpdate} />;
      default:
        return <OverviewTab data={dashboardData} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-secondary">
          <svg className="animate-spin h-10 w-10 text-accent mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide font-mono">Running Codebase Indexer...</span>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="h-12 w-12 rounded-lg bg-danger/10 text-danger flex items-center justify-center mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold font-space-grotesk text-text-primary">Analysis Failed</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent/90 transition-colors"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  // Tab definitions for Sidebar/Header
  const tabsList: { id: TabId; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "repos", label: "Repositories", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { id: "contrib", label: "Contributions", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { id: "lang", label: "Languages", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
    { id: "score", label: "Developer Score", icon: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" },
    { id: "ai", label: "AI Insights", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    { id: "wrapped", label: "Wrapped", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  // Filtering for Command Palette
  const filteredCommands = tabsList.filter(tab => 
    tab.label.toLowerCase().includes(commandSearchQuery.toLowerCase())
  );

  const filteredRepos = dashboardData?.repositories ? 
    dashboardData.repositories.filter(repo => 
      repo.name.toLowerCase().includes(commandSearchQuery.toLowerCase())
    ).slice(0, 5) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />

      <div className={`flex-1 mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row transition-all duration-300 ${
        layoutDensity === "compact" ? "max-w-6xl gap-4" : layoutDensity === "wide" ? "max-w-[95%] gap-8" : "max-w-7xl gap-8"
      }`}>
        {/* Sidebar Nav */}
        <aside className={`flex-shrink-0 transition-all duration-300 ${interfaceSettings.compactSidebar ? "md:w-48" : "md:w-64"}`}>
          {/* Ctrl+K Trigger Search Bar */}
          <div className="mb-4 hidden md:block">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-[#161B22]/50 hover:bg-[#161B22] text-xs text-text-secondary cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search dashboard...</span>
              </div>
              <span className="font-mono text-[9px] border border-border px-1.5 py-0.5 rounded bg-surface">Ctrl K</span>
            </button>
          </div>

          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 border-b md:border-b-0 border-border pb-3 md:pb-0 scrollbar-none">
            {tabsList.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all focus:outline-none ${
                  activeTab === tab.id
                    ? "bg-surface-secondary border border-border text-text-primary"
                    : "border border-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab Content window */}
        <div className="flex-1 min-w-0">
          <div className={`border border-border bg-surface/20 rounded-xl transition-all duration-300 ${
            interfaceSettings.compactCards ? "p-4" : "p-6"
          }`}>
            {renderActiveTabContent()}
          </div>
        </div>
      </div>

      {/* Raycast-style Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-[#161B22] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <svg className="h-4.5 w-4.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="Search tabs, repositories, or commands..."
                value={commandSearchQuery}
                onChange={(e) => setCommandSearchQuery(e.target.value)}
                className="w-full py-4 text-sm bg-transparent border-0 outline-none text-text-primary placeholder:text-text-secondary"
              />
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin space-y-3">
              {/* Navigation Commands */}
              <div>
                <div className="px-2 pb-1 text-[10px] font-bold text-text-secondary tracking-wider uppercase font-mono">Navigation</div>
                {filteredCommands.length > 0 ? (
                  <div className="space-y-0.5">
                    {filteredCommands.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-all text-left"
                      >
                        <span className="flex items-center gap-3">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                          </svg>
                          {tab.label}
                        </span>
                        <span className="font-mono text-[9px] text-text-secondary opacity-60">Go to tab</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-xs text-text-secondary italic">No matching tabs</div>
                )}
              </div>

              {/* Repository Searches */}
              {dashboardData?.repositories && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold text-text-secondary tracking-wider uppercase font-mono">Repositories</div>
                  {filteredRepos.length > 0 ? (
                    <div className="space-y-0.5">
                      {filteredRepos.map(repo => (
                        <a
                          key={repo.name}
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsCommandPaletteOpen(false)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-all text-left"
                        >
                          <span className="flex items-center gap-3 font-mono truncate">
                            <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span className="truncate">{repo.name}</span>
                          </span>
                          <span className="font-mono text-[9px] text-accent flex-shrink-0">Open on GitHub</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-xs text-text-secondary italic">No matching repositories</div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-[#0D1117] border-t border-border flex items-center justify-between text-[10px] text-text-secondary font-mono">
              <span>Use <kbd className="border border-border px-1 rounded bg-surface">Esc</kbd> to close</span>
              <span>Command Palette v2</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
