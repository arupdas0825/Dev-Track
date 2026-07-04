"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { UserDashboardData, GitHubRepository } from "@/types";
import {
  extractMilestones,
  getLanguageEvolution,
  generateGrowthTimeline,
  calculateActiveDays,
  generateNarrativeSummaries,
  TimelineMilestone,
  formatTimelineDate,
} from "@/lib/timeMachineUtils";
import { calculateAccountAge } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  UserPlus,
  FolderPlus,
  Flag,
  Star,
  GitFork,
  Code,
  GitCommit,
  Flame,
  Zap,
  Activity,
  Users,
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Search,
  X,
  ChevronRight,
  Info,
  History,
  Lock,
  Unlock,
  Award,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeMachineTabProps {
  data: UserDashboardData;
  githubToken?: string;
}

// Icon mapper helper
const getMilestoneIcon = (name: string) => {
  switch (name) {
    case "UserPlus":
      return <UserPlus className="h-4 w-4" />;
    case "FolderPlus":
      return <FolderPlus className="h-4 w-4" />;
    case "Flag":
      return <Flag className="h-4 w-4" />;
    case "Star":
      return <Star className="h-4 w-4 text-amber-400" />;
    case "GitFork":
      return <GitFork className="h-4 w-4 text-purple-400" />;
    case "Code":
      return <Code className="h-4 w-4 text-blue-400" />;
    case "GitCommit":
      return <GitCommit className="h-4 w-4 text-blue-400" />;
    case "Flame":
      return <Flame className="h-4 w-4 text-orange-400" />;
    case "Zap":
      return <Zap className="h-4 w-4 text-amber-400" />;
    case "Activity":
      return <Activity className="h-4 w-4 text-emerald-400" />;
    case "Users":
      return <Users className="h-4 w-4 text-indigo-400" />;
    case "Cpu":
      return <Cpu className="h-4 w-4 text-pink-400" />;
    case "Award":
      return <Award className="h-4 w-4 text-rose-400" />;
    default:
      return <History className="h-4 w-4 text-accent" />;
  }
};

