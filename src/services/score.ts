import { GitHubRepository, ContributionStats, DeveloperScore } from "../types";

export function mapScoreToGrade(score: number): string {
  if (score >= 95) return "S";
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "C+";
  if (score >= 65) return "C";
  return "D";
}

export function calculateDeveloperScore(
  repos: GitHubRepository[],
  contributions: ContributionStats | null,
  followers: number = 0
): DeveloperScore {
  if (!contributions) {
    return {
      overall: 0,
      grade: "Not Available from GitHub",
      isAvailable: false,
      revalidated: false,
      categories: {
        consistency: { score: 0, maxScore: 20, reason: "No contribution telemetry recorded." },
        repoQuality: { score: 0, maxScore: 20, reason: "No repository metrics indexed." },
        openSource: { score: 0, maxScore: 15, reason: "No open source telemetry indexed." },
        communityImpact: { score: 0, maxScore: 15, reason: "No audience or star metrics indexed." },
        documentation: { score: 0, maxScore: 10, reason: "No documentation telemetry indexed." },
        diversity: { score: 0, maxScore: 10, reason: "No language diversity metrics indexed." },
        projectScale: { score: 0, maxScore: 10, reason: "No project volume metrics indexed." },
      },
      consistency: 0,
      repoQuality: 0,
      diversity: 0,
      openSource: 0,
      communityImpact: 0,
      documentation: 0,
      projectScale: 0,
      complexity: 0,
      breakdown: {
        consistencyReason: "Not Available from GitHub",
        repoQualityReason: "Not Available from GitHub",
        diversityReason: "Not Available from GitHub",
        openSourceReason: "Not Available from GitHub",
        complexityReason: "Not Available from GitHub",
        communityImpactReason: "Not Available from GitHub",
        documentationReason: "Not Available from GitHub",
        projectScaleReason: "Not Available from GitHub",
      },
    };
  }

  // 1. Contribution Consistency (Max 20 pts)
  // Commits weight (max 12 pts for 1000 annual commits), streak weight (max 8 pts for 60-day streak)
  const commitPts = Math.min(12, (contributions.totalCommits / 1000) * 12);
  const streakPts = Math.min(8, (contributions.longestStreak / 60) * 8);
  const consistencyScore = Math.round(Math.min(20, commitPts + streakPts));
  const consistencyReason = `Scored ${consistencyScore}/20 based on ${contributions.totalCommits} commits and a ${contributions.longestStreak}-day longest streak.`;

  // 2. Repository Quality (Max 20 pts)
  // Avg stars per repo & original project ratio (max 20 pts)
  let repoQualityScore = 0;
  let repoQualityReason = "No public repositories found.";
  if (repos.length > 0) {
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const avgStars = totalStars / repos.length;
    const starPts = Math.min(12, totalStars > 0 ? Math.log10(totalStars + 1) * 6 : 0);
    const originalRepos = repos.filter(r => !r.fork).length;
    const originalRatio = originalRepos / repos.length;
    const originalPts = originalRatio * 8;
    repoQualityScore = Math.round(Math.min(20, starPts + originalPts));
    repoQualityReason = `Scored ${repoQualityScore}/20 with ${originalRepos}/${repos.length} original builds and ${avgStars.toFixed(1)} average stars/repo.`;
  }

  // 3. Open Source Activity (Max 15 pts)
  // Pull requests (max 10 pts for 40 PRs), issues raised (max 5 pts for 20 issues)
  const prPts = Math.min(10, (contributions.totalPRs / 40) * 10);
  const issuePts = Math.min(5, (contributions.totalIssues / 20) * 5);
  const openSourceScore = Math.round(Math.min(15, prPts + issuePts));
  const openSourceReason = `Scored ${openSourceScore}/15 reflecting ${contributions.totalPRs} pull request interactions and ${contributions.totalIssues} issue reports.`;

  // 4. Community Impact (Max 15 pts)
  // Stargazers earned across repos (max 10 pts log scale for 100 stars), followers count (max 5 pts for 100 followers)
  const totalStarsEarned = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const starImpactPts = Math.min(10, totalStarsEarned > 0 ? Math.log10(totalStarsEarned + 1) * 5 : 0);
  const followerPts = Math.min(5, (followers / 100) * 5);
  const communityImpactScore = Math.round(Math.min(15, starImpactPts + followerPts));
  const communityImpactReason = `Scored ${communityImpactScore}/15 across ${totalStarsEarned} stargazers earned and ${followers} network followers.`;

  // 5. Documentation Hygiene (Max 10 pts)
  // Repos with description coverage (max 6 pts), repos with substantial size/structure (max 4 pts for 20MB avg)
  let documentationScore = 0;
  let documentationReason = "No repositories available for documentation analysis.";
  if (repos.length > 0) {
    const withDesc = repos.filter(r => r.description && r.description.trim().length > 0).length;
    const descPts = (withDesc / repos.length) * 6;
    const totalKB = repos.reduce((acc, r) => acc + (r.size || 0), 0);
    const avgKB = totalKB / repos.length;
    const sizePts = Math.min(4, (avgKB / 20000) * 4);
    documentationScore = Math.round(Math.min(10, descPts + sizePts));
    documentationReason = `Scored ${documentationScore}/10 with ${withDesc}/${repos.length} repos featuring indexed descriptions.`;
  }

  // 6. Technical Diversity (Max 10 pts)
  // Unique programming languages count & stack balance (max 10 pts for 4+ major runtimes)
  const languageSet = new Set<string>();
  repos.forEach(r => {
    if (r.language) languageSet.add(r.language);
  });
  const uniqueCount = languageSet.size;
  const langCountPts = Math.min(6, (uniqueCount / 4) * 6);
  const balancePts = uniqueCount > 1 ? Math.min(4, uniqueCount * 1.0) : (uniqueCount === 1 ? 2.0 : 0);
  const diversityScore = Math.round(Math.min(10, langCountPts + balancePts));
  const diversityReason = `Scored ${diversityScore}/10 across ${uniqueCount} active runtime languages.`;

  // 7. Project Scale (Max 10 pts)
  // Public repository volume (max 5 pts for 20 repos), cumulative codebase size (max 5 pts for 100MB)
  const totalKB = repos.reduce((acc, r) => acc + (r.size || 0), 0);
  const repoVolPts = Math.min(5, (repos.length / 20) * 5);
  const codeScalePts = Math.min(5, (totalKB / 100000) * 5);
  const projectScaleScore = Math.round(Math.min(10, repoVolPts + codeScalePts));
  const projectScaleReason = `Scored ${projectScaleScore}/10 indexing ${repos.length} public codebases totaling ${(totalKB / 1024).toFixed(1)} MB.`;

  // Total Score (Sum of all 7 categories out of 100)
  const overall = Math.min(
    100,
    consistencyScore +
      repoQualityScore +
      openSourceScore +
      communityImpactScore +
      documentationScore +
      diversityScore +
      projectScaleScore
  );

  const grade = mapScoreToGrade(overall);

  // Scaled values out of 100 for backward compatibility with progress bar components
  const legacyConsistency = Math.round((consistencyScore / 20) * 100);
  const legacyRepoQuality = Math.round((repoQualityScore / 20) * 100);
  const legacyDiversity = Math.round((diversityScore / 10) * 100);
  const legacyOpenSource = Math.round((openSourceScore / 15) * 100);
  const legacyCommunityImpact = Math.round((communityImpactScore / 15) * 100);
  const legacyDocumentation = Math.round((documentationScore / 10) * 100);
  const legacyProjectScale = Math.round((projectScaleScore / 10) * 100);

  return {
    overall,
    grade,
    isAvailable: true,
    revalidated: true,
    categories: {
      consistency: { score: consistencyScore, maxScore: 20, reason: consistencyReason },
      repoQuality: { score: repoQualityScore, maxScore: 20, reason: repoQualityReason },
      openSource: { score: openSourceScore, maxScore: 15, reason: openSourceReason },
      communityImpact: { score: communityImpactScore, maxScore: 15, reason: communityImpactReason },
      documentation: { score: documentationScore, maxScore: 10, reason: documentationReason },
      diversity: { score: diversityScore, maxScore: 10, reason: diversityReason },
      projectScale: { score: projectScaleScore, maxScore: 10, reason: projectScaleReason },
    },
    consistency: legacyConsistency,
    repoQuality: legacyRepoQuality,
    diversity: legacyDiversity,
    openSource: legacyOpenSource,
    communityImpact: legacyCommunityImpact,
    documentation: legacyDocumentation,
    projectScale: legacyProjectScale,
    complexity: legacyRepoQuality,
    breakdown: {
      consistencyReason,
      repoQualityReason,
      diversityReason,
      openSourceReason,
      complexityReason: repoQualityReason,
      communityImpactReason,
      documentationReason,
      projectScaleReason,
    },
  };
}
