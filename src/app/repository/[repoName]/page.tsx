"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToAuthChanges, logOutUser, DevTrackUser, getUserFromFirestore } from "@/lib/firebase";
import { fetchGitHubDashboardData } from "@/lib/github";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GitHubRepoIntelligenceService, GitHubRepoIntelligence } from "@/services/github/github-intelligence.service";
import { AICodeReviewEngine, FileReviewReport, FunctionDetail, PullRequestDetail, ArchitectureReport, TechnicalDebtReport, AISuggestionsReport } from "@/services/aiCodeReviewEngine";
import { AISecurityScanner, SecurityScanResult, SecurityIssue } from "@/services/aiSecurityScanner";
import { formatBytes } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  Clock,
  Code,
  ExternalLink,
  FileCode,
  Folder,
  GitBranch,
  GitCommit,
  GitFork,
  GitPullRequest,
  HelpCircle,
  Loader2,
  Lock,
  Shield,
  Sparkles,
  Star,
  Tag,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Send,
  Download,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Award,
  Zap,
  Info,
  Terminal,
  Key,
  ShieldAlert,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
}

type DevTabId =
  | "code-review"
  | "analysis"
  | "pr-review"
  | "architecture"
  | "tech-debt"
  | "ai-suggestions"
  | "code-history";

type SecTabId =
  | "sec-overview"
  | "sec-vulnerabilities"
  | "sec-secrets"
  | "sec-dependency"
  | "sec-code"
  | "sec-container"
  | "sec-license"
  | "sec-compliance"
  | "sec-timeline"
  | "sec-recommendations";

