"use client";

import { UserDashboardData } from "@/types";
import { Milestone, Flag, CheckCircle, Flame, Star, GitPullRequest, Code, FolderGit2 } from "lucide-react";

interface DeveloperMilestonesProps {
  data: UserDashboardData;
}

interface MilestoneItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  achieved: boolean;
  dateStr: string;
}

export default function DeveloperMilestones({ data }: DeveloperMilestonesProps) {
  const { profile, contributions, repositories } = data;

  const totalContribs = contributions.totalCommits + contributions.totalPRs + contributions.totalIssues;

  const milestones: MilestoneItem[] = [
    {
      id: "first_repo",
      title: "First Repository Created",
      category: "Repository",
      icon: <FolderGit2 className="h-4 w-4 text-accent" />,
      achieved: repositories.length > 0 || profile.public_repos > 0,
      dateStr: "Achieved Early Career",
    },
    {
      id: "first_star",
      title: "Received First Star",
      category: "Recognition",
      icon: <Star className="h-4 w-4 text-amber-400" />,
      achieved: contributions.totalStarsEarned > 0,
      dateStr: "Achieved Milestone",
    },
    {
      id: "first_pr",
      title: "First Pull Request Merged",
      category: "Collaboration",
      icon: <GitPullRequest className="h-4 w-4 text-purple-400" />,
      achieved: contributions.totalPRs > 0,
      dateStr: "Achieved Milestone",
    },
    {
      id: "commits_100",
      title: "100 Commits Milestone",
      category: "Velocity",
      icon: <Code className="h-4 w-4 text-blue-400" />,
      achieved: totalContribs >= 100,
      dateStr: "Achieved Milestone",
    },
    {
      id: "commits_500",
      title: "500 Commits Milestone",
      category: "Velocity",
      icon: <Flame className="h-4 w-4 text-orange-400" />,
      achieved: totalContribs >= 500,
      dateStr: totalContribs >= 500 ? "Achieved Milestone" : "In Progress",
    },
    {
      id: "first_os",
      title: "First Open Source Contribution",
      category: "Community",
      icon: <Flag className="h-4 w-4 text-emerald-400" />,
      achieved: true,
      dateStr: "Achieved Milestone",
    },
    {
      id: "commits_1000",
      title: "1000 Commits Master",
      category: "Legendary",
      icon: <Milestone className="h-4 w-4 text-rose-400" />,
      achieved: totalContribs >= 1000,
      dateStr: totalContribs >= 1000 ? "Achieved Milestone" : "Target Goal",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Milestone className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
            Developer Career Roadmap & Milestones
          </h3>
        </div>
        <span className="text-xs font-mono text-text-secondary">
          {milestones.filter((m) => m.achieved).length} / {milestones.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m, idx) => (
          <div
            key={m.id}
            className={`p-4 rounded-xl border transition-all ${
              m.achieved
                ? "bg-surface/50 border-border hover:border-accent/50"
                : "bg-surface/10 border-border/40 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-surface border border-border">
                {m.icon}
              </div>
              {m.achieved ? (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                  <CheckCircle size={12} /> Unlocked
                </span>
              ) : (
                <span className="text-[10px] font-mono text-text-secondary">
                  Locked
                </span>
              )}
            </div>

            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
              Step 0{idx + 1} • {m.category}
            </div>
            <h4 className="text-xs font-bold text-text-primary mt-1">
              {m.title}
            </h4>
            <div className="text-[10px] text-text-secondary mt-2 pt-2 border-t border-border/40 font-mono">
              {m.dateStr}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
