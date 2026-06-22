import { useState, useEffect } from "react";
import { LanguageStat, ContributionStats, DeveloperScore, AIInsights, GitHubWrapped } from "@/types";
import { getUserFromFirestore } from "@/lib/firebase";
import { fetchGitHubDashboardData } from "@/lib/github";

export function useAnalytics(username: string, token?: string) {
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [contributions, setContributions] = useState<ContributionStats | null>(null);
  const [score, setScore] = useState<DeveloperScore | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [wrapped, setWrapped] = useState<GitHubWrapped | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    let isMounted = true;
    const loadAnalytics = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await getUserFromFirestore(username);
        if (data && isMounted) {
          setLanguages(data.languages);
          setContributions(data.contributions);
          setScore(data.score);
          setAiInsights(data.aiInsights);
          setWrapped(data.wrapped);
        } else {
          const liveData = await fetchGitHubDashboardData(username, token);
          if (isMounted) {
            setLanguages(liveData.languages);
            setContributions(liveData.contributions);
            setScore(liveData.score);
            setAiInsights(liveData.aiInsights);
            setWrapped(liveData.wrapped);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load analytics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [username, token]);

  return { languages, contributions, score, aiInsights, wrapped, loading, error };
}
