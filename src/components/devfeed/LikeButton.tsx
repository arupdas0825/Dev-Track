"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { toggleLike, isLiked } from "@/services/devfeedService";
import { DevTrackUser } from "@/types/user";
import { useToast } from "./useToast";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  currentUser: DevTrackUser | null;
}

export default function LikeButton({
  postId,
  initialCount,
  currentUser,
}: LikeButtonProps) {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Resolve initial liked state on mount
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    isLiked(postId, currentUser.uid).then((result) => {
      if (!cancelled) setLiked(result);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [postId, currentUser]);

  const handleClick = useCallback(async () => {
    if (!currentUser) {
      toast("Sign in to like posts.", "info");
      return;
    }
    if (loading) return;

    // Optimistic update
    const optimisticLiked = !liked;
    const optimisticCount = count + (optimisticLiked ? 1 : -1);
    setLiked(optimisticLiked);
    setCount(optimisticCount);
    setLoading(true);

    try {
      const result = await toggleLike(postId, currentUser.uid);
      // Sync with server truth (handles race conditions)
      setLiked(result.liked);
      setCount((prev) => prev + (result.liked !== optimisticLiked ? (result.liked ? 1 : -1) : 0));
    } catch {
      // Revert on error
      setLiked(liked);
      setCount(count);
      toast("Failed to update like. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUser, liked, count, loading, postId, toast]);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer ${
        liked
          ? "text-diff-remove"
          : "text-text-secondary hover:text-diff-remove"
      } disabled:opacity-60`}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart
        size={14}
        className={`transition-transform ${loading ? "scale-90" : "hover:scale-110"}`}
        fill={liked ? "currentColor" : "none"}
      />
      <span>{count}</span>
    </button>
  );
}
