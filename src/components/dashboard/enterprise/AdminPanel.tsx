"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Settings,
  Flag,
  Activity,
  Server,
  Users,
  Key,
  Database,
  Cpu,
  Zap,
  Sliders,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Clock,
  Play
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Operational status data
const STATUS_DATA = [
  { name: "00:00", ms: 45 },
  { name: "04:00", ms: 60 },
  { name: "08:00", ms: 145 },
  { name: "12:00", ms: 89 },
  { name: "16:00", ms: 120 },
  { name: "20:00", ms: 50 },
  { name: "24:00", ms: 40 }
];

// Feature flags
const INITIAL_FLAGS = [
  { id: "flag-1", name: "enterprise-sso", desc: "Enable SAML 2.0 and OIDC authentication flows", env: "production", rollout: 100, active: true },
  { id: "flag-2", name: "api-v2-routes", desc: "Enable new REST APIs developer endpoints", env: "staging", rollout: 45, active: true },
  { id: "flag-3", name: "team-sprint-reports", desc: "PDF automation generator for group dashboards", env: "production", rollout: 100, active: true },
  { id: "flag-4", name: "ai-code-scanner-v3", desc: "Use advanced models for security repository audit", env: "development", rollout: 10, active: false },
  { id: "flag-5", name: "stripe-billing-v2", desc: "Use billing coupons and tax calculations", env: "all", rollout: 100, active: true }
];

