"use client";

import { useState, useEffect, useMemo } from "react";
import { UserDashboardData, GitHubRepository, LanguageStat } from "@/types";
import { formatNumber, calculateAccountAge } from "@/lib/utils";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import {
  ChevronUp,
  ChevronDown,
  Sparkles,
  Award,
  GitCommit,
  GitPullRequest,
  Star,
  Users,
  Clock,
  Zap,
  LayoutGrid,
  Code,
  Server,
  Cpu,
  Wrench,
  Smartphone,
  Database,
  Cloud
} from "lucide-react";
import ContributionHeatmap from "./ContributionHeatmap";
import DashboardCustomizer, { WidgetConfig } from "./DashboardCustomizer";
import AchievementsSection from "./AchievementsSection";
import DeveloperMilestones from "./DeveloperMilestones";
import ActivityTimeline from "./ActivityTimeline";
import CountUp from "../ui/CountUp";
import ProjectShowcase from "./ProjectShowcase";
import DeveloperBattleModal from "@/components/card/DeveloperBattleModal";

interface OverviewTabProps {
  data: UserDashboardData;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const { profile, contributions, score, languages, repositories } = data;
  const [showWhyGrade, setShowWhyGrade] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);
  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>({});
  const [starredCharts, setStarredCharts] = useState<string[]>([]);

  // Load layout and collapsed state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("devtrack_collapsed_widgets");
      if (savedCollapsed) {
        try {
          setCollapsedWidgets(JSON.parse(savedCollapsed));
        } catch (e) {}
      }

      const loadStarred = () => {
        const savedStarred = localStorage.getItem("devtrack_starred_charts");
        if (savedStarred) {
          try {
            setStarredCharts(JSON.parse(savedStarred));
          } catch (e) {}
        } else {
          setStarredCharts([]);
        }
      };

      loadStarred();
      window.addEventListener("starred_charts_updated", loadStarred);
      return () => window.removeEventListener("starred_charts_updated", loadStarred);
    }
  }, []);

  const isWidgetVisible = (id: string) => {
    if (widgetConfigs.length === 0) return true;
    const item = widgetConfigs.find((w) => w.id === id);
    return item ? item.visible : true;
  };

  const isWidgetCollapsed = (id: string) => {
    return !!collapsedWidgets[id];
  };

  const toggleWidgetCollapse = (id: string) => {
    const updated = { ...collapsedWidgets, [id]: !collapsedWidgets[id] };
    setCollapsedWidgets(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_collapsed_widgets", JSON.stringify(updated));
    }
  };

  // 1. Calculate Smart Profile Insights
  const profileInsights = useMemo(() => {
    // Strongest skill (highest language percentage)
    const sortedLangs = [...languages].sort((a, b) => b.bytes - a.bytes);
    const strongestSkill = sortedLangs[0] ? `${sortedLangs[0].name} (${sortedLangs[0].percentage}% of stack)` : "Markdown";

    // Most maintained repository (highest stars + forks)
    const sortedRepos = [...repositories].sort((a, b) => (b.stargazers_count + b.forks_count * 2) - (a.stargazers_count + a.forks_count * 2));
    const mostMaintained = sortedRepos[0] ? sortedRepos[0].name : "None";

    // Most productive month
    const monthlyMap: Record<string, number> = {};
    if (contributions.dailyContributions) {
      Object.entries(contributions.dailyContributions).forEach(([dateStr, count]) => {
        const monthKey = dateStr.substring(0, 7); // YYYY-MM
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + count;
      });
    }
    const sortedMonths = Object.entries(monthlyMap).sort((a, b) => b[1] - a[1]);
    let mostProductiveMonth = "None";
    if (sortedMonths[0]) {
      const [year, mStr] = sortedMonths[0][0].split("-");
      const date = new Date(Number(year), Number(mStr) - 1, 1);
      mostProductiveMonth = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    // Open source impact
    const openSourceImpact = contributions.totalPRs > 10 ? "High (Active Collaborator)" : (contributions.totalPRs > 2 ? "Moderate" : "Low");

    // Suggested next milestone
    const totalContribs = contributions.totalCommits + contributions.totalPRs + contributions.totalIssues;
    const nextGoal = totalContribs < 100 ? 100 : (totalContribs < 500 ? 500 : 1000);
    const suggestedMilestone = `Fulfill ${nextGoal} total contributions (currently at ${totalContribs})`;

    return {
      strongestSkill,
      mostMaintained,
      mostProductiveMonth,
      openSourceImpact,
      suggestedMilestone
    };
  }, [languages, repositories, contributions]);

  const getGradeStyle = (gradeStr: string, isAvail: boolean) => {
    if (!isAvail || gradeStr === "Grade unavailable") {
      return { color: "text-[#8B949E]", stroke: "#8B949E", label: "Grade Unavailable" };
    }
    if (gradeStr === "S" || gradeStr === "A+") return { color: "text-[#3FB950]", stroke: "#3FB950", label: `Grade ${gradeStr}` };
    if (gradeStr === "A" || gradeStr === "B+") return { color: "text-[#58A6FF]", stroke: "#58A6FF", label: `Grade ${gradeStr}` };
    if (gradeStr === "B" || gradeStr === "C+") return { color: "text-[#D29922]", stroke: "#D29922", label: `Grade ${gradeStr}` };
    return { color: "text-[#F85149]", stroke: "#F85149", label: `Grade ${gradeStr}` };
  };

  const gradeStyle = getGradeStyle(score.grade || "D", score.isAvailable ?? true);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score.isAvailable ? score.overall : 0) / 100) * circumference;

  const totalContribs = contributions.totalCommits + contributions.totalPRs + contributions.totalIssues;

  // Starred Charts Rendering logic
  const renderStarredChart = (chartId: string) => {
    if (chartId === "tech_radar") {
      const topLanguages = [...languages].sort((a, b) => b.bytes - a.bytes).slice(0, 6);
      const radarData = topLanguages.map(l => ({ subject: l.name, A: l.percentage }));
      return (
        <div key={chartId} className="p-4 bg-background/50 rounded-xl border border-border flex flex-col items-center">
          <span className="text-[10px] text-text-secondary uppercase font-bold block mb-2 self-start">Technology Radar Profile</span>
          <div className="h-44 w-full text-[8px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#30363D" />
                <PolarAngleAxis dataKey="subject" stroke="#8B949E" />
                <Radar name="Proficiency" dataKey="A" stroke="#58A6FF" fill="#1F6FEB" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartId === "lang_volume") {
      const topLanguages = [...languages].sort((a, b) => b.bytes - a.bytes).slice(0, 6);
      return (
        <div key={chartId} className="p-4 bg-background/50 rounded-xl border border-border flex flex-col items-center">
          <span className="text-[10px] text-text-secondary uppercase font-bold block mb-2 self-start">Ecosystem Volume</span>
          <div className="h-44 w-full text-[8px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLanguages} layout="vertical" margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis type="number" stroke="#8B949E" />
                <YAxis dataKey="name" type="category" stroke="#8B949E" width={60} />
                <Bar dataKey="percentage" fill="#3FB950" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartId === "ecosystem_seg") {
      // Inline simplified segmentation values
      return (
        <div key={chartId} className="p-4 bg-background/50 rounded-xl border border-border flex flex-col justify-between">
          <span className="text-[10px] text-text-secondary uppercase font-bold block mb-2">Ecosystem Segmentation</span>
          <div className="space-y-2 py-4">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Frontend</span>
              <span className="text-text-primary font-bold">58%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#58A6FF]" style={{ width: "58%" }} />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Backend</span>
              <span className="text-text-primary font-bold">32%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#bc8cff]" style={{ width: "32%" }} />
            </div>
          </div>
        </div>
      );
    }

    if (chartId === "hourly_activity") {
      // Mock hourly distribution
      const hourlyData = [
        { hr: "09:00", count: 12 }, { hr: "12:00", count: 28 }, { hr: "15:00", count: 32 }, { hr: "18:00", count: 15 }, { hr: "21:00", count: 48 }, { hr: "00:00", count: 22 }
      ];
      return (
        <div key={chartId} className="p-4 bg-background/50 rounded-xl border border-border flex flex-col items-center">
          <span className="text-[10px] text-text-secondary uppercase font-bold block mb-2 self-start">Hourly Activity distribution</span>
          <div className="h-44 w-full text-[8px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="hr" stroke="#8B949E" />
                <YAxis stroke="#8B949E" />
                <Bar dataKey="count" fill="#2F81F7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartId === "weekday_density") {
      const days = [
        { day: "Sun", count: 12 }, { day: "Mon", count: 42 }, { day: "Tue", count: 56 }, { day: "Wed", count: 68 }, { day: "Thu", count: 45 }, { day: "Fri", count: 38 }, { day: "Sat", count: 18 }
      ];
      return (
        <div key={chartId} className="p-4 bg-background/50 rounded-xl border border-border flex flex-col items-center">
          <span className="text-[10px] text-text-secondary uppercase font-bold block mb-2 self-start">Weekday Commit Density</span>
          <div className="h-44 w-full text-[8px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="day" stroke="#8B949E" />
                <YAxis stroke="#8B949E" />
                <Bar dataKey="count" fill="#3FB950" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartId === "monthly_trend") {
      const months = [
        { month: "Jan", count: 42 }, { month: "Feb", count: 38 }, { month: "Mar", count: 85 }, { month: "Apr", count: 52 }, { month: "May", count: 91 }, { month: "Jun", count: 110 }
      ];
      return (
        <div key={chartId} className="p-4 bg-background/50 rounded-xl border border-border flex flex-col items-center">
          <span className="text-[10px] text-text-secondary uppercase font-bold block mb-2 self-start">Monthly Activity Trend</span>
          <div className="h-44 w-full text-[8px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={months} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="month" stroke="#8B949E" />
                <YAxis stroke="#8B949E" />
                <Area type="monotone" dataKey="count" stroke="#58A6FF" fill="#1F6FEB" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Customizer Bar */}
      <DashboardCustomizer onLayoutChange={setWidgetConfigs} />

      {/* 3-Column Hero Section (Developer Command Center) */}
      {isWidgetVisible("command_center") && (
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <span className="text-xs font-bold text-text-primary font-space-grotesk">Profile Command Center</span>
            <button
              onClick={() => toggleWidgetCollapse("command_center")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("command_center") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {!isWidgetCollapsed("command_center") && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Column: Profile Details */}
              <div className="lg:col-span-5 flex gap-4 items-start border-b lg:border-b-0 lg:border-r border-[#30363D] pb-6 lg:pb-0 lg:pr-6">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || profile.login}
                    className="h-16 w-16 rounded-full border border-[#30363D] object-cover bg-[#1C2128]"
                  />
                )}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="text-lg font-bold font-space-grotesk text-[#F0F6FC] truncate">
                      {profile.name || profile.login}
                    </h2>
                    <span className="text-[10px] text-[#8B949E] font-mono">
                      @{profile.login}
                    </span>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-xs text-[#8B949E] leading-relaxed max-w-sm line-clamp-3">
                      {profile.bio}
                    </p>
                  )}

                  <div className="space-y-1.5 pt-2 text-[11px] text-[#8B949E]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {profile.location && (
                        <div className="flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Joined {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Developer Grade */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#30363D] pb-6 lg:pb-0">
                <div className="relative flex items-center justify-center h-32 w-32">
                  <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="stroke-[#30363D]"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke={gradeStyle.stroke}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <span className={`text-3xl font-black font-space-grotesk tracking-tight ${gradeStyle.color}`}>
                      {score.isAvailable ? score.grade : "N/A"}
                    </span>
                    {score.isAvailable && (
                      <div className="text-[10px] font-mono text-[#8B949E] font-bold">
                        <CountUp end={score.overall} /> / 100
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <button
                    onClick={() => setShowWhyGrade(!showWhyGrade)}
                    className="text-[10px] font-mono text-[#58A6FF] hover:underline cursor-pointer"
                  >
                    {showWhyGrade ? "Hide breakdown ▲" : "Why this grade? ▼"}
                  </button>
                  <button
                    onClick={() => setBattleModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-[10px] font-mono font-bold hover:bg-accent hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Sparkles size={11} />
                    <span>View Card & Battle</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Key Metric Grid */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                  <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Contributions</div>
                  <div className="text-base font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                    <CountUp end={totalContribs} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                  <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Stars Earned</div>
                  <div className="text-base font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                    <CountUp end={contributions.totalStarsEarned} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                  <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Public Repos</div>
                  <div className="text-base font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                    <CountUp end={profile.public_repos} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                  <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Commit Velocity</div>
                  <div className="text-base font-bold font-space-grotesk text-[#3FB950] mt-1">
                    High
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. AI Smart Profile Insights Widget */}
      {isWidgetVisible("profile_insights") && (
        <div className="rounded-xl border border-border bg-[#161B22]/65 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
              <span>AI Profile Insights Summary</span>
            </h3>
            <button
              onClick={() => toggleWidgetCollapse("profile_insights")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("profile_insights") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {!isWidgetCollapsed("profile_insights") && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-background/50 rounded-lg border border-border">
                <span className="text-[10px] text-text-secondary uppercase block">Strongest Skill</span>
                <span className="font-bold text-text-primary mt-1 block truncate" title={profileInsights.strongestSkill}>
                  {profileInsights.strongestSkill}
                </span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border">
                <span className="text-[10px] text-text-secondary uppercase block">Maintained Repo</span>
                <span className="font-bold text-[#58A6FF] mt-1 block truncate" title={profileInsights.mostMaintained}>
                  {profileInsights.mostMaintained}
                </span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border">
                <span className="text-[10px] text-text-secondary uppercase block">Peak Month</span>
                <span className="font-bold text-text-primary mt-1 block truncate">
                  {profileInsights.mostProductiveMonth}
                </span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border">
                <span className="text-[10px] text-text-secondary uppercase block">Open Source Impact</span>
                <span className="font-bold text-emerald-400 mt-1 block truncate">
                  {profileInsights.openSourceImpact}
                </span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border md:col-span-2 lg:col-span-1">
                <span className="text-[10px] text-text-secondary uppercase block">Suggested Milestone</span>
                <span className="font-bold text-text-primary mt-1 block truncate" title={profileInsights.suggestedMilestone}>
                  {profileInsights.suggestedMilestone}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Project Highlights Showcase Widget */}
      {isWidgetVisible("project_showcase") && (
        <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <LayoutGrid size={16} className="text-accent" />
              <span>Project Highlights Showcase</span>
            </h3>
            <button
              onClick={() => toggleWidgetCollapse("project_showcase")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("project_showcase") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {!isWidgetCollapsed("project_showcase") && (
            <div className="pt-2">
              <ProjectShowcase repositories={repositories} />
            </div>
          )}
        </div>
      )}

      {/* 4. Starred Charts Hub Widget */}
      {isWidgetVisible("starred_charts") && (
        <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <Star size={16} className="text-amber-400 fill-amber-400/20" />
              <span>Favourited Charts Hub</span>
            </h3>
            <button
              onClick={() => toggleWidgetCollapse("starred_charts")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("starred_charts") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {!isWidgetCollapsed("starred_charts") && (
            <div className="pt-2">
              {starredCharts.length === 0 ? (
                <p className="text-xs text-text-secondary italic text-center py-8">
                  No favorited charts. Star charts inside the **Languages** or **Coding Calendar** tabs to pin them here!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {starredCharts.map(id => renderStarredChart(id))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Metric Grid (2 Rows of Stat Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Repositories</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            <CountUp end={profile.public_repos} />
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Public codebases indexed.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Commits</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            <CountUp end={contributions.totalCommits} />
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Pushes in public repositories.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Stars Earned</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            <CountUp end={contributions.totalStarsEarned} />
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Community stars accumulated.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#3FB950]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Current Streak</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#3FB950] mt-2">
            <CountUp end={contributions.currentStreak} /> Days
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Active consecutive commit days.</p>
        </div>
      </div>

      {/* Developer Achievements Widget */}
      {isWidgetVisible("achievements") && (
        <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <Award size={16} className="text-[#3FB950]" />
              <span>Developer Achievements</span>
            </h3>
            <button
              onClick={() => toggleWidgetCollapse("achievements")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("achievements") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
          {!isWidgetCollapsed("achievements") && <AchievementsSection data={data} />}
        </div>
      )}

      {/* Developer Milestones Widget */}
      {isWidgetVisible("milestones") && (
        <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <GitCommit size={16} className="text-[#58A6FF]" />
              <span>Developer Milestones Roadmap</span>
            </h3>
            <button
              onClick={() => toggleWidgetCollapse("milestones")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("milestones") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
          {!isWidgetCollapsed("milestones") && <DeveloperMilestones data={data} />}
        </div>
      )}

      {/* Activity Timeline Feed Widget */}
      {isWidgetVisible("activity_timeline") && (
        <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <Users size={16} className="text-sky-400" />
              <span>Recent Activity Feed</span>
            </h3>
            <button
              onClick={() => toggleWidgetCollapse("activity_timeline")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("activity_timeline") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
          {!isWidgetCollapsed("activity_timeline") && <ActivityTimeline data={data} />}
        </div>
      )}

      {/* Contribution Heatmap Matrix Widget */}
      {isWidgetVisible("heatmap") && (
        <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <Clock size={16} className="text-amber-400" />
              <span>Contribution Matrix Heatmap</span>
            </h3>
            <button
              onClick={() => toggleWidgetCollapse("heatmap")}
              className="text-[#8B949E] hover:text-text-primary p-1 cursor-pointer"
            >
              {isWidgetCollapsed("heatmap") ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
          {!isWidgetCollapsed("heatmap") && (
            <ContributionHeatmap dailyContributions={contributions.dailyContributions} />
          )}
        </div>
      )}

      <DeveloperBattleModal
        isOpen={battleModalOpen}
        onClose={() => setBattleModalOpen(false)}
        initialUsername={profile.login}
        isAuthenticated={true}
        onRequireAuth={() => {}}
      />
    </div>
  );
}
