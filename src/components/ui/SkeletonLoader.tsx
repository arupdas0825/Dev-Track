"use client";

import React from "react";

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/3 bg-surface-secondary rounded"></div>
        <div className="h-6 w-6 bg-surface-secondary rounded-full"></div>
      </div>
      <div className="h-8 w-1/2 bg-surface-secondary rounded"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-surface-secondary rounded"></div>
        <div className="h-3 w-4/5 bg-surface-secondary rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface/30">
          <div className="h-8 w-8 rounded-full bg-surface-secondary flex-shrink-0"></div>
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 bg-surface-secondary rounded"></div>
            <div className="h-2.5 w-1/2 bg-surface-secondary rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
