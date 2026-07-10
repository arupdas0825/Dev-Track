"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Zap,
  GitBranch,
  Award,
  Target,
  BarChart2,
  Folder,
  Plus,
  Search,
  X,
  ChevronRight,
  TrendingUp,
  Sliders,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Play
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";

// Mock Sprint Burndown Data
const BURNDOWN_DATA = [
  { day: "Day 1", remaining: 80, ideal: 80 },
  { day: "Day 2", remaining: 75, ideal: 72 },
  { day: "Day 3", remaining: 68, ideal: 64 },
  { day: "Day 4", remaining: 62, ideal: 56 },
  { day: "Day 5", remaining: 50, ideal: 48 },
  { day: "Day 6", remaining: 42, ideal: 40 },
  { day: "Day 7", remaining: 35, ideal: 32 },
  { day: "Day 8", remaining: 28, ideal: 24 },
  { day: "Day 9", remaining: 18, ideal: 16 },
  { day: "Day 10", remaining: 5, ideal: 8 },
  { day: "Day 11", remaining: 0, ideal: 0 }
];

// Mock Velocity History
const VELOCITY_DATA = [
  { sprint: "Sprint 12", completed: 68 },
  { sprint: "Sprint 13", completed: 72 },
  { sprint: "Sprint 14", completed: 80 },
  { sprint: "Sprint 15", completed: 78 },
  { sprint: "Sprint 16", completed: 89 }
];

// Skills radar data
const SKILLS_DATA = [
  { subject: "Frontend", A: 90, fullMark: 100 },
  { subject: "Backend", A: 85, fullMark: 100 },
  { subject: "DevOps", A: 70, fullMark: 100 },
  { subject: "Security", A: 80, fullMark: 100 },
  { subject: "Docs", A: 95, fullMark: 100 },
  { subject: "Testing", A: 75, fullMark: 100 }
];

// Mock Teams
const MOCK_TEAMS = [
  {
    id: "team-1",
    name: "Frontend Guild",
    desc: "React/Next.js dashboard engineering group",
    leadName: "Sarah K.",
    leadAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    membersCount: 12,
    velocity: 89,
    velocityTrend: "up",
    repoCount: 8,
    healthScore: 94,
    sprintProgress: 88,
    avgGrade: "A+",
    color: "#2F81F7"
  },
  {
    id: "team-2",
    name: "Backend Core",
    desc: "High performance microservices & storage engines",
    leadName: "Alex M.",
    leadAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    membersCount: 8,
    velocity: 94,
    velocityTrend: "up",
    repoCount: 14,
    healthScore: 91,
    sprintProgress: 95,
    avgGrade: "S",
    color: "#3FB950"
  },
  {
    id: "team-3",
    name: "DevOps & Infra",
    desc: "Terraform cloud automation and monitoring",
    leadName: "Jordan R.",
    leadAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    membersCount: 5,
    velocity: 78,
    velocityTrend: "stable",
    repoCount: 6,
    healthScore: 88,
    sprintProgress: 64,
    avgGrade: "A",
    color: "#8957E5"
  },
  {
    id: "team-4",
    name: "AI/ML Squad",
    desc: "Training models & predictive recommendation systems",
    leadName: "Priya S.",
    leadAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    membersCount: 7,
    velocity: 91,
    velocityTrend: "up",
    repoCount: 4,
    healthScore: 96,
    sprintProgress: 82,
    avgGrade: "S",
    color: "#F85149"
  },
  {
    id: "team-5",
    name: "Mobile Team",
    desc: "React Native developer experience tools",
    leadName: "Chris L.",
    leadAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    membersCount: 6,
    velocity: 85,
    velocityTrend: "down",
    repoCount: 3,
    healthScore: 82,
    sprintProgress: 70,
    avgGrade: "B+",
    color: "#D29922"
  },
  {
    id: "team-6",
    name: "Design Systems",
    desc: "Reusable dark-ui design libraries and guides",
    leadName: "Emma W.",
    leadAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    membersCount: 4,
    velocity: 72,
    velocityTrend: "stable",
    repoCount: 2,
    healthScore: 95,
    sprintProgress: 100,
    avgGrade: "A",
    color: "#00C7B7"
  }
];

