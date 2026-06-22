"use client";

import { UserDashboardData } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTheme } from "@/components/ui/ThemeContext";

interface AIInsightsTabProps {
  data: UserDashboardData;
}

export default function AIInsightsTab({ data }: AIInsightsTabProps) {
  const { aiInsights } = data;
  const { chartSettings } = useTheme();

  return (
    <div className="space-y-6">
      {/* Premium Career Assessment Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 shadow-md">
        <div className="absolute top-0 right-0 h-32 w-32 bg-[#1F6FEB]/5 rounded-bl-full blur-xl pointer-events-none" />
        <span className="text-[10px] font-mono text-[#58A6FF] uppercase font-bold tracking-wider">
          AI Career Assessment
        </span>
        <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-[#F0F6FC] mt-1">
          {aiInsights.careerDirection}
        </h2>
        <p className="mt-2 text-xs text-[#8B949E] leading-relaxed max-w-2xl">
          Based on language ratios, repository sizes, active commit streaks, and project documentation indexes, the engine rates you as an active practitioner ready for this track.
        </p>

        {/* Suggested Roles */}
        {aiInsights.careerRecommendations && aiInsights.careerRecommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#30363D]/40 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase mr-2">Target Roles:</span>
            {aiInsights.careerRecommendations.map(role => (
              <span key={role} className="text-[10px] font-mono font-bold text-[#F0F6FC] bg-[#161B22] border border-[#30363D] px-2.5 py-0.5 rounded-full">
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Strengths & Areas of Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#3FB950] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#30363D]/40 pb-3">
            <span className="h-2 w-2 rounded-full bg-[#3FB950] animate-pulse" />
            Technical Strengths
          </h3>
          <ul className="space-y-3">
            {aiInsights.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-[#8B949E] leading-relaxed">
                <svg className="h-4 w-4 text-[#3FB950] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#F85149] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#30363D]/40 pb-3">
            <span className="h-2 w-2 rounded-full bg-[#F85149] animate-pulse" />
            Areas of Improvement
          </h3>
          <ul className="space-y-3">
            {aiInsights.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-[#8B949E] leading-relaxed">
                <svg className="h-4 w-4 text-[#F85149] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Stacks & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Stack Expansion */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5">
          <h3 className="text-xs font-mono font-bold text-[#F0F6FC] uppercase tracking-wider mb-3">
            Core Stack expansions
          </h3>
          <div className="flex flex-wrap gap-2">
            {aiInsights.suggestedTechnologies.map(tech => (
              <span key={tech} className="text-xs font-mono font-bold text-[#58A6FF] bg-[#161B22] border border-[#30363D] px-3 py-1 rounded-lg">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Opportunities (Tech worth learning) */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5">
          <h3 className="text-xs font-mono font-bold text-[#D29922] uppercase tracking-wider mb-3">
            Opportunities (Tech Worth Learning)
          </h3>
          <div className="flex flex-wrap gap-2">
            {aiInsights.opportunities && aiInsights.opportunities.map(tech => (
              <span key={tech} className="text-xs font-mono font-bold text-[#D29922] bg-[#161B22] border border-[#30363D] px-3 py-1 rounded-lg">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Growth Forecast (Chart + Text) */}
      {aiInsights.growthForecast && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                AI Growth Projection
              </h3>
              <p className="text-[10px] text-[#8B949E] mt-0.5">Estimated score increase with optimal coding cadence.</p>
            </div>
            
            <div className="text-xs text-[#8B949E] leading-relaxed font-sans pr-4">
              {aiInsights.growthForecast.summary}
            </div>

            <div className="text-[10px] font-mono text-[#3FB950] border-t border-[#30363D]/40 pt-4 mt-6">
              ✓ Prediction engine active.
            </div>
          </div>

          <div className="lg:col-span-7 h-48 text-[9px] font-mono w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiInsights.growthForecast.forecastMonths} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" tickLine={false} />
                <YAxis stroke="var(--text-secondary)" domain={[10, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--accent)" isAnimationActive={chartSettings.animated} strokeWidth={2.5} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Timeline Learning Roadmap */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 space-y-6">
        <h3 className="text-sm font-bold font-space-grotesk text-[#F0F6FC] border-b border-[#30363D]/40 pb-3">
          Personalized Learning Roadmap
        </h3>

        <div className="relative border-l border-[#30363D] ml-3 pl-6 space-y-8">
          {aiInsights.learningRoadmap.map((stage, idx) => (
            <div key={idx} className="relative">
              {/* Counter Emblem */}
              <div className="absolute -left-[35px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#161B22] border border-[#30363D] text-[9px] font-bold text-[#8B949E] font-mono">
                {idx + 1}
              </div>

              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h4 className="text-sm font-bold text-[#F0F6FC] font-space-grotesk">
                    {stage.stage}
                  </h4>
                  <span className="text-[10px] font-mono font-semibold text-[#58A6FF] bg-[#1F6FEB]/10 border border-[#1F6FEB]/20 px-2 py-0.5 rounded-full">
                    {stage.duration}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {stage.topics.map((topic, tIdx) => (
                    <li key={tIdx} className="flex gap-2 items-start text-xs text-[#8B949E] leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#30363D] mt-1.5 flex-shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
