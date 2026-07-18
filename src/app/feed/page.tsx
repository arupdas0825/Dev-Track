"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rss, LogIn } from "lucide-react";
import Link from "next/link";
import { subscribeToAuthChanges } from "@/lib/firebase";
import { DevTrackUser } from "@/types/user";
import { DevFeedPost } from "@/types/devfeed";
import Navbar from "@/components/layout/Navbar";
import PostComposer from "@/components/devfeed/PostComposer";
import FeedList from "@/components/devfeed/FeedList";
import { ToastProvider } from "@/components/devfeed/useToast";
import { useAuthModal } from "@/components/auth/AuthModalContext";

function FeedPageInner() {
  const { openAuthModal } = useAuthModal();
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [latestPost, setLatestPost] = useState<DevFeedPost | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    const { logOutUser } = await import("@/lib/firebase");
    await logOutUser();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={handleLogout}
      />

      <main className="flex-grow mx-auto w-full max-w-2xl px-4 pt-24 pb-12">
        {authLoading ? (
          /* Auth resolving skeleton */
          <div className="space-y-4 animate-pulse">
            <div className="h-36 rounded-xl bg-surface border border-border" />
            <div className="h-24 rounded-xl bg-surface border border-border" />
            <div className="h-24 rounded-xl bg-surface border border-border" />
          </div>
        ) : currentUser ? (
          /* Authenticated feed */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Page header */}
            <div className="flex items-center gap-2 mb-4">
              <Rss size={16} className="text-accent" />
              <h1 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
                DevFeed
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-semibold">
                LIVE
              </span>
            </div>

            <PostComposer
              currentUser={currentUser}
              onPostCreated={(post) => setLatestPost(post)}
            />

            <FeedList currentUser={currentUser} newPost={latestPost} />
          </motion.div>
        ) : (
          /* Unauthenticated prompt */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center gap-5"
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
                developers to see their posts here.
              </p>
            </div>
            <button
              onClick={() =>
                openAuthModal({ onSuccess: (user) => setCurrentUser(user) })
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20 cursor-pointer"
            >
              <LogIn size={14} />
              <span>Sign in with GitHub</span>
            </button>
            <Link
              href="/"
              className="text-[11px] text-text-secondary hover:text-text-primary transition-colors"
            >
              ← Back to home
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function FeedPage() {
  return (
    <ToastProvider>
      <FeedPageInner />
    </ToastProvider>
  );
}
