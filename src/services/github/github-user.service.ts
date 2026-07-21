import { GitHubProfile } from "@/types";

export class GitHubUserService {
  private static defaultHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    return headers;
  }

  static async fetchAuthenticatedUser(token: string): Promise<GitHubProfile> {
    if (!token) {
      throw new Error("No token provided to fetch authenticated user.");
    }
    const res = await fetch("https://api.github.com/user", {
      headers: this.defaultHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch authenticated GitHub user: ${res.statusText}`);
    }
    return res.json();
  }

  static async fetchUserProfile(username: string, token?: string): Promise<GitHubProfile> {
    if (!username) {
      throw new Error("No username provided to fetch profile.");
    }
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: this.defaultHeaders(token),
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`GitHub user "${username}" not found.`);
      }
      throw new Error(`Failed to fetch GitHub profile for "${username}": ${res.statusText}`);
    }
    return res.json();
  }

  static async fetchUserEvents(username: string, token?: string): Promise<any[]> {
    if (!username) return [];
    try {
      const res = await fetch(`https://api.github.com/users/${username}/events?per_page=15`, {
        headers: this.defaultHeaders(token),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Failed to fetch GitHub user events:", e);
    }
    return [];
  }

  static async checkIsFollowing(targetUsername: string, token: string): Promise<boolean> {
    if (!targetUsername || !token) return false;
    try {
      const res = await fetch(`https://api.github.com/user/following/${targetUsername}`, {
        headers: this.defaultHeaders(token),
      });
      return res.status === 204;
    } catch (e) {
      return false;
    }
  }

  static async followGitHubUser(targetUsername: string, token: string): Promise<boolean> {
    if (!targetUsername || !token) throw new Error("Authentication token required to follow on GitHub.");
    const res = await fetch(`https://api.github.com/user/following/${targetUsername}`, {
      method: "PUT",
      headers: this.defaultHeaders(token),
    });
    return res.status === 204 || res.ok;
  }

  static async unfollowGitHubUser(targetUsername: string, token: string): Promise<boolean> {
    if (!targetUsername || !token) throw new Error("Authentication token required to unfollow on GitHub.");
    const res = await fetch(`https://api.github.com/user/following/${targetUsername}`, {
      method: "DELETE",
      headers: this.defaultHeaders(token),
    });
    return res.status === 204 || res.ok;
  }
}
