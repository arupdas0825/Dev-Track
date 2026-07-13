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
import ContributionHeatmap from "./ContributionHeatmap";
import DeveloperMilestones from "./DeveloperMilestones";

import TeamWorkspaceTab from "./TeamWorkspaceTab";
import AiCodeReviewTab from "./AiCodeReviewTab";
import LiveActivityTab from "./LiveActivityTab";
import QuickActionsFAB from "./QuickActionsFAB";
import HiringDashboard from "./HiringDashboard";
import EnterpriseHub from "./EnterpriseHub";
import Logo from "../ui/Logo";
import CommandPalette from "./CommandPalette";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import ExportCenterModal from "./ExportCenterModal";
import { GlassEffect, GlassButton, GlassFilter } from "../ui/liquid-glass";
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
  ClipboardList,
  Heart,
  Share2,
  LogOut,
  ArrowUp,
  X,
  Send,
  AlertCircle,
  Building2
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

  // Dedicated Mobile Experience States
  const [activeMobileTab, setActiveMobileTab] = useState<"dashboard" | "repos" | "insights" | "community" | "profile">("dashboard");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isProfileInfoExpanded, setIsProfileInfoExpanded] = useState<boolean>(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pullToRefreshStatus, setPullToRefreshStatus] = useState<"idle" | "pulling" | "refreshing">("idle");
  const [touchStartClientY, setTouchStartClientY] = useState<number>(0);
  const [isBackToTopVisible, setIsBackToTopVisible] = useState<boolean>(false);
  const [mobileNotificationsCount, setMobileNotificationsCount] = useState<number>(3);
  
  // Mobile mock states
  const [mobileRecentSearches, setMobileRecentSearches] = useState<string[]>(["nextjs", "react-motion", "recharts"]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [aiAssistantMessages, setAiAssistantMessages] = useState<{sender: "user" | "assistant", text: string}[]>([
    { sender: "assistant", text: "Hello! I am your AI Career Assistant. How can I help you improve your repository quality, prep for interviews, or analyze your ATS score today?" }
  ]);
  const [aiAssistantInput, setAiAssistantInput] = useState<string>("");
  const [expandedMobileRepoId, setExpandedMobileRepoId] = useState<string | null>(null);
  const [targetMobileRole, setTargetMobileRole] = useState<string>("Frontend");
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<{ date: string; count: number } | null>(null);

  // Track network and scroll status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      
      const handleScroll = () => {
        setIsBackToTopVisible(window.scrollY > 400);
      };
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

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

  const enterpriseTabsList = [
    { id: "enterprise-dashboard", label: "Enterprise Dashboard", icon: Building2 },
    { id: "enterprise-organizations", label: "Organizations", icon: Building2 },
    { id: "enterprise-members", label: "Members", icon: Users },
    { id: "enterprise-teams", label: "Teams", icon: Users },
    { id: "enterprise-admin", label: "Admin Panel", icon: Shield },
    { id: "enterprise-api-keys", label: "API Keys", icon: Shield },
    { id: "enterprise-usage", label: "Usage Analytics", icon: TrendingUp },
    { id: "enterprise-billing", label: "Billing", icon: TrendingUp },
    { id: "enterprise-audit", label: "Audit Logs", icon: FileText },
    { id: "enterprise-security", label: "Security", icon: Shield },
    { id: "enterprise-integrations", label: "Integrations", icon: Globe },
  ] as const;

  const tabsList = [...coreTabsList, ...hiringTabsList, ...careerTabsList, ...teamTabsList, ...aiReviewTabsList, ...liveActivityTabsList, ...challengesTabsList, ...communityTabsList, ...enterpriseTabsList];



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
    },
    {
      id: "enterprise",
      label: "🏢 Enterprise",
      icon: Building2,
      items: [
        { id: "enterprise-dashboard", label: "Enterprise Dashboard" },
        { id: "enterprise-organizations", label: "Organizations" },
        { id: "enterprise-members", label: "Members" },
        { id: "enterprise-teams", label: "Teams" },
        { id: "enterprise-admin", label: "Admin Panel" },
        { id: "enterprise-api-keys", label: "API Keys" },
        { id: "enterprise-usage", label: "Usage Analytics" },
        { id: "enterprise-billing", label: "Billing" },
        { id: "enterprise-audit", label: "Audit Logs" },
        { id: "enterprise-security", label: "Security" },
        { id: "enterprise-integrations", label: "Integrations" },
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


      case "enterprise-dashboard":
      case "enterprise-organizations":
      case "enterprise-members":
      case "enterprise-teams":
      case "enterprise-admin":
      case "enterprise-api-keys":
      case "enterprise-usage":
      case "enterprise-billing":
      case "enterprise-audit":
      case "enterprise-security":
      case "enterprise-integrations":
        return (
          <EnterpriseHub
            activeSubTab={activeTab}
            setActiveSubTab={(t) => setActiveTab(t as TabId)}
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

  // Dedicated Mobile View Content Renderer
  const renderMobileActiveTabContent = () => {
    if (!dashboardData) return null;
    const { profile, contributions, score, languages, repositories } = dashboardData;

    switch (activeMobileTab) {
      case "dashboard":
        const totalStars = repositories.reduce((acc, curr) => acc + (curr.stargazers_count || 0), 0);
        return (
          <div className="space-y-6 pb-12">
            {/* Pull-To-Refresh Visual Indicator */}
            {pullToRefreshStatus !== "idle" && (
              <div className="flex justify-center items-center py-2 text-[10px] font-mono text-text-secondary animate-pulse bg-[#111827]/80 border border-border/40 rounded-xl">
                {pullToRefreshStatus === "pulling" ? "↓ Pull more to refresh..." : "🔄 Refreshing telemetry..."}
              </div>
            )}

            {/* Offline Network indicator */}
            {!isOnline && (
              <div className="bg-danger/10 border border-danger/25 text-danger rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-pulse">
                <Shield size={14} />
                <span>Offline mode: loading telemetry from local cache</span>
              </div>
            )}

            {/* Redesigned Welcome Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#111827]/80 border border-white/5 p-5 shadow-2xl flex flex-col justify-between">
              {/* Glossy top overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-purple-500/5 opacity-40 pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex justify-between items-start z-10">
                <div>
                  <span className="text-[9px] font-mono text-accent/80 uppercase tracking-widest font-black">SYSTEM STATUS: ACTIVE</span>
                  <h3 className="text-xl font-bold font-space-grotesk text-white mt-1">
                    Hey, {profile.name || profile.login} 👋
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-success/30 bg-success/10 text-success text-[9px] font-mono font-bold">
                  <span className="w-1 h-1 rounded-full bg-success animate-ping" />
                  <span>SYNCED</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-y border-white/5 py-4 my-4 text-center z-10">
                <div>
                  <span className="text-text-secondary block text-[8px] uppercase tracking-wider font-mono">Current Streak</span>
                  <span className="text-white font-black text-sm block mt-1 font-space-grotesk">{contributions.currentStreak || 0} Days</span>
                </div>
                <div>
                  <span className="text-text-secondary block text-[8px] uppercase tracking-wider font-mono">Dev Grade</span>
                  <span className="text-accent font-black text-sm block mt-1 font-space-grotesk">{score.grade || "A"}</span>
                </div>
                <div>
                  <span className="text-text-secondary block text-[8px] uppercase tracking-wider font-mono">Today's Status</span>
                  <span className="text-success font-black text-sm block mt-1 font-space-grotesk">Ready</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 z-10">
                <div className="flex justify-between text-[9px] text-text-secondary font-mono">
                  <span>Score Engine Progress</span>
                  <span>{score.overall}/100</span>
                </div>
                <div className="h-2 bg-[#09090B] rounded-full overflow-hidden p-[2px]">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-[#8957e5] rounded-full transition-all duration-500 shadow-md shadow-accent/50"
                    style={{ width: `${score.overall}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-text-secondary font-mono pt-1">
                  <span>Last Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>Next Goal: Grade A+</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block px-1">Quick Actions</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Scan Repository", icon: Search, tab: "repos" },
                  { label: "AI Review", icon: Code, tab: "ai-code-review" },
                  { label: "Security Scan", icon: Shield, tab: "ai-security" },
                  { label: "Developer DNA", icon: Dna, tab: "dna" },
                  { label: "Roadmap", icon: TrendingUp, tab: "hiring-roadmap" },
                  { label: "Resume Review", icon: FileText, tab: "hiring-resume-analyzer" },
                  { label: "GitHub Wrapped", icon: Gift, tab: "wrapped" },
                  { label: "Community", icon: Users, tab: "community" }
                ].map((act, i) => {
                  const ActIcon = act.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (act.tab === "repos" || act.tab === "community") {
                          setActiveMobileTab(act.tab);
                        } else {
                          setActiveTab(act.tab as TabId);
                          alert(`Navigated to ${act.label} workspace.`);
                        }
                      }}
                      className="relative overflow-hidden rounded-2xl bg-[#111827]/80 border border-white/5 p-3.5 flex items-center gap-3 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg hover:border-white/10"
                    >
                      <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <ActIcon size={14} />
                      </div>
                      <span className="text-[11px] font-bold text-white tracking-wide text-left">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Redesigned Compact Profile Card */}
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className="w-12 h-12 rounded-full border border-white/10 object-cover shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white font-space-grotesk truncate">{profile.name || profile.login}</h4>
                  <span className="text-xs text-text-secondary font-mono block">@{profile.login}</span>
                </div>
                <button
                  onClick={() => setIsProfileInfoExpanded(!isProfileInfoExpanded)}
                  className="px-3 py-1.5 rounded-xl border border-white/5 bg-[#09090B] text-[9px] font-mono font-bold text-text-secondary active:scale-95 transition-all"
                >
                  {isProfileInfoExpanded ? "Collapse" : "Details"}
                </button>
              </div>

              {/* Expandable bio & metrics info */}
              <AnimatePresence>
                {isProfileInfoExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-4 space-y-3.5 text-xs text-text-secondary font-mono"
                  >
                    {profile.bio && (
                      <p className="leading-relaxed bg-[#09090B] p-3 rounded-xl border border-white/5 text-[10px] text-text-secondary">
                        {profile.bio}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-[10px] pt-1">
                      <div>📍 {profile.location || "Earth"}</div>
                      <div>Joined: {new Date(profile.created_at || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</div>
                      <div>👥 {profile.followers} Followers</div>
                      <div>📦 {repositories.length} Repositories</div>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <a
                        href={profile.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-[#09090B] border border-white/5 rounded-xl text-center text-white text-[10px] font-bold active:scale-95 transition-all"
                      >
                        GitHub Profile
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Redesigned Statistics Grid (Exactly 2 cards per row) */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block px-1">Stats Grid</span>
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { label: "Repositories", val: repositories.length, detail: "Active projects" },
                  { label: "Contributions", val: contributions.totalCommits + contributions.totalPRs, detail: "Total pushes" },
                  { label: "Followers", val: profile.followers, detail: "Network size" },
                  { label: "Stars Received", val: totalStars, detail: "Community stars" },
                  { label: "Telemetry", val: `${score.overall}/100`, detail: "Overall Index" },
                  { label: "Developer Score", val: score.overall * 10, detail: "Weighted rating" },
                  { label: "Commit Velocity", val: `${Math.round((contributions.totalCommits / 30) * 10) / 10} / day`, detail: "Last 30 days" },
                  { label: "Current Streak", val: `${contributions.currentStreak || 0} days`, detail: "Max consistency" }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111827]/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-28 shadow-lg">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider font-mono">{stat.label}</span>
                    <span className="text-2xl font-black font-space-grotesk text-white block my-1">{stat.val}</span>
                    <span className="text-[9px] text-text-secondary font-mono">{stat.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Redesigned Heatmap Section */}
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono">Consistency Mapping</span>
                <span className="text-[9px] font-mono text-accent">Tap cell for logs</span>
              </div>
              <div className="overflow-x-auto scrollbar-none py-1.5 border border-white/5 rounded-xl bg-[#09090B]">
                <div className="min-w-[650px] p-2 flex justify-center text-xs">
                  <ContributionHeatmap
                    dailyContributions={contributions.dailyContributions || {}}
                    onCellClick={(dateStr, count) => {
                      setSelectedHeatmapDay({ date: dateStr, count });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* AI Insights Horizontal Cards Deck */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block px-1">AI Insights Deck</span>
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 select-none">
                {[
                  { title: "Repository Recommendation", text: "Refactor nested loop utilities into flat mapping filters to optimize heap footprint.", color: "border-accent/20 bg-accent/5" },
                  { title: "Today's Advice", text: "Lock Firestore write capabilities behind structured authenticated uid verification rule models.", color: "border-amber-500/20 bg-amber-500/5" },
                  { title: "Weak Skill", text: "Database connection pools & indexing configurations need load diagnostics reviews.", color: "border-red-500/20 bg-red-500/5" },
                  { title: "Strong Skill", text: "Responsive frontend styling layers with robust responsive layouts.", color: "border-emerald-500/20 bg-emerald-500/5" },
                  { title: "Career Tip", text: "Showcase full-stack workflows including secure file storage uploads in portfolios.", color: "border-purple-500/20 bg-purple-500/5" }
                ].map((ins, i) => (
                  <div key={i} className={`flex-shrink-0 w-60 border rounded-2xl p-4 flex flex-col justify-between h-36 shadow-lg ${ins.color}`}>
                    <span className="text-[9.5px] font-bold text-white uppercase tracking-wider font-space-grotesk">{ins.title}</span>
                    <p className="text-[11px] text-text-secondary font-sans leading-relaxed mt-2.5">{ins.text}</p>
                    <span className="text-[8px] text-text-secondary font-mono mt-1.5">DevTrack Career Engine</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Activity Timeline */}
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block">Activity Timeline</span>
              <div className="relative border-l border-white/5 ml-3 space-y-5 pl-4 pb-1">
                {[
                  { time: "2 hours ago", title: "Pushed 3 commits to main", detail: "feat: security scanner rules implementation", icon: Code },
                  { time: "5 hours ago", title: "Opened Pull Request #48", detail: "docs: add compliance checklist instructions", icon: GitPullRequest },
                  { time: "Yesterday", title: "Starred repository axios", detail: "added reference configurations to client", icon: Star }
                ].map((act, idx) => {
                  const ActIcon = act.icon;
                  return (
                    <div key={idx} className="relative animate-fadeIn">
                      <div className="absolute -left-6.5 top-1 h-5 w-5 rounded-full bg-[#09090B] border border-white/10 flex items-center justify-center text-accent">
                        <ActIcon size={10} />
                      </div>
                      <span className="text-[9px] text-text-secondary font-mono block">{act.time}</span>
                      <span className="text-xs font-bold text-white block mt-0.5">{act.title}</span>
                      <span className="text-[10px] text-text-secondary block mt-0.5 leading-relaxed font-sans">{act.detail}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expandable Milestones / Activity */}
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-4 shadow-2xl space-y-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block">DevTrack Milestones</span>
              <DeveloperMilestones data={dashboardData} />
            </div>
          </div>
        );

      case "repos":
        const filteredRepos = repositories.filter(repo =>
          repo.name.toLowerCase().includes(mobileSearchQuery.toLowerCase()) ||
          (repo.language && repo.language.toLowerCase().includes(mobileSearchQuery.toLowerCase()))
        );

        return (
          <div className="space-y-4">
            {/* Search Bar Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full bg-[#161B22]/50 border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
              {mobileSearchQuery && (
                <button
                  onClick={() => setMobileSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Repos list */}
            <div className="space-y-3">
              {filteredRepos.length > 0 ? (
                filteredRepos.map(repo => {
                  const isExpanded = expandedMobileRepoId === repo.name;
                  return (
                    <div
                      key={repo.name}
                      onClick={() => setExpandedMobileRepoId(isExpanded ? null : repo.name)}
                      className="bg-surface/50 border border-border rounded-2xl p-4 shadow-md transition-all active:bg-[#161B22] flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Folder size={14} className="text-accent flex-shrink-0" />
                          <h4 className="text-xs font-bold text-text-primary truncate max-w-[180px]">{repo.name}</h4>
                        </div>
                        {/* Health Index Badge */}
                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          (repo.open_issues_count || 0) > 5 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                        }`}>
                          Health: {Math.max(40, 100 - (repo.open_issues_count || 0) * 8)}%
                        </div>
                      </div>

                      {repo.description && (
                        <p className="text-[10px] text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between border-t border-border/40 mt-3 pt-2 text-[10px] font-mono text-text-secondary">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f1e05a]" />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">⭐ {repo.stargazers_count}</span>
                          <span className="flex items-center gap-0.5">🍴 {repo.forks_count}</span>
                        </div>
                        <span className="text-[9px] text-accent">Details</span>
                      </div>

                      {/* Expandable details panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-border/40 mt-2.5 pt-2.5 space-y-2 text-[10px] text-text-secondary font-mono"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                              <div>Default Branch: <span className="text-text-primary">{repo.default_branch || "main"}</span></div>
                              <div>Watchers: <span className="text-text-primary">{repo.watchers_count || 0}</span></div>
                              <div>Open Issues: <span className="text-text-primary">{repo.open_issues_count || 0}</span></div>
                              <div>Size: <span className="text-text-primary">{Math.round(repo.size / 1024)} MB</span></div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-1.5 bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] rounded-lg text-center text-text-primary font-bold"
                              >
                                View GitHub
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-text-secondary font-mono text-xs">No repositories match search</div>
              )}
            </div>
          </div>
        );

      case "insights":
        return (
          <div className="space-y-6">
            {/* Overall developer rating */}
            <div className="bg-surface/60 border border-border rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/10">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Developer Grade</span>
                <span className="text-2xl font-black font-space-grotesk text-accent block">{score.grade || "A"}</span>
                <span className="text-[9px] text-text-secondary font-mono leading-none">Telemetry compiled successfully</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                <span className="text-lg font-black font-space-grotesk text-accent">{score.overall}</span>
              </div>
            </div>

            {/* Technical radar score progress bars */}
            <div className="bg-surface/60 border border-border rounded-2xl p-4 shadow-lg shadow-black/10 space-y-4">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Telemetry Category Scoring</span>
              <div className="space-y-3.5">
                {[
                  { name: "Repository Quality", score: score.categories?.repoQuality?.score || 16, max: 20 },
                  { name: "Coding Consistency", score: score.categories?.consistency?.score || 15, max: 20 },
                  { name: "Documentation Integrity", score: score.categories?.documentation?.score || 8, max: 10 },
                  { name: "Open Source Engagement", score: score.categories?.openSource?.score || 11, max: 15 },
                  { name: "Community Impact", score: score.categories?.communityImpact?.score || 12, max: 15 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-mono text-text-secondary text-[10px]">
                      <span>{item.name}</span>
                      <span className="text-text-primary font-semibold">{item.score}/{item.max}</span>
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Strengths & recommendations list */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">AI Diagnostics</span>
              {/* Strengths card */}
              <div className="bg-surface/50 border border-border rounded-2xl p-4 shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-success" />
                  <h4 className="text-xs font-bold text-text-primary font-space-grotesk">Verified Strengths</h4>
                </div>
                <ul className="space-y-1.5 text-[10px] font-mono text-text-secondary leading-relaxed list-disc list-inside">
                  {dashboardData.aiInsights.strengths.slice(0, 3).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses card */}
              <div className="bg-surface/50 border border-border rounded-2xl p-4 shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-warning" />
                  <h4 className="text-xs font-bold text-text-primary font-space-grotesk">Improvement Focus</h4>
                </div>
                <ul className="space-y-1.5 text-[10px] font-mono text-text-secondary leading-relaxed list-disc list-inside">
                  {dashboardData.aiInsights.weaknesses.slice(0, 3).map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case "community":
        const posts = [
          { id: "1", author: "arupdas0825", avatar: profile.avatar_url, time: "2h ago", content: "Just indexed my main codebase on DevTrack. Scored a consistent A grade and verified my system design skills. Ready to connect with hiring recruiters!", likes: 14, replies: 3 },
          { id: "2", author: "linus_t", avatar: "/vercel.svg", time: "5h ago", content: "Building a new compiler engine in Rust. Committing daily on GitHub. Consistency heatmap is glowing green! 🦀🖥️ #rust #compiler", likes: 112, replies: 28 },
          { id: "3", author: "taylor_ot", avatar: "/next.svg", time: "1d ago", content: "Excited to preview DevTrack Upgrade 13. The new AI Career intelligence platform dashboard looks absolutely next-gen. Great job team!", likes: 54, replies: 8 }
        ];

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Community Showcase Feed</span>
              <button
                onClick={() => alert("Make a post")}
                className="px-3 py-1 bg-accent rounded-lg text-[10px] font-mono text-white font-bold"
              >
                + New Post
              </button>
            </div>

            <div className="space-y-3.5">
              {posts.map(post => {
                const isLiked = likedPosts[post.id];
                return (
                  <div key={post.id} className="bg-surface/50 border border-border rounded-2xl p-4 shadow-md space-y-3">
                    <div className="flex items-center gap-2.5">
                      <img src={post.avatar} alt={post.author} className="w-7 h-7 rounded-full border border-border object-cover" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-text-primary truncate block">{post.author}</span>
                        <span className="text-[9px] text-text-secondary font-mono leading-none block">{post.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-sans">{post.content}</p>

                    {/* Post action footer */}
                    <div className="flex items-center gap-6 border-t border-border/40 pt-2 text-[10px] font-mono text-text-secondary">
                      <button
                        onClick={() => setLikedPosts({ ...likedPosts, [post.id]: !isLiked })}
                        className={`flex items-center gap-1 hover:text-danger transition-colors cursor-pointer ${
                          isLiked ? "text-danger" : ""
                        }`}
                      >
                        <Heart size={12} className={isLiked ? "fill-danger text-danger" : ""} />
                        <span>{post.likes + (isLiked ? 1 : 0)}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        <MessageSquare size={12} />
                        <span>{post.replies}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        <Share2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            {/* Account Card */}
            <div className="bg-surface/60 border border-border rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/10">
              <img src={profile.avatar_url} alt={profile.login} className="w-12 h-12 rounded-full border border-border object-cover" />
              <div>
                <h4 className="text-xs font-bold text-text-primary">{profile.name || profile.login}</h4>
                <span className="text-[10px] text-text-secondary font-mono leading-none">GitHub Account Linked</span>
              </div>
            </div>

            {/* Grouped settings menu lists */}
            <div className="space-y-4">
              {/* Preferences list */}
              <div className="bg-[#161B22]/40 border border-border rounded-2xl overflow-hidden shadow-md">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block px-4 pt-3.5 pb-1">Preferences</span>
                <div className="divide-y divide-border/60">
                  <div className="px-4 py-3 flex justify-between items-center text-xs">
                    <span className="text-text-primary font-semibold">Install PWA Web App</span>
                    <button
                      onClick={() => alert("Install PWA to Home Screen initiated.")}
                      className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] border border-border rounded text-[10px] font-mono text-accent font-bold"
                    >
                      Install
                    </button>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center text-xs">
                    <span className="text-text-primary font-semibold">Active Workspace</span>
                    <span className="font-mono text-text-secondary text-[10px]">{activeWorkspace}</span>
                  </div>
                </div>
              </div>

              {/* Developer Profile Info Group */}
              <div className="bg-[#161B22]/40 border border-border rounded-2xl overflow-hidden shadow-md">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block px-4 pt-3.5 pb-1">System Health</span>
                <div className="divide-y divide-border/60">
                  <div className="px-4 py-3 flex justify-between items-center text-xs">
                    <span className="text-text-primary font-semibold">Network Connection</span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${isOnline ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center text-xs">
                    <span className="text-text-primary font-semibold">Telemetry Version</span>
                    <span className="font-mono text-text-secondary text-[10px]">v0.1.0</span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-danger/10 hover:bg-danger/15 border border-danger/25 text-danger rounded-xl text-xs font-bold font-space-grotesk flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                <span>Disconnect GitHub Profile</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const mobileNavTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "repos", label: "Repositories", icon: Folder },
    { id: "insights", label: "Insights", icon: TrendingUp },
    { id: "community", label: "Community", icon: Users },
    { id: "profile", label: "Profile", icon: Settings }
  ] as const;

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
    <>
      {/* DESKTOP LAYOUT SHELL (md and larger) */}
      <div className="hidden md:flex min-h-screen flex-col bg-background relative selection:bg-accent/30 w-full">
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

      {/* DEDICATED MOBILE LAYOUT SHELL (screens smaller than md) */}
      <div
        className="flex md:hidden flex-col w-full pb-24 relative select-none bg-background min-h-screen font-inter"
        onTouchStart={(e) => {
          if (window.scrollY === 0) {
            setTouchStartClientY(e.touches[0].clientY);
            setPullToRefreshStatus("idle");
          }
        }}
        onTouchMove={(e) => {
          if (window.scrollY === 0 && touchStartClientY > 0) {
            const diff = e.touches[0].clientY - touchStartClientY;
            if (diff > 50 && diff < 150) {
              setPullToRefreshStatus("pulling");
            }
          }
        }}
        onTouchEnd={() => {
          if (pullToRefreshStatus === "pulling") {
            setPullToRefreshStatus("refreshing");
            setTimeout(() => {
              setPullToRefreshStatus("idle");
              setTouchStartClientY(0);
              alert("GitHub Telemetry refreshed successfully!");
            }, 1200);
          } else {
            setTouchStartClientY(0);
          }
        }}
      >
        {/* Sticky Mobile Header */}
        <header className="sticky top-0 z-40 bg-[#0D1117]/85 backdrop-blur-md border-b border-border/50 py-3 px-4 flex items-center justify-between">
          <Logo size={24} showText={true} />
          <div className="flex items-center gap-3.5">
            {/* Notification Badge Bell */}
            <button
              onClick={() => alert("Notification center: 3 active repository issues require attention.")}
              className="relative text-text-secondary hover:text-text-primary p-1 cursor-pointer"
            >
              <Bell size={18} />
              {mobileNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger border border-[#0D1117] rounded-full" />
              )}
            </button>

            {/* Profile Avatar / Settings Switch */}
            {dashboardData && (
              <button
                onClick={() => {
                  setActiveMobileTab("profile");
                }}
                className="w-7 h-7 rounded-full border border-border overflow-hidden cursor-pointer"
              >
                <img
                  src={dashboardData.profile.avatar_url || "/avatar.png"}
                  alt={dashboardData.profile.login}
                  className="w-full h-full object-cover"
                />
              </button>
            )}
          </div>
        </header>

        {/* Mobile Main Content Area */}
        <main className="px-4 py-5 flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMobileTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderMobileActiveTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#161B22]/90 backdrop-blur-md border-t border-[#30363D] px-4 py-2 flex items-center justify-around pb-safe">
          {mobileNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMobileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMobileTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-bold focus:outline-none cursor-pointer transition-colors ${
                  isActive ? "text-accent" : "text-text-secondary"
                }`}
              >
                <Icon size={18} className={isActive ? "text-accent scale-105 transition-transform" : "text-text-secondary"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Floating Center Action Button for AI Assistant */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="w-13 h-13 rounded-full bg-gradient-to-r from-accent to-[#8957e5] text-white flex items-center justify-center shadow-lg shadow-accent/40 border border-white/20 hover:scale-105 active:scale-95 transition-all animate-bounce cursor-pointer"
            style={{ animationDuration: '3s' }}
          >
            <Sparkles size={20} className="fill-current animate-pulse" />
          </button>
        </div>

        {/* Custom Native-Feeling Bottom Sheet */}
        <AnimatePresence>
          {isAiAssistantOpen && (
            <div className="fixed inset-0 z-50 bg-black/75 flex items-end">
              {/* Dismiss backdrop */}
              <div className="absolute inset-0 -z-10" onClick={() => setIsAiAssistantOpen(false)} />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 200 }}
                className="bg-[#161B22] border-t border-[#30363D] rounded-t-2xl w-full max-h-[82vh] flex flex-col p-4 font-inter"
              >
                {/* Sheet Handle Indicator */}
                <div className="w-10 h-1 bg-[#30363D] rounded-full mx-auto mb-3 cursor-pointer" onClick={() => setIsAiAssistantOpen(false)} />

                {/* Sheet Header */}
                <div className="flex justify-between items-center border-b border-[#30363D]/60 pb-3.5 mb-3.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-accent fill-accent" />
                    <span className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">AI Career Intelligence</span>
                  </div>
                  <button
                    onClick={() => setIsAiAssistantOpen(false)}
                    className="w-6 h-6 rounded-full bg-[#21262D] hover:bg-[#30363D] flex items-center justify-center text-text-secondary hover:text-text-primary text-sm font-bold transition-all cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-3.5 p-1 max-h-[300px] scrollbar-thin">
                  {aiAssistantMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-[11px] leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-accent text-white rounded-tr-none"
                          : "bg-[#21262D] text-text-secondary rounded-tl-none font-mono"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestion Chips */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none py-2.5 border-t border-border/40 mt-3">
                  {[
                    "Calculate ATS match score",
                    "Analyze my skills gaps",
                    "Generate interview questions",
                    "Optimise resume sentence"
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        const userMsg = chip;
                        const assistantResponse = chip.includes("ATS")
                          ? "ATS Compatibility scan reports: 84% compatibility score. Excellent layout formatting. Missing keywords: Docker, CI/CD pipelines."
                          : chip.includes("gaps")
                          ? "Skills Gap Telemetry: Missing backend skills like Redis, Docker. Suggested coursework: 'Advanced Docker & Kubernetes' on Coursera."
                          : chip.includes("interview")
                          ? "Interview DSA Question: Given a binary tree, return its level order traversal. Checkbox checklists loaded under Interview Readiness section."
                          : "Resume Optimizer: 'Responsible for codebase updates' -> 'Architected and automated robust CI/CD code deployments, reducing latency by 24%'.";
                        
                        setAiAssistantMessages(prev => [
                          ...prev,
                          { sender: "user", text: userMsg },
                          { sender: "assistant", text: assistantResponse }
                        ]);
                      }}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full border border-border bg-[#0D1117] hover:bg-[#161B22] text-[10px] text-text-secondary font-mono whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!aiAssistantInput.trim()) return;
                    const userMsg = aiAssistantInput;
                    setAiAssistantInput("");
                    setAiAssistantMessages(prev => [...prev, { sender: "user", text: userMsg }]);
                    
                    setTimeout(() => {
                      setAiAssistantMessages(prev => [
                        ...prev,
                        { sender: "assistant", text: `I've analyzed your telemetry and query: "${userMsg}". Your repository footprint indicates strong Frontend capabilities. Let's work on sharpening Backend containerization.` }
                      ]);
                    }, 750);
                  }}
                  className="mt-2 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask assistant anything..."
                    value={aiAssistantInput}
                    onChange={(e) => setAiAssistantInput(e.target.value)}
                    className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Back-To-Top floating action button */}
        {isBackToTopVisible && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-[#161B22] border border-[#30363D] text-text-secondary hover:text-text-primary flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <ArrowUp size={16} />
          </button>
        )}
      </div>
    </>
  );
}
