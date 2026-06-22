import { GitHubRepository, ContributionStats, DeveloperScore } from "../types";

export function calculateDeveloperScore(
  repos: GitHubRepository[],
  contributions: ContributionStats,
  followers: number = 0
): DeveloperScore {
  // 1. Consistency (0-100)
  const commitScore = Math.min(50, (contributions.totalCommits / 250) * 50); // Max 50 points for 250 commits
  const streakScore = Math.min(50, (contributions.longestStreak / 25) * 50); // Max 50 points for 25-day streak
  const consistency = Math.round(commitScore + streakScore);
  
  let consistencyReason = "";
  if (consistency >= 85) {
    consistencyReason = "Exceptional habit loop: continuous contribution streaks and high push volume.";
  } else if (consistency >= 60) {
    consistencyReason = "Healthy commit regularity with moderate streak retention.";
  } else {
    consistencyReason = " sporadic activity patterns; establish a daily version control push routine.";
  }

  // 2. Repository Quality (0-100)
  let repoQuality = 0;
  let repoQualityReason = "";
  if (repos.length === 0) {
    repoQualityReason = "No public repositories found to evaluate codebase quality.";
  } else {
    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const avgStars = totalStars / repos.length;
    const starScore = Math.min(50, avgStars > 0 ? Math.log2(avgStars + 1) * 15 : 0); // Max 50 points log scale
    const originalRepos = repos.filter(r => !r.fork).length;
    const originalRatio = originalRepos / repos.length;
    const originalScore = originalRatio * 50; // Max 50 points for original projects ratio

    repoQuality = Math.round(starScore + originalScore);
    
    if (repoQuality >= 85) {
      repoQualityReason = "Premium repository portfolio containing community validation and high-fidelity original builds.";
    } else if (repoQuality >= 60) {
      repoQualityReason = "Solid codebase compilation; moderate community interest and original code ratio.";
    } else {
      repoQualityReason = "Curate original code projects and share them with the developer community to drive engagement.";
    }
  }

  // 3. Technical Diversity (0-100)
  let diversity = 0;
  let diversityReason = "";
  
  const languageBytes: Record<string, number> = {};
  repos.forEach(repo => {
    if (repo.language) {
      languageBytes[repo.language] = (languageBytes[repo.language] || 0) + (repo.size || 100);
    }
  });
  
  const uniqueLanguagesCount = Object.keys(languageBytes).length;
  const langCountScore = Math.min(50, (uniqueLanguagesCount / 5) * 50); // Max 50 points for 5 languages

  let balanceScore = 0;
  if (uniqueLanguagesCount > 0) {
    const totalBytes = Object.values(languageBytes).reduce((acc, bytes) => acc + bytes, 0);
    const shares = Object.values(languageBytes).map(bytes => bytes / (totalBytes || 1));
    const entropy = -shares.reduce((acc, share) => acc + (share > 0 ? share * Math.log(share) : 0), 0);
    balanceScore = Math.min(50, (entropy / 1.5) * 50); // Max 50 points for balanced stack
  }

  diversity = Math.round(langCountScore + balanceScore);
  
  if (diversity >= 85) {
    diversityReason = "Elite polyglot engineer with deep capability spread across multiple systems and runtime environments.";
  } else if (diversity >= 60) {
    diversityReason = "Balanced language ecosystem; skilled in one primary stack with several auxiliary languages.";
  } else {
    diversityReason = "Highly specialized developer; consider writing secondary microservices in Go, Rust, or Python.";
  }

  // 4. Open Source Activity (0-100)
  const prScore = Math.min(60, (contributions.totalPRs / 15) * 60); // Max 60 points for 15 PR merges
  const issueScore = Math.min(40, (contributions.totalIssues / 10) * 40); // Max 40 points for 10 issues raised
  const openSource = Math.round(prScore + issueScore);

  let openSourceReason = "";
  if (openSource >= 85) {
    openSourceReason = "Excellent community collaborations: numerous open-source pull request merges and reports.";
  } else if (openSource >= 50) {
    openSourceReason = "Moderate collaborative reach; has submitted code patches and issues to shared codebases.";
  } else {
    openSourceReason = "Focused on closed repositories; start submitting bug fixes or feature requests to public npm/pip packages.";
  }

  // 5. Community Impact (0-100)
  const totalStarsEarned = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const starsScore = Math.min(50, totalStarsEarned > 0 ? Math.log2(totalStarsEarned + 1) * 12.5 : 0); // Log scale stars, max 50 points
  const followersScore = Math.min(50, (followers / 50) * 50); // Max 50 points for 50 followers
  const communityImpact = Math.round(starsScore + followersScore);

  let communityImpactReason = "";
  if (communityImpact >= 80) {
    communityImpactReason = "Exceptional reach: codebase validation through stargazers and developer audience retention.";
  } else if (communityImpact >= 40) {
    communityImpactReason = "Moderate public resonance; attracting initial stargazers and network follows.";
  } else {
    communityImpactReason = "Early-stage network reach; build modular utilities and write dev blogs to scale public developer network.";
  }

  // 6. Documentation Quality (0-100)
  let documentation = 0;
  let documentationReason = "";
  if (repos.length === 0) {
    documentationReason = "No repository data available to index documentation quality.";
  } else {
    const reposWithDesc = repos.filter(r => r.description && r.description.trim().length > 0).length;
    const descRatio = reposWithDesc / repos.length;
    const descScore = descRatio * 60; // Max 60 points for full description coverage

    const totalSize = repos.reduce((acc, r) => acc + r.size, 0);
    const avgSize = totalSize / repos.length;
    const sizeScore = Math.min(40, (avgSize / 15000) * 40 || 10); // Codebase size proxy for content weight, max 40 points

    documentation = Math.round(descScore + sizeScore);

    if (documentation >= 85) {
      documentationReason = "Impeccable documentation hygiene: 100% repository summary description coverage and configuration files.";
    } else if (documentation >= 60) {
      documentationReason = "Good project indexing; most pinned projects feature descriptions and structure.";
    } else {
      documentationReason = "Codebases lack indexing descriptions; write concise repository summaries to improve searchability.";
    }
  }

  // Aggregate overall developer score as average of the 6 dimensions
  const overall = Math.round(
    (consistency + repoQuality + diversity + openSource + communityImpact + documentation) / 6
  );

  // Keep complexity for DB structure / backward compatibility
  const complexity = repoQuality; // Maps to repo quality out of 100
  const complexityReason = repoQualityReason;

  return {
    overall: Math.max(10, Math.min(100, overall)),
    consistency,
    repoQuality,
    diversity,
    openSource,
    complexity,
    communityImpact,
    documentation,
    breakdown: {
      consistencyReason,
      repoQualityReason,
      diversityReason,
      openSourceReason,
      complexityReason,
      communityImpactReason,
      documentationReason,
    },
  };
}
