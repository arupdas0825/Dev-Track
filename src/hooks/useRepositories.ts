import { useState, useEffect } from "react";
import { GitHubRepository } from "@/types";
import { getUserFromFirestore } from "@/lib/firebase";
import { fetchGitHubDashboardData } from "@/lib/github";

export function useRepositories(username: string, token?: string) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    let isMounted = true;
    const loadRepositories = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await getUserFromFirestore(username);
        if (data && isMounted) {
          setRepositories(data.repositories);
        } else {
          const liveData = await fetchGitHubDashboardData(username, token);
          if (isMounted) setRepositories(liveData.repositories);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load repositories");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRepositories();
    return () => {
      isMounted = false;
    };
  }, [username, token]);

  return { repositories, loading, error };
}
