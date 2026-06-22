import { GitHubRepository, LanguageStat, DeveloperScore, ContributionStats, AIInsights } from "../types";

export function generateAIInsights(
  repos: GitHubRepository[],
  languages: LanguageStat[],
  score: DeveloperScore,
  contributions: ContributionStats
): AIInsights {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const opportunities: string[] = [];
  const careerRecommendations: string[] = [];
  const suggestedTechnologies: string[] = [];

  const topLanguage = languages.length > 0 ? languages[0].name : "None";

  // 1. Strengths
  if (score.consistency >= 80) {
    strengths.push("Excellent engineering velocity: exceptional habit retention and continuous commit streaks.");
  } else if (contributions.totalCommits > 150) {
    strengths.push("Healthy version control commit density over the past 365 days.");
  }

  if (score.repoQuality >= 80) {
    strengths.push("High codebase standard: repositories feature rich original source files and minimal forks.");
  }
  if (score.diversity >= 75) {
    strengths.push("Polyglot profile: comfortable running applications across diverse programming languages.");
  } else if (topLanguage !== "None") {
    strengths.push(`Deep domain specialization: specialized expertise in the ${topLanguage} runtime ecosystem.`);
  }

  if (score.openSource >= 70) {
    strengths.push("Active community integration: code patches and PR collaborations merged in remote repos.");
  }
  if (score.documentation >= 80) {
    strengths.push("High-fidelity repository indexing: detailed project descriptors and documentation layouts.");
  }

  // Fallbacks
  if (strengths.length < 2) {
    strengths.push("Self-driven product builder: directly launches public code repositories.");
    strengths.push("Familiarity with standard Git version control workflows.");
  }

  // 2. Weaknesses
  if (score.consistency < 60) {
    weaknesses.push("Sporadic active days: activity gaps decrease coding habit momentum.");
  }
  if (score.documentation < 60) {
    weaknesses.push("Sparse project metadata: repositories missing descriptions or usage summaries.");
  }
  if (score.diversity < 50 && languages.length <= 1) {
    weaknesses.push("Monolithic language stack: limits flexibility in building cross-platform applications.");
  }
  if (score.openSource < 50) {
    weaknesses.push("Low collaborative contribution footprint; few public pull request merges.");
  }
  if (score.repoQuality < 50) {
    weaknesses.push("High fork ratio: repository index relies on cloned project forks rather than original builds.");
  }

  if (weaknesses.length === 0) {
    weaknesses.push("No major vulnerabilities detected; scale community resonance and PR contributions.");
  }

  // 3. Career Recommendations & Suggested Technologies
  let primaryStack = "Fullstack";
  if (topLanguage === "JavaScript" || topLanguage === "TypeScript" || topLanguage === "HTML") {
    primaryStack = "Web Frontend/Fullstack";
    careerRecommendations.push("Frontend Engineer", "Full-Stack Web Developer", "UI Platform Engineer");
    suggestedTechnologies.push("Next.js", "TypeScript", "TailwindCSS", "React Server Components", "Prisma", "PostgreSQL");
    opportunities.push("Rust (WebAssembly binding)", "Go (high-speed APIs)", "Docker (container orchestration)", "Supabase / Firebase");
  } else if (topLanguage === "Python") {
    primaryStack = "Data Science/AI Back-end";
    careerRecommendations.push("Machine Learning Engineer", "Data Scientist", "AI Integrations Developer");
    suggestedTechnologies.push("FastAPI", "PyTorch", "NumPy & Pandas", "Docker", "LangChain", "Supabase");
    opportunities.push("TypeScript (Frontend client integrations)", "PostgreSQL (vector database indexing)", "Kubernetes (model scaling)");
  } else if (topLanguage === "Go") {
    primaryStack = "Systems Platform/APIs";
    careerRecommendations.push("Platform Engineer", "Distributed Systems Developer", "DevOps / Infrastructure Engineer");
    suggestedTechnologies.push("Golang", "gRPC", "Docker / Kubernetes", "Redis caching", "Apache Kafka", "PostgreSQL");
    opportunities.push("Rust (memory-safe extensions)", "AWS ECS / Terraform", "Next.js (administration dashboard dashboards)");
  } else if (topLanguage === "Rust") {
    primaryStack = "Systems Programming/Edge Core";
    careerRecommendations.push("Systems Programmer", "Core Back-end Architect", "WASM Platform Developer");
    suggestedTechnologies.push("Rust (Tokio)", "WebAssembly (WASM)", "Tauri Desktop framework", "Docker", "PostgreSQL");
    opportunities.push("TypeScript (frontend UI bindings)", "Go (concurrency networks)", "GitHub Actions CI/CD automated validation");
  } else if (topLanguage === "Java" || topLanguage === "C#") {
    primaryStack = "Enterprise Systems/Back-end";
    careerRecommendations.push("Enterprise Software Architect", "Backend Systems Engineer", "Solutions Architect");
    suggestedTechnologies.push("Spring Boot / .NET Core", "Microservices architecture", "Docker", "AWS Cloud Services", "PostgreSQL");
    opportunities.push("TypeScript (modern dashboard overlays)", "Redis (distributed session caches)", "Kubernetes container systems");
  } else {
    primaryStack = "Software Development";
    careerRecommendations.push("Full-Stack Software Engineer", "Systems Engineer", "Application Developer");
    suggestedTechnologies.push("TypeScript", "React", "Node.js", "Docker", "PostgreSQL", "GitHub Actions");
    opportunities.push("Go (performance microservices)", "TailwindCSS V4", "Supabase authentication structures");
  }

  // Recommendations
  if (score.consistency < 70) {
    recommendations.push("Establish a regular version control cadence; commit at least 3 days per week.");
  }
  if (score.documentation < 70) {
    recommendations.push("Provide descriptive headers and step-by-step setup guides in repository README files.");
  }
  if (score.diversity < 60) {
    recommendations.push(`Augment your ${topLanguage} skills by learning an ecosystem complement (e.g. TypeScript or Go).`);
  }
  if (score.openSource < 60) {
    recommendations.push("Contribute to active public open-source libraries. Start with 'good first issue' flags.");
  }
  recommendations.push("Integrate automated unit tests and CI/CD pipelines (GitHub Actions) to verify code checkouts.");

  // 4. Personalized learning roadmap (30 days, 90 days, 180 days, 1 year)
  const learningRoadmap = [
    {
      duration: "30 Days",
      stage: "Core Engineering Practices",
      topics: [
        `Master advanced design patterns in ${topLanguage || "your core language"}.`,
        "Clean up repository descriptions, licensing, and write detailed README setup instructions.",
        "Add automated code style linting (ESLint, Prettier, or Ruff) to your primary repositories."
      ]
    },
    {
      duration: "90 Days",
      stage: "Fullstack Architecture",
      topics: [
        `Implement projects using ${suggestedTechnologies[0]} and ${suggestedTechnologies[1] || "relational databases"}.`,
        "Design scalable REST/GraphQL API architectures with proper error handling.",
        "Containerize local development servers using Docker files."
      ]
    },
    {
      duration: "180 Days",
      stage: "Production Orchestration",
      topics: [
        "Create automated GitHub Actions to run test suites on repository pull requests.",
        "Configure distributed caching (Redis) or real-time pub/sub synchronization.",
        "Deploy applications on serverless edge networks (Vercel, AWS ECS, or Fly.io)."
      ]
    },
    {
      duration: "1 Year",
      stage: "Open Source and Scale",
      topics: [
        "Actively contribute pull requests to upstream libraries in your stack.",
        "Publish a modular utility library (npm, PyPI, or go module) with automated package versioning.",
        "Orchestrate multi-service deployments using Kubernetes or serverless cloud platforms."
      ]
    }
  ];

  // 5. Growth Forecast simulation
  const currentScore = score.overall;
  const forecastMonths = [
    { month: "Current", score: currentScore },
    { month: "Month 1", score: Math.round(Math.min(100, currentScore + (100 - currentScore) * 0.12)) },
    { month: "Month 2", score: Math.round(Math.min(100, currentScore + (100 - currentScore) * 0.22)) },
    { month: "Month 3", score: Math.round(Math.min(100, currentScore + (100 - currentScore) * 0.32)) },
    { month: "Month 4", score: Math.round(Math.min(100, currentScore + (100 - currentScore) * 0.40)) },
    { month: "Month 5", score: Math.round(Math.min(100, currentScore + (100 - currentScore) * 0.47)) },
    { month: "Month 6", score: Math.round(Math.min(100, currentScore + (100 - currentScore) * 0.53)) }
  ];

  const forecastSummary = `Based on your ${primaryStack} codebase activity and documentation quality, if you fulfill the CI/CD and open-source contribution recommendations, your Developer Score is projected to grow from ${currentScore} to ${forecastMonths[6].score} (+${forecastMonths[6].score - currentScore}) within the next 6 months.`;

  return {
    strengths,
    weaknesses,
    recommendations,
    suggestedTechnologies,
    opportunities,
    careerRecommendations,
    careerDirection: `${primaryStack} Architect / Tech Lead`,
    learningRoadmap,
    growthForecast: {
      currentScore,
      forecastMonths,
      summary: forecastSummary
    }
  };
}
