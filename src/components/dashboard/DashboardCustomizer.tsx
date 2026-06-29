"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Eye, EyeOff, Pin, RotateCcw, X, Check } from "lucide-react";

export interface WidgetConfig {
  id: string;
  name: string;
  visible: boolean;
  pinned: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "command_center", name: "Profile Command Center", visible: true, pinned: true },
  { id: "achievements", name: "Developer Achievements", visible: true, pinned: false },
  { id: "milestones", name: "Developer Milestones Roadmap", visible: true, pinned: false },
  { id: "activity_timeline", name: "Recent Activity Feed", visible: true, pinned: false },
  { id: "heatmap", name: "Contribution Matrix Heatmap", visible: true, pinned: false },
  { id: "languages", name: "Top Tech Ecosystem", visible: true, pinned: false },
];

interface DashboardCustomizerProps {
  onLayoutChange: (configs: WidgetConfig[]) => void;
}

export default function DashboardCustomizer({ onLayoutChange }: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  // Load saved layout on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devtrack_widget_layout");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWidgets(parsed);
          onLayoutChange(parsed);
        } catch (e) {
          console.error("Failed to parse saved layout", e);
        }
      } else {
        onLayoutChange(DEFAULT_WIDGETS);
      }
    }
  }, []);

  const updateWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    onLayoutChange(newWidgets);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_widget_layout", JSON.stringify(newWidgets));
    }
  };

  const toggleVisibility = (id: string) => {
    const next = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    updateWidgets(next);
  };

  const togglePin = (id: string) => {
    const next = widgets.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w));
    updateWidgets(next);
  };

  const resetLayout = () => {
    updateWidgets(DEFAULT_WIDGETS);
  };

  return (
    <div className="relative inline-block text-left mb-4">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface/60 hover:bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary transition-all shadow-sm"
      >
        <SlidersHorizontal size={14} className="text-accent" />
        <span>Customize Layout</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 mt-2 w-72 rounded-xl border border-border bg-[#161B22]/95 backdrop-blur-md shadow-2xl p-4 z-30 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-xs font-bold font-space-grotesk text-text-primary">
                Dashboard Widgets
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface/40 border border-border/60 text-xs"
                >
                  <span className={`truncate ${w.visible ? "text-text-primary font-medium" : "text-text-secondary line-through opacity-60"}`}>
                    {w.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePin(w.id)}
                      className={`p-1 rounded hover:bg-surface transition-colors ${w.pinned ? "text-amber-400" : "text-text-secondary"}`}
                      title={w.pinned ? "Unpin Widget" : "Pin Widget to Top"}
                    >
                      <Pin size={13} />
                    </button>
                    <button
                      onClick={() => toggleVisibility(w.id)}
                      className={`p-1 rounded hover:bg-surface transition-colors ${w.visible ? "text-emerald-400" : "text-text-secondary"}`}
                      title={w.visible ? "Hide Widget" : "Show Widget"}
                    >
                      {w.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <button
                onClick={resetLayout}
                className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-danger transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset Layout</span>
              </button>

              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <Check size={11} /> Auto-saved
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
