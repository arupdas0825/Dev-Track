import { UserDashboardData, GitHubRepository, LanguageStat } from "@/types";

export interface TimelineMilestone {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type:
    | "join"
    | "repo_create"
    | "first_repo"
    | "first_os"
    | "star_earned"
    | "fork_earned"
    | "commits_100"
    | "commits_500"
    | "commits_1000"
    | "followers_10"
    | "followers_50"
    | "longest_streak"
    | "biggest_day"
    | "active_month"
    | "active_year"
    | "lang_adopt";
  iconName: string;
  category: "account" | "repo" | "contributions" | "social" | "language";
  details: {
    exactDate: string;
    repoName?: string;
    language?: string;
    commitsCount?: number;
    starsCount?: number;
    forksCount?: number;
    contributionCount?: number;
    aiExplanation: string;
  };
}

export interface LanguageEvolutionItem {
  year: number;
  date: string;
  language: string;
  repoName: string;
}

export interface GrowthDataPoint {
  date: string; // YYYY-MM-DD or YYYY-MM
  repos: number;
  contributions: number;
  followers: number;
  stars: number;
  primaryLanguage: string;
}

/**
 * Calculates total active days (contributions > 0)
 */
export function calculateActiveDays(dailyContributions: Record<string, number> = {}): number {
  return Object.values(dailyContributions).filter((count) => count > 0).length;
}

/**
 * Formats a date string into readable formats
 */
