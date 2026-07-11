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
  ZAxis
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
  CornerDownRight
} from "lucide-react";

interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
}

type TabId =
  | "code-review"
  | "analysis"
  | "pr-review"
  | "architecture"
  | "tech-debt"
  | "ai-suggestions"
  | "code-history";

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

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState<TabId>("code-review");

  // File explorer states
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [loadingFileContent, setLoadingFileContent] = useState(false);

  // Dynamic Static Analysis State
  const [fileAnalysisReport, setFileAnalysisReport] = useState<FileReviewReport | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<FunctionDetail | null>(null);

  // Pull Request Review States
  const [pullRequests, setPullRequests] = useState<PullRequestDetail[]>([]);
  const [selectedPR, setSelectedPR] = useState<PullRequestDetail | null>(null);
  const [prAnalyzing, setPrAnalyzing] = useState(false);

  // AI Chat Drawer States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "assistant"; text: string }[]>([
    { sender: "assistant", text: "Hello! I am your DevTrack Senior AI Code Reviewer. I can explain files, refactor loops, generate unit tests, or audit your architectural layers. Select a file in the tree to begin!" }
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
        content = `{\n  "name": "${repoName}",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "next": "^16.0.0"\n  }\n}`;
      } else if (filePath.endsWith("utils.ts")) {
        content = `// Telemetry calculations\nexport function calculateTelemetry(data: any[]) {\n  console.log("Processing telemetry...");\n  if (!data) return null;\n  \n  let score = 0;\n  for(let i=0; i<data.length; i++) {\n    for(let j=0; j<data[i].items.length; j++) {\n      const val = data[i].items[j];\n      if(val > 10) {\n        score += val * 1.5;\n      }\n    }\n  }\n  return score;\n}\n\nexport function formatValue(val: number) {\n  return \`Val: \${val}\`;\n}`;
      } else {
        content = `// Mocked code file preview\nexport default function Module() {\n  const message = "Loaded ${filePath}";\n  eval("console.log(message)");\n  return <div>{message}</div>;\n}`;
      }
      setSelectedFileContent(content);
      // Run Dynamic Static Analysis
      const analysis = AICodeReviewEngine.analyzeFile(filePath, content);
      setFileAnalysisReport(analysis);
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
    await new Promise((r) => setTimeout(r, 1200));
    setPrAnalyzing(false);
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

    const activeFile = selectedFilePath && selectedFileContent ? { path: selectedFilePath, content: selectedFileContent } : undefined;
    const response = AICodeReviewEngine.getChatResponse(chatMessages, userPrompt, activeFile, repoName);
    
    setChatMessages(prev => [...prev, { sender: "assistant", text: response }]);
    setChatTyping(false);
  };

  // Export Trigger
  const triggerExport = (type: "pdf" | "markdown" | "json" | "comment" | "pr") => {
    setExportDropdownOpen(false);
    
    if (type === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ intelligence, fileAnalysisReport, technicalDebt: AICodeReviewEngine.getTechnicalDebt(intelligence?.checklist.map(c => c.name) || []) }, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${repoName}-ai-review.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === "markdown" || type === "comment" || type === "pr") {
      let md = `# AI Code Review Summary - ${repoName}\n\n`;
      md += `**Repository:** ${targetOwner}/${repoName}\n`;
      md += `**Quality Score:** ${intelligence?.healthScore}/100\n`;
      md += `**Maturity Level:** ${intelligence?.aiReview.strengths[0] || "Standard Setup"}\n\n`;
      md += `## Key Findings\n`;
      intelligence?.aiReview.weaknesses.forEach(w => {
        md += `- [Needs Improvement] ${w}\n`;
      });
      md += `\n## Suggestions\n`;
      intelligence?.aiReview.suggestedImprovements.forEach(s => {
        md += `- [Suggested] ${s}\n`;
      });

      const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${repoName}-ai-review.md`);
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

  const handleLogout = async () => {
    await logOutUser();
    setCurrentUser(null);
    router.push("/");
  };

  const handleLoginSuccess = (user: DevTrackUser) => {
    setCurrentUser(user);
    router.push(`/dashboard?user=${user.username}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-secondary pt-24">
          <Loader2 className="animate-spin h-10 w-10 text-accent mb-4" />
          <span className="text-sm font-semibold tracking-wide font-mono">Running Codebase Security & Health Indexer...</span>
        </div>
      </div>
    );
  }

  if (error || !intelligence) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto pt-24">
          <div className="h-12 w-12 rounded-lg bg-danger/10 text-danger flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold font-space-grotesk text-text-primary">Repository Telemetry Failed</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">{error || "Could not retrieve repository parameters."}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { repository, healthScore, healthBreakdown, documentationAnalysis, securityAnalysis, activityAnalysis, codebaseInsights, checklist, timeline } = intelligence;

  // Derive structural paths for static checks
  const treePaths = checklist.map(c => c.name);
  const techDebt: TechnicalDebtReport = AICodeReviewEngine.getTechnicalDebt(treePaths);
  const archReport: ArchitectureReport = AICodeReviewEngine.getArchitectureReview(treePaths);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/30 selection:text-text-primary text-foreground font-sans">
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
                <span className="text-[10px] font-bold text-[#2F81F7] uppercase tracking-wider font-mono">CODE Review CONSOLE</span>
              </div>
              <h2 className="text-sm font-black font-space-grotesk text-text-primary truncate" title={repository.name}>
                {repository.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-text-secondary">
                <GitBranch size={10} />
                <span>{repository.default_branch || "main"}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{repository.private ? "Private" : "Public"}</span>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono block px-2 mb-2">Developer</span>
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
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabId)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#1F6FEB]/15 border-[#58A6FF]/40 text-white font-bold shadow-md shadow-[#1F6FEB]/5"
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
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/60 bg-surface/10 space-y-2">
            <button
              onClick={() => setChatOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-xs font-bold text-white hover:bg-accent/90 transition-all font-mono shadow-md shadow-accent/10 cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>Ask AI Chat</span>
            </button>
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
                  <button onClick={() => triggerExport("comment")} className="w-full text-left px-3 py-2 rounded hover:bg-surface-secondary text-text-primary cursor-pointer">GitHub Comment format</button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* WORKSPACE MAIN VIEW AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0D1117]">
          
          {/* Header Dashboard Metrics */}
          <header className="border-b border-border/50 bg-[#161B22]/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0 select-none">
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
                <span>EST. TECH DEBT</span>
                <span className="font-bold text-text-primary block">{techDebt.estimatedDebtHours} hours</span>
              </div>
            </div>
          </header>

          {/* Sub Tab Panel Workspace Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* SUB TAB 1: AI CODE REVIEW */}
                {activeTab === "code-review" && (
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

                        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border min-h-[400px]">
                          {/* File Content Preview / Code Panel */}
                          <div className="md:col-span-8 p-4 flex flex-col justify-between">
                            <div className="flex-1 flex flex-col justify-between min-h-[350px]">
                              <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-3 font-mono text-xs">
                                <span className="font-bold text-text-primary truncate">
                                  {selectedFilePath ? selectedFilePath : "No file selected"}
                                </span>
                                {selectedFilePath && (
                                  <span className="text-[9px] text-text-secondary bg-[#161B22] border border-border px-2 py-0.5 rounded uppercase">
                                    {selectedFilePath.split(".").pop()}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 overflow-auto bg-background/50 rounded border border-border/40 p-4 font-mono text-[11px] leading-relaxed max-h-[360px] scrollbar-thin">
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
                          <div className="md:col-span-4 p-4 space-y-4 font-mono text-xs overflow-y-auto max-h-[450px] scrollbar-thin">
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
                                    <span className="text-[9px] text-text-secondary">Readability Index</span>
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

                                {fileAnalysisReport.functions.length > 0 && (
                                  <div className="space-y-2">
                                    <span className="font-bold text-text-primary block border-b border-border/20 pb-1">FUNCTIONS ({fileAnalysisReport.functions.length})</span>
                                    <div className="space-y-1">
                                      {fileAnalysisReport.functions.map(fn => (
                                        <button
                                          key={fn.name}
                                          onClick={() => setSelectedFunction(fn)}
                                          className={`w-full flex items-center justify-between p-2 rounded text-[11px] border text-left cursor-pointer transition-colors ${
                                            selectedFunction?.name === fn.name
                                              ? "bg-[#1F6FEB]/15 border-[#58A6FF]/40 text-white font-bold"
                                              : "bg-surface/30 border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40"
                                          }`}
                                        >
                                          <span>{fn.name}()</span>
                                          <span className={`px-1 rounded text-[8px] font-bold border uppercase ${
                                            fn.complexity === "High" ? "bg-danger/10 border-danger/30 text-danger" : fn.complexity === "Medium" ? "bg-warning/10 border-warning/30 text-warning" : "bg-success/10 border-success/30 text-success"
                                          }`}>
                                            CC {fn.cyclomaticComplexity}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-12 text-text-secondary/30 italic">
                                No active file analysis.
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Function details popup modal / panel */}
                      {selectedFunction && (
                        <div className="rounded-xl border border-border bg-[#161B22]/60 p-5 space-y-4 font-mono text-xs">
                          <div className="flex justify-between items-center border-b border-border/40 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-accent" />
                              <h4 className="text-sm font-bold text-text-primary">{selectedFunction.name}() scope Review</h4>
                            </div>
                            <button
                              onClick={() => setSelectedFunction(null)}
                              className="text-text-secondary hover:text-text-primary cursor-pointer text-xs"
                            >
                              ✕ Close
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div className="p-2.5 bg-background border border-border/50 rounded-lg">
                              <span className="text-[9px] text-text-secondary block">Complexity</span>
                              <span className={`font-bold mt-1 block uppercase ${selectedFunction.complexity === "High" ? "text-danger" : selectedFunction.complexity === "Medium" ? "text-warning" : "text-success"}`}>{selectedFunction.complexity}</span>
                            </div>
                            <div className="p-2.5 bg-background border border-border/50 rounded-lg">
                              <span className="text-[9px] text-text-secondary block">Cyclomatic Index</span>
                              <span className="font-bold text-text-primary mt-1 block">{selectedFunction.cyclomaticComplexity}</span>
                            </div>
                            <div className="p-2.5 bg-background border border-border/50 rounded-lg">
                              <span className="text-[9px] text-text-secondary block">Est. Runtime</span>
                              <span className="font-bold text-text-primary mt-1 block">{selectedFunction.estimatedRuntime}</span>
                            </div>
                            <div className="p-2.5 bg-background border border-border/50 rounded-lg">
                              <span className="text-[9px] text-text-secondary block">Est. Memory</span>
                              <span className="font-bold text-text-primary mt-1 block">{selectedFunction.memoryUsage}</span>
                            </div>
                          </div>

                          <div className="space-y-3 leading-relaxed">
                            <div className="p-3 rounded-lg bg-surface/50 border border-border/30">
                              <span className="text-[10px] text-accent font-bold uppercase block mb-1">AI Explanation</span>
                              <p className="text-text-secondary text-[11px]">{selectedFunction.aiExplanation}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-surface/50 border border-border/30">
                              <span className="text-[10px] text-[#A97BFF] font-bold uppercase block mb-1">Suggested Refactoring</span>
                              <p className="text-text-secondary text-[11px] whitespace-pre-line">{selectedFunction.suggestedRefactoring}</p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Right Column: Mini File Tree Explorer */}
                    <div className="lg:col-span-4 rounded-xl border border-border bg-[#161B22]/30 p-4 max-h-[500px] overflow-y-auto scrollbar-thin select-none">
                      <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-3 font-mono text-xs">
                        <span className="text-[10px] text-text-secondary uppercase font-bold">Codebase Tree Explorer</span>
                        <span className="text-[9px] text-accent font-bold">Files</span>
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

                {/* SUB TAB 2: REPOSITORY ANALYSIS */}
                {activeTab === "analysis" && (
                  <div className="space-y-6">
                    
                    {/* Upper Metadata panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Language distribution list */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4 font-mono text-xs">
                        <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Ecosystem Distribution</h3>
                        <div className="space-y-2">
                          {codebaseInsights.languageDistribution.length > 0 ? (
                            codebaseInsights.languageDistribution.map(l => (
                              <div key={l.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                                  <span className="font-semibold text-text-primary">{l.name}</span>
                                </div>
                                <span className="text-text-secondary">{l.percentage}% ({formatBytes(l.bytes)})</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-text-secondary/40 italic">Unavailable</div>
                          )}
                        </div>
                      </div>

                      {/* Scanned configurations */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4 font-mono text-xs">
                        <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Configurations Scanned</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                          {codebaseInsights.configFiles.map(file => (
                            <div key={file} className="flex items-center gap-2 p-2 rounded bg-background border border-border/50">
                              <FileCode size={13} className="text-accent" />
                              <span className="text-text-primary font-bold">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Repos checklist */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4 font-mono text-xs">
                        <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Repository Quality Checklist</h3>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto scrollbar-thin">
                          {checklist.slice(0, 6).map(item => (
                            <div key={item.name} className="flex items-center gap-2">
                              {item.completed ? (
                                <CheckCircle2 size={14} className="text-success shrink-0" />
                              ) : (
                                <XCircle size={14} className="text-danger shrink-0" />
                              )}
                              <span className={item.completed ? "text-text-primary" : "text-text-secondary/40 line-through"}>{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Interactive Visualizations Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Interactive File Quality Chart */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                        <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">File Quality vs Size Distribution</h3>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                              <XAxis type="number" dataKey="size" name="Size" unit="KB" stroke="#8B949E" fontSize={9} />
                              <YAxis type="number" dataKey="quality" name="Quality Score" unit="%" stroke="#8B949E" fontSize={9} />
                              <ZAxis type="category" dataKey="name" name="File" />
                              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                              <Scatter name="Files" data={[
                                { size: 12, quality: 95, name: "utils.ts" },
                                { size: 84, quality: 78, name: "OverviewTab.tsx" },
                                { size: 4, quality: 98, name: "types.ts" },
                                { size: 45, quality: 82, name: "DashboardContent.tsx" },
                                { size: 128, quality: 60, name: "page.tsx" }
                              ]} fill="#2F81F7" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Interactive Complexity Heatmap */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs select-none">
                        <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Codebase Complexity Heatmap</h3>
                        <p className="text-[10px] text-text-secondary">Color blocks show files weighted by cyclomatic index.</p>
                        <div className="flex flex-wrap gap-2.5 pt-2">
                          {[
                            { name: "src/app/page.tsx", complexity: "High", color: "bg-[#F85149]" },
                            { name: "src/components/layout/Navbar.tsx", complexity: "Low", color: "bg-[#3FB950]" },
                            { name: "src/services/ai.ts", complexity: "Medium", color: "bg-[#D29922]" },
                            { name: "src/hooks/useAnalytics.ts", complexity: "Medium", color: "bg-[#D29922]" },
                            { name: "src/lib/firebase.ts", complexity: "Low", color: "bg-[#3FB950]" },
                            { name: "src/types/index.ts", complexity: "Low", color: "bg-[#3FB950]" }
                          ].map(file => (
                            <div
                              key={file.name}
                              className={`h-10 w-10 rounded-lg flex items-center justify-center text-[10px] font-bold text-white relative group cursor-pointer ${file.color} hover:scale-105 transition-transform`}
                              title={`${file.name}: ${file.complexity}`}
                            >
                              <span>{file.complexity.charAt(0)}</span>
                              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 rounded bg-background border border-border px-2 py-1 text-[8px] whitespace-nowrap hidden group-hover:block z-50">
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* SUB TAB 3: PULL REQUEST REVIEWS */}
                {activeTab === "pr-review" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
                    
                    {/* Left Column: PR Lists */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/30 pb-2">Active Pull Requests</h3>
                        <div className="space-y-3">
                          {pullRequests.map(pr => (
                            <button
                              key={pr.id}
                              onClick={() => handlePRAnalysis(pr)}
                              className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                selectedPR?.id === pr.id
                                  ? "bg-[#1F6FEB]/15 border-[#58A6FF]/40 text-white font-bold"
                                  : "bg-surface/30 border-border/60 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/40"
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px] mb-1.5">
                                <span className="text-accent font-bold">PR #{pr.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                                  pr.review.status === "Approved" ? "bg-success/15 border-success/30 text-success" : "bg-warning/15 border-warning/30 text-warning"
                                }`}>
                                  {pr.review.status}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-text-primary line-clamp-2 leading-relaxed">{pr.title}</h4>
                              <div className="flex justify-between items-center text-[9px] text-text-secondary mt-2 border-t border-border/30 pt-1.5">
                                <span>By: @{pr.author}</span>
                                <span className="text-[#3FB950] font-bold">+{pr.additions} / -{pr.deletions} lines</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: AI PR Review */}
                    <div className="lg:col-span-8 space-y-6">
                      {prAnalyzing ? (
                        <div className="rounded-xl border border-border bg-[#161B22]/30 p-12 text-center text-text-secondary py-24">
                          <Loader2 className="animate-spin h-8 w-8 text-accent mx-auto mb-4" />
                          <span className="text-sm font-semibold block animate-pulse">Running Code Style, Performance, & Security checks...</span>
                        </div>
                      ) : selectedPR ? (
                        <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-6">
                          
                          {/* Heading */}
                          <div className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <span className="text-[10px] text-text-secondary block font-bold">PULL REQUEST ANALYZED</span>
                              <h3 className="text-sm font-bold text-text-primary mt-1 font-space-grotesk">{selectedPR.title}</h3>
                              <p className="text-[10px] text-text-secondary mt-1">Comparing <span className="text-[#58A6FF]">{selectedPR.branch}</span> into <span className="text-text-primary font-bold">{selectedPR.targetBranch}</span></p>
                            </div>
                            
                            <div className="shrink-0 flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold font-mono ${
                                selectedPR.review.status === "Approved" ? "bg-success/10 border-success/30 text-success" : "bg-warning/10 border-warning/30 text-warning"
                              }`}>
                                <CheckCircle2 size={13} />
                                <span>{selectedPR.review.status}</span>
                              </span>
                            </div>
                          </div>

                          {/* Summary text */}
                          <div className="p-4 rounded-lg bg-surface/50 border border-border/40 leading-relaxed text-text-secondary">
                            <span className="text-[10px] text-accent font-bold uppercase block mb-1">AI Review Summary</span>
                            <p className="text-[11px] leading-relaxed font-sans">{selectedPR.review.summary}</p>
                          </div>

                          {/* Detail Categories */}
                          <div className="space-y-4">
                            <span className="font-bold text-text-primary block border-b border-border/20 pb-1">AI SCANS BREAKDOWN</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(selectedPR.review.categories).map(([key, value]) => (
                                <div key={key} className="border border-border/50 bg-[#0D1117]/40 rounded-xl p-4 space-y-3">
                                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                                    <span className="font-bold text-text-primary capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                                      value.status === "Passed" ? "bg-success/15 border-success/30 text-success" : value.status === "Warnings" || value.status === "Partial" ? "bg-warning/15 border-warning/30 text-warning" : "bg-danger/15 border-danger/30 text-danger"
                                    }`}>{value.status}</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {value.details.map((d, i) => (
                                      <p key={i} className="text-[10px] text-text-secondary flex items-start gap-1.5 leading-normal">
                                        <span className="text-accent">•</span>
                                        <span>{d}</span>
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="rounded-xl border border-border bg-[#161B22]/10 p-12 text-center text-text-secondary/40 py-20">
                          Select a pull request to check its code quality.
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* SUB TAB 4: ARCHITECTURE REVIEW */}
                {activeTab === "architecture" && (
                  <div className="space-y-6 font-mono text-xs">
                    
                    {/* SVG Diagram pane */}
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Codebase Architecture Scaffolding</h3>
                      <div className="h-80 w-full flex items-center justify-center bg-background/50 rounded-lg p-4 border border-border/30 overflow-hidden">
                        <div dangerouslySetInnerHTML={{ __html: archReport.diagramSvg }} className="w-full h-full max-w-2xl" />
                      </div>
                    </div>

                    {/* Architecture detailed analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Folders and Purpose */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                        <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Folder Layout Purposing</h3>
                        <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                          {archReport.folderAnalysis.map(folder => (
                            <div key={folder.path} className="p-3 rounded-lg bg-surface/50 border border-border/40 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-text-primary">{folder.path}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-bold ${folder.status === "Healthy" ? "bg-success/15 border-success/30 text-success" : "bg-warning/15 border-warning/30 text-warning"}`}>{folder.status}</span>
                              </div>
                              <p className="text-[10px] text-text-secondary leading-normal">{folder.purpose}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warnings / Violations */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 space-y-4">
                        <h3 className="text-xs font-bold text-text-primary uppercase border-b border-border/30 pb-2">Module Violations & Circular References</h3>
                        <div className="space-y-3.5 leading-relaxed text-text-secondary text-[11px]">
                          {archReport.circularDependencies.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-bold text-danger uppercase block">Circular Dependencies Detected:</span>
                              {archReport.circularDependencies.map((c, i) => (
                                <p key={i} className="p-2 rounded bg-danger/5 border border-danger/20 text-[10px] text-text-secondary leading-normal flex gap-1.5 items-start">
                                  <span>⚠️</span>
                                  <span>{c}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {archReport.layerViolations.length > 0 && (
                            <div className="space-y-1 border-t border-border/20 pt-3">
                              <span className="font-bold text-warning uppercase block">Layer Violations Detected:</span>
                              {archReport.layerViolations.map((v, i) => (
                                <p key={i} className="p-2 rounded bg-warning/5 border border-warning/20 text-[10px] text-text-secondary leading-normal flex gap-1.5 items-start">
                                  <span>⚠️</span>
                                  <span>{v}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {archReport.unusedModules.length > 0 && (
                            <div className="space-y-1 border-t border-border/20 pt-3">
                              <span className="font-bold text-text-primary uppercase block">Unused Modules:</span>
                              {archReport.unusedModules.map((u, i) => (
                                <p key={i} className="text-[10px] text-text-secondary leading-normal flex gap-1.5 items-start pl-1">
                                  <span>•</span>
                                  <span>{u}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* SUB TAB 5: TECHNICAL DEBT */}
                {activeTab === "tech-debt" && (
                  <div className="space-y-6 font-mono text-xs">
                    
                    {/* Technical Debt Score Header Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: Overall grade */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 text-center flex flex-col items-center justify-center">
                        <span className="text-[10px] text-text-secondary uppercase">Debt Grade</span>
                        <div className="text-5xl font-black text-accent mt-2 font-space-grotesk">{techDebt.debtGrade}</div>
                        <span className="text-[9px] text-text-secondary uppercase tracking-widest mt-1">Maintainability Rating</span>
                      </div>

                      {/* Middle: score */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-secondary uppercase">Code Quality Health</span>
                          <div className="text-2xl font-black text-text-primary font-space-grotesk">{techDebt.debtScore}%</div>
                        </div>
                        <div className="w-full bg-background rounded-full h-2 border border-border mt-3 overflow-hidden">
                          <div className="bg-accent h-2 rounded-full" style={{ width: `${techDebt.debtScore}%` }} />
                        </div>
                      </div>

                      {/* Right: issues summary stats */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-5 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-background border border-border rounded p-2">
                          <span className="text-[9px] text-text-secondary block">Code Smells</span>
                          <span className="font-bold text-text-primary mt-0.5 block">{techDebt.codeSmellsCount}</span>
                        </div>
                        <div className="bg-background border border-border rounded p-2">
                          <span className="text-[9px] text-text-secondary block">Dead Code</span>
                          <span className="font-bold text-text-primary mt-0.5 block">{techDebt.deadCodeCount}</span>
                        </div>
                        <div className="bg-background border border-border rounded p-2">
                          <span className="text-[9px] text-text-secondary block">Unused Imports</span>
                          <span className="font-bold text-text-primary mt-0.5 block">{techDebt.unusedImportsCount}</span>
                        </div>
                        <div className="bg-background border border-border rounded p-2">
                          <span className="text-[9px] text-text-secondary block">Large Fns</span>
                          <span className="font-bold text-text-primary mt-0.5 block">{techDebt.largeFunctionsCount}</span>
                        </div>
                      </div>

                    </div>

                    {/* Technical Debt priorities Roadmap */}
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Technical Debt Mitigation Roadmap</h3>
                      <div className="space-y-4">
                        {techDebt.roadmap.map(road => (
                          <div key={road.priority} className="border border-border/50 bg-[#0D1117]/30 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center border-b border-border/20 pb-1">
                              <span className="font-bold text-text-primary flex items-center gap-2">
                                <span className="h-5 w-5 rounded bg-background border border-border flex items-center justify-center text-[10px] text-accent font-bold">{road.priority}</span>
                                {road.title}
                              </span>
                              <span className="px-2 py-0.5 rounded border border-accent/25 bg-accent/10 text-[9px] font-bold text-accent">Impact: {road.impact}</span>
                            </div>
                            <p className="text-text-secondary text-[11px] leading-relaxed"><span className="font-bold text-text-primary">Condition:</span> {road.why}</p>
                            <p className="text-text-secondary text-[11px] leading-relaxed"><span className="font-bold text-text-primary">Benefit:</span> {road.benefit}</p>
                            <div className="flex justify-between items-center text-[10px] text-text-secondary border-t border-border/20 pt-2 mt-2">
                              <span>Difficulty: <span className="font-bold text-text-primary">{road.difficulty}</span></span>
                              <span>Fix time estimate: <span className="font-bold text-text-primary">{road.estimatedTime}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUB TAB 6: AI SUGGESTIONS */}
                {activeTab === "ai-suggestions" && (
                  <div className="space-y-6 font-mono text-xs">
                    
                    {/* Code Refactoring Suggestion Grid */}
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4">
                      <div className="border-b border-border/20 pb-3 flex justify-between items-center select-none">
                        <div>
                          <h3 className="text-sm font-bold text-text-primary uppercase">Code Suggestions & Refactoring</h3>
                          <p className="text-[10px] text-text-secondary mt-1">Select a file in the explorer or check the typical optimizations below.</p>
                        </div>
                        {selectedFilePath && (
                          <span className="text-[10px] text-accent font-bold bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">{selectedFilePath}</span>
                        )}
                      </div>

                      {/* Display suggestions */}
                      <div className="space-y-6">
                        {AICodeReviewEngine.getSuggestions(selectedFilePath || "utils.ts", selectedFileContent || "").optimizeLoops.map((opt, i) => (
                          <div key={i} className="space-y-3">
                            <div>
                              <span className="font-bold text-text-primary text-[13px]">{opt.description}</span>
                              <span className="text-[10px] text-success block font-bold mt-1">Estimated Savings: {opt.savings}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Before code */}
                              <div className="rounded-lg border border-border/60 overflow-hidden">
                                <span className="block px-3 py-1.5 bg-[#F85149]/10 border-b border-border text-[9px] text-[#F85149] font-bold">Original Code</span>
                                <pre className="p-3 bg-[#0D1117] text-[10px] text-text-secondary overflow-x-auto whitespace-pre leading-relaxed">{opt.codeBefore}</pre>
                              </div>

                              {/* After code */}
                              <div className="rounded-lg border border-border/60 overflow-hidden">
                                <span className="block px-3 py-1.5 bg-[#3FB950]/10 border-b border-border text-[9px] text-[#3FB950] font-bold">Refactored Code</span>
                                <pre className="p-3 bg-[#0D1117] text-[10px] text-text-primary overflow-x-auto whitespace-pre leading-relaxed">{opt.codeAfter}</pre>
                              </div>
                            </div>
                          </div>
                        ))}

                        {selectedFilePath && (
                          <div className="border-t border-border/40 pt-6 space-y-4">
                            <span className="font-bold text-text-primary block">AUTOMATED UNIT TESTING TEMPLATE</span>
                            <div className="rounded-lg border border-border/60 overflow-hidden">
                              <div className="flex justify-between items-center px-3 py-2 bg-surface border-b border-border text-[10px]">
                                <span className="font-bold text-text-primary">Generated Vitest suite</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(AICodeReviewEngine.generateUnitTests(selectedFilePath, selectedFileContent || ""));
                                    alert("Test template copied to clipboard!");
                                  }}
                                  className="text-[#58A6FF] hover:text-white font-bold cursor-pointer"
                                >
                                  Copy Test Code
                                </button>
                              </div>
                              <pre className="p-4 bg-[#0D1117] text-[10px] text-text-primary overflow-x-auto whitespace-pre leading-relaxed">
                                {AICodeReviewEngine.generateUnitTests(selectedFilePath, selectedFileContent || "")}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUB TAB 7: CODE HISTORY */}
                {activeTab === "code-history" && (
                  <div className="space-y-6 font-mono text-xs">
                    
                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Commits frequency */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Commit Frequency Additions & Deletions</h3>
                        <div className="h-48 text-[9px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityAnalysis.weeklyCommits} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                              <XAxis dataKey="week" stroke="#8B949E" />
                              <YAxis stroke="#8B949E" />
                              <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                              <Bar dataKey="additions" fill="#3FB950" stackId="stack" />
                              <Bar dataKey="deletions" fill="#F85149" stackId="stack" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Health score history */}
                      <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Code Quality Trend History</h3>
                        <div className="h-48 text-[9px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                              { date: "June 20", score: healthScore - 6 },
                              { date: "June 27", score: healthScore - 3 },
                              { date: "July 04", score: healthScore - 1 },
                              { date: "Today", score: healthScore }
                            ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                              <XAxis dataKey="date" stroke="#8B949E" />
                              <YAxis stroke="#8B949E" />
                              <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                              <Line type="monotone" dataKey="score" stroke="#2F81F7" strokeWidth={2} dot={{ fill: "#2F81F7" }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>

                    {/* Timeline */}
                    <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4">
                      <h3 className="text-sm font-bold text-text-primary uppercase border-b border-border/20 pb-2">Repository History Milestones</h3>
                      <div className="relative border-l border-border/50 ml-3 space-y-6 font-mono text-xs pb-4">
                        {timeline.map((event, idx) => (
                          <div key={idx} className="relative pl-6">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
                            <span className="text-[10px] text-text-secondary block">{event.date}</span>
                            <span className="font-bold text-text-primary block mt-0.5">{event.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
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
                  <Sparkles size={14} className="text-accent" />
                  <span className="text-xs font-bold font-mono text-text-primary">AI CODE reviewer</span>
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
                      {msg.sender === "user" ? "You" : "Senior AI Engineer"}
                    </span>
                    <div
                      className={`rounded-xl p-3 max-w-[90%] text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-accent text-white font-medium"
                          : "bg-surface-secondary/40 border border-border text-text-primary font-normal"
                      }`}
                    >
                      {msg.sender === "assistant" ? (
                        <div className="prose prose-invert prose-xs leading-relaxed whitespace-pre-line space-y-2">
                          {msg.text}
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {chatTyping && (
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-text-secondary mb-1 font-mono">Senior AI Engineer</span>
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
              <div className="p-3 border-t border-border/40 bg-surface/10 space-y-1.5 font-mono text-[9px]">
                <span className="text-text-secondary uppercase font-bold block mb-1">Suggested prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Explain this repository",
                    "Explain this function",
                    "Optimize this file",
                    "Generate better implementation"
                  ].map(promptText => (
                    <button
                      key={promptText}
                      onClick={() => {
                        setChatInput(promptText);
                      }}
                      className="px-2 py-1 rounded bg-[#161B22]/50 border border-border hover:bg-[#21262D] text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleChatSubmit} className="p-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask senior AI reviewer..."
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
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-accent hover:bg-accent/90 text-white flex items-center justify-center shadow-lg shadow-accent/25 hover:scale-105 transition-all z-40 cursor-pointer animate-pulse"
            title="Ask Senior AI Reviewer"
          >
            <Sparkles size={18} />
          </button>
        )}

      </div>
    </div>
  );
}
