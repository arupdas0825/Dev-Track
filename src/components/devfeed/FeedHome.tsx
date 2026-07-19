"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rss,
  LogIn,
  Sparkles,
  Users,
  Bookmark,
  Network,
  GitBranch,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DevTrackUser, UserProfileDoc } from "@/types/user";
import { DevFeedPost, DevFeedComment } from "@/types/devfeed";
import { SuggestedDeveloper } from "@/services/devfeedService";
import PostComposer from "./PostComposer";
import FeedList from "./FeedList";
import FeedShell from "./layout/FeedShell";
import LeftProfileSidebar from "./layout/LeftProfileSidebar";
import RightInsightsPanel from "./layout/RightInsightsPanel";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonFeed } from "@/components/ui/SkeletonLoader";
import {
  getSuggestedDevelopers,
  getLikedPostIds,
  getPostsByIds,
  getFollowingUsers,
  getCommentsByAuthorId,
} from "@/services/devfeedService";
import PostCard from "./PostCard";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface FeedHomeProps {
  currentUser: DevTrackUser | null;
  onLogout?: () => void;
}

// ─── Saved panel ──────────────────────────────────────────────────────────────

function SavedPanel({ currentUser }: { currentUser: DevTrackUser }) {
  const [posts, setPosts] = useState<DevFeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ids = await getLikedPostIds(currentUser.uid);
        const fetched = await getPostsByIds(ids);
        setPosts(fetched);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser.uid]);

  if (loading) return <div className="py-4"><SkeletonFeed /></div>;
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark size={22} />}
        title="No saved posts"
        description="Posts you like will appear here as your saved bookmarks."
      />
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUser={currentUser} />
      ))}
    </div>
  );
}

// ─── Network panel ────────────────────────────────────────────────────────────

