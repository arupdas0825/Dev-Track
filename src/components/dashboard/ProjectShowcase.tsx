"use client";

import { useMemo } from "react";
import { GitHubRepository } from "@/types";
import { formatBytes } from "@/lib/utils";
import { Star, GitFork, BookOpen, Clock, Zap, Shield, Sparkles, Folder } from "lucide-react";

interface ProjectShowcaseProps {
  repositories: GitHubRepository[];
}

interface ShowcaseItem {
  category: "Most Starred" | "Most Active" | "Fastest Growing" | "Largest Project" | "Best Documented" | "Recently Updated" | "AI Recommended";
  repo: GitHubRepository;
  icon: any;
  colorClass: string;
  gradientBorder: string;
  reason: string;
}

export default function ProjectShowcase({ repositories }: ProjectShowcaseProps) {
  const showcaseItems = useMemo((): ShowcaseItem[] => {
    if (repositories.length === 0) return [];

    const items: ShowcaseItem[] = [];

    // Helper quality score calculation
    const getQualityScore = (repo: GitHubRepository): number => {
      let base = 50;
      if (repo.description && repo.description.trim().length > 0) {
        base += Math.min(15, repo.description.trim().length * 0.1);
      }
      if (!repo.fork) base += 15;
      const starForkCount = (repo.stargazers_count || 0) + (repo.forks_count || 0);
      if (starForkCount > 0) base += Math.min(15, Math.log2(starForkCount + 1) * 3);
      const openIssues = repo.open_issues_count || 0;
      if (openIssues === 0) base += 10;
      return Math.min(100, Math.round(base));
    };

    // 1. Most Starred
    const sortedByStars = [...repositories].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    if (sortedByStars[0] && sortedByStars[0].stargazers_count > 0) {
      items.push({
        category: "Most Starred",
        repo: sortedByStars[0],
        icon: Star,
        colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        gradientBorder: "group-hover:border-amber-500/50 hover:shadow-amber-500/5",
        reason: `Leading community engagement with ${sortedByStars[0].stargazers_count} stars.`
      });
    }

    // 2. Most Active
    const sortedByActive = [...repositories].sort((a, b) => (b.forks_count || 0) - (a.forks_count || 0));
    if (sortedByActive[0]) {
      items.push({
        category: "Most Active",
        repo: sortedByActive[0],
        icon: Zap,
        colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
        gradientBorder: "group-hover:border-purple-500/50 hover:shadow-purple-500/5",
        reason: `Highest collaboration depth with ${sortedByActive[0].forks_count} clones/forks.`
      });
    }

    // 3. Largest Project
    const sortedBySize = [...repositories].sort((a, b) => (b.size || 0) - (a.size || 0));
    if (sortedBySize[0]) {
      items.push({
        category: "Largest Project",
        repo: sortedBySize[0],
        icon: Folder,
        colorClass: "text-[#58A6FF] bg-blue-500/10 border-blue-500/30",
        gradientBorder: "group-hover:border-blue-500/50 hover:shadow-blue-500/5",
        reason: `Largest codebase index summing ${(sortedBySize[0].size / 1024).toFixed(1)} MB.`
      });
    }

    // 4. Best Documented
    const sortedByDoc = [...repositories].sort((a, b) => {
      const aLen = a.description?.length || 0;
      const bLen = b.description?.length || 0;
      return bLen - aLen;
    });
    if (sortedByDoc[0] && sortedByDoc[0].description) {
      items.push({
        category: "Best Documented",
        repo: sortedByDoc[0],
        icon: BookOpen,
        colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        gradientBorder: "group-hover:border-emerald-500/50 hover:shadow-emerald-500/5",
        reason: "Rich descriptive metadata scanned in project index."
      });
    }

    // 5. Recently Updated
    const sortedByRecent = [...repositories].sort((a, b) => new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime());
    if (sortedByRecent[0]) {
      items.push({
        category: "Recently Updated",
        repo: sortedByRecent[0],
        icon: Clock,
        colorClass: "text-sky-400 bg-sky-500/10 border-sky-500/30",
        gradientBorder: "group-hover:border-sky-500/50 hover:shadow-sky-500/5",
        reason: `Active velocity: commits pushed recently.`
      });
    }

    // 6. AI Recommended Project
    const sortedByQuality = [...repositories].sort((a, b) => getQualityScore(b) - getQualityScore(a));
    if (sortedByQuality[0]) {
      items.push({
        category: "AI Recommended",
        repo: sortedByQuality[0],
        icon: Sparkles,
        colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        gradientBorder: "group-hover:border-indigo-500/50 hover:shadow-indigo-500/5",
        reason: `Top QA rating of ${getQualityScore(sortedByQuality[0])}% based on code parameters.`
      });
    }

    // De-duplicate: Make sure we only show unique repos by category, selecting the best match
    const seen = new Set<number>();
    const uniqueItems: ShowcaseItem[] = [];
    items.forEach(item => {
      if (!seen.has(item.repo.id)) {
        seen.add(item.repo.id);
        uniqueItems.push(item);
      }
    });

    return uniqueItems.slice(0, 4); // Limit to top 4 unique showcases
  }, [repositories]);

  if (showcaseItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
          <Sparkles size={16} className="text-indigo-400" />
          <span>Curated Project Showcase</span>
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">Automated highlight selections derived from quality score models.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showcaseItems.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className={`group rounded-xl border border-border bg-[#161B22]/30 p-5 transition-all duration-300 hover:bg-[#161B22]/65 flex flex-col justify-between ${item.gradientBorder}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${item.colorClass}`}>
                    {item.category}
                  </span>
                  <Icon size={14} className={item.colorClass.split(" ")[0]} />
                </div>

                <div>
                  <a
                    href={item.repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold font-space-grotesk text-sm text-[#F0F6FC] hover:text-[#58A6FF] transition-colors truncate block"
                  >
                    {item.repo.name}
                  </a>
                  <p className="text-[10px] text-text-secondary italic mt-0.5 leading-relaxed font-mono">
                    {item.reason}
                  </p>
                </div>

                {item.repo.description && (
                  <p className="text-xs text-[#8B949E] leading-relaxed line-clamp-2">
                    {item.repo.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border/40 mt-4 pt-3 text-[10px] text-text-secondary font-mono">
                {item.repo.language && (
                  <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                    <span className="h-2 w-2 rounded-full bg-[#58A6FF]" />
                    {item.repo.language}
                  </span>
                )}
                <div className="flex items-center gap-2.5">
                  <span title="Stars">⭐ {item.repo.stargazers_count}</span>
                  <span title="Forks">🍴 {item.repo.forks_count}</span>
                  <span>{formatBytes((item.repo.size || 0) * 1024)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