export default function RepositoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const repoName = params.repoName as string;
  const ownerParam = searchParams.get("owner") || "";

  // Auth & Token states
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [githubToken, setGithubToken] = useState("");
  const [owner, setOwner] = useState(ownerParam);

  // Intelligence & Loading states
  const [intelligence, setIntelligence] = useState<GitHubRepoIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mode Switcher: developer or security
  const [workspaceMode, setWorkspaceMode] = useState<"developer" | "security">("developer");

  // Navigation tab states
  const [activeDevTab, setActiveDevTab] = useState<DevTabId>("code-review");
  const [activeSecTab, setActiveSecTab] = useState<SecTabId>("sec-overview");

  // File explorer states
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [loadingFileContent, setLoadingFileContent] = useState(false);

  // Dynamic Static Analysis State
  const [fileAnalysisReport, setFileAnalysisReport] = useState<FileReviewReport | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<FunctionDetail | null>(null);

  // Security Scanner States
  const [securityReport, setSecurityReport] = useState<SecurityScanResult | null>(null);
  const [isScanningSecurity, setIsScanningSecurity] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeVulnerability, setActiveVulnerability] = useState<SecurityIssue | null>(null);

  // Pull Request Review States
  const [pullRequests, setPullRequests] = useState<PullRequestDetail[]>([]);
  const [selectedPR, setSelectedPR] = useState<PullRequestDetail | null>(null);
  const [prAnalyzing, setPrAnalyzing] = useState(false);

  // AI Chat Drawer States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "assistant"; text: string }[]>([
    { sender: "assistant", text: "Hello! I am your DevTrack Senior AI Developer assistant. Select any file or trigger a security scan to start reviews!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Export State
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Comparison states
  const [userRepositories, setUserRepositories] = useState<any[]>([]);

  // 1. Subscribe to Auth and load token
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      if (user && !ownerParam) {
        setOwner(user.username);
      }
    });

    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("devtrack_github_token") || "";
      setGithubToken(storedToken);
    }

    return () => unsubscribe();
  }, [ownerParam]);

  const targetOwner = owner || ownerParam || "demo";

  const {
    repository = { name: repoName, default_branch: "main", html_url: "", description: "" },
    healthScore = 88,
    healthBreakdown = { codeQuality: 90, testCoverage: 0, documentation: 80, security: 85 },
    documentationAnalysis = { score: 80, docstringsCount: 10, filesWithoutDocstrings: [] },
    securityAnalysis = { score: 85, vulnerabilitiesCount: 0, criticalVulnerabilities: 0, warnings: [] },
    activityAnalysis = { commitFrequency: "Weekly", activeContributors: 1, lastCommitDate: "" },
    codebaseInsights = { languageDistribution: [{ name: "TypeScript", percentage: 100 }], configFiles: ["tsconfig.json", "package.json"] },
    checklist = [],
    timeline = []
  } = intelligence || {};

  const checklistPaths = useMemo(() => {
    return checklist.map((c: any) => c.name);
  }, [checklist]);

  const techDebt: TechnicalDebtReport = useMemo(() => {
    return AICodeReviewEngine.getTechnicalDebt(checklistPaths);
  }, [checklistPaths]);

  const archReport: ArchitectureReport = useMemo(() => {
    return AICodeReviewEngine.getArchitectureReview(checklistPaths);
  }, [checklistPaths]);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    if (user.githubToken) {
      setGithubToken(user.githubToken);
      localStorage.setItem("devtrack_github_token", user.githubToken);
    }
    setOwner(user.username);
  };

  const handleLogout = async () => {
    await logOutUser();
    setCurrentUser(null);
    setGithubToken("");
    localStorage.removeItem("devtrack_github_token");
    router.push("/login");
  };

  // Loader screen
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-text-primary">
        <Loader2 className="animate-spin text-accent mb-4" size={32} />
        <span className="font-mono text-sm">Analyzing GitHub Repository...</span>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-text-primary p-6 text-center max-w-md mx-auto">
        <AlertTriangle className="text-danger mb-4" size={32} />
        <p className="font-mono text-sm mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-accent rounded text-xs font-mono font-bold text-white cursor-pointer">Back to Dashboard</button>
      </div>
    );
  }

  // 2. Fetch Repository Intelligence
  useEffect(() => {
    if (!repoName || !targetOwner) return;

    let isMounted = true;
    const loadIntelligence = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
        setSelectedFileContent(null);
        setSelectedFilePath(null);
        setFileAnalysisReport(null);
        setSelectedFunction(null);
      }
      try {
        const intel = await GitHubRepoIntelligenceService.fetchIntelligence(targetOwner, repoName, githubToken);
        if (isMounted) {
          setIntelligence(intel);
          // Set up initial file tree
          if (intel.repository) {
            await loadInitialFileTree(targetOwner, repoName, intel.repository.default_branch || "main");
          }
          // Load PRs
          const prs = AICodeReviewEngine.getMockPullRequests(repoName);
          setPullRequests(prs);
          if (prs.length > 0) setSelectedPR(prs[0]);

          // Run initial security scan compilation
          const paths = intel.checklist.map(c => c.name);
          const initialReport = AISecurityScanner.scanRepository(paths, {
            "package.json": `{\n  "name": "${repoName}",\n  "license": "MIT",\n  "dependencies": {\n    "react": "^19.0.0",\n    "next": "^16.0.0",\n    "lodash": "4.17.15",\n    "axios": "1.2.0"\n  }\n}`
          });
          setSecurityReport(initialReport);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load repository intelligence.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadIntelligence();
    return () => {
      isMounted = false;
    };
  }, [repoName, targetOwner, githubToken]);

  // Load User Repositories for Comparison list
  useEffect(() => {
    if (!targetOwner) return;
    const loadUserRepos = async () => {
      try {
        const data = await getUserFromFirestore(targetOwner);
        if (data) {
          setUserRepositories(data.repositories.filter((r: any) => r.name !== repoName));
        } else if (targetOwner.toLowerCase() === "demo") {
          const demoData = await fetchGitHubDashboardData("demo");
          setUserRepositories(demoData.repositories.filter((r: any) => r.name !== repoName));
        }
      } catch (e) {
        console.warn("Failed loading user repositories list", e);
      }
    };
    loadUserRepos();
  }, [targetOwner, repoName]);

  // Scroll Chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatTyping]);

  // Initial file tree loading
  const loadInitialFileTree = async (repoOwner: string, repo: string, branch: string) => {
    if (repoOwner.toLowerCase() === "demo" || repoOwner.toLowerCase() === "alex-developer") {
      setFileTree([
        { name: "src", type: "dir", path: "src", children: [] },
        { name: "public", type: "dir", path: "public", children: [] },
        { name: "package.json", type: "file", path: "package.json" },
        { name: "tsconfig.json", type: "file", path: "tsconfig.json" },
        { name: "README.md", type: "file", path: "README.md" }
      ]);
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (githubToken) headers["Authorization"] = `token ${githubToken}`;
      const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repo}/contents`, { headers });
      if (res.ok) {
        const contents = await res.json();
        setFileTree(contents.map((c: any) => ({
          name: c.name,
          type: c.type === "dir" ? "dir" : "file",
          path: c.path,
          children: c.type === "dir" ? [] : undefined
        })));
      }
    } catch (e) {
      console.warn("Failed loading file tree root", e);
    }
  };

  // Expand directory lazy helper
  const loadDirContents = async (nodePath: string) => {
    if (targetOwner.toLowerCase() === "demo" || targetOwner.toLowerCase() === "alex-developer") {
      const mockChildren: TreeNode[] = [
        { name: "components", type: "dir", path: `${nodePath}/components`, children: [] },
        { name: "lib", type: "dir", path: `${nodePath}/utils.ts` },
        { name: "page.tsx", type: "file", path: `${nodePath}/page.tsx` }
      ];
      setFileTree(prev => {
        const updateNode = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(n => {
            if (n.path === nodePath) return { ...n, children: mockChildren };
            if (n.children) return { ...n, children: updateNode(n.children) };
            return n;
          });
        };
        return updateNode(prev);
      });
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (githubToken) headers["Authorization"] = `token ${githubToken}`;
      const res = await fetch(`https://api.github.com/repos/${targetOwner}/${repoName}/contents/${nodePath}`, { headers });
      if (res.ok) {
        const contents = await res.json();
        const updatedChildren: TreeNode[] = contents.map((c: any) => ({
          name: c.name,
          type: c.type === "dir" ? "dir" : "file",
          path: c.path,
          children: c.type === "dir" ? [] : undefined
        }));

        setFileTree(prev => {
          const updateNodeInTree = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map(node => {
              if (node.path === nodePath) {
                return { ...node, children: updatedChildren };
              } else if (node.children) {
                return { ...node, children: updateNodeInTree(node.children) };
              }
              return node;
            });
          };
          return updateNodeInTree(prev);
        });
      }
    } catch (e) {
      console.warn("Failed loading directory contents dynamically", e);
    }
  };

  const toggleNode = (node: TreeNode) => {
    const isExpanded = !!expandedNodes[node.path];
    setExpandedNodes(prev => ({ ...prev, [node.path]: !isExpanded }));

    if (node.type === "dir" && !isExpanded && (!node.children || node.children.length === 0)) {
      loadDirContents(node.path);
    } else if (node.type === "file") {
      loadFileContent(node.path);
    }
  };

  const loadFileContent = async (filePath: string) => {
    setLoadingFileContent(true);
    setSelectedFilePath(filePath);
    setSelectedFunction(null);
    let content = "";
    if (targetOwner.toLowerCase() === "demo" || targetOwner.toLowerCase() === "alex-developer") {
      await new Promise((r) => setTimeout(r, 300));
      if (filePath.endsWith("README.md")) {
        content = `# ${repoName}\n\nThis is a mocked file preview in DevTrack Repository Explorer.\n\n## Setup\nRun npm install to initialize.\n\n## Usage\nRun npm run dev to launch the service.`;
      } else if (filePath.endsWith("package.json")) {
        content = `{\n  "name": "${repoName}",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "next": "^16.0.0",\n    "lodash": "4.17.15",\n    "axios": "1.2.0"\n  }\n}`;
      } else if (filePath.endsWith("utils.ts")) {
        content = `// Telemetry calculations\nexport function calculateTelemetry(data: any[]) {\n  const API_KEY = "AIzaSyBnPzEY2wOrbfby_8wf8LOHYVglzBQwv3o"; // Hardcoded secret!\n  console.log("Processing telemetry...");\n  if (!data) return null;\n  \n  let score = 0;\n  for(let i=0; i<data.length; i++) {\n    for(let j=0; j<data[i].items.length; j++) {\n      const val = data[i].items[j];\n      if(val > 10) {\n        score += val * 1.5;\n      }\n    }\n  }\n  return score;\n}\n\nexport function formatValue(val: number) {\n  return \`Val: \${val}\`;\n}`;
      } else {
        content = `// Mocked code file preview\nexport default function Module() {\n  const message = "Loaded ${filePath}";\n  eval("console.log(message)"); // Eval warning!\n  return <div>{message}</div>;\n}`;
      }
      setSelectedFileContent(content);
      // Run Dynamic Static Analysis
      const analysis = AICodeReviewEngine.analyzeFile(filePath, content);
      setFileAnalysisReport(analysis);

      // Re-trigger security scanning compilation to catch dynamic files loaded
      const paths = intelligence?.checklist.map(c => c.name) || [filePath];
      const nextReport = AISecurityScanner.scanRepository(paths, {
        "package.json": `{\n  "name": "${repoName}",\n  "license": "MIT",\n  "dependencies": {\n    "react": "^19.0.0",\n    "next": "^16.0.0",\n    "lodash": "4.17.15",\n    "axios": "1.2.0"\n  }\n}`,
        [filePath]: content
      });
      setSecurityReport(nextReport);

      setLoadingFileContent(false);
      return;
    }

    try {
      const headers: Record<string, string> = { Accept: "application/vnd.github.v3.raw" };
      if (githubToken) headers["Authorization"] = `token ${githubToken}`;
      const res = await fetch(`https://api.github.com/repos/${targetOwner}/${repoName}/contents/${filePath}`, { headers });
      if (res.ok) {
        content = await res.text();
        setSelectedFileContent(content);
        // Run Dynamic Static Analysis
        const analysis = AICodeReviewEngine.analyzeFile(filePath, content);
        setFileAnalysisReport(analysis);

        // Run Security Scanner live
        const paths = intelligence?.checklist.map(c => c.name) || [filePath];
        const nextReport = AISecurityScanner.scanRepository(paths, {
          "package.json": `{\n  "name": "${repoName}",\n  "license": "MIT",\n  "dependencies": {\n    "react": "^19.0.0",\n    "next": "^16.0.0",\n    "lodash": "4.17.15",\n    "axios": "1.2.0"\n  }\n}`,
          [filePath]: content
        });
        setSecurityReport(nextReport);
      } else {
        setSelectedFileContent(`Error loading file: ${res.statusText}`);
        setFileAnalysisReport(null);
      }
    } catch (e: any) {
      setSelectedFileContent(`Error loading file: ${e.message}`);
      setFileAnalysisReport(null);
    } finally {
      setLoadingFileContent(false);
    }
  };

  // Perform a mock PR analysis
  const handlePRAnalysis = async (pr: PullRequestDetail) => {
    setSelectedPR(pr);
    setPrAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setPrAnalyzing(false);
  };

  // Run cyber retro security terminal scan animation
  const runSecurityScan = async () => {
    setIsScanningSecurity(true);
    setTerminalLogs([]);
    
    const logs = [
      "[INFO] [18:22:21] Initializing DevTrack Security Scan Engine v3.0 (Production-grade)...",
      "[INFO] Loading vulnerability heuristic databases (OWASP Top 10, CWE, CVE)...",
      "[INFO] Resolving GitHub repository file index tree...",
      `[INFO] Identified ${intelligence?.checklist.length || 12} files in workspace buffers.`,
      "[INFO] [SECRET SCANNER] Scanning for leaked credentials, API keys, and certificates...",
      "[WARN] SEC-SECRET-FIREBASE: Leaked Firebase API Key in lib/firebase.ts on Line 6!",
      "[WARN] SEC-SECRET-OPENAI: Exposed OpenAI API Key detected in config/openai.json!",
      "[INFO] [DEPENDENCY SCANNER] Parsing project lockfiles and dependencies (npm, yarn, pip)...",
      "[WARN] DEP-CVE-CVE-2020-8203: lodash < 4.17.21 Prototype Pollution vulnerability matched.",
      "[WARN] DEP-CVE-CVE-2023-45857: axios < 1.6.0 SSRF configuration parser risk matched.",
      "[INFO] [STATIC CODE ANALYSIS - SAST] Analyzing source codes for insecure coding patterns...",
      "[WARN] OWASP-SQLI: Unsafe SQL concatenation query detected in src/app/api/route.ts on Line 14.",
      "[WARN] OWASP-INJ: Usage of unsafe eval() script parser blocks in src/utils/eval.ts on Line 2.",
      "[INFO] [CONFIGURATION AUDIT] Reviewing infrastructure and configuration settings...",
      "[WARN] CFG-AUDIT-MISSING-USER: Dockerfile runs container as root user. USER directive missing.",
      "[WARN] CFG-AUDIT-FIRESTORE: Firebase Firestore security rules allow public write operations.",
      "[INFO] [COMPLIANCE] Mapping findings to compliance frameworks (OWASP Top 10, SOC 2, HIPAA)...",
      "[INFO] Done. Security Score calculated: 64/100 (HIGH RISK)."
    ];

    for (const log of logs) {
      setTerminalLogs(prev => [...prev, log]);
      await new Promise((r) => setTimeout(r, 150));
    }
    
    // Update scan compile results
    const paths = intelligence?.checklist.map(c => c.name) || [];
    const filesContent: Record<string, string> = {
      "package.json": `{\n  "name": "${repoName}",\n  "license": "MIT",\n  "dependencies": {\n    "react": "^19.0.0",\n    "next": "^16.0.0",\n    "lodash": "4.17.15",\n    "axios": "1.2.0"\n  }\n}`,
      "requirements.txt": "django==3.1.2\nrequests==2.18.4\nnumpy==1.22.0",
      "Dockerfile": "FROM node:20\nWORKDIR /app\nCOPY . .\nCMD [\"npm\", \"start\"]",
      "firestore.rules": "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}"
    };
    if (selectedFilePath && selectedFileContent) {
      filesContent[selectedFilePath] = selectedFileContent;
    }
    const report = AISecurityScanner.scanRepository(paths, filesContent);
    setSecurityReport(report);
    
    setIsScanningSecurity(false);
  };

  // AI Chat Submit Handler
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatTyping) return;

    const userPrompt = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userPrompt }]);
    setChatInput("");
    setChatTyping(true);

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 1000));

    let response = "";
    if (workspaceMode === "security") {
      response = AISecurityScanner.getChatResponse(userPrompt, securityReport?.issues || [], repoName);
    } else {
      const activeFile = selectedFilePath && selectedFileContent ? { path: selectedFilePath, content: selectedFileContent } : undefined;
      response = AICodeReviewEngine.getChatResponse(chatMessages, userPrompt, activeFile, repoName);
    }
    
    setChatMessages(prev => [...prev, { sender: "assistant", text: response }]);
    setChatTyping(false);
  };

  // Export Trigger
  const triggerExport = (type: "pdf" | "markdown" | "json" | "comment" | "pr") => {
    setExportDropdownOpen(false);
    
    if (type === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ intelligence, securityReport, technicalDebt: techDebt }, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${repoName}-security-report.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === "markdown" || type === "comment" || type === "pr") {
      let md = `# GitHub Security Scan Report - ${repoName}\n\n`;
      md += `**Repository:** ${targetOwner}/${repoName}\n`;
      md += `**Security Score:** ${securityReport?.score || 80}/100\n`;
      md += `**Risk Level:** ${securityReport?.riskLevel || "Low"}\n\n`;
      md += `## Critical Vulnerability Findings\n`;
      securityReport?.issues.forEach(iss => {
        md += `### [${iss.severity}] ${iss.title}\n`;
        md += `- **Location:** \`${iss.file}:${iss.line}\`\n`;
        md += `- **Description:** ${iss.description}\n`;
        md += `- **Remediation:** ${iss.recommendation}\n\n`;
      });

      const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${repoName}-security-report.md`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === "pdf") {
      window.print();
    }
  };

  // Render file tree recursively
  const renderFileTree = (nodes: TreeNode[]) => {
    return (
      <div className="pl-3 space-y-1 font-mono text-[11px] select-none">
        {nodes.map(node => {
          const isExpanded = !!expandedNodes[node.path];
          const isSelected = selectedFilePath === node.path;
          const hasChildren = node.type === "dir";

          return (
            <div key={node.path} className="space-y-0.5">
              <div
                onClick={() => toggleNode(node)}
                className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#1F6FEB]/20 border border-[#58A6FF]/30 text-white font-bold"
                    : "hover:bg-surface-secondary/40 text-text-secondary hover:text-text-primary"
                }`}
              >
                {node.type === "dir" ? (
                  <>
                    {isExpanded ? <ChevronDown size={12} className="text-text-secondary" /> : <ChevronRight size={12} className="text-text-secondary" />}
                    <Folder size={12} className="text-accent flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <span className="w-3" />
                    <FileCode size={12} className="text-success flex-shrink-0" />
                  </>
                )}
                <span className="truncate">{node.name}</span>
              </div>
              {hasChildren && isExpanded && node.children && (
                <div className="border-l border-border/40 ml-2.5">
                  {renderFileTree(node.children)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex min-h-screen flex-col bg-background selection:bg-accent/30 selection:text-text-primary text-foreground font-sans transition-colors duration-300 ${workspaceMode === "security" ? "theme-security" : ""}`}>
      <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex h-[calc(100vh-64px)] pt-16 overflow-hidden relative">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-64 border-r border-border bg-[#0D1117]/80 backdrop-blur-md flex flex-col justify-between flex-shrink-0 overflow-y-auto select-none">
          <div className="p-4 space-y-6">
            
            {/* Context Heading */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => router.push(`/dashboard?user=${targetOwner}`)}
                  className="p-1 rounded-md hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft size={14} />
                </button>
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider font-mono">PORTFOLIO DRILLDOWN</span>
              </div>
              <h2 className="text-sm font-black font-space-grotesk text-text-primary truncate" title={repository.name}>
                {repository.name}
              </h2>
            </div>

            {/* DUAL WORKSPACE TOGGLE SELECTOR */}
            <div className="p-1 rounded-lg bg-surface-secondary/40 border border-border flex text-xs font-mono select-none">
              <button
                onClick={() => setWorkspaceMode("developer")}
                className={`flex-1 py-1.5 rounded text-center transition-all cursor-pointer font-bold ${
                  workspaceMode === "developer"
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Dev Console
              </button>
              <button
                onClick={() => setWorkspaceMode("security")}
                className={`flex-1 py-1.5 rounded text-center transition-all cursor-pointer font-bold ${
                  workspaceMode === "security"
                    ? "bg-danger text-white border-danger shadow-md shadow-danger/20"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Security Center
              </button>
            </div>

            {/* Dynamic Navigation Links based on Mode */}
            {workspaceMode === "developer" ? (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block px-2">Developer</span>
                <nav className="space-y-1 font-mono text-xs">
                  {[
                    { id: "code-review", label: "AI Code Review", icon: Code },
                    { id: "analysis", label: "Repository Analysis", icon: Activity },
                    { id: "pr-review", label: "Pull Request Review", icon: GitPullRequest },
                    { id: "architecture", label: "Architecture Review", icon: Layers },
                    { id: "tech-debt", label: "Technical Debt", icon: Shield },
                    { id: "ai-suggestions", label: "AI Suggestions", icon: Sparkles },
                    { id: "code-history", label: "Code History", icon: Clock }
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = activeDevTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveDevTab(item.id as DevTabId)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#1F6FEB]/15 border-[#58A6FF]/40 text-white font-bold"
                            : "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40"
                        }`}
                      >
                        <Icon size={14} className={isActive ? "text-accent animate-pulse" : "text-text-secondary"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block px-2">Security Center</span>
                <nav className="space-y-1 font-mono text-xs">
                  {[
                    { id: "sec-overview", label: "Overview", icon: ShieldCheck },
                    { id: "sec-vulnerabilities", label: "Vulnerabilities", icon: ShieldAlert },
                    { id: "sec-secrets", label: "Secrets Leakage", icon: Key },
                    { id: "sec-dependency", label: "Dependency Scan", icon: Layers },
                    { id: "sec-code", label: "Static Code Security", icon: Code },
                    { id: "sec-container", label: "Container Security", icon: FileText },
                    { id: "sec-license", label: "License Checker", icon: HelpCircle },
                    { id: "sec-compliance", label: "Compliance Status", icon: Award },
                    { id: "sec-timeline", label: "Security Timeline", icon: Clock },
                    { id: "sec-recommendations", label: "Remediations", icon: Zap }
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = activeSecTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSecTab(item.id as SecTabId)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-danger/10 border-danger/40 text-danger font-bold"
                            : "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40"
                        }`}
                      >
                        <Icon size={14} className={isActive ? "text-danger animate-pulse" : "text-text-secondary"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/60 bg-surface/10 space-y-2 select-none">
            {workspaceMode === "security" ? (
              <button
                onClick={runSecurityScan}
                disabled={isScanningSecurity}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2.5 text-xs font-bold text-white hover:bg-danger/90 disabled:bg-danger/40 transition-all font-mono cursor-pointer shadow-md shadow-danger/10"
              >
                <Terminal size={13} />
                <span>Run Security Scan</span>
              </button>
            ) : (
              <button
                onClick={() => setChatOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-xs font-bold text-white hover:bg-accent/90 transition-all font-mono shadow-md shadow-accent/10 cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>Ask AI Chat</span>
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-[#161B22]/50 hover:bg-[#21262D] px-3 py-2 text-xs font-bold text-text-primary transition-all font-mono cursor-pointer"
              >
                <Download size={13} />
                <span>Export Report</span>
              </button>
              {exportDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-border bg-background shadow-xl p-1 z-50 text-xs font-mono">
                  <button onClick={() => triggerExport("pdf")} className="w-full text-left px-3 py-2 rounded hover:bg-surface-secondary text-text-primary cursor-pointer">Print PDF Report</button>
                  <button onClick={() => triggerExport("markdown")} className="w-full text-left px-3 py-2 rounded hover:bg-surface-secondary text-text-primary cursor-pointer">Markdown File</button>
                  <button onClick={() => triggerExport("json")} className="w-full text-left px-3 py-2 rounded hover:bg-surface-secondary text-text-primary cursor-pointer">JSON Raw Data</button>
                  <button onClick={() => triggerExport("comment")} className="w-full text-left px-3 py-2 rounded hover:bg-surface-secondary text-text-primary cursor-pointer">GitHub Security Comment</button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* WORKSPACE MAIN VIEW AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0D1117] relative">
          
          {/* Header Dashboard Metrics */}
          <header className="border-b border-border/50 bg-[#161B22]/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0 select-none">
            {workspaceMode === "developer" ? (
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg border border-border bg-surface flex items-center justify-center text-lg font-black font-space-grotesk text-accent">
                  {healthScore}
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary font-mono uppercase block">Codebase Quality Index</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary font-mono">Grade: A+</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    <span className="text-[10px] text-text-secondary font-mono">Excellent Standards</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg border border-danger/40 bg-danger/10 flex items-center justify-center text-lg font-black font-space-grotesk text-danger shadow-sm shadow-danger/25">
                  {securityReport?.score || 84}
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary font-mono uppercase block">Security Health Index</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary font-mono">Risk Level: {securityReport?.riskLevel || "Low"}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
                    <span className="text-[10px] text-text-secondary font-mono">OWASP Verified</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 font-mono text-[10px] text-text-secondary">
              <div className="space-y-0.5">
                <span>REDUNDANCY</span>
                <span className="font-bold text-text-primary block">{techDebt.duplicateCodePercentage}%</span>
              </div>
              <div className="space-y-0.5 border-l border-border/60 pl-4">
                <span>COMPLEXITY INDEX</span>
                <span className="font-bold text-text-primary block">Medium</span>
              </div>
              <div className="space-y-0.5 border-l border-border/60 pl-4">
                <span>TOTAL ISSUES</span>
                <span className={`font-bold block ${workspaceMode === "security" ? "text-danger" : "text-text-primary"}`}>
                  {workspaceMode === "security" ? securityReport?.issues.length : techDebt.codeSmellsCount}
                </span>
              </div>
            </div>
          </header>

          {/* Sub Tab Panel Workspace Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin relative">
            <AnimatePresence mode="wait">
              {workspaceMode === "developer" ? (
                <motion.div
                  key={activeDevTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* TAB 1: AI CODE REVIEW */}
                  {activeDevTab === "code-review" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Quality parameters */}
                      <div className="lg:col-span-8 space-y-6">
                        
                        {/* Metric Circular Gauges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { label: "Readability", val: 94, color: "text-[#3FB950] border-[#238636]/30 bg-[#238636]/10" },
                            { label: "Scalability", val: 86, color: "text-[#58A6FF] border-[#1F6FEB]/30 bg-[#1F6FEB]/10" },
                            { label: "Architecture", val: 80, color: "text-[#A97BFF] border-[#A97BFF]/30 bg-[#A97BFF]/10" },
                            { label: "Documentation", val: 92, color: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10" }
                          ].map(metric => (
                            <div key={metric.label} className={`rounded-xl border p-4 text-center ${metric.color} font-mono`}>
                              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">{metric.label}</span>
                              <div className="text-2xl font-black mt-1 font-space-grotesk">{metric.val}%</div>
                            </div>
                          ))}
                        </div>

                        {/* File level analysis drilldown */}
                        <div className="rounded-xl border border-border bg-[#161B22]/30 overflow-hidden">
                          <div className="border-b border-border p-4 bg-[#161B22]/50 flex justify-between items-center select-none font-mono text-xs">
                            <h3 className="font-bold text-text-primary uppercase flex items-center gap-1.5">
                              <Code size={14} className="text-[#3FB950]" />
                              <span>File Level Analysis & Telemetry</span>
                            </h3>
                            <span className="text-[10px] text-text-secondary">Select a file in the explorer tree on the right</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border min-h-[350px]">
                            {/* File Content Preview / Code Panel */}
                            <div className="md:col-span-8 p-4 flex flex-col justify-between">
                              <div className="flex-1 flex flex-col justify-between min-h-[300px]">
                                <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-3 font-mono text-xs">
                                  <span className="font-bold text-text-primary truncate">
                                    {selectedFilePath ? selectedFilePath : "No file selected"}
                                  </span>
                                </div>

                                <div className="flex-1 overflow-auto bg-background/50 rounded border border-border/40 p-4 font-mono text-[11px] leading-relaxed max-h-[320px] scrollbar-thin">
                                  {loadingFileContent ? (
                                    <div className="flex flex-col items-center justify-center h-full text-text-secondary py-12">
                                      <Loader2 className="animate-spin mb-2" size={16} />
                                      <span>Reading file contents...</span>
                                    </div>
                                  ) : selectedFileContent ? (
                                    <pre className="whitespace-pre overflow-x-auto text-text-primary select-text">
                                      {selectedFileContent}
                                    </pre>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-text-secondary/40 italic py-12 text-center">
                                      <Info size={24} className="mb-2 text-text-secondary/20" />
                                      <span>Select any source file in the File Tree to inspect its cyclomatic complexity, variables, and refactoring recommendations.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Dynamic Telemetry Results */}
                            <div className="md:col-span-4 p-4 space-y-4 font-mono text-xs overflow-y-auto max-h-[350px] scrollbar-thin">
                              {fileAnalysisReport ? (
                                <div className="space-y-4">
                                  <div className="border-b border-border/40 pb-2 flex justify-between items-center">
                                    <span className="font-bold text-text-primary">FILE METRICS</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-success/15 text-success font-bold">QA {fileAnalysisReport.complexityScore}%</span>
                                  </div>
                                  
                                  <div className="space-y-1 bg-[#161B22]/30 p-2.5 rounded border border-border/40">
                                    <span className="text-[10px] text-text-secondary uppercase block">Maintainability</span>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-text-primary">{fileAnalysisReport.maintainabilityIndex}/100</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-text-primary block border-b border-border/20 pb-1">POTENTIAL ISSUES</span>
                                    {fileAnalysisReport.potentialBugs.length > 0 ? (
                                      fileAnalysisReport.potentialBugs.map((bug, i) => (
                                        <div key={i} className="p-2 rounded bg-danger/5 border border-danger/20 text-[10px]">
                                          <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-bold text-danger uppercase">{bug.type}</span>
                                            <span className="text-text-secondary">Line {bug.line}</span>
                                          </div>
                                          <p className="text-text-secondary leading-normal">{bug.description}</p>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-success text-[10px] font-bold flex items-center gap-1">
                                        <CheckCircle2 size={12} />
                                        <span>No critical issues found!</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-12 text-text-secondary/30 italic">
                                  No active file analysis.
                                </div>
                              )}
                            </div>

                          </div>
                        </div>

                      </div>

                      {/* Right Column: Mini File Tree Explorer */}
                      <div className="lg:col-span-4 rounded-xl border border-border bg-[#161B22]/30 p-4 max-h-[500px] overflow-y-auto scrollbar-thin select-none">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-3 font-mono text-xs">
                          <span className="text-[10px] text-text-secondary uppercase font-bold">Codebase Tree Explorer</span>
                        </div>
                        {fileTree.length > 0 ? (
                          renderFileTree(fileTree)
                        ) : (
                          <div className="text-center py-12 text-text-secondary/30 italic font-mono text-xs">
                            Loading file indexes...
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 2: REPOSITORY ANALYSIS */}
                  {activeDevTab === "analysis" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4 font-mono text-xs">
                          <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Ecosystem Distribution</h3>
                          <div className="space-y-2">
                            {codebaseInsights.languageDistribution.map((l: any) => (
                              <div key={l.name} className="flex items-center justify-between">
                                <span className="font-semibold text-text-primary">{l.name}</span>
                                <span className="text-text-secondary">{l.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4 font-mono text-xs">
                          <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Configurations Scanned</h3>
                          <div className="space-y-2">
                            {codebaseInsights.configFiles.map((file: string) => (
                              <div key={file} className="flex items-center gap-2 p-2 rounded bg-background border border-border/50">
                                <FileCode size={13} className="text-accent" />
                                <span className="text-text-primary font-bold">{file}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PR REVIEW */}
                  {activeDevTab === "pr-review" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
                      <div className="lg:col-span-4 rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/30 pb-2">Active Pull Requests</h3>
                        <div className="space-y-2">
                          {pullRequests.map(pr => (
                            <button
                              key={pr.id}
                              onClick={() => handlePRAnalysis(pr)}
                              className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                selectedPR?.id === pr.id ? "bg-[#1F6FEB]/15 border-[#58A6FF]/40 text-white font-bold" : "bg-surface/30 border-border/60 text-text-secondary hover:bg-surface-secondary/40"
                              }`}
                            >
                              <h4 className="text-xs font-bold text-text-primary">{pr.title}</h4>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="lg:col-span-8">
                        {selectedPR && (
                          <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-text-primary border-b border-border/30 pb-2">{selectedPR.title}</h3>
                            <p className="text-text-secondary">{selectedPR.review.summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ARCHITECTURE REVIEW */}
                  {activeDevTab === "architecture" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary border-b border-border/20 pb-2">Folder Layout Purposing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {archReport.folderAnalysis.map((folder: any) => (
                          <div key={folder.path} className="p-3 rounded-lg bg-surface/50 border border-border/40">
                            <span className="font-bold text-text-primary">{folder.path}</span>
                            <p className="text-[10px] text-text-secondary mt-1">{folder.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: TECHNICAL DEBT */}
                  {activeDevTab === "tech-debt" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary border-b border-border/20 pb-2">Debt Mitigation Roadmap</h3>
                      <div className="space-y-3">
                        {techDebt.roadmap.map((road: any) => (
                          <div key={road.priority} className="p-4 rounded-xl border border-border/40 bg-surface/30">
                            <span className="font-bold text-text-primary">{road.title}</span>
                            <p className="text-[10px] text-text-secondary mt-1">{road.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: AI SUGGESTIONS */}
                  {activeDevTab === "ai-suggestions" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary border-b border-border/20 pb-2">AI Code Suggestions</h3>
                      {AICodeReviewEngine.getSuggestions(selectedFilePath || "utils.ts", selectedFileContent || "").optimizeLoops.map((opt, i) => (
                        <div key={i} className="space-y-2">
                          <span className="font-bold text-text-primary">{opt.description}</span>
                          <pre className="p-3 bg-[#0D1117] rounded border border-border/60 overflow-x-auto text-[10px]">{opt.codeAfter}</pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 7: CODE HISTORY */}
                  {activeDevTab === "code-history" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary border-b border-border/20 pb-2">Scans History</h3>
                      <div className="relative border-l border-border/60 ml-3 space-y-4 pl-4">
                        {timeline.map((event: any, i: number) => (
                          <div key={i} className="relative">
                            <span className="text-[10px] text-text-secondary block">{event.date}</span>
                            <span className="font-bold text-text-primary">{event.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeSecTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  
                  {/* SECURITY CENTER VIEW DETAILS */}

                  {/* TAB 1: SECURITY OVERVIEW */}
                  {activeSecTab === "sec-overview" && (
                    <div className="space-y-6">
                      
                      {/* Dashboard Grid Panel */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none font-mono">
                        
                        {/* Neon circular radial dial */}
                        <div className={`md:col-span-1 border rounded-xl p-5 text-center flex flex-col items-center justify-center shadow-lg transition-all ${
                          securityReport && securityReport.score < 70 
                            ? "border-danger/35 bg-danger/5 shadow-danger/5" 
                            : "border-[#2F81F7]/30 bg-[#2F81F7]/5 shadow-[#2F81F7]/5"
                        }`}>
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider">Security Score</span>
                          <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center mt-3 shadow-md ${
                            securityReport && securityReport.score < 70 ? "border-danger/60 shadow-danger/10" : "border-[#2F81F7]/60 shadow-[#2F81F7]/10"
                          }`}>
                            <span className="text-3xl font-black text-text-primary font-space-grotesk">{securityReport?.score || 98}</span>
                            <span className="text-[8px] text-text-secondary uppercase">grade</span>
                          </div>
                          <span className={`text-[10px] font-bold mt-2 uppercase ${
                            securityReport && securityReport.score < 70 ? "text-danger" : "text-success"
                          }`}>
                            Status: {securityReport?.riskLevel || "Secure"}
                          </span>
                        </div>

                        {/* Counts box */}
                        <div className="md:col-span-2 border border-border rounded-xl bg-[#161B22]/30 p-5 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-text-secondary uppercase">Vulnerability Metrics</span>
                            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                              <div className="bg-background border border-border p-2 rounded">
                                <span className="text-[9px] text-[#F85149] font-bold block">CRITICAL</span>
                                <span className="text-xl font-bold text-text-primary mt-1 block">{securityReport?.metrics.critical || 0}</span>
                              </div>
                              <div className="bg-background border border-border p-2 rounded">
                                <span className="text-[9px] text-[#D29922] font-bold block">HIGH</span>
                                <span className="text-xl font-bold text-text-primary mt-1 block">{securityReport?.metrics.high || 0}</span>
                              </div>
                              <div className="bg-background border border-border p-2 rounded">
                                <span className="text-[9px] text-accent font-bold block">MEDIUM</span>
                                <span className="text-xl font-bold text-text-primary mt-1 block">{securityReport?.metrics.medium || 0}</span>
                              </div>
                              <div className="bg-background border border-border p-2 rounded">
                                <span className="text-[9px] text-text-secondary font-bold block">LOW</span>
                                <span className="text-xl font-bold text-text-primary mt-1 block">{securityReport?.metrics.low || 0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-text-secondary border-t border-border/40 pt-3 mt-4">
                            <span>Last scanned: <span className="font-bold text-text-primary">{securityReport?.lastScan || "Never"}</span></span>
                            <span>Next scan: <span className="font-bold text-text-primary">{securityReport?.nextScan || "Daily at 04:00 AM"}</span></span>
                          </div>
                        </div>

                        {/* Compliance Status box */}
                        <div className="md:col-span-1 border border-border rounded-xl bg-[#161B22]/30 p-5 space-y-3 font-mono text-xs">
                          <span className="text-[10px] text-text-secondary uppercase">Compliance Status</span>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>OWASP Top 10</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${securityReport?.complianceStatus.owasp === "Passed" ? "bg-success/15 border-success/30 text-success" : securityReport?.complianceStatus.owasp === "Partial" ? "bg-warning/15 border-warning/30 text-warning" : "bg-danger/15 border-danger/30 text-danger"}`}>{securityReport?.complianceStatus.owasp || "Passed"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>SOC 2 Type II</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${securityReport?.complianceStatus.soc2 === "Passed" ? "bg-success/15 border-success/30 text-success" : securityReport?.complianceStatus.soc2 === "Partial" ? "bg-warning/15 border-warning/30 text-warning" : "bg-danger/15 border-danger/30 text-danger"}`}>{securityReport?.complianceStatus.soc2 || "Passed"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>HIPAA Data Security</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${securityReport?.complianceStatus.hipaa === "Passed" ? "bg-success/15 border-success/30 text-success" : securityReport?.complianceStatus.hipaa === "Partial" ? "bg-warning/15 border-warning/30 text-warning" : "bg-danger/15 border-danger/30 text-danger"}`}>{securityReport?.complianceStatus.hipaa || "Passed"}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Visualizations Row: Attack Surface Map & Risk Network Graph */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none font-mono text-xs">
                        
                        {/* SVG Attack Surface Map */}
                        <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                          <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Attack Surface Threat Vector Map</h3>
                          <div className="h-64 flex items-center justify-center bg-background/50 border border-border/40 rounded-lg p-2">
                            <svg viewBox="0 0 420 240" className="w-full h-full max-w-sm">
                              {/* Public Source */}
                              <rect x="20" y="80" width="80" height="40" rx="5" fill="#161B22" stroke="#F85149" stroke-width="1.5" />
                              <text x="60" y="100" fill="#F0F6FC" font-size="8" text-anchor="middle" font-family="monospace">Public Internet</text>
                              <text x="60" y="112" fill="#F85149" font-size="7" font-weight="bold" text-anchor="middle" font-family="monospace">Threat Path</text>

                              {/* Connections */}
                              <path d="M 100 100 L 190 100" fill="none" stroke="#F85149" stroke-width="1.5" stroke-dasharray="3 3" />
                              <path d="M 270 100 L 330 100" fill="none" stroke="#2F81F7" stroke-width="1" />
                              <path d="M 230 120 L 230 170" fill="none" stroke="#D29922" stroke-width="1.5" />

                              {/* Gateway Node */}
                              <circle cx="230" cy="100" r="40" fill="#161B22" stroke="#2F81F7" stroke-width="1.5" />
                              <text x="230" y="98" fill="#F0F6FC" font-size="8" text-anchor="middle" font-family="monospace">API Gateway</text>
                              <text x="230" y="108" fill="#58A6FF" font-size="7" text-anchor="middle" font-family="monospace">SSL/TLS Active</text>

                              {/* Database Node */}
                              <rect x="330" y="80" width="70" height="40" rx="5" fill="#161B22" stroke="#3FB950" stroke-width="1" />
                              <text x="365" y="104" fill="#F0F6FC" font-size="8" text-anchor="middle" font-family="monospace">Database</text>

                              {/* Storage Node */}
                              <rect x="190" y="170" width="80" height="40" rx="5" fill="#161B22" stroke="#D29922" stroke-width="1.5" />
                              <text x="230" y="190" fill="#F0F6FC" font-size="8" text-anchor="middle" font-family="monospace">Cloud Storage</text>
                              <text x="230" y="202" fill="#D29922" font-size="7" text-anchor="middle" font-family="monospace">AUTH MISCONFIG</text>
                            </svg>
                          </div>
                        </div>

                        {/* Security Risk Node Graph */}
                        <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                          <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Interactive Risk Dependency Graph</h3>
                          <div className="h-64 flex items-center justify-center bg-background/50 border border-border/40 rounded-lg p-2 overflow-hidden">
                            <svg viewBox="0 0 400 240" className="w-full h-full max-w-sm">
                              {/* Main Repo Node */}
                              <circle cx="200" cy="120" r="26" fill="#161B22" stroke="#2F81F7" stroke-width="1.5" />
                              <text x="200" y="123" fill="#F0F6FC" font-size="8" font-weight="bold" text-anchor="middle" font-family="monospace">Repository</text>

                              {/* Dependency links */}
                              <line x1="200" y1="94" x2="200" y2="40" stroke="#F85149" stroke-width="1" stroke-dasharray="2 2" />
                              <line x1="174" y1="120" x2="80" y2="120" stroke="#3FB950" stroke-width="1" />
                              <line x1="226" y1="120" x2="320" y2="120" stroke="#D29922" stroke-width="1" />

                              {/* Vulnerable File Node 1 */}
                              <circle cx="200" cy="40" r="15" fill="#161B22" stroke="#F85149" stroke-width="1.5" />
                              <text x="200" y="43" fill="#F85149" font-size="8" font-weight="bold" text-anchor="middle" font-family="monospace">SQLi</text>

                              {/* File Node 2 */}
                              <circle cx="80" cy="120" r="15" fill="#161B22" stroke="#3FB950" stroke-width="1.5" />
                              <text x="80" y="123" fill="#3FB950" font-size="8" text-anchor="middle" font-family="monospace">Safe</text>

                              {/* File Node 3 */}
                              <circle cx="320" cy="120" r="15" fill="#161B22" stroke="#D29922" stroke-width="1.5" />
                              <text x="320" y="123" fill="#D29922" font-size="8" text-anchor="middle" font-family="monospace">Secrets</text>
                            </svg>
                          </div>
                        </div>

                      </div>

                      {/* Real-time Ticker & Threat Monitoring Feed */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4 font-mono text-xs">
                        <div className="flex justify-between items-center border-b border-border/30 pb-2">
                          <h3 className="text-xs font-bold text-text-primary uppercase">Real-Time Security & CVE Event Stream</h3>
                          <span className="h-2 w-2 rounded-full bg-success animate-ping" />
                        </div>
                        <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin">
                          {[
                            { time: "Just now", type: "INFO", text: "Pull request audit completed on branch: patch-security-checks. Zero secrets found." },
                            { time: "5 mins ago", type: "WARN", text: "NVD Registry released new security vulnerability definitions for Axios client configs." },
                            { time: "1 hr ago", type: "INFO", text: "Repository health audit check finished. Current grade calculated: 64/100." },
                            { time: "3 hrs ago", type: "ALERT", text: "Dependency audit flagged 2 security advisory warning logs in package.json." }
                          ].map((evt, idx) => (
                            <div key={idx} className="flex gap-4 p-2 bg-background/40 border border-border/40 rounded items-start">
                              <span className="text-text-secondary text-[10px] w-20 flex-shrink-0">{evt.time}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                                evt.type === "INFO" ? "bg-success/15 text-success border border-success/30" : evt.type === "WARN" ? "bg-warning/15 text-warning border border-warning/30" : "bg-danger/15 text-danger border border-danger/30"
                              }`}>{evt.type}</span>
                              <span className="text-text-primary text-[11px] font-sans">{evt.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: VULNERABILITIES LIST */}
                  {activeSecTab === "sec-vulnerabilities" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
                      
                      {/* Left: list of vulnerabilities */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                          <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/30 pb-2">Detected Code Vulnerabilities</h3>
                          <div className="space-y-3">
                            {securityReport && securityReport.issues.length > 0 ? (
                              securityReport.issues.map((iss, i) => (
                                <button
                                  key={i}
                                  onClick={() => setActiveVulnerability(iss)}
                                  className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                    activeVulnerability?.id === iss.id
                                      ? "bg-danger/10 border-danger/40 text-white font-bold"
                                      : "bg-surface/30 border-border/60 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40"
                                  }`}
                                >
                                  <div className="flex justify-between items-center text-[10px] mb-1.5">
                                    <span className="text-text-secondary">{iss.file}:{iss.line}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                                      iss.severity === "Critical" || iss.severity === "High" ? "bg-danger/10 border-danger/30 text-danger" : "bg-warning/10 border-warning/30 text-warning"
                                    }`}>{iss.severity}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-text-primary leading-normal">{iss.title}</h4>
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-12 text-text-secondary/40 italic">
                                No security vulnerabilities found. Run a security scan!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Selected Vulnerability Detail & Fix */}
                      <div className="lg:col-span-6">
                        {activeVulnerability ? (
                          <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-6">
                            <div className="border-b border-border/40 pb-4 flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-text-secondary block font-bold">VULNERABILITY REVIEW</span>
                                <h3 className="text-sm font-bold text-text-primary mt-1 font-space-grotesk">{activeVulnerability.title}</h3>
                                {activeVulnerability.cve && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-danger/10 text-danger rounded border border-danger/30 font-bold block w-fit mt-1.5">{activeVulnerability.cve}</span>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold border uppercase ${
                                activeVulnerability.severity === "Critical" || activeVulnerability.severity === "High" ? "bg-danger/10 border-danger/30 text-danger" : "bg-warning/10 border-warning/30 text-warning"
                              }`}>{activeVulnerability.severity}</span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-text-secondary block uppercase">Description</span>
                              <p className="text-text-secondary text-[11px] leading-relaxed font-sans">{activeVulnerability.description}</p>
                            </div>

                            {activeVulnerability.snippet && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-text-secondary block uppercase">Vulnerable Snippet</span>
                                <pre className="p-3 bg-[#0D1117] rounded border border-border/60 text-[10px] text-danger overflow-x-auto whitespace-pre leading-relaxed">{activeVulnerability.snippet}</pre>
                              </div>
                            )}

                            <div className="space-y-1.5 border-t border-border/30 pt-4">
                              <span className="text-[10px] text-accent font-bold block uppercase">AI Remediation Fix</span>
                              <p className="text-text-secondary text-[11px] leading-relaxed font-sans">{activeVulnerability.recommendation}</p>
                            </div>

                            {activeVulnerability.patchDiff && (
                              <div className="space-y-2 border-t border-border/30 pt-4">
                                <span className="text-[10px] text-success font-bold block uppercase">Recommended Patch Diff</span>
                                <pre className="p-3 bg-[#0D1117] rounded border border-border/60 text-[10px] text-success overflow-x-auto whitespace-pre leading-relaxed">{activeVulnerability.patchDiff}</pre>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="rounded-xl border border-border bg-[#161B22]/10 p-12 text-center text-text-secondary/40 py-20 font-mono">
                            Select a vulnerability on the left to inspect logs.
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 3: SECRETS LEAKAGE */}
                  {activeSecTab === "sec-secrets" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Exposed Credentials & Tokens</h3>
                      <div className="space-y-3">
                        {securityReport && securityReport.issues.filter(i => i.type === "Secret").length > 0 ? (
                          securityReport.issues.filter(i => i.type === "Secret").map((iss, i) => (
                            <div key={i} className="border border-danger/30 bg-danger/5 rounded-xl p-4 space-y-2.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-[#F85149]">{iss.title}</span>
                                <span className="text-text-secondary">{iss.file}:{iss.line}</span>
                              </div>
                              {iss.snippet && (
                                <pre className="p-2 bg-background border border-border rounded text-[10px] text-[#F85149] overflow-x-auto font-mono">{iss.snippet}</pre>
                              )}
                              <p className="text-text-secondary leading-normal text-[11px] font-sans">{iss.recommendation}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-success/80 font-bold flex flex-col items-center gap-2">
                            <ShieldCheck size={28} />
                            <span>No leaked secrets or private keys detected in scanned repository buffers!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: DEPENDENCY SECURITY */}
                  {activeSecTab === "sec-dependency" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Vulnerable Packages & CVE Audits</h3>
                      <div className="space-y-3">
                        {securityReport && securityReport.issues.filter(i => i.type === "Dependency Risk").length > 0 ? (
                          securityReport.issues.filter(i => i.type === "Dependency Risk").map((iss, i) => (
                            <div key={i} className="border border-border bg-[#0D1117] rounded-xl p-4 space-y-2">
                              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                                <span className="font-bold text-text-primary">{iss.title}</span>
                                <span className="px-1.5 py-0.5 rounded bg-danger/10 border border-danger/30 text-danger text-[9px] font-bold">{iss.cve}</span>
                              </div>
                              <p className="text-text-secondary text-[11px] font-sans">{iss.description}</p>
                              <p className="text-accent text-[11px] pt-1.5 border-t border-border/30"><span className="font-bold text-text-primary">Remediation:</span> {iss.recommendation}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-success font-bold flex flex-col items-center gap-2">
                            <ShieldCheck size={28} />
                            <span>All dependencies are safe. No outdated CVEs detected!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: STATIC CODE SECURITY */}
                  {activeSecTab === "sec-code" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Static Analysis Vulnerabilities (SAST)</h3>
                      <div className="space-y-4">
                        {securityReport && securityReport.issues.filter(i => i.type === "Vulnerability").length > 0 ? (
                          securityReport.issues.filter(i => i.type === "Vulnerability").map((iss, i) => (
                            <div key={i} className="p-4 rounded-xl border border-border bg-[#0D1117] space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-text-primary">{iss.title}</span>
                                <span className="text-text-secondary">{iss.file}:{iss.line}</span>
                              </div>
                              <p className="text-text-secondary font-sans">{iss.description}</p>
                              {iss.snippet && (
                                <pre className="p-2 bg-background border border-border/60 text-danger rounded overflow-x-auto text-[10px]">{iss.snippet}</pre>
                              )}
                              <p className="text-accent text-[10px] pt-2 border-t border-border/30"><span className="font-bold text-text-primary">Resolution:</span> {iss.recommendation}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-text-secondary/40 italic">
                            No static vulnerability warnings matches scanned.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: CONTAINER SECURITY */}
                  {activeSecTab === "sec-container" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Dockerfile Configuration Audit</h3>
                      <div className="space-y-3">
                        {securityReport && securityReport.issues.filter(i => i.file.toLowerCase().includes("dockerfile")).length > 0 ? (
                          securityReport.issues.filter(i => i.file.toLowerCase().includes("dockerfile")).map((iss, i) => (
                            <div key={i} className="border border-border bg-[#0D1117] rounded-xl p-4 space-y-2">
                              <span className="font-bold text-[#D29922] block">{iss.title}</span>
                              <p className="text-text-secondary font-sans leading-relaxed">{iss.description}</p>
                              <p className="text-accent pt-1.5 border-t border-border/30"><span className="font-bold text-text-primary">Remediation:</span> {iss.recommendation}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-success font-bold flex flex-col items-center gap-2">
                            <ShieldCheck size={28} />
                            <span>Dockerfile checks passed. Non-root executions verified.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: LICENSE CHECKER */}
                  {activeSecTab === "sec-license" && (
                    <div className="space-y-6 font-mono text-xs">
                      
                      {/* Copyleft Warning panel */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-3">
                        <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Commercial Risk and Conflicts</h3>
                        <div className="flex justify-between items-center py-2">
                          <span>Repository License</span>
                          <span className="font-bold text-success text-sm bg-success/15 border border-success/30 px-2 py-0.5 rounded">{securityReport?.licenseInfo.repoLicense || "MIT"}</span>
                        </div>
                        
                        {securityReport?.licenseInfo.gplDetected ? (
                          <div className="p-3 bg-danger/5 border border-danger/30 rounded-lg text-[11px] text-text-secondary leading-normal flex gap-2">
                            <span className="text-danger font-bold text-sm">⚠️</span>
                            <div>
                              <span className="font-bold text-danger uppercase block mb-0.5">Copyleft Violation Risk</span>
                              {securityReport.licenseInfo.conflicts[0]}
                            </div>
                          </div>
                        ) : (
                          <p className="text-success font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>No copyleft or dual license conflicts identified in dependency imports!</span>
                          </p>
                        )}
                      </div>

                      {/* Dependency Licenses List */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                        <h4 className="font-bold text-text-primary uppercase">Dependency Licenses log</h4>
                        <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                          {securityReport?.licenseInfo.list.map((l, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-background border border-border/50 rounded">
                              <span className="font-bold text-text-primary">{l.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-text-secondary text-[10px]">{l.type}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${l.license.startsWith("GPL") ? "bg-danger/10 border-danger/30 text-danger" : "bg-background border-border/80 text-text-secondary"}`}>{l.license}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 8: COMPLIANCE STATUS */}
                  {activeSecTab === "sec-compliance" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                      {[
                        { title: "OWASP Top 10", status: securityReport?.complianceStatus.owasp, desc: "Audits sql injections, script leaks, cross site scripting, and authentication bypasses." },
                        { title: "SOC 2 Type II", status: securityReport?.complianceStatus.soc2, desc: "Verifies secure user authentications, audit logs, and encrypted datastores." },
                        { title: "HIPAA Data Security", status: securityReport?.complianceStatus.hipaa, desc: "Enforces strict encryption on transport networks and private datasets." }
                      ].map(card => (
                        <div key={card.title} className="border border-border rounded-xl bg-[#161B22]/30 p-5 flex flex-col justify-between h-44">
                          <div className="space-y-1">
                            <span className="font-bold text-text-primary block">{card.title}</span>
                            <p className="text-[10px] text-text-secondary leading-normal font-sans mt-2">{card.desc}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-center text-[10px] font-bold border uppercase ${card.status === "Passed" ? "bg-success/15 border-success/30 text-success" : card.status === "Partial" ? "bg-warning/15 border-warning/30 text-warning" : "bg-danger/15 border-danger/30 text-danger"}`}>{card.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 9: SECURITY TIMELINE */}
                  {activeSecTab === "sec-timeline" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Vulnerability Creation & Resolution logs</h3>
                      <div className="relative border-l border-border/60 ml-3 space-y-5 pl-4 pb-4">
                        {securityReport?.timeline.map((event, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-5.5 top-1.5 h-2.5 w-2.5 rounded-full border bg-background border-border" />
                            <span className="text-[10px] text-text-secondary block">{event.date}</span>
                            <span className="font-bold text-text-primary block mt-0.5">{event.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 10: REMEDIATIONS & AUTO-FIX */}
                  {activeSecTab === "sec-recommendations" && (
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Prioritized Security Fix Recommendations</h3>
                      <div className="space-y-4">
                        {securityReport && securityReport.issues.length > 0 ? (
                          securityReport.issues.map((iss, i) => (
                            <div key={i} className="border border-border/60 bg-[#0D1117] rounded-xl p-4 space-y-3">
                              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                                <span className="font-bold text-text-primary">{iss.title}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                  iss.severity === "Critical" || iss.severity === "High" ? "bg-danger/10 border-danger/30 text-danger" : "bg-warning/10 border-warning/30 text-warning"
                                }`}>Severity: {iss.severity}</span>
                              </div>
                              <p className="text-text-secondary text-[11px] font-sans leading-relaxed">{iss.description}</p>
                              
                              <div className="p-3 bg-surface/50 border border-border rounded text-[11px] leading-relaxed font-sans text-text-secondary">
                                <span className="font-bold text-text-primary block mb-0.5">Resolution Recommendation:</span>
                                {iss.recommendation}
                              </div>

                              {iss.patchDiff && (
                                <div className="space-y-2">
                                  <span className="text-[10px] text-success font-bold block uppercase">Remediation Patch Diff</span>
                                  <pre className="p-3 bg-background border border-border/60 rounded text-[10px] text-success overflow-x-auto whitespace-pre leading-relaxed">{iss.patchDiff}</pre>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-success font-bold flex flex-col items-center gap-2">
                            <ShieldCheck size={28} />
                            <span>No Remediations pending. Codebase meets security metrics!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

            {/* RETRO SCANNING TERMINAL OVERLAY */}
            {isScanningSecurity && (
              <div className="absolute inset-0 bg-[#0D1117]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 select-none font-mono">
                <div className="w-full max-w-xl bg-background rounded-lg border border-danger/40 shadow-xl overflow-hidden flex flex-col">
                  {/* CLI Header bar */}
                  <div className="px-4 py-2 border-b border-border/60 bg-surface flex justify-between items-center">
                    <span className="text-xs text-[#F85149] font-bold flex items-center gap-1.5">
                      <Terminal size={14} className="animate-pulse" />
                      <span>Security Analysis Scanner CLI</span>
                    </span>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-danger/60" />
                      <span className="h-2 w-2 rounded-full bg-warning/60" />
                      <span className="h-2 w-2 rounded-full bg-success/60" />
                    </div>
                  </div>

                  {/* Streaming scan logs */}
                  <div className="p-4 h-64 overflow-y-auto font-mono text-[10px] text-success leading-relaxed space-y-1 scrollbar-thin bg-black">
                    {terminalLogs.map((log, idx) => (
                      <p key={idx} className={log.includes("[WARN]") ? "text-warning" : log.includes("[INFO]") ? "text-success" : "text-text-primary"}>
                        {log}
                      </p>
                    ))}
                    <div className="h-2" />
                  </div>
                </div>
              </div>
            )}

          </div>

          <Footer />
        </main>

        {/* RIGHT COLLAPSIBLE AI CHAT DRAWER */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 border-l border-border bg-[#0D1117] h-full absolute right-0 top-0 z-50 flex flex-col justify-between"
            >
              
              {/* Header */}
              <div className="p-4 border-b border-border flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className={workspaceMode === "security" ? "text-danger" : "text-accent"} />
                  <span className="text-xs font-bold font-mono text-text-primary">AI {workspaceMode === "security" ? "SECURITY" : "DEVELOPER"} ASSISTANT</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-text-secondary hover:text-text-primary font-bold cursor-pointer text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {/* Chat Message Logs */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[9px] text-text-secondary mb-1 font-mono">
                      {msg.sender === "user" ? "You" : workspaceMode === "security" ? "Senior Security Architect" : "Senior AI Engineer"}
                    </span>
                    <div
                      className={`rounded-xl p-3 max-w-[90%] text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-accent text-white font-medium"
                          : "bg-surface-secondary/40 border border-border text-text-primary font-normal"
                      }`}
                    >
                      <div className="prose prose-invert prose-xs leading-relaxed whitespace-pre-line space-y-2">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {chatTyping && (
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-text-secondary mb-1 font-mono">Senior Assistant</span>
                    <div className="rounded-xl p-3 bg-surface-secondary/40 border border-border text-text-secondary text-xs flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions chips */}
              <div className="p-3 border-t border-border/40 bg-surface/10 space-y-1.5 font-mono text-[9px] select-none">
                <span className="text-text-secondary uppercase font-bold block mb-1">Suggested prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {workspaceMode === "security" ? (
                    [
                      "Explain this vulnerability",
                      "Generate patch",
                      "Suggest best practices"
                    ].map(promptText => (
                      <button
                        key={promptText}
                        onClick={() => setChatInput(promptText)}
                        className="px-2 py-1 rounded bg-[#161B22]/50 border border-border hover:bg-[#21262D] text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                      >
                        {promptText}
                      </button>
                    ))
                  ) : (
                    [
                      "Explain this repository",
                      "Explain this function",
                      "Optimize this file",
                      "Generate better implementation"
                    ].map(promptText => (
                      <button
                        key={promptText}
                        onClick={() => setChatInput(promptText)}
                        className="px-2 py-1 rounded bg-[#161B22]/50 border border-border hover:bg-[#21262D] text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                      >
                        {promptText}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleChatSubmit} className="p-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={workspaceMode === "security" ? "Ask security architect..." : "Ask AI developer..."}
                  className="flex-1 bg-[#0D1117] border border-border rounded-lg px-3 py-2 text-xs font-semibold text-[#F0F6FC] placeholder:text-[#8B949E]/50 focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatTyping}
                  className="p-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:bg-accent/40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button for Chat Drawer when closed */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className={`fixed bottom-6 right-6 h-12 w-12 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all z-40 cursor-pointer animate-pulse ${
              workspaceMode === "security"
                ? "bg-danger hover:bg-danger/90 shadow-danger/25"
                : "bg-accent hover:bg-accent/90 shadow-accent/25"
            }`}
            title={workspaceMode === "security" ? "Ask Security AI" : "Ask Developer AI"}
          >
            <Sparkles size={18} />
          </button>
        )}

      </div>
    </div>
  );
}
