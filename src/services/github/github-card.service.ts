import { DeveloperCardData, DeveloperTier, DeveloperGrade } from '@/components/card/DeveloperCard';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3572A5',
  Rust: '#DEA584',
  Go: '#00ADD8',
  HTML: '#E34F26',
  CSS: '#563D7C',
  C: '#555555',
  'C++': '#F34B7D',
  'C#': '#178600',
  Java: '#B07219',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Shell: '#89E051',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41B883',
  Svelte: '#FF3E00',
};

export class GitHubCardService {
  private static defaultHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    return headers;
  }

  static async fetchRealDeveloperCardData(
    username: string,
    token?: string
  ): Promise<DeveloperCardData> {
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) {
      throw new Error('Please enter a valid GitHub username.');
    }

    // 1. Fetch User Profile
    const profileRes = await fetch(`https://api.github.com/users/${cleanUser}`, {
      headers: this.defaultHeaders(token),
    });

    if (!profileRes.ok) {
      if (profileRes.status === 404) {
        throw new Error(`GitHub user "@${cleanUser}" not found.`);
      }
      if (profileRes.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or sign in with GitHub.');
      }
      throw new Error(`Failed to fetch GitHub profile for "@${cleanUser}" (HTTP ${profileRes.status}).`);
    }

    const profile = await profileRes.json();

    // 2. Fetch User Repositories (up to 100 sorted by updated)
    const reposRes = await fetch(
      `https://api.github.com/users/${cleanUser}/repos?per_page=100&sort=updated`,
      { headers: this.defaultHeaders(token) }
    );

    let repos: any[] = [];
    if (reposRes.ok) {
      repos = await reposRes.json();
    }

    // 3. Calculate Verified Metrics strictly from live GitHub data
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
    const publicRepos = profile.public_repos ?? repos.length;
    const followers = profile.followers || 0;
    const following = profile.following || 0;

    // Aggregate primary languages - TOP 3 ONLY
    const langCounts: Record<string, number> = {};
    let totalLangRepos = 0;

    repos.forEach((r) => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
        totalLangRepos++;
      }
    });

    const topLanguages = Object.keys(langCounts)
      .map((name) => {
        const count = langCounts[name];
        const percent = totalLangRepos > 0 ? Math.round((count / totalLangRepos) * 100) : 0;
        return {
          name,
          percent,
          color: LANGUAGE_COLORS[name] || '#818CF8',
        };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3); // Strictly Top 3 Languages

    // Deterministic Multi-Factor Tier & Grade Calculation (0 - 100)
    const repoPts = Math.min(25, publicRepos * 1.5);
    const starPts = Math.min(30, totalStars > 0 ? Math.log10(totalStars + 1) * 12 : 0);
    const forkPts = Math.min(20, totalForks > 0 ? Math.log10(totalForks + 1) * 8 : 0);
    const followerPts = Math.min(25, followers > 0 ? Math.log10(followers + 1) * 10 : 0);

    const numericScore = Math.min(100, Math.round(repoPts + starPts + forkPts + followerPts));

    // Derive Developer Tier
    let tier: DeveloperTier = 'Bronze';
    let tierEmoji = '🥉';

    if (numericScore >= 90) {
      tier = 'Emerald';
      tierEmoji = '💚';
    } else if (numericScore >= 80) {
      tier = 'Diamond';
      tierEmoji = '💎';
    } else if (numericScore >= 60) {
      tier = 'Gold';
      tierEmoji = '🥇';
    } else if (numericScore >= 30) {
      tier = 'Silver';
      tierEmoji = '🥈';
    }

    // Derive Developer Grade
    let grade: DeveloperGrade = 'C';
    if (numericScore >= 90) grade = 'A+';
    else if (numericScore >= 75) grade = 'A';
    else if (numericScore >= 60) grade = 'B+';
    else if (numericScore >= 40) grade = 'B';

    const createdAtFormatted = profile.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : undefined;

    return {
      username: profile.login,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
      location: profile.location || null,
      company: profile.company || null,
      blog: profile.blog || null,
      publicRepos,
      followers,
      following,
      totalStars,
      totalForks,
      // Metrics requiring OAuth telemetry are set to null when unauthenticated, rendered as "Unavailable"
      pullRequests: null,
      totalContributions: null,
      currentStreak: null,
      tier,
      tierEmoji,
      grade,
      numericScore,
      topLanguages,
      createdAt: createdAtFormatted,
      // Backward compatibility fields
      score: numericScore * 10,
      rankTitle: `${tier} Contributor`,
      archetype: `${tier} Engineer`,
      topLanguage: topLanguages[0]?.name || 'Code',
      level: Math.max(1, Math.floor(numericScore / 10)),
      totalCommits: null,
      contributions: null,
    };
  }
}
