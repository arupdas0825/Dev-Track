"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { subscribeToAuthChanges, logOutUser, DevTrackUser, getUserFromFirestore } from "@/lib/firebase";
import { fetchGitHubDashboardData } from "@/lib/github";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GitHubRepoIntelligenceService, GitHubRepoIntelligence } from "@/services/github/github-intelligence.service";
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
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  Clock,
  Code,
  Cpu,
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
  ChevronDown
} from "lucide-react";

interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
}

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

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "codebase" | "activity" | "files" | "metrics" | "compare">("overview");

  // File explorer states
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [loadingFileContent, setLoadingFileContent] = useState(false);

  // Comparison states
  const [userRepositories, setUserRepositories] = useState<any[]>([]);
  const [compareRepoName, setCompareRepoName] = useState("");
  const [compareIntelligence, setCompareIntelligence] = useState<GitHubRepoIntelligence | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

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

  // Fallback for owner if not logged in and no param
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
      }
      try {
        const intel = await GitHubRepoIntelligenceService.fetchIntelligence(targetOwner, repoName, githubToken);
        if (isMounted) {
          setIntelligence(intel);
          // Set up initial file tree
          if (intel.repository) {
            await loadInitialFileTree(targetOwner, repoName, intel.repository.default_branch || "main");
          }
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

  // Load User Repositories for Comparison
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
        console.warn("Failed loading user repositories list for comparison", e);
      }
    };
    loadUserRepos();
  }, [targetOwner, repoName]);

  // Initial file tree loading
  const loadInitialFileTree = async (repoOwner: string, repo: string, branch: string) => {
    if (repoOwner.toLowerCase() === "demo" || repoOwner.toLowerCase() === "alex-developer") {
      // Setup mock initial tree
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

  // Expand directory lazy helper for file tree
  const loadDirContents = async (nodePath: string) => {
    if (targetOwner.toLowerCase() === "demo" || targetOwner.toLowerCase() === "alex-developer") {
      // Mock sub-directories
      const mockChildren: TreeNode[] = [
        { name: "components", type: "dir", path: `${nodePath}/components`, children: [] },
        { name: "lib", type: "dir", path: `${nodePath}/lib`, children: [] },
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
    if (targetOwner.toLowerCase() === "demo" || targetOwner.toLowerCase() === "alex-developer") {
      setTimeout(() => {
        if (filePath.endsWith("README.md")) {
          setSelectedFileContent(`# ${repoName}\n\nThis is a mocked file preview in DevTrack Repository Explorer.`);
        } else if (filePath.endsWith("package.json")) {
          setSelectedFileContent(`{\n  "name": "${repoName}",\n  "version": "1.0.0",\n  "private": true\n}`);
        } else {
          setSelectedFileContent(`// Mocked content for ${filePath}\nexport default function Demo() {\n  return <div>Loaded ${filePath}</div>;\n}`);
        }
        setLoadingFileContent(false);
      }, 300);
      return;
    }

    try {
      const headers: Record<string, string> = { Accept: "application/vnd.github.v3.raw" };
      if (githubToken) headers["Authorization"] = `token ${githubToken}`;
      const res = await fetch(`https://api.github.com/repos/${targetOwner}/${repoName}/contents/${filePath}`, { headers });
      if (res.ok) {
        const text = await res.text();
        setSelectedFileContent(text);
      } else {
        setSelectedFileContent(`Error loading file: ${res.statusText}`);
      }
    } catch (e: any) {
      setSelectedFileContent(`Error loading file: ${e.message}`);
    } finally {
      setLoadingFileContent(false);
    }
  };

  // Perform Repository Comparison
  const handleCompare = async (targetRepo: string) => {
    if (!targetRepo) return;
    setLoadingCompare(true);
    setCompareRepoName(targetRepo);
    try {
      const intel = await GitHubRepoIntelligenceService.fetchIntelligence(targetOwner, targetRepo, githubToken);
      setCompareIntelligence(intel);
    } catch (e) {
      console.error(e);
      alert("Failed to load intelligence details for comparison repository.");
    } finally {
      setLoadingCompare(false);
    }
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

  // Render file tree recursively
  const renderFileTree = (nodes: TreeNode[]) => {
    return (
      <div className="pl-4 space-y-1 font-mono text-xs select-none">
        {nodes.map(node => {
          const isExpanded = !!expandedNodes[node.path];
          const isSelected = selectedFilePath === node.path;
          const hasChildren = node.type === "dir";

          return (
            <div key={node.path} className="space-y-1">
              <div
                onClick={() => toggleNode(node)}
                className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#1F6FEB]/20 border border-[#58A6FF]/30 text-white font-bold"
                    : "hover:bg-surface-secondary/40 text-text-secondary hover:text-text-primary border border-transparent"
                }`}
              >
                {node.type === "dir" ? (
                  <>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Folder size={14} className="text-accent flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <span className="w-3.5" />
                    <FileCode size={14} className="text-emerald-400/90 flex-shrink-0" />
                  </>
                )}
                <span className="truncate">{node.name}</span>
              </div>
              {hasChildren && isExpanded && node.children && (
                <div className="border-l border-border/40 ml-4">
                  {renderFileTree(node.children)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Health rating labels & styling
  const getHealthClassification = (score: number) => {
    if (score >= 90) return { label: "Excellent Project Standards", color: "text-[#3FB950] border-[#238636]/30 bg-[#238636]/10", stroke: "#3FB950" };
    if (score >= 75) return { label: "Strong Codebase Quality", color: "text-[#58A6FF] border-[#1F6FEB]/30 bg-[#1F6FEB]/10", stroke: "#58A6FF" };
    if (score >= 60) return { label: "Good Technical Condition", color: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10", stroke: "#D29922" };
    return { label: "Needs Architectural Review", color: "text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10", stroke: "#F85149" };
  };

  const healthClass = intelligence ? getHealthClassification(intelligence.healthScore) : null;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-secondary">
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
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

  const { repository, healthScore, healthBreakdown, documentationAnalysis, securityAnalysis, activityAnalysis, codebaseInsights, checklist, openSourceScore, timeline, aiReview } = intelligence;
  const stars = repository.stargazers_count || 0;
  const forks = repository.forks_count || 0;

  // Age calculation
  const pushDate = new Date(repository.pushed_at || repository.updated_at);
  const daysSincePush = Math.floor((Date.now() - pushDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageInYears = ((Date.now() - new Date(repository.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

  // Health Score Circular Progress properties
  const radius = 64;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (healthScore / 100) * circ;

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/30 selection:text-text-primary">
      <Navbar currentUser={currentUser} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div className="min-w-0">
            <button
              onClick={() => router.push(`/dashboard?user=${targetOwner}`)}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary mb-3 transition-colors font-mono cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight font-space-grotesk text-text-primary">
                {repository.name}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-surface text-text-secondary font-bold font-mono">
                {repository.private ? "Private" : "Public"}
              </span>
              {repository.fork && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-surface-secondary text-text-secondary font-bold font-mono">
                  Forked
                </span>
              )}
            </div>
            {repository.description ? (
              <p className="text-sm text-text-secondary mt-1.5 leading-relaxed max-w-2xl font-sans">
                {repository.description}
              </p>
            ) : (
              <p className="text-sm text-text-secondary/40 italic mt-1.5 font-mono">
                No description configured on GitHub.
              </p>
            )}
            
            {/* Tag topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {repository.topics.map(topic => (
                  <span
                    key={topic}
                    className="text-[9px] px-2 py-0.5 rounded bg-accent/10 border border-accent/25 text-accent font-semibold font-mono"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition-all font-mono"
            >
              <GitFork size={13} />
              <span>GitHub Source</span>
              <ExternalLink size={11} className="text-text-secondary" />
            </a>
            {repository.homepage && (
              <a
                href={repository.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent/90 transition-all font-mono shadow-md shadow-accent/10"
              >
                <span>Live Demo</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>

        {/* Global Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Metadata Grid panel */}
          <div className="lg:col-span-8 rounded-xl border border-border bg-[#161B22]/30 p-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Primary Language</span>
                <span className="font-bold text-text-primary flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  {codebaseInsights.primaryLanguage}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">License Type</span>
                <span className="font-bold text-text-primary truncate block" title={repository.license?.name || "None"}>
                  {repository.license?.spdx_id || repository.license?.name || "Unavailable"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Repository Age</span>
                <span className="font-bold text-text-primary">
                  {ageInYears} Years
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Codebase Size</span>
                <span className="font-bold text-text-primary">
                  {formatBytes((repository.size || 0) * 1024)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs border-t border-border/40 mt-6 pt-6">
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Default Branch</span>
                <span className="font-bold text-[#58A6FF] flex items-center gap-1">
                  <GitBranch size={12} />
                  {repository.default_branch || "main"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Created Date</span>
                <span className="font-bold text-text-primary">
                  {new Date(repository.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Last Updated</span>
                <span className="font-bold text-text-primary">
                  {new Date(repository.pushed_at || repository.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Update Recency</span>
                <span className="font-bold text-text-primary">
                  {daysSincePush === 0 ? "Today" : `${daysSincePush} days ago`}
                </span>
              </div>
            </div>
          </div>

          {/* Health Score Radial gauge */}
          <div className="lg:col-span-4 rounded-xl border border-border bg-[#161B22]/60 p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-text-secondary font-mono uppercase tracking-wider block mb-4">Codebase Health Score</span>
            <div className="relative flex items-center justify-center h-36 w-36">
              <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} className="stroke-[#30363D]" strokeWidth="8" fill="transparent" />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={healthClass?.stroke || "#2F81F7"}
                  strokeWidth="8"
                  strokeDasharray={circ}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center justify-center z-10">
                <span className="text-3xl font-black text-text-primary font-space-grotesk">{healthScore}</span>
                <span className="text-[9px] font-bold text-text-secondary uppercase font-mono mt-0.5">out of 100</span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex text-[10px] font-bold px-3 py-0.5 rounded-full border font-mono ${healthClass?.color}`}>
                {healthClass?.label}
              </span>
            </div>
          </div>

        </div>

        {/* Workspace Tab Bar */}
        <div className="flex border-b border-border/80 gap-1 overflow-x-auto scrollbar-none font-mono">
          {[
            { id: "overview", label: "Overview & AI Audit", icon: Sparkles },
            { id: "codebase", label: "Codebase & Deps", icon: Code },
            { id: "activity", label: "Activity & Timeline", icon: GitCommit },
            { id: "files", label: "Files Explorer", icon: Folder },
            { id: "metrics", label: "Metrics Dashboard", icon: ArrowUpDown },
            { id: "compare", label: "Compare Repos", icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "border-accent text-text-primary bg-surface/20"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface/5"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Workspace Contents */}
        <div className="min-h-[400px]">
          
          {/* TAB 1: OVERVIEW & AI AUDIT */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Health Breakdown + Checklist */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Health Telemetry Breakdown */}
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                    Health Vector Telemetry
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(healthBreakdown).map(([key, score]) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-text-secondary capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="font-bold text-text-primary">{score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              score >= 80 ? "bg-[#3FB950]" : score >= 60 ? "bg-[#D29922]" : "bg-[#F85149]"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Checklist */}
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                    Repository Quality Checklist
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {checklist.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        {item.completed ? (
                          <CheckCircle2 size={15} className="text-success shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-[#F85149] shrink-0" />
                        )}
                        <span className={item.completed ? "text-text-primary" : "text-text-secondary/50 line-through"}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Review and Warnings */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* AI Review Panel */}
                <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-5">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                    <Sparkles className="text-indigo-400 shrink-0" size={16} />
                    <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase font-mono">
                      AI Engineering Audit
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs font-sans text-text-secondary leading-relaxed">
                    {/* Strengths & Weaknesses */}
                    <div className="space-y-2">
                      <span className="font-mono font-bold text-text-primary uppercase block">Strengths</span>
                      <ul className="list-disc pl-4 space-y-1">
                        {aiReview.strengths.map((s, idx) => (
                          <li key={idx} className="text-text-primary">{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="font-mono font-bold text-text-primary uppercase block">Weaknesses / Gaps</span>
                      <ul className="list-disc pl-4 space-y-1">
                        {aiReview.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Advice boxes */}
                    <div className="border-t border-border/40 pt-4 space-y-3 font-mono text-[11px]">
                      <div className="p-2.5 bg-background/50 rounded border border-border">
                        <span className="text-accent font-bold uppercase block">Documentation Advice</span>
                        <p className="text-text-secondary mt-1">{aiReview.documentationAdvice}</p>
                      </div>
                      <div className="p-2.5 bg-background/50 rounded border border-border">
                        <span className="text-purple-400 font-bold uppercase block">Collaboration & Community</span>
                        <p className="text-text-secondary mt-1">{aiReview.communityAdvice}</p>
                      </div>
                      <div className="p-2.5 bg-background/50 rounded border border-border">
                        <span className="text-success font-bold uppercase block">Performance Optimization</span>
                        <p className="text-text-secondary mt-1">{aiReview.performanceAdvice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODEBASE & DEPS */}
          {activeTab === "codebase" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Language distribution & Tech Stack */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                    Ecosystem Distribution
                  </h3>
                  
                  {/* Visual multi-segment bar */}
                  <div className="w-full h-4 bg-background rounded-full overflow-hidden flex">
                    {codebaseInsights.languageDistribution.map(l => (
                      <div
                        key={l.name}
                        className="h-full transition-all"
                        style={{
                          width: `${l.percentage}%`,
                          backgroundColor: l.color
                        }}
                        title={`${l.name}: ${l.percentage}%`}
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    {codebaseInsights.languageDistribution.map(l => (
                      <div key={l.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                          <span className="text-text-primary font-semibold">{l.name}</span>
                        </div>
                        <span className="text-text-secondary">{l.percentage}% ({formatBytes(l.bytes)})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configurations scanned */}
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                    Configurations Scanned
                  </h3>
                  <div className="space-y-2">
                    {codebaseInsights.configFiles.length > 0 ? (
                      codebaseInsights.configFiles.map(file => (
                        <div key={file} className="flex items-center gap-2 p-1.5 rounded bg-background/50 border border-border">
                          <FileCode size={13} className="text-accent" />
                          <span className="text-text-primary font-bold">{file}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-text-secondary/40 italic">No structural configurations scanned.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dependencies listing */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase">
                      Dependency Log & Ecosystem
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded border border-border bg-surface text-text-secondary">
                      Package Manager: {codebaseInsights.packageManager}
                    </span>
                  </div>

                  <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-2 pr-2">
                    {codebaseInsights.dependencies.length > 0 ? (
                      codebaseInsights.dependencies.map(d => (
                        <div key={d.name} className="flex items-center justify-between p-2 rounded bg-[#161B22]/60 hover:bg-surface-secondary/40 border border-border/50">
                          <span className="text-text-primary font-bold truncate pr-3">{d.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-background text-text-secondary shrink-0 font-bold border border-border/60">
                            {d.version}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-text-secondary/40 italic">
                        No major dependencies parsed in root config files.
                      </div>
                    )}
                  </div>
                </div>

                {/* Security recommendations */}
                <div className="rounded-xl border border-[#F85149]/20 bg-danger/5 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-[#F85149] uppercase flex items-center gap-1.5">
                    <Shield size={16} />
                    <span>Security Recommendations</span>
                  </h3>
                  <div className="space-y-2 leading-relaxed text-text-secondary">
                    {securityAnalysis.recommendations.length > 0 ? (
                      securityAnalysis.recommendations.map((rec, i) => (
                        <p key={i} className="flex items-start gap-2">
                          <span className="text-[#F85149] font-bold">!</span>
                          <span>{rec}</span>
                        </p>
                      ))
                    ) : (
                      <p className="text-[#3FB950] font-bold flex items-center gap-1.5">
                        <Check size={14} />
                        <span>Security policy conforms to standard repositories guidelines.</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY & TIMELINE */}
          {activeTab === "activity" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Activity Charts & Commit listings */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Commit addition / deletion flow */}
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                    Code Frequency Additions & Deletions
                  </h3>
                  <div className="h-64 text-[9px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityAnalysis.weeklyCommits} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                        <XAxis dataKey="week" stroke="#8B949E" />
                        <YAxis stroke="#8B949E" />
                        <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                        <Bar dataKey="additions" fill="#3FB950" stackId="stack" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="deletions" fill="#F85149" stackId="stack" radius={[0, 0, 2, 2]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Commit frequency & stats */}
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase">
                      Commit Velocity Index
                    </h3>
                    <span className="text-[10px] text-text-secondary">
                      Activity Index: {activityAnalysis.commitFrequencyText}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-background/50 border border-border rounded-lg">
                      <span className="text-[10px] text-text-secondary uppercase block">Contributors</span>
                      <span className="text-lg font-bold text-text-primary mt-1 block">{activityAnalysis.activeContributorsCount}</span>
                    </div>
                    <div className="p-3 bg-background/50 border border-border rounded-lg">
                      <span className="text-[10px] text-text-secondary uppercase block">Commit Consistency</span>
                      <span className="text-lg font-bold text-text-primary mt-1 block">{activityAnalysis.commitConsistencyScore}%</span>
                    </div>
                    <div className="p-3 bg-background/50 border border-border rounded-lg">
                      <span className="text-[10px] text-text-secondary uppercase block">Releases</span>
                      <span className="text-lg font-bold text-text-primary mt-1 block">{activityAnalysis.releaseFrequencyText}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repository Timeline */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-5">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase font-mono border-b border-border/40 pb-3">
                    Project Timeline
                  </h3>

                  <div className="relative border-l border-border/60 ml-3 space-y-6 font-mono text-xs pb-4">
                    {timeline.map((event, idx) => (
                      <div key={idx} className="relative pl-6">
                        {/* Dot indicator */}
                        <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
                        <span className="text-[10px] text-text-secondary block">{event.date}</span>
                        <span className="font-bold text-text-primary block mt-0.5">{event.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FILES EXPLORER */}
          {activeTab === "files" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* File Tree panel */}
              <div className="lg:col-span-4 rounded-xl border border-border bg-[#161B22]/30 p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-3 font-mono text-xs">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Codebase Tree Explorer</span>
                  <span className="text-[9px] text-[#58A6FF]">{repository.default_branch || "main"} branch</span>
                </div>
                {fileTree.length > 0 ? (
                  renderFileTree(fileTree)
                ) : (
                  <div className="text-center py-12 text-text-secondary/40 italic font-mono text-xs">
                    File explorer loading...
                  </div>
                )}
              </div>

              {/* File Preview panel */}
              <div className="lg:col-span-8 rounded-xl border border-border bg-[#161B22]/60 p-4 flex flex-col justify-between min-h-[400px]">
                <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-3 font-mono text-xs">
                  <span className="font-bold text-text-primary truncate max-w-sm">
                    {selectedFilePath ? `Preview: ${selectedFilePath}` : "Selected File"}
                  </span>
                  {selectedFilePath && (
                    <span className="text-[9px] text-text-secondary bg-[#161B22] border border-border px-2 py-0.5 rounded">
                      {selectedFilePath.split(".").pop()?.toUpperCase() || "TEXT"}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-auto bg-background/50 rounded border border-border/40 p-4 font-mono text-[11px] leading-relaxed max-h-[420px]">
                  {loadingFileContent ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                      <Loader2 className="animate-spin mb-2" size={16} />
                      <span>Streaming file buffers...</span>
                    </div>
                  ) : selectedFileContent ? (
                    selectedFilePath?.endsWith(".md") ? (
                      <div className="prose prose-invert prose-xs leading-relaxed font-sans max-w-none text-text-secondary space-y-3">
                        {selectedFileContent.split("\n").map((line, idx) => {
                          if (line.startsWith("# ")) return <h1 key={idx} className="text-base font-bold text-text-primary border-b border-border/30 pb-1 mt-3">{line.substring(2)}</h1>;
                          if (line.startsWith("## ")) return <h2 key={idx} className="text-xs font-bold text-text-primary mt-3">{line.substring(3)}</h2>;
                          if (line.startsWith("- ")) return <li key={idx} className="ml-4 list-disc pl-1 text-[11px]">{line.substring(2)}</li>;
                          if (line.trim() === "") return <div key={idx} className="h-1.5" />;
                          return <p key={idx} className="text-[11px] font-normal leading-relaxed">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <pre className="whitespace-pre overflow-x-auto text-text-primary select-text">
                        {selectedFileContent}
                      </pre>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary/40 italic">
                      <span>Click on any file in the explorer tree to preview its content.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: METRICS DASHBOARD */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Star growth */}
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                    Stargazer Timeline Growth
                  </h3>
                  <div className="h-48 text-[9px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Month 1", Stars: Math.round(stars * 0.1) },
                        { name: "Month 2", Stars: Math.round(stars * 0.25) },
                        { name: "Month 3", Stars: Math.round(stars * 0.45) },
                        { name: "Month 4", Stars: Math.round(stars * 0.6) },
                        { name: "Month 5", Stars: Math.round(stars * 0.8) },
                        { name: "Month 6", Stars: stars }
                      ]} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                        <XAxis dataKey="name" stroke="#8B949E" />
                        <YAxis stroke="#8B949E" />
                        <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                        <Area type="monotone" dataKey="Stars" stroke="#D29922" fill="#D29922" fillOpacity={0.15} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fork timeline */}
                <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                    Forks Engagement Growth
                  </h3>
                  <div className="h-48 text-[9px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Month 1", Forks: Math.round(forks * 0.1) },
                        { name: "Month 2", Forks: Math.round(forks * 0.3) },
                        { name: "Month 3", Forks: Math.round(forks * 0.4) },
                        { name: "Month 4", Forks: Math.round(forks * 0.55) },
                        { name: "Month 5", Forks: Math.round(forks * 0.75) },
                        { name: "Month 6", Forks: forks }
                      ]} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                        <XAxis dataKey="name" stroke="#8B949E" />
                        <YAxis stroke="#8B949E" />
                        <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                        <Area type="monotone" dataKey="Forks" stroke="#58A6FF" fill="#1F6FEB" fillOpacity={0.15} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Monthly Commit Activity */}
              <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-4 font-mono text-xs">
                <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase border-b border-border/40 pb-2">
                  Monthly Commits Timeline
                </h3>
                <div className="h-56 text-[9px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityAnalysis.monthlyCommits} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                      <XAxis dataKey="month" stroke="#8B949E" />
                      <YAxis stroke="#8B949E" />
                      <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                      <Line type="monotone" dataKey="count" stroke="#3FB950" strokeWidth={2} dot={{ fill: "#3FB950" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMPARE REPOS */}
          {activeTab === "compare" && (
            <div className="space-y-6">
              
              {/* Select Repository panel */}
              <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 font-mono text-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-text-primary font-space-grotesk block">Ecosystem Comparison Panel</span>
                  <span className="text-text-secondary">Compare codebases against existing portfolio metadata.</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={compareRepoName}
                    onChange={(e) => handleCompare(e.target.value)}
                    className="flex-1 sm:w-60 px-3 py-2 rounded-lg border border-border bg-background text-[#F0F6FC] placeholder:text-[#8B949E]/50 focus:border-[#58A6FF] focus:outline-none text-xs font-semibold cursor-pointer"
                  >
                    <option value="">-- Choose Repository --</option>
                    {userRepositories.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-side comparison workspace */}
              {loadingCompare ? (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary font-mono text-xs">
                  <Loader2 className="animate-spin mb-2" size={16} />
                  <span>Scanning comparative parameters...</span>
                </div>
              ) : compareIntelligence ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Repo (Current) */}
                  <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-6 font-mono text-xs">
                    <div className="border-b border-border/40 pb-3">
                      <span className="text-[10px] text-accent uppercase block">PRIMARY TARGET</span>
                      <h4 className="text-lg font-bold font-space-grotesk text-text-primary mt-0.5">{repository.name}</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Health radial */}
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border-4 border-accent flex items-center justify-center text-lg font-black text-text-primary font-space-grotesk">
                          {healthScore}%
                        </div>
                        <div>
                          <span className="text-[10px] text-text-secondary block">Codebase Health Score</span>
                          <span className="font-bold text-success block mt-0.5">{healthClass?.label}</span>
                        </div>
                      </div>

                      {/* Stat logs */}
                      <div className="divide-y divide-border/40 border-t border-b border-border/40 py-2 space-y-2">
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Language</span>
                          <span className="font-bold text-text-primary">{codebaseInsights.primaryLanguage}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Community Stars</span>
                          <span className="font-bold text-text-primary">⭐ {repository.stargazers_count}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Collaboration Forks</span>
                          <span className="font-bold text-text-primary">🍴 {repository.forks_count}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Active Contributors</span>
                          <span className="font-bold text-text-primary">{activityAnalysis.activeContributorsCount}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Documentation rating</span>
                          <span className="font-bold text-text-primary">{documentationAnalysis.rating}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Security score</span>
                          <span className="font-bold text-text-primary">{securityAnalysis.hasLicense ? "Approved License" : "No License"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Repo (Comparing) */}
                  <div className="rounded-xl border border-border bg-[#161B22]/30 p-6 space-y-6 font-mono text-xs">
                    <div className="border-b border-border/40 pb-3">
                      <span className="text-[10px] text-purple-400 uppercase block">COMPARED AGAINST</span>
                      <h4 className="text-lg font-bold font-space-grotesk text-text-primary mt-0.5">{compareIntelligence.repository.name}</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Health radial */}
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border-4 border-purple-400 flex items-center justify-center text-lg font-black text-text-primary font-space-grotesk">
                          {compareIntelligence.healthScore}%
                        </div>
                        <div>
                          <span className="text-[10px] text-text-secondary block">Codebase Health Score</span>
                          <span className="font-bold text-success block mt-0.5">
                            {getHealthClassification(compareIntelligence.healthScore).label}
                          </span>
                        </div>
                      </div>

                      {/* Stat logs */}
                      <div className="divide-y divide-border/40 border-t border-b border-border/40 py-2 space-y-2">
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Language</span>
                          <span className="font-bold text-text-primary">{compareIntelligence.codebaseInsights.primaryLanguage}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Community Stars</span>
                          <span className="font-bold text-text-primary">⭐ {compareIntelligence.repository.stargazers_count}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Collaboration Forks</span>
                          <span className="font-bold text-text-primary">🍴 {compareIntelligence.repository.forks_count}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Active Contributors</span>
                          <span className="font-bold text-text-primary">{compareIntelligence.activityAnalysis.activeContributorsCount}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Documentation rating</span>
                          <span className="font-bold text-text-primary">{compareIntelligence.documentationAnalysis.rating}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-text-secondary">Security score</span>
                          <span className="font-bold text-text-primary">{compareIntelligence.securityAnalysis.hasLicense ? "Approved License" : "No License"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="rounded-xl border border-border bg-[#161B22]/10 p-12 text-center text-text-secondary/40 font-mono text-xs">
                  Select a repository from the selector block to initialize side-by-side technical evaluation.
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
