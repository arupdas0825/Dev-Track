"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DevTrackUser, subscribeToAuthChanges, logOutUser, syncUserAndReposInFirestore } from "@/lib/firebase";
import { UserDashboardData } from "@/types";
import Navbar from "../layout/Navbar";
import OverviewTab from "./OverviewTab";
import RepositoriesTab from "./RepositoriesTab";
import ContributionsTab from "./ContributionsTab";
import CodingCalendarTab from "./CodingCalendarTab";
import RepositoryHealthTab from "./RepositoryHealthTab";
import GrowthTimelineTab from "./GrowthTimelineTab";
import LanguagesTab from "./LanguagesTab";
import ScoreTab from "./ScoreTab";
import AIInsightsTab from "./AIInsightsTab";
import ProfileComparisonTab from "./ProfileComparisonTab";
import SettingsTab from "./SettingsTab";
import WrappedTab from "./WrappedTab";
import TimeMachineTab from "./TimeMachineTab";
import DeveloperDnaTab from "./DeveloperDnaTab";
import DashboardHeader from "./DashboardHeader";
import QuickActionsFAB from "./QuickActionsFAB";
import CommandPalette from "./CommandPalette";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import ExportCenterModal from "./ExportCenterModal";
import { useGithubProfile } from "@/hooks/useGithubProfile";
import { useRepositories } from "@/hooks/useRepositories";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Folder,
  Calendar,
  Activity,
  Award,
  Code,
  Star,
  Sparkles,
  Users,
  Gift,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  History,
  Dna
} from "lucide-react";

