"use client";

import { UserDashboardData } from "@/types";
import { formatNumber, calculateAccountAge } from "@/lib/utils";
import { useTheme } from "@/components/ui/ThemeContext";

interface OverviewTabProps {
  data: UserDashboardData;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const { profile, contributions, score, languages } = data;

  const getGradeInfo = (val: number) => {
    if (val >= 95) return { grade: "S+", label: "Elite Architect", percentile: "Top 1%", color: "text-[#3FB950]", stroke: "#3FB950" };
    if (val >= 90) return { grade: "A+", label: "Principal Engineer", percentile: "Top 3%", color: "text-[#3FB950]", stroke: "#3FB950" };
    if (val >= 85) return { grade: "A", label: "Senior Lead Engineer", percentile: "Top 5%", color: "text-[#58A6FF]", stroke: "#58A6FF" };
    if (val >= 80) return { grade: "A-", label: "Senior Engineer", percentile: "Top 10%", color: "text-[#58A6FF]", stroke: "#58A6FF" };
    if (val >= 75) return { grade: "B+", label: "Mid-Level Engineer", percentile: "Top 15%", color: "text-[#D29922]", stroke: "#D29922" };
    if (val >= 70) return { grade: "B", label: "Mid-Level Engineer", percentile: "Top 25%", color: "text-[#D29922]", stroke: "#D29922" };
    if (val >= 60) return { grade: "C+", label: "Junior Engineer", percentile: "Top 40%", color: "text-[#F85149]", stroke: "#F85149" };
    if (val >= 50) return { grade: "C", label: "Associate Builder", percentile: "Top 60%", color: "text-[#F85149]", stroke: "#F85149" };
    return { grade: "D", label: "Novice Builder", percentile: "Top 80%", color: "text-[#8B949E]", stroke: "#8B949E" };
  };

  const gradeInfo = getGradeInfo(score.overall);

  // SVG Progress Circle math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;

  const { chartSettings } = useTheme();

