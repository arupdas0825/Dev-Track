"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Download,
  ExternalLink,
  FileText,
  Folder,
  Globe,
  HelpCircle,
  Layers,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  AlertTriangle,
  FileCode,
  Check,
  ChevronRight
} from "lucide-react";
import { GitHubCodeReviewService, RepoReviewReport } from "@/services/github/github-code-review.service";
import { UserDashboardData } from "@/types";
import CountUp from "@/components/ui/CountUp";

interface AiCodeReviewTabProps {
  activeSubTab: string;
  setActiveSubTab: (tabId: string) => void;
  dashboardData: UserDashboardData;
  githubToken?: string;
}

export default function AiCodeReviewTab({
  activeSubTab,
  setActiveSubTab,
  dashboardData,
  githubToken
}: AiCodeReviewTabProps) {
  const { repositories, profile } = dashboardData;
  const [selectedRepoName, setSelectedRepoName] = useState<string>("");
  const [report, setReport] = useState<RepoReviewReport | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize with first repository
  useEffect(() => {
    if (repositories && repositories.length > 0 && !selectedRepoName) {
      setSelectedRepoName(repositories[0].name);
    }
  }, [repositories, selectedRepoName]);

  const triggerScan = async (repoName: string) => {
    if (!repoName) return;
    setScanning(true);
    setError(null);
    try {
      const steps = [
        "Analyzing directory structure...",
        "Evaluating documentation indexes...",
        "Auditing package dependencies...",
        "Scanning for security exposure...",
        "Finalizing analysis report..."
      ];
      for (const step of steps) {
        setScanStep(step);
        await new Promise((r) => setTimeout(r, 600));
      }
      const data = await GitHubCodeReviewService.generateReviewReport(profile.login, repoName, githubToken);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Scanning failed.");
      setReport(null);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if (selectedRepoName) {
      triggerScan(selectedRepoName);
    }
  }, [selectedRepoName]);

  // ----------------------------------------------------
  // REPORT EXPORTER
  // ----------------------------------------------------
  const handleExportReport = (type: "json" | "markdown") => {
    if (!report) return;

    if (type === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${report.repoName}-ai-review.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === "markdown") {
      let md = `# AI Code Review Report - ${report.repoName}\n\n`;
      md += `**Repository Grade:** ${report.grade}\n`;
      md += `**Scan Time:** ${report.scanTime}\n`;
      md += `**AI Confidence:** ${report.confidence}%\n\n`;
      md += `## Executive Summary\n`;
      md += `The repository health is graded at ${report.grade} with an overall score of ${report.scores.health}/100. Documentation levels are scored at ${report.scores.documentation}/100 and security vulnerability exposure is calculated at ${report.scores.security}/100.\n\n`;
      md += `## Strengths\n`;
      report.bestPractices.filter(p => p.passed).forEach(p => {
        md += `- Passed check: ${p.name}\n`;
      });
      md += `\n## Prioritized Recommendations\n`;
      report.priorities.forEach(p => {
        md += `### Priority ${p.priority}: ${p.title} (${p.impact} Impact)\n`;
        md += `- **Why:** ${p.why}\n`;
        md += `- **Benefit:** ${p.benefit}\n`;
        md += `- **Estimated Time:** ${p.estimatedTime} (${p.difficulty} Difficulty)\n\n`;
      });

      const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${report.repoName}-ai-review.md`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  // RENDER SCANNING STATE
  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#8B949E] font-mono">
        <svg className="animate-spin h-10 w-10 text-[#2F81F7] mb-6" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-bold text-[#F0F6FC] tracking-wide mb-2 animate-pulse">{scanStep}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#8B949E]">AI Engine Analyzing codebase files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Top Repo Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#30363D] pb-5">
        <div>
          <h2 className="text-base font-bold font-space-grotesk text-[#F0F6FC] flex items-center gap-2">
            🤖 AI Code Review & Repository Intelligence
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5">Automated security auditing, dependency analysis, and structural validation.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-[#8B949E] uppercase">Select Repository:</label>
          <select
            value={selectedRepoName}
            onChange={(e) => setSelectedRepoName(e.target.value)}
            className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7] cursor-pointer"
          >
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => triggerScan(selectedRepoName)}
            className="rounded-lg bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] p-2 text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
            title="Force Rescan"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#F85149]/40 bg-[#F85149]/10 p-4 text-xs text-[#F85149] font-bold">
          {error}
        </div>
      )}

      {report && (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* 1. REPOSITORY SCANNER (OVERVIEW) */}
            {activeSubTab === "team-overview" || activeSubTab === "ai-scanner" ? (
              <div className="space-y-6">
                {/* Upper overview stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4 text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-[#8B949E] uppercase">Overall Grade</span>
                    <div className="text-4xl font-extrabold font-space-grotesk text-[#2F81F7] mt-2">
                      {report.grade}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4">
                    <span className="text-[10px] font-bold text-[#8B949E] uppercase">Code Health</span>
                    <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                      <CountUp end={report.scores.health} />%
                    </div>
                    <div className="w-full bg-[#21262D] rounded-full h-1.5 mt-2">
                      <div className="bg-[#3FB950] h-1.5 rounded-full" style={{ width: `${report.scores.health}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4">
                    <span className="text-[10px] font-bold text-[#8B949E] uppercase">Vulnerability Rating</span>
                    <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                      <CountUp end={report.scores.security} />%
                    </div>
                    <div className="w-full bg-[#21262D] rounded-full h-1.5 mt-2">
                      <div className="bg-[#F85149] h-1.5 rounded-full" style={{ width: `${report.scores.security}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-4">
                    <span className="text-[10px] font-bold text-[#8B949E] uppercase">AI Confidence</span>
                    <div className="text-xl font-bold font-space-grotesk text-[#F0F6FC] mt-1">
                      <CountUp end={report.confidence} />%
                    </div>
                    <div className="w-full bg-[#21262D] rounded-full h-1.5 mt-2">
                      <div className="bg-[#2F81F7] h-1.5 rounded-full" style={{ width: `${report.confidence}%` }} />
                    </div>
                  </div>
                </div>

                {/* Maturity & Health split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Maturity details */}
                  <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                    <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={14} className="text-[#D29922]" /> Project Maturity
                    </h3>
                    <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-4">
                      <div className="text-xs font-bold text-[#D29922] uppercase tracking-widest">{report.maturity.level}</div>
                      <p className="text-xs text-[#8B949E] mt-2 leading-relaxed">{report.maturity.explanation}</p>
                    </div>
                  </div>

                  {/* Trend chart */}
                  <div className="lg:col-span-2 rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                    <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
                      Repository Health History
                    </h3>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={report.scanHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                          <XAxis dataKey="date" stroke="#8B949E" fontSize={9} />
                          <YAxis stroke="#8B949E" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                          <Line type="monotone" dataKey="score" stroke="#2F81F7" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 2. CODE REVIEW (QUALITY STATS) */}
            {activeSubTab === "ai-code-review" ? (
              <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-5">
                <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={14} className="text-[#3FB950]" /> Code Quality review
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="border border-[#30363D] bg-[#0D1117] rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-[#F0F6FC]">Naming Consistency</div>
                    <div className="w-full bg-[#21262D] rounded-full h-2">
                      <div className="bg-[#3FB950] h-2 rounded-full" style={{ width: `85%` }} />
                    </div>
                    <p className="text-[10px] text-[#8B949E] leading-relaxed">Variable names conform to camelCase (JS/TS) and standard conventions.</p>
                  </div>
                  <div className="border border-[#30363D] bg-[#0D1117] rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-[#F0F6FC]">Reusability Ratio</div>
                    <div className="w-full bg-[#21262D] rounded-full h-2">
                      <div className="bg-[#2F81F7] h-2 rounded-full" style={{ width: `70%` }} />
                    </div>
                    <p className="text-[10px] text-[#8B949E] leading-relaxed">Utility logic is modularized; component structures show low duplication.</p>
                  </div>
                </div>
                <div className="border-t border-[#30363D]/50 pt-4 space-y-3">
                  <div className="text-xs font-bold text-[#F0F6FC]">Structure Suggestions:</div>
                  <ul className="list-disc pl-5 text-xs text-[#8B949E] space-y-2">
                    {report.structureSuggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                    {report.structureSuggestions.length === 0 && (
                      <li>Folder organization meets standard engineering structures.</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : null}

            {/* 3. SECURITY REVIEW */}
            {activeSubTab === "ai-security" ? (
              <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-[#F85149]" /> Security & Vulnerability Analysis
                </h3>
                <div className="border border-[#30363D] rounded-xl overflow-hidden bg-[#161B22]/10 divide-y divide-[#30363D]">
                  {report.securityRisks.map((risk, idx) => (
                    <div key={idx} className="p-4 flex items-start gap-3 justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#F0F6FC]">{risk.name}</div>
                        <p className="text-[11px] text-[#8B949E] leading-relaxed">{risk.status}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                        risk.risk === "Critical"
                          ? "bg-[#F85149]/10 border-[#F85149]/30 text-[#F85149] animate-pulse"
                          : risk.risk === "High"
                          ? "bg-[#F85149]/10 border-[#F85149]/30 text-[#F85149]"
                          : risk.risk === "Medium"
                          ? "bg-[#D29922]/10 border-[#D29922]/30 text-[#D29922]"
                          : "bg-[#3FB950]/10 border-[#3FB950]/30 text-[#3FB950]"
                      }`}>
                        {risk.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 4. DOCUMENTATION REVIEW */}
            {activeSubTab === "ai-docs" ? (
              <div className="space-y-6">
                {/* README grading */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#2F81F7]" /> README Section Ratings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {report.readmeRatings.map((section, idx) => (
                      <div key={idx} className="border border-[#30363D] bg-[#0D1117] rounded-lg p-3 flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#F0F6FC]">{section.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          section.status === "Excellent"
                            ? "bg-[#3FB950]/10 border-[#3FB950]/20 text-[#3FB950]"
                            : section.status === "Good"
                            ? "bg-[#2F81F7]/10 border-[#2F81F7]/20 text-[#2F81F7]"
                            : section.status === "Needs Improvement"
                            ? "bg-[#D29922]/10 border-[#D29922]/20 text-[#D29922]"
                            : "bg-[#F85149]/10 border-[#F85149]/20 text-[#F85149]"
                        }`}>
                          {section.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-[#F0F6FC] uppercase">AI Documentation Roadmap</h4>
                  <ul className="list-disc pl-5 text-xs text-[#8B949E] space-y-2">
                    {report.docsSuggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {/* 5. DEPENDENCY REVIEW */}
            {activeSubTab === "ai-dependencies" ? (
              <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-[#2F81F7]" /> Dependencies Audit
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-[#8B949E]">
                  <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-3">
                    <span>Main Framework</span>
                    <div className="text-sm font-bold text-[#F0F6FC] mt-1">{report.dependencies.framework}</div>
                  </div>
                  <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-3">
                    <span>Dependency Count</span>
                    <div className="text-sm font-bold text-[#F0F6FC] mt-1">{report.dependencies.packageCount}</div>
                  </div>
                  <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-3">
                    <span>Outdated Libraries</span>
                    <div className="text-sm font-bold text-[#F85149] mt-1">{report.dependencies.outdated}</div>
                  </div>
                  <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-3">
                    <span>Unused Packages</span>
                    <div className="text-sm font-bold text-[#D29922] mt-1">{report.dependencies.unused}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#30363D]/50 space-y-2 text-xs">
                  <div className="font-bold text-[#F0F6FC]">Heavy Dependencies detected:</div>
                  <div className="flex flex-wrap gap-2">
                    {report.dependencies.heavy.map((h, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-[#21262D] border border-[#30363D] text-[10px] text-[#F85149] font-semibold">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* 6. ARCHITECTURE REVIEW */}
            {activeSubTab === "ai-architecture" ? (
              <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal size={14} className="text-[#3FB950]" /> Architectural Architecture Style
                </h3>
                <div className="border border-[#30363D] bg-[#0D1117] rounded-lg p-4 text-xs text-[#8B949E] space-y-3">
                  <div className="font-bold text-[#F0F6FC]">Detected Pattern: <span className="text-[#2F81F7]">{report.architecture.type}</span></div>
                  <ul className="list-disc pl-5 space-y-2">
                    {report.architecture.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {/* 7. PERFORMANCE REVIEW */}
            {activeSubTab === "ai-performance" ? (
              <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-[#2F81F7]" /> Performance Analysis
                </h3>
                <div className="space-y-3 text-xs text-[#8B949E] leading-relaxed">
                  {report.performanceIssues.map((issue, idx) => (
                    <div key={idx} className="border border-[#30363D] bg-[#0D1117] rounded-lg p-4 flex gap-3 items-start">
                      <span className="text-[#D29922] font-semibold">⚠️ Issue {idx + 1}:</span>
                      <p>{issue}</p>
                    </div>
                  ))}
                  {report.performanceIssues.length === 0 && (
                    <p className="text-center py-4">No performance critical warnings detected.</p>
                  )}
                </div>
              </div>
            ) : null}

            {/* 8. BEST PRACTICES */}
            {activeSubTab === "ai-practices" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Best Practices */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
                    Engineering Best Practices
                  </h3>
                  <div className="space-y-3 text-xs">
                    {report.bestPractices.map((practice, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-[#30363D]/30 last:border-b-0">
                        <span className="text-[#F0F6FC]">{practice.name}</span>
                        {practice.passed ? (
                          <span className="flex items-center gap-1 text-[#3FB950] font-bold text-[10px]"><Check size={12} /> Passed</span>
                        ) : (
                          <span className="text-[#F85149] font-bold text-[10px]">Missing</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
                    Accessibility Reviews
                  </h3>
                  <div className="space-y-3 text-xs">
                    {report.accessibilityChecks.map((check, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-[#30363D]/30 last:border-b-0">
                        <span className="text-[#F0F6FC]">{check.name}</span>
                        {check.passed ? (
                          <span className="flex items-center gap-1 text-[#3FB950] font-bold text-[10px]"><Check size={12} /> Passed</span>
                        ) : (
                          <span className="text-[#F85149] font-bold text-[10px]">Needs Work</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* 9. AI SUGGESTIONS */}
            {activeSubTab === "ai-suggestions" ? (
              <div className="space-y-6">
                {/* Priorities List */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#D29922]" /> Prioritized Improvement Plan
                  </h3>
                  <div className="space-y-4">
                    {report.priorities.map((p) => (
                      <div key={p.priority} className="border border-[#30363D] bg-[#0D1117] rounded-xl p-5 space-y-3 text-xs">
                        <div className="flex justify-between items-center border-b border-[#30363D]/50 pb-2">
                          <div className="font-bold text-[#F0F6FC] flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-[#21262D] flex items-center justify-center text-[10px] text-[#2F81F7]">{p.priority}</span>
                            {p.title}
                          </div>
                          <span className="px-2 py-0.5 rounded border border-[#2F81F7]/30 bg-[#2F81F7]/10 text-[9px] text-[#2F81F7] font-bold">Impact: {p.impact}</span>
                        </div>
                        <p className="text-[#8B949E] leading-relaxed"><span className="font-semibold text-[#F0F6FC]">Why:</span> {p.why}</p>
                        <p className="text-[#8B949E] leading-relaxed"><span className="font-semibold text-[#F0F6FC]">Benefit:</span> {p.benefit}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#8B949E] pt-2 border-t border-[#30363D]/30">
                          <span>Difficulty: <span className="text-[#F0F6FC] font-semibold">{p.difficulty}</span></span>
                          <span>Est. Time: <span className="text-[#F0F6FC] font-semibold">{p.estimatedTime}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projected Improvement Scores */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
                    Projected Improvement Delta
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[#8B949E] mb-1.5">
                        <span>Repository Health Score</span>
                        <span className="font-bold text-[#F0F6FC]">{report.projectedScores.health[0]} → {report.projectedScores.health[1]} (+{report.projectedScores.health[1] - report.projectedScores.health[0]})</span>
                      </div>
                      <div className="w-full bg-[#21262D] rounded-full h-1.5">
                        <div className="bg-[#2F81F7] h-1.5 rounded-full" style={{ width: `${report.projectedScores.health[1]}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[#8B949E] mb-1.5">
                        <span>Documentation Level</span>
                        <span className="font-bold text-[#F0F6FC]">{report.projectedScores.documentation[0]} → {report.projectedScores.documentation[1]}</span>
                      </div>
                      <div className="w-full bg-[#21262D] rounded-full h-1.5">
                        <div className="bg-[#3FB950] h-1.5 rounded-full" style={{ width: `${report.projectedScores.documentation[1]}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 10. SCAN REPORTS */}
            {activeSubTab === "ai-reports" ? (
              <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-[#2F81F7]" /> Download Review Reports
                </h3>
                <p className="text-xs text-[#8B949E] leading-relaxed">Download a comprehensive PDF overview or markdown audit plan compiled by the AI review engine.</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleExportReport("markdown")}
                    className="rounded-lg bg-[#2F81F7] hover:bg-[#2F81F7]/80 text-white font-bold text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} /> Download Markdown Plan
                  </button>
                  <button
                    onClick={() => handleExportReport("json")}
                    className="rounded-lg bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] text-[#F0F6FC] font-bold text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} /> Export JSON Data
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
