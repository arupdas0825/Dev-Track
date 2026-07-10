"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plug,
  Zap,
  Settings,
  ExternalLink,
  Copy,
  Link,
  Unlink,
  CheckCircle,
  Clock,
  Globe,
  X,
  Search,
  Check
} from "lucide-react";

// Mock Integrations data
const INITIAL_INTEGRATIONS = [
  { id: "github", name: "GitHub Integration", category: "vcs", desc: "Connect repository trees, branches telemetry, and pull request audits.", status: "connected", logo: "🐱", color: "#24292F", events: 14502, sync: "2m ago" },
  { id: "gitlab", name: "GitLab Services", category: "vcs", desc: "Sync self-hosted or cloud pipelines and commit graphs.", status: "connected", logo: "🦊", color: "#FC6D26", events: 2901, sync: "15m ago" },
  { id: "bitbucket", name: "Bitbucket Cloud", category: "vcs", desc: "Access Atlassian repository metadata structures.", status: "available", logo: "💙", color: "#0052CC" },
  { id: "slack", name: "Slack Notifications", category: "communication", desc: "Post grade notifications, milestones, and warning alerts to channels.", status: "connected", logo: "💬", color: "#4A154B", events: 840, sync: "1h ago" },
  { id: "discord", name: "Discord Webhooks", category: "communication", desc: "Ping developer challenge metrics directly into guilds.", status: "available", logo: "👾", color: "#5865F2" },
  { id: "msteams", name: "Microsoft Teams", category: "communication", desc: "Expose team metrics alerts into Office365 channels.", status: "available", logo: "👥", color: "#6264A7" },
  { id: "jira", name: "Jira Software", category: "project", desc: "Link sprint backlogs, task statuses, and story points velocity.", status: "connected", logo: "🎫", color: "#0052CC", events: 412, sync: "3h ago" },
  { id: "linear", name: "Linear App", category: "project", desc: "Sync issues boards status maps and team tasks.", status: "available", logo: "📈", color: "#5E6AD2" },
  { id: "notion", name: "Notion Wiki", category: "project", desc: "Generate documentation notes and database tracking maps.", status: "coming_soon", logo: "📓", color: "#000000" },
  { id: "vercel", name: "Vercel Deployments", category: "hosting", desc: "Track build latency analytics and production deployment alerts.", status: "connected", logo: "▲", color: "#000000", events: 1205, sync: "5m ago" },
  { id: "netlify", name: "Netlify hosting", category: "hosting", desc: "Sync front-end static builds logs and deploy actions.", status: "available", logo: "◈", color: "#00C7B7" },
  { id: "aws", name: "AWS CloudWatch", category: "cloud", desc: "Expose system health metrics and telemetry logs integrations.", status: "available", logo: "☁", color: "#FF9900" },
  { id: "azure", name: "Azure DevOps", category: "cloud", desc: "Expose pipeline automation steps and infrastructure logs.", status: "coming_soon", logo: "❖", color: "#0078D4" }
];

