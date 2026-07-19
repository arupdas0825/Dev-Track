"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hash, UserPlus, Loader2 } from "lucide-react";
import { DEVTRACK_PULSE } from "@/lib/devfeedPulse";
import { SuggestedDeveloper } from "@/services/devfeedService";
import { toggleFollow, isFollowing } from "@/services/devfeedService";
import { DevTrackUser } from "@/types/user";

interface RightInsightsPanelProps {
  currentUser: DevTrackUser | null;
  suggestions: SuggestedDeveloper[];
  onFollowChange?: (uid: string, nowFollowing: boolean) => void;
}

function SuggestionCard({
  dev,
  currentUser,
  onFollowChange,
}: {
  dev: SuggestedDeveloper;
  currentUser: DevTrackUser | null;
  onFollowChange?: (uid: string, nowFollowing: boolean) => void;
}) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUser || loading) return;
    setLoading(true);
    const optimistic = !following;
    setFollowing(optimistic);
    try {
      const result = await toggleFollow(currentUser.uid, dev.uid);
      setFollowing(result.following);
      onFollowChange?.(dev.uid, result.following);
    } catch {
      setFollowing(!optimistic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-2.5 py-2.5 px-3 hover:bg-surface-secondary/50 rounded-lg transition-colors">
      <Link href={`/u/${dev.username}`} className="flex-shrink-0">
        {dev.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dev.avatarUrl}
            alt={dev.displayName ?? dev.username}
            className="h-9 w-9 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-accent font-bold text-sm">
            {(dev.displayName ?? dev.username)[0].toUpperCase()}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/u/${dev.username}`}
          className="block text-[12px] font-semibold text-text-primary hover:text-accent transition-colors leading-tight truncate"
        >
          {dev.displayName ?? dev.username}
        </Link>
        <p className="text-[10px] text-text-secondary truncate">@{dev.username}</p>
      </div>
      {currentUser && currentUser.uid !== dev.uid && (
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
            following
              ? "bg-surface border border-border text-text-secondary"
              : "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20"
          }`}
        >
          {loading ? (
            <Loader2 size={9} className="animate-spin" />
          ) : (
            <UserPlus size={9} />
          )}
          <span>{following ? "Following" : "Follow"}</span>
        </button>
      )}
    </div>
  );
}

export default function RightInsightsPanel({
  currentUser,
  suggestions,
  onFollowChange,
}: RightInsightsPanelProps) {
  return (
    <div className="space-y-4">
      {/* DevTrack Pulse */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            DevTrack Pulse
          </h2>
        </div>
        <div className="divide-y divide-border/30">
          {DEVTRACK_PULSE.map((item, i) => (
            <div
              key={item.tag}
              className="flex items-center justify-between px-4 py-2 hover:bg-surface-secondary/50 transition-colors"
            >
              <div>
                <p className="text-[10px] text-text-secondary">#{i + 1} · Trending</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Hash size={11} className="text-accent flex-shrink-0" />
                  <p className="text-[12px] font-semibold text-text-primary">{item.label}</p>
                </div>
              </div>
              {item.count !== undefined && (
                <span className="text-[10px] text-text-secondary tabular-nums">
                  {item.count.toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Who to follow */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-border/50">
            <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Devs to Follow
            </h2>
          </div>
          <div className="px-1 py-1">
            {suggestions.map((dev) => (
              <SuggestionCard
                key={dev.uid}
                dev={dev}
                currentUser={currentUser}
                onFollowChange={onFollowChange}
              />
            ))}
          </div>
          <div className="px-4 py-2 border-t border-border/30">
            <Link
              href="/feed?panel=network"
              className="text-[11px] text-accent hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              See all suggestions →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
