"use client";

import { useState, useEffect } from "react";
import { UserDashboardData } from "@/types";

interface SettingsTabProps {
  data: UserDashboardData;
  onTokenUpdate: (token: string) => void;
}

export default function SettingsTab({ data, onTokenUpdate }: SettingsTabProps) {
  const { profile } = data;
  
  const [tokenInput, setTokenInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Local state for simulated profile editor
  const [profileName, setProfileName] = useState(profile.name || profile.login);
  const [profileBio, setProfileBio] = useState(profile.bio || "Software Engineer & Builder");
  const [profileLocation, setProfileLocation] = useState(profile.location || "Earth");
  const [profileCompany, setProfileCompany] = useState(profile.company || "Independent");
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Visual preferences state
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("devtrack_github_token") || "";
      setTokenInput(storedToken);

      const animPref = localStorage.getItem("devtrack_pref_animations");
      setEnableAnimations(animPref !== "false");

      const contrastPref = localStorage.getItem("devtrack_pref_high_contrast");
      setHighContrast(contrastPref === "true");
    }
  }, []);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (tokenInput.trim()) {
        localStorage.setItem("devtrack_github_token", tokenInput.trim());
        onTokenUpdate(tokenInput.trim());
        setStatusMessage("Personal Access Token successfully saved!");
      } else {
        localStorage.removeItem("devtrack_github_token");
        onTokenUpdate("");
        setStatusMessage("Token cleared. Using public rate limits.");
      }
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  const handleToggleAnimations = (checked: boolean) => {
    setEnableAnimations(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_pref_animations", String(checked));
    }
  };

  const handleToggleContrast = (checked: boolean) => {
    setHighContrast(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_pref_high_contrast", String(checked));
    }
  };

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("devtrack_profile_")) {
          localStorage.removeItem(key);
        }
      });
      alert("Cached developer profiles cleared! Refreshing will request fresh API payloads.");
    }
  };

  const handleDeleteSyncData = () => {
    if (confirm("Are you sure you want to unlink your account and delete all cached workspace databases? This cannot be undone.")) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        alert("All local databases and session caches cleared. Please reload the page.");
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Configuration Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Editor Panel */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold font-space-grotesk text-[#F0F6FC]">
                Profile Metadata Editor
              </h3>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Customize local metadata variables displayed across your DevTrack dashboards.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#8B949E] uppercase mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] text-xs font-semibold focus:border-[#58A6FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#8B949E] uppercase mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] text-xs font-semibold focus:border-[#58A6FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#8B949E] uppercase mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] text-xs font-semibold focus:border-[#58A6FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#8B949E] uppercase mb-1.5">
                    Role Headline
                  </label>
                  <input
                    type="text"
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] text-xs font-semibold focus:border-[#58A6FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#1F6FEB] hover:bg-[#58A6FF] px-4 py-2 text-xs font-bold text-white transition-colors focus:outline-none cursor-pointer"
                >
                  Save Profile Info
                </button>
                {profileSavedMsg && (
                  <span className="text-xs text-[#3FB950] font-semibold animate-pulse">
                    ✓ Profile saved locally!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* GitHub Credentials config */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold font-space-grotesk text-[#F0F6FC]">
                GitHub Access Credentials
              </h3>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Increase API rate limits and analyze private repositories securely.
              </p>
            </div>

            <form onSubmit={handleSaveToken} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#8B949E] uppercase mb-1.5">
                  Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full max-w-lg px-3 py-2.5 rounded-lg border border-[#30363D] bg-[#0D1117] text-[#F0F6FC] placeholder:text-[#8B949E]/40 text-xs font-semibold focus:border-[#58A6FF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-[#30363D] hover:bg-[#161B22] border border-[#30363D] px-4 py-2.5 text-xs font-bold text-[#F0F6FC] transition-colors focus:outline-none cursor-pointer"
                >
                  Update Credentials
                </button>
                {statusMessage && (
                  <span className="text-xs text-[#3FB950] font-semibold">{statusMessage}</span>
                )}
              </div>
            </form>

            <div className="rounded-lg bg-[#0D1117]/50 border border-[#30363D]/40 p-3.5 font-mono text-[10px] text-[#8B949E] leading-relaxed">
              <span className="text-[#58A6FF] font-bold">Security Notice:</span> Tokens are saved entirely client-side in your local browser storage. We never transfer your keys to any external servers.
            </div>
          </div>

          {/* Visual Preferences */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 space-y-4">
            <h3 className="text-base font-bold font-space-grotesk text-[#F0F6FC]">
              Visual Preferences
            </h3>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAnimations}
                  onChange={(e) => handleToggleAnimations(e.target.checked)}
                  className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                />
                <div>
                  <span className="block text-xs font-bold text-[#F0F6FC]">Enable Micro-animations</span>
                  <span className="block text-[10px] text-[#8B949E]">Activate smooth Framer Motion-style state transitions and charts animations.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => handleToggleContrast(e.target.checked)}
                  className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                />
                <div>
                  <span className="block text-xs font-bold text-[#F0F6FC]">High Contrast Borders</span>
                  <span className="block text-[10px] text-[#8B949E]">Increase border visibility across cards and tabs for screen readability.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Status, Session logs & Danger zone */}
        <div className="space-y-6">
          
          {/* Connection Status panel */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
              Integration Status
            </h4>

            <div className="flex items-center justify-between border-b border-[#30363D]/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3FB950] animate-pulse" />
                <span className="text-xs font-bold text-[#F0F6FC]">GitHub Connected</span>
              </div>
              <span className="text-[10px] font-mono text-[#8B949E]">v4 REST/GraphQL</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8B949E]">Connected User:</span>
                <span className="font-mono font-bold text-[#58A6FF]">@{profile.login}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8B949E]">Scope Access:</span>
                <span className="font-mono text-[#F0F6FC]">{tokenInput ? "Read-Write + Private" : "Read-Only (Public)"}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8B949E]">API Rate Status:</span>
                <span className="font-mono text-[#3FB950]">{tokenInput ? "4,992 / 5,000 req" : "58 / 60 req"}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8B949E]">Last Synced:</span>
                <span className="font-mono text-[#F0F6FC]">Just Now</span>
              </div>
            </div>
          </div>

          {/* Active Session logs */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-3.5">
            <h4 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
              Active Session Logs
            </h4>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <svg className="h-4.5 w-4.5 text-[#58A6FF] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-[10px] leading-relaxed">
                  <div className="font-bold text-[#F0F6FC]">Windows Desktop Client</div>
                  <div className="text-[#8B949E] font-mono">192.168.1.25 • Active Session</div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start opacity-60">
                <svg className="h-4.5 w-4.5 text-[#8B949E] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="text-[10px] leading-relaxed">
                  <div className="font-bold text-[#F0F6FC]">iPhone Chrome Mobile</div>
                  <div className="text-[#8B949E] font-mono">102.88.42.11 • 2 Hours Ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-[#F85149]/40 bg-[#F85149]/5 p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-[#F85149] uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F85149] animate-pulse" />
              Danger Zone
            </h4>

            <div className="space-y-2.5">
              <button
                onClick={handleClearCache}
                className="w-full rounded-lg border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] py-2 text-xs font-bold text-[#F0F6FC] transition-colors focus:outline-none cursor-pointer"
              >
                Clear Profile Cache
              </button>

              <button
                onClick={handleDeleteSyncData}
                className="w-full rounded-lg bg-[#F85149] hover:bg-[#F85149]/80 py-2 text-xs font-bold text-white transition-colors focus:outline-none cursor-pointer"
              >
                Unlink Account & Clear Databases
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
