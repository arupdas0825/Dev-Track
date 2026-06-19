"use client";

import { UserDashboardData } from "@/types";

interface AIInsightsTabProps {
  data: UserDashboardData;
}

export default function AIInsightsTab({ data }: AIInsightsTabProps) {
  const { aiInsights } = data;

  return (
    <div className="space-y-6">
      {/* Career Banner */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-[#121820] p-6 shadow-md">
        <div className="absolute top-0 right-0 h-32 w-32 bg-accent/5 rounded-bl-full blur-xl pointer-events-none" />
        <span className="text-[10px] font-mono text-accent uppercase font-bold tracking-wider">
          AI Career Assessment
        </span>
        <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-text-primary mt-1">
          {aiInsights.careerDirection}
        </h2>
        <p className="mt-2 text-xs text-text-secondary leading-relaxed max-w-2xl">
          Based on language ratios, repository sizes, active commit streaks, and project documentation indexes, the engine rates you as an active practitioner ready for this track.
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-success uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-3">
            <span className="h-2 w-2 rounded-full bg-success" />
            Technical Strengths
          </h3>
          <ul className="space-y-3">
            {aiInsights.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-text-secondary leading-relaxed">
                <svg className="h-4 w-4 text-success mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-danger uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-3">
            <span className="h-2 w-2 rounded-full bg-danger" />
            Areas of Improvement
          </h3>
          <ul className="space-y-3">
            {aiInsights.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-text-secondary leading-relaxed">
                <svg className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Tech */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider mb-3">
          Suggested Stack Expansions
        </h3>
        <div className="flex flex-wrap gap-2">
          {aiInsights.suggestedTechnologies.map(tech => (
            <span key={tech} className="text-xs font-bold text-accent bg-accent/5 border border-accent/20 px-3 py-1 rounded-lg">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
        <h3 className="text-base font-bold font-space-grotesk text-text-primary border-b border-border/40 pb-3">
          AI Curated Roadmap
        </h3>

        <div className="relative border-l border-border ml-3 pl-6 space-y-8">
          {aiInsights.learningRoadmap.map((stage, idx) => (
            <div key={idx} className="relative">
              {/* Counter emblem */}
              <div className="absolute -left-[35px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-secondary border border-border text-[9px] font-bold text-text-secondary font-mono">
                {idx + 1}
              </div>

              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h4 className="text-sm font-bold text-text-primary font-space-grotesk">
                    {stage.stage}
                  </h4>
                  <span className="text-[10px] font-mono font-semibold text-accent">
                    Duration: {stage.duration}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {stage.topics.map((topic, tIdx) => (
                    <li key={tIdx} className="flex gap-2 items-start text-xs text-text-secondary leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-border mt-1.5 flex-shrink-0" />
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
