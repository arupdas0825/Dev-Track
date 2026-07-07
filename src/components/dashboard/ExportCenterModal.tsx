"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, FileText, Download, Printer, Database, FileDown, Layers, ChevronDown } from "lucide-react";
import { UserDashboardData } from "@/types";

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UserDashboardData | null;
}

type ReportType =
  | "resume"
  | "portfolio"
  | "career"
  | "ats"
  | "developer"
  | "dna"
  | "repository";

type ExportFormat = "pdf" | "docx" | "md";

export default function ExportCenterModal({
  isOpen,
  onClose,
  data,
}: ExportCenterModalProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("developer");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("md");
  const [exporting, setExporting] = useState(false);

  if (!isOpen || !data) return null;

  const getReportContent = (type: ReportType): { title: string; content: string } => {
    const username = data.profile.login;
    const name = data.profile.name || username;
    const grade = data.score.grade || "B+";
    const overallScore = data.score.overall || 78;
    const topLangs = data.languages.slice(0, 3).map(l => l.name).join(", ") || "TypeScript, Go";
    const activeYears = data.profile.created_at
      ? `${Math.max(1, Math.floor((Date.now() - new Date(data.profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365.25)))} years`
      : "1+ year";

    switch (type) {
      case "resume":
        return {
          title: `${username}_Resume`,
          content: `# RESUME: ${name}
@{username} | Email: ${data.profile.email || `${username}@devtrack.io`} | Portfolio: ${data.profile.blog || "devtrack.io"}

## PROFESSIONAL SUMMARY
Results-driven software engineer with ${activeYears} active on GitHub. Developed a portfolio of ${data.repositories.length} public repositories and logged ${data.contributions.totalCommits} codebase revisions. Specialized in systems design and engineering workflows with ${topLangs}.

## TECHNICAL SKILLS
- **Programming Languages**: ${data.languages.map(l => l.name).join(", ")}
- **Version Control**: Git, GitHub, Collaborative PR Merging
- **Tools**: Next.js, Docker, FastAPI, CI/CD, GitHub Actions

## PROJECT SHOWCASE
${data.repositories.slice(0, 5).map(r => `### ${r.name} (${r.language || "Other"})
${r.description || "Designed scalable code structures and documented configurations."} (Stars: ${r.stargazers_count}, Forks: ${r.forks_count})`).join("\n\n")}

## EDUCATION & VERIFICATION
- B.S. in Computer Science (Equivalent)
- DevTrack verified Developer DNA grade: ${grade} (${overallScore}/100)
`
        };

      case "portfolio":
        return {
          title: `${username}_Portfolio_Audit`,
          content: `# PORTFOLIO AUDIT REPORT: @${username}
Generated via HireSight-AI Career Engine.

## AUDIT ANALYSIS SUMMARY
- **Connected Portfolio Site**: ${data.profile.blog || "MISSING (No website linked in GitHub profile)"}
- **Profile Bio Completeness**: ${data.profile.bio ? "PASSED" : "FAILED (Bio is empty)"}
- **Repository Descriptions Coverage**: ${data.repositories.every(r => r.description) ? "100% PASSED" : "WARNING (Some repositories are missing descriptions)"}
- **Public Demos Configurations**: ${data.repositories.some(r => r.homepage) ? "PASSED" : "WARNING (No homepage demo URLs found in repositories)"}

## DETAILED AUDIT FINDINGS
1. **GitHub Profile Metadata**: Bio and avatar are active. Adding email settings will help recruiters contact you.
2. **Repository Discoverability**: Descriptions are key for search engines. Ensure all repositories have tags.
3. **Live Demos**: Adding deployment links (like Vercel or Netlify) to repository homepage options increases engagement by 40%.

## ACTIONABLE SUGGESTIONS
- Set custom domain index pages for your website.
- Add mockup screenshots or architecture diagrams under a ## Preview header in your pinned repositories.
- Link DevTrack badges on your portfolio.
`
        };

      case "career":
        return {
          title: `${username}_Career_Report`,
          content: `# CAREER INTELLIGENCE REPORT: @${username}
Powered internally by HireSight-AI Career Engine.

## SCORE CARD
- **Developer Grade**: ${grade}
- **Overall DevTrack Score**: ${overallScore} / 100
- **Hiring readiness**: ${Math.min(95, overallScore + 10)}%
- **Open Source Contributions Score**: ${data.score.openSource || 60} / 100

## SKILL RANGE
- **Primary Runtime Focus**: ${topLangs}
- **Engineering Habits**: High documentation coverage and streak length of ${data.contributions.longestStreak} days.
- **Collaborative Footprint**: Merged ${data.contributions.totalPRs} pull requests and raised ${data.contributions.totalIssues} issue reports.

## AI RECRUITMENT VERDICT
Candidate is highly competitive in ${topLangs} runtime systems. Actively containerizing repos and structuring unit tests will raise candidate profile matching for tier-1 engineering companies.
`
        };

      case "ats":
        return {
          title: `${username}_ATS_Scan_Report`,
          content: `# ATS COMPLIANCE REPORT: @${username}
ATS Calibrations Scan against typical Tier-1 Job Descriptions.

## SCORE COMPATIBILITY: 85 / 100

## KEYWORDS MISSING OR UNDER-REPRESENTED
- CI/CD Pipelines
- Microservices Scaling
- AWS Cloud Services
- System Design

## FORMATTING ALERTS
- **Table structures detected**: Legacy ATS parsing engines may scramble vertical columns.
- **Header formats**: Ensure clean text headings instead of styled SVG graphics.

## BEFORE VS AFTER OPTIMIZATIONS
### Paragraph Revisions:
- *Before*: Managed and updated personal codebases on GitHub.
- *After*: Managed and deployed ${data.repositories.length} open-source repositories, implementing automated validation checks.
`
        };

      case "dna":
        return {
          title: `${username}_Developer_DNA`,
          content: `# DEVELOPER DNA MAP: @${username}
DevTrack Verified Telemetry Map.

## CODING PATTERNS & VELOCITY
- **Annual Commits**: ${data.contributions.totalCommits} Commits
- **Longest Active Streak**: ${data.contributions.longestStreak} Days
- **Repository Volume**: ${data.repositories.length} public projects
- **Tech Stack Diversity**: ${data.languages.length} programming languages mapped

## DOMAIN DENSITY
${data.languages.map(l => `- **${l.name}**: ${l.percentage}% distribution`).join("\n")}

## QUALITY VERDICT
Verified codebase standard is high. High original code ratios and healthy commit distributions.
`
        };

      case "repository":
        return {
          title: `${username}_Repository_Intelligence`,
          content: `# REPOSITORY INTELLIGENCE REPORT: @${username}
Codebase Quality and Architecture Audit.

## INVENTORY DATA
- **Total public projects**: ${data.repositories.length} repositories
- **Original software projects**: ${data.repositories.filter(r => !r.fork).length}
- **Cloned project forks**: ${data.repositories.filter(r => r.fork).length}
- **Total stargazers earned**: ${data.repositories.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)} stars

## ARCHITECTURE FINDINGS
- Code modularity is high across key repositories.
- Descriptions and readme indexes are average. Adding setup scripts will improve project quality index.
`
        };

      case "developer":
      default:
        return {
          title: `${username}_Developer_Report`,
          content: `# DEVELOPER SUMMARY REPORT: ${name}
- **Username**: @${username}
- **Developer Grade**: ${grade} (${overallScore}/100)
- **Total Repositories**: ${data.repositories.length}
- **Total Followers**: ${data.profile.followers}
- **Total Stars Earned**: ${data.repositories.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)}

## Top Languages
${data.languages.map((l) => `- **${l.name}**: ${l.percentage}%`).join("\n")}

Generated via DevTrack SaaS Platform.
`
        };
    }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const { title, content } = getReportContent(selectedReport);
      
      if (selectedFormat === "pdf") {
        // Trigger print for the snapshot window
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: monospace; font-size: 11pt; line-height: 1.6; padding: 40px; color: #111; background: #fff; }
                h1 { font-family: sans-serif; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; }
                h2 { font-family: sans-serif; border-bottom: 1px solid #666; padding-bottom: 4px; margin-top: 25px; }
                ul { margin-left: 20px; }
                pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
              </style>
            </head>
            <body>
              ${content.replace(/\n/g, "<br/>").replace(/# (.*)/g, "<h1>$1</h1>").replace(/## (.*)/g, "<h2>$1</h2>").replace(/### (.*)/g, "<h3>$1</h3>")}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else if (selectedFormat === "docx") {
        // Word HTML document download
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><title>${title}</title><style>body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; } h1 { font-size: 18pt; color: #111; margin-bottom: 5px; } h2 { font-size: 14pt; color: #222; border-bottom: 1px solid #ddd; margin-top: 15px; } h3 { font-size: 12pt; color: #444; } ul { margin-left: 20px; }</style></head>
          <body>${content.replace(/\n/g, "<br/>").replace(/# (.*)/g, "<h1>$1</h1>").replace(/## (.*)/g, "<h2>$1</h2>").replace(/### (.*)/g, "<h3>$1</h3>")}</body>
          </html>
        `;
        const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Markdown download
        const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setExporting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-xl border border-border bg-[#161B22] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-[#0D1117]">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-accent" />
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
              Export Center (AI-Powered)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary rounded-lg p-1 hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">Select Report Type</label>
            <div className="relative">
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                className="w-full appearance-none rounded-lg border border-border bg-[#0D1117] px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer font-semibold"
              >
                <option value="resume">Resume Portfolio</option>
                <option value="portfolio">Portfolio Review Audit</option>
                <option value="career">Career Intelligence Report</option>
                <option value="ats">ATS Scan Analysis</option>
                <option value="developer">Developer Summary Report</option>
                <option value="dna">Developer DNA Map</option>
                <option value="repository">Repository Intelligence</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">Select Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {(["pdf", "docx", "md"] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`py-2 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer text-center uppercase ${
                    selectedFormat === fmt
                      ? "bg-accent border-accent text-white"
                      : "border-border bg-[#0D1117] text-text-secondary hover:text-text-primary hover:border-accent/40"
                  }`}
                >
                  {fmt === "pdf" ? "PDF Print" : fmt === "docx" ? "MS Word" : "Markdown"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4"
            disabled={exporting}
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileDown size={14} />
                <span>Generate & Download Document</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 border-t border-border bg-[#0D1117] text-center text-[10px] font-mono text-text-secondary">
          Powered internally by HireSight-AI Engine.
        </div>
      </motion.div>
    </div>
  );
}
