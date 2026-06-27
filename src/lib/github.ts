import { GitHubProfile, GitHubRepository, LanguageStat, ContributionStats, UserDashboardData, DeveloperScore, AIInsights } from "../types";
import { GitHubUserService } from "../services/github/github-user.service";
import { GitHubRepositoryService } from "../services/github/github-repository.service";
import { GitHubAnalyticsService } from "../services/github/github-analytics.service";
import { GitHubContributionService } from "../services/github/github-contribution.service";
import { calculateDeveloperScore } from "../services/score";

// Language color mapping inspired by GitHub
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Shell: "#89e051",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
};

export async function fetchGitHubDashboardData(
  username: string,
  token?: string
): Promise<UserDashboardData> {
  if (username.toLowerCase() === "demo" || username.toLowerCase() === "devtrack-demo" || !username) {
    return getDemoDashboardData();
  }

  // 1. Fetch Profile
  const profile = await GitHubUserService.fetchUserProfile(username, token);

  // 2. Fetch Repositories
  const repositories = await GitHubRepositoryService.fetchUserProfileRepos(username, token);

  // 3. Fetch real user contributions via GitHubContributionService
  const contributions = await GitHubContributionService.fetchUserContributions(username, token);

  // 4. Calculate everything using GitHubAnalyticsService
  const { dashboardData } = GitHubAnalyticsService.calculateDashboardAnalytics(
    profile.id.toString(),
    profile,
    repositories,
    contributions
  );

  return dashboardData;
}


