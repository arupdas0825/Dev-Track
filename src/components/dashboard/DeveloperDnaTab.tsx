"use client";

import React, { useState, useEffect } from "react";
import {
  Dna,
  Shield,
  Award,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  GitCommit,
  GitPullRequest,
  Sparkles,
  Star,
  Users,
  Brain,
  Cpu,
  Clock,
  Terminal,
  ChevronRight,
  Zap,
  Info,
  QrCode
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { GitHubDnaService, DeveloperDnaProfile } from "@/services/github/github-dna.service";
import { GitHubProfile, GitHubRepository, ContributionStats } from "@/types";

interface DeveloperDnaTabProps {
  data: {
    profile: GitHubProfile;
    repositories: GitHubRepository[];
    contributions: ContributionStats;
  } | null;
  githubToken?: string;
}

export default function DeveloperDnaTab({ data, githubToken }: DeveloperDnaTabProps) {
  const [dna, setDna] = useState<DeveloperDnaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"dna" | "habits" | "style" | "share">("dna");

  useEffect(() => {
    if (!data) return;
    const calculate = async () => {
      try {
        const result = await GitHubDnaService.calculateDeveloperDna(
          data.profile.login,
          data.profile,
          data.repositories,
          data.contributions,
          githubToken
        );
        setDna(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    calculate();
  }, [data, githubToken]);

  if (loading || !dna) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary font-mono">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Animated DNA spinner */}
          <div className="absolute inset-0 border-4 border-accent/20 rounded-full animate-ping" />
          <Dna className="animate-spin h-8 w-8 text-accent" />
        </div>
        <span className="text-xs font-semibold mt-4 tracking-wider animate-pulse">
          Sequencing GitHub Events & Synthesizing Developer DNA...
        </span>
      </div>
    );
  }

  // Export functions
  const copyLinkedIn = () => {
    const text = `🧬 My GitHub Developer DNA is sequenced!
Grade: ${dna.grade} | Engineering Score: ${dna.score}

I classify as a "${dna.workStyle.primaryStyle}" specializing in ${dna.technologyDna.frontend > dna.technologyDna.backend ? "Frontend" : "Backend"} systems.
Strengths:
${dna.strengths.map(s => `• ${s.title}: ${s.evidence}`).join("\n")}

Check out your Developer DNA on DevTrack!`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyMarkdown = () => {
    const text = `# Developer DNA Report - @${dna.profile.login}

## Core Metrics
* **Developer Grade**: ${dna.grade}
* **Developer Score**: ${dna.score}/100
* **GitHub Age**: ${dna.githubAge}
* **Analysis Confidence**: ${dna.confidence}%
* **Timestamp**: ${dna.analysisTime}

## Dimensions
${dna.dimensions.map(d => `* **${d.name}**: ${d.percentage}%`).join("\n")}

## AI Summary
${dna.aiSummary}

## Career Projections
${dna.careers.map(c => `* **${c.name}**: ${c.compatibility}% compatible`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const downloadReport = () => {
    window.print();
  };

  // Pie colors for Tech DNA
  const COLORS = ["#58A6FF", "#3FB950", "#D29922", "#F85149", "#BC8CFF", "#FF7B72", "#79C0FF", "#56D364"];
  const pieData = [
    { name: "Frontend", value: dna.technologyDna.frontend },
    { name: "Backend", value: dna.technologyDna.backend },
    { name: "AI/ML", value: dna.technologyDna.ai },
    { name: "Database", value: dna.technologyDna.database },
    { name: "DevOps", value: dna.technologyDna.devops },
    { name: "Cloud", value: dna.technologyDna.cloud },
    { name: "Data Science", value: dna.technologyDna.dataScience },
    { name: "Mobile", value: dna.technologyDna.mobile }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 font-mono text-text-primary print:bg-white print:text-black">
      {/* 1. Page Header with CSS DNA Helix */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-[#161B22]/60 to-[#0D1117] p-6 flex flex-col md:flex-row items-center justify-between gap-6 print:border-none print:bg-none">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-accent/30 bg-accent/10 text-accent uppercase tracking-wider">
            <Sparkles size={11} /> Flagship Feature
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-space-grotesk tracking-tight text-text-primary print:text-black">
            Developer DNA
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Understand your engineering personality, habits, and technical blueprints sequenced directly from real GitHub activity.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-[10px] text-text-secondary">
            <span>Age: <strong className="text-text-primary print:text-black">{dna.githubAge}</strong></span>
            <span>•</span>
            <span>Confidence: <strong className="text-text-primary print:text-black">{dna.confidence}%</strong></span>
            <span>•</span>
            <span>Indexed: <strong className="text-text-primary print:text-black">{dna.analysisTime}</strong></span>
          </div>
        </div>

        {/* Animated CSS Helix */}
        <div className="relative h-28 w-24 flex items-center justify-center flex-shrink-0 print:hidden overflow-hidden">
          <style>{`
            .helix-container {
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            .helix-row {
              position: relative;
              display: flex;
              justify-content: space-between;
              width: 60px;
            }
            .helix-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
            }
            .dot-a {
              background-color: var(--color-accent, #58A6FF);
              animation: orbit1 2s infinite ease-in-out;
            }
            .dot-b {
              background-color: #3FB950;
              animation: orbit2 2s infinite ease-in-out;
            }
            .helix-bar {
              position: absolute;
              left: 50%;
              top: 50%;
              width: 48px;
              height: 1px;
              background: rgba(240, 246, 252, 0.15);
              transform: translate(-50%, -50%) scaleX(1);
              z-index: 0;
              animation: scaleBar 2s infinite ease-in-out;
            }
            @keyframes orbit1 {
              0%, 100% { transform: translateX(0px) scale(1); z-index: 10; opacity: 1; }
              50% { transform: translateX(48px) scale(0.6); z-index: 1; opacity: 0.4; }
            }
            @keyframes orbit2 {
              0%, 100% { transform: translateX(48px) scale(0.6); z-index: 1; opacity: 0.4; }
              50% { transform: translateX(0px) scale(1); z-index: 10; opacity: 1; }
            }
            @keyframes scaleBar {
              0%, 50%, 100% { transform: translate(-50%, -50%) scaleX(1); opacity: 0.2; }
              25%, 75% { transform: translate(-50%, -50%) scaleX(0.1); opacity: 0.8; }
            }
          `}</style>
          <div className="helix-container">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="helix-row" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="helix-dot dot-a" style={{ animationDelay: `${idx * 0.15}s` }} />
                <div className="helix-bar" style={{ animationDelay: `${idx * 0.15}s` }} />
                <div className="helix-dot dot-b" style={{ animationDelay: `${idx * 0.15}s` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Global DNA Scores */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6 print:border-none">
          <div className="text-center">
            <span className="text-[10px] text-text-secondary uppercase">Grade</span>
            <div className="text-3xl md:text-4xl font-bold font-space-grotesk text-accent bg-accent/5 border border-accent/20 px-3 py-1 rounded-lg mt-1 print:text-black">
              {dna.grade}
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-text-secondary uppercase">Score</span>
            <div className="text-3xl md:text-4xl font-bold font-space-grotesk text-[#3FB950] bg-[#3FB950]/5 border border-[#3FB950]/20 px-3 py-1 rounded-lg mt-1 print:text-black">
              {dna.score}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border/80 gap-1 overflow-x-auto scrollbar-none font-mono print:hidden">
        {[
          { id: "dna", label: "DNA Blueprint", icon: Brain },
          { id: "habits", label: "Engineering Habits", icon: Award },
          { id: "style", label: "Work Style & Tech", icon: Clock },
          { id: "share", label: "Share DNA Card", icon: QrCode }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs border-b-2 font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "border-accent text-accent bg-accent/5"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-[#161B22]/30"
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. Sub-Tab Contents */}
      {activeSubTab === "dna" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 print:border-none print:bg-none print:col-span-12">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2 print:text-black">
              Engineering Dimensions DNA
            </h3>
            <div className="h-72 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dna.dimensions}>
                  <PolarGrid stroke="#30363D" />
                  <PolarAngleAxis dataKey="name" stroke="#8B949E" style={{ fontSize: 10, fontFamily: "monospace" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#30363D" style={{ fontSize: 8 }} />
                  <Radar
                    name={dna.profile.login}
                    dataKey="percentage"
                    stroke="#58A6FF"
                    fill="#58A6FF"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed font-mono">
              Dimension analysis weights code repositories size, commit density, language diversity, issue closures, and community validations.
            </p>
          </div>

          {/* AI Summary & Profile Insights */}
          <div className="lg:col-span-5 space-y-6 print:col-span-12">
            {/* AI Summary Block */}
            <div className="rounded-xl border border-border bg-accent/5 p-6 space-y-3 relative overflow-hidden print:border-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-accent">
                <Sparkles size={16} />
                <h4 className="text-xs font-bold uppercase tracking-wider">AI Genome Summary</h4>
              </div>
              <p className="text-xs leading-relaxed text-text-primary italic print:text-black">
                &ldquo;{dna.aiSummary}&rdquo;
              </p>
            </div>

            {/* Project Personalities */}
            <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 print:border-none">
              <h4 className="text-xs font-bold text-text-primary uppercase border-b border-border/40 pb-2 print:text-black">
                Project Architect Style
              </h4>
              <div className="space-y-3 font-mono text-xs">
                {dna.projectPersonalities.map(p => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>{p.name}</span>
                      <span className="text-text-secondary">{p.confidence}% Confidence</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#161B22] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3FB950]" style={{ width: `${p.confidence}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration profile */}
            <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-3 print:border-none">
              <h4 className="text-xs font-bold text-text-primary uppercase border-b border-border/40 pb-2 print:text-black">
                Collaboration Fingerprint
              </h4>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#BC8CFF]/10 text-[#BC8CFF] flex items-center justify-center flex-shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold">{dna.collaborationProfile.role}</div>
                  <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
                    {dna.collaborationProfile.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habits Sub-Tab */}
      {activeSubTab === "habits" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(dna.habits).map(([key, habit]) => (
              <div key={key} className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-3 hover:bg-[#161B22]/60 transition-colors print:border-none">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    habit.score >= 80 ? "text-[#3FB950] border-[#238636]/30 bg-[#238636]/10" : "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10"
                  }`}>
                    {habit.score}/100
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{habit.explanation}</p>
                <div className="text-[10px] text-[#8B949E] italic flex items-center gap-1">
                  <Info size={11} />
                  <span>Evidence: {habit.evidence}</span>
                </div>
                <div className="text-[10px] text-accent border-t border-border/40 pt-2">
                  💡 Suggestions: {habit.suggestions}
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border/40 pt-6">
            {/* Strengths */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#3FB950] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Engineering Strengths
              </h3>
              <div className="space-y-3">
                {dna.strengths.map((s, idx) => (
                  <div key={idx} className="rounded-lg border border-[#238636]/20 bg-[#238636]/5 p-4 space-y-1">
                    <div className="text-xs font-bold text-text-primary">{s.title}</div>
                    <p className="text-[10px] text-text-secondary">{s.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#D29922] uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={13} /> Recommended Improvements
              </h3>
              <div className="space-y-3">
                {dna.improvements.map((imp, idx) => (
                  <div key={idx} className="rounded-lg border border-[#D29922]/20 bg-[#D29922]/5 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold text-text-primary">{imp.title}</div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#D29922]/20 rounded text-[#D29922] border border-[#D29922]/30 uppercase">
                        {imp.impact} Impact
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-relaxed">{imp.why}</p>
                    <div className="text-[10px] text-accent">
                      👉 Actions: {imp.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style & Tech Sub-Tab */}
      {activeSubTab === "style" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Work Style Chart */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 print:border-none">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase print:text-black">
                Work Style Schedule
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#BC8CFF]/20 text-[#BC8CFF] border border-[#BC8CFF]/30 rounded">
                {dna.workStyle.primaryStyle}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{dna.workStyle.styleDescription}</p>

            <div className="h-44 text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dna.workStyle.hourlyDistribution} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                  <XAxis dataKey="hour" stroke="#8B949E" />
                  <YAxis stroke="#8B949E" />
                  <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                  <Area type="monotone" dataKey="count" stroke="#BC8CFF" fill="#BC8CFF" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary pt-2">
              <span>Weekday commits: <strong className="text-text-primary">{dna.workStyle.weekdayRatio}%</strong></span>
              <span>Weekend commits: <strong className="text-text-primary">{dna.workStyle.weekendRatio}%</strong></span>
            </div>
          </div>

          {/* Tech DNA Breakdown */}
          <div className="lg:col-span-5 rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 print:border-none">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2 print:text-black">
              Technology DNA Distribution
            </h3>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {pieData.map((d, index) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{d.name}: <strong className="text-text-primary">{d.value}%</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Behavior & Career compatibility */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 print:border-none">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2 print:text-black">
              Technology Learning Timeline
            </h3>
            <div className="space-y-4 font-mono text-xs">
              {dna.learning.timeline.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start relative">
                  {idx !== dna.learning.timeline.length - 1 && (
                    <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-border/40" />
                  )}
                  <div className="h-5 w-5 rounded-full border border-accent bg-[#0D1117] text-[10px] text-accent flex items-center justify-center font-bold z-10 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-text-primary">
                      {item.technology} <span className="text-[9px] text-text-secondary bg-[#161B22] px-1.5 py-0.5 rounded border border-border font-semibold ml-2">{item.date}</span>
                    </div>
                    <p className="text-[10px] text-text-secondary mt-0.5">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career compatibility */}
          <div className="lg:col-span-5 rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 print:border-none">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2 print:text-black">
              Engineering Career Matches
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {dna.careers.map(c => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>{c.name}</span>
                    <span className="text-accent">{c.compatibility}% Match</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#161B22] rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${c.compatibility}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share DNA Card Sub-Tab */}
      {activeSubTab === "share" && (
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {/* Share Card Mock */}
          <div className="w-80 rounded-xl border border-border bg-gradient-to-b from-[#1F242C] to-[#0D1117] p-5 shadow-2xl relative overflow-hidden font-mono text-xs text-text-primary border-accent/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dna.profile.avatar_url || "https://github.com/identicons/alex.png"}
                  alt={dna.profile.login}
                  className="h-10 w-10 rounded-full border border-border/80"
                />
                <div>
                  <div className="font-bold text-[11px] truncate max-w-[120px]">{dna.profile.name || dna.profile.login}</div>
                  <span className="text-[9px] text-[#8B949E]">@{dna.profile.login}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-[#8B949E] uppercase block">Grade</span>
                <span className="text-xl font-bold font-space-grotesk text-accent">{dna.grade}</span>
              </div>
            </div>

            <div className="border-t border-b border-border/40 py-4 my-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span>Engineering DNA:</span>
                <span className="font-semibold text-text-primary">{dna.workStyle.primaryStyle}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Technical Score:</span>
                <span className="font-semibold text-[#3FB950]">{dna.score}/100</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Primary language:</span>
                <span className="font-semibold text-accent">{dna.profile.bio ? "TypeScript" : "JavaScript"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-[#8B949E] text-[9px]">
                <QrCode size={24} className="text-text-primary" />
                <div>
                  <span className="block font-semibold">DevTrack DNA</span>
                  <span>Scan to verify</span>
                </div>
              </div>
              <span className="text-[8px] bg-accent/15 px-2 py-0.5 border border-accent/20 rounded text-accent font-bold uppercase tracking-wider">
                Certified
              </span>
            </div>
          </div>

          {/* Export Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={copyLinkedIn}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5] text-white rounded text-xs font-bold hover:bg-[#0077b5]/90 transition-colors"
            >
              <Copy size={12} />
              {copiedLink ? "Copied!" : "LinkedIn Summary"}
            </button>
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161B22] border border-border rounded text-xs font-bold hover:text-accent transition-colors"
            >
              <Terminal size={12} />
              {copiedMd ? "Copied!" : "Markdown Report"}
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3FB950]/20 text-[#3FB950] border border-[#238636]/30 rounded text-xs font-bold hover:bg-[#3FB950]/30 transition-colors"
            >
              <Download size={12} />
              Export PDF / Print
            </button>
          </div>
        </div>
      )}

      {/* 3. Developer Evolution & Projections */}
      <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 print:border-none">
        <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/40 pb-2 tracking-wider flex items-center gap-1.5 print:text-black">
          <Award size={13} /> Developer DNA Evolution Forecast
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-text-secondary">Current DNA Score</span>
            <div className="text-xl font-bold font-space-grotesk text-text-primary print:text-black">
              {dna.grade} ({dna.score})
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-secondary">6-Month Projection</span>
            <div className="text-xl font-bold font-space-grotesk text-accent">
              {dna.evolution.projectedGrade6m}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-secondary">1-Year Projection</span>
            <div className="text-xl font-bold font-space-grotesk text-[#3FB950]">
              {dna.evolution.projectedGrade1y}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-text-secondary leading-relaxed border-t border-border/30 pt-3 font-mono">
          ℹ️ {dna.evolution.assumptions} Projections are computed under incremental contribution velocities.
        </p>
      </div>
    </div>
  );
}
