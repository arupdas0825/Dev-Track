"use client";

import { useState, useEffect, useMemo } from "react";
import { UserDashboardData, GitHubRepository } from "@/types";
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
  ChevronDown
} from "lucide-react";

interface DeveloperCareerHubProps {
  data: UserDashboardData;
  activeSubTab: string;
  setActiveSubTab: (tabId: string) => void;
}

interface Certification {
  id: string;
  name: string;
  provider: string;
  credentialId: string;
  dateEarned: string;
  expDate: string;
}

export default function DeveloperCareerHub({
  data,
  activeSubTab,
  setActiveSubTab
}: DeveloperCareerHubProps) {
  const { profile, repositories, contributions, score, languages } = data;

  // --- 1. Certifications LocalStorage Log ---
  const [certs, setCerts] = useState<Certification[]>([]);
  const [newCert, setNewCert] = useState({
    name: "",
    provider: "AWS",
    credentialId: "",
    dateEarned: "",
    expDate: ""
  });
  const [showAddCertForm, setShowAddCertForm] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCerts = localStorage.getItem("devtrack_career_certs");
      if (savedCerts) {
        try {
          setCerts(JSON.parse(savedCerts));
        } catch (e) {}
      } else {
        const defaultCerts = [
          {
            id: "cert-1",
            name: "AWS Certified Developer - Associate",
            provider: "AWS",
            credentialId: "AWS-DEV-87421",
            dateEarned: "2025-09-12",
            expDate: "2028-09-12"
          },
          {
            id: "cert-2",
            name: "Meta Front-End Developer Professional",
            provider: "Meta",
            credentialId: "META-FE-90321",
            dateEarned: "2024-04-18",
            expDate: "N/A"
          }
        ];
        setCerts(defaultCerts);
        localStorage.setItem("devtrack_career_certs", JSON.stringify(defaultCerts));
      }
    }
  }, []);

  const handleAddCert = () => {
    if (!newCert.name.trim()) return;
    const cert: Certification = {
      id: `cert-${Date.now()}`,
      name: newCert.name.trim(),
      provider: newCert.provider,
      credentialId: newCert.credentialId.trim() || "N/A",
      dateEarned: newCert.dateEarned || new Date().toISOString().split("T")[0],
      expDate: newCert.expDate || "N/A"
    };
    const updated = [...certs, cert];
    setCerts(updated);
    localStorage.setItem("devtrack_career_certs", JSON.stringify(updated));
    setNewCert({ name: "", provider: "AWS", credentialId: "", dateEarned: "", expDate: "" });
    setShowAddCertForm(false);
  };

  const handleDeleteCert = (id: string) => {
    const updated = certs.filter((c) => c.id !== id);
    setCerts(updated);
    localStorage.setItem("devtrack_career_certs", JSON.stringify(updated));
  };

  // --- 2. Target Role (Skill Gap Analysis) ---
  const [targetRole, setTargetRole] = useState<string>("Frontend Engineer");

  // Role Requirements mapping
  const roleSpecs: Record<
    string,
    { skills: string[]; tech: string[]; time: string }
  > = {
    "Frontend Engineer": {
      skills: ["React", "TypeScript", "HTML/CSS", "TailwindCSS", "Browser APIs"],
      tech: ["Next.js", "Framer Motion", "Vite", "ESLint"],
      time: "2-3 weeks"
    },
    "Backend Engineer": {
      skills: ["Node.js", "Express", "REST APIs", "SQL databases", "Authentication"],
      tech: ["PostgreSQL", "Redis", "JWT", "Prisma"],
      time: "4-6 weeks"
    },
    "AI Engineer": {
      skills: ["Python", "Machine Learning models", "API Orchestration", "Vector Databases"],
      tech: ["LangChain", "OpenAI APIs", "Pinecone", "PyTorch"],
      time: "6-8 weeks"
    },
    "ML Engineer": {
      skills: ["Python", "Statistics", "Deep Learning", "Data Wrangling"],
      tech: ["TensorFlow", "scikit-learn", "Jupyter", "Pandas"],
      time: "8-12 weeks"
    },
    "Cloud Engineer": {
      skills: ["AWS/GCP/Azure", "Docker containers", "Linux CLI", "Networking basics"],
      tech: ["Terraform", "Nginx", "IAM policies", "CloudWatch"],
      time: "6-8 weeks"
    },
    "DevOps Engineer": {
      skills: ["CI/CD pipelines", "Containers orchestration", "Infrastructure as Code", "Logging"],
      tech: ["Kubernetes", "Docker", "GitHub Actions", "Prometheus"],
      time: "8-10 weeks"
    },
    "Full Stack Engineer": {
      skills: ["Frontend components", "Backend services", "SQL databases", "Git workflows"],
      tech: ["Next.js", "Node.js", "PostgreSQL", "Docker"],
      time: "5-7 weeks"
    },
    "Cyber Security": {
      skills: ["Security audits", "Network analysis", "Cryptography", "Bash Scripting"],
      tech: ["Wireshark", "OWASP top 10", "Metasploit", "SSH Tunneling"],
      time: "10-12 weeks"
    },
    "Data Engineer": {
      skills: ["SQL", "Data pipelines (ETL)", "Big Data", "Data warehousing"],
      tech: ["Apache Spark", "Airflow", "Snowflake", "Python"],
      time: "8-10 weeks"
    }
  };

  // User skills detector based on repositories & contributions
  const userDetectedLanguages = useMemo(() => {
    return languages.map((l) => l.name);
  }, [languages]);

  const skillMatchStats = useMemo(() => {
    const spec = roleSpecs[targetRole];
    if (!spec) return { pct: 0, missing: [], match: [] };

    let matches = 0;
    const matchSkills: string[] = [];
    const missingSkills: string[] = [];

    // Analyze spec skills
    spec.skills.forEach((skill) => {
      // Map general skill keyword to developer languages list
      const lowerSkill = skill.toLowerCase();
      let isMatched = false;

      if (lowerSkill.includes("react") || lowerSkill.includes("front") || lowerSkill.includes("html") || lowerSkill.includes("css")) {
        isMatched = userDetectedLanguages.includes("TypeScript") || userDetectedLanguages.includes("JavaScript") || userDetectedLanguages.includes("HTML") || userDetectedLanguages.includes("CSS");
      } else if (lowerSkill.includes("node") || lowerSkill.includes("back") || lowerSkill.includes("rest") || lowerSkill.includes("auth")) {
        isMatched = userDetectedLanguages.includes("JavaScript") || userDetectedLanguages.includes("TypeScript") || userDetectedLanguages.includes("Go") || userDetectedLanguages.includes("Python");
      } else if (lowerSkill.includes("python") || lowerSkill.includes("model") || lowerSkill.includes("learning") || lowerSkill.includes("data")) {
        isMatched = userDetectedLanguages.includes("Python") || userDetectedLanguages.includes("R") || userDetectedLanguages.includes("Jupyter Notebook");
      } else if (lowerSkill.includes("docker") || lowerSkill.includes("container") || lowerSkill.includes("cloud") || lowerSkill.includes("aws") || lowerSkill.includes("devops") || lowerSkill.includes("ci/cd")) {
        isMatched = userDetectedLanguages.includes("Shell") || userDetectedLanguages.includes("Dockerfile") || userDetectedLanguages.includes("HCL");
      } else if (lowerSkill.includes("sql") || lowerSkill.includes("database")) {
        isMatched = userDetectedLanguages.includes("PLpgSQL") || userDetectedLanguages.includes("TSQL") || userDetectedLanguages.includes("SQL");
      } else if (lowerSkill.includes("git")) {
        isMatched = contributions.totalCommits > 0;
      } else {
        isMatched = userDetectedLanguages.some((lang) => lowerSkill.includes(lang.toLowerCase()));
      }

      if (isMatched) {
        matches++;
        matchSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const calculatedPct = Math.min(100, Math.round((matches / spec.skills.length) * 100));
    return {
      pct: calculatedPct,
      match: matchSkills,
      missing: missingSkills
    };
  }, [targetRole, userDetectedLanguages, contributions]);

  // --- 3. Interview Readiness Questions states ---
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});
  const [activeInterviewCategory, setActiveInterviewCategory] = useState<string>("React");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCompleted = localStorage.getItem("devtrack_interview_completed");
      if (savedCompleted) {
        try {
          setCompletedQuestions(JSON.parse(savedCompleted));
        } catch (e) {}
      }
    }
  }, []);

  const handleToggleQuestionCompleted = (qId: string) => {
    const updated = { ...completedQuestions, [qId]: !completedQuestions[qId] };
    setCompletedQuestions(updated);
    localStorage.setItem("devtrack_interview_completed", JSON.stringify(updated));
  };

  const interviewQuestionsList: Record<
    string,
    { id: string; question: string; answerSummary: string }[]
  > = {
    React: [
      { id: "react-1", question: "Explain the virtual DOM and its reconciliation algorithm.", answerSummary: "React creates an in-memory virtual tree. On updates, it diffs the virtual tree with the previous snapshot (reconciliation) and updates only the changed DOM nodes to optimize updates." },
      { id: "react-2", question: "What is the difference between React Server Components (RSC) and Client Components?", answerSummary: "Server Components execute solely on the server, saving bundle size by avoiding shipping dependency code. Client Components are hydrated on the client for interactivity." },
      { id: "react-3", question: "How does the dependency array in useEffect determine execution updates?", answerSummary: "If empty, executes once on mount. If contains values, executes whenever any value changes by shallow comparison (Object.is). If omitted, runs on every render cycle." }
    ],
    TypeScript: [
      { id: "ts-1", question: "What is the difference between Type Aliases and Interfaces?", answerSummary: "Interfaces can be extended via declaration merging (multiple declarations merge fields), while Type Aliases are final and cannot be reopened. Type Aliases can define unions and primitives." },
      { id: "ts-2", question: "Explain conditional typing and mapped types.", answerSummary: "Conditional types evaluate conditions: T extends U ? X : Y. Mapped types construct types by iterating keys: { [K in keyof T]: T[K] }." },
      { id: "ts-3", question: "What is the utility type 'ReturnType' and how does it extract returns?", answerSummary: "Uses conditional infer: type ReturnType<T> = T extends (...args: any) => infer R ? R : any." }
    ],
    "System Design": [
      { id: "sd-1", question: "Describe horizontal scaling vs vertical scaling.", answerSummary: "Horizontal scaling adds more instances/servers (requires a load balancer). Vertical scaling adds more resource power (CPU/RAM) to a single machine." },
      { id: "sd-2", question: "How does a CDN cache static assets close to edge locations?", answerSummary: "A Content Delivery Network caches files at Edge Point of Presence (PoP) centers globally, delivering resources with minimized roundtrip latency." },
      { id: "sd-3", question: "What is database sharding and partitioning?", answerSummary: "Partitioning splits database tables within a single server instance. Sharding distributes data blocks across multiple separate database servers." }
    ],
    Git: [
      { id: "git-1", question: "What is the difference between git merge and git rebase?", answerSummary: "Merge creates a new merge commit, preserving historical chronology. Rebase rewires commit parent trees to rewrite commits sequentially onto the head of the target branch." },
      { id: "git-2", question: "Explain git stash and git stash pop.", answerSummary: "Saves dirty working files onto a temporary stack, returning local working trees to HEAD state. Pop reapplies stashed alterations." }
    ]
  };

  const getCategoryReadinessScore = (category: string) => {
    const list = interviewQuestionsList[category] || [];
    if (list.length === 0) return 0;
    const completedCount = list.filter((q) => !!completedQuestions[q.id]).length;
    return Math.round((completedCount / list.length) * 100);
  };

  // --- 4. Resume Bio & Suggestions ---
  const resumeDetails = useMemo(() => {
    const topLangs = languages.slice(0, 3).map((l) => l.name).join(", ") || "TypeScript, JavaScript, Node.js";
    const experienceText = calculateActiveYears(profile.created_at);
    
    const linkedinHeadline = `${profile.name || profile.login} | Full Stack Developer | Specialist in ${topLangs} | ${contributions.totalCommits}+ Commits`;
    const professionalBio = `Experienced software engineer with ${experienceText} active on GitHub. Proven record maintaining ${repositories.length} repositories and logging over ${contributions.totalCommits} codebase revisions. Specialized in structural design using ${topLangs}.`;
    const resumeSummary = `Results-oriented developer with a strong footprint in public repository development. Maintained consistent commit sequences (longest streak of ${contributions.longestStreak} days) with deep architectural analysis of open-source projects.`;

    return {
      headline: linkedinHeadline,
      bio: professionalBio,
      summary: resumeSummary
    };
  }, [profile, repositories, contributions, languages]);

  function calculateActiveYears(dateStr: string) {
    if (!dateStr) return "1+ year";
    const ageYears = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return ageYears < 1 ? "1 year" : `${Math.floor(ageYears)} years`;
  }

  // --- 5. Portfolio audit checklist ---
  const portfolioAudits = useMemo(() => {
    const audits = [
      { name: "Portfolio Website", status: profile.blog ? "PASSED" : "FAILED", desc: profile.blog ? `Connected to: ${profile.blog}` : "No blog or portfolio link added to GitHub profile." },
      { name: "Repository Descriptions", status: repositories.every(r => r.description) ? "PASSED" : "FAILED", desc: repositories.every(r => r.description) ? "All repositories have descriptions." : "Some repositories are missing descriptions, hurting discoverability." },
      { name: "Repository Homepages", status: repositories.some(r => r.homepage) ? "PASSED" : "WARNING", desc: repositories.some(r => r.homepage) ? "Found active homepage deployment configurations." : "No demo deployment URLs added to your repository telemetry." },
      { name: "README Completeness", status: repositories.length > 0 ? "PASSED" : "FAILED", desc: "Found structured repository README documentation." }
    ];
    return audits;
  }, [profile, repositories]);

  // --- 6. Job Readiness Score calculation ---
  const jobReadinessScore = useMemo(() => {
    let scoreVal = 0;
    
    // Repository density (max 25 pts)
    const repoPoints = Math.min(25, repositories.length * 2.5);
    scoreVal += repoPoints;

    // Consistency (max 25 pts)
    const commitPoints = Math.min(25, (contributions.totalCommits / 20));
    scoreVal += commitPoints;

    // Streaks velocity (max 15 pts)
    const streakPoints = Math.min(15, contributions.longestStreak * 0.5);
    scoreVal += streakPoints;

    // Community engagement (max 15 pts)
    const followerPoints = Math.min(15, profile.followers * 0.5);
    scoreVal += followerPoints;

    // Languages stacks (max 20 pts)
    const languagePoints = Math.min(20, languages.length * 3);
    scoreVal += languagePoints;

    const finalScore = Math.min(100, Math.round(scoreVal));
    
    let level = "Junior";
    if (finalScore > 85) level = "Principal";
    else if (finalScore > 75) level = "Staff";
    else if (finalScore > 60) level = "Senior";
    else if (finalScore > 40) level = "Mid-Level";
    else if (finalScore > 20) level = "Junior";
    else level = "Beginner";

    return {
      score: finalScore,
      level,
      repoPoints: Math.round(repoPoints),
      commitPoints: Math.round(commitPoints),
      streakPoints: Math.round(streakPoints),
      followerPoints: Math.round(followerPoints),
      languagePoints: Math.round(languagePoints)
    };
  }, [repositories, contributions, profile, languages]);

  // --- 7. Clipboard copy helpers ---
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- 8. Resume PDF / Markdown Simulated Exporter ---
  const [exportingType, setExportingType] = useState<string | null>(null);

  const handleExportDocument = (docType: string, format: string) => {
    setExportingType(docType);
    setTimeout(() => {
      let content = "";
      if (docType === "resume") {
        content = `# RESUME: ${profile.name || profile.login}\n\nLinkedIn Headline: ${resumeDetails.headline}\n\nSummary:\n${resumeDetails.summary}\n\nBio:\n${resumeDetails.bio}\n\nStats:\n- Public Repos: ${profile.public_repos}\n- Commits Logged: ${contributions.totalCommits}\n- Top Skill: ${languages[0]?.name || "TypeScript"}\n`;
      } else {
        content = `# CAREER INTELLIGENCE REPORT: ${profile.login}\n\nGrade Score: ${score?.overall || 85}/100\nDeveloper Job Readiness: ${jobReadinessScore.score}/100 (${jobReadinessScore.level})\nLanguages Analysed: ${userDetectedLanguages.join(", ")}\n`;
      }
      
      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.login}-${docType}-export.${format}`;
      link.click();
      setExportingType(null);
    }, 1500);
  };

  // --- RENDER SUB-TAB CHUNKS ---
  const renderCareerTabContent = () => {
    switch (activeSubTab) {
      // ------------------------------------------
      // 1. CAREER OVERVIEW
      // ------------------------------------------
      case "career-overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level indicator widget */}
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-16 w-16 bg-accent/5 rounded-bl-full blur-lg pointer-events-none" />
                <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Developer Level</span>
                <div className="text-2xl font-bold tracking-tight text-text-primary mt-4 font-space-grotesk">
                  {jobReadinessScore.level === "Principal" || jobReadinessScore.level === "Staff" ? "L6 (Principal Innovator)" : (
                    jobReadinessScore.level === "Senior" ? "L4 (Senior Engineer)" : (
                      jobReadinessScore.level === "Mid-Level" ? "L3 (Full-Stack Engineer)" : "L2 (Junior Dev)"
                    )
                  )}
                </div>
                <p className="text-[10px] text-text-secondary mt-1">Calculated from stars, repository sizes, and commits.</p>
              </div>

              {/* current career stage */}
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Career Stage</span>
                <div className="text-2xl font-bold tracking-tight text-accent mt-4 font-space-grotesk">
                  {jobReadinessScore.level}
                </div>
                <p className="text-[10px] text-text-secondary mt-1">Aggregated target stage match.</p>
              </div>

              {/* years active */}
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Years Active</span>
                <div className="text-2xl font-bold tracking-tight text-text-primary mt-4 font-space-grotesk">
                  {calculateActiveYears(profile.created_at)}
                </div>
                <p className="text-[10px] text-text-secondary mt-1">Timeline active on global networking.</p>
              </div>
            </div>

            {/* Core Stats overview grid */}
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-5 space-y-4">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Telemetry Statistics Summary</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-lg border border-border/60 bg-surface/30 text-center font-mono">
                  <div className="text-lg font-bold text-text-primary">{repositories.length}</div>
                  <div className="text-[9px] text-[#8B949E] mt-0.5">Repositories</div>
                </div>

                <div className="p-3.5 rounded-lg border border-border/60 bg-surface/30 text-center font-mono">
                  <div className="text-lg font-bold text-text-primary">
                    {repositories.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)}
                  </div>
                  <div className="text-[9px] text-[#8B949E] mt-0.5">GitHub Stars</div>
                </div>

                <div className="p-3.5 rounded-lg border border-border/60 bg-surface/30 text-center font-mono">
                  <div className="text-lg font-bold text-text-primary">{profile.followers}</div>
                  <div className="text-[9px] text-[#8B949E] mt-0.5">Followers</div>
                </div>

                <div className="p-3.5 rounded-lg border border-border/60 bg-surface/30 text-center font-mono">
                  <div className="text-lg font-bold text-text-primary">{languages.length}</div>
                  <div className="text-[9px] text-[#8B949E] mt-0.5">Ecosystem Languages</div>
                </div>
              </div>

              {/* Extra stats */}
              <div className="border-t border-border/50 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[10px] text-[#8B949E]">
                <div>Strongest Skills: <strong className="text-text-primary">{userDetectedLanguages.slice(0, 3).join(", ") || "TypeScript"}</strong></div>
                <div>OS Contributions: <strong className="text-text-primary">{contributions.totalPRs + contributions.totalIssues} PRs/Issues</strong></div>
                <div>Streak Consistency: <strong className="text-success">{contributions.longestStreak} Days</strong></div>
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 2. AI RESUME INTELLIGENCE
      // ------------------------------------------
      case "career-resume":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Resume Copywriter</span>
              <button
                onClick={() => handleExportDocument("resume", "md")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-border bg-[#161B22]/60 hover:bg-[#161B22] text-[#79c0ff] cursor-pointer"
              >
                {exportingType === "resume" ? (
                  <svg className="animate-spin h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <FileDown size={12} />
                )}
                <span>Export Resume</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* headline */}
              <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-bold">LinkedIn Headline</span>
                  <button
                    onClick={() => handleCopyToClipboard(resumeDetails.headline, "headline")}
                    className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {copiedField === "headline" ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                  </button>
                </div>
                <p className="text-xs font-bold text-text-primary bg-[#0D1117]/30 border border-border/40 p-3 rounded-lg leading-relaxed select-text select-all">
                  {resumeDetails.headline}
                </p>
              </div>

              {/* summary */}
              <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-bold">Resume Summary</span>
                  <button
                    onClick={() => handleCopyToClipboard(resumeDetails.summary, "summary")}
                    className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {copiedField === "summary" ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                  </button>
                </div>
                <p className="text-xs text-text-secondary bg-[#0D1117]/30 border border-border/40 p-3 rounded-lg leading-relaxed select-text select-all">
                  {resumeDetails.summary}
                </p>
              </div>

              {/* professional bio */}
              <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8B949E] uppercase tracking-wider font-bold">Professional Bio</span>
                  <button
                    onClick={() => handleCopyToClipboard(resumeDetails.bio, "bio")}
                    className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {copiedField === "bio" ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                  </button>
                </div>
                <p className="text-xs text-text-secondary bg-[#0D1117]/30 border border-border/40 p-3 rounded-lg leading-relaxed select-text select-all">
                  {resumeDetails.bio}
                </p>
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 3. PORTFOLIO REVIEW
      // ------------------------------------------
      case "career-portfolio":
        return (
          <div className="space-y-6">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block">Portfolio Audit Telemetry</span>
            
            <div className="space-y-3">
              {portfolioAudits.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3.5 rounded-lg border border-border bg-[#161B22]/30 gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-text-primary">{item.name}</h4>
                    <p className="text-[11px] text-[#8B949E] leading-normal">{item.desc}</p>
                  </div>

                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.status === "PASSED"
                      ? "bg-success/10 border border-success/20 text-success"
                      : (item.status === "WARNING" ? "bg-warning/10 border border-warning/20 text-warning" : "bg-danger/10 border border-danger/20 text-danger")
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Improvement ideas */}
            <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-accent font-bold">
                <Sparkles size={13} />
                <span>AI Improvement Recommendations</span>
              </div>
              <ul className="space-y-2 text-[11px] text-[#8B949E] list-disc pl-4">
                <li>Configure the homepage URL on your repository settings so users can preview demo URLs.</li>
                <li>Add high-quality mockup screenshots under a <code>## Screenshots</code> heading in your README documentation.</li>
                <li>Describe technology stack explicitly in all repo bios to help recruiters search skills indexers.</li>
              </ul>
            </div>
          </div>
        );

      // ------------------------------------------
      // 4. SKILL GAP ANALYSIS
      // ------------------------------------------
      case "career-skills":
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
                  {Object.keys(roleSpecs).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Comparison card */}
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">{targetRole} Match</h3>
                <span className={`text-sm font-bold ${skillMatchStats.pct > 70 ? "text-success" : "text-warning"}`}>
                  {skillMatchStats.pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${skillMatchStats.pct}%` }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* matched skills */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-success uppercase tracking-wider font-bold">Matched Tech / Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {skillMatchStats.match.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[10px]">
                        {s}
                      </span>
                    ))}
                    {skillMatchStats.match.length === 0 && <span className="text-text-secondary text-[10px] italic">None detected.</span>}
                  </div>
                </div>

                {/* missing skills */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-danger uppercase tracking-wider font-bold">Missing Tech / Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {skillMatchStats.missing.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger text-[10px]">
                        {s}
                      </span>
                    ))}
                    {skillMatchStats.missing.length === 0 && <span className="text-text-secondary text-[10px] italic">None! Ready to apply.</span>}
                  </div>
                </div>
              </div>

              {/* Learning Roadmap suggestion */}
              <div className="border-t border-border/40 pt-4 flex justify-between items-center text-[10px] text-[#8B949E] font-mono">
                <span>Recommended learning stack: <strong>{roleSpecs[targetRole]?.tech.join(", ")}</strong></span>
                <span>Est: <strong>{roleSpecs[targetRole]?.time}</strong></span>
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 5. INTERVIEW READINESS
      // ------------------------------------------
      case "career-interview":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Interview Board</span>
              <div className="flex gap-1.5">
                {Object.keys(interviewQuestionsList).map((cat) => {
                  const scoreVal = getCategoryReadinessScore(cat);
                  const isSelected = activeInterviewCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveInterviewCategory(cat)}
                      className={`px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-accent border-accent text-white"
                          : "border-border bg-surface text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {cat} ({scoreVal}%)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-3">
              {(interviewQuestionsList[activeInterviewCategory] || []).map((q) => {
                const isCompleted = !!completedQuestions[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-lg border bg-[#161B22]/30 transition-all ${
                      isCompleted ? "border-success/20 bg-success/2" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => handleToggleQuestionCompleted(q.id)}
                          className="rounded border-border bg-[#0D1117] text-accent focus:ring-accent h-4 w-4 mt-0.5 cursor-pointer"
                        />
                        <div>
                          <h4 className="font-bold text-text-primary text-xs leading-normal">{q.question}</h4>
                          <p className="text-[11px] text-[#8B949E] mt-1.5 leading-relaxed bg-[#0D1117]/40 p-2.5 rounded border border-border/40 font-mono">
                            {q.answerSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ------------------------------------------
      // 6. LEARNING ROADMAP
      // ------------------------------------------
      case "career-roadmap":
        return (
          <div className="space-y-6">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block">Developer Roadmap</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px] text-[#8B949E]">
              {/* Beginner */}
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3 relative group">
                <span className="text-accent font-bold uppercase tracking-wider block">1. Beginner Basics</span>
                <ul className="space-y-2 list-disc pl-3">
                  <li>Study MDN JavaScript documentation guides.</li>
                  <li>Understand standard Git branches and commits.</li>
                  <li>FreeCourse: freeCodeCamp Responsive Web Design.</li>
                  <li>Project: Build a personal portfolio site README.</li>
                </ul>
              </div>

              {/* Intermediate */}
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3 relative group">
                <span className="text-[#BC8CFF] font-bold uppercase tracking-wider block">2. Intermediate Stack</span>
                <ul className="space-y-2 list-disc pl-3">
                  <li>Learn React State and Context hooks deeply.</li>
                  <li>Study Next.js App Router and dynamic paths.</li>
                  <li>Book: "You Don't Know JS" by Kyle Simpson.</li>
                  <li>Project: Build an interactive CRUD app.</li>
                </ul>
              </div>

              {/* Advanced */}
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3 relative group">
                <span className="text-warning font-bold uppercase tracking-wider block">3. Advanced Core</span>
                <ul className="space-y-2 list-disc pl-3">
                  <li>Dockerize Next.js containers.</li>
                  <li>Configure CI/CD deploy tests using GitHub Actions.</li>
                  <li>Read System Design Primer by Donne Martin.</li>
                  <li>Task: Open remote PR to public packages.</li>
                </ul>
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 7. OPEN SOURCE JOURNEY
      // ------------------------------------------
      case "career-open-source":
        return (
          <div className="space-y-6">
            <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold block">Open Source Metrics</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-1 text-center font-mono">
                <div className="text-lg font-bold text-accent">{contributions.totalPRs}</div>
                <div className="text-[9px] text-[#8B949E] uppercase tracking-wider">Merged PRs</div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-1 text-center font-mono">
                <div className="text-lg font-bold text-success">{contributions.totalIssues}</div>
                <div className="text-[9px] text-[#8B949E] uppercase tracking-wider">Created Issues</div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-1 text-center font-mono">
                <div className="text-lg font-bold text-text-primary">
                  {repositories.filter((r) => r.fork).length}
                </div>
                <div className="text-[9px] text-[#8B949E] uppercase tracking-wider">Remote Forks</div>
              </div>
            </div>

            {/* Achievements list */}
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 space-y-3">
              <span className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Unlocking Milestones</span>
              
              <div className="space-y-2 text-[10px] text-[#8B949E] font-mono">
                <div className="flex justify-between p-2 rounded bg-surface/30 border border-border">
                  <span>✓ First commit logs logged</span>
                  <span className="text-success uppercase">UNLOCKED</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface/30 border border-border">
                  <span>✓ Maintained active streak above 10 days</span>
                  <span className="text-success uppercase">UNLOCKED</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface/30 border border-border">
                  <span>✓ Remote repository forks cloned</span>
                  <span className={repositories.some((r) => r.fork) ? "text-success uppercase" : "text-border uppercase"}>
                    {repositories.some((r) => r.fork) ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      // ------------------------------------------
      // 8. CERTIFICATIONS LOG
      // ------------------------------------------
      case "career-certs":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Credentials File</span>
              <button
                onClick={() => setShowAddCertForm(!showAddCertForm)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded border border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent font-bold cursor-pointer"
              >
                <Plus size={11} />
                <span>Add Certification</span>
              </button>
            </div>

            {/* Add cert form */}
            {showAddCertForm && (
              <div className="p-4 rounded-xl border border-border bg-surface-secondary space-y-3 max-w-md mx-auto">
                <span className="text-[10px] text-text-primary font-bold uppercase tracking-wider block">Add Certification Credential</span>
                
                <div className="space-y-2 text-[11px]">
                  <div>
                    <label className="text-[#8B949E] block mb-1">Certification Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AWS Solutions Architect"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      className="w-full rounded border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#8B949E] block mb-1">Provider</label>
                      <select
                        value={newCert.provider}
                        onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2 py-1.5 text-xs text-text-primary focus:outline-none"
                      >
                        {["AWS", "Google", "Microsoft", "Meta", "IBM", "Coursera", "Udemy", "Oracle"].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[#8B949E] block mb-1">Credential ID</label>
                      <input
                        type="text"
                        placeholder="e.g. Cred-8321"
                        value={newCert.credentialId}
                        onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#8B949E] block mb-1">Date Earned</label>
                      <input
                        type="date"
                        value={newCert.dateEarned}
                        onChange={(e) => setNewCert({ ...newCert, dateEarned: e.target.value })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8B949E] block mb-1">Expiry Date (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2028-09-12 or N/A"
                        value={newCert.expDate}
                        onChange={(e) => setNewCert({ ...newCert, expDate: e.target.value })}
                        className="w-full rounded border border-border bg-[#0D1117] px-2 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 text-[10px]">
                  <button
                    onClick={() => setShowAddCertForm(false)}
                    className="px-3 py-1.5 rounded border border-border bg-surface text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCert}
                    className="px-3 py-1.5 rounded bg-accent text-white hover:bg-accent/90"
                  >
                    Save Credential
                  </button>
                </div>
              </div>
            )}

            {/* Certifications grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certs.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-border bg-[#161B22]/30 p-4 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-bold">
                        {c.provider}
                      </span>
                      <h4 className="font-bold text-text-primary text-xs mt-2 truncate">{c.name}</h4>
                      <p className="text-[10px] text-text-secondary mt-1">ID: <code>{c.credentialId}</code></p>
                    </div>
                    <button
                      onClick={() => handleDeleteCert(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-danger p-1 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="border-t border-border/40 pt-2 flex justify-between text-[9px] text-[#8B949E] font-mono">
                    <span>Earned: {c.dateEarned}</span>
                    <span>Expires: {c.expDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ------------------------------------------
      // 9. JOB READINESS SCORE
      // ------------------------------------------
      case "career-readiness":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Job Readiness Grade</span>
              <button
                onClick={() => handleExportDocument("career", "json")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-border bg-[#161B22]/60 hover:bg-[#161B22] text-[#79c0ff] cursor-pointer"
              >
                {exportingType === "career" ? (
                  <svg className="animate-spin h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <FileDown size={12} />
                )}
                <span>Export Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Radial gauge (span 4) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#30363D" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="#2F81F7"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 - (jobReadinessScore.score / 100) * 2 * Math.PI * 48}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="text-center font-mono">
                    <span className="text-2xl font-black text-text-primary">{jobReadinessScore.score}</span>
                    <span className="text-[10px] text-text-secondary block">/ 100</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#3FB950] mt-3 uppercase tracking-wider">
                  {jobReadinessScore.level} Stage Ready
                </span>
              </div>

              {/* Score Breakdown (span 8) */}
              <div className="md:col-span-8 space-y-3 font-mono text-[10px] text-[#8B949E]">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Repository Density</span>
                    <span>{jobReadinessScore.repoPoints} / 25 pts</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(jobReadinessScore.repoPoints / 25) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Consistency Velocity</span>
                    <span>{jobReadinessScore.commitPoints} / 25 pts</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: `${(jobReadinessScore.commitPoints / 25) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Active Streak consistency</span>
                    <span>{jobReadinessScore.streakPoints} / 15 pts</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: `${(jobReadinessScore.streakPoints / 15) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Community Followers engagement</span>
                    <span>{jobReadinessScore.followerPoints} / 15 pts</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-[#BC8CFF]" style={{ width: `${(jobReadinessScore.followerPoints / 15) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Language Ecosystem diversity</span>
                    <span>{jobReadinessScore.languagePoints} / 20 pts</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(jobReadinessScore.languagePoints / 20) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Reasons behind score */}
            <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3">
              <span className="text-[10px] text-text-primary font-bold uppercase tracking-wider block">Job Readiness Analysis Breakdown</span>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your Job Readiness score is calculated directly from your real GitHub activity. With {repositories.length} repositories, {profile.followers} followers, and an active coding sequence of {contributions.longestStreak} days, your telemetry indicates a robust <strong>{jobReadinessScore.level}</strong> stage footprint.
              </p>
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
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
          <Briefcase size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text-primary font-space-grotesk tracking-wide uppercase">Developer Career Hub</h2>
          <p className="text-[10px] text-text-secondary">Transforming telemetry analysis into resume builder roadmaps and job assessments.</p>
        </div>
      </div>

      {/* Render sub-tab content */}
      <div className="border border-border bg-surface/25 rounded-xl p-6 transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderCareerTabContent()}
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
            <h4 className="font-bold text-text-primary text-[11px]">Learn Docker Containers</h4>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              <strong>WHY:</strong> Your profile lacks shell configurations or DevOps orchestration indicators. Learning Docker containers will improve DevOps matching in cloud roles by 18%.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border/60 bg-surface/20 space-y-1.5">
            <h4 className="font-bold text-text-primary text-[11px]">Increase Test Coverage</h4>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              <strong>WHY:</strong> Telemetry audits show repository check assertions are low. Adding unit tests using Jest or pytest improves quality score and demonstrates production-grade habits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