export default function AdminPanel() {
  const [activeAdminTab, setActiveAdminTab] = useState<"overview" | "roles" | "flags" | "health">("overview");
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const [selectedRole, setSelectedRole] = useState("admin");

  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");
  const [createFlagModal, setCreateFlagModal] = useState(false);

  const toggleFlag = (id: string) => {
    setFlags(prev =>
      prev.map(f => f.id === id ? { ...f, active: !f.active } : f)
    );
  };

  const handleCreateFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagName) return;
    const newFlag = {
      id: `flag-${Date.now()}`,
      name: newFlagName,
      desc: newFlagDesc || "Custom system feature flag.",
      env: "development",
      rollout: 0,
      active: false
    };
    setFlags([...flags, newFlag]);
    setCreateFlagModal(false);
    setNewFlagName("");
    setNewFlagDesc("");
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Admin Panel
            <span className="text-[10px] uppercase bg-[#F85149]/15 border border-[#F85149]/30 text-[#F85149] px-2 py-0.5 rounded-full font-bold">
              ADMIN ROLE REQUIRED
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Operational dials, feature gatekeeping, role permissions matrices, and telemetry health</p>
        </div>
      </div>

      {/* Navigation Strip */}
      <div className="flex border-b border-[#30363D] bg-[#161B22]/40 rounded-lg p-1.5 gap-2 text-xs">
        {[
          { id: "overview", label: "Overview", icon: Sliders },
          { id: "roles", label: "Roles & Permissions", icon: Shield },
          { id: "flags", label: "Feature Flags", icon: Flag },
          { id: "health", label: "System Health", icon: Activity }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveAdminTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-bold ${
                activeAdminTab === t.id
                  ? "bg-[#21262D] text-white border border-[#30363D]"
                  : "text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Admin Tab Contents */}
      <div className="min-h-[400px]">
        {activeAdminTab === "overview" && (
          <div className="space-y-6">
            {/* Status Alert Banner */}
            <div className="bg-[#3FB950]/10 border border-[#3FB950]/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-[#3FB950] rounded-full animate-ping" />
                <div>
                  <h4 className="text-xs font-bold text-[#F0F6FC]">All Systems Operational</h4>
                  <p className="text-[10px] text-[#8B949E] mt-0.5">Telemetry sync, API proxy gateways, and Firestore clusters running clean.</p>
                </div>
              </div>
              <span className="text-[10px] text-[#8B949E]">Uptime: 99.98%</span>
            </div>

            {/* Circular quick dials */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "CPU UTILITY", val: "42%", sub: "4 Cores active" },
                { label: "RAM CLUSTER", val: "67%", sub: "10.7 GB / 16 GB" },
                { label: "GATEWAY MS", val: "89ms", sub: "Avg response" },
                { label: "DB SESSIONS", val: "1,203", sub: "Active client listeners" }
              ].map((dial, idx) => (
                <div key={idx} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
                  <span className="text-[9px] text-[#8B949E] block">{dial.label}</span>
                  <span className="text-xl font-bold text-[#F0F6FC] mt-1 block">{dial.val}</span>
                  <span className="text-[9px] text-[#8B949E]/70 mt-0.5 block">{dial.sub}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase text-[#8B949E]">Administrative Shortcuts</h4>
                <div className="space-y-2 text-xs">
                  <button className="w-full py-2 bg-[#21262D] hover:bg-[#30363D] rounded font-bold text-center transition-all">Configure Single Sign On</button>
                  <button className="w-full py-2 bg-[#21262D] hover:bg-[#30363D] rounded font-bold text-center transition-all">Force Full Telemetry Re-Sync</button>
                  <button className="w-full py-2 bg-[#21262D] hover:bg-[#30363D] rounded font-bold text-center transition-all">Export Immutable Audit Logs</button>
                </div>
              </div>

              {/* Operations logs */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 md:col-span-2 space-y-4">
                <h4 className="text-xs font-bold uppercase text-[#8B949E]">Recent Console Audits</h4>
                <div className="space-y-3 text-[11px]">
                  {[
                    { action: "Admin user enabled flag: enterprise-sso", user: "sarahk", time: "10m ago" },
                    { action: "User role changed: developer -> admin", user: "alexm", time: "2h ago" },
                    { action: "SAML SSO connection tested successfully", user: "jordanr", time: "5h ago" }
                  ].map((act, i) => (
                    <div key={i} className="flex justify-between border-b border-[#30363D]/40 pb-2">
                      <span className="text-[#F0F6FC]">{act.action} <strong className="text-accent">({act.user})</strong></span>
                      <span className="text-[#8B949E]">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Roles */}
        {activeAdminTab === "roles" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#8B949E] mb-2">Access Roles</h4>
              {["owner", "admin", "manager", "developer", "viewer"].map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${
                    selectedRole === r
                      ? "bg-[#21262D] border-[#8957E5]"
                      : "bg-[#161B22] border-[#30363D] hover:border-[#8B949E]/40"
                  }`}
                >
                  <span className="text-xs font-bold uppercase text-[#F0F6FC]">{r}</span>
                  <span className="text-[10px] text-[#8B949E]">Select permissions</span>
                </button>
              ))}
            </div>

            {/* Permission checklist Matrix */}
            <div className="md:col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 text-xs">
              <h4 className="text-xs font-bold uppercase text-[#8B949E]">
                Policy Permission Matrix for <strong className="text-accent uppercase font-black">{selectedRole}</strong>
              </h4>

              <div className="space-y-4">
                {[
                  { module: "Organizations Workspace", read: true, write: selectedRole !== "viewer", del: ["owner", "admin"].includes(selectedRole) },
                  { module: "Members Onboarding", read: true, write: ["owner", "admin", "manager"].includes(selectedRole), del: ["owner", "admin"].includes(selectedRole) },
                  { module: "Audit Logs Explorer", read: ["owner", "admin", "manager"].includes(selectedRole), write: ["owner", "admin"].includes(selectedRole), del: false },
                  { module: "SSO Config & Domains", read: ["owner", "admin"].includes(selectedRole), write: ["owner", "admin"].includes(selectedRole), del: ["owner", "admin"].includes(selectedRole) }
                ].map((mod, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#30363D]/60 gap-2">
                    <span className="font-semibold text-[#F0F6FC]">{mod.module}</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-[#8B949E]">
                        <input type="checkbox" checked={!!mod.read} readOnly className="rounded border-[#30363D]" /> Read
                      </label>
                      <label className="flex items-center gap-1.5 text-[#8B949E]">
                        <input type="checkbox" checked={!!mod.write} readOnly className="rounded border-[#30363D]" /> Write
                      </label>
                      <label className="flex items-center gap-1.5 text-[#8B949E]">
                        <input type="checkbox" checked={!!mod.del} readOnly className="rounded border-[#30363D]" /> Delete
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#30363D]/60 flex justify-end">
                <button className="px-4 py-2 bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white font-bold rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all">
                  Save Permission Matrix
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Flags */}
        {activeAdminTab === "flags" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-[#8B949E]">Gatekeeper System Flags</h4>
              <button
                onClick={() => setCreateFlagModal(true)}
                className="text-[10px] font-bold px-3 py-1.5 bg-[#21262D] border border-[#30363D] hover:border-[#8B949E]/40 text-[#F0F6FC] rounded-lg transition-all"
              >
                + Create Flag
              </button>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#30363D] bg-[#21262D]/40 text-[#8B949E] uppercase tracking-wider font-mono">
                    <th className="p-4">Flag ID</th>
                    <th className="p-4">Target Context</th>
                    <th className="p-4">Environment</th>
                    <th className="p-4">Rollout %</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((flag) => (
                    <tr key={flag.id} className="border-b border-[#30363D]/60 hover:bg-[#21262D]/20">
                      <td className="p-4 font-bold text-[#F0F6FC]">{flag.name}</td>
                      <td className="p-4 text-[#8B949E] text-[11px]">{flag.desc}</td>
                      <td className="p-4">
                        <span className="bg-[#21262D] border border-[#30363D] px-2 py-0.5 rounded text-[#8B949E]">
                          {flag.env}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{flag.rollout}%</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleFlag(flag.id)}
                          className={`w-10 h-5 rounded-full relative transition-all ${
                            flag.active ? "bg-[#3FB950]" : "bg-[#30363D]"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                            flag.active ? "right-1" : "left-1"
                          }`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Health */}
        {activeAdminTab === "health" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Operational services list */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase text-[#8B949E]">Service Clusters</h4>
                <div className="space-y-3 text-xs">
                  {[
                    { name: "Auth Cluster (SSO)", latency: "12ms", uptime: 100 },
                    { name: "API Gateway Node 1", latency: "89ms", uptime: 99.97 },
                    { name: "Firestore Telemetry", latency: "24ms", uptime: 100 },
                    { name: "Analytics Processor", latency: "142ms", uptime: 99.8 }
                  ].map((service, i) => (
                    <div key={i} className="flex justify-between items-center pb-2 border-b border-[#30363D]/40">
                      <div>
                        <span className="font-bold text-[#F0F6FC] block">{service.name}</span>
                        <span className="text-[10px] text-[#8B949E]">{service.latency} · {service.uptime}% uptime</span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3FB950]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recharts API Latency Area Chart */}
              <div className="md:col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase text-[#8B949E] mb-4">Response Time Latency History (24 hours)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={STATUS_DATA}>
                      <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#8B949E" fontSize={9} />
                      <YAxis stroke="#8B949E" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                      <Area type="monotone" dataKey="ms" stroke="#F85149" fill="#F85149" fillOpacity={0.1} name="Latency (ms)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE FEATURE FLAG MODAL ── */}
      <AnimatePresence>
        {createFlagModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setCreateFlagModal(false)}
                className="absolute top-4 right-4 p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg hover:bg-[#21262D]"
              >
                <X size={16} />
              </button>

              <div className="p-6 border-b border-[#30363D]">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Flag size={18} className="text-[#8957E5]" /> Create System Feature Flag
                </h3>
                <p className="text-xs text-[#8B949E] mt-1">Roll out target code updates dynamically.</p>
              </div>

              <form onSubmit={handleCreateFlag} className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Flag Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. workspace-beta"
                    value={newFlagName}
                    onChange={(e) => setNewFlagName(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E]/70 focus:outline-none focus:border-[#8957E5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Purpose Description</label>
                  <textarea
                    placeholder="Describe code impact context"
                    value={newFlagDesc}
                    onChange={(e) => setNewFlagDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#8957E5]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#30363D]">
                  <button
                    type="button"
                    onClick={() => setCreateFlagModal(false)}
                    className="px-4 py-2 rounded-lg border border-[#30363D] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white font-semibold active:scale-95 transition-all"
                  >
                    Create Flag
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
