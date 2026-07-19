"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { subscribeToAuthChanges, logOutUser } from "@/lib/firebase";
import { DevTrackUser } from "@/types/user";
import { MAINTENANCE_MODE } from "@/lib/featureFlags";
import Navbar from "@/components/layout/Navbar";
import FeedHome from "@/components/devfeed/FeedHome";
import { ToastProvider } from "@/components/devfeed/useToast";
import MobileBottomNav from "@/components/devfeed/layout/MobileBottomNav";
import MobileProfileSheet from "@/components/devfeed/layout/MobileProfileSheet";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserProfileDoc } from "@/types/user";

function FeedPageInner() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileDoc, setProfileDoc] = useState<UserProfileDoc | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const meButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (MAINTENANCE_MODE) {
      router.replace("/");
      return;
    }
    const unsub = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, [router]);

  // Load profile doc for the sheet
  useEffect(() => {
    if (!currentUser || !db) return;
    getDoc(doc(db, "users", currentUser.uid))
      .then((snap) => {
        if (snap.exists()) setProfileDoc(snap.data() as UserProfileDoc);
      })
      .catch(() => {});
  }, [currentUser]);

  if (MAINTENANCE_MODE) return null;

  const handleLogout = async () => {
    await logOutUser();
    setCurrentUser(null);
    setSheetOpen(false);
  };

  // Open post composer via a custom event to PostComposer
  const handlePostClick = () => {
    if (!currentUser) return;
    window.dispatchEvent(new CustomEvent("devfeed:openComposer"));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={handleLogout}
      />

      {authLoading ? (
        <main className="flex-grow mx-auto w-full max-w-2xl px-4 pt-24 pb-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-36 rounded-xl bg-surface border border-border" />
            <div className="h-24 rounded-xl bg-surface border border-border" />
            <div className="h-24 rounded-xl bg-surface border border-border" />
          </div>
        </main>
      ) : (
        <FeedHome currentUser={currentUser} onLogout={handleLogout} />
      )}

      {/* Mobile navigation */}
      <Suspense>
        <MobileBottomNav
          onMeClick={() => setSheetOpen(true)}
          onPostClick={handlePostClick}
        />
      </Suspense>

      <MobileProfileSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        currentUser={currentUser}
        profileDoc={profileDoc}
        onLogout={handleLogout}
        triggerRef={meButtonRef}
      />
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
