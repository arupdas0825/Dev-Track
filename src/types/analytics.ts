import { GitHubProfile, GitHubRepository, LanguageStat } from "./github";

export interface ContributionStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStarsEarned: number;
  totalForksEarned: number;
  activeMonthsCount: number;
  longestStreak: number;
  currentStreak: number;
  dailyContributions: Record<string, number>;
}

export interface DeveloperScore {
  overall: number;
  consistency: number;
  repoQuality: number;
  diversity: number;
  openSource: number;
  complexity: number;
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

export interface UserAnalyticsDoc {
  uid: string;
  username: string;
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  following: number;
  topLanguages: string[];
  languageDistribution: LanguageStat[];
  mostActiveLanguage: string;
  openSourceScore: number;
  activityScore: number;
  developerScore: number;
  scoreBreakdown: DeveloperScore;
  contributions: ContributionStats;
  aiInsights: AIInsights;
  wrapped: GitHubWrapped;
  updatedAt: string;
}
