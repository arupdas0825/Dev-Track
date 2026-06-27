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

export interface CategoryScore {
  score: number;
  maxScore: number;
  reason: string;
}

export interface DeveloperScore {
  overall: number; // Total out of 100
  grade: string; // S, A+, A, B+, B, C+, C, D, or Grade unavailable
  isAvailable: boolean;
  revalidated: boolean;
  mismatchDetected?: boolean;
  categories: {
    consistency: CategoryScore;      // Max 20
    repoQuality: CategoryScore;      // Max 20
    openSource: CategoryScore;       // Max 15
    communityImpact: CategoryScore;  // Max 15
    documentation: CategoryScore;    // Max 10
    diversity: CategoryScore;        // Max 10
    projectScale: CategoryScore;     // Max 10
  };
  // Backward compatibility convenience properties
  consistency: number;
  repoQuality: number;
  diversity: number;
  openSource: number;
  communityImpact: number;
  documentation: number;
  projectScale: number;
  complexity: number;
  breakdown: {
    consistencyReason: string;
    repoQualityReason: string;
    diversityReason: string;
    openSourceReason: string;
    complexityReason: string;
    communityImpactReason: string;
    documentationReason: string;
    projectScaleReason?: string;
  };
}

export interface AIInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  suggestedTechnologies: string[];
  opportunities: string[];
  careerRecommendations: string[];
  careerDirection: string;
  learningRoadmap: {
    stage: string;
    topics: string[];
    duration: string;
  }[];
  growthForecast: {
    currentScore: number;
    forecastMonths: { month: string; score: number }[];
    summary: string;
  };
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
