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

  static async fetchPinnedRepositories(username: string, token?: string): Promise<GitHubRepository[]> {
    const resolvedToken = token || (typeof window !== "undefined" ? localStorage.getItem("devtrack_github_token") ?? undefined : undefined);

    if (resolvedToken) {
      try {
        const query = `
          query($username: String!) {
            user(login: $username) {
              pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    id
                    name
                    description
                    primaryLanguage { name color }
                    stargazerCount
                    forkCount
                    updatedAt
                    url
                  }
                }
              }
            }
          }
        `;
        const gqlRes = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resolvedToken}`,
          },
          body: JSON.stringify({ query, variables: { username } }),
        });

        if (gqlRes.ok) {
          const gqlJson = await gqlRes.json();
          const nodes = gqlJson.data?.user?.pinnedItems?.nodes;
          if (Array.isArray(nodes) && nodes.length > 0) {
            return nodes.map((node: any, idx: number) => ({
              id: node.id || idx + 1000,
              name: node.name,
              full_name: `${username}/${node.name}`,
              html_url: node.url,
              description: node.description,
              fork: false,
              created_at: node.updatedAt,
              updated_at: node.updatedAt,
              pushed_at: node.updatedAt,
              size: 100,
              stargazers_count: node.stargazerCount || 0,
              watchers_count: node.stargazerCount || 0,
              language: node.primaryLanguage?.name || null,
              forks_count: node.forkCount || 0,
              open_issues_count: 0,
            }));
          }
        }
      } catch (e) {
        console.warn("Pinned repositories GraphQL fetch failed, falling back to top public repos:", e);
      }
    }

    // Fallback: Fetch top 6 public repos sorted by stargazers & update recency
    const repos = await this.fetchUserProfileRepos(username, token);
    return [...repos]
      .sort((a, b) => (b.stargazers_count * 3 + (b.forks_count || 0) * 2) - (a.stargazers_count * 3 + (a.forks_count || 0) * 2))
      .slice(0, 6);
  }
}
