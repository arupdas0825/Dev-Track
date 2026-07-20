"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  Building2,
  Users,
  FolderGit2,
  Activity,
  Cpu,
  HardDrive,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  GitBranch,
  GitPullRequest,
  Star,
  GitFork,
  Key,
  UserPlus,
  Upload,
  Bell,
  Globe,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface EnterprisePanelProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

// ─── Animated Counter Hook ──────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1800, delay = 0) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, delay]);

  return count;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const velocityData = [
  { week: "W1", planned: 42, actual: 38 },
  { week: "W2", planned: 48, actual: 51 },
  { week: "W3", planned: 45, actual: 44 },
  { week: "W4", planned: 55, actual: 49 },
  { week: "W5", planned: 60, actual: 63 },
  { week: "W6", planned: 58, actual: 57 },
  { week: "W7", planned: 65, actual: 70 },
  { week: "W8", planned: 70, actual: 68 },
];

const radialData = [
  { name: "Health Score", value: 87, fill: "url(#healthGrad)" },
];

const gradeData = [
  { grade: "S", count: 12, color: "#8957E5" },
  { grade: "A+", count: 45, color: "#2F81F7" },
  { grade: "A", count: 89, color: "#3FB950" },
  { grade: "B+", count: 134, color: "#58A6FF" },
  { grade: "B", count: 98, color: "#D29922" },
  { grade: "C", count: 34, color: "#F0883E" },
  { grade: "D", count: 8, color: "#F85149" },
];

const deploymentStatuses = [
  { name: "GitHub Actions", status: "operational", uptime: "99.98%", icon: "⚙️" },
  { name: "Vercel", status: "operational", uptime: "99.95%", icon: "▲" },
  { name: "Netlify", status: "operational", uptime: "99.91%", icon: "◆" },
  { name: "AWS CodeDeploy", status: "degraded", uptime: "98.42%", icon: "☁" },
  { name: "GCP Cloud Build", status: "operational", uptime: "99.87%", icon: "●" },
  { name: "Azure DevOps", status: "operational", uptime: "99.93%", icon: "◉" },
];

const ossRepos = [
  { name: "devtrack-core", stars: 4821, forks: 312, prs: 47, bar: 92 },
  { name: "dt-analytics-sdk", stars: 2134, forks: 189, prs: 31, bar: 74 },
  { name: "dt-cli", stars: 1876, forks: 94, prs: 22, bar: 61 },
  { name: "dt-ui-components", stars: 983, forks: 67, prs: 18, bar: 43 },
  { name: "enterprise-gateway", stars: 511, forks: 38, prs: 9, bar: 28 },
];

const healthBreakdown = [
  { label: "Code Quality", value: 91, color: "#3FB950" },
  { label: "Collaboration", value: 84, color: "#2F81F7" },
  { label: "Documentation", value: 79, color: "#D29922" },
  { label: "Security", value: 88, color: "#8957E5" },
];

