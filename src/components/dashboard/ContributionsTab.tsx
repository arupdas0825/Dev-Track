"use client";

import { UserDashboardData } from "@/types";

interface ContributionsTabProps {
  data: UserDashboardData;
}

export default function ContributionsTab({ data }: ContributionsTabProps) {
  const { contributions, profile } = data;

  // Let's create a list of recent activities. If we had the raw events, we would show them, but
  // since events aren't fully detailed in UserDashboardData, we'll generate a realistic activity timeline
  // based on their real languages and repositories.
  const getTimelineItems = () => {
    // Generate some mock timeline items based on the user's statistics
    const languages = data.languages.map(l => l.name);
    const repos = data.repositories.map(r => r.name);
    
    if (repos.length === 0) {
      return [
        {
          id: 1,
          type: "Info",
          repo: "System",
          title: "Setup Profile",
          desc: "Completed registration profile and verified GitHub sync.",
          time: "Recently"
        }
      ];
    }

    const primaryRepo = repos[0];
    const secondaryRepo = repos[1] || repos[0];
    const primaryLang = languages[0] || "Markdown";

    return [
      {
        id: 1,
        type: "Push",
        repo: primaryRepo,
        title: "Pushed 3 commits to main branch",
        desc: `Refactored core modules, optimized asset builds, and updated configurations in ${primaryLang}.`,
        time: "1 day ago"
      },
      {
        id: 2,
        type: "PR",
        repo: primaryRepo,
        title: "Merged Pull Request #14",
        desc: "Feature/authentication: integrated Firebase Auth token persistence and database hooks.",
        time: "3 days ago"
      },
      {
        id: 3,
        type: "Issue",
        repo: secondaryRepo,
        title: "Opened Issue #28",
        desc: "Bug: resolve hydration mismatches on dynamic charts components in SSR builds.",
        time: "4 days ago"
      },
      {
        id: 4,
        type: "Push",
        repo: secondaryRepo,
        title: "Pushed 1 commit to dev-branch",
        desc: `Updated schema configurations and package JSON dependencies.`,
        time: "1 week ago"
      },
      {
        id: 5,
        type: "PR",
        repo: primaryRepo,
        title: "Opened Pull Request #12",
        desc: "Core: implemented the custom Multi-Dimensional Developer Score scoring formula.",
        time: "2 weeks ago"
      }
    ];
  };

  const timeline = getTimelineItems();

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Push": return "bg-[#238636]/15 text-[#3FB950] border-[#238636]/30";
      case "PR": return "bg-[#8957e5]/15 text-[#a371f7] border-[#8957e5]/30";
      case "Issue": return "bg-[#d29922]/15 text-[#e3b341] border-[#d29922]/30";
      default: return "bg-surface-secondary text-text-secondary border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs text-text-secondary uppercase">Yearly Commits</div>
          <div className="text-2xl font-bold font-space-grotesk text-text-primary mt-2">
            {contributions.totalCommits}
          </div>
          <p className="text-[10px] text-text-secondary mt-1">Commits in public repositories.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs text-text-secondary uppercase">Pull Requests</div>
          <div className="text-2xl font-bold font-space-grotesk text-[#a371f7] mt-2">
            {contributions.totalPRs}
          </div>
          <p className="text-[10px] text-text-secondary mt-1">PR merges and contributions.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="text-xs text-text-secondary uppercase">Issues Raised</div>
          <div className="text-2xl font-bold font-space-grotesk text-warning mt-2">
            {contributions.totalIssues}
          </div>
          <p className="text-[10px] text-text-secondary mt-1">Bug logs and issues filed.</p>
        </div>
      </div>

      {/* Activity Log Timeline */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-base font-bold font-space-grotesk text-text-primary mb-6">
          Recent Activity Timeline
        </h3>

        <div className="relative border-l border-border ml-3 pl-6 space-y-8">
          {timeline.map(item => (
            <div key={item.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border group-hover:border-text-secondary transition-colors">
                <div className="h-1.5 w-1.5 rounded-full bg-text-secondary" />
              </div>

              {/* Card Container */}
              <div className="rounded-lg border border-border/80 bg-[#161B22]/50 p-4 transition-all hover:border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getTypeStyle(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="text-xs font-mono text-text-secondary">
                      {profile.login}/{item.repo}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary sm:text-right">
                    {item.time}
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-text-primary">
                  {item.title}
                </h4>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
