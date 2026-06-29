"use client";

import { useState } from "react";
import { UserDashboardData } from "@/types";
import { GitCommit, Star, GitFork, AlertCircle, GitPullRequest, FolderPlus, UserPlus, Activity } from "lucide-react";

interface ActivityTimelineProps {
  data: UserDashboardData;
}

interface TimelineEvent {
  id: string;
  type: "commit" | "star" | "fork" | "issue" | "pr" | "repo" | "follower";
  title: string;
  description: string;
  timestamp: string;
  category: "commits" | "prs_issues" | "repos_stars";
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  const { profile, contributions } = data;
  const [activeFilter, setActiveFilter] = useState<"all" | "commits" | "prs_issues" | "repos_stars">("all");

  const mockTimelineEvents: TimelineEvent[] = [
    {
      id: "1",
      type: "commit",
      title: "Pushed 3 commits to main branch",
      description: "Implemented global command palette and SaaS frontend enhancements.",
      timestamp: "2 hours ago",
      category: "commits",
    },
    {
      id: "2",
      type: "pr",
      title: "Merged Pull Request #42",
      description: "Added notification center and quick actions panel.",
      timestamp: "5 hours ago",
      category: "prs_issues",
    },
    {
      id: "3",
      type: "star",
      title: "Starred repository vercel/next.js",
      description: "Added next.js to star collection.",
      timestamp: "1 day ago",
      category: "repos_stars",
    },
    {
      id: "4",
      type: "repo",
      title: "Created new repository dev-track",
      description: `Public repository built with React & Tailwind. Total stars: ${contributions.totalStarsEarned}.`,
      timestamp: "3 days ago",
      category: "repos_stars",
    },
    {
      id: "5",
      type: "issue",
      title: "Closed Issue #14: Dark Mode Palette Fix",
      description: "Resolved styling alignment on high contrast themes.",
      timestamp: "4 days ago",
      category: "prs_issues",
    },
    {
      id: "6",
      type: "follower",
      title: "Gained 5 new followers",
      description: `Account current follower count: ${profile.followers}.`,
      timestamp: "1 week ago",
      category: "repos_stars",
    },
  ];

  const filteredEvents = mockTimelineEvents.filter(
    (e) => activeFilter === "all" || e.category === activeFilter
  );

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "commit":
        return <GitCommit className="h-4 w-4 text-emerald-400" />;
      case "pr":
        return <GitPullRequest className="h-4 w-4 text-purple-400" />;
      case "star":
        return <Star className="h-4 w-4 text-amber-400" />;
      case "repo":
        return <FolderPlus className="h-4 w-4 text-accent" />;
      case "issue":
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case "follower":
        return <UserPlus className="h-4 w-4 text-blue-400" />;
      case "fork":
        return <GitFork className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
            Activity Timeline Feed
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
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
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

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative group">
            <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-[#161B22] border-2 border-border flex items-center justify-center group-hover:border-accent transition-colors shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-surface/30 hover:bg-surface/60 transition-all space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getEventIcon(event.type)}
                  <h4 className="text-xs font-bold text-text-primary truncate">
                    {event.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-text-secondary flex-shrink-0">
                  {event.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed pl-6">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
