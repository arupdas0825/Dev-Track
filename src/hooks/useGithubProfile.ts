import { useState, useEffect } from "react";
import { GitHubProfile } from "@/types";
import { getUserFromFirestore } from "@/lib/firebase";
import { fetchGitHubDashboardData } from "@/lib/github";

export function useGithubProfile(username: string, token?: string) {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    let isMounted = true;
    const loadProfile = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await getUserFromFirestore(username);
        if (data && isMounted) {
          setProfile(data.profile);
        } else {
          const liveData = await fetchGitHubDashboardData(username, token);
          if (isMounted) setProfile(liveData.profile);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [username, token]);

  return { profile, loading, error };
}
