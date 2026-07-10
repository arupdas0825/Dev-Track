"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Lock,
  Fingerprint,
  Key,
  Monitor,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Plus,
  Trash2
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip
} from "recharts";

// Mock Security Score
const RADIAL_DATA = [
  { name: "Score", value: 94, fill: "#3FB950" }
];

// Active Sessions
const MOCK_SESSIONS = [
  { id: "sess-1", user: "sarahk", device: "MacBook Pro 16", browser: "Chrome / macOS", location: "New York, USA", ip: "192.168.1.14", active: "Current Session" },
  { id: "sess-2", user: "alexm", device: "ThinkPad X1 Carbon", browser: "Firefox / Ubuntu", location: "London, UK", ip: "203.0.113.82", active: "5m ago" },
  { id: "sess-3", user: "jordanr", device: "Dell XPS 15", browser: "Safari / iOS", location: "San Francisco, USA", ip: "198.51.100.4", active: "2h ago" }
];

export default function SecurityPanel() {
  const [ipRanges, setIpRanges] = useState(["192.168.1.0/24", "10.0.0.0/8", "203.0.113.82/32"]);
  const [newIpRange, setNewIpRange] = useState("");
  const [ssoProvider, setSsoProvider] = useState("saml");
  const [twoFaEnforced, setTwoFaEnforced] = useState(true);

  // SAML Configuration fields
  const [samlEndpoint, setSamlEndpoint] = useState("https://identity.okta.com/app/devtrack");
  const [samlEntityId, setSamlEntityId] = useState("devtrack-enterprise-acme");

  const handleAddIpRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpRange) return;
    setIpRanges([...ipRanges, newIpRange]);
    setNewIpRange("");
  };

  const handleRemoveIpRange = (idx: number) => {
    setIpRanges(ipRanges.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#30363D] pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Security Center
            <span className="text-xs bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950] px-2.5 py-0.5 rounded-full">
              SLA Compliant
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Configure identity federation, MFA controls, sessions access whitelisting, and encryption standards</p>
        </div>
      </div>

      {/* Grid: Left chart, Right settings dials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col items-center justify-between text-center">
          <h4 className="text-xs font-bold uppercase text-[#8B949E] w-full text-left">Enterprise Threat Index Score</h4>
          
          <div className="w-full h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={10} data={RADIAL_DATA} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={5} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">94%</span>
              <span className="text-[9px] text-[#3FB950] font-bold">EXCELLENT</span>
            </div>
          </div>

          <div className="text-[10px] text-[#8B949E] space-y-1 w-full text-left border-t border-[#30363D]/40 pt-3">
            <div className="flex justify-between"><span>MFA Authentication Status</span><span className="text-white font-bold">100% Enforced</span></div>
            <div className="flex justify-between"><span>Okta SAML Integration</span><span className="text-white font-bold">Federated</span></div>
            <div className="flex justify-between"><span>API Gateway Encryption</span><span className="text-white font-bold">TLS 1.3 Active</span></div>
          </div>
        </div>

        {/* Status settings cards */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 lg:col-span-2 space-y-5 text-xs">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">Gateway Controls</h4>

          {/* MFA */}
          <div className="flex justify-between items-center pb-3 border-b border-[#30363D]/60">
            <div>
              <span className="font-bold text-[#F0F6FC] block">Multi-Factor Authentication (2FA)</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5">Enforce MFA enrollment checks on all users logins.</span>
            </div>
            <button
              onClick={() => setTwoFaEnforced(!twoFaEnforced)}
              className={`w-10 h-5 rounded-full relative transition-all ${
                twoFaEnforced ? "bg-[#3FB950]" : "bg-[#30363D]"
              }`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                twoFaEnforced ? "right-1" : "left-1"
              }`} />
            </button>
          </div>

          {/* Federated SSO */}
          <div className="space-y-3">
            <span className="font-bold text-[#F0F6FC] block">Federated Single Sign-On (SSO)</span>
            <div className="grid grid-cols-3 gap-2">
              {["saml", "oidc", "none"].map(prov => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setSsoProvider(prov)}
                  className={`p-2 rounded-lg border text-center font-bold transition-all uppercase text-[10px] ${
                    ssoProvider === prov
                      ? "bg-[#21262D] border-[#8957E5] text-white"
                      : "bg-[#0D1117] border-[#30363D] text-[#8B949E]"
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>

            {ssoProvider === "saml" && (
              <div className="space-y-3 pt-2 text-[11px]">
                <div className="space-y-1">
                  <span className="text-[#8B949E]">IdP Single Sign-On URL</span>
                  <input
                    type="text"
                    value={samlEndpoint}
                    onChange={(e) => setSamlEndpoint(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[#8B949E]">IdP Entity ID URI</span>
                  <input
                    type="text"
                    value={samlEntityId}
                    onChange={(e) => setSamlEntityId(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IP Whitelist Editor */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase text-[#8B949E]">Gateway IP Access Whitelisting (CIDR Range Checks)</h4>

        <div className="space-y-3 text-xs">
          <form onSubmit={handleAddIpRange} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. 192.168.1.0/24 or 203.0.113.82/32"
              value={newIpRange}
              onChange={(e) => setNewIpRange(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E]/70 focus:outline-none flex-1"
            />
            <button type="submit" className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-lg font-bold">
              Add Range
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-2">
            {ipRanges.map((ip, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-[#0D1117] border border-[#30363D] px-2.5 py-1 rounded text-[#F0F6FC]">
                <code>{ip}</code>
                <button type="button" onClick={() => handleRemoveIpRange(idx)} className="text-[#8B949E] hover:text-[#F85149] ml-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Tables */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#30363D]">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">Active Clients Sessions</h4>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#21262D]/40 text-[#8B949E] uppercase tracking-wider font-mono">
                <th className="p-4">User</th>
                <th className="p-4">Device</th>
                <th className="p-4">Browser / OS</th>
                <th className="p-4">Geography Location</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Revocation</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SESSIONS.map((sess) => (
                <tr key={sess.id} className="border-b border-[#30363D]/60 hover:bg-[#21262D]/20">
                  <td className="p-4 font-bold text-[#F0F6FC]">@{sess.user}</td>
                  <td className="p-4">{sess.device}</td>
                  <td className="p-4 text-[#8B949E]">{sess.browser}</td>
                  <td className="p-4">{sess.location}</td>
                  <td className="p-4">
                    <code>{sess.ip}</code>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-[#3FB950]/15 text-[#3FB950] px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">
                      {sess.active}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-[10px] font-bold text-[#F85149] hover:underline">
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
