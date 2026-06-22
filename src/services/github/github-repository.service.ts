import { GitHubRepository } from "@/types";

export class GitHubRepositoryService {
  private static defaultHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    return headers;
  }

  static async fetchAuthenticatedUserRepos(token: string): Promise<GitHubRepository[]> {
    if (!token) {
      throw new Error("No token provided to fetch authenticated repositories.");
    }
    const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: this.defaultHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch authenticated repos: ${res.statusText}`);
    }
    return res.json();
  }

  static async fetchUserProfileRepos(username: string, token?: string): Promise<GitHubRepository[]> {
    if (!username) {
      throw new Error("No username provided to fetch repositories.");
    }
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: this.defaultHeaders(token),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch repositories for "${username}": ${res.statusText}`);
    }
    return res.json();
  }
}
