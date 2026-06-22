"use client";

import { UserDashboardData } from "@/types";
import { formatNumber, calculateAccountAge } from "@/lib/utils";

interface OverviewTabProps {
  data: UserDashboardData;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const { profile, contributions } = data;

  // Generate GitHub-style contribution cells for the last 365 days (53 weeks)
  const renderContributionGrid = () => {
    const cells: { dateStr: string; count: number; level: number }[] = [];
    const today = new Date();
    
    // Start from 364 days ago (to align nicely with weeks)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    // Make sure we start on the correct day of the week to align columns
    // We want startDate to be a Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const totalDays = 371; // 53 weeks * 7 days
    const tempDate = new Date(startDate);

    for (let i = 0; i < totalDays; i++) {
      const dateStr = tempDate.toISOString().split("T")[0];
      const count = contributions.dailyContributions[dateStr] || 0;
      
      // Determine green intensity levels
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 4) level = 2;
      else if (count > 4 && count <= 8) level = 3;
      else if (count > 8) level = 4;

      cells.push({ dateStr, count, level });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Group cells into weeks (each week has 7 days)
    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return (
      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="flex gap-[3px] min-w-[680px]">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dIndex) => {
                // Set custom color weights based on level
                let colorClass = "bg-[#161B22]"; // Empty level 0
                if (day.level === 1) colorClass = "bg-[#0e4429]";
                if (day.level === 2) colorClass = "bg-[#006d32]";
                if (day.level === 3) colorClass = "bg-[#26a641]";
                if (day.level === 4) colorClass = "bg-[#39d353]";

                return (
                  <div
                    key={dIndex}
                    className={`h-[10px] w-[10px] rounded-[1.5px] transition-colors hover:scale-125 ${colorClass}`}
                    title={`${day.count} contributions on ${day.dateStr}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="h-20 w-20 rounded-full border border-border object-cover bg-surface-secondary"
            />
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-text-primary">
                {profile.name || profile.login}
              </h2>
              <span className="text-xs text-text-secondary font-mono bg-surface-secondary border border-border px-2 py-0.5 rounded">
                @{profile.login}
              </span>
            </div>
            
            {profile.bio && (
              <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs text-text-secondary">
              {profile.company && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.blog && (
                <a
                  href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-accent hover:underline"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>{profile.blog}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Social Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="text-center md:text-left">
            <div className="text-xs text-text-secondary uppercase">Followers</div>
            <div className="text-lg font-bold font-space-grotesk text-text-primary mt-1">
              {formatNumber(profile.followers)}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-xs text-text-secondary uppercase">Following</div>
            <div className="text-lg font-bold font-space-grotesk text-text-primary mt-1">
              {formatNumber(profile.following)}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-xs text-text-secondary uppercase">Public Repos</div>
            <div className="text-lg font-bold font-space-grotesk text-text-primary mt-1">
              {profile.public_repos}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-xs text-text-secondary uppercase">Stars</div>
            <div className="text-lg font-bold font-space-grotesk text-text-primary mt-1">
              {formatNumber(contributions.totalStarsEarned)}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-xs text-text-secondary uppercase">Forks</div>
            <div className="text-lg font-bold font-space-grotesk text-text-primary mt-1">
              {formatNumber(contributions.totalForksEarned)}
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-xs text-text-secondary uppercase">Account Age</div>
            <div className="text-xs font-bold font-space-grotesk text-text-primary mt-1.5 whitespace-nowrap">
              {calculateAccountAge(profile.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Calendar Activity Grid */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-bold font-space-grotesk text-text-primary">
            Contribution History (Last 365 Days)
          </h3>
          
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-[1px] bg-[#161B22]" />
            <div className="h-2.5 w-2.5 rounded-[1px] bg-[#0e4429]" />
            <div className="h-2.5 w-2.5 rounded-[1px] bg-[#006d32]" />
            <div className="h-2.5 w-2.5 rounded-[1px] bg-[#26a641]" />
            <div className="h-2.5 w-2.5 rounded-[1px] bg-[#39d353]" />
            <span>More</span>
          </div>
        </div>

        {renderContributionGrid()}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/60 text-center font-mono">
          <div>
            <div className="text-xs text-text-secondary">TOTAL COMMITS</div>
            <div className="text-lg font-bold text-text-primary mt-1">{contributions.totalCommits}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary">LONGEST STREAK</div>
            <div className="text-lg font-bold text-success mt-1">{contributions.longestStreak} Days</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary">ACTIVE MONTHS</div>
            <div className="text-lg font-bold text-accent mt-1">{contributions.activeMonthsCount} / 12</div>
          </div>
        </div>
      </div>
    </div>
  );
}