function NetworkPanel({
  currentUser,
  suggestions,
}: {
  currentUser: DevTrackUser;
  suggestions: SuggestedDeveloper[];
}) {
  const [following, setFollowing] = useState<SuggestedDeveloper[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingFollowing(true);
      try {
        const users = await getFollowingUsers(currentUser.uid);
        setFollowing(users);
      } catch {
        setFollowing([]);
      } finally {
        setLoadingFollowing(false);
      }
    })();
  }, [currentUser.uid]);

  return (
    <div className="space-y-6">
      {/* Who to follow */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Developers to Follow
        </h2>
        {suggestions.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="All caught up!"
            description="You're following everyone suggested for now. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((dev) => (
              <Link
                key={dev.uid}
                href={`/u/${dev.username}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary transition-all"
              >
                {dev.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dev.avatarUrl}
                    alt={dev.displayName ?? dev.username}
                    className="h-10 w-10 rounded-full object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-surface-secondary flex items-center justify-center text-accent font-bold flex-shrink-0">
                    {(dev.displayName ?? dev.username)[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {dev.displayName ?? dev.username}
                  </p>
                  <p className="text-[11px] text-text-secondary">@{dev.username}</p>
                  {dev.bio && (
                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">{dev.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Already following */}
      <section>
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          People You Follow
        </h2>
        {loadingFollowing ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-surface border border-border" />
            ))}
          </div>
        ) : following.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="Not following anyone yet"
            description="Follow developers to see their posts in your feed."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {following.map((dev) => (
              <Link
                key={dev.uid}
                href={`/u/${dev.username}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary transition-all"
              >
                {dev.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dev.avatarUrl}
                    alt={dev.displayName ?? dev.username}
                    className="h-10 w-10 rounded-full object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-surface-secondary flex items-center justify-center text-accent font-bold flex-shrink-0">
                    {(dev.displayName ?? dev.username)[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {dev.displayName ?? dev.username}
                  </p>
                  <p className="text-[11px] text-text-secondary">@{dev.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Main FeedHome ─────────────────────────────────────────────────────────────

export default function FeedHome({ currentUser, onLogout }: FeedHomeProps) {
  const { openAuthModal } = useAuthModal();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [latestPost, setLatestPost] = useState<DevFeedPost | null>(null);
  const [activeTab, setActiveTab] = useState<"everyone" | "following">("everyone");
  const [profileDoc, setProfileDoc] = useState<UserProfileDoc | null>(null);
  const [profileDocLoading, setProfileDocLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedDeveloper[]>([]);

  const panel = searchParams.get("panel");

  // Load profile doc + suggestions when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    setProfileDocLoading(true);
    (async () => {
      try {
        if (db) {
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          if (snap.exists()) setProfileDoc(snap.data() as UserProfileDoc);
        }
      } catch {
        /* non-critical */
      } finally {
        setProfileDocLoading(false);
      }
    })();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    getSuggestedDevelopers(currentUser.uid, 5)
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [currentUser]);

  // Tab from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    setActiveTab(tabParam === "following" ? "following" : "everyone");
  }, [searchParams]);

  const handleTabChange = (tab: "everyone" | "following") => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("panel");
    if (tab === "following") newParams.set("tab", "following");
    else newParams.delete("tab");
    const queryStr = newParams.toString() ? `?${newParams.toString()}` : "";
    router.push(`${pathname || "/"}${queryStr}`, { scroll: false });
  };

  // ─── Signed-out view ───────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center gap-5 max-w-lg mx-auto"
      >
        <div className="h-16 w-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent">
          <Rss size={28} />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary mb-1">
            Welcome to DevFeed
          </h2>
          <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
            Share milestones, code snippets, and discoveries. Follow other
            developers across DevTrack to see their updates here.
          </p>
        </div>
        <button
          onClick={() => openAuthModal({})}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <LogIn size={14} />
          <span>Sign in with GitHub</span>
        </button>
        {pathname !== "/" && (
          <Link
            href="/"
            className="text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back to home
          </Link>
        )}
      </motion.div>
    );
  }

  // ─── Panel content (saved / network / communities) ─────────────────────────
  const renderPanelContent = () => {
    if (panel === "saved") {
      return (
        <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <Bookmark size={15} className="text-accent" />
            <h1 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
              Saved Posts
            </h1>
          </div>
          <SavedPanel currentUser={currentUser} />
        </motion.div>
      );
    }

    if (panel === "network") {
      return (
        <motion.div key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <Network size={15} className="text-accent" />
            <h1 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
              My Network
            </h1>
          </div>
          <NetworkPanel currentUser={currentUser} suggestions={suggestions} />
        </motion.div>
      );
    }

    if (panel === "communities") {
      return (
        <motion.div key="communities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <GitBranch size={15} className="text-accent" />
            <h1 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
              Communities
            </h1>
          </div>
          <EmptyState
            icon={<GitBranch size={22} />}
            title="Communities — Coming Soon"
            description="Topic-based developer communities are in the works. Stay tuned!"
          />
        </motion.div>
      );
    }

    // Default: main feed
    return (
      <motion.div
        key="feed"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4 w-full"
      >
        {/* Page header with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Rss size={16} className="text-accent" />
            <h1 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
              DevFeed
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-semibold">
              LIVE
            </span>
          </div>

          <div className="flex rounded-lg overflow-hidden border border-border bg-surface/50 p-0.5">
            <button
              type="button"
              onClick={() => handleTabChange("everyone")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                activeTab === "everyone"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sparkles size={11} />
              <span>Everyone</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("following")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                activeTab === "following"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Users size={11} />
              <span>Following</span>
            </button>
          </div>
        </div>

        <PostComposer
          currentUser={currentUser}
          onPostCreated={(post) => setLatestPost(post)}
        />

        <FeedList
          currentUser={currentUser}
          newPost={latestPost}
          mode={activeTab}
        />
      </motion.div>
    );
  };

  // ─── Signed-in view — 3-column layout ─────────────────────────────────────
  return (
    <FeedShell
      left={
        <LeftProfileSidebar
          currentUser={currentUser}
          profileDoc={profileDoc}
          loading={profileDocLoading}
        />
      }
      right={
        <RightInsightsPanel
          currentUser={currentUser}
          suggestions={suggestions}
          onFollowChange={() => {
            // Refresh suggestions after follow
            getSuggestedDevelopers(currentUser.uid, 5).then(setSuggestions);
          }}
        />
      }
    >
      <AnimatePresence mode="wait">
        {renderPanelContent()}
      </AnimatePresence>
    </FeedShell>
  );
}
