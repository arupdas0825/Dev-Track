"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { UserDashboardData, GitHubRepository } from "@/types";
import { CareerEngine } from "@/services/careerEngine";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Code,
  Compass,
  Cpu,
  ExternalLink,
  FileText,
  FileCode,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Globe,
  HelpCircle,
  Languages,
  Layers,
  LineChart,
  Link2,
  Lock,
  Plus,
  Share2,
  Shield,
  Sparkles,
  Star,
  Terminal,
  Trash2,
  Users,
  AlertTriangle,
  FileDown,
  Briefcase,
  Copy,
  Check,
  TrendingUp,
  ChevronDown,
  RefreshCw,
  Send,
  MessageSquare,
  ClipboardList,
  Search,
  Book,
  Download
} from "lucide-react";

interface DeveloperCareerHubProps {
  data: UserDashboardData;
  activeSubTab: string;
  setActiveSubTab: (tabId: string) => void;
  githubToken?: string;
}

interface Application {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interviewing" | "Rejected" | "Selected" | "Offer";
  date: string;
  resumeUsed: string;
  coverLetter: string;
  notes: string;
}

export default function DeveloperCareerHub({
  data,
  activeSubTab,
  setActiveSubTab,
  githubToken
}: DeveloperCareerHubProps) {
  const { profile, repositories, contributions, score, languages } = data;

  // --- Common loading states ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- 1. Career Dashboard states ---
  const [dashboardMetrics, setDashboardMetrics] = useState({
    devGrade: score.grade || "B+",
    atsScore: 82,
    resumeStrength: 85,
    portfolioStrength: profile.blog ? 88 : 45,
    githubStrength: score.overall || 75,
    openSourceScore: score.openSource || 60,
    techSkills: languages.slice(0, 5).map(l => l.name),
    softSkills: ["Technical Writing", "Code Collaboration", "Systems Design"],
    hiringReadiness: Math.round(((score.overall || 75) + 85 + (profile.blog ? 88 : 45)) / 3),
    careerStage: score.overall > 85 ? "Principal Architect" : score.overall > 70 ? "Senior Engineer" : "Mid-Level Engineer"
  });

  const handleRefreshDashboard = async () => {
    setLoading(true);
    try {
      // Simulate reload or direct updates
      await new Promise(resolve => setTimeout(resolve, 800));
      setDashboardMetrics({
        devGrade: score.grade || "A",
        atsScore: 87,
        resumeStrength: 90,
        portfolioStrength: profile.blog ? 92 : 55,
        githubStrength: score.overall || 82,
        openSourceScore: score.openSource || 68,
        techSkills: languages.slice(0, 6).map(l => l.name),
        softSkills: ["Technical Documentation", "Code Review", "Async Collaboration", "API Design"],
        hiringReadiness: Math.round(((score.overall || 82) + 90 + (profile.blog ? 92 : 55)) / 3),
        careerStage: score.overall > 85 ? "Principal Architect" : score.overall > 70 ? "Senior Engineer" : "Mid-Level Engineer"
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Smart Resume Builder states ---
  const [resumes, setResumes] = useState<Record<string, string>>({});
  const [activeTemplate, setActiveTemplate] = useState<string>("professional");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const cachedResumes = CareerEngine.getCache<any>(`resumes_${profile.login}`);
        if (cachedResumes) {
          setResumes(cachedResumes);
        } else {
          setLoading(true);
          const dataResumes = await CareerEngine.generateResumes(profile, repositories, languages);
          setResumes(dataResumes);
        }
      } catch (err: any) {
        setErrorMsg("Failed to generate resume profiles: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (activeSubTab === "career-resume-builder" && Object.keys(resumes).length === 0) {
      fetchResumes();
    }
  }, [activeSubTab, profile, repositories, languages, resumes]);

  // --- 3. ATS Analyzer states ---
  const [atsResumeText, setAtsResumeText] = useState("");
  const [atsJd, setAtsJd] = useState("");
  const [atsResults, setAtsResults] = useState<any>(null);
  const [parsingFile, setParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload/", {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        if (result.extracted_text) {
          setAtsResumeText(result.extracted_text);
        } else {
          alert("Uploaded file parsed, but no text could be extracted. Please paste text manually.");
        }
      } else {
        alert("Upload failed. Make sure FastAPI server is running on http://localhost:5000");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error contacting upload API: " + err.message);
    } finally {
      setParsingFile(false);
    }
  };

  const handleRunAts = async () => {
    if (!atsResumeText.trim() || !atsJd.trim()) {
      alert("Please provide both your resume text and the job description.");
      return;
    }
    setLoading(true);
    try {
      const res = await CareerEngine.analyzeAts(atsResumeText, atsJd);
      setAtsResults(res);
    } catch (err: any) {
      setErrorMsg("ATS Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Portfolio Analyzer states ---
  const [portfolioUrl, setPortfolioUrl] = useState(profile.blog || "");
  const [portfolioAudit, setPortfolioAudit] = useState<any>(null);

  const handleRunPortfolioAudit = async (force = false) => {
    setLoading(true);
    try {
      const res = await CareerEngine.analyzePortfolio(portfolioUrl, profile, repositories, force);
      setPortfolioAudit(res);
    } catch (err: any) {
      setErrorMsg("Portfolio Audit failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "career-portfolio-analyzer" && !portfolioAudit) {
      handleRunPortfolioAudit();
    }
  }, [activeSubTab]);

  // --- 5. Job Match states ---
  const [jobMatchJd, setJobMatchJd] = useState("");
  const [jobMatchResults, setJobMatchResults] = useState<any>(null);

  const handleRunJobMatch = async () => {
    if (!jobMatchJd.trim()) {
      alert("Please enter a Job Description to match.");
      return;
    }
    setLoading(true);
    try {
      // Pick active resume or general summary
      const activeResume = resumes[activeTemplate] || resumes["professional"] || profile.bio || "";
      const res = await CareerEngine.matchJob(activeResume, jobMatchJd, repositories);
      setJobMatchResults(res);
    } catch (err: any) {
      setErrorMsg("Job match analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 6. Cover Letter Generator states ---
  const [clCompany, setClCompany] = useState("");
  const [clRole, setClRole] = useState("");
  const [clJd, setClJd] = useState("");
  const [clType, setClType] = useState("Software Engineer");
  const [generatedCl, setGeneratedCl] = useState("");

  const handleGenerateCoverLetter = async () => {
    if (!clCompany.trim() || !clRole.trim()) {
      alert("Company Name and Role Title are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await CareerEngine.generateCoverLetter(clCompany, clRole, clJd, clType, profile, languages);
      setGeneratedCl(res.letter);
    } catch (err: any) {
      setErrorMsg("Cover letter generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 7. LinkedIn Optimizer states ---
  const [linkedinData, setLinkedinData] = useState<any>(null);

  const handleFetchLinkedIn = async (force = false) => {
    setLoading(true);
    try {
      const res = await CareerEngine.optimizeLinkedin(profile, repositories, languages, force);
      setLinkedinData(res);
    } catch (err: any) {
      setErrorMsg("LinkedIn optimization failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "career-linkedin" && !linkedinData) {
      handleFetchLinkedIn();
    }
  }, [activeSubTab]);

  // --- 8. Skill Gap Analysis states ---
  const [targetRole, setTargetRole] = useState("Full Stack");
  const [skillGapData, setSkillGapData] = useState<any>(null);

  const handleFetchSkillGap = async (role: string, force = false) => {
    setLoading(true);
    try {
      const res = await CareerEngine.analyzeSkillGap(languages, repositories, role, force);
      setSkillGapData(res);
    } catch (err: any) {
      setErrorMsg("Skill gap analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "career-skill-gap") {
      handleFetchSkillGap(targetRole);
    }
  }, [activeSubTab, targetRole]);

  // --- 9. Interview Preparation states ---
  const [interviewRole, setInterviewRole] = useState("Full Stack Engineer");
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [completedAnswers, setCompletedAnswers] = useState<Record<string, boolean>>({});

  const handleFetchInterview = async (force = false) => {
    setLoading(true);
    try {
      const res = await CareerEngine.generateInterviewQuestions(profile, repositories, languages, interviewRole, force);
      setInterviewQuestions(res);
    } catch (err: any) {
      setErrorMsg("Interview prep generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "career-interview-prep" && interviewQuestions.length === 0) {
      handleFetchInterview();
    }
  }, [activeSubTab]);

  const handleToggleAnswer = (id: string) => {
    setCompletedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- 10. Career Roadmap states ---
  const [roadmapRole, setRoadmapRole] = useState("Full Stack");
  const [roadmapData, setRoadmapData] = useState<any>(null);

  const handleFetchRoadmap = async (role: string, force = false) => {
    setLoading(true);
    try {
      const res = await CareerEngine.generateRoadmap(languages, role, force);
      setRoadmapData(res.roadmap);
    } catch (err: any) {
      setErrorMsg("Roadmap generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "career-roadmap") {
      handleFetchRoadmap(roadmapRole);
    }
  }, [activeSubTab, roadmapRole]);

  // --- 11. Resume Versions states ---
  const [savedVersions, setSavedVersions] = useState<Array<{ id: string; title: string; type: string; date: string; content: string }>>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("devtrack_saved_resumes");
      if (stored) {
        setSavedVersions(JSON.parse(stored));
      } else {
        const defaults = [
          {
            id: "ver-1",
            title: "Original GitHub Profile Export",
            type: "professional",
            date: "2026-07-06",
            content: `Resume Export for @${profile.login}`
          }
        ];
        setSavedVersions(defaults);
        localStorage.setItem("devtrack_saved_resumes", JSON.stringify(defaults));
      }
    }
  }, [profile.login]);

  const handleSaveVersion = (content: string, type: string) => {
    const title = prompt("Enter a name for this resume version:", `${type.toUpperCase()} Template - Draft`);
    if (!title) return;

    const newVer = {
      id: `ver-${Date.now()}`,
      title,
      type,
      date: new Date().toISOString().split("T")[0],
      content
    };
    const updated = [newVer, ...savedVersions];
    setSavedVersions(updated);
    localStorage.setItem("devtrack_saved_resumes", JSON.stringify(updated));
    alert("Version saved! You can access it in the 'Resume Versions' tab.");
  };

  const handleDeleteVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this version?")) return;
    const updated = savedVersions.filter(v => v.id !== id);
    setSavedVersions(updated);
    localStorage.setItem("devtrack_saved_resumes", JSON.stringify(updated));
  };

  // --- 12. Application Tracker states ---
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddApp, setShowAddApp] = useState(false);
  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    status: "Applied" as any,
    date: new Date().toISOString().split("T")[0],
    resumeUsed: "Default Professional Resume",
    coverLetter: "",
    notes: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("devtrack_job_applications");
      if (stored) {
        setApplications(JSON.parse(stored));
      } else {
        const defaults: Application[] = [
          {
            id: "app-1",
            company: "Google",
            role: "Software Engineer - Frontend",
            status: "Interviewing",
            date: "2026-07-01",
            resumeUsed: "Professional Resume",
            coverLetter: "Cover letter sent via email.",
            notes: "Initial phone interview completed. Tech screening scheduled."
          },
          {
            id: "app-2",
            company: "Vercel",
            role: "Frontend Engineer",
            status: "Applied",
            date: "2026-07-05",
            resumeUsed: "Modern Resume",
            coverLetter: "",
            notes: "Applied via referral link."
          }
        ];
        setApplications(defaults);
        localStorage.setItem("devtrack_job_applications", JSON.stringify(defaults));
      }
    }
  }, []);

  const handleAddApp = () => {
    if (!newApp.company.trim() || !newApp.role.trim()) {
      alert("Company and Role are required fields.");
      return;
    }
    const app: Application = {
      id: `app-${Date.now()}`,
      ...newApp
    };
    const updated = [app, ...applications];
    setApplications(updated);
    localStorage.setItem("devtrack_job_applications", JSON.stringify(updated));
    setNewApp({
      company: "",
      role: "",
      status: "Applied",
      date: new Date().toISOString().split("T")[0],
      resumeUsed: "Default Professional Resume",
      coverLetter: "",
      notes: ""
    });
    setShowAddApp(false);
  };

  const handleDeleteApp = (id: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    const updated = applications.filter(a => a.id !== id);
    setApplications(updated);
    localStorage.setItem("devtrack_job_applications", JSON.stringify(updated));
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    const updated = applications.map(a => (a.id === id ? { ...a, status: newStatus } : a));
    setApplications(updated);
    localStorage.setItem("devtrack_job_applications", JSON.stringify(updated));
  };

  // --- 13. AI Career Assistant Chat states ---
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: `Hi! I'm your Career Intelligence Coach powered by HireSight-AI. I see you are maintaining ${repositories.length} projects (including '${repositories[0]?.name || "personal repositories"}'). Ask me how to optimize your resume, review code quality, map out a learning roadmap, or check matching scores for target companies!` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await CareerEngine.assistantChat(userMsg, profile, repositories);
      setChatMessages(prev => [...prev, { sender: "ai", text: res.response }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: "ai", text: "Oops, I encountered a communication error with the backend: " + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- Clipboard copy helpers ---
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- Resume Exporter ---
  const handleExport = (content: string, format: "md" | "docx" | "txt", docType = "resume") => {
    const filename = `${profile.login}_${docType}.${format}`;
    let blob: Blob;

    if (format === "docx") {
      // Generate Word XML/HTML wrapper
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>${docType.toUpperCase()}</title><style>body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; } h1 { font-size: 18pt; color: #111; margin-bottom: 5px; } h2 { font-size: 14pt; color: #222; border-bottom: 1px solid #ddd; margin-top: 15px; } h3 { font-size: 12pt; color: #444; } ul { margin-left: 20px; }</style></head>
        <body>${content.replace(/\n/g, "<br/>").replace(/# (.*)/g, "<h1>$1</h1>").replace(/## (.*)/g, "<h2>$1</h2>").replace(/### (.*)/g, "<h3>$1</h3>")}</body>
        </html>
      `;
      blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword;charset=utf-8" });
    } else {
      blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render individual sub-tab templates
  const renderSubTab = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <svg className="animate-spin h-8 w-8 text-accent mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold tracking-wide font-mono">Calibrating Career Engine...</span>
        </div>
      );
    }

    switch (activeSubTab) {
      // ------------------------------------------
      // 1. CAREER DASHBOARD
      // ------------------------------------------
      case "career-dashboard":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Career Performance Dashboard</span>
              <button
                onClick={handleRefreshDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-border bg-[#161B22]/60 hover:bg-[#161B22] text-[#79c0ff] cursor-pointer text-[10px] font-bold"
              >
                <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                <span>Refresh Insights</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 relative overflow-hidden group">
                <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Developer Grade</span>
                <div className="text-3xl font-black text-accent mt-3">{dashboardMetrics.devGrade}</div>
                <div className="text-[9px] text-text-secondary mt-1">Based on Repository DNA Score</div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 relative overflow-hidden group">
                <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">ATS Score Compatibility</span>
                <div className="text-3xl font-black text-success mt-3">{dashboardMetrics.atsScore}%</div>
                <div className="text-[9px] text-text-secondary mt-1">Average across target profiles</div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 relative overflow-hidden group">
                <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Resume Strength</span>
                <div className="text-3xl font-black text-warning mt-3">{dashboardMetrics.resumeStrength}%</div>
                <div className="text-[9px] text-text-secondary mt-1">Completeness & keywords matched</div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 relative overflow-hidden group">
                <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Portfolio Strength</span>
                <div className="text-3xl font-black text-[#BC8CFF] mt-3">{dashboardMetrics.portfolioStrength}%</div>
                <div className="text-[9px] text-text-secondary mt-1">{profile.blog ? "Domain & details connected" : "Add portfolio link"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Hiring & Readiness Metrics</h3>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg border border-border/60 bg-surface/50 font-mono">
                    <div className="text-xs text-text-secondary">GitHub Index</div>
                    <div className="text-lg font-bold text-text-primary mt-1">{dashboardMetrics.githubStrength}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-surface/50 font-mono">
                    <div className="text-xs text-text-secondary">Open Source</div>
                    <div className="text-lg font-bold text-text-primary mt-1">{dashboardMetrics.openSourceScore}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-surface/50 font-mono">
                    <div className="text-xs text-text-secondary">Readiness</div>
                    <div className="text-lg font-bold text-[#3FB950] mt-1">{dashboardMetrics.hiringReadiness}%</div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-text-secondary">
                    <span>Career Path Segment:</span>
                    <strong className="text-text-primary">{dashboardMetrics.careerStage}</strong>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-text-secondary">
                    <span>Repository Count:</span>
                    <strong className="text-text-primary">{repositories.length} Active</strong>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Skills Profiler</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-[#8B949E] uppercase tracking-wider block font-bold mb-1">Top Runtimes</span>
                    <div className="flex flex-wrap gap-1">
                      {dashboardMetrics.techSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-[9px] font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8B949E] uppercase tracking-wider block font-bold mb-1">Methodologies</span>
                    <div className="flex flex-wrap gap-1">
                      {dashboardMetrics.softSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[9px] font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 2. SMART RESUME BUILDER
      // ------------------------------------------
      case "career-resume-builder":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 flex-wrap gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {Object.keys(resumes).map((tpl) => (
                  <button
                    key={tpl}
                    onClick={() => setActiveTemplate(tpl)}
                    className={`px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer transition-all border uppercase ${
                      activeTemplate === tpl
                        ? "bg-accent border-accent text-white"
                        : "border-border bg-surface text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tpl}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveVersion(resumes[activeTemplate], activeTemplate)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded border border-border bg-[#161B22]/60 hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
                >
                  <Plus size={11} />
                  <span>Save Draft</span>
                </button>

                <div className="flex border border-border rounded overflow-hidden">
                  {(["md", "docx", "txt"] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(resumes[activeTemplate], fmt)}
                      className="px-2 py-1 text-[9px] font-bold bg-[#161B22]/60 hover:bg-[#161B22] text-accent border-r last:border-0 border-border cursor-pointer uppercase"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {resumes[activeTemplate] ? (
              <div className="rounded-xl border border-border bg-[#0D1117]/60 p-5 font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap select-text selection:bg-accent/40 scrollbar-thin">
                {resumes[activeTemplate]}
              </div>
            ) : (
              <div className="text-center py-10 text-text-secondary">No resume templates generated. Click refresh.</div>
            )}
          </div>
        );

      // ------------------------------------------
      // 3. ATS RESUME ANALYZER
      // ------------------------------------------
      case "career-ats-analyzer":
        return (
          <div className="space-y-6">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block">ATS Ghosting Detector</span>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-primary">Resume Input</h4>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-accent font-bold hover:underline cursor-pointer"
                      disabled={parsingFile}
                    >
                      {parsingFile ? "Parsing PDF..." : "Upload File (PDF/DOCX)"}
                    </button>
                  </div>
                  
                  <textarea
                    value={atsResumeText}
                    onChange={(e) => setAtsResumeText(e.target.value)}
                    placeholder="Paste resume text or upload a PDF/DOCX file to extract text..."
                    className="w-full h-40 rounded border border-border bg-[#0D1117] p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent resize-none font-mono scrollbar-thin"
                  />
                </div>

                <div className="rounded-xl border border-border bg-[#161B22]/30 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-text-primary">Target Job Description</h4>
                  <textarea
                    value={atsJd}
                    onChange={(e) => setAtsJd(e.target.value)}
                    placeholder="Paste the job requirements and description here to run calibrations..."
                    className="w-full h-40 rounded border border-border bg-[#0D1117] p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent resize-none font-mono scrollbar-thin"
                  />
                </div>

                <button
                  onClick={handleRunAts}
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <Sparkles size={13} />
                  <span>Run Intelligence Scan</span>
                </button>
              </div>

              <div className="md:col-span-7 space-y-4">
                {atsResults ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="rounded-xl border border-border bg-surface/40 p-5 flex items-center gap-6">
                      <div className="relative h-20 w-20 flex items-center justify-center flex-shrink-0">
                        <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="#30363D" strokeWidth="5" fill="transparent" />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke={atsResults.score > 80 ? "#3FB950" : "#D29922"}
                            strokeWidth="5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 - (atsResults.score / 100) * 2 * Math.PI * 34}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="text-lg font-black font-mono">{atsResults.score}%</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary">Compliance Score</h4>
                        <p className="text-[11px] text-text-secondary mt-1">Based on keyword density, formatting guidelines, and impact phrases matching the job profile.</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-4 space-y-3">
                      <div>
                        <span className="text-[9px] text-danger uppercase tracking-wider font-bold block mb-1">Missing Keywords</span>
                        <div className="flex flex-wrap gap-1">
                          {atsResults.missing_keywords.map((kw: string) => (
                            <span key={kw} className="px-2 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger text-[10px] font-mono">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-2">
                        <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-bold block mb-2">Before vs After Comparison</span>
                        <div className="space-y-2 text-[10px] font-mono">
                          {atsResults.before_vs_after?.map((item: any, idx: number) => (
                            <div key={idx} className="p-2 border border-border bg-surface/30 rounded">
                              <div className="text-danger-light"><span className="text-danger font-bold">-</span> {item.original}</div>
                              <div className="text-success mt-1"><span className="text-success font-bold">+</span> {item.revised}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
                        <div>
                          <span className="text-success font-bold block mb-1">Strong Fields</span>
                          <ul className="list-disc pl-3.5 space-y-1 text-text-secondary">
                            {atsResults.strong_sections.map((s: string) => <li key={s}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-warning font-bold block mb-1">Weak Fields / Formatting</span>
                          <ul className="list-disc pl-3.5 space-y-1 text-text-secondary">
                            {atsResults.weak_sections.map((w: string) => <li key={w}>{w}</li>)}
                            {atsResults.formatting_issues.map((f: string) => <li key={f}>{f}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full rounded-xl border border-dashed border-border bg-surface/10 flex flex-col items-center justify-center p-8 text-center text-text-secondary">
                    <AlertTriangle size={24} className="mb-2 text-[#8B949E]" />
                    <span className="text-xs">No scan run yet. Ingest your resume and Job Description to begin.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 4. PORTFOLIO ANALYZER
      // ------------------------------------------
      case "career-portfolio-analyzer":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 flex-wrap gap-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Portfolio Review Auditor</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="rounded border border-border bg-[#0D1117] px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent w-48 font-mono"
                />
                <button
                  onClick={() => handleRunPortfolioAudit(true)}
                  className="px-3 py-1 rounded bg-accent hover:bg-accent/90 text-white font-bold text-xs cursor-pointer"
                >
                  Re-Audit
                </button>
              </div>
            </div>

            {portfolioAudit ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                      <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#30363D" strokeWidth="5" fill="transparent" />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#BC8CFF"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 - (portfolioAudit.score / 100) * 2 * Math.PI * 40}
                        />
                      </svg>
                      <span className="text-xl font-bold font-mono">{portfolioAudit.score}%</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-2">Strength Rating</span>
                  </div>

                  <div className="md:col-span-8 space-y-2 text-[11px] font-mono">
                    <div className="text-xs text-text-primary font-bold">Audit Telemetry Summary:</div>
                    <div className="space-y-1">
                      {portfolioAudit.passed.map((p: string) => (
                        <div key={p} className="text-success"><span className="font-bold">✓</span> {p}</div>
                      ))}
                      {portfolioAudit.failed.map((f: string) => (
                        <div key={f} className="text-danger"><span className="font-bold">✗</span> {f}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-[#BC8CFF] font-bold text-xs">
                    <Sparkles size={13} />
                    <span>AI Portfolio Suggestions</span>
                  </div>
                  <ul className="space-y-2 text-xs text-text-secondary list-disc pl-4">
                    {portfolioAudit.suggestions.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        );

      // ------------------------------------------
      // 5. JOB MATCH
      // ------------------------------------------
      case "career-job-match":
        return (
          <div className="space-y-6">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block">Job Match Score Calculator</span>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 space-y-4">
                <textarea
                  value={jobMatchJd}
                  onChange={(e) => setJobMatchJd(e.target.value)}
                  placeholder="Paste target role job description here..."
                  className="w-full h-64 rounded border border-border bg-[#0D1117] p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent resize-none font-mono scrollbar-thin"
                />
                <button
                  onClick={handleRunJobMatch}
                  className="w-full py-2 bg-[#2F81F7] hover:bg-[#2F81F7]/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Analyze Match Score
                </button>
              </div>

              <div className="md:col-span-6">
                {jobMatchResults ? (
                  <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-text-primary">Match Level Verdict</h4>
                      <span className={`text-base font-black ${jobMatchResults.score > 80 ? "text-success" : "text-warning"}`}>
                        {jobMatchResults.score}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${jobMatchResults.score}%` }} />
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block mb-1">Interview Readiness</span>
                        <span className="px-2 py-0.5 rounded bg-success/15 border border-success/30 text-success text-[10px] font-bold">
                          {jobMatchResults.interview_readiness}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block mb-1">Missing Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {jobMatchResults.missing_skills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger text-[10px] font-mono">
                              {s}
                            </span>
                          ))}
                          {jobMatchResults.missing_skills.length === 0 && <span className="text-text-secondary text-[10px] italic">None detected.</span>}
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-3">
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block mb-1">Improvement Plan</span>
                        <ul className="list-disc pl-4 space-y-1 text-text-secondary">
                          {jobMatchResults.recommended_improvements.map((i: string, idx: number) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full rounded-xl border border-dashed border-border bg-surface/10 flex flex-col items-center justify-center p-8 text-center text-text-secondary">
                    <LineChart size={24} className="mb-2 text-[#8B949E]" />
                    <span className="text-xs">Paste target Job Description details to evaluate match index.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 6. COVER LETTER GENERATOR
      // ------------------------------------------
      case "career-cover-letter":
        return (
          <div className="space-y-6">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block">Personalized Cover Letter Generator</span>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-secondary block mb-1">Company</label>
                    <input
                      type="text"
                      value={clCompany}
                      onChange={(e) => setClCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full rounded border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-secondary block mb-1">Role Title</label>
                    <input
                      type="text"
                      value={clRole}
                      onChange={(e) => setClRole(e.target.value)}
                      placeholder="e.g. AI Engineer"
                      className="w-full rounded border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block mb-1">Letter Focus Type</label>
                  <select
                    value={clType}
                    onChange={(e) => setClType(e.target.value)}
                    className="w-full rounded border border-border bg-[#0D1117] px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {["Software Engineer", "Frontend", "Backend", "AI Engineer", "ML Engineer", "Cloud Engineer", "Open Source", "Internship", "Research"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary block mb-1">Role Description</label>
                  <textarea
                    value={clJd}
                    onChange={(e) => setClJd(e.target.value)}
                    placeholder="Paste job details..."
                    className="w-full h-32 rounded border border-border bg-[#0D1117] p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent resize-none font-mono scrollbar-thin"
                  />
                </div>

                <button
                  onClick={handleGenerateCoverLetter}
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Generate Cover Letter
                </button>
              </div>

              <div className="md:col-span-7 space-y-3">
                {generatedCl ? (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-bold">Output Markdown</span>
                      <div className="flex border border-border rounded overflow-hidden">
                        {(["md", "docx", "txt"] as const).map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => handleExport(generatedCl, fmt, `${clCompany}_cover_letter`)}
                            className="px-2 py-0.5 text-[8px] font-bold bg-[#161B22]/60 hover:bg-[#161B22] text-accent border-r last:border-0 border-border cursor-pointer uppercase"
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-[#0D1117]/60 p-5 font-mono text-xs leading-relaxed max-h-[360px] overflow-y-auto whitespace-pre-wrap select-text selection:bg-accent/40 scrollbar-thin">
                      {generatedCl}
                    </div>
                  </div>
                ) : (
                  <div className="h-full rounded-xl border border-dashed border-border bg-surface/10 flex flex-col items-center justify-center p-8 text-center text-text-secondary">
                    <FileCode size={24} className="mb-2 text-[#8B949E]" />
                    <span className="text-xs">Provide role target details to generate customized cover letters.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 7. LINKEDIN OPTIMIZER
      // ------------------------------------------
      case "career-linkedin":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">LinkedIn Profile Optimizer</span>
              <button
                onClick={() => handleFetchLinkedIn(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-border bg-[#161B22]/60 hover:bg-[#161B22] text-[#79c0ff] cursor-pointer text-[10px] font-bold"
              >
                <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                <span>Re-Generate</span>
              </button>
            </div>

            {linkedinData ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-bold">Headline</span>
                    <button
                      onClick={() => handleCopy(linkedinData.headline, "headline")}
                      className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {copiedField === "headline" ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-text-primary bg-[#0D1117]/30 border border-border/40 p-3 rounded-lg leading-relaxed select-all">
                    {linkedinData.headline}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-bold">About Section Summary</span>
                    <button
                      onClick={() => handleCopy(linkedinData.about, "about")}
                      className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {copiedField === "about" ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary bg-[#0D1117]/30 border border-border/40 p-3 rounded-lg leading-relaxed whitespace-pre-wrap select-all max-h-40 overflow-y-auto scrollbar-thin">
                    {linkedinData.about}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-mono">
                  <div className="rounded-xl border border-border bg-surface/30 p-4">
                    <span className="text-[9px] text-[#8B949E] uppercase font-bold block mb-1">Keywords / Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {linkedinData.skills.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-surface border border-border text-text-primary">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-surface/30 p-4">
                    <span className="text-[9px] text-[#8B949E] uppercase font-bold block mb-1">Featured Repos</span>
                    <div className="space-y-1.5">
                      {linkedinData.featured_projects.map((p: any) => (
                        <div key={p.title} className="truncate text-text-primary">
                          🚀 <strong>{p.title}</strong>: <span className="text-text-secondary">{p.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );

      // ------------------------------------------
      // 8. SKILL GAP ANALYSIS
      // ------------------------------------------
      case "career-skill-gap":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 flex-wrap gap-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Skill Gap Comparator</span>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="appearance-none bg-[#161B22] border border-border text-text-primary text-[11px] font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
                >
                  {["Frontend Engineer", "Backend Engineer", "Full Stack", "AI Engineer", "ML Engineer", "Cloud Engineer", "DevOps", "Platform Engineer", "Security Engineer"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {skillGapData ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                  <div className="flex items-center justify-between font-mono">
                    <h3 className="text-xs font-bold text-text-primary">{targetRole} Profile Alignment</h3>
                    <span className={`text-sm font-bold ${skillGapData.current_percentage > 70 ? "text-success" : "text-warning"}`}>
                      {skillGapData.current_percentage}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${skillGapData.current_percentage}%` }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-mono pt-2">
                    <div>
                      <span className="text-success uppercase font-bold block mb-1">Matched Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {skillGapData.matched_skills.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-danger uppercase font-bold block mb-1">Missing Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {skillGapData.missing_skills.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-accent font-bold text-xs">
                    <BookOpen size={13} />
                    <span>Learning Recommendations & Resources (Est: {skillGapData.learning_time})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {skillGapData.resources.map((item: any) => (
                      <div key={item.skill} className="p-3 border border-border/60 bg-surface/20 rounded">
                        <div className="font-bold text-text-primary">{item.skill}</div>
                        <div className="text-[11px] text-text-secondary mt-1">{item.resource}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );

      // ------------------------------------------
      // 9. INTERVIEW PREPARATION
      // ------------------------------------------
      case "career-interview-prep":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 flex-wrap gap-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Interview Simulator</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interviewRole}
                  onChange={(e) => setInterviewRole(e.target.value)}
                  className="rounded border border-border bg-[#0D1117] px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-accent w-48 font-mono"
                />
                <button
                  onClick={() => handleFetchInterview(true)}
                  className="px-3 py-1 rounded bg-accent hover:bg-accent/90 text-white font-bold text-xs cursor-pointer"
                >
                  Generate Q&A
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {interviewQuestions.map((q) => {
                const isOpen = !!completedAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-lg border border-border bg-[#161B22]/30 space-y-2 cursor-pointer hover:border-border-hover transition-colors"
                    onClick={() => handleToggleAnswer(q.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase">
                          {q.category}
                        </span>
                        <h4 className="font-bold text-text-primary text-xs leading-normal">{q.question}</h4>
                      </div>
                      <ChevronDown size={14} className={`text-text-secondary transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>

                    {isOpen && (
                      <div className="text-[11px] text-[#8B949E] leading-relaxed bg-[#0D1117]/60 p-3 rounded border border-border/40 font-mono animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <strong>Model Answer Suggestion:</strong>
                        <p className="mt-1">{q.answer_summary}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ------------------------------------------
      // 10. CAREER ROADMAP
      // ------------------------------------------
      case "career-roadmap":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 flex-wrap gap-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Personalized Roadmap Milestones</span>
              <div className="relative">
                <select
                  value={roadmapRole}
                  onChange={(e) => {
                    setRoadmapRole(e.target.value);
                    handleFetchRoadmap(e.target.value);
                  }}
                  className="appearance-none bg-[#161B22] border border-border text-text-primary text-[11px] font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
                >
                  {["Full Stack", "Backend Engineer", "Frontend Engineer", "AI/ML Engineer"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {roadmapData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px] font-mono">
                {Object.entries(roadmapData).map(([days, step]: any) => (
                  <div key={days} className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-10 w-10 bg-accent/5 rounded-bl-full blur-md" />
                    <span className="text-accent font-bold uppercase tracking-wider block border-b border-border/40 pb-1.5">
                      {days === "365" ? "1 Year" : `${days} Days`}: {step.title}
                    </span>
                    <ul className="space-y-2 list-disc pl-3.5 text-[#8B949E]">
                      {step.milestones.map((m: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{m}</li>
                      ))}
                    </ul>
                    <div className="border-t border-border/40 pt-2 text-[10px]">
                      <span className="text-text-primary block font-bold">Resources:</span>
                      <span className="text-text-secondary">{step.resources.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );

      // ------------------------------------------
      // 11. RESUME VERSIONS
      // ------------------------------------------
      case "career-versions":
        return (
          <div className="space-y-6">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block">Draft Versions Index</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedVersions.map(v => (
                <div key={v.id} className="rounded-xl border border-border bg-[#161B22]/30 p-4 space-y-3 relative group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-bold uppercase">
                        {v.type}
                      </span>
                      <h4 className="font-bold text-text-primary text-xs mt-2">{v.title}</h4>
                      <p className="text-[10px] text-text-secondary mt-1">Saved: <code>{v.date}</code></p>
                    </div>

                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleExport(v.content, "md", `${v.type}_draft`)}
                        className="text-text-secondary hover:text-accent p-1 cursor-pointer"
                        title="Download Markdown"
                      >
                        <Download size={12} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteVersion(v.id, e)}
                        className="text-text-secondary hover:text-danger p-1 cursor-pointer"
                        title="Delete Draft"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {savedVersions.length === 0 && (
                <div className="col-span-2 text-center py-10 text-text-secondary italic">No drafts saved. Save drafts inside the Resume Builder.</div>
              )}
            </div>
          </div>
        );

      // ------------------------------------------
      // 12. APPLICATION TRACKER
      // ------------------------------------------
      case "career-tracker":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Job Applications Tracker</span>
              <button
                onClick={() => setShowAddApp(!showAddApp)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded border border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent font-bold cursor-pointer"
              >
                <Plus size={11} />
                <span>Add Application</span>
              </button>
            </div>

            {showAddApp && (
              <div className="p-4 rounded-xl border border-border bg-surface-secondary space-y-3 max-w-md mx-auto">
                <span className="text-[10px] text-text-primary font-bold uppercase tracking-wider block">Add Job Application Entry</span>
                
                <div className="space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#8B949E] block mb-1">Company</label>
                      <input
                        type="text"
                        placeholder="e.g. Google"
                        value={newApp.company}
                        onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8B949E] block mb-1">Role Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Fullstack Engineer"
                        value={newApp.role}
                        onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#8B949E] block mb-1">Status</label>
                      <select
                        value={newApp.status}
                        onChange={(e) => setNewApp({ ...newApp, status: e.target.value as any })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2 py-1.5 text-xs text-text-primary focus:outline-none"
                      >
                        {["Applied", "Interviewing", "Rejected", "Selected", "Offer"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[#8B949E] block mb-1">Date</label>
                      <input
                        type="date"
                        value={newApp.date}
                        onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#8B949E] block mb-1">Resume Version Used</label>
                    <input
                      type="text"
                      placeholder="e.g. Professional Resume Version 1"
                      value={newApp.resumeUsed}
                      onChange={(e) => setNewApp({ ...newApp, resumeUsed: e.target.value })}
                      className="w-full rounded border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#8B949E] block mb-1">Notes</label>
                    <textarea
                      placeholder="Recruiter contact details, coding round links, etc..."
                      value={newApp.notes}
                      onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                      className="w-full h-16 rounded border border-border bg-[#0D1117] p-2 text-xs text-text-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 text-[10px]">
                  <button
                    onClick={() => setShowAddApp(false)}
                    className="px-3 py-1.5 rounded border border-border bg-surface text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddApp}
                    className="px-3 py-1.5 rounded bg-accent text-white hover:bg-accent/90"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto border border-border rounded-xl bg-surface/20">
              <table className="w-full border-collapse text-left text-xs text-text-secondary font-mono">
                <thead>
                  <tr className="bg-[#161B22]/50 border-b border-border text-[9px] text-[#8B949E] uppercase tracking-wider font-bold">
                    <th className="p-3">Company</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Resume Used</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-[#161B22]/20 transition-colors">
                      <td className="p-3 text-text-primary font-bold">{app.company}</td>
                      <td className="p-3 text-text-secondary">{app.role}</td>
                      <td className="p-3">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={`appearance-none rounded border border-border bg-[#0D1117] px-2 py-0.5 text-[10px] font-bold text-center cursor-pointer focus:outline-none ${
                            app.status === "Offer" || app.status === "Selected"
                              ? "text-success border-success/30"
                              : app.status === "Rejected"
                              ? "text-danger border-danger/30"
                              : app.status === "Interviewing"
                              ? "text-warning border-warning/30"
                              : "text-accent border-accent/30"
                          }`}
                        >
                          {["Applied", "Interviewing", "Rejected", "Selected", "Offer"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">{app.date}</td>
                      <td className="p-3 truncate max-w-[120px]" title={app.resumeUsed}>{app.resumeUsed}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="text-text-secondary hover:text-danger cursor-pointer transition-colors p-1"
                          title="Delete App"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-text-secondary italic">No job applications logged. Click add.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ------------------------------------------
      // 13. AI CAREER ASSISTANT
      // ------------------------------------------
      case "career-assistant":
        return (
          <div className="space-y-4 flex flex-col h-[400px]">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block border-b border-border/40 pb-2">AI Career Assistant (Powered by HireSight-AI Engine)</span>
            
            <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-[#0D1117]/30 border border-border/60 rounded-xl scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-accent text-white rounded-br-none"
                        : "bg-surface border border-border text-text-primary rounded-bl-none"
                    }`}
                  >
                    <span className="text-[8px] opacity-60 block uppercase font-bold mb-1">
                      {msg.sender === "user" ? profile.login : "HireSight Engine"}
                    </span>
                    <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-surface border border-border rounded-lg rounded-bl-none p-3 text-xs text-text-secondary">
                    <span className="text-[8px] opacity-60 block uppercase font-bold mb-1">HireSight Engine</span>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                placeholder="Ask me: Am I ready for Google? Or should I learn Docker?"
                className="flex-1 rounded-xl border border-border bg-[#0D1117] px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleSendChatMessage}
                className="h-9 w-9 rounded-xl bg-accent text-white flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors"
                disabled={chatLoading}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header element */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
            <Briefcase size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary font-space-grotesk tracking-wide uppercase">AI Career Suite</h2>
            <p className="text-[10px] text-text-secondary">Powered internally by HireSight-AI Career Intelligence Engine.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="text-[10px] text-danger border border-danger/25 bg-danger/5 rounded px-2.5 py-1">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Render sub-tab content */}
      <div className="border border-border bg-surface/25 rounded-xl p-6 transition-all duration-300 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderSubTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Career Insights recommendations block */}
      <div className="rounded-xl border border-border bg-[#161B22]/50 p-5 space-y-4">
        <div className="flex items-center gap-1.5 text-accent font-bold">
          <Sparkles size={13} />
          <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">AI Career Insights & Recommendations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-border/60 bg-surface/20 space-y-1.5">
            <h4 className="font-bold text-text-primary text-[11px]">Deploy and Link Demo Demos</h4>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              <strong>WHY:</strong> Review systems found only {repositories.filter(r => r.homepage).length} project links. Recruiter parsing spiders prioritize profiles with live showcase pages.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border/60 bg-surface/20 space-y-1.5">
            <h4 className="font-bold text-text-primary text-[11px]">Enrich README Setup Manuals</h4>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              <strong>WHY:</strong> AI documentation parser identifies low README word density on several original code bases. Documenting configurations raises your ATS score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