  // Generate GitHub-style contribution cells for the last 365 days (53 weeks)
  const renderContributionGrid = () => {
    const cells: { dateStr: string; count: number; level: number }[] = [];
    const today = new Date();
    
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const totalDays = 371; // 53 weeks * 7 days
    const tempDate = new Date(startDate);

    for (let i = 0; i < totalDays; i++) {
      const dateStr = tempDate.toISOString().split("T")[0];
      const count = contributions.dailyContributions[dateStr] || 0;
      
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 4) level = 2;
      else if (count > 4 && count <= 8) level = 3;
      else if (count > 8) level = 4;

      cells.push({ dateStr, count, level });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return (
      <div className="overflow-x-auto scrollbar-none pb-2">
        <div className="flex gap-[3px] min-w-[720px]">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dIndex) => {
                let cellStyle: React.CSSProperties = {};
                let colorClass = "";
                
                if (chartSettings.heatmapStyle === "github") {
                  if (day.level === 0) colorClass = "bg-surface-secondary/40 border border-border/10";
                  else if (day.level === 1) colorClass = "bg-[#0e4429]";
                  else if (day.level === 2) colorClass = "bg-[#006d32]";
                  else if (day.level === 3) colorClass = "bg-[#26a641]";
                  else if (day.level === 4) colorClass = "bg-[#39d353]";
                } else if (chartSettings.heatmapStyle === "devtrack") {
                  if (day.level === 0) {
                    cellStyle = { backgroundColor: "var(--surface-secondary)", opacity: 0.4 };
                  } else {
                    const opacities = [0.22, 0.48, 0.74, 1.0];
                    cellStyle = { backgroundColor: "var(--accent)", opacity: opacities[day.level - 1] };
                  }
                } else {
                  // minimal monochrome
                  if (day.level === 0) {
                    cellStyle = { backgroundColor: "var(--surface-secondary)", opacity: 0.4 };
                  } else {
                    const opacities = [0.18, 0.42, 0.68, 1.0];
                    cellStyle = { backgroundColor: "var(--text-primary)", opacity: opacities[day.level - 1] };
                  }
                }

                return (
                  <div
                    key={dIndex}
                    style={cellStyle}
                    className={`h-[11px] w-[11px] rounded-[1.5px] transition-all hover:scale-125 cursor-pointer ${colorClass}`}
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

  const topLanguages = languages.slice(0, 5);
  const totalLangBytes = topLanguages.reduce((sum, l) => sum + l.bytes, 0);

  return (
    <div className="space-y-6">
      {/* 3-Column Hero Section (Developer Command Center) */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-[#8B949E]">
              {profile.location && (
                <div className="flex items-center gap-1.5 truncate">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="truncate">{profile.location}</span>
                </div>
              )}
              {profile.blog && (
                <a
                  href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#58A6FF] hover:underline truncate"
                >
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  </svg>
                  <span className="truncate">{profile.blog}</span>
                </a>
              )}
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <svg className="h-3.5 w-3.5 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Developer Grade */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#30363D] pb-6 lg:pb-0">
          <div className="relative flex items-center justify-center h-28 w-28">
            {/* SVG Progress Arc */}
            <svg className="absolute transform -rotate-90 w-full h-full">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-[#30363D]"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={gradeInfo.stroke}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center z-10">
              <span className={`text-3xl font-extrabold font-space-grotesk tracking-tight ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </span>
              <div className="text-[10px] font-mono text-[#8B949E] mt-0.5">{score.overall}/100</div>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="block text-xs font-bold text-[#F0F6FC]">{gradeInfo.label}</span>
            <span className="block text-[9px] font-mono text-[#3FB950] font-semibold mt-0.5">{gradeInfo.percentile} Contributor</span>
          </div>
        </div>

        {/* Right Column: Most Used Languages */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-3">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">Language Ecosystem</h3>
          </div>
          {topLanguages.length > 0 ? (
            <div className="space-y-3">
              {/* Distribution Bar */}
              <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-[#161B22]">
                {topLanguages.map((lang) => {
                  const widthPct = totalLangBytes > 0 ? (lang.bytes / totalLangBytes) * 100 : 0;
                  return (
                    <div
                      key={lang.name}
                      style={{ width: `${widthPct}%`, backgroundColor: lang.color }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  );
                })}
              </div>

              {/* Language Legends */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {topLanguages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: lang.color }} />
                    <span className="text-[#F0F6FC] font-semibold">{lang.name}</span>
                    <span className="text-[#8B949E]">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] italic">No language data compiled.</div>
          )}
        </div>

      </div>

      {/* Metric Grid (2 Rows of Stat Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Repos */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Repositories</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {profile.public_repos}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Public codebases indexed.</p>
        </div>

        {/* Stat 2: Total Commits */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Commits</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {formatNumber(contributions.totalCommits)}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Pushes in public repositories.</p>
        </div>

        {/* Stat 3: Total Stars */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Stars Earned</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {formatNumber(contributions.totalStarsEarned)}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Community stars accumulated.</p>
        </div>

        {/* Stat 4: Total Forks */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Forks Earned</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-4" />
            </svg>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {formatNumber(contributions.totalForksEarned)}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Projects cloned by developers.</p>
        </div>

        {/* Stat 5: Current Streak */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#3FB950]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Current Streak</span>
            <svg className="h-4 w-4 text-[#3FB950]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#3FB950] mt-2">
            {contributions.currentStreak} Days
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Active consecutive commit days.</p>
        </div>

        {/* Stat 6: Longest Streak */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Longest Streak</span>
            <svg className="h-4 w-4 text-[#58A6FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {contributions.longestStreak} Days
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">All-time record streak.</p>
        </div>

        {/* Stat 7: Followers */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Followers</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-2">
            {formatNumber(profile.followers)}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Developers following profile.</p>
        </div>

        {/* Stat 8: Account Age */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 transition-all hover:border-[#58A6FF]/40">
          <div className="flex justify-between items-start text-[#8B949E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Account Age</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm font-bold font-space-grotesk text-[#F0F6FC] mt-[10px] truncate leading-tight">
            {calculateAccountAge(profile.created_at)}
          </div>
          <p className="text-[9px] text-[#8B949E] mt-1">Time elapsed since register.</p>
        </div>
      </div>

      {/* Contribution Calendar & Analytics */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#30363D] pb-4">
          <div>
            <h3 className="text-sm font-bold font-space-grotesk text-[#F0F6FC]">
              Contribution Command Center
            </h3>
            <p className="text-[10px] text-[#8B949E] mt-0.5">Real-time contribution frequency over the past 365 days.</p>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-[#8B949E] font-mono">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#161B22]" />
            <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#0e4429]" />
            <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#006d32]" />
            <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#26a641]" />
            <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#39d353]" />
            <span>More</span>
          </div>
        </div>

        {renderContributionGrid()}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#30363D] text-center font-mono text-xs">
          <div>
            <div className="text-[10px] text-[#8B949E] uppercase">TOTAL CONTRIBUTIONS</div>
            <div className="text-base font-bold text-[#F0F6FC] mt-1">
              {contributions.dailyContributions ? Object.values(contributions.dailyContributions).reduce((a, b) => a + b, 0) : contributions.totalCommits}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#8B949E] uppercase">CONSISTENCY SCORE</div>
            <div className="text-base font-bold text-[#3FB950] mt-1">{score.consistency} / 100</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8B949E] uppercase">LONGEST STREAK</div>
            <div className="text-base font-bold text-[#58A6FF] mt-1">{contributions.longestStreak} Days</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8B949E] uppercase">ACTIVE MONTHS</div>
            <div className="text-base font-bold text-[#D29922] mt-1">{contributions.activeMonthsCount} / 12</div>
          </div>
        </div>
      </div>
    </div>
  );
}
