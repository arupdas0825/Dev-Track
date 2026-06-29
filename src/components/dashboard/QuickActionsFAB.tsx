"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  RefreshCw, 
  Bot, 
  Gift, 
  FileDown, 
  ExternalLink, 
  Copy, 
  Share2, 
  Keyboard, 
  Check, 
  X 
} from "lucide-react";

interface QuickActionsFABProps {
  githubUsername: string;
  onSelectTab: (tabId: string) => void;
  onRefreshData?: () => void;
  onOpenExportModal?: () => void;
  onOpenShortcutsModal?: () => void;
}

export default function QuickActionsFAB({
  githubUsername,
  onSelectTab,
  onRefreshData,
  onOpenExportModal,
  onOpenShortcutsModal,
}: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/dashboard?user=${githubUsername}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareDashboard = () => {
    if (navigator.share) {
      navigator.share({
        title: `${githubUsername}'s DevTrack Profile`,
        text: `Check out ${githubUsername}'s developer score and activity on DevTrack!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyProfileLink();
    }
  };

  const actions = [
    {
      label: "Refresh Data",
      icon: <RefreshCw size={15} />,
      onClick: () => {
        if (onRefreshData) onRefreshData();
        setIsOpen(false);
      },
    },
    {
      label: "Generate AI Insight",
      icon: <Bot size={15} />,
      onClick: () => {
        onSelectTab("ai");
        setIsOpen(false);
      },
    },
    {
      label: "Download Wrapped",
      icon: <Gift size={15} />,
      onClick: () => {
        onSelectTab("wrapped");
        setIsOpen(false);
      },
    },
    {
      label: "Export PDF / Data",
      icon: <FileDown size={15} />,
      onClick: () => {
        if (onOpenExportModal) onOpenExportModal();
        setIsOpen(false);
      },
    },
    {
      label: "Open GitHub Profile",
      icon: <ExternalLink size={15} />,
      onClick: () => {
        window.open(`https://github.com/${githubUsername}`, "_blank");
        setIsOpen(false);
      },
    },
    {
      label: copiedLink ? "Link Copied!" : "Copy Profile Link",
      icon: copiedLink ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />,
      onClick: handleCopyProfileLink,
    },
    {
      label: "Share Dashboard",
      icon: <Share2 size={15} />,
      onClick: handleShareDashboard,
    },
    {
      label: "Keyboard Shortcuts",
      icon: <Keyboard size={15} />,
      onClick: () => {
        if (onOpenShortcutsModal) onOpenShortcutsModal();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" ref={fabRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 right-0 w-60 rounded-xl border border-border bg-[#161B22]/95 backdrop-blur-md shadow-2xl p-2 space-y-1 overflow-hidden"
          >
            <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider border-b border-border/60">
              Quick Actions
            </div>
            {actions.map((act, idx) => (
              <button
                key={idx}
                onClick={act.onClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all text-left group"
              >
                <span className="text-text-secondary group-hover:text-accent transition-colors">
                  {act.icon}
                </span>
                <span className="font-medium truncate">{act.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-12 w-12 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all focus:outline-none hover:scale-105 active:scale-95"
        title="Quick Actions Menu"
      >
        {isOpen ? <X size={22} /> : <Zap size={22} className="fill-current" />}
      </button>
    </div>
  );
}