const activityFeed = [
  {
    id: 1,
    type: "member_joined",
    label: "Member Joined",
    color: "#3FB950",
    icon: UserPlus,
    message: "sarah.chen@acme.io joined Acme Corp workspace",
    time: "2m ago",
  },
  {
    id: 2,
    type: "api_key",
    label: "API Key",
    color: "#8957E5",
    icon: Key,
    message: "New API key generated for devtrack-core integration",
    time: "7m ago",
  },
  {
    id: 3,
    type: "repo_sync",
    label: "Repo Synced",
    color: "#2F81F7",
    icon: RefreshCw,
    message: "enterprise-gateway synced — 234 new commits indexed",
    time: "14m ago",
  },
  {
    id: 4,
    type: "security_alert",
    label: "Security",
    color: "#F85149",
    icon: Shield,
    message: "CVE-2025-3812 flagged in 2 dependencies — auto-PR raised",
    time: "21m ago",
  },
  {
    id: 5,
    type: "deployment",
    label: "Deployed",
    color: "#3FB950",
    icon: Upload,
    message: "dt-analytics-sdk v3.2.1 deployed to production via Vercel",
    time: "35m ago",
  },
  {
    id: 6,
    type: "policy",
    label: "Policy",
    color: "#D29922",
    icon: Lock,
    message: "Branch protection rule updated for main branch in 12 repos",
    time: "48m ago",
  },
  {
    id: 7,
    type: "integration",
    label: "Integration",
    color: "#2F81F7",
    icon: Globe,
    message: "Slack webhook connected to #devtrack-alerts channel",
    time: "1h ago",
  },
  {
    id: 8,
    type: "milestone",
    label: "Milestone",
    color: "#8957E5",
    icon: Bell,
    message: "Q3 Sprint milestone 'Platform Stability' marked complete",
    time: "1h 22m ago",
  },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  rawValue,
  displaySuffix = "",
  trend,
  trendDir,
  delay,
  iconColor,
}: {
  icon: any;
  label: string;
  rawValue: number;
  displaySuffix?: string;
  trend: string;
  trendDir: "up" | "down" | "neutral";
  delay: number;
  iconColor: string;
}) {
  const count = useAnimatedCounter(rawValue, 1600, delay);

  const formattedCount =
    rawValue >= 1_000_000
      ? (count / 1_000_000).toFixed(1) + "M"
      : rawValue >= 1000
      ? count.toLocaleString()
      : count.toString();

  const trendColor =
    trendDir === "up"
      ? "text-[#3FB950]"
      : trendDir === "down"
      ? "text-[#F85149]"
      : "text-[#8B949E]";

  const TrendIcon =
    trendDir === "up"
      ? ArrowUpRight
      : trendDir === "down"
      ? ArrowDownRight
      : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="rounded-xl border border-[#30363D] bg-[#161B22] p-4 md:p-5 flex flex-col gap-3 hover:border-[#8957E5]/50 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}18` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}
        >
          <TrendIcon size={13} />
          {trend}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#F0F6FC] font-mono tracking-tight">
          {formattedCount}
          {displaySuffix}
        </p>
        <p className="text-xs text-[#8B949E] mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#30363D] bg-[#161B22] px-3 py-2 text-xs shadow-xl">
      <p className="text-[#8B949E] mb-1 font-mono">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EnterpriseDashboardPanel({}: EnterprisePanelProps) {
  const [syncTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  const [feedVisible, setFeedVisible] = useState(true);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8957E5] to-[#2F81F7] flex items-center justify-center shadow-lg shadow-[#8957E5]/20">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F0F6FC]">
              Enterprise Dashboard
            </h1>
            <p className="text-xs text-[#8B949E]">
              Last synced at{" "}
              <span className="text-[#2F81F7] font-mono">{syncTime}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-[#8957E5]/40 bg-gradient-to-r from-[#8957E5]/15 to-[#2F81F7]/15 text-[#c084fc]">
            🏢 Enterprise Intelligence Platform
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-[#3FB950]/10 border border-[#3FB950]/30 text-[#3FB950]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-pulse" />
            Live
          </span>
        </div>
      </motion.div>

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          icon={Building2}
          label="Organizations"
          rawValue={47}
          trend="↑12%"
          trendDir="up"
          delay={0.05}
          iconColor="#8957E5"
        />
        <StatCard
          icon={Users}
          label="Active Users"
          rawValue={2847}
          trend="↑8.3%"
          trendDir="up"
          delay={0.1}
          iconColor="#2F81F7"
        />
        <StatCard
          icon={FolderGit2}
          label="Repositories"
          rawValue={1204}
          trend="↑5.1%"
          trendDir="up"
          delay={0.15}
          iconColor="#3FB950"
        />
        <StatCard
          icon={Activity}
          label="Monthly Activity"
          rawValue={89432}
          trend="commits+PRs"
          trendDir="neutral"
          delay={0.2}
          iconColor="#D29922"
        />
        <StatCard
          icon={Cpu}
          label="API Requests / Mo"
          rawValue={4200000}
          trend="↑23%"
          trendDir="up"
          delay={0.25}
          iconColor="#58A6FF"
        />
        <StatCard
          icon={HardDrive}
          label="Storage Used"
          rawValue={847}
          displaySuffix=" GB"
          trend="stable"
          trendDir="neutral"
          delay={0.3}
          iconColor="#F0883E"
        />
      </div>

      {/* ── Second Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Developer Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F0F6FC]">
                Developer Health Score
              </h2>
              <p className="text-xs text-[#8B949E]">Aggregate org health</p>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#8957E5]/15 border border-[#8957E5]/30 text-[#c084fc]">
              Enterprise
            </span>
          </div>

          <div className="relative flex items-center justify-center" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="85%"
                startAngle={220}
                endAngle={-40}
                data={radialData}
              >
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8957E5" />
                    <stop offset="100%" stopColor="#2F81F7" />
                  </linearGradient>
                </defs>
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  background={{ fill: "#21262D" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-[#F0F6FC] font-mono">
                87
              </span>
              <span className="text-xs text-[#8B949E]">/ 100</span>
              <span className="text-[10px] text-[#3FB950] font-semibold mt-0.5">
                Excellent
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {healthBreakdown.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#8B949E]">{item.label}</span>
                  <span
                    className="text-xs font-bold font-mono"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#21262D] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.55 + i * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Velocity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F0F6FC]">
                Team Velocity
              </h2>
              <p className="text-xs text-[#8B949E]">Planned vs Actual — 8 weeks</p>
            </div>
            <TrendingUp size={16} className="text-[#2F81F7]" />
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={velocityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8957E5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8957E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F81F7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2F81F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: "#8B949E", fontSize: 11, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8B949E", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#8B949E", paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="planned"
                name="Planned"
                stroke="#8957E5"
                strokeWidth={2}
                fill="url(#plannedGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#8957E5", strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#2F81F7"
                strokeWidth={2}
                fill="url(#actualGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#2F81F7", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Deployment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.45 }}
          className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F0F6FC]">
                Deployment Status
              </h2>
              <p className="text-xs text-[#8B949E]">Integration health</p>
            </div>
            <Zap size={16} className="text-[#D29922]" />
          </div>

          <div className="flex flex-col gap-3">
            {deploymentStatuses.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      svc.status === "operational"
                        ? "bg-[#3FB950] shadow-[0_0_6px_#3FB950]"
                        : "bg-[#D29922] shadow-[0_0_6px_#D29922] animate-pulse"
                    }`}
                  />
                  <span className="text-sm text-[#F0F6FC] font-medium">
                    {svc.icon} {svc.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#8B949E]">
                    {svc.uptime}
                  </span>
                  {svc.status === "operational" ? (
                    <CheckCircle2 size={14} className="text-[#3FB950]" />
                  ) : (
                    <AlertTriangle size={14} className="text-[#D29922]" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-[#30363D] flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">5 of 6 operational</span>
            <span className="text-xs font-semibold text-[#3FB950]">
              SLA: 99.84%
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Third Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
          className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F0F6FC]">
                Developer Grade Distribution
              </h2>
              <p className="text-xs text-[#8B949E]">
                420 developers · Avg grade: A
              </p>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#2F81F7]/10 border border-[#2F81F7]/30 text-[#2F81F7]">
              Q3 2025
            </span>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={gradeData}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
              <XAxis
                dataKey="grade"
                tick={{ fill: "#8B949E", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8B949E", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="count" name="Developers" radius={[4, 4, 0, 0]}>
                {gradeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-2">
            {gradeData.map((g) => (
              <span
                key={g.grade}
                className="rounded-full px-2 py-0.5 text-xs font-bold font-mono"
                style={{
                  background: `${g.color}18`,
                  color: g.color,
                  border: `1px solid ${g.color}40`,
                }}
              >
                {g.grade}: {g.count}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Open Source Contributions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55 }}
          className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F0F6FC]">
                Open Source Contributions
              </h2>
              <p className="text-xs text-[#8B949E]">Top org repos · this month</p>
            </div>
            <GitBranch size={16} className="text-[#8957E5]" />
          </div>

          <div className="flex flex-col gap-3">
            {ossRepos.map((repo, i) => (
              <motion.div
                key={repo.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                className="flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-[#F0F6FC] font-medium">
                    {repo.name}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-[#8B949E]">
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-[#D29922]" />
                      {repo.stars.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={11} className="text-[#8B949E]" />
                      {repo.forks}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitPullRequest size={11} className="text-[#3FB950]" />
                      {repo.prs} PRs
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#21262D] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${repo.bar}%` }}
                    transition={{ duration: 0.75, delay: 0.65 + i * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#8957E5] to-[#2F81F7]"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-[#30363D] flex items-center justify-between text-xs text-[#8B949E]">
            <span>
              Total:{" "}
              <span className="text-[#F0F6FC] font-semibold">
                {ossRepos.reduce((s, r) => s + r.stars, 0).toLocaleString()} ⭐
              </span>
            </span>
            <span>
              PRs merged:{" "}
              <span className="text-[#3FB950] font-semibold">
                {ossRepos.reduce((s, r) => s + r.prs, 0)} this month
              </span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Live Activity Feed ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.6 }}
        className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse shadow-[0_0_6px_#3FB950]" />
            <h2 className="text-sm font-semibold text-[#F0F6FC]">
              Live Activity Feed
            </h2>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#3FB950]/10 border border-[#3FB950]/20 text-[#3FB950]">
              Real-time
            </span>
          </div>
          <button
            onClick={() => setFeedVisible((v) => !v)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#8B949E] border border-[#30363D] bg-[#21262D] hover:border-[#8957E5]/50 hover:text-[#F0F6FC] transition-all"
          >
            {feedVisible ? "Collapse" : "Expand"}
          </button>
        </div>

        <AnimatePresence>
          {feedVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col divide-y divide-[#21262D]">
                {activityFeed.map((event, i) => {
                  const IconComp = event.icon;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.055, duration: 0.3 }}
                      className="flex items-center gap-3 py-3 group hover:bg-[#21262D]/50 px-2 rounded-lg transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${event.color}18` }}
                      >
                        <IconComp size={15} style={{ color: event.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: `${event.color}18`,
                              color: event.color,
                              border: `1px solid ${event.color}30`,
                            }}
                          >
                            {event.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#8B949E] truncate">
                          {event.message}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#8B949E] font-mono flex-shrink-0 whitespace-nowrap">
                        {event.time}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-[#30363D] flex items-center justify-between">
                <span className="text-xs text-[#8B949E]">
                  Showing 8 of{" "}
                  <span className="text-[#F0F6FC] font-semibold">1,247</span>{" "}
                  events today
                </span>
                <button className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white hover:opacity-90 active:scale-95 transition-all">
                  View Full Log
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
