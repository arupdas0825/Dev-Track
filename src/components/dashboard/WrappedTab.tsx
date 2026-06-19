"use client";

import { UserDashboardData } from "@/types";

interface WrappedTabProps {
  data: UserDashboardData;
}

export default function WrappedTab({ data }: WrappedTabProps) {
  const { wrapped, profile } = data;

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const shareText = `🚀 My Dev-Track Wrapped for ${wrapped.year}!\n\n💻 Top Language: ${wrapped.mostUsedLanguage}\n🔥 Active Streak: ${wrapped.longestStreak} Days\n🏆 Achievement: ${wrapped.biggestAchievement} - ${wrapped.achievementDescription}\n\nCheck yours at devtrack.io!`;
      navigator.clipboard.writeText(shareText);
      alert("Wrapped summary copied to clipboard! Share it on Twitter/LinkedIn.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Wrapped Core Card Container */}
      <div className="relative max-w-md mx-auto rounded-xl border border-border bg-[#0d131a] p-6 shadow-2xl md:p-8 overflow-hidden font-mono">
        {/* Glow Accent Circles */}
        <div className="absolute -top-12 -right-12 h-32 w-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 bg-success/5 rounded-full blur-2xl pointer-events-none" />

        {/* Wrapped Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-xs font-bold text-text-primary tracking-tight font-space-grotesk">
              DEVTRACK WRAPPED
            </span>
          </div>
          <span className="text-xs text-text-secondary font-bold">{wrapped.year}</span>
        </div>

        {/* User Card Info */}
        <div className="flex items-center gap-3 mt-6">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="h-10 w-10 rounded-full border border-border object-cover bg-surface-secondary"
            />
          )}
          <div>
            <div className="text-xs font-bold text-text-primary">{profile.name || profile.login}</div>
            <div className="text-[9px] text-text-secondary">@{profile.login}</div>
          </div>
        </div>

        {/* Grid Statistics */}
        <div className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded border border-border/40 bg-surface/40 p-3">
              <div className="text-[9px] text-text-secondary uppercase">Top Language</div>
              <div className="text-sm font-bold text-text-primary mt-1 font-space-grotesk">
                {wrapped.mostUsedLanguage}
              </div>
            </div>
            <div className="rounded border border-border/40 bg-surface/40 p-3">
              <div className="text-[9px] text-text-secondary uppercase">Longest Streak</div>
              <div className="text-sm font-bold text-success mt-1 font-space-grotesk">
                {wrapped.longestStreak} Days
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded border border-border/40 bg-surface/40 p-3">
              <div className="text-[9px] text-text-secondary uppercase">Total Commits</div>
              <div className="text-sm font-bold text-text-primary mt-1 font-space-grotesk">
                {wrapped.totalCommits} Pushes
              </div>
            </div>
            <div className="rounded border border-border/40 bg-surface/40 p-3">
              <div className="text-[9px] text-text-secondary uppercase">Top Repository</div>
              <div className="text-xs font-bold text-accent mt-1 truncate">
                {wrapped.mostActiveRepo}
              </div>
            </div>
          </div>

          {/* Achievement segment */}
          <div className="rounded border border-border/40 bg-surface/40 p-3">
            <div className="text-[9px] text-text-secondary uppercase">Core Achievement</div>
            <div className="text-xs font-bold text-success mt-1">
              🏆 {wrapped.biggestAchievement}
            </div>
            <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
              {wrapped.achievementDescription}
            </p>
          </div>

          {/* Percentile Ranking Footer */}
          <div className="text-center rounded border border-accent/20 bg-accent/5 p-3">
            <div className="text-[9px] text-text-secondary uppercase">Global Contributor Standing</div>
            <div className="text-xs font-extrabold text-accent mt-1 font-space-grotesk">
              {wrapped.percentileText}
            </div>
          </div>
        </div>

        {/* Footer Brand Logo link */}
        <div className="flex items-center justify-between text-[8px] text-text-secondary border-t border-border/40 mt-8 pt-4">
          <span>DEVTRACK.IO/WRAPPED</span>
          <span className="text-success font-semibold">VERIFIED INDEX</span>
        </div>
      </div>

      {/* Share Actions */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg bg-text-primary px-4 py-2 text-xs font-bold text-background hover:bg-[#E0E6EC] transition-colors focus:outline-none"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Share Summary
        </button>
      </div>
    </div>
  );
}
