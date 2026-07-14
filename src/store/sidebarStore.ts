"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabId =
  | "overview"
  | "hiring-overview"
  | "hiring-ats"
  | "hiring-resume-analyzer"
  | "hiring-resume-match"
  | "hiring-job-match"
  | "hiring-skills-gap"
  | "hiring-recruiter"
  | "hiring-interview"
  | "hiring-roadmap"
  | "hiring-applications"
  | "workspace"
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
  | "settings"
  | "career-dashboard"
  | "career-resume-builder"
  | "career-ats-analyzer"
  | "career-portfolio-analyzer"
  | "career-job-match"
  | "career-cover-letter"
  | "career-linkedin"
  | "career-skill-gap"
  | "career-interview-prep"
  | "career-roadmap"
  | "career-versions"
  | "career-tracker"
  | "career-assistant"
  | "team-overview"
  | "team-members"
  | "team-analytics"
  | "team-repos"
  | "team-leaderboard"
  | "team-sprint"
  | "team-activity"
  | "team-reports"
  | "team-settings"
  | "ai-scanner"
  | "ai-code-review"
  | "ai-security"
  | "ai-docs"
  | "ai-dependencies"
  | "ai-architecture"
  | "ai-performance"
  | "ai-practices"
  | "ai-suggestions"
  | "ai-reports"
  | "live-feed"
  | "live-notifications"
  | "live-repos"
  | "live-prs"
  | "live-issues"
  | "live-releases"
  | "live-social"
  | "live-timeline"
  | "live-sync"
  | "challenges-dashboard"
  | "challenges-daily"
  | "challenges-weekly"
  | "challenges-monthly"
  | "challenges-achievements"
  | "challenges-xp"
  | "challenges-leaderboards"
  | "challenges-missions"
  | "challenges-rewards"
  | "challenges-history"
  | "community-feed"
  | "community-developers"
  | "community-discussions"
  | "community-showcase"
  | "community-opensource"
  | "community-events"
  | "community-studygroups"
  | "community-clubs"
  | "community-jobs"
  | "community-notifications"
  | "community-messaging"
  | "community-search"
  | "enterprise-dashboard"
  | "enterprise-organizations"
  | "enterprise-members"
  | "enterprise-teams"
  | "enterprise-admin"
  | "enterprise-api-keys"
  | "enterprise-usage"
  | "enterprise-billing"
  | "enterprise-audit"
  | "enterprise-security"
  | "enterprise-integrations";

interface SidebarState {
  isSidebarCollapsed: boolean;
  activeTab: TabId;
  activeAdvancedCategory: string | null;
  visitCount: number;
  pinnedTabs: string[];
  recentTabs: string[];
  activeWorkspace: string;
  isWorkspaceMenuOpen: boolean;
  
  // Actions
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tabId: TabId) => void;
  toggleAdvancedCategory: (categoryName: string) => void;
  setAdvancedCategory: (categoryName: string | null) => void;
  incrementVisitCount: () => void;
  togglePinTab: (tabId: string) => void;
  setActiveWorkspace: (workspace: string) => void;
  setWorkspaceMenuOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      activeTab: "overview",
      activeAdvancedCategory: null,
      visitCount: 0,
      pinnedTabs: [],
      recentTabs: ["overview"],
      activeWorkspace: "Personal Workspace",
      isWorkspaceMenuOpen: false,

      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),

      setActiveTab: (tabId) =>
        set((state) => {
          const filtered = state.recentTabs.filter((t) => t !== tabId);
          const updatedRecent = [tabId, ...filtered].slice(0, 5);
          return {
            activeTab: tabId,
            recentTabs: updatedRecent,
          };
        }),

      toggleAdvancedCategory: (categoryName) =>
        set((state) => ({
          activeAdvancedCategory:
            state.activeAdvancedCategory === categoryName ? null : categoryName,
        })),

      setAdvancedCategory: (categoryName) =>
        set({ activeAdvancedCategory: categoryName }),

      incrementVisitCount: () =>
        set((state) => ({ visitCount: state.visitCount + 1 })),

      togglePinTab: (tabId) =>
        set((state) => ({
          pinnedTabs: state.pinnedTabs.includes(tabId)
            ? state.pinnedTabs.filter((t) => t !== tabId)
            : [...state.pinnedTabs, tabId],
        })),

      setActiveWorkspace: (workspace) =>
        set({ activeWorkspace: workspace }),

      setWorkspaceMenuOpen: (open) =>
        set({ isWorkspaceMenuOpen: open }),
    }),
    {
      name: "devtrack_sidebar_store",
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        activeTab: state.activeTab,
        activeAdvancedCategory: state.activeAdvancedCategory,
        visitCount: state.visitCount,
        pinnedTabs: state.pinnedTabs,
        recentTabs: state.recentTabs,
        activeWorkspace: state.activeWorkspace,
      }),
    }
  )
);
