"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Sparkles, Star, UserPlus, Flame, RefreshCw, Key } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: "star" | "follower" | "streak" | "sync" | "token" | "summary";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Contribution Streak Milestone!",
    message: "You've reached a 7-day contribution streak on GitHub! 🔥",
    timestamp: "10m ago",
    unread: true,
    type: "streak",
  },
  {
    id: "2",
    title: "GitHub Sync Completed",
    message: "Repositories and contributions synced successfully.",
    timestamp: "1h ago",
    unread: true,
    type: "sync",
  },
  {
    id: "3",
    title: "New Star Earned",
    message: "Alex starred your repository dev-track.",
    timestamp: "3h ago",
    unread: true,
    type: "star",
  },
  {
    id: "4",
    title: "New Follower",
    message: "sarah_codes started following your profile.",
    timestamp: "5h ago",
    unread: false,
    type: "follower",
  },
  {
    id: "5",
    title: "Weekly Summary Ready",
    message: "Your AI weekly developer report for this week is ready.",
    timestamp: "1d ago",
    unread: false,
    type: "summary",
  },
  {
    id: "6",
    title: "Personal Access Token Active",
    message: "GitHub authentication token is verified and active.",
    timestamp: "2d ago",
    unread: false,
    type: "token",
  },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "star":
        return <Star className="h-4 w-4 text-amber-400" />;
      case "follower":
        return <UserPlus className="h-4 w-4 text-accent" />;
      case "streak":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "sync":
        return <RefreshCw className="h-4 w-4 text-emerald-400" />;
      case "token":
        return <Key className="h-4 w-4 text-purple-400" />;
      case "summary":
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-[#161B22]/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#0D1117]/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-space-grotesk text-text-primary">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-accent/20 text-accent rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-accent transition-colors"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40 scrollbar-thin">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleRead(item.id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      item.unread
                        ? "bg-accent/5 hover:bg-accent/10"
                        : "hover:bg-surface-secondary/50"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-surface border border-border flex-shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs truncate ${item.unread ? "font-bold text-text-primary" : "font-medium text-text-secondary"}`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-text-secondary font-mono flex-shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
                        {item.message}
                      </p>
                    </div>
                    {item.unread && (
                      <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-1.5"></span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-text-secondary">
                  No notifications yet.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[#0D1117] border-t border-border text-center">
              <span className="text-[10px] text-text-secondary font-mono">
                Real-time GitHub Webhooks active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
