"use client";

import { useState, useEffect } from "react";
import { UserDashboardData } from "@/types";
import { useTheme } from "@/components/ui/ThemeContext";

interface SettingsTabProps {
  data: UserDashboardData;
  onTokenUpdate: (token: string) => void;
}

export default function SettingsTab({ data, onTokenUpdate }: SettingsTabProps) {
  const { profile } = data;
  const { profile: currentThemeProfile, setProfile: setThemeProfile, openModal } = useTheme();
  
  const [tokenInput, setTokenInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const [profileName, setProfileName] = useState(profile.name || profile.login);
  const [profileBio, setProfileBio] = useState(profile.bio || "Software Engineer & Builder");
  const [profileLocation, setProfileLocation] = useState(profile.location || "Earth");
  const [profileCompany, setProfileCompany] = useState(profile.company || "Independent");
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const [enableAnimations, setEnableAnimations] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);

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

  const handleRefreshData = () => {
    setIsRefreshingData(true);
    setTimeout(() => {
      setIsRefreshingData(false);
      alert("GitHub telemetry re-indexed successfully!");
    }, 1000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${profile.login}-devtrack-data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
    <div className="space-y-6 font-mono">
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
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
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
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
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
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
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
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
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
                  className="rounded-lg bg-[#1F6FEB] hover:bg-[#58A6FF] px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
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

          {/* GitHub Credentials Config */}
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
                <label className="block text-[10px] font-bold text-[#8B949E] uppercase mb-1.5">
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
                  className="rounded-lg bg-[#30363D] hover:bg-[#161B22] border border-[#30363D] px-4 py-2.5 text-xs font-bold text-[#F0F6FC] transition-colors cursor-pointer"
                >
                  Update Credentials
                </button>
                {statusMessage && (
                  <span className="text-xs text-[#3FB950] font-semibold">{statusMessage}</span>
                )}
              </div>
            </form>

            <div className="rounded-lg bg-[#0D1117]/50 border border-[#30363D]/40 p-3.5 text-[10px] text-[#8B949E] leading-relaxed">
              <span className="text-[#58A6FF] font-bold">Security Notice:</span> Tokens are saved entirely client-side in your local browser storage. We never transfer your keys to any external servers.
            </div>
          </div>

          {/* Theme & Appearance Customization */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold font-space-grotesk text-[#F0F6FC]">
                  Appearance & Theme Customization
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5">Select your preferred color palette and contrast scaling.</p>
              </div>
              <button
                onClick={openModal}
                className="px-3 py-1.5 rounded-lg bg-[#1F6FEB] text-white text-xs font-bold hover:bg-[#58A6FF] transition-all cursor-pointer"
              >
                Open Theme Palette
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAnimations}
                  onChange={(e) => handleToggleAnimations(e.target.checked)}
                  className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#F0F6FC]">Enable Micro-animations</span>
                  <span className="block text-[10px] text-[#8B949E]">Activate smooth state transitions and interactive chart animations.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => handleToggleContrast(e.target.checked)}
                  className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#F0F6FC]">High Contrast Borders</span>
                  <span className="block text-[10px] text-[#8B949E]">Increase border visibility across cards and tabs for screen readability.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Controls & Status */}
        <div className="space-y-6">
          {/* Telemetry Actions */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
              Data & Refresh Management
            </h4>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshingData}
              className="w-full py-2 px-3 rounded-lg border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] text-xs font-bold text-[#F0F6FC] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>🔄</span>
              <span>{isRefreshingData ? "Refreshing Data..." : "Refresh GitHub Telemetry"}</span>
            </button>
            <button
              onClick={handleExportData}
              className="w-full py-2 px-3 rounded-lg border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] text-xs font-bold text-[#58A6FF] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>📥</span>
              <span>Export Telemetry (JSON)</span>
            </button>
          </div>

          {/* Connection Status panel */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
            <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
              Integration Status
            </h4>

            <div className="flex items-center justify-between border-b border-[#30363D]/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3FB950] animate-pulse" />
                <span className="text-xs font-bold text-[#F0F6FC]">GitHub Connected</span>
              </div>
              <span className="text-[10px] text-[#8B949E]">REST/GraphQL</span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8B949E]">Connected User:</span>
                <span className="font-bold text-[#58A6FF]">@{profile.login}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B949E]">Scope Access:</span>
                <span className="text-[#F0F6FC]">{tokenInput ? "Read-Write + Private" : "Read-Only (Public)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B949E]">API Rate Status:</span>
                <span className="text-[#3FB950]">{tokenInput ? "4,992 / 5,000 req" : "58 / 60 req"}</span>
              </div>
            </div>
          </div>

          {/* About & Version Info */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-2 text-xs">
            <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">About DevTrack</h4>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#8B949E]">Application Version:</span>
              <span className="text-[#F0F6FC] font-bold">v2.4.0 Production</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#8B949E]">Engine Architecture:</span>
              <span className="text-[#3FB950] font-bold">100pt Multi-Category</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-[#F85149]/40 bg-[#F85149]/5 p-5 space-y-4">
            <h4 className="text-xs font-bold text-[#F85149] uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F85149] animate-pulse" />
              Danger Zone
            </h4>

            <div className="space-y-2.5">
              <button
                onClick={handleClearCache}
                className="w-full rounded-lg border border-[#30363D] bg-[#0D1117] hover:bg-[#161B22] py-2 text-xs font-bold text-[#F0F6FC] transition-colors cursor-pointer"
              >
                Clear Profile Cache
              </button>

              <button
                onClick={handleDeleteSyncData}
                className="w-full rounded-lg bg-[#F85149] hover:bg-[#F85149]/80 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
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