export function formatTimelineDate(dateStr: string): string {
  if (!dateStr) return "Unavailable";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generates AI-like narrative summary of the developer's journey
 */
export function generateNarrativeSummaries(data: UserDashboardData): string[] {
  const summaries: string[] = [];
  const { profile, contributions, repositories, languages } = data;

  const createdDate = new Date(profile.created_at);
  const totalRepos = repositories.length;
  const activeDays = calculateActiveDays(contributions.dailyContributions);
  const mostUsedLanguage = languages[0]?.name || "Markdown";

  // Account creation summary
  summaries.push(
    `You started your GitHub journey in ${createdDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}. Since then, you have established a workspace containing ${totalRepos} public repositories, focusing heavily on ${mostUsedLanguage}.`
  );

  // Active streak and contribution summary
  if (contributions.longestStreak > 5) {
    summaries.push(
      `Your dedication peaked during a ${contributions.longestStreak}-day contribution streak, showing consistent coding habits and high velocity across projects.`
    );
  }

  // Active days and year growth
  if (activeDays > 0) {
    const dailyList = Object.entries(contributions.dailyContributions || {})
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count);
    
    if (dailyList.length > 0 && dailyList[0].count > 3) {
      const peakDate = new Date(dailyList[0].date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      summaries.push(
        `Your single biggest contribution spike occurred on ${peakDate}, landing ${dailyList[0].count} individual code revisions in a single day.`
      );
    }
  }

  // Repo scaling
  const topStarred = [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  if (topStarred && topStarred.stargazers_count > 0) {
    summaries.push(
      `Your most celebrated open source work is "${topStarred.name}", attracting ${topStarred.stargazers_count} stars from developers in the community.`
    );
  }

  return summaries;
}

/**
 * Extract all important timeline milestones from real GitHub data
 */
export function extractMilestones(data: UserDashboardData): TimelineMilestone[] {
  const milestones: TimelineMilestone[] = [];
  const { profile, repositories, contributions } = data;

  // 1. Joined GitHub
  const joinDate = profile.created_at.split("T")[0];
  milestones.push({
    id: "join_github",
    date: joinDate,
    title: "Joined GitHub",
    description: `@${profile.login} registered on the global developer network.`,
    type: "join",
    iconName: "UserPlus",
    category: "account",
    details: {
      exactDate: joinDate,
      aiExplanation: `This marks the absolute beginning of your public software engineering journey on GitHub. Your developer account was registered at ${new Date(profile.created_at).toLocaleTimeString()}.`,
    },
  });

  // Sort repos by created_at
  const sortedRepos = [...repositories].sort((a, b) => a.created_at.localeCompare(b.created_at));

  // 2. Created First Repository
  if (sortedRepos.length > 0) {
    const firstRepo = sortedRepos[0];
    const firstRepoDate = firstRepo.created_at.split("T")[0];
    milestones.push({
      id: "first_repository",
      date: firstRepoDate,
      title: "Created First Repository",
      description: `Initialized your very first public codebase: "${firstRepo.name}".`,
      type: "first_repo",
      iconName: "FolderPlus",
      category: "repo",
      details: {
        exactDate: firstRepoDate,
        repoName: firstRepo.name,
        language: firstRepo.language || "Markdown",
        aiExplanation: `You launched your first repository "${firstRepo.name}" written primarily in ${firstRepo.language || "Markdown"}. This initialized your public coding portfolio.`,
      },
    });

    // 3. First Open Source Project (First original non-fork repo)
    const firstOriginal = sortedRepos.find((r) => !r.fork);
    if (firstOriginal) {
      const originalDate = firstOriginal.created_at.split("T")[0];
      milestones.push({
        id: "first_os_project",
        date: originalDate,
        title: "Launched First Original Project",
        description: `Created your first original open-source project: "${firstOriginal.name}".`,
        type: "first_os",
        iconName: "Flag",
        category: "repo",
        details: {
          exactDate: originalDate,
          repoName: firstOriginal.name,
          language: firstOriginal.language || "Markdown",
          aiExplanation: `You initiated "${firstOriginal.name}", a custom codebase written in ${firstOriginal.language || "Markdown"}. Starting original work is a crucial transition from consuming code to publishing custom software.`,
        },
      });
    }

    // 4. First Star Received (earliest repo created that has stargazers_count > 0)
    const firstStarred = sortedRepos.find((r) => r.stargazers_count > 0);
    if (firstStarred) {
      const starDate = firstStarred.created_at.split("T")[0]; // Estimate date
      milestones.push({
        id: "first_star_received",
        date: starDate,
        title: "Community Resonance (First Star)",
        description: `Earned your first stargazer on repository "${firstStarred.name}".`,
        type: "star_earned",
        iconName: "Star",
        category: "social",
        details: {
          exactDate: starDate,
          repoName: firstStarred.name,
          starsCount: firstStarred.stargazers_count,
          aiExplanation: `A developer in the GitHub community starred your repository "${firstStarred.name}". This validated your code's utility or design and marked your first social appreciation milestone.`,
        },
      });
    }

    // 5. First Fork Received (earliest repo created that has forks_count > 0)
    const firstForked = sortedRepos.find((r) => r.forks_count > 0);
    if (firstForked) {
      const forkDate = firstForked.created_at.split("T")[0];
      milestones.push({
        id: "first_fork_received",
        date: forkDate,
        title: "Codebase Forked",
        description: `Another developer cloned or forked your project "${firstForked.name}".`,
        type: "fork_earned",
        iconName: "GitFork",
        category: "social",
        details: {
          exactDate: forkDate,
          repoName: firstForked.name,
          forksCount: firstForked.forks_count,
          aiExplanation: `Your code was forked by another developer for extension or integration. Having code forked indicates that your work was deemed modular and structured enough for reuse by others.`,
        },
      });
    }

    // 6. Individual Repo creations (skip the first one to avoid duplicate timeline items)
    sortedRepos.slice(1).forEach((repo) => {
      const repoDate = repo.created_at.split("T")[0];
      milestones.push({
        id: `repo_create_${repo.id}`,
        date: repoDate,
        title: `Created Repository: ${repo.name}`,
        description: `Launched public repository "${repo.name}" (${repo.language || "Markdown"}).`,
        type: "repo_create",
        iconName: "Code",
        category: "repo",
        details: {
          exactDate: repoDate,
          repoName: repo.name,
          language: repo.language || "Markdown",
          starsCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          aiExplanation: `Created a public repository named "${repo.name}" focused on ${repo.language || "Markdown"}. Description: "${repo.description || "No description provided."}"`,
        },
      });
    });
  }

  // 7. Cumulative Contribution thresholds (100, 500, 1000)
  const dailyList = Object.entries(contributions.dailyContributions || {})
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningSum = 0;
  let crossed100 = false;
  let crossed500 = false;
  let crossed1000 = false;

  dailyList.forEach((day) => {
    runningSum += day.count;
    if (runningSum >= 100 && !crossed100) {
      crossed100 = true;
      milestones.push({
        id: "commits_100",
        date: day.date,
        title: "Reached 100 Contributions",
        description: `Logged 100+ contributions on your daily activity calendar!`,
        type: "commits_100",
        iconName: "GitCommit",
        category: "contributions",
        details: {
          exactDate: day.date,
          contributionCount: 100,
          aiExplanation: `You hit your first major milestone of 100 combined contributions (commits, pull requests, issues). This signifies early consistency in commit patterns.`,
        },
      });
    }
    if (runningSum >= 500 && !crossed500) {
      crossed500 = true;
      milestones.push({
        id: "commits_500",
        date: day.date,
        title: "Reached 500 Contributions",
        description: `Propelled project development, logging 500 total contributions.`,
        type: "commits_500",
        iconName: "Flame",
        category: "contributions",
        details: {
          exactDate: day.date,
          contributionCount: 500,
          aiExplanation: `You reached 500 career contributions. Crossing this threshold represents extensive software building and regular maintenance.`,
        },
      });
    }
    if (runningSum >= 1000 && !crossed1000) {
      crossed1000 = true;
      milestones.push({
        id: "commits_1000",
        date: day.date,
        title: "Reached 1,000 Contributions",
        description: `Scaled contribution scale, unlocking the legendary 1,000 index.`,
        type: "commits_1000",
        iconName: "Award",
        category: "contributions",
        details: {
          exactDate: day.date,
          contributionCount: 1000,
          aiExplanation: `A major software milestone: 1,000 career contributions logged! This reflects continuous, long-term engineering dedication.`,
        },
      });
    }
  });

  // 8. Streak Milestone
  if (contributions.longestStreak >= 5 && dailyList.length > 0) {
    // Find streak dates
    let currentStreak = 0;
    let longestStreak = 0;
    let streakEnd = "";
    let tempStart = "";
    let streakStart = "";

    dailyList.forEach((day) => {
      if (day.count > 0) {
        if (currentStreak === 0) tempStart = day.date;
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          streakEnd = day.date;
          streakStart = tempStart;
        }
      } else {
        currentStreak = 0;
      }
    });

    if (longestStreak >= 5 && streakEnd) {
      milestones.push({
        id: "longest_streak_unlocked",
        date: streakEnd,
        title: "Peak Dedication Streak Reached",
        description: `Maintained a consecutive coding streak of ${longestStreak} days!`,
        type: "longest_streak",
        iconName: "Zap",
        category: "contributions",
        details: {
          exactDate: streakEnd,
          contributionCount: longestStreak,
          aiExplanation: `You maintained a continuous streak of ${longestStreak} days of writing code, starting on ${streakStart} and concluding on ${streakEnd}. This demonstrates strong developer discipline.`,
        },
      });
    }
  }

  // 9. Peak Contribution Day
  if (dailyList.length > 0) {
    const peakDay = [...dailyList].sort((a, b) => b.count - a.count)[0];
    if (peakDay && peakDay.count > 2) {
      milestones.push({
        id: "biggest_contribution_day",
        date: peakDay.date,
        title: "Biggest Contribution Day",
        description: `Achieved peak velocity with ${peakDay.count} updates in a single day.`,
        type: "biggest_day",
        iconName: "Activity",
        category: "contributions",
        details: {
          exactDate: peakDay.date,
          contributionCount: peakDay.count,
          aiExplanation: `You logged ${peakDay.count} code updates in a single day on ${peakDay.date}. This stands as your personal single-day productivity record on GitHub.`,
        },
      });
    }
  }

  // 10. Followers Milestones (tied to join date or estimated growth)
  if (profile.followers >= 10) {
    const f10Date = joinDate; // Tied to join or profile age
    milestones.push({
      id: "followers_10_unlocked",
      date: f10Date,
      title: "Network Synergy (10 Followers)",
      description: `Grew a network of 10+ engineers tracking your updates.`,
      type: "followers_10",
      iconName: "Users",
      category: "social",
      details: {
        exactDate: f10Date,
        contributionCount: profile.followers,
        aiExplanation: `Your followers count crossed 10. This indicates your repositories and contributions are beginning to get followed by external developers.`,
      },
    });
  }

  if (profile.followers >= 50) {
    const f50Date = sortedRepos[Math.floor(sortedRepos.length / 2)]?.created_at.split("T")[0] || joinDate;
    milestones.push({
      id: "followers_50_unlocked",
      date: f50Date,
      title: "Community Catalyst (50 Followers)",
      description: `Amassed over 50 followers, scaling developer outreach.`,
      type: "followers_50",
      iconName: "Users",
      category: "social",
      details: {
        exactDate: f50Date,
        contributionCount: profile.followers,
        aiExplanation: `You reached 50 followers on GitHub. Developers follow your profile to track your repository creation and code contributions.`,
      },
    });
  }

  // 11. Language Adoptions
  const seenLanguages = new Set<string>();
  sortedRepos.forEach((repo) => {
    if (repo.language && !seenLanguages.has(repo.language)) {
      seenLanguages.add(repo.language);
      const adoptDate = repo.created_at.split("T")[0];
      milestones.push({
        id: `lang_adopt_${repo.language.toLowerCase()}`,
        date: adoptDate,
        title: `Adopted ${repo.language}`,
        description: `Created first repository using "${repo.language}" tech stack.`,
        type: "lang_adopt",
        iconName: "Cpu",
        category: "language",
        details: {
          exactDate: adoptDate,
          repoName: repo.name,
          language: repo.language,
          aiExplanation: `You integrated "${repo.language}" into your tech stack by publishing the repository "${repo.name}". This expanded your polyglot capabilities.`,
        },
      });
    }
  });

  // Sort all milestones chronologically
  return milestones.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get language evolution order
 */
export function getLanguageEvolution(repos: GitHubRepository[]): LanguageEvolutionItem[] {
  const evolution: LanguageEvolutionItem[] = [];
  const seen = new Set<string>();

  const sorted = [...repos].sort((a, b) => a.created_at.localeCompare(b.created_at));
  sorted.forEach((repo) => {
    if (repo.language && !seen.has(repo.language)) {
      seen.add(repo.language);
      const date = repo.created_at.split("T")[0];
      const year = new Date(repo.created_at).getFullYear();
      evolution.push({
        year,
        date,
        language: repo.language,
        repoName: repo.name,
      });
    }
  });

  return evolution;
}

/**
 * Generates cumulative growth charts
 */
export function generateGrowthTimeline(
  repos: GitHubRepository[],
  dailyContributions: Record<string, number> = {},
  totalFollowers: number = 0,
  totalStars: number = 0
): GrowthDataPoint[] {
  const dataPoints: GrowthDataPoint[] = [];

  // Group everything by month
  const monthlyData: Record<string, { repos: number; contributions: number; stars: number }> = {};

  // Sort repos
  const sortedRepos = [...repos].sort((a, b) => a.created_at.localeCompare(b.created_at));
  
  // Daily contributions list
  const sortedDays = Object.entries(dailyContributions)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Determine date bounds
  if (sortedRepos.length === 0 && sortedDays.length === 0) {
    return [];
  }

  let earliestDate = "2024-01-01";
  if (sortedRepos.length > 0) {
    earliestDate = sortedRepos[0].created_at.split("T")[0];
  } else if (sortedDays.length > 0) {
    earliestDate = sortedDays[0].date;
  }

  const startDate = new Date(earliestDate);
  const endDate = new Date();
  
  // Initialize months
  const temp = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (temp <= endDate) {
    const monthKey = temp.toISOString().substring(0, 7); // YYYY-MM
    monthlyData[monthKey] = { repos: 0, contributions: 0, stars: 0 };
    temp.setMonth(temp.getMonth() + 1);
  }

  // Count repos in month created
  sortedRepos.forEach((r) => {
    const key = r.created_at.substring(0, 7);
    if (monthlyData[key]) {
      monthlyData[key].repos++;
      monthlyData[key].stars += r.stargazers_count;
    }
  });

  // Count contributions in month
  sortedDays.forEach((d) => {
    const key = d.date.substring(0, 7);
    if (monthlyData[key]) {
      monthlyData[key].contributions += d.count;
    }
  });

  // Assemble cumulative points
  let cumRepos = 0;
  let cumContributions = 0;
  let cumStars = 0;

  Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([monthKey, val]) => {
      cumRepos += val.repos;
      cumContributions += val.contributions;
      cumStars += val.stars;

      // Estimate followers over time: linear interpolation to current followers
      const totalMonths = Object.keys(monthlyData).length;
      const index = Object.keys(monthlyData).sort().indexOf(monthKey);
      const estFollowers = Math.round((index / (totalMonths - 1 || 1)) * totalFollowers);

      dataPoints.push({
        date: `${monthKey}-01`,
        repos: cumRepos,
        contributions: cumContributions,
        followers: estFollowers,
        stars: cumStars,
        primaryLanguage: "", // Filled if needed
      });
    });

  return dataPoints;
}
