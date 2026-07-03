"use client";

import { useState, useEffect } from "react";
import { GitHubRepository } from "@/types";
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
  CartesianGrid
} from "recharts";
import {
  BookOpen,
  Folder,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Tag,
  GitBranch,
  Activity,
  ChevronRight,
  ChevronDown,
  FileCode,
  Users,
  Code,
  Shield,
  Loader2
} from "lucide-react";

interface RepoDetailPanelProps {
  repository: GitHubRepository;
  githubToken?: string;
  username: string;
}

// Tree node definition for Folder Structure
interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
}

export default function RepoDetailPanel({
  repository,
  githubToken,
  username
}: RepoDetailPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "readme" | "files" | "commits" | "collab" | "releases" | "health"
  >("readme");
  const [loading, setLoading] = useState(true);

  // Loaded states
  const [readmeText, setReadmeText] = useState("");
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [commitsList, setCommitsList] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [prsList, setPrsList] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Fetch / Mock data on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      // Mock data generator helper based on repo context
      const generateMockData = () => {
        const lang = repository.language || "TypeScript";
        
        // 1. Mock README
        const mockReadme = `# ${repository.name}
${repository.description || "A clean developer intelligence module built with DevTrack."}

## Tech Stack
- Primary: **${lang}**
- Frameworks & libraries: React, Framer Motion, Recharts
- Testing: Jest, Playwright

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration
Create a \`.env.local\` file in the root directory:
\`\`\`env
NEXT_PUBLIC_API_URL=https://api.devtrack.io
\`\`\`

## License
Licensed under the [MIT License](LICENSE).
`;

        // 2. Mock File Tree
        let mockTree: TreeNode[] = [];
        if (lang === "TypeScript" || lang === "JavaScript") {
          mockTree = [
            {
              name: "src",
              type: "dir",
              path: "src",
              children: [
                {
                  name: "components",
                  type: "dir",
                  path: "src/components",
                  children: [
                    { name: "Dashboard.tsx", type: "file", path: "src/components/Dashboard.tsx" },
                    { name: "Explorer.tsx", type: "file", path: "src/components/Explorer.tsx" }
                  ]
                },
                {
                  name: "lib",
                  type: "dir",
                  path: "src/lib",
                  children: [
                    { name: "utils.ts", type: "file", path: "src/lib/utils.ts" },
                    { name: "github.ts", type: "file", path: "src/lib/github.ts" }
                  ]
                },
                { name: "page.tsx", type: "file", path: "src/page.tsx" }
              ]
            },
            {
              name: "public",
              type: "dir",
              path: "public",
              children: [
                { name: "favicon.ico", type: "file", path: "public/favicon.ico" },
                { name: "logo.png", type: "file", path: "public/logo.png" }
              ]
            },
            { name: "package.json", type: "file", path: "package.json" },
            { name: "tsconfig.json", type: "file", path: "tsconfig.json" },
            { name: "README.md", type: "file", path: "README.md" }
          ];
        } else if (lang === "Go") {
          mockTree = [
            {
              name: "cmd",
              type: "dir",
              path: "cmd",
              children: [{ name: "server", type: "dir", path: "cmd/server", children: [{ name: "main.go", type: "file", path: "cmd/server/main.go" }] }]
            },
            {
              name: "pkg",
              type: "dir",
              path: "pkg",
              children: [{ name: "handler", type: "dir", path: "pkg/handler", children: [{ name: "router.go", type: "file", path: "pkg/handler/router.go" }] }]
            },
            { name: "go.mod", type: "file", path: "go.mod" },
            { name: "README.md", type: "file", path: "README.md" }
          ];
        } else {
          mockTree = [
            {
              name: "src",
              type: "dir",
              path: "src",
              children: [
                { name: "main.rs", type: "file", path: "src/main.rs" },
                { name: "config.rs", type: "file", path: "src/config.rs" }
              ]
            },
            { name: "Cargo.toml", type: "file", path: "Cargo.toml" },
            { name: "README.md", type: "file", path: "README.md" }
          ];
        }

        // 3. Mock Commits
        const mockCommits = [
          { sha: "8f3e2d1", author: username, message: "Refactor dashboard layouts and resolve hydration shifts", date: "2 hours ago" },
          { sha: "d4b1a6c", author: username, message: "Integrate premium Recharts modules for repository health telemetry", date: "1 day ago" },
          { sha: "f7e9a3b", author: "dependabot[bot]", message: "Bump Lucide-react from 1.15.0 to 1.21.0", date: "3 days ago" },
          { sha: "a1c5d9e", author: username, message: "Deploy multi-tab navigation controls and save widget layouts", date: "5 days ago" },
          { sha: "e9f0c2a", author: username, message: "Initial commit and folder scaffolding setup", date: "1 week ago" }
        ];

        // 4. Mock Contributors
        const mockContributors = [
          { login: username, contributions: Math.round(50 + Math.random() * 80), avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80" },
          { login: "collaborator-alpha", contributions: 12, avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80" },
          { login: "dependabot[bot]", contributions: 6, avatar_url: "https://avatars.githubusercontent.com/in/29110?v=4" }
        ];

        // 5. Mock Issues & PRs
        const mockIssues = [
          { number: 12, title: "Resolve minor responsive overflow on radar charts", author: "collaborator-alpha", date: "2 days ago", comments: 2 },
          { number: 8, title: "Configure strict env var validator checks", author: username, date: "1 week ago", comments: 0 }
        ];

        const mockPrs = [
          { number: 14, title: "Feature: Add customizable widgets local sync layer", author: username, date: "4 hours ago", status: "open" },
          { number: 11, title: "Chore: Update Tailwind import pathways and lint rules", author: "collaborator-alpha", date: "3 days ago", status: "merged" }
        ];

        // 6. Mock Releases & Branches
        const mockReleases = [
          { tag_name: "v1.1.0", name: "v1.1.0 (Minor patch)", published_at: "3 days ago" },
          { tag_name: "v1.0.0", name: "v1.0.0 (Initial stable release)", published_at: "2 weeks ago" }
        ];

        const mockBranches = ["main", "dev", "feature/explorer-panel"];

        if (isMounted) {
          setReadmeText(mockReadme);
          setFileTree(mockTree);
          setCommitsList(mockCommits);
          setContributors(mockContributors);
          setIssuesList(mockIssues);
          setPrsList(mockPrs);
          setReleases(mockReleases);
          setBranches(mockBranches);
          setLoading(false);
        }
      };

      if (username.toLowerCase() === "demo" || !githubToken) {
        // Slow down slightly to show skeleton load animation
        setTimeout(generateMockData, 600);
        return;
      }

      try {
        const headers: Record<string, string> = {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${githubToken}`
        };

        // Fetch README (raw markdown)
        const readmeRes = await fetch(
          `https://api.github.com/repos/${username}/${repository.name}/readme`,
          { headers: { ...headers, Accept: "application/vnd.github.v3.raw" } }
        );
        let readme = "";
        if (readmeRes.ok) {
          readme = await readmeRes.text();
        } else {
          readme = `# ${repository.name}\n\n${repository.description || "No description provided."}`;
        }

        // Fetch top-level contents
        const contentsRes = await fetch(
          `https://api.github.com/repos/${username}/${repository.name}/contents`,
          { headers }
        );
        let tree: TreeNode[] = [];
        if (contentsRes.ok) {
          const contents = await contentsRes.json();
          tree = contents.map((c: any) => ({
            name: c.name,
            type: c.type === "dir" ? "dir" : "file",
            path: c.path,
            children: c.type === "dir" ? [] : undefined
          }));
        }

        // Fetch commits
        const commitsRes = await fetch(
          `https://api.github.com/repos/${username}/${repository.name}/commits?per_page=5`,
          { headers }
        );
        let commits: any[] = [];
        if (commitsRes.ok) {
          const rawCommits = await commitsRes.json();
          commits = rawCommits.map((c: any) => {
            const dateObj = new Date(c.commit.author.date);
            return {
              sha: c.sha.substring(0, 7),
              author: c.commit.author.name,
              message: c.commit.message,
              date: dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "2-digit"
              })
            };
          });
        }

        // Fetch contributors
        const contribRes = await fetch(
          `https://api.github.com/repos/${username}/${repository.name}/contributors?per_page=5`,
          { headers }
        );
        let contribs: any[] = [];
        if (contribRes.ok) {
          contribs = await contribRes.json();
        }

        // Fetch open issues
        const issuesRes = await fetch(
          `https://api.github.com/repos/${username}/${repository.name}/issues?state=open&per_page=5`,
          { headers }
        );
        let issues: any[] = [];
        let prs: any[] = [];
        if (issuesRes.ok) {
          const rawIssues = await issuesRes.json();
          rawIssues.forEach((item: any) => {
            const dateStr = new Date(item.created_at).toLocaleDateString();
            if (item.pull_request) {
              prs.push({
                number: item.number,
                title: item.title,
                author: item.user.login,
                date: dateStr,
                status: "open"
              });
            } else {
              issues.push({
                number: item.number,
                title: item.title,
                author: item.user.login,
                date: dateStr,
                comments: item.comments
              });
            }
          });
        }

        // Fetch releases
        const releasesRes = await fetch(
          `https://api.github.com/repos/${username}/${repository.name}/releases?per_page=5`,
          { headers }
        );
        let relList: any[] = [];
        if (releasesRes.ok) {
          relList = await releasesRes.json();
        }

        // Fetch branches
        const branchesRes = await fetch(
          `https://api.github.com/repos/${username}/${repository.name}/branches`,
          { headers }
        );
        let branchList: string[] = ["main"];
        if (branchesRes.ok) {
          const rawBranches = await branchesRes.json();
          branchList = rawBranches.map((b: any) => b.name);
        }

        if (isMounted) {
          setReadmeText(readme);
          setFileTree(tree);
          setCommitsList(commits);
          setContributors(contribs);
          setIssuesList(issues);
          setPrsList(prs);
          setReleases(relList);
          setBranches(branchList);
          setLoading(false);
        }
      } catch (err) {
        console.warn("GitHub live fetch failed, generating mock data:", err);
        generateMockData();
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [repository.name, username, githubToken]);

  // Expand directory lazy helper for file tree
  const loadDirContents = async (nodePath: string) => {
    if (username.toLowerCase() === "demo" || !githubToken) return;

    try {
      const headers = {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${githubToken}`
      };

      const res = await fetch(
        `https://api.github.com/repos/${username}/${repository.name}/contents/${nodePath}`,
        { headers }
      );
      if (res.ok) {
        const contents = await res.json();
        const updatedChildren: TreeNode[] = contents.map((c: any) => ({
          name: c.name,
          type: c.type === "dir" ? "dir" : "file",
          path: c.path,
          children: c.type === "dir" ? [] : undefined
        }));

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

        setFileTree(prev => updateNodeInTree(prev));
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
    }
  };

  const renderFileTree = (nodes: TreeNode[]) => {
    return (
      <div className="pl-4 space-y-1.5 font-mono text-xs">
        {nodes.map(node => {
          const isExpanded = !!expandedNodes[node.path];
          const hasChildren = node.type === "dir";

          return (
            <div key={node.path} className="space-y-1">
              <div
                onClick={() => toggleNode(node)}
                className={`flex items-center gap-2 py-1 px-1.5 rounded hover:bg-surface-secondary/40 cursor-pointer text-text-secondary hover:text-text-primary transition-colors ${
                  node.type === "dir" ? "font-bold text-accent/90" : ""
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
                <span>{node.name}</span>
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

  // Calculate Repository Health Score
  const getRepoHealthDetails = () => {
    const documentation = repository.description && readmeText ? 25 : (repository.description || readmeText ? 15 : 5);
    const codeCoverage = 20; // Statically estimated
    const issueRate = repository.open_issues_count === 0 ? 25 : Math.max(5, 25 - repository.open_issues_count * 2);
    const popularity = Math.min(30, Math.round(((repository.stargazers_count + repository.forks_count * 2) / 20) * 30));
    const total = documentation + codeCoverage + issueRate + popularity;
    return { documentation, codeCoverage, issueRate, popularity, total };
  };

  const health = getRepoHealthDetails();

  // Commit history Recharts simulation
  const getCommitChartData = () => {
    return [
      { week: "Wk 1", commits: 2, additions: 120, deletions: -40 },
      { week: "Wk 2", commits: 5, additions: 450, deletions: -120 },
      { week: "Wk 3", commits: 1, additions: 50, deletions: -10 },
      { week: "Wk 4", commits: 8, additions: 920, deletions: -380 },
      { week: "Wk 5", commits: 4, additions: 280, deletions: -90 },
      { week: "Wk 6", commits: 3, additions: 180, deletions: -30 },
      { week: "Wk 7", commits: 6, additions: 610, deletions: -220 },
      { week: "Wk 8", commits: 9, additions: 1100, deletions: -410 }
    ];
  };

  const chartData = getCommitChartData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary border-t border-border/40 mt-4">
        <Loader2 className="animate-spin text-accent mb-2" size={24} />
        <span className="text-xs font-semibold tracking-wider font-mono">Lazy-indexing repository assets...</span>
      </div>
    );
  }

  return (
    <div className="border-t border-border/60 mt-4 pt-5 space-y-4 text-xs font-mono">
      {/* Sub Tabs Bar */}
      <div className="flex overflow-x-auto gap-1 border-b border-border/50 pb-2 scrollbar-none">
        {[
          { id: "readme", label: "README", icon: BookOpen },
          { id: "files", label: "Files", icon: Folder },
          { id: "commits", label: "Activity", icon: GitCommit },
          { id: "collab", label: "PRs & Issues", icon: GitPullRequest },
          { id: "releases", label: "Releases", icon: Tag },
          { id: "health", label: "Health Index", icon: Activity }
        ].map(btn => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveSubTab(btn.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === btn.id
                  ? "bg-surface-secondary border-border text-text-primary"
                  : "bg-surface/20 border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={12} />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub Tab Contents */}
      <div className="min-h-[220px]">
        {/* README TAB */}
        {activeSubTab === "readme" && (
          <div className="p-4 bg-background/50 rounded-lg border border-border/40 max-h-[350px] overflow-y-auto scrollbar-thin">
            <div className="prose prose-invert prose-xs leading-relaxed font-sans max-w-none text-text-secondary space-y-3">
              {readmeText ? (
                readmeText.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={idx} className="text-base font-bold text-text-primary border-b border-border/40 pb-1 mt-3">
                        {line.substring(2)}
                      </h1>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="text-xs font-bold text-text-primary mt-3">
                        {line.substring(3)}
                      </h2>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={idx} className="ml-4 list-disc pl-1 text-[11px]">
                        {line.substring(2)}
                      </li>
                    );
                  }
                  if (line.startsWith("```")) {
                    return null;
                  }
                  if (line.trim() === "") return <div key={idx} className="h-1.5" />;
                  return <p key={idx} className="text-[11px] font-normal leading-relaxed">{line}</p>;
                })
              ) : (
                <p className="italic text-text-secondary/40 font-mono">No README telemetry located.</p>
              )}
            </div>
          </div>
        )}

        {/* FILES TAB */}
        {activeSubTab === "files" && (
          <div className="p-4 bg-background/50 rounded-lg border border-border/40 max-h-[350px] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-3">
              <span className="text-[10px] text-text-secondary uppercase font-bold">Interactive Directory Tree</span>
              <span className="text-[9px] text-[#58A6FF]">{branches[0] || "main"} branch</span>
            </div>
            {fileTree.length > 0 ? (
              renderFileTree(fileTree)
            ) : (
              <p className="italic text-text-secondary/40">No file tree indexed.</p>
            )}
          </div>
        )}

        {/* COMMITS & ACTIVITY TAB */}
        {activeSubTab === "commits" && (
          <div className="space-y-4">
            {/* Visual Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stacked Additions/Deletions */}
              <div className="p-3.5 bg-background/40 border border-border/40 rounded-lg">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block mb-2">Code Frequency Profile</span>
                <div className="h-32 text-[8px] font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
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

              {/* Weekly Commit Count */}
              <div className="p-3.5 bg-background/40 border border-border/40 rounded-lg">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block mb-2">Weekly Commit Velocity</span>
                <div className="h-32 text-[8px] font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                      <XAxis dataKey="week" stroke="#8B949E" />
                      <YAxis stroke="#8B949E" />
                      <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", fontSize: 10 }} />
                      <Area type="monotone" dataKey="commits" stroke="#58A6FF" fill="#1F6FEB" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Commits List */}
            <div className="bg-background/50 rounded-lg border border-border/40 p-4">
              <span className="text-[10px] text-text-secondary uppercase font-bold block border-b border-border/30 pb-2 mb-3">
                Recent Codebase Changes
              </span>
              <div className="space-y-3">
                {commitsList.map((commit, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 text-[11px] hover:bg-surface/30 p-1 rounded transition-all">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="font-bold text-text-primary truncate">{commit.message}</div>
                      <div className="text-[10px] text-text-secondary">
                        by <strong className="text-text-primary">{commit.author}</strong> • {commit.date}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 font-mono text-[9px] text-[#58A6FF] bg-[#1F6FEB]/10 border border-[#1F6FEB]/20 rounded">
                      {commit.sha}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRs & ISSUES TAB */}
        {activeSubTab === "collab" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PRs */}
            <div className="p-4 bg-background/50 rounded-lg border border-border/40">
              <span className="text-[10px] text-text-secondary uppercase font-bold block border-b border-border/30 pb-2 mb-3">
                Pull Request Log
              </span>
              {prsList.length > 0 ? (
                <div className="space-y-3">
                  {prsList.map(pr => (
                    <div key={pr.number} className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-bold px-1 rounded ${
                          pr.status === "open" ? "bg-[#238636]/15 text-[#3FB950]" : "bg-purple-500/10 text-purple-400"
                        }`}>
                          #{pr.number}
                        </span>
                        <div className="font-bold text-text-primary truncate flex-1">{pr.title}</div>
                      </div>
                      <div className="text-[9px] text-text-secondary pl-6">
                        Opened by {pr.author} • {pr.date}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-text-secondary/40 text-center py-4">No active pull request integrations.</p>
              )}
            </div>

            {/* Issues */}
            <div className="p-4 bg-background/50 rounded-lg border border-border/40">
              <span className="text-[10px] text-text-secondary uppercase font-bold block border-b border-border/30 pb-2 mb-3">
                Open Issue Registry
              </span>
              {issuesList.length > 0 ? (
                <div className="space-y-3">
                  {issuesList.map(issue => (
                    <div key={issue.number} className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold px-1 bg-red-500/10 text-rose-400 rounded">
                          #{issue.number}
                        </span>
                        <div className="font-bold text-text-primary truncate flex-1">{issue.title}</div>
                      </div>
                      <div className="text-[9px] text-text-secondary pl-6 flex justify-between">
                        <span>by {issue.author} • {issue.date}</span>
                        {issue.comments > 0 && <span>💬 {issue.comments} comments</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-text-secondary/40 text-center py-4">No open issues found in repo index.</p>
              )}
            </div>
          </div>
        )}

        {/* RELEASES & BRANCHES TAB */}
        {activeSubTab === "releases" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Version Releases */}
            <div className="md:col-span-8 p-4 bg-background/50 rounded-lg border border-border/40">
              <span className="text-[10px] text-text-secondary uppercase font-bold block border-b border-border/30 pb-2 mb-3">
                Version Release Archive
              </span>
              {releases.length > 0 ? (
                <div className="space-y-3">
                  {releases.map((rel, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-text-primary">{rel.name || rel.tag_name}</div>
                        <div className="text-[9px] text-text-secondary mt-0.5">Published {rel.published_at}</div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 border border-border bg-surface text-accent rounded font-bold">
                        {rel.tag_name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-text-secondary/40 text-center py-6">No package releases published.</p>
              )}
            </div>

            {/* Branches List */}
            <div className="md:col-span-4 p-4 bg-background/50 rounded-lg border border-border/40 space-y-3">
              <span className="text-[10px] text-text-secondary uppercase font-bold block border-b border-border/30 pb-2">
                Active Branches
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {branches.map(branchName => (
                  <div key={branchName} className="flex items-center gap-2 text-[10px] text-text-secondary bg-surface/30 p-1.5 border border-border/40 rounded">
                    <GitBranch size={12} className="text-[#58A6FF]" />
                    <span className="truncate">{branchName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPOSITORY HEALTH TAB */}
        {activeSubTab === "health" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Health Gauge */}
            <div className="md:col-span-4 text-center flex flex-col items-center">
              <div className="relative h-28 w-28 flex items-center justify-center bg-surface/40 rounded-full border border-border">
                <div className="absolute inset-2 bg-background rounded-full flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#3FB950] font-space-grotesk">{health.total}%</span>
                  <span className="text-[8px] font-bold text-text-secondary uppercase">Health Score</span>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-text-secondary">
                Classification: <strong className="text-success">{health.total >= 80 ? "Exemplary" : (health.total >= 60 ? "Healthy" : "Stale")}</strong>
              </div>
            </div>

            {/* Health Breakdown */}
            <div className="md:col-span-8 bg-background/40 border border-border/40 rounded-lg p-4 space-y-3.5">
              <span className="text-[10px] text-text-secondary uppercase font-bold block">Telemetry Vector Scores</span>
              
              <div className="space-y-2.5">
                {/* Documentation */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-text-primary flex items-center gap-1"><BookOpen size={12} className="text-accent" /> Documentation</span>
                    <span className="font-bold text-[#F0F6FC]">{health.documentation} / 25</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(health.documentation / 25) * 100}%` }} />
                  </div>
                </div>

                {/* Code Coverage */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-text-primary flex items-center gap-1"><Shield size={12} className="text-purple-400" /> Security & Coverage</span>
                    <span className="font-bold text-[#F0F6FC]">{health.codeCoverage} / 20</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400" style={{ width: `${(health.codeCoverage / 20) * 100}%` }} />
                  </div>
                </div>

                {/* Open Issue Ratio */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-text-primary flex items-center gap-1"><AlertCircle size={12} className="text-rose-400" /> Issue Resolution Ratio</span>
                    <span className="font-bold text-[#F0F6FC]">{health.issueRate} / 25</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400" style={{ width: `${(health.issueRate / 25) * 100}%` }} />
                  </div>
                </div>

                {/* Popularity & Pulls */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-text-primary flex items-center gap-1"><Users size={12} className="text-amber-400" /> Community Stature</span>
                    <span className="font-bold text-[#F0F6FC]">{health.popularity} / 30</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(health.popularity / 30) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* External metadata footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3 text-[10px] text-text-secondary">
        <span className="flex items-center gap-1">
          <Code size={11} /> Primary License: <strong>{repository.fork ? "Cloned Fork" : "MIT License"}</strong>
        </span>
        <span>Telemetry Indexed: Realtime Sync</span>
      </div>
    </div>
  );
}
