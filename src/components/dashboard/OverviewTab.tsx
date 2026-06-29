"use client";

import { useState } from "react";
import { UserDashboardData } from "@/types";
import { formatNumber, calculateAccountAge } from "@/lib/utils";
import ContributionHeatmap from "./ContributionHeatmap";
import DashboardCustomizer, { WidgetConfig } from "./DashboardCustomizer";
import AchievementsSection from "./AchievementsSection";
import DeveloperMilestones from "./DeveloperMilestones";
import ActivityTimeline from "./ActivityTimeline";

interface OverviewTabProps {
  data: UserDashboardData;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const { profile, contributions, score, languages } = data;
  const [showWhyGrade, setShowWhyGrade] = useState(false);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);

  const isWidgetVisible = (id: string) => {
    if (widgetConfigs.length === 0) return true;
    const item = widgetConfigs.find((w) => w.id === id);
    return item ? item.visible : true;
  };

  const getGradeStyle = (gradeStr: string, isAvail: boolean) => {
    if (!isAvail || gradeStr === "Grade unavailable") {
      return { color: "text-[#8B949E]", stroke: "#8B949E", label: "Grade Unavailable" };
    }
    if (gradeStr === "S" || gradeStr === "A+") return { color: "text-[#3FB950]", stroke: "#3FB950", label: `Grade ${gradeStr}` };
    if (gradeStr === "A" || gradeStr === "B+") return { color: "text-[#58A6FF]", stroke: "#58A6FF", label: `Grade ${gradeStr}` };
    if (gradeStr === "B" || gradeStr === "C+") return { color: "text-[#D29922]", stroke: "#D29922", label: `Grade ${gradeStr}` };
    return { color: "text-[#F85149]", stroke: "#F85149", label: `Grade ${gradeStr}` };
  };

  const gradeStyle = getGradeStyle(score.grade || "D", score.isAvailable ?? true);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score.isAvailable ? score.overall : 0) / 100) * circumference;

  const totalContribs = contributions.totalCommits + contributions.totalPRs + contributions.totalIssues;

  return (
    <div className="space-y-6">
      {/* Dashboard Customizer Bar */}
      <DashboardCustomizer onLayoutChange={setWidgetConfigs} />

      {/* 3-Column Hero Section (Developer Command Center) */}
      {isWidgetVisible("command_center") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6">
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-5 flex gap-4 items-start border-b lg:border-b-0 lg:border-r border-[#30363D] pb-6 lg:pb-0 lg:pr-6">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.name || profile.login}
                className="h-16 w-16 rounded-full border border-[#30363D] object-cover bg-[#1C2128]"
              />
            )}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-lg font-bold font-space-grotesk text-[#F0F6FC] truncate">
                  {profile.name || profile.login}
                </h2>
                <span className="text-[10px] text-[#8B949E] font-mono">
                  @{profile.login}
                </span>
              </div>
              
              {profile.bio && (
                <p className="text-xs text-[#8B949E] leading-relaxed max-w-sm line-clamp-3">
                  {profile.bio}
                </p>
              )}

              <div className="space-y-1.5 pt-2 text-[11px] text-[#8B949E]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {profile.location && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Joined {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                </div>

                {profile.blog && (
                  <div className="pt-0.5">
                    <a
                      href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#58A6FF] hover:underline break-all"
                    >
                      <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      </svg>
                      <span>{profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column: Developer Grade */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#30363D] pb-6 lg:pb-0">
            <div className="relative flex items-center justify-center h-32 w-32">
              <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-[#30363D]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={gradeStyle.stroke}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="text-center z-10">
                <span className={`text-3xl font-black font-space-grotesk tracking-tight ${gradeStyle.color}`}>
                  {score.isAvailable ? score.grade : "N/A"}
                </span>
                {score.isAvailable && (
                  <div className="text-[10px] font-mono text-[#8B949E] font-bold">
                    {score.overall} / 100
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowWhyGrade(!showWhyGrade)}
              className="mt-2 text-[10px] font-mono text-[#58A6FF] hover:underline"
            >
              {showWhyGrade ? "Hide breakdown ▲" : "Why this grade? ▼"}
            </button>
          </div>

          {/* Right Column: Key Metric Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
              <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Contributions</div>
              <div className="text-base font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                {formatNumber(totalContribs)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
              <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Stars Earned</div>
              <div className="text-base font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                {formatNumber(contributions.totalStarsEarned)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
              <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Public Repos</div>
              <div className="text-base font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                {formatNumber(profile.public_repos)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
              <div className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">Commit Velocity</div>
              <div className="text-base font-bold font-space-grotesk text-[#3FB950] mt-1">
                High
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Grid (2 Rows of Stat Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Repositories</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {profile.public_repos}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Public codebases indexed.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Commits</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {formatNumber(contributions.totalCommits)}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Pushes in public repositories.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Stars Earned</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {formatNumber(contributions.totalStarsEarned)}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Community stars accumulated.</p>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#3FB950]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Current Streak</span>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#3FB950] mt-2">
            {contributions.currentStreak} Days
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Active consecutive commit days.</p>
        </div>
      </div>

      {/* Developer Achievements Widget */}
      {isWidgetVisible("achievements") && <AchievementsSection data={data} />}

      {/* Developer Milestones Widget */}
      {isWidgetVisible("milestones") && <DeveloperMilestones data={data} />}

      {/* Activity Timeline Feed Widget */}
      {isWidgetVisible("activity_timeline") && <ActivityTimeline data={data} />}

      {/* Contribution Heatmap Matrix Widget */}
      {isWidgetVisible("heatmap") && (
        <ContributionHeatmap dailyContributions={contributions.dailyContributions} />
      )}
    </div>
  );
}
