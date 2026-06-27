import { ContributionStats } from "@/types";

export class GitHubContributionService {
  /**
   * Calculate current and longest streaks from daily contributions.
   * A day is active if contributionCount > 0.
   */
  static calculateStreaks(dailyContributions: Record<string, number>): {
    currentStreak: number;
    longestStreak: number;
  } {
    const sortedDays = Object.entries(dailyContributions)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (sortedDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let longestStreak = 0;
    let runningStreak = 0;
    let streakOnLastActive = 0;
    let lastActiveDateStr: string | null = null;

    sortedDays.forEach(day => {
      if (day.count > 0) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
        streakOnLastActive = runningStreak;
        lastActiveDateStr = day.date;
      } else {
        runningStreak = 0;
      }
    });

    let currentStreak = 0;
    if (lastActiveDateStr) {
      // Parse YYYY-MM-DD date safely in timezone-independent way
      const parseDateOnly = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
      };

      const lastActiveDate = parseDateOnly(lastActiveDateStr);
      
      // Get today's local date
      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = Math.abs(todayDateOnly.getTime() - lastActiveDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // If they contributed today (0 days diff) or yesterday (1 day diff), streak is active
      if (diffDays <= 1) {
        currentStreak = streakOnLastActive;
      }
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Fetch from GitHub GraphQL API (requires token)
   */
  static async fetchContributionsFromGraphQL(
    username: string,
    token: string
  ): Promise<ContributionStats> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalPullRequestReviewContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!res.ok) {
      throw new Error(`GitHub GraphQL request failed: ${res.statusText}`);
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(`GitHub GraphQL query errors: ${json.errors[0].message}`);
    }

    const userData = json.data?.user;
    if (!userData) {
      throw new Error(`GitHub user "${username}" not found in GraphQL API.`);
    }

    const collection = userData.contributionsCollection;
    const calendar = collection.contributionCalendar;
    const weeks = calendar.weeks;

    // Flatten calendar into daily contributions map
    const dailyContributions: Record<string, number> = {};
    weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        dailyContributions[day.date] = day.contributionCount;
      });
    });

    const { currentStreak, longestStreak } = this.calculateStreaks(dailyContributions);

    // Sum details
    const totalCommits = collection.totalCommitContributions || 0;
    const totalPRs = (collection.totalPullRequestContributions || 0) + (collection.totalPullRequestReviewContributions || 0);
    const totalIssues = collection.totalIssueContributions || 0;

    // Estimate active months count from contribution calendar
    const activeDates = Object.entries(dailyContributions)
      .filter(([_, count]) => count > 0)
      .map(([date]) => date.substring(0, 7)); // YYYY-MM
    const uniqueMonths = new Set(activeDates);
    const activeMonthsCount = Math.max(1, uniqueMonths.size);

    return {
      totalCommits,
      totalPRs,
      totalIssues,
      totalStarsEarned: 0, // Filled in by caller
      totalForksEarned: 0, // Filled in by caller
      activeMonthsCount,
      longestStreak,
      currentStreak,
      dailyContributions,
    };
  }

  /**
   * Fetch contributions from public community scraper API (no auth required)
   */
  static async fetchContributionsFromScraper(
    username: string
  ): Promise<ContributionStats> {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
    if (!res.ok) {
      throw new Error(`Fallback contribution scraper failed: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.contributions || data.contributions.length === 0) {
      throw new Error("No contribution calendar returned by scraper.");
    }

    // Populate daily contributions
    const dailyContributions: Record<string, number> = {};
    
    // Sort contributions chronologically
    const rawContribs = data.contributions as { date: string; count: number }[];
    rawContribs.forEach(c => {
      dailyContributions[c.date] = c.count;
    });

    // Find the range of last 365 days for the calendar heatmap
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Filter contributions to the last 365 days
    const last365DaysContributions = rawContribs.filter(c => c.date >= startDateStr);
    const totalContributions = last365DaysContributions.reduce((sum, c) => sum + c.count, 0);

    // Compute streaks on full history for maximum accuracy!
    const { currentStreak, longestStreak } = this.calculateStreaks(dailyContributions);

    // Estimate breakdown based on total contributions in the last 365 days
    const totalPRs = Math.max(0, Math.round(totalContributions * 0.02));
    const totalIssues = Math.max(0, Math.round(totalContributions * 0.01));
    const totalCommits = Math.max(0, totalContributions - totalPRs - totalIssues);

    // Estimate active months count from last 365 days
    const activeDates = last365DaysContributions
      .filter(c => c.count > 0)
      .map(c => c.date.substring(0, 7)); // YYYY-MM
    const uniqueMonths = new Set(activeDates);
    const activeMonthsCount = Math.max(1, uniqueMonths.size);

    return {
      totalCommits,
      totalPRs,
      totalIssues,
      totalStarsEarned: 0, // Filled in by caller
      totalForksEarned: 0, // Filled in by caller
      activeMonthsCount,
      longestStreak,
      currentStreak,
      dailyContributions,
    };
  }

  /**
   * Unified interface to fetch real user contributions.
   * Resolves GraphQL if token is provided, falling back to the scraper.
   */
  static async fetchUserContributions(
    username: string,
    token?: string
  ): Promise<ContributionStats> {
    if (token) {
      try {
        return await this.fetchContributionsFromGraphQL(username, token);
      } catch (graphqlError) {
        console.warn("GraphQL contributions fetch failed, falling back to scraper:", graphqlError);
        return await this.fetchContributionsFromScraper(username);
      }
    } else {
      return await this.fetchContributionsFromScraper(username);
    }
  }
}
