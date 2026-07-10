"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Globe,
  Users,
  Folder,
  Settings,
  Plus,
  CheckCircle,
  Crown,
  Shield,
  Search,
  X,
  Sliders,
  Sparkles
} from "lucide-react";

// Mock Organizations
const MOCK_ORGS = [
  {
    id: "org-1",
    name: "Acme Corp",
    slug: "acme",
    logoChar: "A",
    brandColor: "#8957E5",
    domain: "acme.com",
    workspace: "Acme Workspace",
    timezone: "America/New_York",
    plan: "enterprise",
    memberCount: 147,
    teamCount: 23,
    repoCount: 84,
    healthScore: 92,
    avgGrade: "A+",
    isVerified: true
  },
  {
    id: "org-2",
    name: "TechStartup Inc",
    slug: "techstartup",
    logoChar: "T",
    brandColor: "#2F81F7",
    domain: "techstartup.io",
    workspace: "TS Workspace",
    timezone: "America/Los_Angeles",
    plan: "team",
    memberCount: 34,
    teamCount: 8,
    repoCount: 19,
    healthScore: 88,
    avgGrade: "A",
    isVerified: false
  },
  {
    id: "org-3",
    name: "DevBootcamp Pro",
    slug: "devbootcamp",
    logoChar: "D",
    brandColor: "#3FB950",
    domain: "devbootcamp.edu",
    workspace: "Bootcamp main",
    timezone: "Europe/London",
    plan: "pro",
    memberCount: 289,
    teamCount: 45,
    repoCount: 120,
    healthScore: 95,
    avgGrade: "S",
    isVerified: true
  },
  {
    id: "org-4",
    name: "Open Source Hub",
    slug: "opensourcehub",
    logoChar: "O",
    brandColor: "#D29922",
    domain: "oshub.org",
    workspace: "OS Workspace",
    timezone: "UTC",
    plan: "free",
    memberCount: 12,
    teamCount: 3,
    repoCount: 56,
    healthScore: 84,
    avgGrade: "B+",
    isVerified: false
  },
  {
    id: "org-5",
    name: "InnovateLabs",
    slug: "innovatelabs",
    logoChar: "I",
    brandColor: "#F85149",
    domain: "innovatelabs.co",
    workspace: "IL Workspace",
    timezone: "Asia/Singapore",
    plan: "enterprise",
    memberCount: 67,
    teamCount: 11,
    repoCount: 42,
    healthScore: 91,
    avgGrade: "A",
    isVerified: true
  },
  {
    id: "org-6",
    name: "CloudNative Co",
    slug: "cloudnative",
    logoChar: "C",
    brandColor: "#00C7B7",
    domain: "cloudnative.net",
    workspace: "CN Main",
    timezone: "Europe/Berlin",
    plan: "team",
    memberCount: 23,
    teamCount: 5,
    repoCount: 12,
    healthScore: 89,
    avgGrade: "A-",
    isVerified: false
  }
];

