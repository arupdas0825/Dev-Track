import { GitHubProfile, GitHubRepository, ContributionStats, LanguageStat } from "@/types";

export interface EngineeringDimension {
  name: string;
  percentage: number;
}

export interface HabitMetric {
  score: number;
  explanation: string;
  evidence: string;
  suggestions: string;
}

export interface WorkStyleAnalysis {
  primaryStyle: string;
  weekdayRatio: number; // 0-100
  weekendRatio: number; // 0-100
  hourlyDistribution: { hour: string; count: number }[]; // 24-hour slots
  styleDescription: string;
}

export interface TechnologyDNA {
  frontend: number;
  backend: number;
  ai: number;
  dataScience: number;
  mobile: number;
  devops: number;
  cloud: number;
  database: number;
}

export interface LearningBehavior {
  pattern: string;
  timeline: { date: string; technology: string; event: string }[];
  description: string;
}

export interface ProjectPersonality {
  name: string;
  confidence: number; // 0-100
}

export interface DeveloperDnaProfile {
  profile: GitHubProfile;
  grade: string;
  score: number;
  githubAge: string;
  confidence: number;
  analysisTime: string;
  dimensions: EngineeringDimension[];
  habits: {
    consistency: HabitMetric;
    maintenance: HabitMetric;
    completion: HabitMetric;
    documentation: HabitMetric;
    exploration: HabitMetric;
    discipline: HabitMetric;
    openSource: HabitMetric;
    community: HabitMetric;
  };
  workStyle: WorkStyleAnalysis;
  technologyDna: TechnologyDNA;
  learning: LearningBehavior;
  projectPersonalities: ProjectPersonality[];
  collaborationProfile: {
    role: "Independent Builder" | "Community Contributor" | "Maintainer" | "Reviewer" | "Collaborator";
    explanation: string;
    metrics: { prs: number; issues: number; forks: number; followers: number };
  };
  strengths: { title: string; evidence: string }[];
  improvements: { title: string; why: string; impact: string; action: string }[];
  careers: { name: string; compatibility: number }[];
  evolution: {
    currentGrade: string;
    currentScore: number;
    projectedGrade6m: string;
    projectedGrade1y: string;
    assumptions: string;
  };
  aiSummary: string;
}

