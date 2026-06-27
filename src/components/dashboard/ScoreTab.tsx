"use client";

import { useState } from "react";
import { UserDashboardData } from "@/types";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";

interface ScoreTabProps {
  data: UserDashboardData;
}

export default function ScoreTab({ data }: ScoreTabProps) {
  const { score } = data;
  const [showWhyGrade, setShowWhyGrade] = useState(true);

  const isAvail = score.isAvailable !== false;
  const gradeStr = isAvail ? score.grade || "D" : "Grade unavailable";

  const getScoreColor = (g: string) => {
    if (g === "S" || g === "A+") return "text-[#3FB950] border-[#238636]/30 bg-[#238636]/10";
    if (g === "A" || g === "B+") return "text-[#58A6FF] border-[#1F6FEB]/30 bg-[#1F6FEB]/10";
    if (g === "B" || g === "C+") return "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10";
    return "text-[#F85149] border-[#30363D] bg-[#161B22]";
  };

  const badgeClass = getScoreColor(gradeStr);

  const categories = score.categories || {
    consistency: { score: Math.round((score.consistency / 100) * 20), maxScore: 20, reason: score.breakdown?.consistencyReason || "" },
    repoQuality: { score: Math.round((score.repoQuality / 100) * 20), maxScore: 20, reason: score.breakdown?.repoQualityReason || "" },
    openSource: { score: Math.round((score.openSource / 100) * 15), maxScore: 15, reason: score.breakdown?.openSourceReason || "" },
    communityImpact: { score: Math.round((score.communityImpact / 100) * 15), maxScore: 15, reason: score.breakdown?.communityImpactReason || "" },
    documentation: { score: Math.round((score.documentation / 100) * 10), maxScore: 10, reason: score.breakdown?.documentationReason || "" },
    diversity: { score: Math.round((score.diversity / 100) * 10), maxScore: 10, reason: score.breakdown?.diversityReason || "" },
    projectScale: { score: Math.round(((score.projectScale || score.repoQuality) / 100) * 10), maxScore: 10, reason: score.breakdown?.projectScaleReason || "" },
  };

  // Radar data mapping for the 7 categories
  const radarData = [
    { subject: "Consistency", A: Math.round((categories.consistency.score / categories.consistency.maxScore) * 100) },
    { subject: "Repo Quality", A: Math.round((categories.repoQuality.score / categories.repoQuality.maxScore) * 100) },
    { subject: "OS Activity", A: Math.round((categories.openSource.score / categories.openSource.maxScore) * 100) },
    { subject: "Comm. Impact", A: Math.round((categories.communityImpact.score / categories.communityImpact.maxScore) * 100) },
    { subject: "Documentation", A: Math.round((categories.documentation.score / categories.documentation.maxScore) * 100) },
    { subject: "Tech Diversity", A: Math.round((categories.diversity.score / categories.diversity.maxScore) * 100) },
    { subject: "Project Scale", A: Math.round((categories.projectScale.score / categories.projectScale.maxScore) * 100) },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6">
        
        {/* Left Column: Huge Score Badge */}
        <div className="lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
          <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Developer Grade & Index</span>
          <h2 className="text-5xl md:text-6xl font-extrabold font-space-grotesk text-[#F0F6FC] mt-1">
            {isAvail ? score.overall : "N/A"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className={`inline-flex text-xs font-bold px-3 py-1 rounded-full border ${badgeClass}`}>
              Grade {gradeStr}
            </span>
          </div>
          <p className="mt-4 text-xs text-[#8B949E] leading-relaxed max-w-[240px]">
            Calculated strictly from live authenticated GitHub telemetry across 7 distinct technical categories.
          </p>
        </div>

        {/* Right Column: Recharts Interactive Radar */}
        <div className="lg:col-span-8 flex justify-center py-4 border-t lg:border-t-0 lg:border-l border-[#30363D] h-64 text-[10px] font-mono w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#30363D" />
              <PolarAngleAxis dataKey="subject" stroke="#8B949E" />
              <Radar
                name="Performance Index"
                dataKey="A"
                stroke="#58A6FF"
                fill="#1F6FEB"
                fillOpacity={0.2}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
                labelStyle={{ color: "#F0F6FC" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expandable Why this Grade Section */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#30363D]/40 pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
              Why this Grade? (Transparent Scoring Evaluation)
            </h3>
            <p className="text-[10px] text-[#8B949E] mt-0.5">Exact point contributions calculated out of 100 maximum total points.</p>
          </div>
          <button
            onClick={() => setShowWhyGrade(!showWhyGrade)}
            className="text-xs font-mono text-[#58A6FF] hover:underline cursor-pointer"
          >
            {showWhyGrade ? "Hide Details ▲" : "Show Details ▼"}
          </button>
        </div>

        {showWhyGrade && (
          <div className="space-y-6 pt-2 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs">
              
              {/* Contribution Consistency */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F0F6FC]">CONTRIBUTION CONSISTENCY</span>
                  <span className="text-xs font-bold text-[#3FB950]">{categories.consistency.score} / {categories.consistency.maxScore}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3FB950]" style={{ width: `${(categories.consistency.score / categories.consistency.maxScore) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{categories.consistency.reason}</p>
              </div>

              {/* Repository Quality */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F0F6FC]">REPOSITORY QUALITY</span>
                  <span className="text-xs font-bold text-[#58A6FF]">{categories.repoQuality.score} / {categories.repoQuality.maxScore}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#58A6FF]" style={{ width: `${(categories.repoQuality.score / categories.repoQuality.maxScore) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{categories.repoQuality.reason}</p>
              </div>

              {/* Community Impact */}
              <div className="space-y-1 pt-2 border-t border-[#30363D]/30 md:border-t-0 md:pt-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F0F6FC]">COMMUNITY IMPACT</span>
                  <span className="text-xs font-bold text-[#a371f7]">{categories.communityImpact.score} / {categories.communityImpact.maxScore}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#a371f7]" style={{ width: `${(categories.communityImpact.score / categories.communityImpact.maxScore) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{categories.communityImpact.reason}</p>
              </div>

              {/* Open Source Activity */}
              <div className="space-y-1 pt-2 border-t border-[#30363D]/30 md:border-t-0 md:pt-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F0F6FC]">OPEN SOURCE ACTIVITY</span>
                  <span className="text-xs font-bold text-[#D29922]">{categories.openSource.score} / {categories.openSource.maxScore}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D29922]" style={{ width: `${(categories.openSource.score / categories.openSource.maxScore) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{categories.openSource.reason}</p>
              </div>

              {/* Documentation */}
              <div className="space-y-1 pt-2 border-t border-[#30363D]/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F0F6FC]">DOCUMENTATION HYGIENE</span>
                  <span className="text-xs font-bold text-[#58A6FF]">{categories.documentation.score} / {categories.documentation.maxScore}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#58A6FF]" style={{ width: `${(categories.documentation.score / categories.documentation.maxScore) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{categories.documentation.reason}</p>
              </div>

              {/* Language Diversity */}
              <div className="space-y-1 pt-2 border-t border-[#30363D]/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F0F6FC]">LANGUAGE DIVERSITY</span>
                  <span className="text-xs font-bold text-[#8957e5]">{categories.diversity.score} / {categories.diversity.maxScore}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8957e5]" style={{ width: `${(categories.diversity.score / categories.diversity.maxScore) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{categories.diversity.reason}</p>
              </div>

              {/* Project Scale */}
              <div className="space-y-1 pt-2 border-t border-[#30363D]/30 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F0F6FC]">PROJECT SCALE</span>
                  <span className="text-xs font-bold text-[#3FB950]">{categories.projectScale.score} / {categories.projectScale.maxScore}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3FB950]" style={{ width: `${(categories.projectScale.score / categories.projectScale.maxScore) * 100}%` }} />
                </div>
                <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{categories.projectScale.reason}</p>
              </div>

            </div>

            <div className="flex justify-between items-center bg-[#0D1117] p-4 rounded-xl border border-[#30363D] text-sm font-bold">
              <span className="text-[#8B949E]">Total Calculated Score: <span className="text-[#F0F6FC]">{score.overall} / 100</span></span>
              <span className="text-[#8B949E]">Mapped Grade: <span className="text-[#3FB950]">{gradeStr}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
