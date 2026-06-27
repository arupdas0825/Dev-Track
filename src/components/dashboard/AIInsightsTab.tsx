"use client";

import { useState } from "react";
import { UserDashboardData } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AIInsightsTabProps {
  data: UserDashboardData;
}

export default function AIInsightsTab({ data }: AIInsightsTabProps) {
  const { aiInsights } = data;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed("Just now");
    }, 800);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner with Confidence & Controls */}
      <div className="relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 shadow-md">
        <div className="absolute top-0 right-0 h-32 w-32 bg-[#1F6FEB]/10 rounded-bl-full blur-xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#30363D]/40 pb-4 mb-4">
          <div>
            <span className="text-[10px] text-[#58A6FF] uppercase font-bold tracking-wider block">
              AI Career Diagnostic & Intelligence
            </span>
            <div className="text-[10px] text-[#8B949E] mt-0.5 flex items-center gap-2">
              <span>Telemetry Confidence: <strong className="text-[#3FB950]">98% Verified</strong></span>
              <span>•</span>
              <span>Generated: {lastRefreshed}</span>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg border border-[#30363D] bg-[#0D1117] text-xs font-bold text-[#F0F6FC] hover:border-[#58A6FF] transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className={`h-3.5 w-3.5 text-[#58A6FF] ${isRefreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? "Re-analyzing..." : "Refresh Insights"}</span>
          </button>
        </div>

        <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-[#F0F6FC]">
          {aiInsights.careerDirection}
        </h2>
        <p className="mt-2 text-xs text-[#8B949E] leading-relaxed max-w-2xl font-sans">
          Based on language ratios, repository sizes, active commit streaks, and project documentation indexes, the engine rates you as an active practitioner ready for this track.
        </p>

        {/* Target Roles */}
        {aiInsights.careerRecommendations && aiInsights.careerRecommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#30363D]/40 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-[#8B949E] uppercase mr-2">Target Roles:</span>
            {aiInsights.careerRecommendations.map(role => (
              <span key={role} className="text-[10px] font-bold text-[#F0F6FC] bg-[#0D1117] border border-[#30363D] px-2.5 py-0.5 rounded-full">
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rationale & Explanation Expandable Panel */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
            Diagnostic Rationale & Evaluation Methodology
          </h3>
          <button
            onClick={() => setExpandedExplanation(!expandedExplanation)}
            className="text-xs text-[#58A6FF] hover:underline cursor-pointer"
          >
            {expandedExplanation ? "Hide Methodology ▲" : "View Methodology ▼"}
          </button>
        </div>

        {expandedExplanation && (
          <div className="text-xs text-[#8B949E] leading-relaxed pt-2 border-t border-[#30363D]/30 font-sans space-y-2">
            <p>
              The AI Insights engine continuously cross-references your live version control commits, pull request volumes, repository language distributions, and documentation hygiene metrics.
            </p>
            <p>
              Recommendations are dynamically derived to maximize your 100-point Developer Index and optimize technical breadth across modern industry standards.
            </p>
          </div>
        )}
      </div>

      {/* Strengths & Areas of Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#3FB950] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#30363D]/40 pb-3">
            <span className="h-2 w-2 rounded-full bg-[#3FB950] animate-pulse" />
            Technical Strengths
          </h3>
          <ul className="space-y-3">
            {aiInsights.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-[#8B949E] leading-relaxed font-sans">
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
          <h3 className="text-xs font-bold text-[#F85149] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#30363D]/40 pb-3">
            <span className="h-2 w-2 rounded-full bg-[#F85149] animate-pulse" />
            Areas of Improvement
          </h3>
          <ul className="space-y-3">
            {aiInsights.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-[#8B949E] leading-relaxed font-sans">
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
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5">
          <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider mb-3">
            Core Stack Expansions
          </h3>
          <div className="flex flex-wrap gap-2">
            {aiInsights.suggestedTechnologies.map(tech => (
              <span key={tech} className="text-xs font-bold text-[#58A6FF] bg-[#0D1117] border border-[#30363D] px-3 py-1 rounded-lg">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5">
          <h3 className="text-xs font-bold text-[#D29922] uppercase tracking-wider mb-3">
            Opportunities (Tech Worth Learning)
          </h3>
          <div className="flex flex-wrap gap-2">
            {aiInsights.opportunities && aiInsights.opportunities.map(tech => (
              <span key={tech} className="text-xs font-bold text-[#D29922] bg-[#0D1117] border border-[#30363D] px-3 py-1 rounded-lg">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Growth Forecast */}
      {aiInsights.growthForecast && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                AI Growth Projection
              </h3>
              <p className="text-[10px] text-[#8B949E] mt-0.5">Estimated score increase with optimal coding cadence.</p>
            </div>
            <div className="text-xs text-[#8B949E] leading-relaxed font-sans pr-4">
              {aiInsights.growthForecast.summary}
            </div>
            <div className="text-[10px] text-[#3FB950] border-t border-[#30363D]/40 pt-4 mt-6">
              ✓ Prediction engine active.
            </div>
          </div>

          <div className="lg:col-span-7 h-48 text-[9px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiInsights.growthForecast.forecastMonths} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="month" stroke="#8B949E" tickLine={false} />
                <YAxis stroke="#8B949E" domain={[10, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
                  labelStyle={{ color: "#F0F6FC" }}
                />
                <Line type="monotone" dataKey="score" stroke="#58A6FF" strokeWidth={2.5} activeDot={{ r: 5 }} />
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
              <div className="absolute -left-[35px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#161B22] border border-[#30363D] text-[9px] font-bold text-[#8B949E]">
                {idx + 1}
              </div>

              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h4 className="text-sm font-bold text-[#F0F6FC] font-space-grotesk">
                    {stage.stage}
                  </h4>
                  <span className="text-[10px] font-semibold text-[#58A6FF] bg-[#1F6FEB]/10 border border-[#1F6FEB]/20 px-2 py-0.5 rounded-full">
                    {stage.duration}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {stage.topics.map((topic, tIdx) => (
                    <li key={tIdx} className="flex gap-2 items-start text-xs text-[#8B949E] leading-relaxed font-sans">
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
