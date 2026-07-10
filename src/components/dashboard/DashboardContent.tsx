"use client";

import { useState, useEffect, useMemo } from "react";
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
import DeveloperWorkspaceTab from "./DeveloperWorkspaceTab";
import DeveloperCareerHub from "./DeveloperCareerHub";
import DeveloperChallengesHub from "./DeveloperChallengesHub";
import DeveloperCommunityHub from "./DeveloperCommunityHub";

import TeamWorkspaceTab from "./TeamWorkspaceTab";
import AiCodeReviewTab from "./AiCodeReviewTab";
import LiveActivityTab from "./LiveActivityTab";
import QuickActionsFAB from "./QuickActionsFAB";
import HiringDashboard from "./HiringDashboard";
import Logo from "../ui/Logo";
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
  Dna,
  Layers,
  Briefcase,
  FileText,
  Globe,
  TrendingUp,
  HelpCircle,
  Compass,
  GitPullRequest,
  CheckCircle,
  Shield,
  ChevronDown,
  Plus,
  Bell,
  Clock,
  Tag,
  RefreshCw,
  MessageSquare,
  ClipboardList
} from "lucide-react";

type TabId =
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
  | "community-search";



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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [newNoteTrigger, setNewNoteTrigger] = useState<(() => void) | null>(null);

  // Premium sidebar redesign states
  const [sidebarWidth, setSidebarWidth] = useState<number>(240);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [pinnedTabs, setPinnedTabs] = useState<string[]>([]);
  const [recentTabs, setRecentTabs] = useState<string[]>(["overview"]);
  const [activeWorkspace, setActiveWorkspace] = useState<string>("Personal Workspace");
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState<boolean>(false);

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

      const storedWidth = localStorage.getItem("devtrack_sidebar_width");
      if (storedWidth) {
        setSidebarWidth(Number(storedWidth));
      }
      
      const storedPinned = localStorage.getItem("devtrack_pinned_tabs");
      if (storedPinned) {
        try {
          setPinnedTabs(JSON.parse(storedPinned));
        } catch (e) {}
      }

      const storedRecent = localStorage.getItem("devtrack_recent_tabs");
      if (storedRecent) {
        try {
          setRecentTabs(JSON.parse(storedRecent));
        } catch (e) {}
      }
    }
  }, []);

  // Update recent pages list
  useEffect(() => {
    if (activeTab) {
      setRecentTabs(prev => {
        const filtered = prev.filter(t => t !== activeTab);
        const updated = [activeTab, ...filtered].slice(0, 5);
        if (typeof window !== "undefined") {
          localStorage.setItem("devtrack_recent_tabs", JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [activeTab]);

  // Sidebar drag resizer logic
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX - 16;
      if (newWidth >= 160 && newWidth <= 340) {
        setSidebarWidth(newWidth);
        if (typeof window !== "undefined") {
          localStorage.setItem("devtrack_sidebar_width", String(newWidth));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Pin / Unpin tab toggle
  const togglePinTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedTabs(prev => {
      const updated = prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId];
      if (typeof window !== "undefined") {
        localStorage.setItem("devtrack_pinned_tabs", JSON.stringify(updated));
      }
      return updated;
    });
  };

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
    onSelectTab: (tabId) => {
      setActiveTab(tabId as TabId);
      if (tabId !== "workspace") setIsFocusMode(false);
    },
    onOpenShortcutsHelp: () => setIsShortcutsModalOpen(true),
    onCloseDialogs: () => {
      setIsCommandPaletteOpen(false);
      setIsShortcutsModalOpen(false);
      setIsExportModalOpen(false);
      setIsFocusMode(false);
    },
    onNewNote: () => {
      setActiveTab("workspace");
      setIsFocusMode(false);
      setTimeout(() => {
        if (newNoteTrigger) newNoteTrigger();
      }, 50);
    },
    onRepoSearch: () => {
      setActiveTab("workspace");
      setIsCommandPaletteOpen(true);
    }
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

  const coreTabsList = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "workspace", label: "Workspace", icon: Layers },
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

  const hiringTabsList = [
    { id: "hiring-overview", label: "Overview", icon: LayoutGrid },
    { id: "hiring-ats", label: "ATS Score", icon: CheckCircle },
    { id: "hiring-resume-analyzer", label: "Resume Analyzer", icon: FileText },
    { id: "hiring-resume-match", label: "Resume Match", icon: Layers },
    { id: "hiring-job-match", label: "Job Match", icon: Star },
    { id: "hiring-skills-gap", label: "Skills Gap", icon: TrendingUp },
    { id: "hiring-recruiter", label: "Recruiter View", icon: Users },
    { id: "hiring-interview", label: "Interview Readiness", icon: HelpCircle },
    { id: "hiring-roadmap", label: "Career Roadmap", icon: Compass },
    { id: "hiring-applications", label: "Applications", icon: ClipboardList },
  ] as const;

  const careerTabsList = [
    { id: "career-dashboard", label: "Career Dashboard", icon: Briefcase },
    { id: "career-resume-builder", label: "Resume Builder", icon: FileText },
    { id: "career-ats-analyzer", label: "ATS Resume Analyzer", icon: CheckCircle },
    { id: "career-portfolio-analyzer", label: "Portfolio Analyzer", icon: Globe },
    { id: "career-job-match", label: "Job Match", icon: Star },
    { id: "career-cover-letter", label: "Cover Letter Generator", icon: FileText },
    { id: "career-linkedin", label: "LinkedIn Optimizer", icon: Award },
    { id: "career-skill-gap", label: "Skill Gap Analysis", icon: TrendingUp },
    { id: "career-interview-prep", label: "Interview Preparation", icon: HelpCircle },
    { id: "career-roadmap", label: "Career Roadmap", icon: Compass },
    { id: "career-versions", label: "Resume Versions", icon: History },
    { id: "career-tracker", label: "Application Tracker", icon: ClipboardList },
    { id: "career-assistant", label: "AI Career Assistant", icon: MessageSquare },
  ] as const;

  const teamTabsList = [
    { id: "team-overview", label: "Team Overview", icon: LayoutGrid },
    { id: "team-members", label: "Members", icon: Users },
    { id: "team-analytics", label: "Organization Analytics", icon: TrendingUp },
    { id: "team-repos", label: "Repositories", icon: Folder },
    { id: "team-leaderboard", label: "Team Leaderboard", icon: Award },
    { id: "team-sprint", label: "Sprint Dashboard", icon: CheckCircle },
    { id: "team-activity", label: "Activity Feed", icon: History },
    { id: "team-reports", label: "Reports", icon: FileText },
    { id: "team-settings", label: "Settings", icon: Settings },
  ] as const;

  const aiReviewTabsList = [
    { id: "ai-scanner", label: "Repository Scanner", icon: Activity },
    { id: "ai-code-review", label: "Code Review", icon: Code },
    { id: "ai-security", label: "Security", icon: Shield },
    { id: "ai-docs", label: "Documentation", icon: FileText },
    { id: "ai-dependencies", label: "Dependencies", icon: Layers },
    { id: "ai-architecture", label: "Architecture", icon: Compass },
    { id: "ai-performance", label: "Performance", icon: TrendingUp },
    { id: "ai-practices", label: "Best Practices", icon: CheckCircle },
    { id: "ai-suggestions", label: "AI Suggestions", icon: Sparkles },
    { id: "ai-reports", label: "Reports", icon: FileText },
  ] as const;

  const liveActivityTabsList = [
    { id: "live-feed", label: "Activity Feed", icon: Activity },
    { id: "live-notifications", label: "Notifications", icon: Bell },
    { id: "live-repos", label: "Repository Events", icon: Folder },
    { id: "live-prs", label: "Pull Requests", icon: GitPullRequest },
    { id: "live-issues", label: "Issues", icon: HelpCircle },
    { id: "live-releases", label: "Releases", icon: Tag },
    { id: "live-social", label: "Stars & Followers", icon: Users },
    { id: "live-timeline", label: "Live Timeline", icon: Clock },
    { id: "live-sync", label: "Sync History", icon: RefreshCw },
  ] as const;

  const challengesTabsList = [
    { id: "challenges-dashboard", label: "Challenges Dashboard", icon: Award },
    { id: "challenges-daily", label: "Daily Challenges", icon: Clock },
    { id: "challenges-weekly", label: "Weekly Challenges", icon: Calendar },
    { id: "challenges-monthly", label: "Monthly Challenges", icon: Calendar },
    { id: "challenges-achievements", label: "Achievements", icon: Award },
    { id: "challenges-xp", label: "XP & Levels", icon: TrendingUp },
    { id: "challenges-leaderboards", label: "Leaderboards", icon: Users },
    { id: "challenges-missions", label: "Missions", icon: Compass },
    { id: "challenges-rewards", label: "Rewards", icon: Gift },
    { id: "challenges-history", label: "Challenge History", icon: History },
  ] as const;

  const communityTabsList = [
    { id: "community-feed", label: "Community Feed", icon: LayoutGrid },
    { id: "community-developers", label: "Developers Directory", icon: Users },
    { id: "community-discussions", label: "Forums", icon: MessageSquare },
    { id: "community-showcase", label: "Showcase", icon: Award },
    { id: "community-opensource", label: "Open Source Hub", icon: Folder },
    { id: "community-events", label: "Events", icon: Calendar },
    { id: "community-studygroups", label: "Study Groups", icon: Compass },
    { id: "community-clubs", label: "Clubs", icon: Globe },
    { id: "community-jobs", label: "Job Board", icon: Briefcase },
    { id: "community-notifications", label: "Inbox Notifications", icon: Bell },
    { id: "community-messaging", label: "Direct Messages", icon: MessageSquare },
    { id: "community-search", label: "Universal Search", icon: Search }
  ] as const;

  const tabsList = [...coreTabsList, ...hiringTabsList, ...careerTabsList, ...teamTabsList, ...aiReviewTabsList, ...liveActivityTabsList, ...challengesTabsList, ...communityTabsList];



  const sidebarSections = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutGrid,
      items: [
        { id: "overview", label: "Overview" },
      ]
    },
    {
      id: "hiring",
      label: "💼 Hiring Dashboard",
      icon: Briefcase,
      items: [
        { id: "hiring-overview", label: "Overview" },
        { id: "hiring-ats", label: "ATS Score" },
        { id: "hiring-resume-analyzer", label: "Resume Analyzer" },
        { id: "hiring-resume-match", label: "Resume Match" },
        { id: "hiring-job-match", label: "Job Match" },
        { id: "hiring-skills-gap", label: "Skills Gap" },
        { id: "hiring-recruiter", label: "Recruiter View" },
        { id: "hiring-interview", label: "Interview Readiness" },
        { id: "hiring-roadmap", label: "Career Roadmap" },
        { id: "hiring-applications", label: "Applications" },
      ]
    },
    {
      id: "developer",
      label: "Developer",
      icon: Dna,
      items: [
        { id: "workspace", label: "Workspace" },
        { id: "dna", label: "Developer DNA" },
        { id: "repos", label: "Repository Explorer" },
        { id: "calendar", label: "Coding Calendar" },
        { id: "health", label: "Repo Health" },
        { id: "growth", label: "Growth Timeline" },
        { id: "time-machine", label: "Time Machine" },
      ]
    },
    {
      id: "career",
      label: "AI Career Suite",
      icon: Briefcase,
      items: [
        { id: "career-dashboard", label: "Career Dashboard" },
        { id: "career-resume-builder", label: "Resume Builder" },
        { id: "career-ats-analyzer", label: "ATS Resume Analyzer" },
        { id: "career-portfolio-analyzer", label: "Portfolio Analyzer" },
        { id: "career-job-match", label: "Job Match" },
        { id: "career-cover-letter", label: "Cover Letter Generator" },
        { id: "career-linkedin", label: "LinkedIn Optimizer" },
        { id: "career-skill-gap", label: "Skill Gap Analysis" },
        { id: "career-interview-prep", label: "Interview Preparation" },
        { id: "career-roadmap", label: "Career Roadmap" },
        { id: "career-versions", label: "Resume Versions" },
        { id: "career-tracker", label: "Application Tracker" },
        { id: "career-assistant", label: "AI Career Assistant" },
      ]
    },
    {
      id: "challenges",
      label: "🏆 Developer Challenges",
      icon: Award,
      items: [
        { id: "challenges-dashboard", label: "Dashboard" },
        { id: "challenges-daily", label: "Daily Challenges" },
        { id: "challenges-weekly", label: "Weekly Challenges" },
        { id: "challenges-monthly", label: "Monthly Challenges" },
        { id: "challenges-achievements", label: "Achievements" },
        { id: "challenges-xp", label: "XP & Levels" },
        { id: "challenges-leaderboards", label: "Leaderboards" },
        { id: "challenges-missions", label: "Missions" },
        { id: "challenges-rewards", label: "Rewards" },
        { id: "challenges-history", label: "Challenge History" },
      ]
    },
    {
      id: "community",
      label: "👥 Community",
      icon: Users,
      items: [
        { id: "community-feed", label: "Feed" },
        { id: "community-developers", label: "Developers" },
        { id: "community-discussions", label: "Discussions" },
        { id: "community-showcase", label: "Showcase" },
        { id: "community-opensource", label: "Open Source" },
        { id: "community-events", label: "Events" },
        { id: "community-studygroups", label: "Study Groups" },
        { id: "community-clubs", label: "Clubs" },
        { id: "community-jobs", label: "Jobs" },
        { id: "community-notifications", label: "Notifications" },
        { id: "community-messaging", label: "Messaging" }
      ]
    },
    {
      id: "ai-review",


      label: "AI Review",
      icon: Sparkles,
      items: [
        { id: "ai-scanner", label: "Repository Scanner" },
        { id: "ai-code-review", label: "Code Review" },
        { id: "ai-security", label: "Security Audit" },
        { id: "ai-docs", label: "Documentation" },
        { id: "ai-dependencies", label: "Dependencies" },
        { id: "ai-architecture", label: "Architecture" },
        { id: "ai-performance", label: "Performance" },
        { id: "ai-practices", label: "Best Practices" },
        { id: "ai-suggestions", label: "AI Suggestions" },
        { id: "ai-reports", label: "Reports" },
      ]
    },
    {
      id: "live-activity",
      label: "Live Activity",
      icon: Activity,
      items: [
        { id: "live-feed", label: "Activity Feed" },
        { id: "live-notifications", label: "Notifications" },
        { id: "live-repos", label: "Repository Events" },
        { id: "live-prs", label: "Pull Requests" },
        { id: "live-issues", label: "Issues" },
        { id: "live-releases", label: "Releases" },
        { id: "live-social", label: "Stars & Followers" },
        { id: "live-timeline", label: "Live Timeline" },
        { id: "live-sync", label: "Sync History" },
      ]
    },
    {
      id: "team",
      label: "Team Workspace",
      icon: Users,
      items: [
        { id: "team-overview", label: "Overview" },
        { id: "team-members", label: "Members" },
        { id: "team-repos", label: "Repositories" },
        { id: "team-sprint", label: "Sprint Dashboard" },
        { id: "team-leaderboard", label: "Leaderboard" },
        { id: "team-activity", label: "Activity Feed" },
        { id: "team-reports", label: "Reports" },
        { id: "team-settings", label: "Settings" },
      ]
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      items: [
        { id: "lang", label: "Languages" },
        { id: "score", label: "Developer Score" },
        { id: "ai", label: "AI Insights" },
        { id: "compare", label: "Compare Profile" },
        { id: "wrapped", label: "Wrapped" },
      ]
    },
    {
      id: "settings-section",
      label: "Settings",
      icon: Settings,
      items: [
        { id: "settings", label: "Settings" }
      ]
    }
  ];

  const pinnedItemsData = useMemo(() => {
    const allItems = sidebarSections.flatMap(sec => sec.items);
    return pinnedTabs.map(pinnedId => {
      return allItems.find(item => item.id === pinnedId);
    }).filter(Boolean) as { id: string; label: string }[];
  }, [pinnedTabs, sidebarSections]);

  const toggleSection = (sectionId: string) => {
    if (activeSection === sectionId) {
      setActiveSection("");
    } else {
      setActiveSection(sectionId);
    }
  };

  // Expand parent section automatically when activeTab changes
  useEffect(() => {
    const parentSection = sidebarSections.find(sec => sec.items.some(item => item.id === activeTab));
    if (parentSection) {
      setActiveSection(parentSection.id);
    }
  }, [activeTab]);

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
      case "hiring-overview":
      case "hiring-ats":
      case "hiring-resume-analyzer":
      case "hiring-resume-match":
      case "hiring-job-match":
      case "hiring-skills-gap":
      case "hiring-recruiter":
      case "hiring-interview":
      case "hiring-roadmap":
      case "hiring-applications":
        return (
          <HiringDashboard
            data={dashboardData}
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
            githubToken={githubToken}
          />
        );
      case "workspace":
        return (
          <DeveloperWorkspaceTab
            data={dashboardData}
            githubToken={githubToken}
            isFocusMode={isFocusMode}
            setIsFocusMode={setIsFocusMode}
            registerNewNoteCallback={(cb) => setNewNoteTrigger(() => cb)}
          />
        );
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
      case "career-dashboard":
      case "career-resume-builder":
      case "career-ats-analyzer":
      case "career-portfolio-analyzer":
      case "career-job-match":
      case "career-cover-letter":
      case "career-linkedin":
      case "career-skill-gap":
      case "career-interview-prep":
      case "career-roadmap":
      case "career-versions":
      case "career-tracker":
      case "career-assistant":
        return (
          <DeveloperCareerHub
            data={dashboardData}
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
            githubToken={githubToken}
          />
        );
      case "team-overview":
      case "team-members":
      case "team-analytics":
      case "team-repos":
      case "team-leaderboard":
      case "team-sprint":
      case "team-activity":
      case "team-reports":
      case "team-settings":
        return (
          <TeamWorkspaceTab
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
            githubToken={githubToken}
          />
        );
      case "ai-scanner":
      case "ai-code-review":
      case "ai-security":
      case "ai-docs":
      case "ai-dependencies":
      case "ai-architecture":
      case "ai-performance":
      case "ai-practices":
      case "ai-suggestions":
      case "ai-reports":
        return (
          <AiCodeReviewTab
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
            dashboardData={dashboardData}
            githubToken={githubToken}
          />
        );
      case "live-feed":
      case "live-notifications":
      case "live-repos":
      case "live-prs":
      case "live-issues":
      case "live-releases":
      case "live-social":
      case "live-timeline":
      case "live-sync":
        return (
          <LiveActivityTab
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
            dashboardData={dashboardData}
            githubToken={githubToken}
          />
        );
      case "challenges-dashboard":
      case "challenges-daily":
      case "challenges-weekly":
      case "challenges-monthly":
      case "challenges-achievements":
      case "challenges-xp":
      case "challenges-leaderboards":
      case "challenges-missions":
      case "challenges-rewards":
      case "challenges-history":
        return (
          <DeveloperChallengesHub
            data={dashboardData}
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
            githubToken={githubToken}
          />
        );
      case "community-feed":
      case "community-developers":
      case "community-discussions":
      case "community-showcase":
      case "community-opensource":
      case "community-events":
      case "community-studygroups":
      case "community-clubs":
      case "community-jobs":
      case "community-notifications":
      case "community-messaging":
      case "community-search":
        return (
          <DeveloperCommunityHub
            data={dashboardData}
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
            githubToken={githubToken}
          />
        );


      default:
        return <OverviewTab data={dashboardData} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} onOpenSearch={() => setIsCommandPaletteOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-secondary pt-24">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-accent/25 blur-xl animate-pulse" />
            <Logo size={64} showText={false} className="relative z-10 animate-bounce" />
          </div>
          <span className="text-sm font-semibold tracking-wide font-mono">Running Codebase Indexer...</span>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} onOpenSearch={() => setIsCommandPaletteOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto pt-24">
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

      <div className={`flex-1 mx-auto w-full px-4 pt-24 pb-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 transition-all duration-300 ${
        isFocusMode ? "max-w-4xl" : "max-w-7xl"
      }`}>
        
        {/* Collapsible/Resizable Sidebar Nav */}
        {!isFocusMode && (
          <aside
            style={{ width: isSidebarCollapsed ? 72 : sidebarWidth }}
            className="flex-shrink-0 md:flex hidden flex-col border-r border-[#30363D] bg-[#161B22]/30 select-none relative group transition-all duration-150 h-[calc(100vh-120px)] rounded-xl"
          >
            {/* Top Workspace Switcher */}
            <div className="p-3 border-b border-[#30363D]/60 flex items-center justify-between gap-2 relative">
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="flex items-center justify-between w-full p-1.5 rounded-lg border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] text-xs text-[#F0F6FC] font-semibold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded bg-[#2F81F7] text-white flex items-center justify-center font-bold text-[10px]">
                    {activeWorkspace.charAt(0)}
                  </div>
                  {!isSidebarCollapsed && <span className="truncate">{activeWorkspace}</span>}
                </div>
                {!isSidebarCollapsed && <ChevronDown size={14} className="text-[#8B949E]" />}
              </button>

              {/* Switcher Dropdown */}
              {isWorkspaceMenuOpen && !isSidebarCollapsed && (
                <div className="absolute top-full left-3 right-3 mt-1.5 bg-[#161B22] border border-[#30363D] rounded-lg shadow-xl p-1 z-50 animate-fadeIn text-xs">
                  <button
                    onClick={() => {
                      setActiveWorkspace("Personal Workspace");
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-[#21262D] rounded text-left text-[#F0F6FC] cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded bg-[#2F81F7] text-white flex items-center justify-center text-[8px] font-bold">P</div>
                    Personal Workspace
                  </button>
                  <button
                    onClick={() => {
                      setActiveWorkspace("Vercel Team");
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-[#21262D] rounded text-left text-[#F0F6FC] cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded bg-[#3FB950] text-white flex items-center justify-center text-[8px] font-bold">V</div>
                    Vercel Team
                  </button>
                  <div className="border-t border-[#30363D] my-1" />
                  <button
                    onClick={() => {
                      alert("Connect Organization workspace");
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-[#21262D] rounded text-left text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
                  >
                    <Plus size={12} />
                    Connect Organization
                  </button>
                </div>
              )}
            </div>

            {/* Pinned & Scrollable Sections */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
              {/* Search Shortcut */}
              {!isSidebarCollapsed && (
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] text-[11px] text-[#8B949E] cursor-pointer transition-all mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Search size={12} />
                    <span>Search commands...</span>
                  </div>
                  <kbd className="text-[9px] border border-[#30363D] px-1.5 py-0.5 rounded bg-surface">Ctrl K</kbd>
                </button>
              )}

              {/* Pinned Items */}
              {pinnedItemsData.length > 0 && (
                <div className="space-y-1">
                  {!isSidebarCollapsed && (
                    <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block px-2 mb-1.5">
                      ⭐ Pinned
                    </span>
                  )}
                  {pinnedItemsData.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabId)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === item.id
                          ? "text-[#F0F6FC] bg-[#21262D] border border-[#30363D]"
                          : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/40"
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && (
                        <button
                          onClick={(e) => togglePinTab(item.id, e)}
                          className="opacity-0 hover:text-[#F85149] transition-opacity p-0.5 text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Accordion Sections */}
              <div className="space-y-1.5">
                {sidebarSections.map(sec => {
                  const SecIcon = sec.icon;
                  const isExpanded = activeSection === sec.id;
                  const hasActiveChild = sec.items.some(item => item.id === activeTab);

                  return (
                    <div key={sec.id} className="space-y-1 animate-fadeIn">
                      {/* Section Title */}
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          hasActiveChild && !isExpanded
                            ? "text-[#2F81F7]"
                            : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/40"
                        }`}
                        title={isSidebarCollapsed ? sec.label : undefined}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <SecIcon size={14} className="flex-shrink-0" />
                          {!isSidebarCollapsed && <span className="truncate">{sec.label}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          <ChevronDown
                            size={12}
                            className={`transform transition-transform duration-200 ${
                              isExpanded ? "" : "-rotate-90"
                            }`}
                          />
                        )}
                      </button>

                      {/* Expandable sub-items */}
                      {isExpanded && !isSidebarCollapsed && (
                        <div className="pl-4 border-l border-[#30363D] ml-4.5 space-y-1 py-1">
                          {sec.items.map(item => {
                            const isPinned = pinnedTabs.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                className="group/item flex items-center justify-between w-full"
                              >
                                <button
                                  onClick={() => setActiveTab(item.id as TabId)}
                                  className={`flex-1 text-left px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all truncate cursor-pointer ${
                                    activeTab === item.id
                                      ? "text-[#F0F6FC] bg-[#21262D]/60 font-bold"
                                      : "text-[#8B949E] hover:text-[#F0F6FC]"
                                  }`}
                                >
                                  {item.label}
                                </button>
                                <button
                                  onClick={(e) => togglePinTab(item.id, e)}
                                  className={`p-1 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer ${
                                    isPinned ? "opacity-100 text-yellow-500" : "text-[#484F58] hover:text-yellow-500"
                                  }`}
                                >
                                  <Star size={10} className={isPinned ? "fill-yellow-500 text-yellow-500" : ""} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky Bottom Area */}
            <div className="p-3 border-t border-[#30363D]/60 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#8B949E] px-1.5">
                {!isSidebarCollapsed && (
                  <>
                    <span>v0.1.0</span>
                    <span>Storage: 62%</span>
                  </>
                )}
              </div>
              <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center p-2 rounded-lg border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer transition-colors text-xs font-bold"
              >
                {isSidebarCollapsed ? <ChevronRight size={14} /> : "Collapse Sidebar"}
              </button>
            </div>

            {/* Drag Handle */}
            {!isSidebarCollapsed && (
              <div
                onMouseDown={startResizing}
                className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#2F81F7]/40 active:bg-[#2F81F7] transition-all z-50"
              />
            )}
          </aside>
        )}

        {/* Mobile Horizontal scrollbar nav */}
        {!isFocusMode && (
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
        )}

        {/* Tab Content window */}
        <div className="flex-1 min-w-0">
          {dashboardData && !isFocusMode && <DashboardHeader data={dashboardData} />}
          <div className={isFocusMode ? "transition-all duration-300" : "border border-border bg-surface/20 rounded-xl p-6 transition-all duration-300"}>
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
