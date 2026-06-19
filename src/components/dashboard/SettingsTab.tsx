"use client";

import { useState, useEffect } from "react";
import { UserDashboardData } from "@/types";

interface SettingsTabProps {
  data: UserDashboardData;
  onTokenUpdate: (token: string) => void;
}

export default function SettingsTab({ data, onTokenUpdate }: SettingsTabProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("devtrack_github_token") || "";
      setTokenInput(storedToken);
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

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      // Clear specific user cached profiles
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("devtrack_profile_")) {
          localStorage.removeItem(key);
        }
      });
      alert("Cached developer profiles cleared! Refreshing will request fresh API payloads.");
    }
  };

  return (
    <div className="space-y-6">
      {/* GitHub Token Config */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-base font-bold font-space-grotesk text-text-primary mb-2">
          GitHub Access Credentials
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          The public GitHub API is restricted to 60 requests per hour. If you run into rate limits or wish to analyze private repositories, provide a GitHub Personal Access Token (PAT).
        </p>

        <form onSubmit={handleSaveToken} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-2">
              Personal Access Token (PAT)
            </label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full max-w-lg px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-secondary/40 text-xs font-semibold focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent/90 transition-colors focus:outline-none"
            >
              Save Credentials
            </button>
            {statusMessage && (
              <span className="text-xs text-success font-semibold animate-fadeIn">{statusMessage}</span>
            )}
          </div>
        </form>

        <div className="mt-6 rounded-lg bg-background/50 border border-border/40 p-4 font-mono text-[10px] text-text-secondary leading-relaxed">
          <span className="text-accent font-bold">Security Notice:</span> Tokens are saved entirely client-side in your local browser storage. We never transfer your keys to any external servers.
        </div>
      </div>

      {/* Storage & Local Cache */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-base font-bold font-space-grotesk text-text-primary mb-2">
          Storage & Caching
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          Developer profiles and computed score outputs are cached locally to speed up navigation. You can clear this cache to force fresh GitHub API calls.
        </p>

        <button
          onClick={handleClearCache}
          className="rounded-lg border border-border bg-surface hover:bg-surface-secondary px-4 py-2.5 text-xs font-bold text-text-primary hover:text-danger hover:border-danger/30 transition-all focus:outline-none"
        >
          Clear Local Profile Cache
        </button>
      </div>
    </div>
  );
}