export default function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedConfig, setSelectedConfig] = useState<typeof INITIAL_INTEGRATIONS[0] | null>(null);

  // Connection drawer details
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.devtrack.com/v1/services/928fhks0");
  const [copiedText, setCopiedText] = useState(false);

  const filtered = integrations.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => item.id === id ? { ...item, status: "available" } : item)
    );
    setSelectedConfig(null);
  };

  const handleConnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => item.id === id ? { ...item, status: "connected", events: 0, sync: "just now" } : item)
    );
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Integrations
            <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-0.5 rounded-full text-[#8B949E]">
              {integrations.filter(i => i.status === "connected").length} Connected
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Connect third-party VCS clusters, communications pipelines, and hosting dashboards</p>
        </div>
      </div>

      {/* Filter and Categories Chips */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            placeholder="Search third-party tools integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#8957E5]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: "all", label: "All Tiers" },
            { id: "vcs", label: "Code VCS" },
            { id: "communication", label: "Messaging" },
            { id: "project", label: "Agile Tracking" },
            { id: "hosting", label: "Hosting" },
            { id: "cloud", label: "Cloud Providers" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`text-[10px] font-bold px-3 py-1 rounded transition-all whitespace-nowrap ${
                categoryFilter === cat.id
                  ? "bg-[#21262D] border border-[#30363D] text-white"
                  : "text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Marketplace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#8B949E]/40 transition-all"
          >
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-md"
                    style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}
                  >
                    {item.logo}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F0F6FC]">{item.name}</h3>
                    <span className="text-[9px] text-[#8B949E] uppercase tracking-wider block mt-0.5">{item.category}</span>
                  </div>
                </div>

                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  item.status === "connected"
                    ? "bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950]"
                    : item.status === "available"
                    ? "bg-[#8B949E]/15 border border-[#8B949E]/30 text-[#8B949E]"
                    : "bg-[#8957E5]/15 border border-[#8957E5]/30 text-[#8957E5]"
                }`}>
                  {item.status === "coming_soon" ? "Soon" : item.status}
                </span>
              </div>

              <p className="text-[10px] text-[#8B949E] mt-4 line-clamp-3 leading-relaxed">{item.desc}</p>
            </div>

            {/* Inner events telemetry stats if connected */}
            {item.status === "connected" && (
              <div className="mt-4 pt-3 border-t border-[#30363D]/40 text-[9px] text-[#8B949E] flex justify-between font-mono">
                <span>EVENTS SYNCED: <strong>{item.events?.toLocaleString() ?? 0}</strong></span>
                <span>SYNC: <strong>{item.sync ?? "Never"}</strong></span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5">
              {item.status === "connected" ? (
                <button
                  onClick={() => setSelectedConfig(item)}
                  className="w-full py-1.5 rounded-lg border border-[#30363D] bg-[#21262D]/40 hover:bg-[#21262D] text-[10px] font-bold text-[#8B949E] hover:text-[#F0F6FC] flex items-center justify-center gap-1 active:scale-98 transition-all"
                >
                  <Settings size={10} />
                  Configure Webhooks
                </button>
              ) : item.status === "available" ? (
                <button
                  onClick={() => handleConnect(item.id)}
                  className="w-full py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[10px] font-bold text-[#F0F6FC] flex items-center justify-center gap-1 active:scale-98 transition-all"
                >
                  Connect Integration
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D]/40 text-[10px] font-bold text-[#8B949E] cursor-not-allowed text-center"
                >
                  Access Pending release
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── CONFIGURATION DRAWER (RIGHT SIDE SLIDEOUT) ── */}
      <AnimatePresence>
        {selectedConfig && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setSelectedConfig(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-md bg-[#161B22] border-l border-[#30363D] h-full flex flex-col justify-between shadow-2xl z-10 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-[#30363D] pb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Settings size={16} /> Webhook details: {selectedConfig.name}
                </h3>
                <button onClick={() => setSelectedConfig(null)} className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg hover:bg-[#21262D]">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 py-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Incoming Webhook Endpoint URI</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-[10px] text-[#8B949E] focus:outline-none flex-1 font-mono"
                    />
                    <button onClick={handleCopy} className="px-3 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-lg">
                      {copiedText ? <Check size={14} className="text-[#3FB950]" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Subscriptions checkboxes */}
                <div className="space-y-2">
                  <label className="text-[#8B949E] font-semibold">Auditable Events to Track</label>
                  <div className="space-y-1.5 bg-[#0D1117] border border-[#30363D] p-3 rounded-lg">
                    {[
                      "Repository Commit Pushes",
                      "Pull Request updates / merges",
                      "Deployment state status transitions",
                      "System security credentials rotation alerts"
                    ].map((scope, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer py-1">
                        <input type="checkbox" defaultChecked className="rounded border-[#30363D] bg-[#161B22]" />
                        <span className="text-[10px] text-[#F0F6FC]">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Webhook logs */}
                <div className="space-y-2">
                  <label className="text-[#8B949E] font-semibold">Recent Event Messages Telemetry</label>
                  <div className="space-y-2 text-[10px]">
                    {[
                      { ev: "deployment.success", time: "5m ago", status: "200 OK" },
                      { ev: "pull_request.merged", time: "1h ago", status: "200 OK" },
                      { ev: "git.push", time: "2h ago", status: "200 OK" }
                    ].map((log, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#0D1117] border border-[#30363D] p-2.5 rounded">
                        <div>
                          <code className="text-[#F0F6FC]">{log.ev}</code>
                          <span className="text-[9px] text-[#8B949E] block">{log.time}</span>
                        </div>
                        <span className="text-[#3FB950] font-bold">{log.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Danger zone actions */}
              <div className="pt-6 border-t border-[#30363D] space-y-2">
                <button
                  onClick={() => setSelectedConfig(null)}
                  className="w-full py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] font-bold text-[#F0F6FC] text-center text-xs"
                >
                  Save Webhook scopes
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(selectedConfig.id)}
                  className="w-full py-2 rounded-lg bg-danger/10 hover:bg-danger/25 border border-danger/30 font-bold text-danger text-center text-xs"
                >
                  Disconnect Integration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
