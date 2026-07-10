"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Copy,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Terminal,
  Code,
  AlertTriangle,
  Check,
  RotateCw,
  Trash2,
  Lock,
  Globe
} from "lucide-react";

// Mock API Keys
const INITIAL_KEYS = [
  { id: "key-1", name: "Production Main Gateway", type: "production", prefix: "dtk_prod_", key: "dtk_prod_4a1s928fh203kld", created: "Jan 12, 2026", expires: "Jan 12, 2027", lastUsed: "2m ago", usage: 145028, status: "active" },
  { id: "key-2", name: "Staging Sandbox Integration", type: "sandbox", prefix: "dtk_sbx_", key: "dtk_sbx_91ks83hdj20skla", created: "Feb 15, 2026", expires: "Never", lastUsed: "1h ago", usage: 4509, status: "active" },
  { id: "key-3", name: "CI/CD Deployment Token", type: "write", prefix: "dtk_write_", key: "dtk_write_83jdklsi920dskl", created: "Mar 01, 2026", expires: "Jun 01, 2026", lastUsed: "3d ago", usage: 1240, status: "active" },
  { id: "key-4", name: "Recruiter Resume Read Token", type: "read", prefix: "dtk_read_", key: "dtk_read_74kdis920dkdksl", created: "Apr 05, 2026", expires: "May 05, 2026", lastUsed: "2w ago", usage: 89, status: "expired" }
];