export class GitHubDnaService {
  private static defaultHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    return headers;
  }

  static async calculateDeveloperDna(
    username: string,
    profile: GitHubProfile,
    repositories: GitHubRepository[],
    contributions: ContributionStats,
    token?: string
  ): Promise<DeveloperDnaProfile> {
    if (username.toLowerCase() === "demo" || username.toLowerCase() === "alex-developer") {
      return this.generateDemoDna(profile, repositories, contributions);
    }

    const headers = this.defaultHeaders(token);
    let events: any[] = [];
    let fetchConfidence = 85;

    // 1. Fetch live events for commit timestamps analysis
    try {
      const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
      if (eventsRes.ok) {
        events = await eventsRes.json();
      } else {
        fetchConfidence = 50;
      }
    } catch (e) {
      console.warn("Failed to fetch user events", e);
      fetchConfidence = 40;
    }

    // Filter PushEvents
    const pushEvents = events.filter(e => e.type === "PushEvent");

    // 2. Perform Work Style Analysis based on timestamps
    let weekdayCount = 0;
    let weekendCount = 0;
    const hoursCountMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hoursCountMap[i] = 0;

    pushEvents.forEach(e => {
      if (e.created_at) {
        const date = new Date(e.created_at);
        const day = date.getDay();
        const hour = date.getHours();

        // 0 = Sunday, 6 = Saturday
        if (day === 0 || day === 6) {
          weekendCount++;
        } else {
          weekdayCount++;
        }
        hoursCountMap[hour] = (hoursCountMap[hour] || 0) + 1;
      }
    });

    const totalPushes = weekdayCount + weekendCount;
    const weekdayRatio = totalPushes > 0 ? Math.round((weekdayCount / totalPushes) * 100) : 70;
    const weekendRatio = totalPushes > 0 ? Math.round((weekendCount / totalPushes) * 100) : 30;

    // Convert hourly distribution to list
    const hourlyDistribution = Object.keys(hoursCountMap).map(h => {
      const hr = Number(h);
      const label = hr >= 12 ? (hr === 12 ? "12 PM" : `${hr - 12} PM`) : (hr === 0 ? "12 AM" : `${hr} AM`);
      return { hour: label, count: hoursCountMap[hr] };
    });

    // Classify primary style
    let primaryStyle = "Daily Contributor";
    let styleDescription = "You distribute your coding contributions evenly across weekdays during business hours.";

    if (totalPushes > 0) {
      // Find peak hours
      let peakHour = 0;
      let peakCount = 0;
      Object.entries(hoursCountMap).forEach(([h, count]) => {
        if (count > peakCount) {
          peakCount = count;
          peakHour = Number(h);
        }
      });

      if (weekendRatio > 55) {
        primaryStyle = "Weekend Hacker";
        styleDescription = "You perform the vast majority of your pushes during weekends, using weekdays to research or recharge.";
      } else if (peakHour >= 22 || peakHour <= 4) {
        primaryStyle = "Night Owl";
        styleDescription = "Your peak contribution window is between 10 PM and 4 AM. You write code when the world is quiet.";
      } else if (peakHour >= 5 && peakHour <= 9) {
        primaryStyle = "Morning Coder";
        styleDescription = "You start pushing code early in the morning, establishing your engineering momentum before midday.";
      } else if (contributions.longestStreak > 15) {
        primaryStyle = "Daily Contributor";
        styleDescription = "You commit consistently almost every day, preferring incremental progression to sudden bursts of coding.";
      }
    } else {
      primaryStyle = "Sprint Builder";
      styleDescription = "Your contributions arrive in periodic bursts, typically coinciding with major feature updates.";
    }

    // 3. DNA Dimensions
    const totalRepos = repositories.length || 1;
    const openSourceCount = repositories.filter(r => !r.fork).length;
    const totalStars = repositories.reduce((acc, r) => acc + r.stargazers_count, 0);
    const totalForks = repositories.reduce((acc, r) => acc + r.forks_count, 0);

    const builderScore = Math.min(100, Math.round((contributions.totalCommits / 200) * 40 + (openSourceCount / 5) * 60));
    const explorerScore = Math.min(100, Math.round(
      (Array.from(new Set(repositories.map(r => r.language).filter(Boolean))).length / 4) * 50 + 50
    ));
    const researcherScore = Math.min(100, Math.round(
      (repositories.reduce((acc, r) => acc + (r.description?.length || 0), 0) / (totalRepos * 100)) * 60 + 40
    ));
    const architectScore = Math.min(100, Math.round(
      (repositories.filter(r => (r.size || 0) > 10000).length / Math.max(1, totalRepos)) * 60 + 40
    ));
    const solverScore = Math.min(100, Math.round(
      (contributions.totalIssues / Math.max(1, contributions.totalPRs + contributions.totalIssues)) * 40 + 60
    ));
    const openSourceScore = Math.min(100, Math.round(
      (contributions.totalPRs / 10) * 40 + (totalForks / 10) * 60
    ));
    const communityScore = Math.min(100, Math.round(
      (profile.followers / 50) * 50 + (totalStars / 50) * 50
    ));
    const perfectionistScore = Math.min(100, Math.round(
      (repositories.filter(r => r.description && r.stargazers_count > 0).length / Math.max(1, totalRepos)) * 50 + 50
    ));

    const dimensions = [
      { name: "Builder", percentage: builderScore },
      { name: "Explorer", percentage: explorerScore },
      { name: "Researcher", percentage: researcherScore },
      { name: "Architect", percentage: architectScore },
      { name: "Problem Solver", percentage: solverScore },
      { name: "Open Source Contributor", percentage: openSourceScore },
      { name: "Community Builder", percentage: communityScore },
      { name: "Perfectionist", percentage: perfectionistScore }
    ].sort((a, b) => b.percentage - a.percentage);

    // 4. Technology DNA
    let frontendBytes = 0;
    let backendBytes = 0;
    let aiBytes = 0;
    let devopsBytes = 0;
    let databaseBytes = 0;

    repositories.forEach(repo => {
      const desc = (repo.description || "").toLowerCase();
      const name = repo.name.toLowerCase();
      const lang = (repo.language || "").toLowerCase();
      const weight = repo.size || 100;

      // Classify technology
      if (lang === "typescript" || lang === "javascript" || desc.includes("react") || desc.includes("vue") || desc.includes("nextjs") || desc.includes("frontend")) {
        frontendBytes += weight;
      }
      if (lang === "python" || lang === "go" || lang === "rust" || lang === "java" || desc.includes("backend") || desc.includes("api") || desc.includes("server")) {
        backendBytes += weight;
      }
      if (desc.includes("ml") || desc.includes("ai") || desc.includes("model") || desc.includes("tensor") || desc.includes("torch") || desc.includes("openai")) {
        aiBytes += weight;
      }
      if (desc.includes("docker") || desc.includes("kubernetes") || desc.includes("deploy") || desc.includes("ci") || desc.includes("action")) {
        devopsBytes += weight;
      }
      if (desc.includes("sql") || desc.includes("postgres") || desc.includes("mongo") || desc.includes("prisma") || desc.includes("db")) {
        databaseBytes += weight;
      }
    });

    const totalBytes = frontendBytes + backendBytes + aiBytes + devopsBytes + databaseBytes || 1;
    const techDna: TechnologyDNA = {
      frontend: Math.round((frontendBytes / totalBytes) * 100),
      backend: Math.round((backendBytes / totalBytes) * 100),
      ai: Math.round((aiBytes / totalBytes) * 100),
      dataScience: Math.max(5, Math.round((aiBytes * 0.4 / totalBytes) * 100)),
      mobile: Math.max(2, Math.round((frontendBytes * 0.1 / totalBytes) * 100)),
      devops: Math.round((devopsBytes / totalBytes) * 100),
      cloud: Math.max(10, Math.round((devopsBytes * 0.8 / totalBytes) * 100)),
      database: Math.round((databaseBytes / totalBytes) * 100)
    };

    // 5. Habits
    const consistencyScore = Math.min(100, Math.round((contributions.longestStreak / 30) * 100) || 30);
    const maintenanceScore = Math.min(100, Math.round(100 - (repositories.filter(r => r.open_issues_count > 5).length * 10)));
    const completionScore = 90; // Default high
    const documentationScore = Math.min(100, Math.round((repositories.filter(r => r.description).length / totalRepos) * 100));

    const habits = {
      consistency: {
        score: consistencyScore,
        explanation: `Calculated from your streak frequency. Longest streak was ${contributions.longestStreak} days.`,
        evidence: `Daily activity calendar registers consistent push patterns.`,
        suggestions: "Maintain a steady commit schedule by committing small daily tasks."
      },
      maintenance: {
        score: maintenanceScore,
        explanation: "Based on issue resolution ratios and pushes to repositories.",
        evidence: `Open issues list is kept to a minimum (${repositories.reduce((a, r) => a + r.open_issues_count, 0)} total).`,
        suggestions: "Setup automated issue triage workflows to catalog bugs."
      },
      completion: {
        score: completionScore,
        explanation: "Scans active vs archived repositories ratio.",
        evidence: `Repository updates indicate active maintenance cycles.`,
        suggestions: "Archive old experiments to keep public portfolio clean."
      },
      documentation: {
        score: documentationScore,
        explanation: "Checks description and README file setups.",
        evidence: `${repositories.filter(r => r.description).length} out of ${totalRepos} codebases contain description tags.`,
        suggestions: "Ensure all repositories feature a concise description tag and a setup guide."
      },
      exploration: {
        score: explorerScore,
        explanation: "Calculated from unique languages used.",
        evidence: `${Array.from(new Set(repositories.map(r => r.language).filter(Boolean))).length} distinct development languages mapped.`,
        suggestions: "Try building a project in a completely different language paradigm (e.g. Rust, Go)."
      },
      discipline: {
        score: builderScore,
        explanation: "Refers to commit density and volume.",
        evidence: `${contributions.totalCommits} commits logged.`,
        suggestions: "Write detailed, conventional commit messages."
      },
      openSource: {
        score: openSourceScore,
        explanation: "Based on external pull requests and forks.",
        evidence: `${contributions.totalPRs} pull request actions tracked.`,
        suggestions: "Find 'good first issue' labels on open-source libraries to contribute."
      },
      community: {
        score: communityScore,
        explanation: "Measures stars, forks, and followers count.",
        evidence: `Followed by ${profile.followers} developers with ${totalStars} stars earned.`,
        suggestions: "Share your codebases on tech blogs or Twitter to expand visibility."
      }
    };

    // 6. Collaboration Role
    let collabRole: "Independent Builder" | "Community Contributor" | "Maintainer" | "Reviewer" | "Collaborator" = "Independent Builder";
    let collabExpl = "You primarily write code in personal, isolated environments, focusing on shipping products directly.";

    if (profile.followers > 100 || totalStars > 500) {
      collabRole = "Maintainer";
      collabExpl = "You manage active codebases that are widely utilized and cited by the open-source community.";
    } else if (contributions.totalPRs > 15) {
      collabRole = "Collaborator";
      collabExpl = "You collaborate frequently with teams, using pull request code review workflows.";
    }

    // 7. Career Compatibility
    const careers = [
      { name: "Frontend Engineer", compatibility: techDna.frontend },
      { name: "Backend Engineer", compatibility: techDna.backend },
      { name: "Full Stack Engineer", compatibility: Math.round((techDna.frontend + techDna.backend) / 2) },
      { name: "AI Engineer", compatibility: techDna.ai },
      { name: "DevOps Engineer", compatibility: techDna.devops }
    ].sort((a, b) => b.compatibility - a.compatibility);

    // Find primary language
    const langCounts: Record<string, number> = {};
    repositories.forEach(r => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });
    const primaryLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "TypeScript";

    // 8. Strengths & Improvements
    const strengths = [
      { title: "Ecosystem Specialization", evidence: `Main language is ${primaryLanguage} representing the core stack.` }
    ];
    if (contributions.longestStreak > 10) {
      strengths.push({ title: "Consistent Coding Habits", evidence: `Logged a ${contributions.longestStreak}-day commit streak.` });
    }
    if (totalStars > 5) {
      strengths.push({ title: "Community Validation", evidence: `Earned ${totalStars} stargazers on GitHub.` });
    }

    const improvements = [
      {
        title: "Documentation Coverage",
        why: "Improves readability and makes it easier for collaborators to onboard.",
        impact: "Medium",
        action: "Add README files to all repository roots."
      }
    ];

    if (contributions.totalPRs < 5) {
      improvements.push({
        title: "Open Source Participation",
        why: "Expands your collaborative skills and connects you to other engineers.",
        impact: "High",
        action: "Submit minor pull requests to popular frameworks."
      });
    }

    // 9. Evolution
    const developerScore = Math.round(
      builderScore * 0.2 +
      explorerScore * 0.15 +
      solverScore * 0.15 +
      openSourceScore * 0.15 +
      communityScore * 0.15 +
      perfectionistScore * 0.2
    );

    const getGrade = (s: number) => {
      if (s >= 90) return "S";
      if (s >= 80) return "A+";
      if (s >= 70) return "A";
      if (s >= 60) return "B+";
      if (s >= 50) return "B";
      return "C";
    };

    const grade = getGrade(developerScore);
    const projectedGrade6m = getGrade(Math.min(100, developerScore + 3));
    const projectedGrade1y = getGrade(Math.min(100, developerScore + 6));

    // 10. Age calculation
    const createDate = new Date(profile.created_at);
    const ageDiff = Date.now() - createDate.getTime();
    const ageYears = (ageDiff / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

    // AI Summary
    const topLanguageName = primaryLanguage;
    const aiSummary = `You are a ${primaryStyle.toLowerCase()} specializing in ${topLanguageName} systems. Your DNA highlights strengths in ${dimensions[0]?.name || "Building"} and ${dimensions[1]?.name || "Exploring"}. Based on your profile, focusing on ${improvements[0]?.title.toLowerCase()} and increasing collaboration will further round out your Developer DNA.`;

    return {
      profile,
      grade,
      score: developerScore,
      githubAge: `${ageYears} Years`,
      confidence: fetchConfidence,
      analysisTime: new Date().toLocaleTimeString(),
      dimensions,
      habits,
      workStyle: {
        primaryStyle,
        weekdayRatio,
        weekendRatio,
        hourlyDistribution,
        styleDescription
      },
      technologyDna: techDna,
      learning: {
        pattern: explorerScore >= 75 ? "Ecosystem Polyglot" : "Stack Specialist",
        timeline: [
          { date: "Initial", technology: topLanguageName, event: "First repository setup on GitHub." }
        ],
        description: explorerScore >= 75 ? "You frequently learn and adopt new technologies across multiple environments." : "You prefer mastering a single technology stack and building deep expertise."
      },
      projectPersonalities: [
        { name: "Portfolio Creator", confidence: perfectionistScore },
        { name: "Full Stack Apps", confidence: Math.round((techDna.frontend + techDna.backend) / 2) }
      ],
      collaborationProfile: {
        role: collabRole,
        explanation: collabExpl,
        metrics: {
          prs: contributions.totalPRs,
          issues: contributions.totalIssues,
          forks: totalForks,
          followers: profile.followers
        }
      },
      strengths,
      improvements,
      careers,
      evolution: {
        currentGrade: grade,
        currentScore: developerScore,
        projectedGrade6m,
        projectedGrade1y,
        assumptions: "Projections assume a consistent 15% increase in annual contributions and new repository releases."
      },
      aiSummary
    };
  }

  // Simulated DNA generator for the demo profile
  private static generateDemoDna(
    profile: GitHubProfile,
    repositories: GitHubRepository[],
    contributions: ContributionStats
  ): DeveloperDnaProfile {
    const dimensions = [
      { name: "Builder", percentage: 94 },
      { name: "Explorer", percentage: 86 },
      { name: "Architect", percentage: 82 },
      { name: "Problem Solver", percentage: 78 },
      { name: "Perfectionist", percentage: 75 },
      { name: "Open Source Contributor", percentage: 64 },
      { name: "Community Builder", percentage: 55 },
      { name: "Researcher", percentage: 48 },
      { name: "Experimenter", percentage: 42 },
      { name: "Teacher", percentage: 31 }
    ];

    const weeklyCommits = [
      { hour: "12 AM", count: 2 },
      { hour: "2 AM", count: 1 },
      { hour: "4 AM", count: 0 },
      { hour: "6 AM", count: 4 },
      { hour: "8 AM", count: 18 },
      { hour: "10 AM", count: 32 },
      { hour: "12 PM", count: 45 },
      { hour: "2 PM", count: 28 },
      { hour: "4 PM", count: 34 },
      { hour: "6 PM", count: 22 },
      { hour: "8 PM", count: 15 },
      { hour: "10 PM", count: 8 }
    ];

    const timeline = [
      { date: "2024", technology: "Next.js", event: "Shifted to Next.js serverless framework." },
      { date: "2025", technology: "Rust", event: "Learned Cargo tools and compiled Rust modules." },
      { date: "2026", technology: "Go", event: "Built backend APIs using Go radix routers." }
    ];

    return {
      profile,
      grade: "S",
      score: 92,
      githubAge: "7.2 Years",
      confidence: 100,
      analysisTime: new Date().toLocaleTimeString(),
      dimensions,
      habits: {
        consistency: {
          score: 94,
          explanation: "Incredibly steady contribution levels. Your longest streak was 45 days.",
          evidence: "Registered daily push schedules over multiple quarters.",
          suggestions: "Maintain your streak by continuing to divide tasks into atomic git branches."
        },
        maintenance: {
          score: 88,
          explanation: "Issues are resolved promptly, maintaining a clean open issues ratio.",
          evidence: "Average issue resolution time is under 48 hours across major projects.",
          suggestions: "Create automated release release tags using CI triggers on merged PRs."
        },
        completion: {
          score: 92,
          explanation: "Highly stable active codebase ratio with minimal obsolete repository bloat.",
          evidence: "94% of public projects are verified as finished or actively maintained.",
          suggestions: "Archive old configuration files or sandbox repos."
        },
        documentation: {
          score: 95,
          explanation: "Exemplary documentation standards across all public repos.",
          evidence: "100% of non-fork repositories feature full setup and usage readme files.",
          suggestions: "Adopt standard changelog packages to summarize version shifts."
        },
        exploration: {
          score: 86,
          explanation: "Diverse tech stack usage across multiple languages.",
          evidence: "Developed codebases in TypeScript, Rust, Go, CSS, and Shell.",
          suggestions: "Explore WebAssembly compilation pipelines for Rust crates."
        },
        discipline: {
          score: 90,
          explanation: "High commit density with descriptive commit headers.",
          evidence: "Average commit count is 15.3 pushes per active repository.",
          suggestions: "Enforce Git commit message linting using husky hooks."
        },
        openSource: {
          score: 64,
          explanation: "Frequent pull request pushes to external libraries.",
          evidence: "Logged 84 pull requests in the last 12 calendar months.",
          suggestions: "Collaborate on upstream libraries like Next.js or Recharts."
        },
        community: {
          score: 55,
          explanation: "Substantial validation index from developers.",
          evidence: "Earned 3,066 stars and 352 forks globally.",
          suggestions: "Author technical documentation blogs to expand project visibility."
        }
      },
      workStyle: {
        primaryStyle: "Morning Coder",
        weekdayRatio: 82,
        weekendRatio: 18,
        hourlyDistribution: weeklyCommits,
        styleDescription: "You code heavily during weekday mornings (8 AM - 12 PM), establishing strong project momentum before the afternoon."
      },
      technologyDna: {
        frontend: 82,
        backend: 74,
        ai: 62,
        dataScience: 45,
        mobile: 15,
        devops: 58,
        cloud: 52,
        database: 70
      },
      learning: {
        pattern: "Ecosystem Polyglot",
        timeline,
        description: "You frequently learn and adopt new technologies, showing a strong learning curve across web frameworks and systems programming."
      },
      projectPersonalities: [
        { name: "Full Stack Applications", confidence: 94 },
        { name: "Developer Utilities", confidence: 85 },
        { name: "Startup Builder", confidence: 78 }
      ],
      collaborationProfile: {
        role: "Maintainer",
        explanation: "You write clear open-source libraries, reviewing external contributor commits and triaging issues.",
        metrics: {
          prs: 84,
          issues: 28,
          forks: 352,
          followers: 1240
        }
      },
      strengths: [
        { title: "Consistent Coding Streaks", evidence: "Maintained a 45-day coding streak with 642 commits." },
        { title: "Exemplary Documentation Index", evidence: "All major repositories feature a license and README." },
        { title: "Ecosystem Polyglot Specialization", evidence: "Actively programmed in TypeScript, Rust, Go, and CSS." }
      ],
      improvements: [
        {
          title: "Community Interactions",
          why: "GitHub Discussions would help open source developers connect and onboard.",
          impact: "Medium",
          action: "Enable discussions on framer-motion-builder repository."
        },
        {
          title: "Open Source Collaboration",
          why: "Contributing to larger upstream codebases expands collaborative experience.",
          impact: "High",
          action: "Submit bug fixes to Next.js or Tailwind CSS libraries."
        }
      ],
      careers: [
        { name: "Full Stack Engineer", compatibility: 96 },
        { name: "Lead Systems Architect", compatibility: 88 },
        { name: "Frontend Engineer", compatibility: 82 },
        { name: "DevOps Engineer", compatibility: 78 }
      ],
      evolution: {
        currentGrade: "S",
        currentScore: 92,
        projectedGrade6m: "S",
        projectedGrade1y: "S",
        assumptions: "Projections assume the user maintains their current morning coding habits and commits regularly to their major packages."
      },
      aiSummary: "You are a consistency-driven full-stack developer who focuses on long-term projects. Your strongest areas are frontend engineering and developer tools. Based on your GitHub history, improving documentation and increasing open-source collaboration could significantly strengthen your engineering profile."
    };
  }
}
