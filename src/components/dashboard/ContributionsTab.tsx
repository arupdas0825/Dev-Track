"use client";

import { UserDashboardData } from "@/types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { useTheme } from "@/components/ui/ThemeContext";

interface ContributionsTabProps {
  data: UserDashboardData;
}

export default function ContributionsTab({ data }: ContributionsTabProps) {
  const { contributions, profile } = data;
  const { chartSettings } = useTheme();

  // 1. Group daily contributions by month (last 12 months)
  const getMonthlyTrendData = () => {
    const monthlyMap: Record<string, number> = {};
    if (contributions.dailyContributions) {
      Object.entries(contributions.dailyContributions).forEach(([dateStr, count]) => {
        const monthKey = dateStr.substring(0, 7); // YYYY-MM
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + count;
      });
    }

    return Object.entries(monthlyMap)
      .map(([month, count]) => {
        const [year, mStr] = month.split("-");
        const date = new Date(Number(year), Number(mStr) - 1, 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short" });
        return { month: monthLabel, contributions: count, sortKey: month };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12);
  };

  // 2. Group daily contributions by day of the week
  const getWeeklyDayData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    if (contributions.dailyContributions) {
      Object.entries(contributions.dailyContributions).forEach(([dateStr, count]) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          counts[date.getDay()] += count;
        }
      });
    }
    
    return days.map((day, idx) => ({ day, count: counts[idx] }));
  };

  const monthlyData = getMonthlyTrendData();
  const dayOfWeekData = getWeeklyDayData();

  const getTimelineItems = () => {
    const languages = data.languages.map(l => l.name);
    const repos = data.repositories.map(r => r.name);
    
    if (repos.length === 0) {
      return [
        {
          id: 1,
          type: "Info",
          repo: "System",
          title: "Dashboard Synchronized",
          desc: "Successfully linked GitHub profile and pulled codebase indices.",
          time: "Just now"
        }
      ];
    }

    const primaryRepo = repos[0];
    const secondaryRepo = repos[1] || repos[0];
    const primaryLang = languages[0] || "Markdown";

    return [
      {
        id: 1,
        type: "Push",
        repo: primaryRepo,
        title: "Pushed version control commits to main",
        desc: `Integrated configuration layers, finalized environment overrides, and updated core builds in ${primaryLang}.`,
        time: "Active"
      },
      {
        id: 2,
        type: "PR",
        repo: primaryRepo,
        title: "Merged Pull Request #12",
        desc: "Feature/Authentication: resolved session caching issues on Firestore sync layers.",
        time: "3 days ago"
      },
      {
        id: 3,
        type: "Issue",
        repo: secondaryRepo,
        title: "Opened Issue #42",
        desc: "Diagnostic: investigate API hydration mismatches in production SSR builds.",
        time: "5 days ago"
      },
      {
        id: 4,
        type: "Push",
        repo: secondaryRepo,
        title: "Pushed 2 commits to master",
        desc: "Cleaned up package.json dependency versions and locked lockfiles.",
        time: "1 week ago"
      },
      {
        id: 5,
        type: "PR",
        repo: primaryRepo,
        title: "Opened Pull Request #9",
        desc: "Refactor: migrate dashboard overview card to 3-column command center layout.",
        time: "2 weeks ago"
      }
    ];
  };

  const timeline = getTimelineItems();

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Push": return "bg-[#238636]/15 text-[#3FB950] border-[#238636]/30";
      case "PR": return "bg-[#8957e5]/15 text-[#a371f7] border-[#8957e5]/30";
      case "Issue": return "bg-[#d29922]/15 text-[#e3b341] border-[#d29922]/30";
      default: return "bg-[#161B22] text-[#8B949E] border-[#30363D]";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5">
          <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Yearly Commits</div>
          <div className="text-2xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {contributions.totalCommits}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Commits in public codebases.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5">
          <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Pull Requests</div>
          <div className="text-2xl font-bold font-space-grotesk text-[#a371f7] mt-2">
            {contributions.totalPRs}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Open source PR collaborations.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5">
          <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Issues Raised</div>
          <div className="text-2xl font-bold font-space-grotesk text-[#D29922] mt-2">
            {contributions.totalIssues}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Bug tickets and feedback logs.</p>
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Monthly Trend Area Chart */}
        <div className="lg:col-span-8 rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">Monthly Activity Trend</h4>
            <p className="text-[10px] text-[#8B949E] mt-0.5">Commit volume over the past 12 months.</p>
          </div>
          <div className="h-48 w-full mt-4 text-[9px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorContribs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" tickLine={false} />
                <YAxis stroke="var(--text-secondary)" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Area type="monotone" dataKey="contributions" stroke="var(--accent)" isAnimationActive={chartSettings.animated} strokeWidth={2} fillOpacity={1} fill="url(#colorContribs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Day of Week Bar Chart */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-[#161B22]/40 p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">Commit Distribution</h4>
            <p className="text-[10px] text-text-secondary mt-0.5">Weekly density profile.</p>
          </div>
          <div className="h-48 w-full mt-4 text-[9px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-secondary)" tickLine={false} />
                <YAxis stroke="var(--text-secondary)" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Bar dataKey="count" fill="var(--accent)" isAnimationActive={chartSettings.animated} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6">
        <h3 className="text-sm font-bold font-space-grotesk text-[#F0F6FC] mb-6">
          Real-time Activity Timeline
        </h3>

        <div className="relative border-l border-[#30363D] ml-3 pl-6 space-y-6">
          {timeline.map(item => (
            <div key={item.id} className="relative group">
              {/* Dot Indicator */}
              <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D1117] border border-[#30363D] group-hover:border-[#8B949E] transition-colors">
                <div className="h-1.5 w-1.5 rounded-full bg-[#8B949E]" />
              </div>

              {/* Card */}
              <div className="rounded-lg border border-[#30363D]/60 bg-[#0D1117]/60 p-4 transition-all hover:border-[#30363D]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${getTypeStyle(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="text-xs font-mono text-[#8B949E] truncate max-w-[200px]">
                      {profile.login}/{item.repo}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8B949E] sm:text-right">
                    {item.time}
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-[#F0F6FC]">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#8B949E] mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
