"use client";

import { UserDashboardData } from "@/types";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";
import { useTheme } from "@/components/ui/ThemeContext";

interface ScoreTabProps {
  data: UserDashboardData;
}

export default function ScoreTab({ data }: ScoreTabProps) {
  const { score } = data;
  const { chartSettings } = useTheme();

  const getScoreClassification = (val: number) => {
    if (val >= 95) return { label: "Elite Architect", color: "text-[#3FB950] border-[#238636]/30 bg-[#238636]/10", grade: "S+", level: "Level 6" };
    if (val >= 90) return { label: "Principal Engineer", color: "text-[#3FB950] border-[#238636]/30 bg-[#238636]/10", grade: "A+", level: "Level 5" };
    if (val >= 80) return { label: "Senior Engineer", color: "text-[#58A6FF] border-[#1F6FEB]/30 bg-[#1F6FEB]/10", grade: "A", level: "Level 4" };
    if (val >= 70) return { label: "Professional Builder", color: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10", grade: "B", level: "Level 3" };
    if (val >= 50) return { label: "Advanced Intermediate", color: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10", grade: "C", level: "Level 2" };
    return { label: "Novice Builder", color: "text-[#8B949E] border-[#30363D] bg-[#161B22]", grade: "D", level: "Level 1" };
  };

  const classification = getScoreClassification(score.overall);

  // Radar data mapping for the 6 V2 dimensions
  const radarData = [
    { subject: "Consistency", A: score.consistency },
    { subject: "Repo Quality", A: score.repoQuality },
    { subject: "Tech Diversity", A: score.diversity },
    { subject: "OS Impact", A: score.openSource },
    { subject: "Comm. Impact", A: score.communityImpact },
    { subject: "Documentation", A: score.documentation },
  ];

  // Benchmark indicator calculations
  // Ranks: 0 = Beg, 40 = Int, 60 = Adv, 70 = Pro, 80 = Snr, 90 = Elite
  const getBenchmarkProgress = (scoreVal: number) => {
    return `${Math.max(0, Math.min(100, scoreVal))}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6">
        
        {/* Left Column: Huge Score Badge */}
        <div className="lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
          <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Aggregate Developer Score</span>
          <h2 className="text-5xl md:text-6xl font-extrabold font-space-grotesk text-[#F0F6FC] mt-1">
            {score.overall}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className={`inline-flex text-[10px] font-bold px-3 py-1 rounded-full border ${classification.color}`}>
              {classification.label}
            </span>
            <span className="inline-flex text-[10px] font-bold font-mono px-3 py-1 rounded-full border border-[#30363D] bg-[#161B22] text-[#8B949E]">
              {classification.level}
            </span>
          </div>
          <p className="mt-4 text-xs text-[#8B949E] leading-relaxed max-w-[220px]">
            Aggregated metric mapping version control velocity, community resonance, and codebase hygiene.
          </p>
        </div>

        {/* Right Column: Recharts Interactive Radar */}
        <div className="lg:col-span-8 flex justify-center py-4 border-t lg:border-t-0 lg:border-l border-border h-64 text-[10px] font-mono w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" />
              <Radar
                name="Score"
                dataKey="A"
                stroke="var(--accent)"
                fill="var(--accent)"
                fillOpacity={0.2}
                isAnimationActive={chartSettings.animated}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "8px" }}
                labelStyle={{ color: "var(--text-primary)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linear Benchmark gauge */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 space-y-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
            Standing Benchmark Scale
          </h3>
          <p className="text-[10px] text-[#8B949E] mt-0.5">Ranking gauge from Beginner (10) to Elite Architect (100).</p>
        </div>

        <div className="space-y-2 pt-2">
          {/* Gauge Bar */}
          <div className="relative w-full h-3.5 rounded-full bg-[#0D1117] border border-[#30363D] overflow-visible">
            {/* Markers */}
            <div className="absolute left-[40%] top-0 bottom-0 border-l border-[#30363D] z-10" />
            <div className="absolute left-[60%] top-0 bottom-0 border-l border-[#30363D] z-10" />
            <div className="absolute left-[70%] top-0 bottom-0 border-l border-[#30363D] z-10" />
            <div className="absolute left-[80%] top-0 bottom-0 border-l border-[#30363D] z-10" />
            <div className="absolute left-[90%] top-0 bottom-0 border-l border-[#30363D] z-10" />
            
            {/* User score overlay bar */}
            <div 
              style={{ width: getBenchmarkProgress(score.overall) }}
              className="h-full rounded-full bg-gradient-to-r from-[#1F6FEB] to-[#58A6FF] opacity-90 transition-all duration-1000 ease-out flex items-center justify-end pr-1.5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between text-[8px] font-mono text-[#8B949E] px-1 select-none">
            <span>Beginner (10)</span>
            <span>Int (40)</span>
            <span>Adv (60)</span>
            <span>Pro (70)</span>
            <span>Senior (80)</span>
            <span>Elite (90+)</span>
          </div>
        </div>
      </div>

      {/* Breakdown Evaluation Diagnostics */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D]/40 pb-3">
          Developer Diagnostic Breakdowns
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 font-mono text-xs">
          
          {/* Consistency */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#F0F6FC]">CONSISTENCY</span>
              <span className="text-[10px] text-[#8B949E]">{score.consistency} / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#39d353]" style={{ width: `${score.consistency}%` }} />
            </div>
            <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{score.breakdown.consistencyReason}</p>
          </div>

          {/* Repo Quality */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#F0F6FC]">REPOSITORY QUALITY</span>
              <span className="text-[10px] text-[#8B949E]">{score.repoQuality} / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#58A6FF]" style={{ width: `${score.repoQuality}%` }} />
            </div>
            <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{score.breakdown.repoQualityReason}</p>
          </div>

          {/* Diversity */}
          <div className="space-y-1 pt-2 border-t border-[#30363D]/30 md:border-t-0 md:pt-0">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#F0F6FC]">TECHNICAL DIVERSITY</span>
              <span className="text-[10px] text-[#8B949E]">{score.diversity} / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#8957e5]" style={{ width: `${score.diversity}%` }} />
            </div>
            <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{score.breakdown.diversityReason}</p>
          </div>

          {/* Open Source */}
          <div className="space-y-1 pt-2 border-t border-[#30363D]/30 md:border-t-0 md:pt-0">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#F0F6FC]">OPEN SOURCE ACTIVITY</span>
              <span className="text-[10px] text-[#8B949E]">{score.openSource} / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#D29922]" style={{ width: `${score.openSource}%` }} />
            </div>
            <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{score.breakdown.openSourceReason}</p>
          </div>

          {/* Community Impact */}
          <div className="space-y-1 pt-2 border-t border-[#30363D]/30">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#F0F6FC]">COMMUNITY IMPACT</span>
              <span className="text-[10px] text-[#8B949E]">{score.communityImpact} / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#a371f7]" style={{ width: `${score.communityImpact}%` }} />
            </div>
            <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{score.breakdown.communityImpactReason || "Resonance scores calculated based on total stargazers and followers."}</p>
          </div>

          {/* Documentation */}
          <div className="space-y-1 pt-2 border-t border-[#30363D]/30">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#F0F6FC]">DOCUMENTATION HYGIENE</span>
              <span className="text-[10px] text-[#8B949E]">{score.documentation} / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
              <div className="h-full bg-[#3FB950]" style={{ width: `${score.documentation}%` }} />
            </div>
            <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1">{score.breakdown.documentationReason || "Repository index documentation density and descriptions coverage."}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
