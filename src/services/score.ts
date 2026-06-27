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
      grade: "Grade unavailable",
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
        consistencyReason: "Data unavailable",
        repoQualityReason: "Data unavailable",
        diversityReason: "Data unavailable",
        openSourceReason: "Data unavailable",
        complexityReason: "Data unavailable",
        communityImpactReason: "Data unavailable",
        documentationReason: "Data unavailable",
        projectScaleReason: "Data unavailable",
      },
    };
  }

  // 1. Contribution Consistency (Max 20 pts)
  // Commits weight (max 10 pts for 200 commits), streak weight (max 10 pts for 20-day streak)
  const commitPts = Math.min(10, (contributions.totalCommits / 200) * 10);
  const streakPts = Math.min(10, (contributions.longestStreak / 20) * 10);
  const consistencyScore = Math.round(Math.min(20, commitPts + streakPts));
  const consistencyReason = `Scored ${consistencyScore}/20 based on ${contributions.totalCommits} commits and a ${contributions.longestStreak}-day longest streak.`;

  // 2. Repository Quality (Max 20 pts)
  // Avg stars per repo (max 10 pts log scale), Original project ratio (max 10 pts)
  let repoQualityScore = 0;
  let repoQualityReason = "No public repositories found.";
  if (repos.length > 0) {
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const avgStars = totalStars / repos.length;
    const starPts = Math.min(10, avgStars > 0 ? Math.log2(avgStars + 1) * 3 : 0);
    const originalRepos = repos.filter(r => !r.fork).length;
    const originalRatio = originalRepos / repos.length;
    const originalPts = originalRatio * 10;
    repoQualityScore = Math.round(Math.min(20, starPts + originalPts));
    repoQualityReason = `Scored ${repoQualityScore}/20 with ${originalRepos}/${repos.length} original builds and ${avgStars.toFixed(1)} average stars/repo.`;
  }

  // 3. Open Source Activity (Max 15 pts)
  // Pull requests merged/submitted (max 10 pts for 10 PRs), issues raised (max 5 pts for 5 issues)
  const prPts = Math.min(10, (contributions.totalPRs / 10) * 10);
  const issuePts = Math.min(5, (contributions.totalIssues / 5) * 5);
  const openSourceScore = Math.round(Math.min(15, prPts + issuePts));
  const openSourceReason = `Scored ${openSourceScore}/15 reflecting ${contributions.totalPRs} pull request interactions and ${contributions.totalIssues} issue reports.`;

  // 4. Community Impact (Max 15 pts)
  // Stargazers earned across repos (max 10 pts log scale), followers count (max 5 pts for 25 followers)
  const totalStarsEarned = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const starImpactPts = Math.min(10, totalStarsEarned > 0 ? Math.log2(totalStarsEarned + 1) * 2.5 : 0);
  const followerPts = Math.min(5, (followers / 25) * 5);
  const communityImpactScore = Math.round(Math.min(15, starImpactPts + followerPts));
  const communityImpactReason = `Scored ${communityImpactScore}/15 across ${totalStarsEarned} stargazers earned and ${followers} network followers.`;

  // 5. Documentation Hygiene (Max 10 pts)
  // Repos with description coverage (max 6 pts), repos with substantial size/structure (max 4 pts)
  let documentationScore = 0;
  let documentationReason = "No repositories available for documentation analysis.";
  if (repos.length > 0) {
    const withDesc = repos.filter(r => r.description && r.description.trim().length > 0).length;
    const descPts = (withDesc / repos.length) * 6;
    const totalKB = repos.reduce((acc, r) => acc + (r.size || 0), 0);
    const avgKB = totalKB / repos.length;
    const sizePts = Math.min(4, (avgKB / 5000) * 4);
    documentationScore = Math.round(Math.min(10, descPts + sizePts));
    documentationReason = `Scored ${documentationScore}/10 with ${withDesc}/${repos.length} repos featuring indexed descriptions.`;
  }

  // 6. Technical Diversity (Max 10 pts)
  // Unique programming languages count (max 5 pts for 5 langs), stack balance (max 5 pts)
  const languageSet = new Set<string>();
  repos.forEach(r => {
    if (r.language) languageSet.add(r.language);
  });
  const uniqueCount = languageSet.size;
  const langCountPts = Math.min(5, (uniqueCount / 5) * 5);
  const balancePts = uniqueCount > 1 ? Math.min(5, uniqueCount * 1.25) : (uniqueCount === 1 ? 2.5 : 0);
  const diversityScore = Math.round(Math.min(10, langCountPts + balancePts));
  const diversityReason = `Scored ${diversityScore}/10 across ${uniqueCount} active runtime languages.`;

  // 7. Project Scale (Max 10 pts)
  // Public repository volume (max 5 pts for 10 repos), cumulative codebase size (max 5 pts for 20MB)
  const totalKB = repos.reduce((acc, r) => acc + (r.size || 0), 0);
  const repoVolPts = Math.min(5, (repos.length / 10) * 5);
  const codeScalePts = Math.min(5, (totalKB / 20000) * 5);
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
