"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Network, Plus, Bell, User } from "lucide-react";

interface MobileBottomNavProps {
  onMeClick: () => void;
  onPostClick?: () => void;
}

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/feed", panel: null },
  { label: "Network", icon: Network, href: "/feed?panel=network", panel: "network" },
  { label: "Post", icon: Plus, href: null, panel: null, isAction: true },
  { label: "Alerts", icon: Bell, href: "/feed?panel=notifications", panel: "notifications" },
  { label: "Me", icon: User, href: null, panel: null, isMe: true },
] as const;

export default function MobileBottomNav({
  onMeClick,
  onPostClick,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPanel = searchParams.get("panel");
  const meButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string | null, panel: string | null): boolean => {
    if (href === null) return false;
    const hrefPath = href.split("?")[0];
    const hrefPanel = new URLSearchParams(href.split("?")[1] ?? "").get("panel");

    if (pathname !== hrefPath) return false;
    // "Home" is only active when there's no panel or when no special panel is active
    if (hrefPanel === null) {
      return !currentPanel || currentPanel === "everyone";
    }
    return currentPanel === hrefPanel;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-14 px-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.panel ?? null);
          const Icon = item.icon;

          // "Post" action button
          if ("isAction" in item && item.isAction) {
            return (
              <button
                key={item.label}
                onClick={onPostClick}
                className="flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-full bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent/90 active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                aria-label="Create new post"
              >
                <Icon size={20} strokeWidth={2.5} />
              </button>
            );
          }

          // "Me" profile tab
          if ("isMe" in item && item.isMe) {
            return (
              <button
                key={item.label}
                ref={meButtonRef}
                onClick={onMeClick}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                  active
                    ? "text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                aria-label="Your profile"
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className={`text-[9px] font-semibold tracking-wide ${active ? "text-accent" : ""}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          // Regular nav link
          return (
            <Link
              key={item.label}
              href={item.href!}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                active
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-[9px] font-semibold tracking-wide ${active ? "text-accent" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
