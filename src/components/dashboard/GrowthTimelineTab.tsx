"use client";

import { useMemo } from "react";
import { UserDashboardData } from "@/types";
import { motion } from "framer-motion";
import { Calendar, Award, GitCommit, GitPullRequest, Star, Users, CheckCircle2, Circle, Lock } from "lucide-react";

interface GrowthTimelineTabProps {
  data: UserDashboardData;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dateText: string;
  status: "completed" | "current" | "locked";
  icon: any;
}

export default function GrowthTimelineTab({ data }: GrowthTimelineTabProps) {
  const { profile, contributions, score } = data;

  const milestones = useMemo((): Milestone[] => {
    const list: Milestone[] = [];
    const totalCommits = contributions.totalCommits || 0;
    const totalStars = contributions.totalStarsEarned || 0;
    const totalPRs = contributions.totalPRs || 0;
    const followers = profile.followers || 0;
    const devScore = score.overall || 0;

    // 1. Started GitHub
    const createdDate = new Date(profile.created_at);
    const createdDateText = createdDate.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    list.push({
      id: "git_start",
      title: "Joined GitHub",
      description: `Initialized account @${profile.login} on the global developer network.`,
      dateText: createdDateText,
      status: "completed",
      icon: Calendar,
    });

    // 2. First Repository
    list.push({
      id: "first_repo",
      title: "First Codebase Launched",
      description: "Successfully initialized and published your first public repository.",
      dateText: createdDate.toLocaleDateString("en-US", { year: "numeric", month: "short" }), // Estimated
      status: "completed",
      icon: Award,
    });

    // 3. 100 Commits
    list.push({
      id: "commits_100",
      title: "100 Commits Milestone",
      description: "Wrote version control logs for over 100 individual changes.",
      dateText: totalCommits >= 100 ? "Achieved" : "In Progress",
      status: totalCommits >= 100 ? "completed" : (totalCommits >= 30 ? "current" : "locked"),
      icon: GitCommit,
    });

    // 4. First Star
    list.push({
      id: "first_star",
      title: "Community Resonance (First Star)",
      description: "Your open-source repository starred by another developer.",
      dateText: totalStars >= 1 ? "Achieved" : "Pending Resonance",
      status: totalStars >= 1 ? "completed" : (totalStars === 0 && totalCommits >= 50 ? "current" : "locked"),
      icon: Star,
    });

    // 5. First Pull Request
    list.push({
      id: "first_pr",
      title: "Open Source Contributor (First PR)",
      description: "Collaborated on remote branches by submitting code changes via Pull Request.",
      dateText: totalPRs >= 1 ? "Achieved" : "Pending Contribution",
      status: totalPRs >= 1 ? "completed" : (totalPRs === 0 && totalCommits >= 80 ? "current" : "locked"),
      icon: GitPullRequest,
    });

    // 6. 500 Commits
    list.push({
      id: "commits_500",
      title: "500 Commits Milestone",
      description: "Deepened contribution velocity, scaling index tracking and repository changes.",
      dateText: totalCommits >= 500 ? "Achieved" : `${totalCommits} / 500`,
      status: totalCommits >= 500 ? "completed" : (totalCommits >= 100 && totalCommits < 500 ? "current" : "locked"),
      icon: GitCommit,
    });

    // 7. Reached 50 Followers
    list.push({
      id: "followers_50",
      title: "Network Synergy (50 Followers)",
      description: "Secured follow actions from over 50 registered engineers on GitHub.",
      dateText: followers >= 50 ? "Achieved" : `${followers} / 50`,
      status: followers >= 50 ? "completed" : (followers >= 10 && followers < 50 ? "current" : "locked"),
      icon: Users,
    });

    // 8. Reached A Grade (Score >= 80)
    list.push({
      id: "grade_a",
      title: "Elite Developer (Reached A Grade)",
      description: "Aggregated a Developer Index score over 80/100, securing Grade A ranking.",
      dateText: devScore >= 80 ? "Achieved" : `${devScore} / 80`,
      status: devScore >= 80 ? "completed" : (devScore >= 60 && devScore < 80 ? "current" : "locked"),
      icon: Award,
    });

    // 9. 1000 Commits
    list.push({
      id: "commits_1000",
      title: "1000 Commits Milestone (Legendary Builder)",
      description: "Fulfill elite coding cadence: commit 1,000+ times to reach legendary repository scale.",
      dateText: totalCommits >= 1000 ? "Achieved" : `${totalCommits} / 1000`,
      status: totalCommits >= 1000 ? "completed" : (totalCommits >= 500 && totalCommits < 1000 ? "current" : "locked"),
      icon: GitCommit,
    });

    return list;
  }, [profile.created_at, profile.login, profile.followers, contributions.totalCommits, contributions.totalStarsEarned, contributions.totalPRs, score.overall]);

  const getStatusDisplay = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return {
          iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          cardBorder: "border-emerald-500/20 bg-emerald-500/5",
          dotColor: "bg-emerald-400",
          badge: <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">Achieved</span>
        };
      case "current":
        return {
          iconColor: "text-accent bg-accent/10 border-accent/30",
          cardBorder: "border-accent/40 bg-accent/5 shadow-lg shadow-accent/5",
          dotColor: "bg-accent animate-pulse",
          badge: <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 uppercase tracking-wide animate-pulse">In Progress</span>
        };
      default:
        return {
          iconColor: "text-text-secondary bg-surface border-border",
          cardBorder: "border-border/50 bg-[#161B22]/10 opacity-60",
          dotColor: "bg-border",
          badge: <span className="text-[9px] font-bold text-text-secondary bg-surface px-2 py-0.5 rounded-full border border-border uppercase tracking-wide">Locked</span>
        };
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="rounded-xl border border-border bg-[#161B22]/60 p-6">
        <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
          Developer Career Growth Roadmap
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Milestones and performance checks mapping your code journey from day one.
        </p>
      </div>

      {/* Timeline Stem & List */}
      <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-border/60">
        {milestones.map((milestone, idx) => {
          const display = getStatusDisplay(milestone.status);
          const Icon = milestone.icon;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="relative group"
            >
              {/* Timeline dot */}
              <div className="absolute -left-8 top-1.5 h-4 w-4 rounded-full bg-[#0d1117] border border-border flex items-center justify-center group-hover:border-accent transition-colors">
                <div className={`h-1.5 w-1.5 rounded-full ${display.dotColor}`} />
              </div>

              {/* Milestone Card */}
              <div className={`rounded-xl border p-5 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${display.cardBorder}`}>
                <div className="flex gap-4 items-start">
                  <div className={`p-2 rounded-lg border flex-shrink-0 mt-0.5 ${display.iconColor}`}>
                    {milestone.status === "locked" ? <Lock size={16} /> : <Icon size={16} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className="text-xs font-bold text-text-primary">
                        {milestone.title}
                      </h4>
                      <span className="text-[10px] text-text-secondary">
                        ({milestone.dateText})
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-sans max-w-xl">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {display.badge}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
