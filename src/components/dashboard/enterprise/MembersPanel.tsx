"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Search,
  Filter,
  X,
  MoreVertical,
  Sliders,
  ShieldCheck,
  Ban,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";

// Mock Members data
const MOCK_MEMBERS = [
  {
    id: "mem-1",
    displayName: "Sarah K.",
    username: "sarahk",
    email: "sarah@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    role: "owner",
    teams: ["Frontend Guild", "Design Systems"],
    joinedAt: "Jan 12, 2025",
    lastActive: "just now",
    grade: "S",
    score: 96,
    contributions: 1450,
    status: "active",
    twoFAEnabled: true
  },
  {
    id: "mem-2",
    displayName: "Alex M.",
    username: "alexm",
    email: "alex@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    role: "admin",
    teams: ["Backend Core"],
    joinedAt: "Feb 20, 2025",
    lastActive: "5m ago",
    grade: "A+",
    score: 91,
    contributions: 924,
    status: "active",
    twoFAEnabled: true
  },
  {
    id: "mem-3",
    displayName: "Jordan R.",
    username: "jordanr",
    email: "jordan@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    role: "manager",
    teams: ["DevOps & Infra"],
    joinedAt: "Mar 05, 2025",
    lastActive: "12m ago",
    grade: "A",
    score: 87,
    contributions: 612,
    status: "active",
    twoFAEnabled: true
  },
  {
    id: "mem-4",
    displayName: "Priya S.",
    username: "priyas",
    email: "priya@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    role: "developer",
    teams: ["AI/ML Squad", "Backend Core"],
    joinedAt: "Apr 15, 2025",
    lastActive: "1h ago",
    grade: "S",
    score: 98,
    contributions: 1120,
    status: "active",
    twoFAEnabled: true
  },
  {
    id: "mem-5",
    displayName: "Chris L.",
    username: "chrisl",
    email: "chris@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    role: "developer",
    teams: ["Mobile Team"],
    joinedAt: "May 22, 2025",
    lastActive: "3h ago",
    grade: "A-",
    score: 83,
    contributions: 480,
    status: "active",
    twoFAEnabled: false
  },
  {
    id: "mem-6",
    displayName: "Emma W.",
    username: "emmaw",
    email: "emma@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
    role: "recruiter",
    teams: [],
    joinedAt: "Jun 01, 2025",
    lastActive: "1d ago",
    grade: "B+",
    score: 76,
    contributions: 120,
    status: "active",
    twoFAEnabled: true
  },
  {
    id: "mem-7",
    displayName: "Ryan D.",
    username: "ryand",
    email: "ryan@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&q=80",
    role: "hr",
    teams: [],
    joinedAt: "Jun 10, 2025",
    lastActive: "2d ago",
    grade: "B",
    score: 72,
    contributions: 85,
    status: "active",
    twoFAEnabled: false
  },
  {
    id: "mem-8",
    displayName: "Tyler J.",
    username: "tylerj",
    email: "tyler@acme.com",
    avatarUrl: "",
    role: "viewer",
    teams: [],
    joinedAt: "Jun 15, 2025",
    lastActive: "5d ago",
    grade: "C",
    score: 64,
    contributions: 20,
    status: "active",
    twoFAEnabled: true
  },
  {
    id: "mem-9",
    displayName: "Sofia B.",
    username: "sofiab",
    email: "sofia@acme.com",
    avatarUrl: "",
    role: "developer",
    teams: ["Frontend Guild"],
    joinedAt: "Jul 01, 2025",
    lastActive: "never",
    grade: "A",
    score: 85,
    contributions: 0,
    status: "pending",
    twoFAEnabled: false
  },
  {
    id: "mem-10",
    displayName: "Marcus K.",
    username: "marcusk",
    email: "marcus@acme.com",
    avatarUrl: "",
    role: "developer",
    teams: ["DevOps & Infra"],
    joinedAt: "Mar 11, 2025",
    lastActive: "2w ago",
    grade: "A",
    score: 82,
    contributions: 310,
    status: "suspended",
    twoFAEnabled: true
  }
];

