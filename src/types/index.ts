export interface GitHubProfile {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number; // in KB
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  languages?: Record<string, number>; // language names mapped to byte size
  qualityScore?: number; // calculated repo quality score
}

export interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface ContributionStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStarsEarned: number;
  totalForksEarned: number;
  activeMonthsCount: number;
  longestStreak: number;
  currentStreak: number;
  dailyContributions: Record<string, number>; // YYYY-MM-DD to commit count
}

export interface DeveloperScore {
  overall: number; // 0 to 100
  consistency: number; // 0 to 20
  repoQuality: number; // 0 to 20
  diversity: number; // 0 to 20
  openSource: number; // 0 to 20
  complexity: number; // 0 to 20
  breakdown: {
    consistencyReason: string;
    repoQualityReason: string;
    diversityReason: string;
    openSourceReason: string;
    complexityReason: string;
  };
}

export interface AIInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  suggestedTechnologies: string[];
  careerDirection: string;
  learningRoadmap: {
    stage: string;
    topics: string[];
    duration: string;
  }[];
}

export interface GitHubWrapped {
  year: number;
  mostUsedLanguage: string;
  mostActiveRepo: string;
  longestStreak: number;
  biggestAchievement: string;
  achievementDescription: string;
  contributionSummary: string;
  totalCommits: number;
  percentileText: string;
}

export interface UserDashboardData {
  profile: GitHubProfile;
  repositories: GitHubRepository[];
  languages: LanguageStat[];
  contributions: ContributionStats;
  score: DeveloperScore;
  aiInsights: AIInsights;
  wrapped: GitHubWrapped;
}
