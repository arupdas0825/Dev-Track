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
  const suggestedTechnologies: string[] = [];
  let careerDirection = "";

  // Get primary language
  const topLanguage = languages.length > 0 ? languages[0].name : "None";

  // Strengths analysis
  if (score.consistency >= 15) {
    strengths.push("Excellent coding consistency and habit retention (high activity streak).");
  } else if (contributions.totalCommits > 100) {
    strengths.push("Healthy absolute volume of version control contributions.");
  }

  if (score.repoQuality >= 15) {
    strengths.push("High-standard documentation habits with description coverage.");
  }
  if (score.diversity >= 15) {
    strengths.push("Polyglot profile with capability in multiple ecosystems.");
  } else if (topLanguage !== "None") {
    strengths.push(`Deep domain focus and specialization in the ${topLanguage} ecosystem.`);
  }

  if (score.openSource >= 15) {
    strengths.push("Solid community impact, attracting forks and collaboration.");
  }
  if (score.complexity >= 15) {
    strengths.push("Experience managing large codebase structures and heavy codebases.");
  }

  // Fallbacks if lists are sparse
  if (strengths.length < 2) {
    strengths.push("Independent project launcher with direct GitHub public repository history.");
    strengths.push("Familiarity with standard Git version control workflows.");
  }

  // Weaknesses analysis
  if (score.consistency < 10) {
    weaknesses.push("Low commit density and sporadic activity clusters.");
  }
  if (score.repoQuality < 10) {
    weaknesses.push("Poor repository documentation (missing README summaries or licenses).");
  }
  if (score.diversity < 10 && languages.length <= 1) {
    weaknesses.push("Monolithic language stack, limiting fullstack flexibility.");
  }
  if (score.openSource < 8) {
    weaknesses.push("Low cross-collaborative involvement; lacking public PR merges.");
  }
  if (score.complexity < 10) {
    weaknesses.push("Repository portfolio consists mostly of small demo files or forks.");
  }

  // Fallbacks for weaknesses
  if (weaknesses.length === 0) {
    weaknesses.push("No major technical critical alerts detected. Focus on community scaling.");
  }

  // Recommendations
  if (score.consistency < 12) {
    recommendations.push("Establish a regular coding cadence; target at least 3 active commit days per week.");
  }
  if (score.repoQuality < 12) {
    recommendations.push("Spend time writing rich README files for your top 3 pins, explaining setup, architecture, and features.");
  }
  if (score.diversity < 12) {
    recommendations.push("Expand your horizons by learning a secondary language (e.g. TypeScript, Go, Rust, or Python) to complement your current stack.");
  }
  if (score.openSource < 12) {
    recommendations.push("Contribute to active public repositories. Start with 'good first issues' on libraries you use.");
  }
  if (score.complexity < 12) {
    recommendations.push("Consolidate small scripts into a single, cohesive, larger application to prove you can manage complex software architectures.");
  }

  // General recommendation
  recommendations.push("Set up automated GitHub Actions (CI/CD workflows) on your repositories to showcase modern DevOps understanding.");

  // Tech recommendations & Career Direction
  if (topLanguage === "JavaScript" || topLanguage === "TypeScript" || topLanguage === "HTML") {
    careerDirection = score.overall > 75 
      ? "Senior Full-Stack Web Engineer / Architect" 
      : "Full-Stack Web Developer";
    suggestedTechnologies.push("Next.js 15", "TypeScript", "Tailwind CSS", "GraphQL", "PostgreSQL", "Prisma ORM");
  } else if (topLanguage === "Python") {
    careerDirection = score.overall > 75 
      ? "Machine Learning Infrastructure Engineer" 
      : "Data Scientist / AI Developer";
    suggestedTechnologies.push("FastAPI", "PyTorch", "NumPy / Pandas", "Docker", "PostgreSQL", "LangChain");
  } else if (topLanguage === "Go") {
    careerDirection = "Backend Platform Engineer";
    suggestedTechnologies.push("Go (Golang)", "gRPC", "Docker / Kubernetes", "Redis", "Apache Kafka", "PostgreSQL");
  } else if (topLanguage === "Rust") {
    careerDirection = "Systems Programmer / Core Backend Engineer";
    suggestedTechnologies.push("Rust (Tokio)", "WASM (WebAssembly)", "WebGPU", "Docker", "SQLite", "Tauri");
  } else if (topLanguage === "Java" || topLanguage === "C#") {
    careerDirection = "Enterprise Backend Developer / Solutions Architect";
    suggestedTechnologies.push("Spring Boot / .NET Core", "Microservices", "Docker", "Kubernetes", "AWS Cloud Services");
  } else {
    careerDirection = "Generalist Software Engineer";
    suggestedTechnologies.push("TypeScript", "React", "Node.js", "Docker", "SQLite", "GitHub Actions");
  }

  // Roadmap Stages
  const learningRoadmap = [
    {
      stage: "Stage 1: Foundational Strengthening",
      topics: [
        `Mastering advanced design patterns in ${topLanguage || "your core language"}.`,
        "Improving git documentation standard practices (clean commit messages, readme layouts).",
        "Writing core unit testing suites."
      ],
      duration: "4 weeks"
    },
    {
      stage: "Stage 2: Architecture & Integration",
      topics: [
        `Integrating intermediate tools: ${suggestedTechnologies[0]} and ${suggestedTechnologies[1] || "relational databases"}.`,
        "Designing RESTful and GraphQL API schemas.",
        "Understanding Docker containerization basics."
      ],
      duration: "6 weeks"
    },
    {
      stage: "Stage 3: DevOps & Open Source Scaling",
      topics: [
        "Configuring CI/CD pipelines (GitHub Actions, linters, and checkers).",
        "Creating active PR submissions to popular open-source libraries.",
        "Deploying services on modern hosting platforms (Vercel, AWS, or Fly.io)."
      ],
      duration: "6 weeks"
    }
  ];

  return {
    strengths,
    weaknesses,
    recommendations,
    suggestedTechnologies,
    careerDirection,
    learningRoadmap
  };
}