export default function MembersPanel() {
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof MOCK_MEMBERS[0] | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const username = inviteEmail.split("@")[0];
    const newMember = {
      id: `mem-${Date.now()}`,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      username,
      email: inviteEmail,
      avatarUrl: "",
      role: inviteRole,
      teams: [],
      joinedAt: "Invited today",
      lastActive: "never",
      grade: "-",
      score: 0,
      contributions: 0,
      status: "pending" as const,
      twoFAEnabled: false
    };

    setMembers([newMember, ...members]);
    setInviteModalOpen(false);
    setInviteEmail("");
  };

  const handleStatusChange = (id: string, newStatus: "active" | "suspended") => {
    setMembers(prev =>
      prev.map(m => m.id === id ? { ...m, status: newStatus } : m)
    );
    setActionMenuOpen(null);
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setMembers(prev =>
      prev.map(m => m.id === id ? { ...m, role: newRole } : m)
    );
    setActionMenuOpen(null);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "owner": return "bg-[#8957E5]/15 border border-[#8957E5]/30 text-[#8957E5]";
      case "admin": return "bg-[#F85149]/15 border border-[#F85149]/30 text-[#F85149]";
      case "manager": return "bg-[#D29922]/15 border border-[#D29922]/30 text-[#D29922]";
      case "recruiter": return "bg-[#2F81F7]/15 border border-[#2F81F7]/30 text-[#2F81F7]";
      case "hr": return "bg-pink-500/15 border border-pink-500/30 text-pink-500";
      case "developer": return "bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950]";
      default: return "bg-[#8B949E]/15 border border-[#8B949E]/30 text-[#8B949E]";
    }
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Members
            <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-0.5 rounded-full text-[#8B949E]">
              {members.length} Total
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Manage platform access, roles, teams, and security configurations</p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          <UserPlus size={14} />
          Invite Member
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "TOTAL SEATS", val: members.length, desc: "Out of 150 slots" },
          { label: "ACTIVE TODAY", val: members.filter(m => m.lastActive.includes("now") || m.lastActive.includes("m") || m.lastActive.includes("h")).length, desc: "Devs on keyboard" },
          { label: "PENDING INVITES", val: members.filter(m => m.status === "pending").length, desc: "Awaiting signup" },
          { label: "2FA ENROLLMENT", val: `${Math.round((members.filter(m => m.twoFAEnabled).length / members.length) * 100)}%`, desc: "Account security factor" }
        ].map((stat, i) => (
          <div key={i} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
            <span className="text-[10px] text-[#8B949E] block tracking-wider">{stat.label}</span>
            <span className="text-xl font-bold mt-1 block">{stat.val}</span>
            <span className="text-[9px] text-[#8B949E]/70 mt-0.5 block">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            placeholder="Search by display name, username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#8957E5]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#8B949E] focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="developer">Developer</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#8B949E] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#21262D]/40 text-[#8B949E] uppercase tracking-wider font-mono">
                <th className="p-4">Member</th>
                <th className="p-4">Access Level</th>
                <th className="p-4">Assigned Teams</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4">Grade & Score</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-[#30363D]/60 hover:bg-[#21262D]/20 transition-all">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.displayName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#30363D] text-[#8B949E] flex items-center justify-center font-bold">
                          {member.displayName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-[#F0F6FC]">{member.displayName}</span>
                        <span className="text-[10px] text-[#8B949E] block">@{member.username} · {member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleBadgeStyle(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {member.teams.length > 0 ? (
                        member.teams.map((t, idx) => (
                          <span key={idx} className="text-[9px] bg-[#21262D] border border-[#30363D] text-[#F0F6FC] px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-[#8B949E] italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[#8B949E]">{member.joinedAt}</td>
                  <td className="p-4 text-[#8B949E]">{member.lastActive}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-accent">{member.grade}</span>
                      <div className="w-16 h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2F81F7] rounded-full" style={{ width: `${member.score}%` }} />
                      </div>
                      <span className="text-[10px] text-[#8B949E]">{member.score}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        member.status === "active"
                          ? "bg-[#3FB950]"
                          : member.status === "pending"
                          ? "bg-[#D29922]"
                          : "bg-[#F85149]"
                      }`}
                      title={member.status}
                    />
                  </td>
                  <td className="p-4 text-right relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === member.id ? null : member.id)}
                      className="p-1 hover:bg-[#21262D] rounded-lg text-[#8B949E] hover:text-[#F0F6FC]"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {actionMenuOpen === member.id && (
                      <div className="absolute right-4 top-10 bg-[#161B22] border border-[#30363D] rounded-lg py-1 w-40 shadow-2xl z-20 text-left">
                        <button
                          onClick={() => { setSelectedMember(member); setActionMenuOpen(null); }}
                          className="w-full px-3 py-1.5 hover:bg-[#21262D] text-left text-xs flex items-center gap-2"
                        >
                          <Users size={12} /> View Profile
                        </button>
                        {member.role !== "owner" && (
                          <>
                            <button
                              onClick={() => handleRoleChange(member.id, member.role === "admin" ? "developer" : "admin")}
                              className="w-full px-3 py-1.5 hover:bg-[#21262D] text-left text-xs flex items-center gap-2"
                            >
                              <Shield size={12} /> Make {member.role === "admin" ? "Dev" : "Admin"}
                            </button>
                            <button
                              onClick={() => handleStatusChange(member.id, member.status === "suspended" ? "active" : "suspended")}
                              className="w-full px-3 py-1.5 hover:bg-[#21262D] text-left text-xs text-[#F85149] flex items-center gap-2"
                            >
                              <Ban size={12} /> {member.status === "suspended" ? "Activate" : "Suspend"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INVITE MEMBER MODAL ── */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setInviteModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg hover:bg-[#21262D]"
              >
                <X size={16} />
              </button>

              <div className="p-6 border-b border-[#30363D]">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <UserPlus size={18} className="text-[#8957E5]" /> Invite Member to Workspace
                </h3>
                <p className="text-xs text-[#8B949E] mt-1">Send an invitation to join Acme Corp workspace.</p>
              </div>

              <form onSubmit={handleSendInvite} className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. developer@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E]/70 focus:outline-none focus:border-[#8957E5]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8B949E] font-semibold">Workspace Access Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "developer", label: "Dev" },
                      { id: "admin", label: "Admin" },
                      { id: "viewer", label: "Viewer" }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setInviteRole(r.id)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          inviteRole === r.id
                            ? "bg-[#21262D] border-[#8957E5]"
                            : "bg-[#0D1117] border-[#30363D]"
                        }`}
                      >
                        <span className="font-bold text-[#F0F6FC]">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#30363D]">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#30363D] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white font-semibold active:scale-95 transition-all"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PROFILE DRAWER ── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setSelectedMember(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-md bg-[#161B22] border-l border-[#30363D] h-full flex flex-col justify-between shadow-2xl z-10 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  {selectedMember.avatarUrl ? (
                    <img src={selectedMember.avatarUrl} alt={selectedMember.displayName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#30363D] text-[#8B949E] flex items-center justify-center font-bold text-lg">
                      {selectedMember.displayName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-[#F0F6FC]">{selectedMember.displayName}</h3>
                    <span className="text-xs text-[#8B949E]">@{selectedMember.username}</span>
                  </div>
                </div>

                <button onClick={() => setSelectedMember(null)} className="p-1 hover:bg-[#21262D] rounded-lg text-[#8B949E]">
                  <X size={16} />
                </button>
              </div>

              {/* Stats snapshot */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#30363D] text-center">
                  <span className="text-[9px] text-[#8B949E] block">SCORE ENGINE</span>
                  <span className="text-lg font-bold text-accent mt-1 block">{selectedMember.score}/100</span>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#30363D] text-center">
                  <span className="text-[9px] text-[#8B949E] block">CONTRIBUTIONS</span>
                  <span className="text-lg font-bold text-[#3FB950] mt-1 block">{selectedMember.contributions} Commits</span>
                </div>
              </div>

              {/* Heatmap Placeholder */}
              <div className="mt-6 space-y-2">
                <span className="text-[10px] text-[#8B949E] font-semibold uppercase tracking-wider block">Activity Heatmap (12 Weeks)</span>
                <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 grid grid-cols-12 gap-1 justify-items-center">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-xs"
                      style={{
                        backgroundColor: i % 7 === 0 ? "#1e293b" : i % 5 === 0 ? "#3FB950" : i % 3 === 0 ? "#0e4429" : "#26a641"
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-6 space-y-3">
                <span className="text-[10px] text-[#8B949E] font-semibold uppercase tracking-wider block">Recent Auditable Logs</span>
                <div className="space-y-3">
                  {[
                    { action: "Pushed 4 commits to core-server", date: "2h ago" },
                    { action: "Generated temporary write sandbox API Key", date: "1d ago" },
                    { action: "Linked GitHub profile integration", date: "5d ago" }
                  ].map((log, i) => (
                    <div key={i} className="flex justify-between text-xs border-b border-[#30363D]/40 pb-2">
                      <span className="text-[#F0F6FC]">{log.action}</span>
                      <span className="text-[#8B949E]">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#30363D] mt-8 flex flex-col gap-2">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-full py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] font-bold text-[#F0F6FC] text-center"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
