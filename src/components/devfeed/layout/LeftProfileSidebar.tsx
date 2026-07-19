"use client";

import React from "react";
import Link from "next/link";
import {
  Bookmark,
  Users,
  Settings,
  TrendingUp,
  GitBranch,
  Flame,
} from "lucide-react";
import { DevTrackUser, UserProfileDoc } from "@/types/user";

interface LeftProfileSidebarProps {
  currentUser: DevTrackUser | null;
  profileDoc: UserProfileDoc | null;
  loading?: boolean;
}

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-surface-secondary rounded ${className}`} />
  );
}

export default function LeftProfileSidebar({
  currentUser,
  profileDoc,
  loading = false,
}: LeftProfileSidebarProps) {
  if (!currentUser) {
    return (
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-accent/25 via-accent/10 to-transparent" />
        <div className="px-4 pb-4 -mt-8">
          <div className="h-16 w-16 rounded-full bg-surface-secondary border-2 border-surface flex items-center justify-center text-text-secondary text-2xl font-bold mb-3">
            ?
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Sign in to see your profile and personalized feed.
          </p>
        </div>
      </div>
    );
  }

  const avatarUrl = profileDoc?.avatarUrl ?? currentUser.photoURL;
  const displayName = profileDoc?.displayName ?? currentUser.displayName ?? currentUser.username;
  const bio = profileDoc?.bio;
  const location = profileDoc?.location;
  const followers = profileDoc?.devFeedFollowersCount ?? 0;
  const following = profileDoc?.devFeedFollowingCount ?? 0;
  const profileViews = profileDoc?.profileViewsCount ?? 0;
  const postImpressions = profileDoc?.postImpressionsCount ?? 0;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Cover gradient strip */}
      <div className="h-16 bg-gradient-to-r from-accent/25 via-accent/10 to-transparent" />

      {/* Avatar + identity */}
      <div className="px-4 pb-4 -mt-8">
        {loading ? (
          <>
            <Shimmer className="h-16 w-16 rounded-full mb-3" />
            <Shimmer className="h-4 w-3/4 mb-1.5" />
            <Shimmer className="h-3 w-1/2 mb-3" />
          </>
        ) : (
          <>
            <Link href={`/u/${currentUser.username}`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName ?? ""}
                  className="h-16 w-16 rounded-full border-2 border-surface object-cover mb-3 hover:ring-2 hover:ring-accent transition-all"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-surface-secondary border-2 border-surface flex items-center justify-center text-accent font-bold text-xl mb-3">
                  {(displayName ?? "?")[0].toUpperCase()}
                </div>
              )}
            </Link>

            <Link
              href={`/u/${currentUser.username}`}
              className="block font-semibold text-sm text-text-primary hover:text-accent transition-colors leading-tight mb-0.5"
            >
              {displayName}
            </Link>
            <p className="text-[11px] text-text-secondary leading-tight mb-0.5">
              @{currentUser.username}
            </p>
            {bio && (
              <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed mt-1">
                {bio}
              </p>
            )}
            {location && (
              <p className="text-[10px] text-text-secondary mt-1">📍 {location}</p>
            )}
          </>
        )}

        {/* Follower stats */}
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-text-secondary">Followers</p>
            {loading ? (
              <Shimmer className="h-4 w-10 mt-0.5" />
            ) : (
              <p className="text-xs font-bold text-accent">{followers.toLocaleString()}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-text-secondary">Following</p>
            {loading ? (
              <Shimmer className="h-4 w-10 mt-0.5" />
            ) : (
              <p className="text-xs font-bold text-text-primary">{following.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Profile analytics */}
        <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Analytics · 7 days
          </p>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <TrendingUp size={11} className="text-accent" />
              Profile views
            </span>
            {loading ? (
              <Shimmer className="h-3 w-8" />
            ) : (
              <span className="text-[11px] font-semibold text-text-primary">{profileViews.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <Flame size={11} className="text-warning" />
              Post impressions
            </span>
            {loading ? (
              <Shimmer className="h-3 w-8" />
            ) : (
              <span className="text-[11px] font-semibold text-text-primary">{postImpressions.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="border-t border-border">
        {[
          {
            icon: <Bookmark size={13} />,
            label: "Saved Posts",
            href: "/feed?panel=saved",
          },
          {
            icon: <Users size={13} />,
            label: "My Network",
            href: "/feed?panel=network",
          },
          {
            icon: <GitBranch size={13} />,
            label: "Communities",
            href: "/feed?panel=communities",
          },
          {
            icon: <Settings size={13} />,
            label: "Settings",
            href: "/settings",
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <span className="text-text-secondary">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
