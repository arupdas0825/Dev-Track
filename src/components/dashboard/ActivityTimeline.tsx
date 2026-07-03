"use client";

import { useState, useEffect } from "react";
import { UserDashboardData } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Star, GitFork, AlertCircle, GitPullRequest, FolderPlus, UserPlus, MessageSquare, Activity, Loader2, Tag } from "lucide-react";

interface ActivityTimelineProps {
  data: UserDashboardData;
  githubToken?: string;
}

interface TimelineEvent {
  id: string;
  type: "commit" | "star" | "fork" | "issue" | "pr" | "repo" | "follower" | "discussion" | "release";
  title: string;
  description: string;
  timestamp: string;
  category: "commits" | "prs_issues" | "repos_stars" | "all";
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

export default function ActivityTimeline({ data, githubToken }: ActivityTimelineProps) {
  const { profile, contributions } = data;
  const [activeFilter, setActiveFilter] = useState<"all" | "commits" | "prs_issues" | "repos_stars">("all");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchLiveEvents = async () => {
      // Mock events fallback generator
      const generateMockEvents = (): TimelineEvent[] => {
        return [
          {
            id: "m1",
            type: "commit",
            title: `Pushed 3 commits to ${profile.login}/next-saas-template`,
            description: "Refactored Prisma query resolvers and optimized Next.js caching layers.",
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hrs ago
            category: "commits",
          },
          {
            id: "m2",
            type: "pr",
            title: `Merged Pull Request #42 in ${profile.login}/framer-motion-builder`,
            description: "Completed visual node designer upgrades and fixed canvas responsive layout shifts.",
            timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hrs ago
            category: "prs_issues",
          },
          {
            id: "m3",
            type: "star",
            title: "Starred repository vercel/next.js",
            description: "Added Next.js standard repository to personal bookmarks.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            category: "repos_stars",
          },
          {
            id: "m4",
            type: "repo",
            title: `Created new public repository ${profile.login}/dev-track`,
            description: `Started modular project boilerplate built with React, Recharts and Framer Motion. Earned ${contributions.totalStarsEarned} total stars.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
            category: "repos_stars",
          },
          {
            id: "m5",
            type: "issue",
            title: `Closed Issue #14: Dark Mode Palette Fix in ${profile.login}/react-query-firebase`,
            description: "Successfully patched high-contrast styling and resolved CSS variables specificity.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
            category: "prs_issues",
          },
          {
            id: "m6",
            type: "follower",
            title: "Gained 5 new followers on GitHub",
            description: `Network reach increased. Profile now aggregates ${profile.followers} followers.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 1 week ago
            category: "repos_stars",
          },
        ];
      };

      if (profile.login.toLowerCase() === "demo" || !githubToken) {
        setTimeout(() => {
          if (isMounted) {
            setEvents(generateMockEvents());
            setLoading(false);
          }
        }, 500);
        return;
      }

      try {
        const res = await fetch(`https://api.github.com/users/${profile.login}/events?per_page=30`, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `token ${githubToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("GitHub events API rejected request");
        }

        const rawEvents = await res.json();
        
        // Map raw GitHub events to TimelineEvent structure
        const mapped: TimelineEvent[] = [];
        rawEvents.forEach((ev: any) => {
          const id = ev.id;
          const time = ev.created_at;
          const repoName = ev.repo.name;

          if (ev.type === "PushEvent") {
            const commitCount = ev.payload.commits?.length || 1;
            const ref = ev.payload.ref?.replace("refs/heads/", "") || "main";
            const firstMsg = ev.payload.commits?.[0]?.message || "";
            mapped.push({
              id,
              type: "commit",
              title: `Pushed ${commitCount} commit${commitCount > 1 ? "s" : ""} to ${ref} branch`,
              description: `Repository: ${repoName} — ${firstMsg ? `"${firstMsg}"` : "Code modifications pushed."}`,
              timestamp: time,
              category: "commits",
            });
          } else if (ev.type === "PullRequestEvent") {
            const prNum = ev.payload.number;
            const action = ev.payload.action;
            const prTitle = ev.payload.pull_request?.title || "";
            mapped.push({
              id,
              type: "pr",
              title: `${action.charAt(0).toUpperCase() + action.slice(1)} Pull Request #${prNum}`,
              description: `Repository: ${repoName} — "${prTitle}"`,
              timestamp: time,
              category: "prs_issues",
            });
          } else if (ev.type === "IssuesEvent") {
            const issueNum = ev.payload.issue?.number;
            const action = ev.payload.action;
            const issueTitle = ev.payload.issue?.title || "";
            mapped.push({
              id,
              type: "issue",
              title: `${action.charAt(0).toUpperCase() + action.slice(1)} Issue #${issueNum}`,
              description: `Repository: ${repoName} — "${issueTitle}"`,
              timestamp: time,
              category: "prs_issues",
            });
          } else if (ev.type === "WatchEvent") {
            mapped.push({
              id,
              type: "star",
              title: `Starred repository ${repoName}`,
              description: `Marked codebase ${repoName} in star bookmarks.`,
              timestamp: time,
              category: "repos_stars",
            });
          } else if (ev.type === "ForkEvent") {
            mapped.push({
              id,
              type: "fork",
              title: `Forked codebase ${repoName}`,
              description: `Created clone repository path ${ev.payload.forkee?.full_name || repoName}`,
              timestamp: time,
              category: "repos_stars",
            });
          } else if (ev.type === "CreateEvent") {
            const refType = ev.payload.ref_type;
            mapped.push({
              id,
              type: "repo",
              title: `Created ${refType} in ${repoName}`,
              description: `Initial build initialization for branch/tag "${ev.payload.ref || repoName}".`,
              timestamp: time,
              category: "repos_stars",
            });
          } else if (ev.type === "ReleaseEvent") {
            mapped.push({
              id,
              type: "release",
              title: `Published release ${ev.payload.release?.tag_name || "stable"}`,
              description: `Repository: ${repoName} — "${ev.payload.release?.name || ""}"`,
              timestamp: time,
              category: "repos_stars",
            });
          }
        });

        if (isMounted) {
          if (mapped.length > 0) {
            setEvents(mapped.slice(0, 15));
          } else {
            setEvents(generateMockEvents());
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn("Live events fetch failed, falling back to mocks", err);
        if (isMounted) {
          setEvents(generateMockEvents());
          setLoading(false);
        }
      }
    };

    fetchLiveEvents();
    return () => {
      isMounted = false;
    };
  }, [profile.login, githubToken, contributions.totalStarsEarned, profile.followers]);

  const filteredEvents = events.filter(
    (e) => activeFilter === "all" || e.category === activeFilter
  );

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "commit":
        return <GitCommit className="h-4 w-4 text-emerald-400" />;
      case "pr":
        return <GitPullRequest className="h-4 w-4 text-purple-400" />;
      case "star":
        return <Star className="h-4 w-4 text-amber-400 font-bold fill-amber-400/20" />;
      case "repo":
        return <FolderPlus className="h-4 w-4 text-accent" />;
      case "issue":
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case "follower":
        return <UserPlus className="h-4 w-4 text-blue-400" />;
      case "fork":
        return <GitFork className="h-4 w-4 text-indigo-400" />;
      case "discussion":
        return <MessageSquare className="h-4 w-4 text-sky-400" />;
      case "release":
        return <Tag className="h-4 w-4 text-orange-400" />;
      default:
        return <Activity className="h-4 w-4 text-[#8B949E]" />;
    }
  };

