"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  Shield,
  LogIn,
  Key,
  Users,
  RefreshCw,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle,
  Clock,
  Globe
} from "lucide-react";

// Mock Audit Logs
const INITIAL_LOGS = [
  { id: "log-1", event: "user.login", actor: "sarahk", desc: "User logged into workspace successfully via GitHub SSO", severity: "info", ip: "192.168.1.14", time: "just now", date: "Jul 11, 2026 12:00:00" },
  { id: "log-2", event: "key.generate", actor: "alexm", desc: "Generated write scope production API Token (dtk_prod_••••)", severity: "info", ip: "203.0.113.82", time: "10m ago", date: "Jul 11, 2026 11:50:00" },
  { id: "log-3", event: "role.update", actor: "jordanr", desc: "Changed role of developer (marcusk) -> suspended", severity: "warning", ip: "198.51.100.4", time: "2h ago", date: "Jul 11, 2026 10:00:00" },
  { id: "log-4", event: "security.failed_login", actor: "unknown", desc: "Brute-force failed login attempts (x3) on admin portal", severity: "critical", ip: "45.22.89.147", time: "5h ago", date: "Jul 11, 2026 07:00:00" },
  { id: "log-5", event: "billing.plan_upgrade", actor: "chrisl", desc: "Upgraded subscription tier to Enterprise Tier", severity: "info", ip: "12.89.234.12", time: "1d ago", date: "Jul 10, 2026 12:00:00" },
  { id: "log-6", event: "security.sso_config", actor: "emmaw", desc: "Updated Okta SAML 2.0 configuration values", severity: "warning", ip: "192.168.1.5", time: "2d ago", date: "Jul 09, 2026 14:00:00" }
];

export default function AuditLogsPanel() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<typeof INITIAL_LOGS[0] | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case "critical": return "bg-[#F85149]/15 border border-[#F85149]/30 text-[#F85149]";
      case "warning": return "bg-[#D29922]/15 border border-[#D29922]/30 text-[#D29922]";
      default: return "bg-[#2F81F7]/15 border border-[#2F81F7]/30 text-[#2F81F7]";
    }
  };

  const getEventIcon = (event: string) => {
    if (event.includes("login")) return <LogIn size={12} />;
    if (event.includes("key")) return <Key size={12} />;
    if (event.includes("role")) return <Users size={12} />;
    return <FileText size={12} />;
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Audit Logs
            <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-0.5 rounded-full text-[#8B949E]">
              Immutable Trail
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Immutable security tracking, configuration adjustments logs, and console events</p>
        </div>

        <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#F0F6FC] active:scale-95 transition-all">
          <Download size={14} />
          Export JSON
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "TOTAL AUDIT EVENTS", val: "48,293" },
          { label: "CRITICAL SEVERITY TRIGGERS", val: "12", color: "text-[#F85149]" },
          { label: "FAILED LOGIN ATTEMPTS", val: "47", color: "text-[#D29922]" },
          { label: "UNAUTHORIZED IPS REJECTED", val: "3", color: "text-[#F85149]" }
        ].map((stat, i) => (
          <div key={i} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <span className="text-[10px] text-[#8B949E] block tracking-wider">{stat.label}</span>
            <span className={`text-lg font-bold mt-1 block ${stat.color || "text-[#F0F6FC]"}`}>{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Filters Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            placeholder="Filter logs by actor username, activity descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#8957E5]"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#8B949E] focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#21262D]/40 text-[#8B949E] uppercase tracking-wider font-mono">
                <th className="p-4">Action Event</th>
                <th className="p-4">Trigger Actor</th>
                <th className="p-4">Event Description</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-center">Severity</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-[#30363D]/60 hover:bg-[#21262D]/20 transition-all">
                  <td className="p-4 font-bold flex items-center gap-2">
                    <span className="text-[#8B949E]">
                      {getEventIcon(log.event)}
                    </span>
                    <code>{log.event}</code>
                  </td>
                  <td className="p-4 font-semibold text-accent">@{log.actor}</td>
                  <td className="p-4 text-text-secondary text-[11px] max-w-[280px] truncate">{log.desc}</td>
                  <td className="p-4 text-[#8B949E]">
                    <code>{log.ip}</code>
                  </td>
                  <td className="p-4 text-[#8B949E]">{log.time}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getSeverityStyle(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 hover:bg-[#21262D] rounded text-[#8B949E] hover:text-[#F0F6FC]"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer (slide from right) */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setSelectedLog(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-md bg-[#161B22] border-l border-[#30363D] h-full flex flex-col justify-between shadow-2xl z-10 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-[#30363D] pb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileText size={16} /> Audit Log Payload
                </h3>
                <button onClick={() => setSelectedLog(null)} className="p-1.5 hover:bg-[#21262D] rounded-lg text-[#8B949E]">
                  <X size={16} />
                </button>
              </div>

              {/* Event payload Details */}
              <div className="flex-1 py-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[#8B949E] block">Event Schema ID</span>
                  <span className="text-sm font-bold font-mono text-[#F0F6FC]">{selectedLog.event}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8B949E] block">Actor Username</span>
                  <span className="text-sm font-bold text-accent">@{selectedLog.actor}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8B949E] block">IP Address Context</span>
                  <code className="text-[#F0F6FC]">{selectedLog.ip}</code>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8B949E] block">Exact Timestamp</span>
                  <span className="text-[#F0F6FC]">{selectedLog.date}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[#8B949E] block">Audit Event Payload Log</span>
                  <p className="text-[#F0F6FC] leading-relaxed bg-[#0D1117] border border-[#30363D] p-3 rounded-lg">
                    {selectedLog.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[#8B949E] block">Raw Metadata Schema JSON</span>
                  <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 overflow-x-auto text-[10px] text-[#3FB950] font-mono leading-relaxed">
                    <pre>{JSON.stringify({
                      event_id: selectedLog.id,
                      schema_version: "1.2.0",
                      actor: { username: selectedLog.actor, role: "admin" },
                      client: { ip: selectedLog.ip, user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
                      severity: selectedLog.severity,
                      integrity_status: "verified_sha256"
                    }, null, 2)}</pre>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#30363D]">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full py-2 bg-[#21262D] hover:bg-[#30363D] rounded-lg font-bold"
                >
                  Close Payload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