export function getDemoDashboardData(): UserDashboardData {
  const profile: GitHubProfile = {
    login: "alex-developer",
    id: 991823,
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
    html_url: "https://github.com",
    name: "Alex Rivera",
    company: "Vercel / OpenSource contributor",
    blog: "https://alexrivera.dev",
    location: "San Francisco, CA",
    email: "alex@devtrack.io",
    bio: "Building developer platforms and serverless functions. Contributor to Next.js, Framer Motion, and TailwindCSS. Coffee enthusiast.",
    public_repos: 42,
    public_gists: 12,
    followers: 1240,
    following: 180,
    created_at: "2019-04-12T10:12:44Z",
  };

  const repositories: GitHubRepository[] = [
    {
      id: 101,
      name: "next-saas-template",
      full_name: "alex-developer/next-saas-template",
      html_url: "https://github.com",
      description: "Production-ready Next.js 15 template with Tailwind v4, Prisma, PostgreSQL, and Auth pre-configured.",
      fork: false,
      created_at: "2024-02-01T08:00:00Z",
      updated_at: "2026-06-18T10:00:00Z",
      pushed_at: "2026-06-18T10:00:00Z",
      size: 45200,
      stargazers_count: 852,
      watchers_count: 852,
      language: "TypeScript",
      forks_count: 142,
      open_issues_count: 4,
      qualityScore: 92,
    },
    {
      id: 102,
      name: "framer-motion-builder",
      full_name: "alex-developer/framer-motion-builder",
      html_url: "https://github.com",
      description: "Visual node-based motion designer that outputs React code for animations.",
      fork: false,
      created_at: "2023-08-15T12:00:00Z",
      updated_at: "2026-06-19T05:00:00Z",
      pushed_at: "2026-06-19T05:00:00Z",
      size: 128000,
      stargazers_count: 1244,
      watchers_count: 1244,
      language: "TypeScript",
      forks_count: 98,
      open_issues_count: 12,
      qualityScore: 88,
    },
    {
      id: 103,
      name: "react-query-firebase",
      full_name: "alex-developer/react-query-firebase",
      html_url: "https://github.com",
      description: "React Query hooks for Firestore subscriptions and caching.",
      fork: false,
      created_at: "2024-06-10T14:30:00Z",
      updated_at: "2026-06-12T11:20:00Z",
      pushed_at: "2026-06-12T11:20:00Z",
      size: 15200,
      stargazers_count: 320,
      watchers_count: 320,
      language: "TypeScript",
      forks_count: 34,
      open_issues_count: 2,
      qualityScore: 95,
    },
    {
      id: 104,
      name: "go-performance-router",
      full_name: "alex-developer/go-performance-router",
      html_url: "https://github.com",
      description: "Ultra-fast radix tree backend router written in Go.",
      fork: false,
      created_at: "2023-11-20T09:15:00Z",
      updated_at: "2026-05-30T14:00:00Z",
      pushed_at: "2026-05-30T14:00:00Z",
      size: 8900,
      stargazers_count: 189,
      watchers_count: 189,
      language: "Go",
      forks_count: 22,
      open_issues_count: 1,
      qualityScore: 84,
    },
    {
      id: 105,
      name: "rust-image-compressor",
      full_name: "alex-developer/rust-image-compressor",
      html_url: "https://github.com",
      description: "CLI utility in Rust that compresses images into WebP/Avif format.",
      fork: false,
      created_at: "2024-09-05T16:00:00Z",
      updated_at: "2026-06-10T08:00:00Z",
      pushed_at: "2026-06-10T08:00:00Z",
      size: 32400,
      stargazers_count: 412,
      watchers_count: 412,
      language: "Rust",
      forks_count: 48,
      open_issues_count: 0,
      qualityScore: 97,
    },
    {
      id: 106,
      name: "tailwindcss-github-theme",
      full_name: "alex-developer/tailwindcss-github-theme",
      html_url: "https://github.com",
      description: "Official tailwind plugin to import GitHub's primer color scales.",
      fork: true,
      created_at: "2022-05-02T10:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
      pushed_at: "2025-01-01T00:00:00Z",
      size: 1800,
      stargazers_count: 45,
      watchers_count: 45,
      language: "JavaScript",
      forks_count: 8,
      open_issues_count: 0,
      qualityScore: 60,
    }
  ];

  const languages: LanguageStat[] = [
    { name: "TypeScript", bytes: 188400, percentage: 82, color: "#3178c6" },
    { name: "Rust", bytes: 32400, percentage: 14, color: "#dea584" },
    { name: "Go", bytes: 8900, percentage: 3, color: "#00ADD8" },
    { name: "JavaScript", bytes: 1800, percentage: 1, color: "#f1e05a" },
  ];

  // Generate 90 days of contribution metrics
  const dailyContributions: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    // Alex commits heavily on Mon-Fri, occasionally on weekends
    const rand = Math.random();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (rand > 0.7) {
        dailyContributions[dStr] = Math.floor(Math.random() * 3) + 1;
      }
    } else {
      if (rand > 0.25) {
        dailyContributions[dStr] = Math.floor(Math.random() * 6) + 1;
      }
    }
  }

  const contributions: ContributionStats = {
    totalCommits: 642,
    totalPRs: 84,
    totalIssues: 28,
    totalStarsEarned: 3066,
    totalForksEarned: 352,
    activeMonthsCount: 12,
    longestStreak: 45,
    currentStreak: 8,
    dailyContributions,
  };

  const score: DeveloperScore = calculateDeveloperScore(repositories, contributions, profile.followers);

  const aiInsights: AIInsights = {
    strengths: [
      "Excellent documentation habits (100% repository description and README coverage).",
      "High community validation (3,000+ stars accumulated on original codebases).",
      "Polyglot execution across front-end frameworks and low-level systems programming."
    ],
    weaknesses: [
      "Heavy reliance on GitHub Actions defaults; could explore custom pipeline scripting.",
      "Minimal activity on packages outside the primary frontend/backend boundaries."
    ],
    recommendations: [
      "Configure advanced telemetry/observability in go-performance-router to benchmark metrics.",
      "Package rust-image-compressor as an NPM WASM package to bridge the two languages.",
      "Submit core features to the Next.js/Vercel upstream repositories directly to scale Open Source score."
    ],
    suggestedTechnologies: ["Rust (WASM)", "Next.js 15 (App Router)", "Go Router", "GitHub Actions CI/CD", "Docker / Kubernetes"],
    opportunities: ["Go Router", "Kubernetes", "Prometheus", "Grafana", "WebAssembly"],
    careerRecommendations: ["Principal Engineer", "Cloud Architect", "Lead Systems Architect"],
    careerDirection: "Lead Fullstack / Systems Architect",
    learningRoadmap: [
      {
        stage: "Stage 1: WebAssembly & Edge Execution",
        topics: [
          "Compiling Rust crates to WebAssembly (wasm-bindgen).",
          "Deploying high-speed edge computing worker modules.",
          "Analyzing performance gains on image manipulation tasks."
        ],
        duration: "4 weeks"
      },
      {
        stage: "Stage 2: Advanced Platform Engineering",
        topics: [
          "Deploying and orchestrating Go services via Kubernetes clusters.",
          "Configuring Prometheus and Grafana for real-time traffic monitoring.",
          "Setting up custom VPCs and cloud network architecture."
        ],
        duration: "6 weeks"
      }
    ],
    growthForecast: {
      currentScore: 92,
      forecastMonths: [
        { month: "Jan", score: 92 },
        { month: "Feb", score: 93 },
        { month: "Mar", score: 95 },
        { month: "Apr", score: 96 },
        { month: "May", score: 97 },
        { month: "Jun", score: 98 }
      ],
      summary: "By optimizing documentation coverage and contributing regularly to external repositories, your score is projected to reach 98 in the next six months."
    }
  };

  const wrapped = {
    year: today.getFullYear(),
    mostUsedLanguage: "TypeScript",
    mostActiveRepo: "framer-motion-builder",
    longestStreak: 45,
    biggestAchievement: "Open Source Maverick",
    achievementDescription: "Accumulated over 3,000 community stargazers and maintained a 45-day code streak.",
    contributionSummary: "You authored code in TypeScript, Rust, Go, and JavaScript, generating 642 version control commits across 42 repositories.",
    totalCommits: 642,
    percentileText: "You ranked in the top 1.8% of global GitHub contributors this year."
  };

  return {
    profile,
    repositories,
    languages,
    contributions,
    score,
    aiInsights,
    wrapped,
  };
}
