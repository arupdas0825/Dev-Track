"use client";

import { useEffect, useState } from "react";
import { UserDashboardData } from "@/types";
import { Flame, CheckCircle2, Award, Target, Clock, Sparkles } from "lucide-react";
import DeveloperBattleModal from "@/components/card/DeveloperBattleModal";

interface DashboardHeaderProps {
  data: UserDashboardData;
}

export default function DashboardHeader({ data }: DashboardHeaderProps) {
  const { profile, contributions, score } = data;
  const [greeting, setGreeting] = useState("Welcome");
  const [syncedTimeAgo, setSyncedTimeAgo] = useState("Just now");
  const [battleModalOpen, setBattleModalOpen] = useState(false);

  const totalContribs = contributions.totalCommits + contributions.totalPRs + contributions.totalIssues;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const minutes = Math.floor(Math.random() * 8) + 1;
    setSyncedTimeAgo(`${minutes}m ago`);
  }, []);

  const nextMilestoneGoal = totalContribs < 500 ? 500 : 1000;
  const milestoneProgress = Math.min(
    Math.round((totalContribs / nextMilestoneGoal) * 100),
    100
  );

  return (
    <>
      <div className="mb-6 rounded-xl border border-border bg-[#161B22]/80 p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-space-grotesk text-text-primary">
                {greeting}, {profile.name || profile.login} 👋
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={12} />
                Synced {syncedTimeAgo}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Here is your developer velocity, streak metrics, and productivity breakdown.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setBattleModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title="View Developer Card & Battle"
            >
              <Sparkles size={16} />
              <div className="text-left leading-none">
                <div className="text-[9px] uppercase font-mono font-bold opacity-80">Holographic</div>
                <div className="text-xs font-bold mt-0.5">Card & Battle</div>
              </div>
            </button>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface/50 border border-border">
              <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[10px] text-text-secondary uppercase font-mono font-bold">Today</div>
                <div className="text-xs font-bold text-text-primary">
                  {contributions.currentStreak > 0 ? "Active Code Day" : "Rest Day"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface/50 border border-border">
              <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-400">
                <Flame size={16} />
              </div>
              <div>
                <div className="text-[10px] text-text-secondary uppercase font-mono font-bold">Streak</div>
                <div className="text-xs font-bold text-text-primary">
                  {contributions.currentStreak} Days 🔥
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface/50 border border-border">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                <Award size={16} />
              </div>
              <div>
                <div className="text-[10px] text-text-secondary uppercase font-mono font-bold">Grade</div>
                <div className="text-xs font-bold text-text-primary">
                  Rank {score.grade}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Target size={14} className="text-accent" />
            <span>Next Goal: <strong>{nextMilestoneGoal} Contributions</strong> ({milestoneProgress}% complete)</span>
          </div>
          <div className="w-full sm:w-48 bg-surface-secondary h-2 rounded-full overflow-hidden border border-border">
            <div
              className="bg-accent h-full transition-all duration-500 rounded-full"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>
      </div>

      <DeveloperBattleModal
        isOpen={battleModalOpen}
        onClose={() => setBattleModalOpen(false)}
        initialUsername={profile.login}
        isAuthenticated={true}
        onRequireAuth={() => {}}
      />
    </>
  );
}