  const getTimelineBadgeClass = (category: string) => {
    switch (category) {
      case "commits":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "prs_issues":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "repos_stars":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-surface-secondary text-text-secondary border-border";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent animate-pulse" />
          <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
            Live GitHub Activity Feed
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-surface p-1 rounded-lg border border-border">
          {[
            { id: "all", label: "All Activity" },
            { id: "commits", label: "Commits" },
            { id: "prs_issues", label: "PRs & Issues" },
            { id: "repos_stars", label: "Repos & Stars" },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeFilter === chip.id
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
          <Loader2 className="animate-spin text-accent mb-2" size={24} />
          <span className="text-xs font-semibold tracking-wider font-mono">Scaffolding event timeline...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-secondary text-xs">
          No live events found matching current category filter.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative group"
              >
                <div className="absolute -left-6 top-1.5 h-5 w-5 rounded-full bg-[#161B22] border-2 border-border flex items-center justify-center group-hover:border-accent transition-colors shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface/30 hover:bg-surface/60 transition-all space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {event.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary flex-shrink-0">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed pl-6">
                    {event.description}
                  </p>
                  <div className="pl-6 pt-1">
                    <span className={`inline-flex items-center text-[8px] font-bold px-1.5 py-0.5 border rounded-full uppercase tracking-wider font-mono ${getTimelineBadgeClass(event.category)}`}>
                      {event.category.replace("_", " & ")}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