type TabId =
  | "overview"
  | "repos"
  | "dna"
  | "contrib"
  | "calendar"
  | "health"
  | "growth"
  | "time-machine"
  | "lang"
  | "score"
  | "ai"
  | "compare"
  | "wrapped"
  | "settings";

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [syncedData, setSyncedData] = useState<UserDashboardData | null>(null);
  const [githubToken, setGithubToken] = useState("");

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sidebar customizations
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const usernameParam = searchParams.get("user") || "";

  // Subscribe to Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load stored token & sidebar preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("devtrack_github_token") || "";
      setGithubToken(storedToken);

      const sidebarPref = localStorage.getItem("devtrack_sidebar_collapsed");
      if (sidebarPref) {
        setIsSidebarCollapsed(sidebarPref === "true");
      }
    }
  }, []);

  // Determine target username
  let targetUser = usernameParam.trim();
  if (!targetUser) {
    if (currentUser) {
      targetUser = currentUser.username;
    } else {
      targetUser = "demo";
    }
  }

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

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onSelectTab: (tabId) => setActiveTab(tabId as TabId),
    onOpenShortcutsHelp: () => setIsShortcutsModalOpen(true),
    onCloseDialogs: () => {
      setIsCommandPaletteOpen(false);
      setIsShortcutsModalOpen(false);
      setIsExportModalOpen(false);
    },
  });

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

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_sidebar_collapsed", String(nextState));
    }
  };

  const tabsList = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "dna", label: "Developer DNA", icon: Dna },
    { id: "repos", label: "Repositories", icon: Folder },
    { id: "calendar", label: "Coding Calendar", icon: Calendar },
    { id: "health", label: "Repo Health", icon: Activity },
    { id: "growth", label: "Growth Timeline", icon: Award },
    { id: "time-machine", label: "Developer Time Machine", icon: History },
    { id: "lang", label: "Languages", icon: Code },
    { id: "score", label: "Developer Score", icon: Star },
    { id: "ai", label: "AI Insights", icon: Sparkles },
    { id: "compare", label: "Compare Profile", icon: Users },
    { id: "wrapped", label: "Wrapped", icon: Gift },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  // Keyboard navigation listener (Arrow keys to switch tabs)
  useEffect(() => {
    const handleArrowNavigation = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const currentIdx = tabsList.findIndex(t => t.id === activeTab);
        const nextIdx = (currentIdx + 1) % tabsList.length;
        setActiveTab(tabsList[nextIdx].id as TabId);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIdx = tabsList.findIndex(t => t.id === activeTab);
        const prevIdx = (currentIdx - 1 + tabsList.length) % tabsList.length;
        setActiveTab(tabsList[prevIdx].id as TabId);
      }
    };

    window.addEventListener("keydown", handleArrowNavigation);
    return () => window.removeEventListener("keydown", handleArrowNavigation);
  }, [activeTab]);

  const renderActiveTabContent = () => {
    if (!dashboardData) return null;

    switch (activeTab) {
      case "overview":
        return <OverviewTab data={dashboardData} />;
      case "dna":
        return <DeveloperDnaTab data={dashboardData} githubToken={githubToken} />;
      case "repos":
        return <RepositoriesTab data={dashboardData} githubToken={githubToken} />;
      case "calendar":
        return <CodingCalendarTab data={dashboardData} />;
      case "health":
        return <RepositoryHealthTab data={dashboardData} />;
      case "growth":
        return <GrowthTimelineTab data={dashboardData} />;
      case "time-machine":
        return <TimeMachineTab data={dashboardData} githubToken={githubToken} />;
      case "contrib":
        return <ContributionsTab data={dashboardData} />;
      case "lang":
        return <LanguagesTab data={dashboardData} />;
      case "score":
        return <ScoreTab data={dashboardData} />;
      case "ai":
        return <AIInsightsTab data={dashboardData} />;
      case "compare":
        return <ProfileComparisonTab currentUserData={dashboardData} />;
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
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} onOpenSearch={() => setIsCommandPaletteOpen(true)} />
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
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} onOpenSearch={() => setIsCommandPaletteOpen(true)} />
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

  return (
    <div className="flex min-h-screen flex-col bg-background relative selection:bg-accent/30">
      <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} onOpenSearch={() => setIsCommandPaletteOpen(true)} />

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Collapsible Sidebar Nav */}
        <aside className={`flex-shrink-0 transition-all duration-300 md:block hidden ${isSidebarCollapsed ? "w-16" : "w-64"}`}>
          <div className="mb-4">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-[#161B22]/50 hover:bg-[#161B22] text-xs text-text-secondary cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-text-secondary flex-shrink-0" />
                {!isSidebarCollapsed && <span>Search dashboard...</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="font-mono text-[9px] border border-border px-1.5 py-0.5 rounded bg-surface">Ctrl K</span>
              )}
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 border-border relative select-none">
            {tabsList.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all focus:outline-none w-full relative group cursor-pointer ${
                    isActive
                      ? "text-text-primary bg-surface-secondary border border-border"
                      : "border border-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50"
                  }`}
                  title={isSidebarCollapsed ? tab.label : undefined}
                >
                  <Icon size={16} className={`flex-shrink-0 ${isActive ? "text-accent" : "text-text-secondary group-hover:text-text-primary"}`} />
                  
                  {!isSidebarCollapsed && (
                    <span className="transition-all duration-200">{tab.label}</span>
                  )}

                  {/* Collapsed Tooltip helper */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#161B22] border border-border text-[10px] text-text-primary font-bold rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50">
                      {tab.label}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Collapse toggle button */}
            <button
              onClick={toggleSidebar}
              className="mt-4 flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold border border-border bg-[#161B22]/30 text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-all focus:outline-none w-full cursor-pointer"
            >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : (
                <>
                  <ChevronLeft size={14} />
                  <span>Collapse Navigation</span>
                </>
              )}
            </button>
          </nav>
        </aside>

        {/* Mobile Horizontal scrollbar nav */}
        <aside className="md:hidden flex-shrink-0 border-b border-border pb-3">
          <nav className="flex flex-row overflow-x-auto gap-1.5 scrollbar-none pb-1">
            {tabsList.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all focus:outline-none ${
                    isActive
                      ? "bg-surface-secondary border border-border text-text-primary"
                      : "border border-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-accent" : "text-text-secondary"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Content window */}
        <div className="flex-1 min-w-0">
          {dashboardData && <DashboardHeader data={dashboardData} />}
          <div className="border border-border bg-surface/20 rounded-xl p-6 transition-all duration-300">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderActiveTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Quick Actions FAB */}
      {dashboardData && (
        <QuickActionsFAB
          githubUsername={dashboardData.profile.login}
          onSelectTab={(t) => setActiveTab(t as TabId)}
          onRefreshData={() => setSyncedData(null)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        />
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        repositories={dashboardData?.repositories || []}
        onSelectTab={(t) => setActiveTab(t as TabId)}
        onSelectRepo={(name) => {
          const owner = dashboardData?.profile.login || "demo";
          router.push(`/repository/${name}?owner=${owner}`);
        }}
        onRefreshData={() => setSyncedData(null)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Export Center Modal */}
      <ExportCenterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={dashboardData}
      />
    </div>
  );
}
