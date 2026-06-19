import { GitHubRepository, ContributionStats, DeveloperScore } from "../types";

export function calculateDeveloperScore(
  repos: GitHubRepository[],
  contributions: ContributionStats
): DeveloperScore {
  // 1. Consistency (Max 20)
  let consistency = 0;
  let consistencyReason = "";
  const commitScore = Math.min(10, (contributions.totalCommits / 200) * 10); // 200 commits for max points
  const streakScore = Math.min(10, (contributions.longestStreak / 21) * 10); // 21 days for max streak points
  consistency = Math.round(commitScore + streakScore);
  
  if (consistency >= 16) {
    consistencyReason = "High commit regularity and solid continuous contribution streak.";
  } else if (consistency >= 10) {
    consistencyReason = "Moderate activity. Keep pushing commits consistently to build a streak.";
  } else {
    consistencyReason = "Low push frequency. Establish a daily coding habit to increase momentum.";
  }

  // 2. Repository Quality (Max 20)
  let repoQuality = 0;
  let repoQualityReason = "";
  if (repos.length === 0) {
    repoQualityReason = "No public repositories found to evaluate quality.";
  } else {
    // Stars contribution: Log-like scale for realistic developer metrics
    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const avgStars = totalStars / repos.length;
    const starScore = Math.min(10, avgStars > 0 ? Math.log2(avgStars + 1) * 3 : 0);

    // Meta quality: ratio of repos with descriptions (indicating good documentation)
    const reposWithDesc = repos.filter(r => r.description && r.description.trim().length > 0).length;
    const descRatio = reposWithDesc / repos.length;
    const docScore = descRatio * 10;

    repoQuality = Math.round(starScore + docScore);
    
    if (repoQuality >= 15) {
      repoQualityReason = "Excellent repository curation with detailed documentation and community stars.";
    } else if (repoQuality >= 8) {
      repoQualityReason = "Good descriptions present, but community engagement (stars/forks) is low.";
    } else {
      repoQualityReason = "Improve repository readme descriptions and share projects to earn stars.";
    }
  }

  // 3. Technical Diversity (Max 20)
  let diversity = 0;
  let diversityReason = "";
  
  // Extract all unique languages
  const languageBytes: Record<string, number> = {};
  repos.forEach(repo => {
    if (repo.language) {
      languageBytes[repo.language] = (languageBytes[repo.language] || 0) + repo.size;
    }
  });
  
  const uniqueLanguagesCount = Object.keys(languageBytes).length;
  const langCountScore = Math.min(10, (uniqueLanguagesCount / 5) * 10); // 5 languages for max count points

  // Distribution balance: is the developer focused on one language or spread out?
  let balanceScore = 0;
  if (uniqueLanguagesCount > 0) {
    const totalBytes = Object.values(languageBytes).reduce((acc, bytes) => acc + bytes, 0);
    const shares = Object.values(languageBytes).map(bytes => bytes / (totalBytes || 1));
    // Calculate simple entropy
    const entropy = -shares.reduce((acc, share) => acc + share * Math.log(share || 1), 0);
    balanceScore = Math.min(10, (entropy / 1.5) * 10); // 1.5 entropy for max balance points
  }

  diversity = Math.round(langCountScore + balanceScore);
  
  if (diversity >= 15) {
    diversityReason = "Polyglot profile with balanced execution across multiple languages.";
  } else if (diversity >= 9) {
    diversityReason = "Good core stack with secondary language explorations.";
  } else {
    diversityReason = "Highly specialized. Consider exploring new frameworks or languages.";
  }

  // 4. Open Source Activity (Max 20)
  let openSource = 0;
  let openSourceReason = "";
  const totalForksEarned = repos.reduce((acc, r) => acc + r.forks_count, 0);
  const forkScore = Math.min(10, totalForksEarned > 0 ? Math.log2(totalForksEarned + 1) * 3.3 : 0);
  
  // PRs and Issues count as open source indicators
  const prIssueScore = Math.min(10, ((contributions.totalPRs + contributions.totalIssues) / 25) * 10);
  openSource = Math.round(forkScore + prIssueScore);

  if (openSource >= 15) {
    openSourceReason = "Exceptional community impact through PR collaborations and forks.";
  } else if (openSource >= 8) {
    openSourceReason = "Moderate collaboration. Contributed some issues or PRs.";
  } else {
    openSourceReason = "Mainly personal projects. Start contributing to upstream repos or library PRs.";
  }

  // 5. Project Complexity (Max 20)
  let complexity = 0;
  let complexityReason = "";
  if (repos.length === 0) {
    complexityReason = "No repository size or file details available to grade complexity.";
  } else {
    // Average repo size
    const totalSize = repos.reduce((acc, r) => acc + r.size, 0);
    const avgSize = totalSize / repos.length;
    // 50MB (50000 KB) average size yields full points (10)
    const sizeScore = Math.min(10, (avgSize / 50000) * 10 || 2); // Default base score of 2 if small

    // Source code to fork ratio: higher rating for original code
    const originalRepos = repos.filter(r => !r.fork).length;
    const originalRatio = repos.length > 0 ? originalRepos / repos.length : 1;
    const originalScore = originalRatio * 10;

    complexity = Math.round(sizeScore + originalScore);
    
    if (complexity >= 15) {
      complexityReason = "Heavy original codebases with substantial code volumes.";
    } else if (complexity >= 9) {
      complexityReason = "Moderate project sizes. A mix of original builds and clones.";
    } else {
      complexityReason = "Projects are relatively small or mostly forks. Expand project scopes.";
    }
  }

  // Aggregate
  const overall = Math.round(
    (consistency + repoQuality + diversity + openSource + complexity)
  );

  return {
    overall: Math.max(10, Math.min(100, overall)),
    consistency,
    repoQuality,
    diversity,
    openSource,
    complexity,
    breakdown: {
      consistencyReason,
      repoQualityReason,
      diversityReason,
      openSourceReason,
      complexityReason,
    },
  };
}
