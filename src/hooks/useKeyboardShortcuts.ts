"use client";

import { useEffect, useState } from "react";

export interface KeyboardShortcutsOptions {
  onOpenCommandPalette: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenShortcutsHelp: () => void;
  onCloseDialogs: () => void;
  onNewNote?: () => void;
  onRepoSearch?: () => void;
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onSelectTab,
  onOpenShortcutsHelp,
  onCloseDialogs,
  onNewNote,
  onRepoSearch,
}: KeyboardShortcutsOptions) {
  const [pendingGKey, setPendingGKey] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events inside input, textarea, or contentEditable elements
      // UNLESS the user is pressing Escape (to close dialogs)
      const target = e.target as HTMLElement;
      const isInput = 
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput) {
        if (e.key === "Escape") {
          onCloseDialogs();
        }
        return;
      }

      // 1. Esc -> Close Dialogs
      if (e.key === "Escape") {
        onCloseDialogs();
        setPendingGKey(false);
        return;
      }

      // 2. Ctrl+K / Cmd+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommandPalette();
        setPendingGKey(false);
        return;
      }

      // 3. Ctrl+Shift+N -> New Note in Workspace
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (onNewNote) onNewNote();
        setPendingGKey(false);
        return;
      }

      // 4. Ctrl+Shift+R -> Repository Search in Workspace/Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (onRepoSearch) onRepoSearch();
        setPendingGKey(false);
        return;
      }

      // 5. Ctrl+/ or ? -> Keyboard Shortcuts Help
      if (
        (e.key === "?" && !e.ctrlKey && !e.metaKey) || 
        ((e.ctrlKey || e.metaKey) && e.key === "/")
      ) {
        e.preventDefault();
        onOpenShortcutsHelp();
        setPendingGKey(false);
        return;
      }

      // 6. Two-key chord navigation (G then O/D/R/C/L/A/W/S/P/H/T)
      if (pendingGKey) {
        const key = e.key.toLowerCase();
        setPendingGKey(false);
        if (key === "o") {
          e.preventDefault();
          onSelectTab("overview");
        } else if (key === "d") {
          e.preventDefault();
          onSelectTab("workspace");
        } else if (key === "r") {
          e.preventDefault();
          onSelectTab("repos");
        } else if (key === "c") {
          e.preventDefault();
          onSelectTab("contrib");
        } else if (key === "p") {
          e.preventDefault();
          onSelectTab("calendar");
        } else if (key === "h") {
          e.preventDefault();
          onSelectTab("health");
        } else if (key === "t") {
          e.preventDefault();
          onSelectTab("growth");
        } else if (key === "l") {
          e.preventDefault();
          onSelectTab("lang");
        } else if (key === "a") {
          e.preventDefault();
          onSelectTab("ai");
        } else if (key === "w") {
          e.preventDefault();
          onSelectTab("wrapped");
        } else if (key === "s") {
          e.preventDefault();
          onSelectTab("score");
        }
        return;
      }

      // Check if user pressed 'g' (or 'G') without modifiers
      if (e.key.toLowerCase() === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setPendingGKey(true);
        // Timeout after 1.5 seconds if second key isn't pressed
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setPendingGKey(false);
        }, 1500);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [pendingGKey, onOpenCommandPalette, onSelectTab, onOpenShortcutsHelp, onCloseDialogs, onNewNote, onRepoSearch]);

  return { pendingGKey };
}