export default function OrganizationsPanel() {
  const [organizations, setOrganizations] = useState(MOCK_ORGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrgSettings, setSelectedOrgSettings] = useState<typeof MOCK_ORGS[0] | null>(null);

  // Form states for new org
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgDomain, setNewOrgDomain] = useState("");
  const [newOrgColor, setNewOrgColor] = useState("#8957E5");
  const [newOrgPlan, setNewOrgPlan] = useState<string>("pro");

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    const newOrg = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      slug: newOrgSlug || newOrgName.toLowerCase().replace(/\s+/g, "-"),
      logoChar: newOrgName.charAt(0).toUpperCase(),
      brandColor: newOrgColor,
      domain: newOrgDomain || `${newOrgName.toLowerCase().replace(/\s+/g, "")}.com`,
      workspace: `${newOrgName} Workspace`,
      timezone: "UTC",
      plan: newOrgPlan as any,
      memberCount: 1,
      teamCount: 0,
      repoCount: 0,
      healthScore: 100,
      avgGrade: "A",
      isVerified: false
    };
    setOrganizations([newOrg, ...organizations]);
    setCreateModalOpen(false);
    // Reset Form
    setNewOrgName("");
    setNewOrgSlug("");
    setNewOrgDomain("");
    setNewOrgColor("#8957E5");
    setNewOrgPlan("pro");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgSettings) return;
    setOrganizations(prev =>
      prev.map(org => org.id === selectedOrgSettings.id ? selectedOrgSettings : org)
    );
    setSelectedOrgSettings(null);
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* 🏢 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Organizations
            <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-0.5 rounded-full text-[#8B949E]">
              {organizations.length} Total
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Configure workspace boundaries, brand identifiers, and domains</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#8957E5]/15"
        >
          <Plus size={14} />
          Create Organization
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            placeholder="Search organizations by name, slug, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#8957E5]"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <motion.div
            key={org.id}
            whileHover={{ y: -4 }}
            className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 flex flex-col justify-between relative overflow-hidden group transition-all"
            style={{
              boxShadow: `0 0 20px -15px ${org.brandColor}`
            }}
          >
            {/* Glowing Accent strip */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
              style={{ backgroundColor: org.brandColor }}
            />

            <div>
              {/* Top Line */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md"
                    style={{ backgroundColor: org.brandColor }}
                  >
                    {org.logoChar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[#F0F6FC]">{org.name}</h3>
                      {org.isVerified && <span title="Verified Domain"><CheckCircle size={12} className="text-[#2F81F7]" /></span>}
                    </div>
                    <span className="text-[10px] text-[#8B949E]">@{org.slug}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full font-mono ${
                    org.plan === "enterprise"
                      ? "bg-[#8957E5]/15 border border-[#8957E5]/30 text-[#8957E5]"
                      : org.plan === "team"
                      ? "bg-[#2F81F7]/15 border border-[#2F81F7]/30 text-[#2F81F7]"
                      : org.plan === "pro"
                      ? "bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950]"
                      : "bg-[#8B949E]/15 border border-[#8B949E]/30 text-[#8B949E]"
                  }`}
                >
                  {org.plan}
                </span>
              </div>

              {/* Info Rows */}
              <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-[#30363D]/60 text-center">
                <div>
                  <span className="text-[9px] text-[#8B949E] block">MEMBERS</span>
                  <span className="text-xs text-[#F0F6FC] font-semibold">{org.memberCount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8B949E] block">TEAMS</span>
                  <span className="text-xs text-[#F0F6FC] font-semibold">{org.teamCount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8B949E] block">REPOS</span>
                  <span className="text-xs text-[#F0F6FC] font-semibold">{org.repoCount}</span>
                </div>
              </div>

              {/* Health Score / Domain details */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#8B949E] flex items-center gap-1">
                    <Globe size={10} /> {org.domain}
                  </span>
                  <span className="text-[#3FB950] font-bold">Health: {org.healthScore}%</span>
                </div>
                <div className="h-1 bg-[#21262D] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${org.healthScore}%`,
                      backgroundColor: org.healthScore > 90 ? "#3FB950" : org.healthScore > 80 ? "#D29922" : "#F85149"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-5 pt-1 border-t border-[#30363D]/40">
              <button
                onClick={() => setSelectedOrgSettings(org)}
                className="flex-1 py-1.5 rounded-lg border border-[#30363D] bg-[#21262D]/40 hover:bg-[#21262D] hover:border-[#8B949E]/40 text-[10px] font-bold text-[#8B949E] hover:text-[#F0F6FC] flex items-center justify-center gap-1 active:scale-98 transition-all"
              >
                <Settings size={10} />
                Settings
              </button>
              <button className="flex-1 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[10px] font-bold text-[#F0F6FC] flex items-center justify-center gap-1 active:scale-98 transition-all">
                Launch Space
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CREATE ORGANIZATION MODAL ── */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg hover:bg-[#21262D]"
              >
                <X size={16} />
              </button>

              <div className="p-6 border-b border-[#30363D]">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Building2 size={18} className="text-[#8957E5]" /> Create Workspace Organization
                </h3>
                <p className="text-xs text-[#8B949E] mt-1">Spin up an isolated dashboard workspace space for your enterprise group.</p>
              </div>

              <form onSubmit={handleCreateOrg} className="p-6 space-y-4 text-xs">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corporation"
                    value={newOrgName}
                    onChange={(e) => {
                      setNewOrgName(e.target.value);
                      setNewOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E]/70 focus:outline-none focus:border-[#8957E5]"
                  />
                </div>

                {/* Slug & Domain Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#8B949E] font-semibold">Workspace Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. acme"
                      value={newOrgSlug}
                      onChange={(e) => setNewOrgSlug(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#8957E5]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#8B949E] font-semibold">Primary Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. acme.com"
                      value={newOrgDomain}
                      onChange={(e) => setNewOrgDomain(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#8957E5]"
                    />
                  </div>
                </div>

                {/* Presets & Brand Color Picker */}
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Brand Highlight Color</label>
                  <div className="flex gap-3 mt-1 items-center">
                    {["#8957E5", "#2F81F7", "#3FB950", "#D29922", "#F85149", "#00C7B7"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewOrgColor(color)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          newOrgColor === color ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={newOrgColor}
                      onChange={(e) => setNewOrgColor(e.target.value)}
                      className="w-6 h-6 rounded bg-transparent border-0 outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Plan Selection Cards */}
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Subscription Plan</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[
                      { id: "free", label: "Free Plan", desc: "For teams up to 5 members" },
                      { id: "pro", label: "Pro Plan", desc: "Collaborate with up to 30 devs" },
                      { id: "team", label: "Team Suite", desc: "Premium monitoring tools" },
                      { id: "enterprise", label: "Enterprise", desc: "Full custom RBAC & analytics" }
                    ].map(plan => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setNewOrgPlan(plan.id)}
                        className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                          newOrgPlan === plan.id
                            ? "bg-[#21262D] border-[#8957E5] shadow-lg shadow-[#8957E5]/5"
                            : "bg-[#0D1117] border-[#30363D] hover:border-[#8B949E]/40"
                        }`}
                      >
                        <span className="font-bold text-[#F0F6FC]">{plan.label}</span>
                        <span className="text-[9px] text-[#8B949E] mt-1">{plan.desc}</span>
                      </button>
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
                    Create Organization
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ORG SETTINGS DRAWER (RIGHT SIDE SLIDEOUT) ── */}
      <AnimatePresence>
        {selectedOrgSettings && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setSelectedOrgSettings(null)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-[#161B22] border-l border-[#30363D] h-full flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="p-6 border-b border-[#30363D] flex justify-between items-center">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Settings size={16} /> Org Settings: {selectedOrgSettings.name}
                </h3>
                <button
                  onClick={() => setSelectedOrgSettings(null)}
                  className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg hover:bg-[#21262D]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Branding Name</label>
                  <input
                    type="text"
                    value={selectedOrgSettings.name}
                    onChange={(e) => setSelectedOrgSettings({ ...selectedOrgSettings, name: e.target.value })}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#8957E5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Domain Mapping</label>
                  <input
                    type="text"
                    value={selectedOrgSettings.domain}
                    onChange={(e) => setSelectedOrgSettings({ ...selectedOrgSettings, domain: e.target.value })}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#8957E5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Workspace Name</label>
                  <input
                    type="text"
                    value={selectedOrgSettings.workspace}
                    onChange={(e) => setSelectedOrgSettings({ ...selectedOrgSettings, workspace: e.target.value })}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Timezone</label>
                  <select
                    value={selectedOrgSettings.timezone}
                    onChange={(e) => setSelectedOrgSettings({ ...selectedOrgSettings, timezone: e.target.value })}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none"
                  >
                    <option value="America/New_York">EST (New York)</option>
                    <option value="America/Los_Angeles">PST (Los Angeles)</option>
                    <option value="Europe/London">GMT (London)</option>
                    <option value="Europe/Berlin">CET (Berlin)</option>
                    <option value="Asia/Singapore">SGT (Singapore)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[#8B949E] font-semibold">Update Accent Theme</label>
                  <div className="flex gap-3 mt-1 items-center">
                    {["#8957E5", "#2F81F7", "#3FB950", "#D29922", "#F85149", "#00C7B7"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedOrgSettings({ ...selectedOrgSettings, brandColor: color })}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          selectedOrgSettings.brandColor === color ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#30363D]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="verifiedCheck"
                      checked={selectedOrgSettings.isVerified}
                      onChange={(e) => setSelectedOrgSettings({ ...selectedOrgSettings, isVerified: e.target.checked })}
                      className="rounded border-[#30363D] bg-[#0D1117] text-[#8957E5]"
                    />
                    <label htmlFor="verifiedCheck" className="text-[#8B949E] cursor-pointer">Enforce domain verification checks</label>
                  </div>
                </div>
              </form>

              <div className="p-6 border-t border-[#30363D] flex justify-end gap-2 bg-[#161B22]">
                <button
                  type="button"
                  onClick={() => setSelectedOrgSettings(null)}
                  className="px-4 py-2 rounded-lg border border-[#30363D] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white font-semibold active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
