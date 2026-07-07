export interface LiveEvent {
  id: string;
  type: "push" | "pr_opened" | "pr_closed" | "pr_merged" | "issue_opened" | "issue_closed" | "release" | "star" | "fork" | "follow" | "create" | "delete";
  repoName: string;
  repoUrl?: string;
  actorName: string;
  actorAvatar: string;
  description: string;
  createdAt: string;
  githubUrl?: string;
  details?: {
    commitMsg?: string;
    branch?: string;
    filesCount?: number;
    prTitle?: string;
    prNumber?: number;
    issueTitle?: string;
    issueNumber?: number;
    releaseTag?: string;
    releaseTitle?: string;
    forkee?: string;
    followerName?: string;
  };
}

export interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: string;
  updatedAt: string;
  subject: {
    title: string;
    url: string;
    latest_comment_url: string;
    type: "PullRequest" | "Issue" | "Release" | "Commit" | "Repository";
  };
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
}

export interface SyncLog {
  id: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  eventsCount: number;
  status: "success" | "warning" | "error";
  errorMsg?: string;
}

export class GitHubActivityService {
  private static defaultHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }
    return headers;
  }

  static async fetchUserEvents(username: string, token?: string): Promise<LiveEvent[]> {
    if (!username || username === "demo" || username === "devtrack-demo") {
      return this.generateMockEvents();
    }

    try {
      const res = await fetch(`https://api.github.com/users/${username}/events`, {
        headers: this.defaultHeaders(token),
      });

      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}: ${res.statusText}`);
      }

      const rawEvents = await res.json();
      return this.parseGitHubEvents(rawEvents);
    } catch (error) {
      console.warn("Falling back to mock events due to API error:", error);
      return this.generateMockEvents();
    }
  }

  static async fetchNotifications(token?: string): Promise<GitHubNotification[]> {
    if (!token) {
      return this.generateMockNotifications();
    }

    try {
      const res = await fetch("https://api.github.com/notifications", {
        headers: this.defaultHeaders(token),
      });

      if (!res.ok) {
        throw new Error(`GitHub Notifications API returned status ${res.status}`);
      }

      const rawNotifications = await res.json();
      return rawNotifications.map((notif: any) => ({
        id: notif.id,
        unread: notif.unread,
        reason: notif.reason,
        updatedAt: notif.updated_at,
        subject: {
          title: notif.subject.title,
          url: notif.subject.url,
          latest_comment_url: notif.subject.latest_comment_url,
          type: notif.subject.type,
        },
        repository: {
          name: notif.repository.name,
          full_name: notif.repository.full_name,
          html_url: notif.repository.html_url,
        },
      }));
    } catch (error) {
      console.warn("Falling back to mock notifications:", error);
      return this.generateMockNotifications();
    }
  }

  static async fetchRepositoryEvents(owner: string, repo: string, token?: string): Promise<LiveEvent[]> {
    if (owner === "demo") {
      return this.generateMockEvents().filter(e => e.repoName.includes(repo));
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/events`, {
        headers: this.defaultHeaders(token),
      });

      if (!res.ok) {
        throw new Error(`Repo events status ${res.status}`);
      }

      const rawEvents = await res.json();
      return this.parseGitHubEvents(rawEvents);
    } catch (e) {
      return this.generateMockEvents().filter(e => e.repoName.includes(repo));
    }
  }

  private static parseGitHubEvents(rawEvents: any[]): LiveEvent[] {
    if (!Array.isArray(rawEvents)) return [];

    return rawEvents.map((evt: any) => {
      const actor = evt.actor || {};
      const repo = evt.repo || {};
      const payload = evt.payload || {};
      const typeMap: Record<string, LiveEvent["type"]> = {
        PushEvent: "push",
        PullRequestEvent: payload.action === "opened" ? "pr_opened" : payload.action === "closed" ? (payload.pull_request?.merged ? "pr_merged" : "pr_closed") : "push",
        IssuesEvent: payload.action === "opened" ? "issue_opened" : "issue_closed",
        ReleaseEvent: "release",
        WatchEvent: "star",
        ForkEvent: "fork",
        CreateEvent: "create",
        DeleteEvent: "delete",
      };

      const eventType = typeMap[evt.type] || "push";
      let description = "";

      switch (eventType) {
        case "push":
          description = `pushed to ${payload.ref?.replace("refs/heads/", "") || "main"}`;
          break;
        case "pr_opened":
          description = `opened pull request #${payload.number}: ${payload.pull_request?.title || ""}`;
          break;
        case "pr_closed":
          description = `closed pull request #${payload.number}`;
          break;
        case "pr_merged":
          description = `merged pull request #${payload.number}`;
          break;
        case "issue_opened":
          description = `opened issue #${payload.issue?.number}: ${payload.issue?.title || ""}`;
          break;
        case "issue_closed":
          description = `closed issue #${payload.issue?.number}`;
          break;
        case "release":
          description = `published release ${payload.release?.tag_name || ""}`;
          break;
        case "star":
          description = `starred the repository`;
          break;
        case "fork":
          description = `forked the repository`;
          break;
        case "create":
          description = `created ${payload.ref_type || "repository"}`;
          break;
        case "delete":
          description = `deleted ${payload.ref_type || "repository"}`;
          break;
      }

      return {
        id: evt.id,
        type: eventType,
        repoName: repo.name,
        repoUrl: `https://github.com/${repo.name}`,
        actorName: actor.display_login || actor.login || "user",
        actorAvatar: actor.avatar_url || "https://github.com/identicons/git.png",
        description,
        createdAt: evt.created_at || new Date().toISOString(),
        githubUrl: `https://github.com/${repo.name}`,
        details: {
          commitMsg: payload.commits?.[0]?.message,
          branch: payload.ref?.replace("refs/heads/", ""),
          filesCount: payload.commits?.length,
          prTitle: payload.pull_request?.title,
          prNumber: payload.number,
          issueTitle: payload.issue?.title,
          issueNumber: payload.issue?.number,
          releaseTag: payload.release?.tag_name,
          releaseTitle: payload.release?.name,
        },
      };
    });
  }

  private static generateMockEvents(): LiveEvent[] {
    const now = new Date();
    return [
      {
        id: "mock-1",
        type: "push",
        repoName: "vercel/next.js",
        repoUrl: "https://github.com/vercel/next.js",
        actorName: "leeerob",
        actorAvatar: "https://github.com/leeerob.png",
        description: "pushed to canary",
        createdAt: new Date(now.getTime() - 1000 * 45).toISOString(), // 45 seconds ago
        githubUrl: "https://github.com/vercel/next.js",
        details: {
          commitMsg: "fix(router): improve scroll restoration logic (#62145)",
          branch: "canary",
          filesCount: 3,
        },
      },
      {
        id: "mock-2",
        type: "pr_merged",
        repoName: "facebook/react",
        repoUrl: "https://github.com/facebook/react",
        actorName: "gaearon",
        actorAvatar: "https://github.com/gaearon.png",
        description: "merged pull request #28410",
        createdAt: new Date(now.getTime() - 1000 * 180).toISOString(), // 3 mins ago
        githubUrl: "https://github.com/facebook/react",
        details: {
          prTitle: "DevTools: Add inspection indicators for Server Components",
          prNumber: 28410,
        },
      },
      {
        id: "mock-3",
        type: "star",
        repoName: "tailwindlabs/tailwindcss",
        repoUrl: "https://github.com/tailwindlabs/tailwindcss",
        actorName: "adamwathan",
        actorAvatar: "https://github.com/adamwathan.png",
        description: "starred tailwindcss v4 experimental",
        createdAt: new Date(now.getTime() - 1000 * 600).toISOString(), // 10 mins ago
        githubUrl: "https://github.com/tailwindlabs/tailwindcss",
      },
      {
        id: "mock-4",
        type: "issue_opened",
        repoName: "microsoft/vscode",
        repoUrl: "https://github.com/microsoft/vscode",
        actorName: "bpasero",
        actorAvatar: "https://github.com/bpasero.png",
        description: "opened issue #194012: Scrollbar performance issue in terminal view",
        createdAt: new Date(now.getTime() - 1000 * 1200).toISOString(), // 20 mins ago
        githubUrl: "https://github.com/microsoft/vscode",
        details: {
          issueTitle: "Scrollbar performance issue in terminal view",
          issueNumber: 194012,
        },
      },
      {
        id: "mock-5",
        type: "release",
        repoName: "features/copilot",
        repoUrl: "https://github.com/features/copilot",
        actorName: "github",
        actorAvatar: "https://github.com/github.png",
        description: "published release v1.4.2",
        createdAt: new Date(now.getTime() - 1000 * 3600).toISOString(), // 1 hour ago
        githubUrl: "https://github.com/features/copilot",
        details: {
          releaseTag: "v1.4.2",
          releaseTitle: "GitHub Copilot Chat Integration Beta",
        },
      },
      {
        id: "mock-6",
        type: "fork",
        repoName: "shadcn-ui/ui",
        repoUrl: "https://github.com/shadcn-ui/ui",
        actorName: "shadcn",
        actorAvatar: "https://github.com/shadcn.png",
        description: "forked repository to personal workspace",
        createdAt: new Date(now.getTime() - 1000 * 7200).toISOString(), // 2 hours ago
        githubUrl: "https://github.com/shadcn-ui/ui",
        details: {
          forkee: "my-shadcn-fork",
        },
      },
    ];
  }

  private static generateMockNotifications(): GitHubNotification[] {
    return [
      {
        id: "notif-1",
        unread: true,
        reason: "mention",
        updatedAt: new Date(Date.now() - 1000 * 300).toISOString(),
        subject: {
          title: "Discussion: Next steps for Server Actions",
          url: "https://api.github.com/repos/vercel/next.js/issues/4901",
          latest_comment_url: "https://api.github.com/repos/vercel/next.js/issues/comments/1245",
          type: "Issue",
        },
        repository: {
          name: "next.js",
          full_name: "vercel/next.js",
          html_url: "https://github.com/vercel/next.js",
        },
      },
      {
        id: "notif-2",
        unread: true,
        reason: "review_requested",
        updatedAt: new Date(Date.now() - 1000 * 1800).toISOString(),
        subject: {
          title: "docs: Fix broken links in authentication guide",
          url: "https://api.github.com/repos/facebook/react/pulls/2940",
          latest_comment_url: "https://api.github.com/repos/facebook/react/pulls/comments/293",
          type: "PullRequest",
        },
        repository: {
          name: "react",
          full_name: "facebook/react",
          html_url: "https://github.com/facebook/react",
        },
      },
      {
        id: "notif-3",
        unread: false,
        reason: "state_change",
        updatedAt: new Date(Date.now() - 1000 * 7200).toISOString(),
        subject: {
          title: "V1.0.0 Release Candidate",
          url: "https://api.github.com/repos/tailwindlabs/tailwindcss/releases/102",
          latest_comment_url: "https://api.github.com/repos/tailwindlabs/tailwindcss/releases/102",
          type: "Release",
        },
        repository: {
          name: "tailwindcss",
          full_name: "tailwindlabs/tailwindcss",
          html_url: "https://github.com/tailwindlabs/tailwindcss",
        },
      },
    ];
  }
}
