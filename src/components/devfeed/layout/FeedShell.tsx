"use client";

import React from "react";

interface FeedShellProps {
  left: React.ReactNode;
  right: React.ReactNode;
  children: React.ReactNode;
}

/**
 * FeedShell — 3-column responsive LinkedIn-style layout container.
 *
 * Breakpoints:
 *   < 768px  : single column (left+right hidden), pb-24 for bottom nav
 *   768–1023px: center + right rail (left hidden)
 *   ≥ 1024px : all three columns (left 280px | 1fr center | right 300px)
 */
export default function FeedShell({ left, right, children }: FeedShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 md:pb-12">
        <div className="lg:grid lg:grid-cols-[280px_1fr_300px] lg:gap-6 md:grid md:grid-cols-[1fr_300px] md:gap-5">
          {/* Left rail — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">{left}</div>
          </aside>

          {/* Center column */}
          <main className="min-w-0">{children}</main>

          {/* Right rail — tablet and desktop */}
          <aside className="hidden md:block">
            <div className="sticky top-20">{right}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
