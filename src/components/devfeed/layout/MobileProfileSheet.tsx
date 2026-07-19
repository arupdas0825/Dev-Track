"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bookmark,
  Users,
  GitBranch,
  Settings,
  LogOut,
  TrendingUp,
  Flame,
  ExternalLink,
} from "lucide-react";
import { DevTrackUser, UserProfileDoc } from "@/types/user";

interface MobileProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: DevTrackUser | null;
  profileDoc: UserProfileDoc | null;
  onLogout?: () => void;
  /** Ref to the "Me" button so focus can be restored on close */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const MENU_ITEMS = [
  { icon: Bookmark, label: "Saved Posts", href: "/feed?panel=saved" },
  { icon: Users, label: "My Network", href: "/feed?panel=network" },
  { icon: GitBranch, label: "Communities", href: "/feed?panel=communities" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: ExternalLink, label: "View Profile", href: null }, // resolved dynamically
];

export default function MobileProfileSheet({
  isOpen,
  onClose,
  currentUser,
  profileDoc,
  onLogout,
  triggerRef,
}: MobileProfileSheetProps) {
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Trap focus inside the sheet while open
  useEffect(() => {
    if (!isOpen) return;
    const el = sheetRef.current;
    if (!el) return;
    // Focus the close button on open
    firstFocusRef.current?.focus();

    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Restore focus to trigger button on close
  useEffect(() => {
    if (!isOpen) {
      triggerRef?.current?.focus();
    }
  }, [isOpen, triggerRef]);

  const avatarUrl = profileDoc?.avatarUrl ?? currentUser?.photoURL;
  const displayName =
    profileDoc?.displayName ?? currentUser?.displayName ?? currentUser?.username ?? "";
  const bio = profileDoc?.bio;
  const profileViews = profileDoc?.profileViewsCount ?? 0;
  const postImpressions = profileDoc?.postImpressionsCount ?? 0;
  const followers = profileDoc?.devFeedFollowersCount ?? 0;
  const following = profileDoc?.devFeedFollowingCount ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Your profile"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260, duration: 0.25 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-surface border-l border-border flex flex-col md:hidden overflow-y-auto"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Profile
              </span>
              <button
                ref={firstFocusRef}
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                aria-label="Close profile sheet"
              >
                <X size={16} />
              </button>
            </div>

            {currentUser ? (
              <>
                {/* Cover + avatar */}
                <div>
                  <div className="h-14 bg-gradient-to-r from-accent/25 via-accent/10 to-transparent" />
                  <div className="px-4 -mt-7 pb-3">
                    <Link href={`/u/${currentUser.username}`} onClick={onClose}>
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-14 w-14 rounded-full border-2 border-surface object-cover mb-2"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-surface-secondary border-2 border-surface flex items-center justify-center text-accent font-bold text-xl mb-2">
                          {(displayName)[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </Link>
                    <p className="text-sm font-bold text-text-primary leading-tight">{displayName}</p>
                    <p className="text-[11px] text-text-secondary">@{currentUser.username}</p>
                    {bio && (
                      <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mx-4 mb-3 p-3 rounded-xl bg-surface-secondary border border-border grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-text-secondary">Followers</p>
                    <p className="text-sm font-bold text-accent">{followers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary">Following</p>
                    <p className="text-sm font-bold text-text-primary">{following.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary flex items-center gap-1">
                      <TrendingUp size={9} className="text-accent" /> Profile views
                    </p>
                    <p className="text-sm font-bold text-text-primary">{profileViews.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary flex items-center gap-1">
                      <Flame size={9} className="text-warning" /> Impressions
                    </p>
                    <p className="text-sm font-bold text-text-primary">{postImpressions.toLocaleString()}</p>
                  </div>
                </div>

                {/* Menu links */}
                <div className="flex-1 border-t border-border">
                  <Link
                    href={`/u/${currentUser.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                  >
                    <ExternalLink size={15} />
                    View Profile
                  </Link>
                  {MENU_ITEMS.slice(0, 4).map((item) => (
                    <Link
                      key={item.label}
                      href={item.href!}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                    >
                      <item.icon size={15} />
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Sign out */}
                <div className="border-t border-border px-4 py-3">
                  <button
                    onClick={() => { onLogout?.(); onClose(); }}
                    className="flex items-center gap-2.5 w-full text-sm text-diff-remove hover:text-diff-remove/80 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none py-1"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 py-12">
                <p className="text-sm text-text-secondary">Sign in to see your profile.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
