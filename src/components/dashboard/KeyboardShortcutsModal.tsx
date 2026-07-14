"use client";

import { motion } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcutsList = [
    { keys: ["Ctrl", "B"], label: "Toggle Sidebar Collapse" },
    { keys: ["Ctrl", "K"], label: "Global Command Palette" },
    { keys: ["Ctrl", "Shift", "N"], label: "Create New Note (Workspace)" },
    { keys: ["Ctrl", "Shift", "R"], label: "Repository Search (Workspace)" },
    { keys: ["Ctrl", "/"], label: "Open Keyboard Shortcuts Help" },
    { keys: ["G", "O"], label: "Jump to Overview Tab" },
    { keys: ["G", "D"], label: "Jump to Developer Workspace" },
    { keys: ["G", "R"], label: "Jump to Repositories Tab" },
    { keys: ["G", "C"], label: "Jump to Contributions Tab" },
    { keys: ["G", "L"], label: "Jump to Languages Tab" },
    { keys: ["G", "A"], label: "Jump to AI Insights Tab" },
    { keys: ["G", "W"], label: "Jump to GitHub Wrapped" },
    { keys: ["?"], label: "Open Keyboard Shortcuts Help" },
    { keys: ["Esc"], label: "Close active modal or dialog" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-xl border border-border bg-[#161B22] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-[#0D1117]">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-accent" />
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary rounded-lg p-1 hover:bg-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {shortcutsList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-surface/40 border border-border/60"
            >
              <span className="text-xs text-text-secondary font-medium">
                {item.label}
              </span>
              <div className="flex items-center gap-1">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-0.5 text-[10px] font-mono font-bold bg-surface-secondary border border-border rounded text-text-primary shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-[#0D1117] text-center text-[10px] font-mono text-text-secondary">
          Press <kbd className="px-1 bg-surface border border-border rounded">Esc</kbd> anytime to exit
        </div>
      </motion.div>
    </div>
  );
}
