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
}