export default function ApiKeysPanel() {
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New key forms
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState("production");
  const [newKeyExpiry, setNewKeyExpiry] = useState("never");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const randomVal = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const prefix = newKeyType === "production" ? "dtk_prod_" : newKeyType === "sandbox" ? "dtk_sbx_" : "dtk_temp_";
    const fullKeyString = `${prefix}${randomVal}`;

    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      type: newKeyType,
      prefix,
      key: fullKeyString,
      created: "Invited today",
      expires: newKeyExpiry === "never" ? "Never" : "30 Days",
      lastUsed: "never",
      usage: 0,
      status: "active"
    };

    setKeys([newKey, ...keys]);
    setGeneratedKey(fullKeyString);
  };

  const handleRevoke = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: "revoked" } : k));
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            API Keys Console
            <span className="text-xs bg-[#21262D] border border-[#30363D] px-2.5 py-0.5 rounded-full text-[#8B949E]">
              {keys.filter(k => k.status === "active").length} Active
            </span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Expose telemetry gateways, profile details, and grade aggregates to third-party endpoints</p>
        </div>

        <button
          onClick={() => { setGeneratedKey(null); setGenerateModalOpen(true); }}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          <Plus size={14} />
          Generate New API Key
        </button>
      </div>

      {/* Keys Table Card */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#21262D]/40 text-[#8B949E] uppercase tracking-wider font-mono">
                <th className="p-4">Key Identifier</th>
                <th className="p-4">Authorization Scope</th>
                <th className="p-4">Masked Hash</th>
                <th className="p-4">Expiration</th>
                <th className="p-4">Calls Counter</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-[#30363D]/60 hover:bg-[#21262D]/20">
                  <td className="p-4 font-bold text-[#F0F6FC]">{k.name}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      k.type === "production" ? "bg-[#8957E5]/15 border border-[#8957E5]/30 text-[#8957E5]" : "bg-[#2F81F7]/15 border border-[#2F81F7]/30 text-[#2F81F7]"
                    }`}>
                      {k.type}
                    </span>
                  </td>
                  <td className="p-4 text-[#8B949E]">
                    <code>{k.prefix}••••••••</code>
                  </td>
                  <td className="p-4 text-[#8B949E]">{k.expires}</td>
                  <td className="p-4 font-bold">{k.usage.toLocaleString()}</td>
                  <td className="p-4 text-[#8B949E]">{k.lastUsed}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      k.status === "active" ? "bg-[#3FB950]" : k.status === "expired" ? "bg-[#D29922]" : "bg-[#F85149]"
                    }`} />
                  </td>
                  <td className="p-4 text-right flex gap-1.5 justify-end">
                    <button
                      onClick={() => handleCopy(k.id, k.key)}
                      className="p-1 hover:bg-[#21262D] rounded text-[#8B949E] hover:text-[#F0F6FC]"
                      title="Copy Key"
                    >
                      {copiedKeyId === k.id ? <Check size={14} className="text-[#3FB950]" /> : <Copy size={14} />}
                    </button>
                    {k.status === "active" && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="p-1 hover:bg-danger/10 hover:text-danger rounded text-[#8B949E]"
                        title="Revoke Key"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AUTO-GENERATED API DOCUMENTATION ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-[#8B949E]">REST Endpoint Documentation</h3>

        <div className="space-y-4">
          {[
            { method: "GET", path: "/v1/developer/:username", desc: "Retrieve composite developer grade metrics, profile headers, and general timelines." },
            { method: "GET", path: "/v1/organizations/:slug/metrics", desc: "Aggregate organization-wide velocity scores, repository counts, and average developer grades." }
          ].map((doc, idx) => (
            <div key={idx} className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold bg-[#2F81F7]/15 border border-[#2F81F7]/30 text-[#2F81F7] px-2 py-0.5 rounded">
                  {doc.method}
                </span>
                <code className="text-[#F0F6FC] font-semibold">{doc.path}</code>
              </div>
              <p className="text-xs text-[#8B949E]">{doc.desc}</p>

              {/* Monospace Code sample */}
              <div className="bg-[#0D1117] border border-[#30363D] p-3 rounded-lg text-[11px] text-[#8B949E] overflow-x-auto space-y-1">
                <code>curl -H "Authorization: Bearer dtk_prod_••••" https://api.devtrack.com{doc.path}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GENERATE KEY MODAL ── */}
      <AnimatePresence>
        {generateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg hover:bg-[#21262D]"
              >
                <X size={16} />
              </button>

              <div className="p-6 border-b border-[#30363D]">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Key size={18} className="text-[#8957E5]" /> Create Access Gateway Key
                </h3>
                <p className="text-xs text-[#8B949E] mt-1">Spin up credentials for API clients integration</p>
              </div>

              {!generatedKey ? (
                <form onSubmit={handleGenerateKey} className="p-6 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[#8B949E] font-semibold">Key Identifier Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AWS Jenkins Integrator"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] placeholder-[#8B949E]/70 focus:outline-none focus:border-[#8957E5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#8B949E] font-semibold">Key Scope Type</label>
                    <select
                      value={newKeyType}
                      onChange={(e) => setNewKeyType(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none"
                    >
                      <option value="production">Production Access (All repos read)</option>
                      <option value="sandbox">Sandbox Testing (Simulated context)</option>
                      <option value="write">Write/Push (Integration trigger)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-[#30363D]">
                    <button
                      type="button"
                      onClick={() => setGenerateModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-[#30363D] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8957E5] to-[#2F81F7] text-white font-semibold active:scale-95 transition-all"
                    >
                      Generate Key
                    </button>
                  </div>
                </form>
              ) : (
                /* Show Generated Key (One Time warning) */
                <div className="p-6 space-y-4 text-xs">
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="text-warning flex-shrink-0" size={16} />
                    <p className="text-[10px] text-warning">
                      Make sure to copy this secret. It is not shown anywhere again for security configurations.
                    </p>
                  </div>

                  <div className="bg-[#0D1117] border border-[#30363D] p-3 rounded-lg flex items-center justify-between font-mono break-all text-xs">
                    <code className="text-white select-all">{generatedKey}</code>
                    <button
                      onClick={() => handleCopy("new-key", generatedKey)}
                      className="p-2 bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] rounded-lg transition-all"
                    >
                      {copiedKeyId === "new-key" ? <Check size={14} className="text-[#3FB950]" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#30363D]">
                    <button
                      type="button"
                      onClick={() => setGenerateModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] font-semibold"
                    >
                      I Have Stored the Key
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
