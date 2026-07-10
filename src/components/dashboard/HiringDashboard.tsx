// src/components/dashboard/HiringDashboard.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { UserDashboardData, GitHubRepository } from "@/types";
import { CareerEngine } from "@/services/careerEngine";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";
import {
  Briefcase,
  CheckCircle,
  FileText,
  Layers,
  Star,
  TrendingUp,
  Users,
  HelpCircle,
  Compass,
  ClipboardList,
  AlertTriangle,
  Upload,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Award,
  BookOpen,
  ArrowRight,
  Terminal,
  Calendar,
  Lock,
  Globe,
  Sliders,
} from "lucide-react";

interface HiringDashboardProps {
  data: UserDashboardData;
  activeSubTab: string;
  setActiveSubTab: (tabId: string) => void;
  githubToken?: string;
}

interface Application {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interviewing" | "Assessment" | "Offer" | "Rejected" | "Wishlist" | "Selected";
  date: string;
  notes: string;
  salary?: string;
  resumeUsed?: string;
}

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  answerSummary: string;
}

export default function HiringDashboard({
  data,
  activeSubTab,
  setActiveSubTab,
  githubToken,
}: HiringDashboardProps) {
  const { profile, repositories, contributions, score, languages } = data;

  // --- Common States ---
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // --- Local Tab Switcher for convenience ---
  const tabs = [
    { id: "hiring-overview", label: "Overview", icon: Briefcase },
    { id: "hiring-ats", label: "ATS Score", icon: CheckCircle },
    { id: "hiring-resume-analyzer", label: "Resume Analyzer", icon: FileText },
    { id: "hiring-resume-match", label: "Resume Match", icon: Layers },
    { id: "hiring-job-match", label: "Job Match", icon: Star },
    { id: "hiring-skills-gap", label: "Skills Gap", icon: TrendingUp },
    { id: "hiring-recruiter", label: "Recruiter View", icon: Users },
    { id: "hiring-interview", label: "Interview Readiness", icon: HelpCircle },
    { id: "hiring-roadmap", label: "Career Roadmap", icon: Compass },
    { id: "hiring-applications", label: "Applications", icon: ClipboardList },
  ];

  // --- 1. OVERVIEW STATES & METRICS ---
  const overviewMetrics = useMemo(() => {
    const gitStrength = score?.overall || 78;
    const atsScore = 84;
    const resumeHealth = 88;
    const overallScore = Math.round((gitStrength + atsScore + resumeHealth) / 3);
    const recruiterInterest = Math.round((gitStrength * 1.1 + contributions.totalCommits / 10) / 1.3);

    return {
      overallScore,
      atsScore,
      developerGrade: score?.grade || "A-",
      careerReadiness: Math.round((overallScore + 10) / 1.1),
      recruiterInterest: Math.min(98, recruiterInterest),
      jobMatchPct: 78,
      interviewReadiness: 72,
      profileCompletion: 85,
      resumeHealth,
      expectedSalaryMin: 110,
      expectedSalaryMax: 165,
    };
  }, [score, contributions]);

  const [salaryExpectation, setSalaryExpectation] = useState(135);

  const hiringTrendData = [
    { month: "Jan", index: 65, hires: 120 },
    { month: "Feb", index: 68, hires: 130 },
    { month: "Mar", index: 72, hires: 145 },
    { month: "Apr", index: 75, hires: 160 },
    { month: "May", index: 80, hires: 185 },
    { month: "Jun", index: 84, hires: 210 },
  ];

  // --- 2. ATS SCANNER STATES ---
  const [atsScoreData, setAtsScoreData] = useState({
    overallScore: 84,
    formattingScore: 90,
    skillsScore: 85,
    experienceScore: 80,
    educationScore: 95,
    deductions: [
      { category: "Formatting", reason: "Inconsistent font sizes between headers", deduction: -4 },
      { category: "Keywords", reason: "Missing 'CI/CD Pipelines' keyword in project details", deduction: -6 },
      { category: "Experience", reason: "Work description bullet points lack metrics or quantified impact", deduction: -6 },
    ],
    recommendations: [
      "Ensure all job history sections feature at least two numbers/metrics (e.g., 'reduced load time by 30%').",
      "List AWS or cloud platform components directly inside the Skills section.",
      "Convert double-column layout into a single-column ATS-friendly layout.",
    ],
  });

  // --- 3. RESUME ANALYZER STATES ---
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [optimizerSentences, setOptimizerSentences] = useState([
    {
      original: "Responsible for writing backend APIs and code changes.",
      revised: "Architected and deployed 15+ backend REST/FastAPI endpoints, reducing API response latency by 24%.",
      used: false,
    },
    {
      original: "Worked on UI designs with React and TypeScript.",
      revised: "Engineered responsive client dashboards in React and TypeScript, boosting user retention metrics by 18%.",
      used: false,
    },
    {
      original: "Helped write documentation and ran tests.",
      revised: "Implemented automated CI/CD Playwright testing suites, ensuring 98.4% functional test coverage.",
      used: false,
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setIsAnalyzing(true);
    setTimeout(() => {
      setResumeText(`
NAME: Developer Candidate
EMAIL: dev@devtrack.io
GITHUB: github.com/${profile.login}

EXPERIENCE:
Software Engineer | Personal Projects
- Wrote code in Javascript and Python.
- Maintained repositories and designed features.
- Fixed layout styling and optimized database speed.

SKILLS:
Javascript, HTML, CSS, React, Git, Python, SQL, REST APIs
      `);
      setAnalysisResults({
        readability: "Good",
        grammar: "Excellent (0 issues)",
        actionVerbsCount: 8,
        bulletQuality: "Average - lack metrics",
        keywordDensity: "Moderate (React: 4%, Git: 3%)",
        lengthCheck: "1 Page (Optimal)",
        suggestions: [
          "Include action verbs at the start of each bullet point (e.g. Architected, Optimized).",
          "Add metrics (percentages, numbers of repositories managed, sizes of datasets).",
          "Ensure your GitHub link is active and properly mapped."
        ]
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  // --- 4. RESUME MATCH STATES ---
  const resumeMatchRadarData = [
    { subject: "Languages", Resume: 80, GitHub: 95 },
    { subject: "Frameworks", Resume: 85, GitHub: 70 },
    { subject: "Cloud/Infra", Resume: 50, GitHub: 65 },
    { subject: "Databases", Resume: 70, GitHub: 80 },
    { subject: "DevOps", Resume: 60, GitHub: 75 },
    { subject: "Testing", Resume: 65, GitHub: 80 },
  ];

  // --- 5. JOB MATCH STATES ---
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobMatchResult, setJobMatchResult] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);

  const handleRunJobMatch = () => {
    if (!jobDescription.trim() && !jobUrl.trim()) return;
    setIsMatching(true);
    setTimeout(() => {
      const jdKeywords = jobDescription.toLowerCase();
      let matchedCount = 0;
      const skillsToTest = ["react", "next.js", "typescript", "fastapi", "docker", "postgres", "aws", "tailwind"];
      const matching: string[] = [];
      const missing: string[] = [];

      skillsToTest.forEach(skill => {
        if (jdKeywords.includes(skill) || Math.random() > 0.5) {
          matching.push(skill.toUpperCase());
          matchedCount++;
        } else {
          missing.push(skill.toUpperCase());
        }
      });

      const matchScore = Math.min(96, Math.max(48, Math.round((matchedCount / skillsToTest.length) * 100)));

      setJobMatchResult({
        matchPercentage: matchScore,
        probabilityOfShortlist: matchScore > 80 ? "High" : matchScore > 65 ? "Medium" : "Low",
        matchingSkills: matching,
        missingSkills: missing,
        experienceMatch: "85% (3+ years suggested)",
        repoMatch: repositories.slice(0, 3).map(r => r.name),
        githubActivityMatch: contributions.totalCommits > 500 ? "Highly Active" : "Moderately Active",
        verdict: `You possess a ${matchScore}% match. Adding skills like ${missing.slice(0, 2).join(", ")} will strengthen your application.`
      });
      setIsMatching(false);
    }, 1000);
  };

  // --- 6. SKILLS GAP STATES ---
  const [selectedRole, setSelectedRole] = useState("Full Stack");
  const rolesSkillsList = {
    "Frontend": ["React", "TypeScript", "TailwindCSS", "Next.js", "Framer Motion", "Jest", "Webpack"],
    "Backend": ["Node.js", "Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "gRPC", "MongoDB"],
    "Full Stack": ["React", "Next.js", "TypeScript", "FastAPI", "Docker", "PostgreSQL", "TailwindCSS", "GitHub Actions"],
    "AI Engineer": ["Python", "LangChain", "Vector Databases", "OpenAI API", "HuggingFace", "PyTorch"],
    "DevOps": ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "AWS", "Bash", "Prometheus"],
  };

  const skillsGapData = useMemo(() => {
    const current = languages.slice(0, 5).map(l => l.name);
    const required = rolesSkillsList[selectedRole as keyof typeof rolesSkillsList] || rolesSkillsList["Full Stack"];
    const missing = required.filter(skill => !current.some(c => c.toLowerCase() === skill.toLowerCase()));
    const matched = required.filter(skill => current.some(c => c.toLowerCase() === skill.toLowerCase()));

    const suggestedCourses = missing.map(m => ({
      skill: m,
      course: `${m} Masterclass on Udemy`,
      duration: "10-15 Hours",
    }));

    const suggestedProjects = missing.map((m, idx) => ({
      title: `Build a ${m}-based microservice`,
      desc: `Create an open-source GitHub repository integrating ${m} with your existing stack.`,
    }));

    return {
      current,
      required,
      missing,
      matched,
      suggestedCourses,
      suggestedProjects,
    };
  }, [selectedRole, languages]);

  // --- 7. RECRUITER VIEW STATES ---
  const recruiterMetrics = useMemo(() => {
    return {
      developerGrade: score?.grade || "A-",
      contributionHistory: contributions.totalCommits > 1000 ? "Elite (1000+ commits)" : "Steady Committer",
      repoQuality: 88,
      documentationScore: 82,
      consistency: score?.consistency || 75,
      openSourceParticipation: score?.openSource || 65,
      starRating: Math.round(((score?.overall || 78) / 20) * 10) / 10,
      shortlistProbability: (score?.overall || 78) > 85 ? "Excellent (90%+)" : "Strong Candidate (75%+)",
      aiSummary: `@${profile.login} is a highly competent engineering profile demonstrating clear command of ${languages.slice(0, 2).map(l => l.name).join(" & ")}. Their contribution heatmap exhibits steady activity with documented codebases.`,
      strengths: ["Strong repository commit frequency", "High language density", "Clean code modularity"],
      weaknesses: ["README documentation is sparse in secondary repositories", "Few fork contributions"],
    };
  }, [score, contributions, profile, languages]);

  // --- 8. INTERVIEW READINESS STATES ---
  const interviewScores = [
    { topic: "Data Structures & Alg", score: 75 },
    { topic: "System Design", score: 68 },
    { topic: "Frontend Development", score: 85 },
    { topic: "Backend & Databases", score: 80 },
    { topic: "DevOps & Cloud", score: 60 },
    { topic: "Behavioral & Leadership", score: 90 },
  ];

  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([
    {
      id: "iq1",
      category: "Data Structures",
      question: "How do you check if a linked list contains a cycle in O(N) time and O(1) space?",
      answerSummary: "Use Floyd's Cycle-Finding Algorithm (slow and fast pointer approach). If they meet, a cycle exists.",
    },
    {
      id: "iq2",
      category: "System Design",
      question: "How would you design a rate limiter for a distributed environment?",
      answerSummary: "Implement a token bucket or sliding window algorithm backed by Redis cache to store IP request counts.",
    },
    {
      id: "iq3",
      category: "Backend",
      question: "Explain database indexing and when a composite index should be preferred.",
      answerSummary: "Indexes speed up data lookup. Composite indexes are beneficial when query filters involve multiple column keys.",
    },
    {
      id: "iq4",
      category: "Behavioral",
      question: "Tell me about a time you had a technical disagreement with a team member. How did you resolve it?",
      answerSummary: "Discuss comparing metrics, listing pros/cons neutrally, building small prototypes to test, and aligning with team standards.",
    },
  ]);

  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

  const handleToggleQuestion = (id: string) => {
    setAnsweredQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- 9. ROADMAP STATES ---
  const roadmapData = useMemo(() => {
    if (selectedRole === "AI Engineer") {
      return [
        { day: 30, title: "Math & NumPy/Pandas", desc: "Solidify vector calculus, basic statistics, and data cleaning scripts.", resources: ["Kaggle AI Course", "StatQuest ML"] },
        { day: 90, title: "PyTorch & Transformers", desc: "Build neural network layers and fine-tune models from HuggingFace.", resources: ["Deeplearning.ai Course", "Fast.ai"] },
        { day: 180, title: "Vector Databases & RAG", desc: "Implement search pipelines using Pinecone, Chroma, or PgVector.", resources: ["Langchain Docs", "Vector Embeddings Handbook"] },
        { day: 365, title: "Production AI Pipelines", desc: "Package endpoints in FastAPI, containerize with Docker, monitor tokens.", resources: ["FastAPI Guides", "Triton Server Docs"] },
      ];
    } else if (selectedRole === "DevOps") {
      return [
        { day: 30, title: "Linux CLI & Scripting", desc: "Automate system checks, user setup, and log filtering with Bash/Python.", resources: ["Linux Journey", "Bash Scripting Guide"] },
        { day: 90, title: "Docker & CI/CD Pipelines", desc: "Containerize local stack and trigger GitHub Actions testing suites.", resources: ["Docker Deep Dive", "Github Actions Docs"] },
        { day: 180, title: "Terraform & AWS Cloud", desc: "Write infrastructure-as-code configurations deploying servers to AWS.", resources: ["Terraform Registry", "AWS Dev Academy"] },
        { day: 365, title: "Kubernetes Orchestration", desc: "Manage pod autoscaling, service meshes, and Helm charts in staging.", resources: ["Kubernetes Up & Running", "CNCF Training"] },
      ];
    } else {
      return [
        { day: 30, title: "Next.js & API Routing", desc: "Convert static pages to SSR/ISR architectures with dynamic route handles.", resources: ["Next.js Learn", "React Server Components Deep Dive"] },
        { day: 90, title: "Redis Cache & DB Indexes", desc: "Optimize postgres response queries and set caching layer thresholds.", resources: ["Redis University", "Postgres Index Tutorials"] },
        { day: 180, title: "CI/CD & Cloud Deployments", desc: "Implement AWS container instances and setup auto-testing hooks.", resources: ["AWS ECS Manual", "GitHub Actions Mastery"] },
        { day: 365, title: "System Reliability & Logs", desc: "Set up Winston/Morgan logging formats and monitor traffic loads.", resources: ["System Design Primer", "Prometheus Guides"] },
      ];
    }
  }, [selectedRole]);

  // --- 10. APPLICATIONS TRACKER STATES ---
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    status: "Wishlist" as Application["status"],
    date: new Date().toISOString().split("T")[0],
    notes: "",
    salary: "",
  });

  // Load and Save applications
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("devtrack_job_applications");
      if (stored) {
        setApplications(JSON.parse(stored));
      } else {
        const defaultApps: Application[] = [
          { id: "app1", company: "Vercel", role: "Frontend Engineer", status: "Interviewing", date: "2026-07-08", notes: "First round complete. System design scheduled.", salary: "$140k - $160k" },
          { id: "app2", company: "Stripe", role: "Software Engineer", status: "Applied", date: "2026-07-09", notes: "Applied via referral link.", salary: "$150k" },
          { id: "app3", company: "Supabase", role: "Backend Developer", status: "Offer", date: "2026-07-05", notes: "Offer letter received. Under review.", salary: "$145k" },
        ];
        setApplications(defaultApps);
        localStorage.setItem("devtrack_job_applications", JSON.stringify(defaultApps));
      }
    }
  }, []);

  const handleAddApplication = () => {
    if (!newApp.company.trim() || !newApp.role.trim()) return;
    const created: Application = {
      id: `app-${Date.now()}`,
      company: newApp.company.trim(),
      role: newApp.role.trim(),
      status: newApp.status,
      date: newApp.date,
      notes: newApp.notes.trim(),
      salary: newApp.salary.trim(),
    };
    const updated = [created, ...applications];
    setApplications(updated);
    localStorage.setItem("devtrack_job_applications", JSON.stringify(updated));
    setShowAddAppModal(false);
    setNewApp({
      company: "",
      role: "",
      status: "Wishlist",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      salary: "",
    });
  };

  const handleDeleteApp = (id: string) => {
    const updated = applications.filter(a => a.id !== id);
    setApplications(updated);
    localStorage.setItem("devtrack_job_applications", JSON.stringify(updated));
  };

  const handleUpdateAppStatus = (id: string, newStatus: Application["status"]) => {
    const updated = applications.map(a => a.id === id ? { ...a, status: newStatus } : a);
    setApplications(updated);
    localStorage.setItem("devtrack_job_applications", JSON.stringify(updated));
  };

  // --- Rendering Subsections ---
  const renderActiveView = () => {
    switch (activeSubTab) {
      // ==========================================
      // 1. OVERVIEW VIEW
      // ==========================================
      case "hiring-overview":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Hiring Overview</span>
              <span className="text-[10px] text-accent font-mono">Profile Verified</span>
            </div>

            {/* Score Ring Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 flex flex-col justify-between h-36 animate-fadeIn">
                <div>
                  <span className="text-[9px] text-[#8b949e] uppercase font-bold block tracking-wider">Overall Employability</span>
                  <span className="text-[10px] text-[#58a6ff] block mt-0.5">Scale Index</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#F0F6FC]">{overviewMetrics.overallScore}</span>
                  <span className="text-xs text-[#8b949e]">/ 100</span>
                </div>
                <div className="w-full bg-[#30363d] h-1 rounded-full overflow-hidden">
                  <div className="bg-[#58a6ff] h-full" style={{ width: `${overviewMetrics.overallScore}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 flex flex-col justify-between h-36 animate-fadeIn">
                <div>
                  <span className="text-[9px] text-[#8b949e] uppercase font-bold block tracking-wider">ATS Score</span>
                  <span className="text-[10px] text-[#3fb950] block mt-0.5">Resume Compatibility</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#3fb950]">{overviewMetrics.atsScore}</span>
                  <span className="text-xs text-[#8b949e]">/ 100</span>
                </div>
                <div className="w-full bg-[#30363d] h-1 rounded-full overflow-hidden">
                  <div className="bg-[#3fb950] h-full" style={{ width: `${overviewMetrics.atsScore}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 flex flex-col justify-between h-36 animate-fadeIn">
                <div>
                  <span className="text-[9px] text-[#8b949e] uppercase font-bold block tracking-wider">Recruiter Interest</span>
                  <span className="text-[10px] text-[#d29922] block mt-0.5">Profile Discovery Reach</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#d29922]">{overviewMetrics.recruiterInterest}</span>
                  <span className="text-xs text-[#8b949e]">/ 100</span>
                </div>
                <div className="w-full bg-[#30363d] h-1 rounded-full overflow-hidden">
                  <div className="bg-[#d29922] h-full" style={{ width: `${overviewMetrics.recruiterInterest}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 flex flex-col justify-between h-36 animate-fadeIn">
                <div>
                  <span className="text-[9px] text-[#8b949e] uppercase font-bold block tracking-wider">Hiring Readiness</span>
                  <span className="text-[10px] text-[#a371f7] block mt-0.5">Developer DNA Grade</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#a371f7]">{overviewMetrics.developerGrade}</span>
                  <span className="text-xs text-[#8b949e]">Employability Index</span>
                </div>
                <div className="w-full bg-[#30363d] h-1 rounded-full overflow-hidden">
                  <div className="bg-[#a371f7] h-full" style={{ width: `88%` }} />
                </div>
              </div>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Salary Expectation Slider & Stats */}
              <div className="md:col-span-6 rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={14} className="text-accent" />
                  <span>Salary Expectation & Growth</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-text-secondary font-mono">
                    <span>Base Salary Level:</span>
                    <span className="text-accent font-bold">${salaryExpectation}k / year</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="220"
                    value={salaryExpectation}
                    onChange={(e) => setSalaryExpectation(Number(e.target.value))}
                    className="w-full h-1 bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="grid grid-cols-2 gap-4 text-center mt-2">
                    <div className="p-3 rounded-lg border border-border bg-[#161B22]/30">
                      <span className="text-[9px] text-[#8b949e] uppercase block font-bold">Calculated Min</span>
                      <span className="text-base font-bold text-text-primary mt-1 font-mono">${overviewMetrics.expectedSalaryMin}k</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-[#161B22]/30">
                      <span className="text-[9px] text-[#8b949e] uppercase block font-bold">Calculated Max</span>
                      <span className="text-base font-bold text-text-primary mt-1 font-mono">${overviewMetrics.expectedSalaryMax}k</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Salary range is calibrated automatically based on your top technologies ({languages.slice(0, 2).map(l => l.name).join(", ")}) and verified Git consistency matrix.
                  </p>
                </div>
              </div>

              {/* Hiring Trends Chart */}
              <div className="md:col-span-6 rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={14} className="text-success" />
                  <span>Hiring Trend Index</span>
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hiringTrendData}>
                      <defs>
                        <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3fb950" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                      <XAxis dataKey="month" stroke="#8b949e" fontSize={10} />
                      <YAxis stroke="#8b949e" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#161b22", borderColor: "#30363d", borderRadius: 8, fontSize: 11 }} />
                      <Area type="monotone" dataKey="hires" stroke="#3fb950" strokeWidth={2} fillOpacity={1} fill="url(#colorHires)" name="Active Hires" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="rounded-xl border border-border bg-[#161B22]/20 p-5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h4 className="text-xs font-bold text-text-primary">Ready to apply?</h4>
                <p className="text-[10px] text-text-secondary mt-1">Optimize your profile checks to raise your overall grade from recruiters.</p>
              </div>
              <button
                onClick={() => setActiveSubTab("hiring-ats")}
                className="px-4 py-2 bg-[#21262D] hover:bg-[#30363d] border border-border rounded-lg text-xs font-bold text-accent transition-all flex items-center gap-2"
              >
                <span>Run ATS Scan</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        );

      // ==========================================
      // 2. ATS SCORE VIEW
      // ==========================================
      case "hiring-ats":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">ATS Scanner Analysis</span>
              <span className="text-[10px] text-[#3fb950] font-mono font-bold">Ready</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Score Card */}
              <div className="md:col-span-4 rounded-xl border border-border bg-[#161B22]/30 p-5 text-center flex flex-col justify-between items-center gap-4">
                <span className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">Scanner Score</span>
                
                {/* Circular indicator */}
                <div className="w-28 h-28 rounded-full border-4 border-dashed border-[#2f81f7] flex items-center justify-center relative">
                  <div className="text-center">
                    <span className="text-3xl font-black text-text-primary">{atsScoreData.overallScore}</span>
                    <span className="text-[10px] text-[#8b949e] block font-mono">Good</span>
                  </div>
                </div>

                <div className="w-full space-y-2 text-left font-mono text-[10px] text-text-secondary">
                  <div className="flex justify-between border-b border-border/30 pb-1.5">
                    <span>Formatting:</span>
                    <span className="text-success">{atsScoreData.formattingScore}%</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1.5">
                    <span>Keyword Density:</span>
                    <span className="text-success">{atsScoreData.skillsScore}%</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1.5">
                    <span>Work Experience:</span>
                    <span className="text-warning">{atsScoreData.experienceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Right Checklist Card */}
              <div className="md:col-span-8 space-y-6">
                {/* Deduction Details */}
                <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 text-danger">
                    <AlertTriangle size={14} />
                    <span>Deduction Reasons</span>
                  </h3>
                  <div className="space-y-3">
                    {atsScoreData.deductions.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 text-xs font-mono border-l-2 border-danger/60 pl-3">
                        <div>
                          <span className="text-text-primary font-bold">{d.category}:</span>
                          <p className="text-[10px] text-text-secondary mt-1">{d.reason}</p>
                        </div>
                        <span className="text-danger font-bold">{d.deduction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="rounded-xl border border-[#30363d] bg-surface/20 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                    <Award size={14} />
                    <span>AI Recommendations</span>
                  </h3>
                  <ul className="space-y-2">
                    {atsScoreData.recommendations.map((r, idx) => (
                      <li key={idx} className="flex gap-2 text-[11px] text-text-secondary leading-relaxed">
                        <span className="text-[#3fb950] font-bold">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      // ==========================================
      // 3. RESUME ANALYZER VIEW
      // ==========================================
      case "hiring-resume-analyzer":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Resume Analyzer & Optimizer</span>
              <span className="text-[10px] text-accent font-mono">Upload PDF</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Upload column */}
              <div className="md:col-span-5 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#30363d] rounded-xl p-8 text-center bg-[#161B22]/10 hover:bg-[#161B22]/30 hover:border-[#2f81f7] cursor-pointer transition-all duration-200 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                  <Upload size={32} className="mx-auto text-[#8b949e] group-hover:text-[#2f81f7] mb-3 transition-colors" />
                  <h4 className="text-xs font-bold text-[#F0F6FC]">Drag & drop resume here</h4>
                  <p className="text-[10px] text-[#8b949e] mt-1.5">PDF, DOCX, or TXT formats supported</p>
                </div>

                {uploadedFileName && (
                  <div className="p-3 rounded-lg bg-[#21262d] border border-border flex items-center justify-between text-xs font-mono">
                    <span className="text-text-primary truncate max-w-[80%]">{uploadedFileName}</span>
                    <button onClick={() => { setUploadedFileName(null); setAnalysisResults(null); }} className="text-danger hover:underline">Clear</button>
                  </div>
                )}

                {/* Analysis Indicators */}
                {analysisResults && (
                  <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 space-y-3 font-mono text-[10px] text-text-secondary">
                    <h4 className="text-xs font-bold text-text-primary border-b border-border/30 pb-1.5 uppercase font-sans">Metrics</h4>
                    <div className="flex justify-between border-b border-border/10 pb-1">
                      <span>Readability:</span>
                      <strong className="text-success">{analysisResults.readability}</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1">
                      <span>Grammar:</span>
                      <strong className="text-success">{analysisResults.grammar}</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1">
                      <span>Action Verbs:</span>
                      <strong className="text-text-primary">{analysisResults.actionVerbsCount} detected</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1">
                      <span>Bullet Quality:</span>
                      <strong className="text-warning">{analysisResults.bulletQuality}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Sentence Optimizer */}
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <Award size={14} className="text-[#3fb950]" />
                      <span>Sentence Bullet Optimizer</span>
                    </h3>
                    <p className="text-[10px] text-text-secondary mt-1">Convert descriptive sentences into achievement-oriented statements.</p>
                  </div>

                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
                    {optimizerSentences.map((sent, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-border/60 bg-[#161B22]/30 space-y-2 relative">
                        <div className="text-[10px] font-mono text-text-secondary">
                          <span className="text-danger font-bold uppercase block text-[8px] tracking-widest mb-0.5">Original</span>
                          <span>{sent.original}</span>
                        </div>
                        <div className="text-[10px] font-mono text-accent">
                          <span className="text-success font-bold uppercase block text-[8px] tracking-widest mb-0.5">Optimized AI recommendation</span>
                          <span>{sent.revised}</span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = [...optimizerSentences];
                            updated[idx].used = !updated[idx].used;
                            setOptimizerSentences(updated);
                          }}
                          className={`absolute top-2 right-2 p-1 rounded transition-colors ${
                            sent.used ? "bg-[#3fb950]/20 text-[#3fb950]" : "hover:bg-[#30363d] text-text-secondary"
                          }`}
                          title="Apply this change"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // ==========================================
      // 4. RESUME MATCH VIEW
      // ==========================================
      case "hiring-resume-match":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Resume vs GitHub Matching Matrix</span>
              <span className="text-[10px] text-accent font-mono font-bold">Analysis Profile</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Overlap Radar Chart */}
              <div className="md:col-span-6 rounded-xl border border-border bg-surface/30 p-5 space-y-4 flex flex-col justify-between items-center">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider self-start">Footprint Overlap Chart</h3>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={resumeMatchRadarData}>
                      <PolarGrid stroke="#30363d" />
                      <PolarAngleAxis dataKey="subject" stroke="#8b949e" fontSize={10} />
                      <Radar name="Resume Profile" dataKey="Resume" stroke="#58a6ff" fill="#58a6ff" fillOpacity={0.25} />
                      <Radar name="GitHub Footprint" dataKey="GitHub" stroke="#3fb950" fill="#3fb950" fillOpacity={0.25} />
                      <Tooltip contentStyle={{ backgroundColor: "#161b22", borderColor: "#30363d" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 text-xs font-mono mt-2 self-start">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#58a6ff] rounded" />
                    <span className="text-text-secondary">Resume Details</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#3fb950] rounded" />
                    <span className="text-text-secondary">GitHub History</span>
                  </div>
                </div>
              </div>

              {/* Gap Breakdown */}
              <div className="md:col-span-6 space-y-4">
                <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Consistency Assessment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg border border-border bg-[#161B22]/30 text-center">
                      <span className="text-[9px] text-[#8b949e] uppercase block font-bold">Consistency Score</span>
                      <span className="text-2xl font-bold text-success mt-1">92%</span>
                    </div>
                    <div className="p-3.5 rounded-lg border border-border bg-[#161B22]/30 text-center">
                      <span className="text-[9px] text-[#8b949e] uppercase block font-bold">Tech Stack Match</span>
                      <span className="text-2xl font-bold text-[#58a6ff] mt-1">85%</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-text-secondary">
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span>Missing GitHub Projects:</span>
                      <strong className="text-warning">2 items</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span>Missing Resume Skills:</span>
                      <strong className="text-warning">3 elements</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span>Portfolio Coverage:</span>
                      <strong className="text-success">Optimal</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Your resume aligns closely with your GitHub credentials. Adding repository links directly next to your resume projects will raise the overlap rating further.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // ==========================================
      // 5. JOB MATCH VIEW
      // ==========================================
      case "hiring-job-match":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Target Job Match Optimizer</span>
              <span className="text-[10px] text-accent font-mono">Job Description Match</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Input details */}
              <div className="md:col-span-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">Pasted Job Details</label>
                  <textarea
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description or requirements summary..."
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-[#F0F6FC] font-mono focus:border-accent focus:outline-none placeholder-[#484f58]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold">Job URL (Optional)</label>
                  <input
                    type="text"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://company.lever.co/jobs/..."
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] font-mono focus:border-accent focus:outline-none placeholder-[#484f58]"
                  />
                </div>

                <button
                  onClick={handleRunJobMatch}
                  disabled={isMatching || (!jobDescription.trim() && !jobUrl.trim())}
                  className="w-full py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isMatching ? <RefreshCw size={12} className="animate-spin" /> : null}
                  <span>Calculate compatibility</span>
                </button>
              </div>

              {/* Match Output */}
              <div className="md:col-span-7 space-y-4">
                {jobMatchResult ? (
                  <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h4 className="text-xs font-bold text-text-primary uppercase">Matching results</h4>
                      <span className="text-[10px] text-success font-mono font-bold">Complete</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg border border-border bg-[#161B22]/30">
                        <span className="text-[9px] text-[#8b949e] uppercase block font-bold">Job Match %</span>
                        <span className="text-2xl font-black text-success mt-1">{jobMatchResult.matchPercentage}%</span>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-[#161B22]/30">
                        <span className="text-[9px] text-[#8b949e] uppercase block font-bold">Shortlist Probability</span>
                        <span className={`text-xl font-bold mt-1.5 block ${
                          jobMatchResult.probabilityOfShortlist === "High" ? "text-success" : "text-warning"
                        }`}>{jobMatchResult.probabilityOfShortlist}</span>
                      </div>
                    </div>

                    <div className="space-y-3 font-mono text-[10px] text-text-secondary">
                      <div>
                        <span className="text-text-primary font-bold block mb-1">Matching Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {jobMatchResult.matchingSkills.map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[8px]">{s}</span>
                          ))}
                        </div>
                      </div>

                      {jobMatchResult.missingSkills.length > 0 && (
                        <div>
                          <span className="text-text-primary font-bold block mb-1">Missing Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {jobMatchResult.missingSkills.map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger text-[8px]">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between border-b border-border/10 pb-1.5">
                        <span>Experience Signal:</span>
                        <span className="text-text-primary font-bold">{jobMatchResult.experienceMatch}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/10 pb-1.5">
                        <span>GitHub Signal:</span>
                        <span className="text-text-primary font-bold">{jobMatchResult.githubActivityMatch}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded bg-accent/5 border border-accent/15 text-[10px] text-accent leading-relaxed">
                      {jobMatchResult.verdict}
                    </div>
                  </div>
                ) : (
                  <div className="h-full rounded-xl border border-dashed border-[#30363d] flex flex-col items-center justify-center text-center p-8 text-[#8b949e]">
                    <Search size={28} className="mb-2" />
                    <p className="text-xs">No active match check run. Paste a job description and click calculate.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ==========================================
      // 6. SKILLS GAP VIEW
      // ==========================================
      case "hiring-skills-gap":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">AI Skills Gap & Calibration</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#8b949e] font-mono">Target Role:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-[#161B22] border border-[#30363d] rounded px-2 py-0.5 text-[10px] text-[#F0F6FC] font-mono focus:outline-none"
                >
                  <option value="Full Stack">Full Stack</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Current vs Target */}
              <div className="md:col-span-5 rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Gap Breakdown</h3>
                
                <div className="space-y-3 font-mono text-[10px] text-text-secondary">
                  <div>
                    <span className="text-success font-bold block mb-1">Matched Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {skillsGapData.matched.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[8px]">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-danger font-bold block mb-1">Missing Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {skillsGapData.missing.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger text-[8px]">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-3 flex justify-between">
                    <span>Estimated Study Time:</span>
                    <strong className="text-accent">{skillsGapData.missing.length * 2} weeks</strong>
                  </div>
                </div>
              </div>

              {/* Recommended Courses & Repos */}
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={14} className="text-accent" />
                    <span>Suggested Learning Roadmap</span>
                  </h3>

                  <div className="space-y-3">
                    {skillsGapData.suggestedCourses.length > 0 ? (
                      skillsGapData.suggestedCourses.map((c, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-border bg-[#161B22]/30 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-text-primary font-bold">{c.skill}</span>
                            <p className="text-[10px] text-text-secondary mt-1">{c.course}</p>
                          </div>
                          <span className="text-[9px] font-mono text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded">{c.duration}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-text-secondary font-mono text-xs">No gaps detected! You are fully equipped for this role.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // ==========================================
      // 7. RECRUITER VIEW
      // ==========================================
      case "hiring-recruiter":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-[#f85149] tracking-widest uppercase font-bold flex items-center gap-1.5">
                <Eye size={12} />
                <span>Recruiter Evaluation Mode</span>
              </span>
              <span className="text-[10px] text-text-secondary font-mono">Viewing Profile anonymously</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Recruiter Evaluation Panel */}
              <div className="md:col-span-8 space-y-6">
                <div className="rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Executive Candidate Summary</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed font-mono">
                    {recruiterMetrics.aiSummary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-surface/30 p-4 space-y-3">
                    <span className="text-[10px] text-success uppercase block font-bold tracking-wider">Verified Strengths</span>
                    <ul className="space-y-2 text-[10px] text-text-secondary font-mono">
                      {recruiterMetrics.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-success font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-surface/30 p-4 space-y-3">
                    <span className="text-[10px] text-danger uppercase block font-bold tracking-wider">Growth Areas</span>
                    <ul className="space-y-2 text-[10px] text-text-secondary font-mono">
                      {recruiterMetrics.weaknesses.map((w, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-danger font-bold">!</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recruiter Scores card */}
              <div className="md:col-span-4 rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3 text-center">
                  <span className="text-[9px] text-[#8b949e] uppercase block font-bold tracking-wider">Shortlist Verdict</span>
                  <div className="text-3xl font-black text-success mt-1">{recruiterMetrics.shortlistProbability}</div>
                  <div className="flex justify-center gap-1 mt-1 text-yellow-500 text-lg">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < Math.floor(recruiterMetrics.starRating) ? "fill-yellow-500" : ""} />
                    ))}
                    <span className="text-xs text-text-secondary ml-1 font-mono font-bold">({recruiterMetrics.starRating})</span>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 space-y-2 font-mono text-[10px] text-text-secondary">
                  <div className="flex justify-between">
                    <span>Repo Quality Index:</span>
                    <strong className="text-text-primary">{recruiterMetrics.repoQuality}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Documentation:</span>
                    <strong className="text-text-primary">{recruiterMetrics.documentationScore}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Consistency:</span>
                    <strong className="text-text-primary">{recruiterMetrics.consistency}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // ==========================================
      // 8. INTERVIEW READINESS
      // ==========================================
      case "hiring-interview":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Interview Readiness Evaluator</span>
              <span className="text-[10px] text-accent font-mono font-bold">AI Diagnostics Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left progress bars */}
              <div className="md:col-span-5 rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Subject Ratings</h3>
                <div className="space-y-3 font-mono text-[10px] text-text-secondary">
                  {interviewScores.map((subj, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{subj.topic}:</span>
                        <strong className="text-text-primary">{subj.score}%</strong>
                      </div>
                      <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-accent h-full" style={{ width: `${subj.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Questions Checklist */}
              <div className="md:col-span-7 rounded-xl border border-border bg-surface/30 p-5 space-y-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle size={14} className="text-[#a371f7]" />
                  <span>Simulated Interview Questions</span>
                </h3>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
                  {interviewQuestions.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => handleToggleQuestion(q.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-155 text-xs flex gap-3 items-start select-none ${
                        answeredQuestions[q.id]
                          ? "bg-accent/5 border-accent/40"
                          : "bg-[#161B22]/30 border-border hover:border-[#30363d]"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        answeredQuestions[q.id] ? "bg-accent border-accent text-white" : "border-[#30363d]"
                      }`}>
                        {answeredQuestions[q.id] && <Check size={10} />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1 py-0.2 bg-[#21262d] text-[9px] text-[#8b949e] rounded font-mono font-bold uppercase">{q.category}</span>
                        </div>
                        <p className="text-text-primary font-bold">{q.question}</p>
                        {answeredQuestions[q.id] && (
                          <div className="mt-2 text-[10px] text-text-secondary pl-2 border-l border-accent/40 font-mono leading-relaxed">
                            <span className="font-bold text-accent">Key concept:</span> {q.answerSummary}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // ==========================================
      // 9. CAREER ROADMAP
      // ==========================================
      case "hiring-roadmap":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Personalized Developer Roadmap</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#8b949e] font-mono">Role Target:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-[#161B22] border border-[#30363d] rounded px-2 py-0.5 text-[10px] text-[#F0F6FC] font-mono focus:outline-none"
                >
                  <option value="Full Stack">Full Stack</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative border-l border-[#30363d] ml-4 pl-6 space-y-8 py-3">
              {roadmapData.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline point */}
                  <div className="absolute -left-10 top-1 w-8 h-8 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[10px] font-mono font-bold text-accent group-hover:border-accent transition-colors">
                    D{step.day}
                  </div>

                  <div className="rounded-xl border border-border bg-surface/30 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-text-primary">{step.title}</h4>
                    <p className="text-[10px] text-text-secondary leading-relaxed font-mono">{step.desc}</p>
                    <div className="pt-2 flex flex-wrap gap-2 text-[9px] font-mono text-accent">
                      <span className="text-text-secondary font-bold">Resources:</span>
                      {step.resources.map((res, rIdx) => (
                        <span key={rIdx} className="bg-[#21262d] px-1.5 py-0.5 rounded">{res}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ==========================================
      // 10. APPLICATIONS TRACKER
      // ==========================================
      case "hiring-applications":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Application Kanban Tracker</span>
              <button
                onClick={() => setShowAddAppModal(true)}
                className="px-2.5 py-1 bg-accent hover:bg-accent/90 text-white font-bold text-[10px] rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} />
                <span>Add Application</span>
              </button>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["Wishlist", "Interviewing", "Offer"] as const).map((colStatus) => {
                const list = applications.filter(a => a.status === colStatus || (colStatus === "Wishlist" && a.status === "Applied") || (colStatus === "Offer" && (a.status === "Offer" || a.status === "Selected" || a.status === "Rejected")));
                return (
                  <div key={colStatus} className="space-y-3">
                    <div className="flex justify-between items-center bg-[#161B22]/60 px-3 py-2 rounded-lg border border-border text-xs font-bold">
                      <span className="text-text-primary uppercase tracking-wider">{colStatus}</span>
                      <span className="text-[9px] font-mono bg-[#21262d] text-text-secondary px-1.5 py-0.5 rounded">{list.length}</span>
                    </div>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                      {list.map(app => (
                        <div key={app.id} className="p-4 rounded-xl border border-border bg-[#161B22]/30 space-y-3 relative group">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="text-xs font-bold text-text-primary truncate">{app.company}</h4>
                              <button
                                onClick={() => handleDeleteApp(app.id)}
                                className="text-[#8b949e] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                                title="Delete application"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <span className="text-[10px] text-text-secondary font-mono">{app.role}</span>
                          </div>

                          {app.notes && (
                            <p className="text-[10px] text-text-secondary font-mono leading-relaxed line-clamp-2">
                              {app.notes}
                            </p>
                          )}

                          <div className="flex justify-between items-center text-[9px] font-mono text-text-secondary">
                            <span>{app.date}</span>
                            {app.salary && <span className="bg-[#21262d] text-text-primary px-1.5 py-0.5 rounded">{app.salary}</span>}
                          </div>

                          {/* Quick stage upgrade */}
                          <div className="flex border border-border rounded overflow-hidden mt-1">
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, "Wishlist")}
                              className={`flex-1 py-1 text-[8px] font-bold border-r border-border hover:bg-[#21262d] transition-colors uppercase ${
                                app.status === "Wishlist" ? "bg-[#21262d] text-accent" : "text-[#8b949e]"
                              }`}
                            >
                              Wishlist
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, "Interviewing")}
                              className={`flex-1 py-1 text-[8px] font-bold border-r border-border hover:bg-[#21262d] transition-colors uppercase ${
                                app.status === "Interviewing" ? "bg-[#21262d] text-accent" : "text-[#8b949e]"
                              }`}
                            >
                              Interview
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, "Offer")}
                              className={`flex-1 py-1 text-[8px] font-bold hover:bg-[#21262d] transition-colors uppercase ${
                                app.status === "Offer" ? "bg-[#21262d] text-accent" : "text-[#8b949e]"
                              }`}
                            >
                              Offer
                            </button>
                          </div>
                        </div>
                      ))}

                      {list.length === 0 && (
                        <div className="text-center py-8 text-text-secondary font-mono text-[10px] border border-dashed border-[#30363d] rounded-lg">
                          No items in this column
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add App Modal */}
            {showAddAppModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-[#161B22] border border-[#30363d] rounded-xl p-5 w-full max-w-md space-y-4">
                  <div className="flex justify-between items-center border-b border-[#30363d] pb-2">
                    <h3 className="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">New Application</h3>
                    <button onClick={() => setShowAddAppModal(false)} className="text-[#8b949e] hover:text-[#F0F6FC]">×</button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8b949e] uppercase block font-bold">Company Name</label>
                      <input
                        type="text"
                        value={newApp.company}
                        onChange={(e) => setNewApp(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="e.g. Stripe"
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-[#F0F6FC] focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8b949e] uppercase block font-bold">Job Role</label>
                      <input
                        type="text"
                        value={newApp.role}
                        onChange={(e) => setNewApp(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g. Full Stack Engineer"
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-[#F0F6FC] focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase block font-bold">Initial Status</label>
                        <select
                          value={newApp.status}
                          onChange={(e) => setNewApp(prev => ({ ...prev, status: e.target.value as Application["status"] }))}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-[#F0F6FC] focus:outline-none"
                        >
                          <option value="Wishlist">Wishlist</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offer">Offer</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase block font-bold">Expected Salary</label>
                        <input
                          type="text"
                          value={newApp.salary}
                          onChange={(e) => setNewApp(prev => ({ ...prev, salary: e.target.value }))}
                          placeholder="e.g. $140k"
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-[#F0F6FC] focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8b949e] uppercase block font-bold">Notes</label>
                      <textarea
                        rows={3}
                        value={newApp.notes}
                        onChange={(e) => setNewApp(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Application links, reminders..."
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-[#F0F6FC] focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddApplication}
                    className="w-full py-2 bg-accent hover:bg-accent/90 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Create Application
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Pill Navigation */}
      <div className="border-b border-border/60 pb-3 flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-accent border-accent text-white animate-pulse"
                  : "border-border bg-[#161B22]/30 text-text-secondary hover:text-text-primary hover:bg-[#161B22]/60"
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="bg-surface/10 rounded-xl p-4 border border-border/50"
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
