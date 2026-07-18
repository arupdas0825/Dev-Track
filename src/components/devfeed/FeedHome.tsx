"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rss, LogIn, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DevTrackUser } from "@/types/user";
import { DevFeedPost } from "@/types/devfeed";
import PostComposer from "./PostComposer";
import FeedList from "./FeedList";
import { useAuthModal } from "@/components/auth/AuthModalContext";

interface FeedHomeProps {
  currentUser: DevTrackUser | null;
  onLogout?: () => void;
}

export default function FeedHome({ currentUser, onLogout }: FeedHomeProps) {
  const { openAuthModal } = useAuthModal();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [latestPost, setLatestPost] = useState<DevFeedPost | null>(null);
  const [activeTab, setActiveTab] = useState<"everyone" | "following">("everyone");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "following") {
      setActiveTab("following");
    } else {
      setActiveTab("everyone");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "everyone" | "following") => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    if (tab === "following") {
      newParams.set("tab", "following");
    } else {
      newParams.delete("tab");
    }
    const queryStr = newParams.toString() ? `?${newParams.toString()}` : "";
    router.push(`${pathname || "/"}${queryStr}`, { scroll: false });
  };

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
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20 cursor-pointer"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 max-w-2xl mx-auto w-full pb-12"
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

        {/* Everyone | Following Switcher */}
        <div className="flex rounded-lg overflow-hidden border border-border bg-surface/50 p-0.5">
          <button
            type="button"
            onClick={() => handleTabChange("everyone")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
}