export default function TeamsPanel() {
  const [teams, setTeams] = useState(MOCK_TEAMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<typeof MOCK_TEAMS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "analytics">("overview");

  // Create team form
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newTeamColor, setNewTeamColor] = useState("#2F81F7");

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;

    const newTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      desc: newTeamDesc || "Workspace group task force.",
      leadName: "Current User",
      leadAvatar: "",
      membersCount: 1,
      velocity: 75,
      velocityTrend: "stable" as const,
      repoCount: 0,
      healthScore: 100,
      sprintProgress: 0,
      avgGrade: "A",
      color: newTeamColor
    };

    setTeams([...teams, newTeam]);
    setCreateModalOpen(false);
    setNewTeamName("");
    setNewTeamDesc("");
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Teams
            <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-0.5 rounded-full text-[#8B949E]">
              {teams.length} Total
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Cross-repository group workspaces, sprint trackers, and velocity mapping</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          <Plus size={14} />
          Create Team
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            placeholder="Search teams by title, lead name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#8957E5]"
          />
        </div>
      </div>

      {/* Main Grid View */}
      <AnimatePresence mode="wait">
        {!selectedTeam ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col justify-between relative overflow-hidden group transition-all"
                style={{ borderLeft: `3px solid ${team.color}` }}
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#F0F6FC]">{team.name}</h3>
                      <p className="text-[10px] text-[#8B949E] mt-1 line-clamp-2">{team.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                      Grade: {team.avgGrade}
                    </span>
                  </div>

                  {/* Team Members stacked */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#30363D]/40">
                    <div className="flex items-center">
                      {team.leadAvatar ? (
                        <img src={team.leadAvatar} alt={team.leadName} className="w-6 h-6 rounded-full border border-[#30363D]" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-accent/20 text-accent border border-[#30363D] flex items-center justify-center text-[10px] font-bold">
                          {team.leadName.charAt(0)}
                        </div>
                      )}
                      <span className="text-[10px] text-[#8B949E] ml-2 font-semibold">Lead: {team.leadName}</span>
                    </div>

                    <div className="ml-auto text-[10px] text-[#8B949E] flex items-center gap-1">
                      <Users size={12} />
                      <span>{team.membersCount} devs</span>
                    </div>
                  </div>

                  {/* Sprint Velocity meter */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#8B949E]">Velocity Score</span>
                      <span className="text-[#F0F6FC] font-semibold">{team.velocity} SP / Sprint</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#8B949E]">Linked Repositories</span>
                      <span className="text-[#F0F6FC] font-semibold">{team.repoCount}</span>
                    </div>
                    <div className="flex justify-between text-[10px] items-center">
                      <span className="text-[#8B949E]">Current Sprint Done</span>
                      <span className="text-[#3FB950] font-bold">{team.sprintProgress}%</span>
                    </div>
                    <div className="h-1 bg-[#21262D] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#3FB950]" style={{ width: `${team.sprintProgress}%` }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTeam(team)}
                  className="w-full mt-6 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[10px] font-bold text-[#F0F6FC] flex items-center justify-center gap-1 transition-all"
                >
                  View Workspace Details
                  <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        ) : (
          /* ── DETAIL WORKSPACE PANEL ── */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden"
          >
            {/* Header Banner */}
            <div className="p-6 border-b border-[#30363D] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderLeft: `6px solid ${selectedTeam.color}` }}>
              <div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-xs text-[#8B949E] hover:text-[#F0F6FC] mb-2 flex items-center gap-1.5"
                >
                  ← Back to Teams
                </button>
                <h3 className="text-lg font-bold text-[#F0F6FC]">{selectedTeam.name}</h3>
                <p className="text-xs text-[#8B949E] mt-0.5">{selectedTeam.desc}</p>
              </div>

              <div className="flex gap-2">
                <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-1 rounded text-[#8B949E]">
                  Avg Velocity: <strong className="text-white">{selectedTeam.velocity} SP</strong>
                </span>
                <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-1 rounded text-[#3FB950]">
                  Health: <strong className="text-[#3FB950]">{selectedTeam.healthScore}%</strong>
                </span>
              </div>
            </div>

            {/* Inner Sub tabs */}
            <div className="flex border-b border-[#30363D] bg-[#21262D]/20 text-xs px-6 py-2 gap-4">
              {[
                { id: "overview", label: "Team Members" },
                { id: "metrics", label: "Sprint Metrics" },
                { id: "analytics", label: "Analytics Radar" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-1 px-3 rounded font-bold ${
                    activeTab === tab.id
                      ? "bg-[#21262D] text-white border border-[#30363D]"
                      : "text-[#8B949E] hover:text-[#F0F6FC]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Tab: Overview */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-accent">Active Roster</h4>
                    <div className="space-y-3">
                      {[
                        { name: "Sarah K.", role: "Lead", grade: "S", commits: 245 },
                        { name: "Alex M.", role: "Developer", grade: "A+", commits: 189 },
                        { name: "Priya S.", role: "Developer", grade: "S", commits: 310 },
                        { name: "Sofia B.", role: "Developer", grade: "A-", commits: 92 }
                      ].map((dev, i) => (
                        <div key={i} className="flex justify-between items-center bg-[#0D1117] border border-[#30363D] p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#30363D] flex items-center justify-center font-bold">{dev.name.charAt(0)}</div>
                            <div>
                              <span className="font-bold text-[#F0F6FC]">{dev.name}</span>
                              <span className="text-[10px] text-[#8B949E] block">{dev.role}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#F0F6FC]">{dev.commits} Commits</span>
                            <span className="text-[9px] text-[#3FB950] block">Grade: {dev.grade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Repos */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-accent">Monitored Repositories</h4>
                    <div className="space-y-3">
                      {[
                        { name: "acme-api-gateway", health: 96, prs: 14 },
                        { name: "core-dashboard-ui", health: 91, prs: 8 },
                        { name: "docker-orchestration", health: 88, prs: 2 }
                      ].map((repo, i) => (
                        <div key={i} className="bg-[#0D1117] border border-[#30363D] p-3 rounded-lg flex justify-between items-center">
                          <span className="font-bold text-[#F0F6FC] flex items-center gap-1.5">
                            <Folder size={14} className="text-[#8B949E]" /> {repo.name}
                          </span>
                          <span className="text-[10px] text-[#8B949E]">{repo.prs} Open PRs</span>
                          <span className="text-[#3FB950] font-bold">{repo.health}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Sprint Metrics */}
              {activeTab === "metrics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Burndown Chart */}
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
                      <h4 className="text-xs font-bold text-[#8B949E] mb-3 uppercase font-mono">Current Sprint Burndown Chart (SP remaining)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={BURNDOWN_DATA}>
                            <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                            <XAxis dataKey="day" stroke="#8B949E" fontSize={9} />
                            <YAxis stroke="#8B949E" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                            <Area type="monotone" dataKey="remaining" stroke="#2F81F7" fill="#2F81F7" fillOpacity={0.1} name="Actual" />
                            <Area type="monotone" dataKey="ideal" stroke="#8B949E" fill="#8B949E" fillOpacity={0.05} name="Ideal" strokeDasharray="5 5" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Velocity History Chart */}
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
                      <h4 className="text-xs font-bold text-[#8B949E] mb-3 uppercase font-mono">Velocity Track Record (Sprint Completed Story Points)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={VELOCITY_DATA}>
                            <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                            <XAxis dataKey="sprint" stroke="#8B949E" fontSize={9} />
                            <YAxis stroke="#8B949E" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                            <Bar dataKey="completed" fill="#8957E5" radius={[4, 4, 0, 0]} name="Story Points Done" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Analytics Radar */}
              {activeTab === "analytics" && (
                <div className="flex flex-col items-center justify-center p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
                  <h4 className="text-xs font-bold text-[#8B949E] mb-4 uppercase font-mono">Team Core Skill Distribution Map</h4>
                  <div className="w-full max-w-sm h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILLS_DATA}>
                        <PolarGrid stroke="#30363D" />
                        <PolarAngleAxis dataKey="subject" stroke="#8B949E" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#30363D" fontSize={8} />
                        <Radar name="Acme Core Skills" dataKey="A" stroke="#2F81F7" fill="#2F81F7" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CREATE TEAM MODAL ── */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg hover:bg-[#21262D]"
              >
                <X size={16} />
              </button>

              <div className="p-6 border-b border-[#30363D]">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Users size={18} className="text-[#8957E5]" /> Create Workspace Team
                </h3>
                <p className="text-xs text-[#8B949E] mt-1">Spin up an internal developer group workspace.</p>
              </div>

              <form onSubmit={handleCreateTeam} className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SRE Platform Engineers"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E]/70 focus:outline-none focus:border-[#8957E5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Description</label>
                  <textarea
                    placeholder="Brief task context of the team"
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#8957E5]"
                  />
                </div>

                {/* Team Tag Color presets */}
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Team Indicator Color</label>
                  <div className="flex gap-3 mt-1 items-center">
                    {["#2F81F7", "#3FB950", "#8957E5", "#F85149", "#D29922", "#00C7B7"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTeamColor(color)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          newTeamColor === color ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#30363D]">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#30363D] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white font-semibold active:scale-95 transition-all"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
