"use client";

import React, { useState } from "react";
import { DevTrackUser } from "@/types/user";
import { DevFeedPost } from "@/types/devfeed";
import PostComposer from "./PostComposer";
import FeedList from "./FeedList";

interface DevFeedTabProps {
  currentUser: DevTrackUser;
}

/**
 * Thin wrapper that wires PostComposer → FeedList inside the dashboard tab layout.
 * Passes newly created posts directly to FeedList so they appear instantly.
 */
export default function DevFeedTab({ currentUser }: DevFeedTabProps) {
  const [latestPost, setLatestPost] = useState<DevFeedPost | null>(null);

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
          DevFeed
        </h2>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-semibold">
          LIVE
        </span>
      </div>

      <PostComposer
        currentUser={currentUser}
        onPostCreated={(post) => setLatestPost(post)}
      />

      <FeedList currentUser={currentUser} newPost={latestPost} />
    </div>
  );
}
