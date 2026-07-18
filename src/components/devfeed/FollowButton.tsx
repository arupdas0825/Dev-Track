"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toggleFollow, isFollowing } from "@/services/devfeedService";
import { useToast } from "./useToast";

interface FollowButtonProps {
  /** UID of the logged-in viewer */
  viewerUid: string | null;
  /** UID of the profile being viewed */
  profileUid: string;
  className?: string;
}

export default function FollowButton({
  viewerUid,
  profileUid,
  className = "",
}: FollowButtonProps) {
  const { toast } = useToast();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Don't render if viewing own profile or not logged in
  const isOwnProfile = viewerUid === profileUid;

  useEffect(() => {
    if (!viewerUid || isOwnProfile) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    isFollowing(viewerUid, profileUid)
      .then((result) => { if (!cancelled) setFollowing(result); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [viewerUid, profileUid, isOwnProfile]);

  const handleClick = useCallback(async () => {
    if (!viewerUid) { toast("Sign in to follow developers.", "info"); return; }
    if (loading) return;

    // Optimistic
    const optimistic = !following;
    setFollowing(optimistic);
    setLoading(true);

    try {
      const result = await toggleFollow(viewerUid, profileUid);
      setFollowing(result.following);
      toast(result.following ? "Now following!" : "Unfollowed.", "success");
    } catch {
      setFollowing(following); // revert
      toast("Action failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [viewerUid, profileUid, following, loading, toast]);

  if (!viewerUid || isOwnProfile) return null;
  if (checking) return (
    <div className={`h-8 w-20 rounded-lg bg-surface-secondary border border-border animate-pulse ${className}`} />
  );

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-60 ${
        following
          ? "bg-surface border border-border text-text-secondary hover:border-diff-remove/50 hover:text-diff-remove"
          : "bg-accent text-white hover:bg-accent/90"
      } ${className}`}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : following ? (
        <UserCheck size={12} />
      ) : (
        <UserPlus size={12} />
      )}
      <span>{following ? "Following" : "Follow"}</span>
    </button>
  );
}
