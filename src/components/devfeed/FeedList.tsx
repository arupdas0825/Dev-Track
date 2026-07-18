"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Rss, Loader2 } from "lucide-react";
import { getFeedForUser } from "@/services/devfeedService";
import { DevFeedPost } from "@/types/devfeed";
import { DevTrackUser } from "@/types/user";
import { SkeletonFeed } from "@/components/ui/SkeletonLoader";
import EmptyState from "@/components/ui/EmptyState";
import PostCard from "./PostCard";
import { useToast } from "./useToast";

interface FeedListProps {
  currentUser: DevTrackUser;
  /** Prepend a newly created post without re-fetching */
  newPost?: DevFeedPost | null;
}

export default function FeedList({ currentUser, newPost }: FeedListProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<DevFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const loadFeed = useCallback(async (cursor?: string) => {
    try {
      const result = await getFeedForUser(currentUser.uid, cursor);
      setPosts((prev) =>
        cursor ? [...prev, ...result.posts] : result.posts
      );
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error("getFeedForUser failed:", err);
      setError(true);
      toast("Failed to load feed.", "error");
    }
  }, [currentUser.uid, toast]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    loadFeed().finally(() => setLoading(false));
  }, [loadFeed]);

  // Prepend newly created posts
  useEffect(() => {
    if (!newPost) return;
    setPosts((prev) => {
      if (prev.some((p) => p.id === newPost.id)) return prev;
      return [newPost, ...prev];
    });
  }, [newPost]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await loadFeed(nextCursor);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonFeed />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <EmptyState
        title="Feed unavailable"
        description="We couldn't load your feed right now. Check your connection and try again."
        primaryActionLabel="Retry"
        onPrimaryAction={() => {
          setError(false);
          setLoading(true);
          loadFeed().finally(() => setLoading(false));
        }}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<Rss size={22} />}
        title="Your feed is empty"
        description="Follow other developers or create your first post to get started."
      />
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={currentUser} />
        ))}
      </AnimatePresence>

      {nextCursor && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 size={13} className="animate-spin" />
            ) : null}
            <span>{loadingMore ? "Loading…" : "Load more"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
