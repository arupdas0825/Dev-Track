import { GitHubProfile, GitHubRepository, LanguageStat, ContributionStats, DeveloperScore, AIInsights, GitHubWrapped, UserAnalyticsDoc, UserDashboardData } from "@/types";
import { calculateDeveloperScore } from "../score";
import { generateAIInsights } from "../ai";

// Language color mapping
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

export class GitHubAnalyticsService {
  static aggregateLanguages(repos: GitHubRepository[]): LanguageStat[] {
    const languageBytes: Record<string, number> = {};
    let totalBytes = 0;

    repos.forEach(repo => {
      if (repo.language) {
        const weight = repo.size || 100;
        languageBytes[repo.language] = (languageBytes[repo.language] || 0) + weight;
        totalBytes += weight;
      }
    });

    const list = Object.keys(languageBytes).map(name => {
      const bytes = languageBytes[name];
      const percentage = totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0;
      return {
        name,
        bytes,
        percentage,
        color: LANGUAGE_COLORS[name] || "#888888",
      };
    });

    return list.sort((a, b) => b.bytes - a.bytes);
  }

  static mergeContributionStats(
    fetchedStats: ContributionStats,
    repos: GitHubRepository[]
  ): ContributionStats {
    const totalStarsEarned = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const totalForksEarned = repos.reduce((acc, r) => acc + r.forks_count, 0);
    return {
      ...fetchedStats,
      totalStarsEarned,
      totalForksEarned,
    };
  }

  static generateWrappedData(
    profile: GitHubProfile,
    repos: GitHubRepository[],
    contributions: ContributionStats,
    languages: LanguageStat[]
  ): GitHubWrapped {
    const year = new Date().getFullYear();
    const mostUsedLanguage = languages.length > 0 ? languages[0].name : "Markdown";
    
    let mostActiveRepo = "None";
    if (repos.length > 0) {
      const sortedRepos = [...repos].sort((a, b) => b.stargazers_count + b.forks_count - (a.stargazers_count + a.forks_count));
      mostActiveRepo = sortedRepos[0].name;
    }

    let biggestAchievement = "System Deployer";
    let achievementDescription = "Deployed multiple functional code bases to GitHub.";

    if (contributions.longestStreak > 20) {
      biggestAchievement = "Streak Champion";
      achievementDescription = `Maintained a dedication streak of ${contributions.longestStreak} days of writing code.`;
    } else if (contributions.totalStarsEarned > 10) {
      biggestAchievement = "Community Influencer";
      achievementDescription = `Accumulated ${contributions.totalStarsEarned} stargazers across your public codebases.`;
    } else if (repos.length > 15) {
      biggestAchievement = "Productive Builder";
      achievementDescription = `Successfully created and published ${repos.length} open-source packages.`;
    }

    let percentile = "top 15%";
    if (contributions.totalCommits > 500) percentile = "top 2%";
    else if (contributions.totalCommits > 200) percentile = "top 8%";
    else if (contributions.totalCommits > 50) percentile = "top 25%";

    return {
      year,
      mostUsedLanguage,
      mostActiveRepo,
      longestStreak: contributions.longestStreak,
      biggestAchievement,
      achievementDescription,
      contributionSummary: `You wrote code in ${languages.slice(0, 3).map(l => l.name).join(", ") || "various environments"}, committing ${contributions.totalCommits} times.`,
      totalCommits: contributions.totalCommits,
      percentileText: `You ranked in the ${percentile} of contributors this year.`,
    };
  }

  static calculateDashboardAnalytics(
    uid: string,
    profile: GitHubProfile,
    repos: GitHubRepository[],
    contributionsInput: ContributionStats
  ): { analyticsDoc: UserAnalyticsDoc; dashboardData: UserDashboardData } {
    const contributions = this.mergeContributionStats(contributionsInput, repos);
    const languages = this.aggregateLanguages(repos);
    const score = calculateDeveloperScore(repos, contributions, profile.followers);
    
    // Requirement 10: Compare calculated score against profile benchmarks and verify consistency
    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const expectedMinScore = totalStars > 50 || profile.followers > 100 ? 65 : 0;
    if (score.overall < expectedMinScore) {
      score.mismatchDetected = true;
      score.revalidated = true;
    }

    const aiInsights = generateAIInsights(repos, languages, score, contributions);
    const wrapped = this.generateWrappedData(profile, repos, contributions, languages);

    const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0);
    const topLanguages = languages.slice(0, 5).map(l => l.name);
    const mostActiveLanguage = languages.length > 0 ? languages[0].name : "None";

    const dashboardData: UserDashboardData = {
      profile,
      repositories: repos,
      languages,
      contributions,
      score,
      aiInsights,
      wrapped,
    };

    const analyticsDoc: UserAnalyticsDoc = {
      uid,
      username: profile.login.toLowerCase(),
      totalRepositories: repos.length,
      totalStars,
      totalForks,
      followers: profile.followers,
      following: profile.following,
      topLanguages,
      languageDistribution: languages,
      mostActiveLanguage,
      openSourceScore: score.openSource,
      activityScore: score.consistency,
      developerScore: score.overall,
      scoreBreakdown: score,
      contributions,
      aiInsights,
      wrapped,
      updatedAt: new Date().toISOString(),
    };

    return { analyticsDoc, dashboardData };
  }
}
