"use client";

import React, { useState, useEffect } from "react";
import { subscribeToAuthChanges, logOutUser } from "@/lib/firebase";
import { DevTrackUser } from "@/types/user";
import Navbar from "@/components/layout/Navbar";
import FeedHome from "@/components/devfeed/FeedHome";
import { ToastProvider } from "@/components/devfeed/useToast";

function FeedPageInner() {
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await logOutUser();
    setCurrentUser(null);
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
          <div className="space-y-4 animate-pulse">
            <div className="h-36 rounded-xl bg-surface border border-border" />
            <div className="h-24 rounded-xl bg-surface border border-border" />
            <div className="h-24 rounded-xl bg-surface border border-border" />
          </div>
        ) : (
          <FeedHome currentUser={currentUser} onLogout={handleLogout} />
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
