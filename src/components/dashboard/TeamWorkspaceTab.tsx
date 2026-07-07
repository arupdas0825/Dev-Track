"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  Users,
  Folder,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Settings,
  FileText,
  CheckCircle,
  Search,
  Grid,
  List,
  Star,
  GitFork,
  ChevronRight,
  Plus,
  Download,
  Sparkles,
  Play,
  Bell,
  Globe,
  Lock,
  AlertTriangle,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  GitPullRequest
} from "lucide-react";
import { GitHubOrganizationService, OrganizationDashboardData, OrganizationMember, OrganizationEvent, RepositoryHealth } from "@/services/github/github-organization.service";
import EmptyState from "@/components/ui/EmptyState";
import CountUp from "@/components/ui/CountUp";

interface TeamWorkspaceTabProps {
  activeSubTab: string;
  setActiveSubTab: (tabId: string) => void;
  githubToken?: string;
}

export default function TeamWorkspaceTab({
  activeSubTab,
  setActiveSubTab,
  githubToken
}: TeamWorkspaceTabProps) {
  const [connectedOrg, setConnectedOrg] = useState<string>("");
  const [orgInput, setOrgInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<OrganizationDashboardData | null>(null);

  // Members List states
  const [memberQuery, setMemberQuery] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");
  const [memberGradeFilter, setMemberGradeFilter] = useState("all");
  const [memberSortBy, setMemberSortBy] = useState("contributions");
  const [isListView, setIsListView] = useState(false);

  // Leaderboard state
  const [leaderboardMode, setLeaderboardMode] = useState<"contributions" | "streak" | "repos" | "followers">("contributions");

  // Load connected org from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrg = localStorage.getItem("devtrack_connected_org") || "";
      if (storedOrg) {
        setConnectedOrg(storedOrg);
        loadOrgData(storedOrg);
      }
    }
  }, []);

  const loadOrgData = async (orgName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await GitHubOrganizationService.fetchCompleteOrgData(orgName, githubToken);
      setOrgData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load organization data.");
      setOrgData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgInput.trim()) return;
    const cleanOrg = orgInput.trim().toLowerCase();
    setConnectedOrg(cleanOrg);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_connected_org", cleanOrg);
    }
    loadOrgData(cleanOrg);
  };

  const handleLoadDemo = () => {
    const demoOrg = "vercel";
    setConnectedOrg(demoOrg);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_connected_org", demoOrg);
    }
    loadOrgData(demoOrg);
  };

  const handleDisconnectOrg = () => {
    if (confirm("Disconnect from current team workspace? All settings will be reset.")) {
      setConnectedOrg("");
      setOrgData(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("devtrack_connected_org");
      }
    }
  };

  // ----------------------------------------------------
  // REPORT EXPORTER
  // ----------------------------------------------------
  const handleExportReport = (type: "json" | "csv" | "pdf", reportName: string) => {
    if (!orgData) return;

    if (type === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orgData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${orgData.profile.login}-${reportName}-report.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === "csv") {
      let csvContent = "data:text/csv;charset=utf-8,";
      if (reportName === "members") {
        csvContent += "Username,Role,Grade,Streak,Top Language,Contributions,Followers\n";
        orgData.members.forEach((m) => {
          csvContent += `"${m.login}","${m.role}","${m.grade}",${m.streak},"${m.topLanguage}",${m.contributionsCount},${m.followersCount}\n`;
        });
      } else {
        csvContent += "Repository Name,Health Score,Code Quality,Stars,Forks,Open Issues\n";
        orgData.healthScores.forEach((h) => {
          csvContent += `"${h.repoName}",${h.healthScore},${h.codeQuality},${h.stars},${h.forks},${h.openIssues}\n`;
        });
      }
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", encodeURI(csvContent));
      downloadAnchor.setAttribute("download", `${orgData.profile.login}-${reportName}-report.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === "pdf") {
      window.print();
    }
  };

  // ----------------------------------------------------
  // MEMBERS DIRECTORY FILTERING & SORTING
  // ----------------------------------------------------
  const filteredMembers = useMemo(() => {
    if (!orgData) return [];
    return orgData.members
      .filter((m) => {
        const matchesQuery =
          m.login.toLowerCase().includes(memberQuery.toLowerCase()) ||
          (m.name && m.name.toLowerCase().includes(memberQuery.toLowerCase()));
        const matchesRole = memberRoleFilter === "all" || m.role.toLowerCase() === memberRoleFilter.toLowerCase();
        const matchesGrade = memberGradeFilter === "all" || m.grade.toLowerCase() === memberGradeFilter.toLowerCase();
        return matchesQuery && matchesRole && matchesGrade;
      })
      .sort((a, b) => {
        if (memberSortBy === "contributions") return b.contributionsCount - a.contributionsCount;
        if (memberSortBy === "streak") return b.streak - a.streak;
        if (memberSortBy === "followers") return b.followersCount - a.followersCount;
        if (memberSortBy === "repos") return b.reposCount - a.reposCount;
        return 0;
      });
  }, [orgData, memberQuery, memberRoleFilter, memberGradeFilter, memberSortBy]);

  // ----------------------------------------------------
  // LEADERBOARD RANKING
  // ----------------------------------------------------
  const rankedMembers = useMemo(() => {
    if (!orgData) return [];
    return [...orgData.members].sort((a, b) => {
      if (leaderboardMode === "contributions") return b.contributionsCount - a.contributionsCount;
      if (leaderboardMode === "streak") return b.streak - a.streak;
      if (leaderboardMode === "repos") return b.reposCount - a.reposCount;
      if (leaderboardMode === "followers") return b.followersCount - a.followersCount;
      return 0;
    });
  }, [orgData, leaderboardMode]);

  // ----------------------------------------------------
  // HEATMAP DATA
  // ----------------------------------------------------
  const heatmapDays = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const intensity = Math.floor(Math.random() * 5); // 0 to 4
      arr.push({ date: d, intensity });
    }
    return arr;
  }, []);

  // LOADING STATE RENDER
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#8B949E] font-mono">
        <svg className="animate-spin h-10 w-10 text-[#2F81F7] mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Organization Workspace...</span>
      </div>
    );
  }

  // EMPTY STATE RENDER
  if (!connectedOrg || !orgData) {
    return (
      <div className="max-w-md mx-auto py-10 font-mono">
        <EmptyState
          title="No organization connected."
          description="Connect a GitHub organization to synchronize team statistics, repositories, member logs, sprint progress, and automated leaderboards."
          icon={<Users size={32} />}
        />
        <form onSubmit={handleConnectOrg} className="space-y-4 bg-[#161B22]/50 border border-[#30363D] rounded-xl p-6 mt-6">
          <div>
            <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
              GitHub Organization Username
            </label>
            <input
              type="text"
              placeholder="e.g. vercel, facebook, microsoft"
              value={orgInput}
              onChange={(e) => setOrgInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] text-xs font-semibold focus:border-[#2F81F7] focus:outline-none placeholder-[#484F58]"
            />
          </div>
          {error && <p className="text-xs text-[#F85149] font-bold">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#1F6FEB] hover:bg-[#2F81F7] px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer text-center"
            >
              Connect Organization
            </button>
            <button
              type="button"
              onClick={handleLoadDemo}
              className="rounded-lg border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] px-4 py-2 text-xs font-bold text-[#F0F6FC] transition-colors cursor-pointer"
            >
              Load Demo (Vercel)
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-PAGES RENDERING
  // ----------------------------------------------------

  // 1. TEAM OVERVIEW
  if (activeSubTab === "team-overview") {
    return (
      <div className="space-y-6 font-mono">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#30363D] pb-6">
          <div className="flex items-center gap-4">
            <img
              src={orgData.profile.avatar_url}
              alt={orgData.profile.name}
              className="w-14 h-14 rounded-xl border border-[#30363D] shadow-md bg-surface"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-space-grotesk text-[#F0F6FC]">{orgData.profile.name}</h2>
                <span className="px-2 py-0.5 rounded-full border border-[#30363D] bg-[#21262D] text-[9px] text-[#8B949E] font-bold">Connected</span>
              </div>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed max-w-xl">{orgData.profile.description}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnectOrg}
            className="rounded-lg border border-[#F85149]/40 hover:bg-[#F85149]/10 text-xs font-bold text-[#F85149] px-3.5 py-1.5 transition-all cursor-pointer"
          >
            Disconnect Org
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4">
            <span className="text-[10px] font-bold text-[#8B949E] uppercase">Total Members</span>
            <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-1">
              <CountUp end={orgData.members.length} />
            </div>
          </div>
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4">
            <span className="text-[10px] font-bold text-[#8B949E] uppercase">Repositories</span>
            <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-1">
              <CountUp end={orgData.profile.public_repos} />
            </div>
          </div>
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4">
            <span className="text-[10px] font-bold text-[#8B949E] uppercase">Total Stars</span>
            <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-1">
              <CountUp end={orgData.metrics.totalStars} />
            </div>
          </div>
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4">
            <span className="text-[10px] font-bold text-[#8B949E] uppercase">Sprint Tasks</span>
            <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-1 flex items-center gap-1.5">
              <span className="text-[#3FB950]"><CountUp end={orgData.metrics.completedTasks} /></span>
              <span className="text-[#8B949E] text-xs font-normal">/ <CountUp end={orgData.metrics.completedTasks + orgData.metrics.pendingTasks} /></span>
            </div>
          </div>
        </div>

        {/* Heatmap & Middle Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-[#3FB950]" /> Team Contribution Heatmap
            </h3>
            <div className="grid grid-cols-12 gap-1.5 pb-2">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  title={`Date: ${day.date.toDateString()}`}
                  className={`h-4.5 rounded-sm border border-transparent transition-colors ${
                    day.intensity === 0
                      ? "bg-[#161B22] border-[#21262D]"
                      : day.intensity === 1
                      ? "bg-[#0e4429]"
                      : day.intensity === 2
                      ? "bg-[#006d32]"
                      : day.intensity === 3
                      ? "bg-[#26a641]"
                      : "bg-[#39d353]"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
              <span>Last 12 weeks of engineering commits</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="w-2.5 h-2.5 bg-[#161B22] border border-[#21262D] rounded-sm" />
                <div className="w-2.5 h-2.5 bg-[#0e4429] rounded-sm" />
                <div className="w-2.5 h-2.5 bg-[#006d32] rounded-sm" />
                <div className="w-2.5 h-2.5 bg-[#26a641] rounded-sm" />
                <div className="w-2.5 h-2.5 bg-[#39d353] rounded-sm" />
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
              Sprint Velocity
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-[#8B949E] mb-1.5">
                  <span>Sprint Completion</span>
                  <span className="font-bold text-[#F0F6FC]">{orgData.metrics.sprintProgress}%</span>
                </div>
                <div className="w-full bg-[#21262D] rounded-full h-2">
                  <div
                    className="bg-[#2F81F7] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${orgData.metrics.sprintProgress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-2">
                <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-2.5">
                  <span className="text-[9px] text-[#8B949E] uppercase">Pull Requests</span>
                  <div className="text-sm font-bold text-[#F0F6FC] mt-0.5"><CountUp end={orgData.metrics.totalPRs} /></div>
                </div>
                <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-2.5">
                  <span className="text-[9px] text-[#8B949E] uppercase">Forks Closed</span>
                  <div className="text-sm font-bold text-[#F0F6FC] mt-0.5"><CountUp end={orgData.metrics.totalForks} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Languages Used & Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Languages */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
              Languages Used
            </h3>
            <div className="flex h-3 rounded-full overflow-hidden bg-[#21262D]">
              {orgData.languages.slice(0, 5).map((lang, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color || "#888888"
                  }}
                  title={`${lang.name}: ${lang.percentage}%`}
                />
              ))}
            </div>
            <div className="space-y-2 pt-1">
              {orgData.languages.slice(0, 5).map((lang, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color || "#888888" }} />
                    <span className="font-semibold text-[#F0F6FC]">{lang.name}</span>
                  </div>
                  <span className="text-[#8B949E]">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed widget */}
          <div className="lg:col-span-2 rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
                Recent Activity
              </h3>
              <button
                onClick={() => setActiveSubTab("team-activity")}
                className="text-[10px] text-[#2F81F7] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
              >
                View Full Feed <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {orgData.events.slice(0, 4).map((evt) => (
                <div key={evt.id} className="flex gap-3 text-xs pb-3 border-b border-[#30363D]/50 last:border-b-0 last:pb-0">
                  <img src={evt.actor.avatar_url} alt={evt.actor.login} className="w-6 h-6 rounded-full border border-[#30363D]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary">
                      <span className="font-bold">{evt.actor.login}</span>{" "}
                      <span className="text-text-secondary">
                        {evt.type === "PushEvent"
                          ? `pushed ${evt.payload?.commits?.length || 1} commit(s) to`
                          : evt.type === "PullRequestEvent"
                          ? `${evt.payload?.action} pull request in`
                          : evt.type === "IssuesEvent"
                          ? `${evt.payload?.action} issue in`
                          : "performed activity in"}
                      </span>{" "}
                      <span className="font-bold text-[#2F81F7]">{evt.repo.name.split("/")[1] || evt.repo.name}</span>
                    </p>
                    {evt.payload?.commits?.[0] && (
                      <p className="text-[11px] text-[#8B949E] truncate mt-0.5 font-mono italic">
                        "{evt.payload.commits[0].message}"
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-text-secondary whitespace-nowrap">
                    {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. MEMBER DIRECTORY
  if (activeSubTab === "team-members") {
    return (
      <div className="space-y-6 font-mono">
        {/* Controls Block */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#161B22]/30 border border-[#30363D] rounded-xl p-4">
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8B949E]" />
            <input
              type="text"
              placeholder="Search member logins..."
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2F81F7]"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
            <select
              value={memberRoleFilter}
              onChange={(e) => setMemberRoleFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-lg px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="maintainer">Maintainer</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
            <select
              value={memberGradeFilter}
              onChange={(e) => setMemberGradeFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-lg px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7] cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="principal">Principal</option>
            </select>
            <select
              value={memberSortBy}
              onChange={(e) => setMemberSortBy(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-lg px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7] cursor-pointer font-bold text-[#2F81F7]"
            >
              <option value="contributions">Sort by: Contributions</option>
              <option value="streak">Sort by: Streak</option>
              <option value="followers">Sort by: Followers</option>
              <option value="repos">Sort by: Repos</option>
            </select>
            <button
              onClick={() => setIsListView(!isListView)}
              className="p-2 border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] rounded-lg text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer transition-colors"
            >
              {isListView ? <Grid size={14} /> : <List size={14} />}
            </button>
          </div>
        </div>

        {/* Directory Grid/List */}
        {filteredMembers.length === 0 ? (
          <EmptyState
            title="No matching members found"
            description="Adjust filters or query variables to locate members."
            icon={<Users size={24} />}
          />
        ) : isListView ? (
          /* List View */
          <div className="border border-[#30363D] rounded-xl overflow-hidden bg-[#161B22]/10 divide-y divide-[#30363D]">
            {filteredMembers.map((m) => (
              <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3 hover:bg-[#161B22]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={m.avatar_url} alt={m.login} className="w-10 h-10 rounded-lg border border-[#30363D]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#F0F6FC]">{m.name || m.login}</h4>
                    <span className="text-[10px] text-[#8B949E]">@{m.login}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2 py-0.5 rounded border border-[#30363D] bg-[#21262D] text-[9px] text-[#8B949E] font-bold uppercase">{m.role}</span>
                  <span className="px-2 py-0.5 rounded border border-[#2F81F7]/30 bg-[#2F81F7]/10 text-[9px] text-[#2F81F7] font-bold">{m.grade}</span>
                  <span className="px-2 py-0.5 rounded border border-[#3FB950]/30 bg-[#3FB950]/10 text-[9px] text-[#3FB950] font-bold">🔥 {m.streak}d Streak</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#F0F6FC]">{m.contributionsCount} commits</span>
                  <p className="text-[10px] text-[#8B949E] mt-0.5">{m.topLanguage} expert</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((m) => (
              <motion.div
                key={m.id}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 space-y-4 hover:border-[#2F81F7]/40 hover:bg-[#161B22]/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-[#30363D]/50 pb-3">
                    <img src={m.avatar_url} alt={m.login} className="w-11 h-11 rounded-lg border border-[#30363D]" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#F0F6FC] truncate">{m.name || m.login}</h4>
                      <p className="text-[10px] text-[#8B949E] truncate">@{m.login}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#21262D] border border-[#30363D] text-[9px] text-[#8B949E] font-bold uppercase">{m.role}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#2F81F7]/10 border border-[#2F81F7]/20 text-[9px] text-[#2F81F7] font-bold">{m.grade}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#3FB950]/10 border border-[#3FB950]/20 text-[9px] text-[#3FB950] font-bold">🔥 {m.streak}d</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1.5 text-[10px] text-[#8B949E]">
                    <div className="border border-[#30363D] bg-[#0D1117]/50 rounded p-1.5">
                      <span>Commits</span>
                      <div className="text-xs font-bold text-[#F0F6FC] mt-0.5">{m.contributionsCount}</div>
                    </div>
                    <div className="border border-[#30363D] bg-[#0D1117]/50 rounded p-1.5">
                      <span>Followers</span>
                      <div className="text-xs font-bold text-[#F0F6FC] mt-0.5">{m.followersCount}</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#30363D]/50 pt-3 mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-[#8B949E] font-semibold">Language: <span className="text-[#F0F6FC]">{m.topLanguage}</span></span>
                  <a
                    href={m.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2F81F7] hover:underline flex items-center gap-0.5 font-bold"
                  >
                    GitHub <ChevronRight size={10} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. ORGANIZATION ANALYTICS
  if (activeSubTab === "team-analytics") {
    // Generate some chart data
    const commitsData = orgData.members.map((m) => ({
      name: m.login,
      commits: m.contributionsCount,
      followers: m.followersCount
    }));

    const weeklyActivityData = [
      { name: "Mon", commits: 24, prs: 6, issues: 4 },
      { name: "Tue", commits: 38, prs: 12, issues: 8 },
      { name: "Wed", commits: 45, prs: 15, issues: 9 },
      { name: "Thu", commits: 40, prs: 10, issues: 5 },
      { name: "Fri", commits: 32, prs: 8, issues: 6 },
      { name: "Sat", commits: 12, prs: 2, issues: 1 },
      { name: "Sun", commits: 8, prs: 1, issues: 2 }
    ];

    const growthTrends = [
      { name: "Jan", lines: 12000, contributors: 4 },
      { name: "Feb", lines: 18000, contributors: 5 },
      { name: "Mar", lines: 25000, contributors: 5 },
      { name: "Apr", lines: 35000, contributors: 6 },
      { name: "May", lines: 52000, contributors: 7 },
      { name: "Jun", lines: 68000, contributors: 7 }
    ];

    return (
      <div className="space-y-6 font-mono">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commits Distribution */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
              Contribution Distribution (Commits)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commitsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                  <XAxis dataKey="name" stroke="#8B949E" fontSize={9} />
                  <YAxis stroke="#8B949E" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }}
                    labelStyle={{ color: "#F0F6FC", fontWeight: "bold" }}
                  />
                  <Bar dataKey="commits" fill="#2F81F7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Activity Timeline */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
              Weekly Engineering Velocity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityData}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F81F7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2F81F7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                  <XAxis dataKey="name" stroke="#8B949E" fontSize={9} />
                  <YAxis stroke="#8B949E" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                  <Area type="monotone" dataKey="commits" stroke="#2F81F7" fillOpacity={1} fill="url(#colorCommits)" />
                  <Area type="monotone" dataKey="prs" stroke="#3FB950" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Growth Trends and Lines of Code */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
            Lines of Code & Contributor Growth Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                <XAxis dataKey="name" stroke="#8B949E" fontSize={9} />
                <YAxis stroke="#8B949E" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                <Line type="monotone" dataKey="lines" stroke="#3FB950" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="contributors" stroke="#D29922" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // 4. REPOSITORIES
  if (activeSubTab === "team-repos") {
    return (
      <div className="space-y-6 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgData.healthScores.map((h, idx) => {
            const repo = orgData.repositories.find((r) => r.name === h.repoName);
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 hover:border-[#2F81F7]/40 hover:bg-[#161B22]/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F6FC] hover:text-[#2F81F7] transition-colors">
                        <a href={repo?.html_url} target="_blank" rel="noreferrer">
                          {h.repoName}
                        </a>
                      </h4>
                      <p className="text-xs text-[#8B949E] mt-1 line-clamp-2 leading-relaxed">
                        {repo?.description || "No description provided."}
                      </p>
                    </div>
                    {/* Health Score Badge */}
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        h.healthScore > 80
                          ? "bg-[#3FB950]/10 border-[#3FB950]/30 text-[#3FB950]"
                          : h.healthScore > 60
                          ? "bg-[#D29922]/10 border-[#D29922]/30 text-[#D29922]"
                          : "bg-[#F85149]/10 border-[#F85149]/30 text-[#F85149]"
                      }`}>
                        {h.healthScore} Health
                      </span>
                    </div>
                  </div>

                  {/* Ratings Bar Grid */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-[10px] text-[#8B949E]">
                    <div>
                      <span>Documentation</span>
                      <div className="w-full bg-[#21262D] rounded-full h-1.5 mt-1">
                        <div className="bg-[#3FB950] h-1.5 rounded-full" style={{ width: `${h.documentationScore}%` }} />
                      </div>
                    </div>
                    <div>
                      <span>Code Quality</span>
                      <div className="w-full bg-[#21262D] rounded-full h-1.5 mt-1">
                        <div className="bg-[#2F81F7] h-1.5 rounded-full" style={{ width: `${h.codeQuality}%` }} />
                      </div>
                    </div>
                    <div>
                      <span>Community Activity</span>
                      <div className="w-full bg-[#21262D] rounded-full h-1.5 mt-1">
                        <div className="bg-[#D29922] h-1.5 rounded-full" style={{ width: `${h.communityActivity}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#30363D]/50 pt-3 mt-4 flex items-center justify-between text-[11px] text-[#8B949E]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star size={12} /> {h.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} /> {h.forks}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={12} /> {h.openIssues}
                    </span>
                  </div>
                  <span>{repo?.language || "Universal"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 5. TEAM LEADERBOARD
  if (activeSubTab === "team-leaderboard") {
    return (
      <div className="space-y-6 font-mono">
        {/* Toggle Mode headers */}
        <div className="flex border-b border-[#30363D]">
          {(["contributions", "streak", "repos", "followers"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setLeaderboardMode(mode)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 capitalize transition-all cursor-pointer ${
                leaderboardMode === mode
                  ? "border-[#2F81F7] text-[#F0F6FC]"
                  : "border-transparent text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              {mode === "contributions"
                ? "Top Contributors"
                : mode === "streak"
                ? "Longest Streak"
                : mode === "repos"
                ? "Most Repos"
                : "Most Followers"}
            </button>
          ))}
        </div>

        {/* Top 3 Medals Display */}
        <div className="grid grid-cols-3 gap-4 text-center items-end py-4 max-w-xl mx-auto">
          {/* Silver - 2nd place */}
          {rankedMembers[1] && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4 space-y-2.5 flex flex-col items-center">
              <span className="text-2xl">🥈</span>
              <img src={rankedMembers[1].avatar_url} alt="2nd" className="w-10 h-10 rounded-full border border-border" />
              <div className="min-w-0 w-full">
                <div className="text-xs font-bold text-[#F0F6FC] truncate">{rankedMembers[1].name || rankedMembers[1].login}</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">
                  {leaderboardMode === "contributions"
                    ? `${rankedMembers[1].contributionsCount} commits`
                    : leaderboardMode === "streak"
                    ? `${rankedMembers[1].streak} days`
                    : leaderboardMode === "repos"
                    ? `${rankedMembers[1].reposCount} repos`
                    : `${rankedMembers[1].followersCount} followers`}
                </div>
              </div>
            </div>
          )}

          {/* Gold - 1st place */}
          {rankedMembers[0] && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/50 p-5 space-y-3 flex flex-col items-center relative -top-3 shadow-lg shadow-yellow-500/5">
              <span className="text-3xl">🥇</span>
              <img src={rankedMembers[0].avatar_url} alt="1st" className="w-12 h-12 rounded-full border-2 border-yellow-500" />
              <div className="min-w-0 w-full">
                <div className="text-xs font-bold text-yellow-500 truncate">{rankedMembers[0].name || rankedMembers[0].login}</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">
                  {leaderboardMode === "contributions"
                    ? `${rankedMembers[0].contributionsCount} commits`
                    : leaderboardMode === "streak"
                    ? `${rankedMembers[0].streak} days`
                    : leaderboardMode === "repos"
                    ? `${rankedMembers[0].reposCount} repos`
                    : `${rankedMembers[0].followersCount} followers`}
                </div>
              </div>
            </div>
          )}

          {/* Bronze - 3rd place */}
          {rankedMembers[2] && (
            <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4 space-y-2.5 flex flex-col items-center">
              <span className="text-2xl">🥉</span>
              <img src={rankedMembers[2].avatar_url} alt="3rd" className="w-10 h-10 rounded-full border border-border" />
              <div className="min-w-0 w-full">
                <div className="text-xs font-bold text-[#F0F6FC] truncate">{rankedMembers[2].name || rankedMembers[2].login}</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">
                  {leaderboardMode === "contributions"
                    ? `${rankedMembers[2].contributionsCount} commits`
                    : leaderboardMode === "streak"
                    ? `${rankedMembers[2].streak} days`
                    : leaderboardMode === "repos"
                    ? `${rankedMembers[2].reposCount} repos`
                    : `${rankedMembers[2].followersCount} followers`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rows for others */}
        <div className="border border-[#30363D] rounded-xl overflow-hidden bg-[#161B22]/10 divide-y divide-[#30363D]">
          {rankedMembers.map((m, idx) => (
            <div key={m.id} className="flex items-center justify-between p-4 hover:bg-[#161B22]/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <span className="text-xs font-bold text-[#8B949E] w-6 text-center">#{idx + 1}</span>
                <img src={m.avatar_url} alt={m.login} className="w-7 h-7 rounded-full border border-[#30363D]" />
                <span className="text-xs font-bold text-[#F0F6FC]">{m.name || m.login}</span>
              </div>
              <div className="text-right text-xs font-bold text-[#F0F6FC]">
                {leaderboardMode === "contributions"
                  ? `${m.contributionsCount} Commits`
                  : leaderboardMode === "streak"
                  ? `${m.streak} Days`
                  : leaderboardMode === "repos"
                  ? `${m.reposCount} Repos`
                  : `${m.followersCount} Followers`}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. SPRINT DASHBOARD
  if (activeSubTab === "team-sprint") {
    const weeklyGoalProgress = 82;
    return (
      <div className="space-y-6 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
              Sprint Completion
            </h3>
            <div className="relative h-28 flex items-center justify-center">
              {/* Radial placeholder */}
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F0F6FC]">{orgData.metrics.sprintProgress}%</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">Sprint Progress</div>
              </div>
            </div>
            <div className="w-full bg-[#21262D] rounded-full h-2">
              <div className="bg-[#3FB950] h-2 rounded-full" style={{ width: `${orgData.metrics.sprintProgress}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
              Task Breakdown
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8B949E]">Completed Tasks</span>
                <span className="font-bold text-[#3FB950]">{orgData.metrics.completedTasks}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8B949E]">Pending Tasks</span>
                <span className="font-bold text-[#D29922]">{orgData.metrics.pendingTasks}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#8B949E]">PR Reviews Pending</span>
                <span className="font-bold text-[#2F81F7]">{Math.round(orgData.metrics.pendingTasks * 0.4)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
              Weekly Progress Goal
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] text-[#8B949E] mb-1.5">
                  <span>Weekly Goal (80 commits)</span>
                  <span className="font-bold text-[#F0F6FC]">{weeklyGoalProgress}%</span>
                </div>
                <div className="w-full bg-[#21262D] rounded-full h-1.5">
                  <div className="bg-[#2F81F7] h-1.5 rounded-full" style={{ width: `${weeklyGoalProgress}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[#8B949E] mb-1.5">
                  <span>Daily Goal (12 commits)</span>
                  <span className="font-bold text-[#F0F6FC]">90%</span>
                </div>
                <div className="w-full bg-[#21262D] rounded-full h-1.5">
                  <div className="bg-[#3FB950] h-1.5 rounded-full" style={{ width: `90%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PR Review queue card list */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
            <GitPullRequest size={14} className="text-[#2F81F7]" /> PR Review Queue
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#30363D]/40">
              <div>
                <div className="font-bold text-[#F0F6FC]">feat: migrate auth backend to custom serverless endpoints</div>
                <p className="text-[10px] text-[#8B949E] mt-0.5">Author: Tim Neutkens · Repo: dev-track</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#D29922]/10 border border-[#D29922]/20 text-[#D29922] font-bold text-[10px]">Needs Review</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-[#F0F6FC]">fix: prevent memory leaks in radial chart re-rendering</div>
                <p className="text-[10px] text-[#8B949E] mt-0.5">Author: Paco Coursey · Repo: design-tokens</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#F85149]/10 border border-[#F85149]/20 text-[#F85149] font-bold text-[10px]">Blocking</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. LIVE ACTIVITY FEED
  if (activeSubTab === "team-activity") {
    return (
      <div className="space-y-6 font-mono">
        <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
          Workspace Event Timeline
        </h3>
        <div className="relative pl-6 border-l border-[#30363D] space-y-6 ml-3">
          {orgData.events.map((evt, idx) => (
            <div key={evt.id} className="relative">
              {/* Event node badge */}
              <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full border-2 border-[#30363D] bg-[#0D1117] flex items-center justify-center text-[8px]">
                {idx + 1}
              </div>
              <div className="bg-[#161B22]/30 border border-[#30363D] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={evt.actor.avatar_url} alt={evt.actor.login} className="w-5 h-5 rounded-full" />
                    <span className="font-bold text-[#F0F6FC]">{evt.actor.login}</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E]">
                    {new Date(evt.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#8B949E]">
                  Triggered <span className="font-mono text-[#F0F6FC] font-semibold">{evt.type}</span> in repository{" "}
                  <span className="text-[#2F81F7] font-bold">{evt.repo.name}</span>
                </p>
                {evt.payload?.commits && (
                  <div className="bg-[#0D1117]/50 rounded-lg p-2.5 mt-2 space-y-1 font-mono text-[11px] border border-border/50 text-[#8B949E]">
                    {evt.payload.commits.map((c: any, cIdx: number) => (
                      <div key={cIdx} className="truncate">
                        <span className="text-[#2F81F7] font-semibold">{c.sha.slice(0, 7)}</span> - {c.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. TEAM INSIGHTS
  if (activeSubTab === "team-insights") {
    const sortedContributors = [...orgData.members].sort((a, b) => b.contributionsCount - a.contributionsCount);
    const sortedStreaks = [...orgData.members].sort((a, b) => b.streak - a.streak);
    const sortedRepos = [...orgData.healthScores].sort((a, b) => a.healthScore - b.healthScore);

    return (
      <div className="space-y-6 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3FB950] uppercase tracking-wider">
              <Sparkles size={14} /> Team Performance Insights
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-[#8B949E]">
              <p>
                🥇 <span className="font-bold text-[#F0F6FC]">{sortedContributors[0]?.name || sortedContributors[0]?.login}</span> is the most active developer in the workspace, contributing <span className="text-[#2F81F7] font-semibold">{sortedContributors[0]?.contributionsCount} commits</span>.
              </p>
              <p>
                🔥 <span className="font-bold text-[#F0F6FC]">{sortedStreaks[0]?.name || sortedStreaks[0]?.login}</span> is the most consistent builder, maintaining a <span className="text-[#3FB950] font-semibold">{sortedStreaks[0]?.streak}-day streak</span>.
              </p>
              {sortedRepos[0] && (
                <p>
                  ⚠️ <span className="font-bold text-[#F0F6FC]">{sortedRepos[0].repoName}</span> needs review (health score: {sortedRepos[0].healthScore}). Open issues: {sortedRepos[0].openIssues}.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2F81F7] uppercase tracking-wider">
              <Shield size={14} /> Organization Health Metrics
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-[#8B949E]">
              <p>
                ✓ Average repo health score is <span className="text-[#F0F6FC] font-semibold">
                  {Math.round(orgData.healthScores.reduce((a, b) => a + b.healthScore, 0) / orgData.healthScores.length)}%
                </span>.
              </p>
              <p>
                ✓ High average documentation coverage: <span className="text-[#F0F6FC] font-semibold">
                  {Math.round(orgData.healthScores.reduce((a, b) => a + b.documentationScore, 0) / orgData.healthScores.length)}%
                </span>.
              </p>
              <p>
                ✓ Coding languages diversity is healthy with <span className="text-[#F0F6FC] font-semibold">{orgData.languages.length} unique stacks</span> tracked.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9. TEAM REPORTS
  if (activeSubTab === "team-reports") {
    return (
      <div className="space-y-6 font-mono">
        <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
          Downloadable Workspace Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-bold text-[#F0F6FC]">Member Contribution Report</h4>
              <p className="text-[10px] text-[#8B949E] mt-1">Export complete details of active member grades, streaks, roles, and commit statistics.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportReport("csv", "members")}
                className="flex-1 rounded bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] py-1.5 text-[10px] font-bold text-[#F0F6FC] cursor-pointer text-center"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportReport("json", "members")}
                className="flex-1 rounded bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] py-1.5 text-[10px] font-bold text-[#F0F6FC] cursor-pointer text-center"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-bold text-[#F0F6FC]">Repository Health & Quality Audit</h4>
              <p className="text-[10px] text-[#8B949E] mt-1">Export quality grades, stars, forks, and code validation parameters for all org repositories.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportReport("csv", "repos")}
                className="flex-1 rounded bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] py-1.5 text-[10px] font-bold text-[#F0F6FC] cursor-pointer text-center"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportReport("json", "repos")}
                className="flex-1 rounded bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] py-1.5 text-[10px] font-bold text-[#F0F6FC] cursor-pointer text-center"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleExportReport("pdf", "full")}
          className="rounded-lg bg-[#2F81F7] hover:bg-[#2F81F7]/80 text-white font-bold text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <Download size={14} /> Download PDF Overview Report
        </button>
      </div>
    );
  }

  // 10. TEAM SETTINGS
  if (activeSubTab === "team-settings") {
    return (
      <div className="space-y-6 font-mono">
        <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
          Workspace Settings & Configuration
        </h3>
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5 space-y-4 max-w-xl">
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
                Workspace Display Name
              </label>
              <input
                type="text"
                defaultValue={orgData.profile.name}
                className="w-full px-3 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] text-xs font-semibold focus:border-[#2F81F7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
                Workspace Logo URL
              </label>
              <input
                type="text"
                defaultValue={orgData.profile.avatar_url}
                className="w-full px-3 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] text-xs font-semibold focus:border-[#2F81F7] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
                  Timezone
                </label>
                <select className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7] cursor-pointer">
                  <option value="UTC">UTC / GMT</option>
                  <option value="EST">EST (Eastern Time)</option>
                  <option value="PST">PST (Pacific Time)</option>
                  <option value="IST">IST (Indian Standard Time)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
                  Privacy Level
                </label>
                <select className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7] cursor-pointer">
                  <option value="private">Private (Team Members Only)</option>
                  <option value="internal">Internal (Org Members Only)</option>
                  <option value="public">Public (Open Source)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#30363D]/50 mt-4 flex items-center justify-between">
            <button
              onClick={() => alert("Settings saved successfully!")}
              className="rounded-lg bg-[#1F6FEB] hover:bg-[#2F81F7] text-white font-bold text-xs px-4 py-2 cursor-pointer"
            >
              Save Configuration
            </button>
            <button
              onClick={handleDisconnectOrg}
              className="rounded-lg border border-[#F85149]/40 hover:bg-[#F85149]/10 text-xs font-bold text-[#F85149] px-3.5 py-1.5 transition-all cursor-pointer"
            >
              Disconnect Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
