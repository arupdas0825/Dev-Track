"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { getPostsByUsername } from "@/services/devfeedService";
import { DevFeedPost } from "@/types/devfeed";
import { DevTrackUser } from "@/types/user";
import { SkeletonFeed } from "@/components/ui/SkeletonLoader";
import EmptyState from "@/components/ui/EmptyState";
import PostCard from "./PostCard";
import { useToast } from "./useToast";

interface ProfilePostsTabProps {
  username: string;
  currentUser: DevTrackUser | null;
}

export default function ProfilePostsTab({
  username,
  currentUser,
}: ProfilePostsTabProps) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<DevFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (cursor?: string) => {
      try {
        const result = await getPostsByUsername(username, cursor);
        setPosts((prev) =>
          cursor ? [...prev, ...result.posts] : result.posts
        );
        setNextCursor(result.nextCursor);
      } catch {
        toast("Failed to load posts.", "error");
      }
    },
    [username, toast]
  );

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setNextCursor(null);
    loadPosts().finally(() => setLoading(false));
  }, [loadPosts]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await loadPosts(nextCursor);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <SkeletonFeed />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={22} />}
        title="No posts yet"
        description={`@${username} hasn't published any posts to DevFeed yet.`}
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
            {loadingMore ? <Loader2 size={13} className="animate-spin" /> : null}
            <span>{loadingMore ? "Loading…" : "Load more"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