export default function TimeMachineTab({ data }: TimeMachineTabProps) {
  const { profile, contributions, score, repositories, languages } = data;

  // Compute all base data
  const rawMilestones = useMemo(() => extractMilestones(data), [data]);
  const langEvolution = useMemo(() => getLanguageEvolution(repositories), [repositories]);
  const growthTimeline = useMemo(
    () =>
      generateGrowthTimeline(
        repositories,
        contributions.dailyContributions,
        profile.followers,
        contributions.totalStarsEarned
      ),
    [repositories, contributions, profile]
  );
  const narrativeSummaries = useMemo(() => generateNarrativeSummaries(data), [data]);

  // UI Filters State
  const [selectedYear, setSelectedYear] = useState<string>("All Time");
  const [viewType, setViewType] = useState<"year" | "month" | "week">("month");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null);

  // Replay System State
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toast status messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Extract years available for filtering
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    rawMilestones.forEach((m) => {
      const year = m.date.substring(0, 4);
      if (year) years.add(year);
    });
    return ["All Time", ...Array.from(years).sort((a, b) => b.localeCompare(a))];
  }, [rawMilestones]);

  // Reset or run Replay Loop
  useEffect(() => {
    if (isReplaying) {
      const baseDelay = 1500;
      const delay = baseDelay / playbackSpeed;

      const tick = () => {
        setReplayIndex((prev) => {
          if (prev >= rawMilestones.length) {
            setIsReplaying(false);
            showToast("Replay complete! What a journey.");
            return prev;
          }
          return prev + 1;
        });
      };

      replayTimerRef.current = setInterval(tick, delay);
    } else {
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
      }
    }

    return () => {
      if (replayTimerRef.current) {
        clearInterval(replayTimerRef.current);
      }
    };
  }, [isReplaying, playbackSpeed, rawMilestones]);

  const handleStartReplay = () => {
    setSelectedYear("All Time");
    setReplayIndex(0);
    setIsReplaying(true);
    showToast("Starting time travel replay...");
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    showToast("Replay paused");
  };

  const handleResetReplay = () => {
    setIsReplaying(false);
    setReplayIndex(rawMilestones.length);
    showToast("Timeline reset to current day");
  };

  // Derive active milestones based on filtering or replay state
  const displayedMilestones = useMemo(() => {
    let list = rawMilestones;

    // If replaying, cap the list to the current replay index
    if (isReplaying || replayIndex < rawMilestones.length) {
      list = rawMilestones.slice(0, replayIndex);
    }

    // Apply Year Filter
    if (selectedYear !== "All Time") {
      list = list.filter((m) => m.date.startsWith(selectedYear));
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.details.repoName?.toLowerCase().includes(query) ||
          m.details.language?.toLowerCase().includes(query) ||
          m.date.includes(query)
      );
    }

    return list;
  }, [rawMilestones, selectedYear, searchQuery, isReplaying, replayIndex]);

  // Group milestones according to the view type
  const groupedMilestones = useMemo(() => {
    const groups: Record<string, TimelineMilestone[]> = {};

    displayedMilestones.forEach((m) => {
      let key = "";
      const date = new Date(m.date);

      if (viewType === "year") {
        key = m.date.substring(0, 4); // YYYY
      } else if (viewType === "month") {
        key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" }); // "January 2025"
      } else {
        // Week grouping: approximate using week number of year
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const diff = date.getTime() - startOfYear.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const weekNum = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
        key = `Week ${weekNum}, ${date.getFullYear()}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    return groups;
  }, [displayedMilestones, viewType]);

  // Replay Stats calculation
  const currentStats = useMemo(() => {
    if (!isReplaying && replayIndex >= rawMilestones.length) {
      return {
        repos: repositories.length,
        contributions: contributions.totalCommits + contributions.totalPRs + contributions.totalIssues,
        grade: score.grade || "A",
        languagesCount: languages.length,
        streak: contributions.longestStreak,
      };
    }

    // Compute stats dynamically from the subset of milestones currently replayed
    const visibleMilestones = rawMilestones.slice(0, replayIndex);
    
    let repos = 0;
    let maxContributions = 0;
    const seenLangs = new Set<string>();
    let streak = 0;

    visibleMilestones.forEach((m) => {
      if (m.type === "repo_create" || m.type === "first_repo") repos++;
      if (m.type === "lang_adopt" && m.details.language) seenLangs.add(m.details.language);
      if (m.type === "longest_streak" && m.details.contributionCount) streak = m.details.contributionCount;
      if (m.type === "commits_100") maxContributions = Math.max(maxContributions, 100);
      if (m.type === "commits_500") maxContributions = Math.max(maxContributions, 500);
      if (m.type === "commits_1000") maxContributions = Math.max(maxContributions, 1000);
      if (m.type === "biggest_day" && m.details.contributionCount) {
        maxContributions = Math.max(maxContributions, maxContributions + m.details.contributionCount);
      }
    });

    // Approximate grade based on virtual repos and contributions
    let grade = "D";
    if (maxContributions >= 1000) grade = "S";
    else if (maxContributions >= 500) grade = "A+";
    else if (maxContributions >= 100) grade = "A";
    else if (repos > 3) grade = "B+";
    else if (repos > 1) grade = "B";
    else if (repos > 0) grade = "C";

    return {
      repos: Math.max(repos, visibleMilestones.length > 0 ? 1 : 0),
      contributions: maxContributions || Math.min(visibleMilestones.length * 10, 99),
      grade,
      languagesCount: Math.max(seenLangs.size, visibleMilestones.length > 0 ? 1 : 0),
      streak: streak || Math.min(visibleMilestones.length, contributions.longestStreak),
    };
  }, [isReplaying, replayIndex, rawMilestones, repositories, contributions, score, languages]);

  // Real achievements list
  const achievements = useMemo(() => {
    const totalCommits = contributions.totalCommits || 0;
    const totalStars = contributions.totalStarsEarned || 0;
    const totalPRs = contributions.totalPRs || 0;

    return [
      {
        id: "first_100_commits",
        title: "First 100 Commits",
        icon: <GitCommit className="h-5 w-5 text-blue-400" />,
        unlocked: totalCommits >= 100,
        progress: Math.min(totalCommits, 100),
        target: 100,
        rarity: "Common",
        rarityColor: "border-gray-500/20 bg-gray-500/5 text-gray-400",
        unlockText: "Unlocked at 100 career contributions",
      },
      {
        id: "first_100_stars",
        title: "First 100 Stars",
        icon: <Star className="h-5 w-5 text-amber-400 animate-pulse" />,
        unlocked: totalStars >= 100,
        progress: Math.min(totalStars, 100),
        target: 100,
        rarity: "Epic",
        rarityColor: "border-purple-500/30 bg-purple-500/5 text-purple-400",
        unlockText: "Earned 100 stargazers on open-source repos",
      },
      {
        id: "first_os_contrib",
        title: "First OS Contribution",
        icon: <Flag className="h-5 w-5 text-emerald-400" />,
        unlocked: totalPRs >= 1,
        progress: totalPRs >= 1 ? 1 : 0,
        target: 1,
        rarity: "Rare",
        rarityColor: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
        unlockText: "Successfully merged your first remote pull request",
      },
      {
        id: "repo_creator",
        title: "Repository Creator",
        icon: <FolderPlus className="h-5 w-5 text-accent" />,
        unlocked: repositories.length >= 5,
        progress: Math.min(repositories.length, 5),
        target: 5,
        rarity: "Common",
        rarityColor: "border-gray-500/20 bg-gray-500/5 text-gray-400",
        unlockText: "Created 5 or more public codebases",
      },
      {
        id: "longest_streak_champ",
        title: "Streak Champion",
        icon: <Zap className="h-5 w-5 text-orange-400" />,
        unlocked: contributions.longestStreak >= 20,
        progress: Math.min(contributions.longestStreak, 20),
        target: 20,
        rarity: "Legendary",
        rarityColor: "border-orange-500/30 bg-orange-500/5 text-orange-400",
        unlockText: "Maintained a streak of 20+ consecutive coding days",
      },
      {
        id: "thousand_contributions",
        title: "1,000 Contributions Master",
        icon: <Award className="h-5 w-5 text-rose-400" />,
        unlocked: totalCommits + totalPRs >= 1000,
        progress: Math.min(totalCommits + totalPRs, 1000),
        target: 1000,
        rarity: "Legendary",
        rarityColor: "border-rose-500/30 bg-rose-500/5 text-rose-400",
        unlockText: "Accumulated 1,000 career contributions",
      },
    ];
  }, [contributions, repositories]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportPDF = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportMarkdown = () => {
    const md = `# Developer Time Machine — @${profile.login} GitHub Journey
Generated on DevTrack v3

## Account Stats
- Account Age: ${calculateAccountAge(profile.created_at)}
- Total Active Days: ${calculateActiveDays(contributions.dailyContributions)} days
- Current Grade: ${score.grade}

## Milestones
${rawMilestones
  .map((m) => `- **${m.date}** [${m.type.toUpperCase()}] ${m.title}: ${m.description}`)
  .join("\n")}
`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.login}_github_journey.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded timeline Markdown!");
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/u/${profile.login}?tab=time-machine`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Shareable link copied to clipboard!");
      });
    }
  };

  return (
    <div className="space-y-6 font-mono relative">
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-surface-secondary border border-border text-text-primary px-4 py-2.5 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2"
          >
            <Info size={14} className="text-accent" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#161B22]/60 rounded-xl border border-border p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-space-grotesk text-text-primary flex items-center gap-2">
            <History className="h-6 w-6 text-accent animate-pulse" /> Developer Time Machine
          </h2>
          <p className="text-xs text-text-secondary mt-1 max-w-xl font-sans leading-relaxed">
            Explore your entire developer journey from your first GitHub activity to today. Animate, search, and audit code growth.
          </p>
        </div>

        {/* Dynamic Header Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-border/40 rounded-lg p-3 bg-surface/30">
            <span className="text-[10px] text-text-secondary uppercase">Account Age</span>
            <div className="text-xs font-bold text-text-primary mt-1">
              {calculateAccountAge(profile.created_at)}
            </div>
          </div>
          <div className="border border-border/40 rounded-lg p-3 bg-surface/30">
            <span className="text-[10px] text-text-secondary uppercase">Total Active Days</span>
            <div className="text-xs font-bold text-text-primary mt-1">
              {isReplaying
                ? `${Math.min(replayIndex * 2, calculateActiveDays(contributions.dailyContributions))} d`
                : `${calculateActiveDays(contributions.dailyContributions)} days`}
            </div>
          </div>
          <div className="border border-border/40 rounded-lg p-3 bg-surface/30">
            <span className="text-[10px] text-text-secondary uppercase">Years on GitHub</span>
            <div className="text-xs font-bold text-text-primary mt-1">
              {Math.max(1, new Date().getFullYear() - new Date(profile.created_at).getFullYear())} yrs
            </div>
          </div>
          <div className="border border-border/40 rounded-lg p-3 bg-surface/30 flex flex-col justify-between">
            <span className="text-[10px] text-text-secondary uppercase">Dev Grade</span>
            <div className="text-sm font-bold text-accent font-space-grotesk">
              {currentStats.grade}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative AI Memory banner */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 space-y-2">
        <h4 className="text-xs font-bold text-accent flex items-center gap-1.5 font-space-grotesk">
          <Cpu size={14} /> AI Narrative Memory
        </h4>
        <div className="space-y-2 font-sans text-xs text-text-secondary leading-relaxed">
          {narrativeSummaries.slice(0, isReplaying ? 1 : 3).map((summary, idx) => (
            <p key={idx}>⚡ {summary}</p>
          ))}
        </div>
      </div>

      {/* CONTROL BAR (Filters, replay speed, search) */}
      <div className="bg-[#161B22]/40 rounded-xl border border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Play / Replay Mode controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {isReplaying ? (
            <button
              onClick={handleStopReplay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 text-xs font-bold cursor-pointer transition-all"
            >
              <Pause size={12} /> Pause Replay
            </button>
          ) : (
            <button
              onClick={handleStartReplay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent text-xs font-bold cursor-pointer transition-all"
            >
              <Play size={12} /> Play Replay
            </button>
          )}

          {replayIndex < rawMilestones.length && (
            <button
              onClick={handleResetReplay}
              className="flex items-center justify-center p-2 rounded-lg border border-border hover:bg-surface/50 text-text-secondary hover:text-text-primary cursor-pointer transition-all"
              title="Reset Timeline to Present"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Speed dial */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-surface/30">
            {([1, 2, 4] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                  playbackSpeed === speed
                    ? "bg-accent/20 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border/40 hidden sm:block" />

          {/* View switcher */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-surface/30">
            {(["year", "month", "week"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewType(mode)}
                className={`px-2.5 py-1 text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  viewType === mode
                    ? "bg-accent/20 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>
        </div>

        {/* Search & Year Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Year Filter Select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-bold text-text-primary focus:border-accent outline-none cursor-pointer"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-text-secondary h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-text-primary placeholder:text-text-secondary focus:border-accent outline-none font-sans"
            />
          </div>

          {/* Export center dropdown */}
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden bg-surface/30">
            <button
              onClick={handleExportPDF}
              className="p-2 hover:bg-surface/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              title="Print / Save PDF"
            >
              <Download size={13} />
            </button>
            <button
              onClick={handleExportMarkdown}
              className="p-2 border-l border-border hover:bg-surface/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              title="Download Markdown"
            >
              <Code size={13} />
            </button>
            <button
              onClick={handleShareLink}
              className="p-2 border-l border-border hover:bg-surface/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              title="Copy Share Link"
            >
              <Share2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER COLUMNS: The Vertical Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-[#161B22]/30 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {selectedYear === "All Time" ? "Your Entire GitHub Story" : `${selectedYear} Journey`}
              </h3>
              <span className="text-[10px] text-text-secondary font-mono">
                Showing {displayedMilestones.length} milestones
              </span>
            </div>

            {displayedMilestones.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <Info className="h-8 w-8 text-text-secondary mx-auto mb-2 opacity-50" />
                <p className="text-xs text-text-secondary font-sans">No matching milestones located on your journey.</p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border/60">
                
                {Object.entries(groupedMilestones).map(([groupTitle, list]) => (
                  <div key={groupTitle} className="space-y-4 relative">
                    
                    {/* Sticky view group header */}
                    <div className="sticky top-2 z-10 inline-block bg-background border border-border px-3 py-1 rounded-full text-[10px] font-bold text-accent shadow-sm">
                      {groupTitle}
                    </div>

                    <div className="space-y-4">
                      {list.map((m) => {
                        const isMatch =
                          searchQuery.trim() &&
                          (m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.description.toLowerCase().includes(searchQuery.toLowerCase()));

                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`relative group cursor-pointer ${
                              isMatch ? "ring-1 ring-accent rounded-xl" : ""
                            }`}
                            onClick={() => setSelectedMilestone(m)}
                          >
                            {/* Dot on line */}
                            <div className="absolute -left-6 sm:-left-8 top-3 h-4.5 w-4.5 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-accent transition-colors">
                              <div className="h-1.5 w-1.5 rounded-full bg-text-secondary group-hover:bg-accent" />
                            </div>

                            {/* Card content */}
                            <div className="border border-border/80 hover:border-accent/40 bg-[#161B22]/50 hover:bg-[#161B22]/90 rounded-xl p-4 transition-all flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-surface border border-border/60 text-text-secondary group-hover:text-accent transition-colors">
                                {getMilestoneIcon(m.iconName)}
                              </div>
                              <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                                    {m.title}
                                  </h4>
                                  <span className="text-[10px] text-text-secondary">
                                    {formatTimelineDate(m.date)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
                                  {m.description}
                                </p>
                              </div>
                              <ChevronRight
                                size={14}
                                className="text-text-secondary group-hover:text-text-primary self-center"
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Language Flow, Graphs, Achievements */}
        <div className="space-y-6">

          {/* 1. Virtual Stats Console (visible in replay mode or always) */}
          <div className="rounded-xl border border-border bg-[#161B22]/80 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Activity size={14} className="text-accent" /> Journey Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2 rounded border border-border/40 bg-surface/20">
                <span className="text-[9px] text-text-secondary uppercase">Repositories</span>
                <div className="text-sm font-bold text-text-primary mt-0.5">{currentStats.repos}</div>
              </div>
              <div className="p-2 rounded border border-border/40 bg-surface/20">
                <span className="text-[9px] text-text-secondary uppercase">Contributions</span>
                <div className="text-sm font-bold text-text-primary mt-0.5">{currentStats.contributions}</div>
              </div>
              <div className="p-2 rounded border border-border/40 bg-surface/20">
                <span className="text-[9px] text-text-secondary uppercase">Languages</span>
                <div className="text-sm font-bold text-text-primary mt-0.5">{currentStats.languagesCount}</div>
              </div>
              <div className="p-2 rounded border border-border/40 bg-surface/20">
                <span className="text-[9px] text-text-secondary uppercase">Streak</span>
                <div className="text-sm font-bold text-text-primary mt-0.5">{currentStats.streak} days</div>
              </div>
            </div>
          </div>

          {/* 2. Language Evolution Flow */}
          <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Cpu size={14} className="text-pink-400" /> Language Evolution
            </h3>
            <p className="text-[10px] text-text-secondary font-sans leading-relaxed">
              Timeline showing when new technologies were adopted in your public repositories.
            </p>

            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {langEvolution.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-pink-400" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{item.language}</span>
                      <span className="text-[9px] text-text-secondary bg-surface border border-border px-1.5 py-0.2 rounded font-mono">
                        {item.year}
                      </span>
                    </div>
                    <p className="text-[9px] text-text-secondary font-sans">Adopted in "{item.repoName}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Growth Graphs */}
          <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Star size={14} className="text-amber-400" /> Growth Trends
            </h3>
            
            {growthTimeline.length === 0 ? (
              <p className="text-[10px] text-text-secondary text-center py-4">Growth chart data unavailable.</p>
            ) : (
              <div className="space-y-4">
                {/* Cumulative Repo scaling */}
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary">Repository Accumulation</span>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthTimeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRepos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2F81F7" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2F81F7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tickFormatter={(str) => str.substring(2, 7)} tick={{ fontSize: 9, fill: "#8B949E" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#8B949E" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#161B22", border: "1px solid #30363D", fontSize: 10 }} />
                        <Area type="monotone" dataKey="repos" stroke="#2F81F7" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRepos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cumulative Contributions */}
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary">Contribution Growth</span>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthTimeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorContribs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2ea44f" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2ea44f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tickFormatter={(str) => str.substring(2, 7)} tick={{ fontSize: 9, fill: "#8B949E" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#8B949E" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#161B22", border: "1px solid #30363D", fontSize: 10 }} />
                        <Area type="monotone" dataKey="contributions" stroke="#2ea44f" strokeWidth={1.5} fillOpacity={1} fill="url(#colorContribs)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Achievement Drawer */}
          <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Award size={14} className="text-orange-400" /> Career Achievements
            </h3>

            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                    ach.unlocked
                      ? "border-border/60 bg-surface/30"
                      : "border-border/20 bg-[#161B22]/10 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg border ${ach.unlocked ? "bg-background border-border" : "border-transparent bg-transparent"}`}>
                      {ach.unlocked ? ach.icon : <Lock className="h-4 w-4 text-text-secondary" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-primary flex items-center gap-2">
                        <span>{ach.title}</span>
                        <span className={`text-[8px] font-mono border px-1 rounded-sm ${ach.rarityColor}`}>
                          {ach.rarity}
                        </span>
                      </div>
                      <span className="text-[9px] text-text-secondary block font-sans mt-0.5">
                        {ach.unlocked ? ach.unlockText : `Progress: ${ach.progress} / ${ach.target}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED SIDE DRAWER PANEL */}
      <AnimatePresence>
        {selectedMilestone && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMilestone(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sidebar drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0D1117] border-l border-border shadow-2xl z-50 p-6 overflow-y-auto space-y-6"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    {getMilestoneIcon(selectedMilestone.iconName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{selectedMilestone.title}</h3>
                    <span className="text-[10px] text-text-secondary font-mono">
                      {formatTimelineDate(selectedMilestone.date)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Milestone Details content */}
              <div className="space-y-4 text-xs">
                {/* Meta details list */}
                <div className="space-y-3 bg-[#161B22]/50 p-4 rounded-xl border border-border/60">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Timeline Data Audit
                  </h4>
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div>
                      <span className="text-[9px] text-text-secondary uppercase">Milestone Type</span>
                      <p className="text-text-primary uppercase mt-0.5 text-[10px]">
                        {selectedMilestone.type.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-secondary uppercase">Precision Date</span>
                      <p className="text-text-primary mt-0.5">{selectedMilestone.details.exactDate}</p>
                    </div>
                    {selectedMilestone.details.repoName && (
                      <div className="col-span-2">
                        <span className="text-[9px] text-text-secondary uppercase">Associated Repository</span>
                        <p className="text-accent mt-0.5 font-bold hover:underline">
                          {selectedMilestone.details.repoName}
                        </p>
                      </div>
                    )}
                    {selectedMilestone.details.language && (
                      <div>
                        <span className="text-[9px] text-text-secondary uppercase">Primary Language</span>
                        <p className="text-text-primary mt-0.5">{selectedMilestone.details.language}</p>
                      </div>
                    )}
                    {selectedMilestone.details.contributionCount && (
                      <div>
                        <span className="text-[9px] text-text-secondary uppercase">Magnitude</span>
                        <p className="text-text-primary mt-0.5 font-bold">
                          {selectedMilestone.details.contributionCount}
                        </p>
                      </div>
                    )}
                    {selectedMilestone.details.starsCount && (
                      <div>
                        <span className="text-[9px] text-text-secondary uppercase">Repository Stars</span>
                        <p className="text-text-primary mt-0.5 font-bold">
                          ★ {selectedMilestone.details.starsCount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Explanation narrative */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                    <Cpu size={12} className="text-accent" /> AI Impact Analysis
                  </h4>
                  <p className="text-text-secondary font-sans leading-relaxed bg-surface/20 border border-border p-4 rounded-xl">
                    {selectedMilestone.details.aiExplanation}
                  </p>
                </div>
              </div>

              {/* Close button footer */}
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 bg-surface hover:bg-surface-secondary border border-border text-xs text-text-primary rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
