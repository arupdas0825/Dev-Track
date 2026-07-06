"use client";

import { useState, useEffect, useRef } from "react";
import { UserDashboardData, GitHubRepository } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Plus,
  Trash2,
  Pin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  Calendar as CalendarIcon,
  Code,
  FileText,
  FileCode,
  Link as LinkIcon,
  Globe,
  Share2,
  Clipboard,
  Check,
  Search,
  BookOpen,
  PlusCircle,
  Flame,
  Clock,
  Layers,
  ChevronDown
} from "lucide-react";

interface DeveloperWorkspaceTabProps {
  data: UserDashboardData;
  githubToken: string;
  isFocusMode: boolean;
  setIsFocusMode: (mode: boolean) => void;
  registerNewNoteCallback?: (callback: () => void) => void;
  registerRepoSearchCallback?: (callback: () => void) => void;
}

interface WorkspaceNote {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: number;
}

interface Goal {
  text: string;
  completed: boolean;
  updatedAt: number;
}

export default function DeveloperWorkspaceTab({
  data,
  githubToken,
  isFocusMode,
  setIsFocusMode,
  registerNewNoteCallback,
  registerRepoSearchCallback
}: DeveloperWorkspaceTabProps) {
  const { repositories, profile, contributions } = data;

  // --- 1. Active Repository Selection ---
  const [activeRepoName, setActiveRepoName] = useState<string>(
    repositories[0]?.name || "dev-track"
  );
  const activeRepo = repositories.find((r) => r.name === activeRepoName) || repositories[0];

  // --- 2. Focus Mode States ---
  // Managed by parent: isFocusMode, setIsFocusMode

  // --- 3. Goal Tracker State ---
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");

  // Load goals
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoals = localStorage.getItem("devtrack_workspace_goals");
      if (savedGoals) {
        try {
          setGoals(JSON.parse(savedGoals));
        } catch (e) {}
      } else {
        setGoals([
          { text: "Fix DevTrack dashboard layout overlap", completed: true, updatedAt: Date.now() },
          { text: "Implement Developer Workspace premium tab", completed: false, updatedAt: Date.now() },
          { text: "Add drag-and-drop pinning for repositories", completed: false, updatedAt: Date.now() }
        ]);
      }
    }
  }, []);

  // Save goals
  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem("devtrack_workspace_goals", JSON.stringify(updatedGoals));
  };

  const handleAddGoal = (text: string) => {
    if (!text.trim()) return;
    const updated = [...goals, { text: text.trim(), completed: false, updatedAt: Date.now() }];
    saveGoals(updated);
    setNewGoalText("");
  };

  const handleToggleGoal = (index: number) => {
    const updated = [...goals];
    updated[index].completed = !updated[index].completed;
    updated[index].updatedAt = Date.now();
    saveGoals(updated);
  };

  const handleDeleteGoal = (index: number) => {
    const updated = goals.filter((_, idx) => idx !== index);
    saveGoals(updated);
  };

  // --- 4. Stopwatch / Coding Timer ---
  const [timerTime, setTimerTime] = useState(0); // in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTime = localStorage.getItem("devtrack_workspace_timer_time");
      if (savedTime) setTimerTime(parseInt(savedTime, 10));
    }
  }, []);

  // Save timer time periodically
  useEffect(() => {
    localStorage.setItem("devtrack_workspace_timer_time", timerTime.toString());
  }, [timerTime]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerTime(0);
    localStorage.setItem("devtrack_workspace_timer_time", "0");
  };

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- 5. Developer Notes ---
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [noteEditMode, setNoteEditMode] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "">("saved");
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Load notes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("devtrack_workspace_notes");
      if (savedNotes) {
        try {
          const parsed = JSON.parse(savedNotes);
          setNotes(parsed);
          if (parsed.length > 0) {
            setSelectedNoteId(parsed[0].id);
          }
        } catch (e) {}
      } else {
        const defaultNotes = [
          {
            id: "1",
            title: "Workspace Checklist",
            content: "# Workspace Setup Checklist\n\nWelcome to your new premium developer workspace! This space auto-saves note logs locally.\n\n## Tasks:\n- [x] Check layout for overlaps\n- [ ] Explore the premium Monthly calendar\n- [ ] Try setting a focus goal\n- [ ] Launch Focus Mode (large maximized button)\n\nUse `Ctrl + Shift + N` to create a new note at any time.",
            pinned: true,
            updatedAt: Date.now()
          },
          {
            id: "2",
            title: "Quick Snippet Template",
            content: "# Code Snippets & Notes\n\n```typescript\n// Fetch repos from GitHub api safely\nasync function fetchRepos(token: string) {\n  const res = await fetch('https://api.github.com/user/repos', {\n    headers: { Authorization: `token ${token}` }\n  });\n  return await res.json();\n}\n```",
            pinned: false,
            updatedAt: Date.now()
          }
        ];
        setNotes(defaultNotes);
        setSelectedNoteId("1");
        localStorage.setItem("devtrack_workspace_notes", JSON.stringify(defaultNotes));
      }
    }
  }, []);

  // Handle Note Content Change
  const handleNoteContentChange = (content: string) => {
    if (!selectedNote) return;
    setSaveStatus("saving");

    const updated = notes.map((n) =>
      n.id === selectedNote.id
        ? { ...n, content, updatedAt: Date.now() }
        : n
    );
    setNotes(updated);

    // Debounced Auto-Save
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      localStorage.setItem("devtrack_workspace_notes", JSON.stringify(updated));
      setSaveStatus("saved");
    }, 800);
  };

  const handleNoteTitleChange = (title: string) => {
    if (!selectedNote) return;
    setSaveStatus("saving");

    const updated = notes.map((n) =>
      n.id === selectedNote.id
        ? { ...n, title, updatedAt: Date.now() }
        : n
    );
    setNotes(updated);

    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      localStorage.setItem("devtrack_workspace_notes", JSON.stringify(updated));
      setSaveStatus("saved");
    }, 800);
  };

  const handleCreateNote = () => {
    const newNote: WorkspaceNote = {
      id: Math.random().toString(36).substring(2, 9),
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart typing note logs here...",
      pinned: false,
      updatedAt: Date.now()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setSelectedNoteId(newNote.id);
    localStorage.setItem("devtrack_workspace_notes", JSON.stringify(updated));
    setSaveStatus("saved");
  };

  // Register callback for keyboard shortcut Ctrl+Shift+N
  useEffect(() => {
    if (registerNewNoteCallback) {
      registerNewNoteCallback(() => {
        handleCreateNote();
        setNoteEditMode("edit");
      });
    }
  }, [notes, registerNewNoteCallback]);

  const handleTogglePinNote = (noteId: string) => {
    const updated = notes.map((n) =>
      n.id === noteId ? { ...n, pinned: !n.pinned } : n
    ).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
    setNotes(updated);
    localStorage.setItem("devtrack_workspace_notes", JSON.stringify(updated));
  };

  const handleDeleteNote = (noteId: string) => {
    if (notes.length <= 1) return; // Keep at least one note
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(updated[0].id);
    }
    localStorage.setItem("devtrack_workspace_notes", JSON.stringify(updated));
  };

  // Insert utilities inside note
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById("note-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedNote.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    handleNoteContentChange(before + textToInsert + after);

    // Reset cursor position after state updates
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 50);
  };

  // Markdown parser helpers
  const parseMarkdownBlocks = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : "code";
        const code = match ? match[2] : part.slice(3, -3);
        return (
          <pre key={idx} className="bg-[#0D1117] border border-border rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono text-[#58A6FF] shadow-inner relative group select-text">
            <div className="flex justify-between items-center text-[9px] text-text-secondary uppercase tracking-widest border-b border-border/40 pb-1 mb-1.5 font-bold">
              <span>{lang || "code snippet"}</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-surface-secondary rounded border border-border">snippet</span>
            </div>
            <code>{code}</code>
          </pre>
        );
      } else {
        const lines = part.split("\n");
        return lines.map((line, lIdx) => {
          // Checklists: - [ ] or - [x]
          const checklistMatch = line.match(/^-\s+\[([ xX])\]\s+(.*)/);
          if (checklistMatch) {
            const checked = checklistMatch[1].toLowerCase() === "x";
            const label = checklistMatch[2];
            return (
              <div key={`${idx}-${lIdx}`} className="flex items-center gap-2 py-0.5 font-sans text-xs">
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="rounded border-border bg-[#0D1117] text-accent focus:ring-accent h-3.5 w-3.5 cursor-pointer pointer-events-none"
                />
                <span className={checked ? "line-through text-[#8B949E]" : "text-text-primary"}>
                  {formatInlineMarkdown(label)}
                </span>
              </div>
            );
          }

          // Headers
          if (line.startsWith("# ")) {
            return (
              <h1 key={`${idx}-${lIdx}`} className="text-sm font-bold text-text-primary mt-3 mb-1.5 font-space-grotesk border-b border-border pb-1">
                {formatInlineMarkdown(line.slice(2))}
              </h1>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={`${idx}-${lIdx}`} className="text-xs font-bold text-text-primary mt-2.5 mb-1 font-space-grotesk">
                {formatInlineMarkdown(line.slice(3))}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 key={`${idx}-${lIdx}`} className="text-[11px] font-bold text-text-primary mt-2 mb-0.5 font-space-grotesk">
                {formatInlineMarkdown(line.slice(4))}
              </h3>
            );
          }

          // Bullet lists
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li key={`${idx}-${lIdx}`} className="list-disc ml-4 py-0.5 text-xs text-text-secondary">
                {formatInlineMarkdown(line.slice(2))}
              </li>
            );
          }

          // Empty lines
          if (!line.trim()) {
            return <div key={`${idx}-${lIdx}`} className="h-1" />;
          }

          // Standard paragraph
          return (
            <p key={`${idx}-${lIdx}`} className="text-xs text-text-secondary leading-relaxed font-sans py-0.5">
              {formatInlineMarkdown(line)}
            </p>
          );
        });
      }
    });
  };

  const formatInlineMarkdown = (text: string) => {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const formatted = escaped
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#0D1117] border border-border text-accent font-mono text-[10px]">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // --- 6. Pinned Repositories (Drag & Drop) ---
  const [pinnedRepos, setPinnedRepos] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Load pinned repos from storage or default to top 4
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPinned = localStorage.getItem("devtrack_workspace_pinned_repos");
      if (savedPinned) {
        try {
          setPinnedRepos(JSON.parse(savedPinned));
        } catch (e) {}
      } else {
        const topRepos = repositories
          .slice(0, 4)
          .map((r) => r.name);
        setPinnedRepos(topRepos);
      }
    }
  }, [repositories]);

  const savePinnedRepos = (updated: string[]) => {
    setPinnedRepos(updated);
    localStorage.setItem("devtrack_workspace_pinned_repos", JSON.stringify(updated));
  };

  // HTML5 Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) return;
    
    // Swap items in memory for temporary layout feedback
    const updated = [...pinnedRepos];
    const draggedItem = updated[draggedIdx];
    updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, draggedItem);
    
    setDraggedIdx(targetIndex);
    setPinnedRepos(updated);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    savePinnedRepos(pinnedRepos);
    setDraggedIdx(null);
  };

  const handleTogglePinRepo = (repoName: string) => {
    if (pinnedRepos.includes(repoName)) {
      const updated = pinnedRepos.filter((name) => name !== repoName);
      savePinnedRepos(updated);
    } else {
      const updated = [...pinnedRepos, repoName];
      savePinnedRepos(updated);
    }
  };

  const activePinnedRepos = pinnedRepos
    .map((name) => repositories.find((r) => r.name === name))
    .filter((r): r is GitHubRepository => !!r);

  // --- 7. Quick Actions Feedback ---
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);

  const handleCopyProfileUrl = () => {
    const url = `${window.location.origin}/u/${profile.login}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      // Mock txt report generation & download
      const reportText = `DEVTRACK ANALYTICS REPORT\n=========================\nDeveloper: ${profile.name || profile.login}\nGitHub Profile: ${profile.html_url}\nGrade: ${data.score?.grade || "A"}\nOverall Score: ${data.score?.overall || 85}/100\nActive Repository: ${activeRepoName}\nGenerated: ${new Date().toLocaleString()}\n`;
      const blob = new Blob([reportText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.login}-developer-report.txt`;
      link.click();
      setGeneratingReport(false);
    }, 1500);
  };

  const handleGenerateResume = () => {
    setGeneratingResume(true);
    setTimeout(() => {
      const resumeContent = `# RESUME: ${profile.name || profile.login}\n\nGitHub: ${profile.html_url}\nBio: ${profile.bio || "Software Engineer"}\n\n## Analytics Summary\n- Total Commits: ${contributions.totalCommits}\n- Total Pull Requests: ${contributions.totalPRs}\n- Top Language: ${repositories[0]?.language || "TypeScript"}\n`;
      const blob = new Blob([resumeContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.login}-developer-resume.md`;
      link.click();
      setGeneratingResume(false);
    }, 1500);
  };

  // --- 8. AI Recommendations Panel ---
  const aiFocusSuggestions = [
    { text: `Continue coding on ${activeRepoName}`, desc: "Based on active file logs & streak" },
    { text: "Improve repository README documentation", desc: "Based on security & clarity indicators" },
    { text: "Address outstanding open issues in workspace", desc: "Refactor task list backlog" },
    { text: "Increase test coverage parameters", desc: "Implement robust security assertions" },
    { text: "Push new commit revisions to branch", desc: "Synchronize local changes to remote" },
    { text: "Complete developer daily streaking target", desc: "Maintain active coding sequence" }
  ];

  // --- 9. Developer Calendar & Streaks ---
  // July 2026 Monthly Grid
  const daysInMonth = 31;
  const startDayOffset = 3; // Wednesday start for July 2026
  const calendarDays = Array.from({ length: daysInMonth }, (_, idx) => idx + 1);

  // Selected Day Commit Stats
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  
  // Custom mock calendar commit mapping (July 2026)
  const [monthCommits, setMonthCommits] = useState<Record<number, { count: number; messages: string[] }>>({});

  useEffect(() => {
    const mocks: Record<number, { count: number; messages: string[] }> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      if (day % 3 === 0) {
        mocks[day] = {
          count: 3 + (day % 4),
          messages: [
            `feat: optimize workspace widgets on day ${day}`,
            `refactor: resolve overlapping CSS bounds`,
            `docs: append markdown shortcut guides`
          ]
        };
      } else if (day % 5 === 0) {
        mocks[day] = {
          count: 1,
          messages: [`fix: patch missing scroll offset handler on day ${day}`]
        };
      } else {
        mocks[day] = { count: 0, messages: [] };
      }
    }
    // Make sure today has active commits for display
    mocks[new Date().getDate()] = {
      count: 5,
      messages: [
        "feat: create DeveloperWorkspace premium module layout",
        "fix: resolve fixed Navbar overlapping body boundaries",
        "docs: document command palette shortcuts in useKeyboardShortcuts hook",
        "style: polish glassmorphism micro-animations on sidebar toggles",
        "test: run Next.js compilation scripts successfully"
      ]
    };
    setMonthCommits(mocks);
  }, []);

  const selectedDayData = monthCommits[selectedDay] || { count: 0, messages: [] };

  const getCalendarSquareBg = (day: number) => {
    const commits = monthCommits[day]?.count || 0;
    if (commits === 0) return "bg-[#161B22] border-transparent hover:border-[#30363D]";
    if (commits === 1) return "bg-[#0E4429] text-white border-transparent hover:border-[#26A641]";
    if (commits <= 3) return "bg-[#006D32] text-white border-transparent hover:border-[#39D353]";
    return "bg-[#39D353] text-black border-transparent font-bold hover:scale-105";
  };

  // Streak calculation indicators
  const currentStreak = 12;
  const longestStreak = 45;
  const weeklyCompletionRate = 85;

  return (
    <div className="flex-1 w-full min-h-full font-mono text-xs select-none">
      <AnimatePresence mode="wait">
        {isFocusMode ? (
          // ==========================================
          // FOCUS MODE (Distraction-Free)
          // ==========================================
          <motion.div
            key="focus-mode"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-4xl mx-auto flex flex-col gap-6"
          >
            {/* Minimal Focus Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-text-secondary uppercase tracking-widest font-bold">Focus Mode Active</span>
                <span className="text-border">|</span>
                <span className="text-text-primary font-bold flex items-center gap-1">
                  <Globe size={12} className="text-accent" /> {activeRepoName}
                </span>
              </div>
              <button
                onClick={() => setIsFocusMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-[#161B22]/50 hover:bg-[#161B22] hover:text-text-primary text-text-secondary transition-all cursor-pointer"
                title="Exit Focus Mode (ESC)"
              >
                <Minimize2 size={13} />
                <span>Exit Focus</span>
              </button>
            </div>

            {/* Main Focus Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Focus Goal & Timer (Left - span 4) */}
              <div className="md:col-span-4 space-y-6">
                {/* coding stopwatch widget */}
                <div className="rounded-xl border border-border bg-[#161B22]/65 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-lg shadow-black/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-accent/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">CODING TIMER</span>
                  
                  <div className="text-3xl font-bold tracking-widest text-text-primary font-mono drop-shadow-[0_0_12px_rgba(47,129,247,0.3)]">
                    {formatTimer(timerTime)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
                        timerRunning
                          ? "bg-warning/10 border-warning/30 text-warning hover:bg-warning/20"
                          : "bg-success/10 border-success/30 text-success hover:bg-success/20"
                      }`}
                    >
                      {timerRunning ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                    </button>
                    <button
                      onClick={handleResetTimer}
                      className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-all"
                      title="Reset Stopwatch"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>

                {/* current goal widget */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/65 p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Today's Focus Goal</span>
                    <span className="text-accent text-[9px] font-bold">ACTIVE</span>
                  </div>

                  {goals.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 p-3 rounded-lg border border-accent/25 bg-[#2F81F7]/5 text-text-primary relative group overflow-hidden">
                        <input
                          type="checkbox"
                          checked={goals[0].completed}
                          onChange={() => handleToggleGoal(0)}
                          className="rounded border-[#30363D] bg-[#0D1117] text-accent focus:ring-accent h-4 w-4 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-normal truncate ${goals[0].completed ? "line-through text-text-secondary" : "text-text-primary"}`}>
                            {goals[0].text}
                          </p>
                          <span className="text-[9px] text-text-secondary block mt-1">
                            Added {new Date(goals[0].updatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-[9px] text-text-secondary leading-relaxed italic">
                        Tip: Click checkbox to log goal completion as developer activity.
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-text-secondary">
                      No focus goal set. Create one below.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add goal text..."
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddGoal(newGoalText)}
                      className="flex-1 rounded-lg border border-border bg-[#0D1117] px-3 py-1.5 text-xs text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddGoal(newGoalText)}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white hover:bg-accent/90 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Distraction-Free Notes Editor (Right - span 8) */}
              <div className="md:col-span-8">
                <div className="rounded-xl border border-border bg-[#161B22]/65 overflow-hidden flex flex-col h-[480px] shadow-2xl relative">
                  {/* Note header */}
                  <div className="flex items-center justify-between p-3 border-b border-border bg-[#0D1117] flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-accent" />
                      <input
                        type="text"
                        value={selectedNote?.title || ""}
                        onChange={(e) => handleNoteTitleChange(e.target.value)}
                        placeholder="Untitled Note"
                        className="bg-transparent text-text-primary font-bold text-xs focus:outline-none border-b border-transparent focus:border-border/60 py-0.5 px-1 max-w-[200px]"
                      />
                      {saveStatus === "saving" && (
                        <span className="text-[9px] text-text-secondary animate-pulse">Saving...</span>
                      )}
                      {saveStatus === "saved" && (
                        <span className="text-[9px] text-success flex items-center gap-0.5">
                          <CheckCircle size={8} /> Auto-saved
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5 border border-border">
                      <button
                        onClick={() => setNoteEditMode("edit")}
                        className={`px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
                          noteEditMode === "edit"
                            ? "bg-accent text-white"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setNoteEditMode("preview")}
                        className={`px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
                          noteEditMode === "preview"
                            ? "bg-accent text-white"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Insert Helpers */}
                  {noteEditMode === "edit" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/40 bg-surface/30 text-[10px] text-text-secondary">
                      <button
                        onClick={() => insertTextAtCursor("\n- [ ] ")}
                        className="px-2 py-0.5 rounded border border-border bg-[#0D1117] hover:bg-surface transition-colors cursor-pointer"
                      >
                        + Checklist
                      </button>
                      <button
                        onClick={() => insertTextAtCursor("\n```typescript\n\n```")}
                        className="px-2 py-0.5 rounded border border-border bg-[#0D1117] hover:bg-surface transition-colors cursor-pointer"
                      >
                        + Code Block
                      </button>
                    </div>
                  )}

                  {/* Editor Box */}
                  <div className="flex-1 overflow-y-auto">
                    {noteEditMode === "edit" ? (
                      <textarea
                        id="note-textarea"
                        value={selectedNote?.content || ""}
                        onChange={(e) => handleNoteContentChange(e.target.value)}
                        placeholder="Log instructions, snippet notes, or check items using markdown..."
                        className="w-full h-full p-4 bg-transparent text-text-primary placeholder-text-secondary/50 focus:outline-none resize-none font-mono leading-relaxed"
                      />
                    ) : (
                      <div className="p-4 space-y-2 select-text leading-relaxed">
                        {selectedNote?.content ? parseMarkdownBlocks(selectedNote.content) : (
                          <span className="italic text-text-secondary/50">Note content is empty.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // ==========================================
          // WORKSPACE HOME (Full Premium Dashboard)
          // ==========================================
          <motion.div
            key="workspace-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                  <Layers size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary font-space-grotesk tracking-wide">Developer Workspace</h2>
                  <p className="text-[10px] text-text-secondary">Core productivity hub and event timeline grading sandbox.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Active Repo Select box */}
                <div className="relative">
                  <select
                    value={activeRepoName}
                    onChange={(e) => setActiveRepoName(e.target.value)}
                    className="appearance-none bg-[#161B22] border border-border text-text-primary text-[11px] font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {repositories.map((repo) => (
                      <option key={repo.id} value={repo.name}>
                        {repo.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsFocusMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-accent text-white hover:bg-accent/90 transition-all font-bold cursor-pointer"
                  title="Minimize distraction (ESC)"
                >
                  <Maximize2 size={13} />
                  <span>Focus Mode</span>
                </button>
              </div>
            </div>

            {/* Widgets Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column Widgets (Goals, Coding Timer, Sprint - Span 4) */}
              <div className="md:col-span-4 space-y-6">
                
                {/* Today's Goal */}
                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Today's Focus Goal</span>
                    <span className="text-accent text-[9px] font-bold">ACTIVE</span>
                  </div>

                  {goals.length > 0 ? (
                    <div className="space-y-2.5">
                      {goals.slice(0, 3).map((goal, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2 p-2 rounded border border-border bg-surface/30 relative group transition-all hover:bg-surface/50 ${
                            goal.completed ? "border-success/15 bg-success/2" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => handleToggleGoal(idx)}
                            className="rounded border-border bg-[#0D1117] text-accent focus:ring-accent h-3.5 w-3.5 mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0 pr-6">
                            <p className={`text-[11px] leading-tight font-medium break-all truncate ${goal.completed ? "line-through text-[#8B949E]" : "text-text-primary"}`}>
                              {goal.text}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(idx)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-danger transition-opacity cursor-pointer p-0.5"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-text-secondary text-[10px] italic">
                      No focus goals created. Add one below.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add goal text..."
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddGoal(newGoalText)}
                      className="flex-1 rounded-lg border border-border bg-[#0D1117] px-2.5 py-1.5 text-xs text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddGoal(newGoalText)}
                      className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-bold text-white hover:bg-accent/90 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Coding Time (Stopwatch) */}
                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Coding Time Session</span>
                  <div className="text-2xl font-bold tracking-widest text-text-primary font-mono drop-shadow-[0_0_8px_rgba(47,129,247,0.25)]">
                    {formatTimer(timerTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`h-8 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all border text-[10px] font-bold ${
                        timerRunning
                          ? "bg-warning/10 border-warning/30 text-warning hover:bg-warning/20"
                          : "bg-success/10 border-success/30 text-success hover:bg-success/20"
                      }`}
                    >
                      {timerRunning ? (
                        <>
                          <Pause size={10} /> Pause Session
                        </>
                      ) : (
                        <>
                          <Play size={10} className="ml-0.5" /> Start Timer
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleResetTimer}
                      className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-all"
                      title="Reset Stopwatch"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>

                {/* Current Sprint */}
                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Current Sprint</span>
                    <span className="text-text-secondary text-[9px]">Jul 1 - Jul 15</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-text-primary">
                      <span>Sprint 4 Dashboard Fixes</span>
                      <span className="text-success">80%</span>
                    </div>
                    {/* Glowing progress bar */}
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden relative">
                      <div className="h-full bg-success rounded-full shadow-[0_0_8px_#3FB950]" style={{ width: "80%" }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#8B949E] pt-1">
                      <span>8 of 10 tasks completed</span>
                      <span>2 days remaining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column (Developer Notes - Span 5) */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Notes Widget */}
                <div className="rounded-xl border border-border bg-[#161B22]/50 overflow-hidden flex flex-col h-[382px] relative shadow-lg shadow-black/10">
                  {/* Note header bar */}
                  <div className="flex items-center justify-between p-3 border-b border-border bg-[#0D1117] flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCreateNote}
                        className="p-1 rounded hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        title="New Note (Ctrl+Shift+N)"
                      >
                        <Plus size={12} />
                      </button>
                      
                      {/* select note */}
                      <div className="relative">
                        <select
                          value={selectedNoteId}
                          onChange={(e) => setSelectedNoteId(e.target.value)}
                          className="appearance-none bg-surface-secondary border border-border text-text-primary text-[10px] font-bold rounded px-2.5 pr-6 py-0.5 focus:outline-none cursor-pointer"
                        >
                          {notes.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.pinned ? "📌 " : ""}{n.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                      </div>

                      {selectedNote && (
                        <button
                          onClick={() => handleTogglePinNote(selectedNote.id)}
                          className={`p-1 rounded hover:bg-surface transition-all cursor-pointer ${
                            selectedNote.pinned ? "text-accent" : "text-text-secondary"
                          }`}
                          title={selectedNote.pinned ? "Unpin Note" : "Pin Note"}
                        >
                          <Pin size={10} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 bg-surface rounded p-0.5 border border-border">
                      <button
                        onClick={() => setNoteEditMode("edit")}
                        className={`px-1.5 py-0.5 text-[9px] rounded font-bold cursor-pointer transition-colors ${
                          noteEditMode === "edit"
                            ? "bg-accent text-white"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setNoteEditMode("preview")}
                        className={`px-1.5 py-0.5 text-[9px] rounded font-bold cursor-pointer transition-colors ${
                          noteEditMode === "preview"
                            ? "bg-accent text-white"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        Prev
                      </button>
                    </div>
                  </div>

                  {/* Note toolbar */}
                  {noteEditMode === "edit" && selectedNote && (
                    <div className="flex items-center gap-1.5 px-3 py-1 border-b border-border/40 bg-surface/20 text-[9px] text-[#8B949E]">
                      <button
                        onClick={() => insertTextAtCursor("\n- [ ] ")}
                        className="px-1.5 py-0.5 rounded border border-border bg-[#0D1117] hover:bg-surface cursor-pointer"
                      >
                        + Checklist
                      </button>
                      <button
                        onClick={() => insertTextAtCursor("\n```typescript\n\n```")}
                        className="px-1.5 py-0.5 rounded border border-border bg-[#0D1117] hover:bg-surface cursor-pointer"
                      >
                        + Snippet
                      </button>
                      {selectedNoteId && (
                        <button
                          onClick={() => handleDeleteNote(selectedNoteId)}
                          className="px-1.5 py-0.5 rounded border border-danger/30 text-danger bg-[#0D1117] hover:bg-danger/10 cursor-pointer ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}

                  {/* Notes Editor area */}
                  <div className="flex-grow overflow-y-auto">
                    {selectedNote ? (
                      noteEditMode === "edit" ? (
                        <div className="h-full flex flex-col p-3">
                          <input
                            type="text"
                            value={selectedNote.title}
                            onChange={(e) => handleNoteTitleChange(e.target.value)}
                            placeholder="Note Title"
                            className="bg-transparent text-text-primary font-bold text-xs focus:outline-none border-b border-border/30 pb-1 mb-2 font-mono"
                          />
                          <textarea
                            id="note-textarea"
                            value={selectedNote.content}
                            onChange={(e) => handleNoteContentChange(e.target.value)}
                            placeholder="Type markdown, snippets or checkbox checklists here..."
                            className="flex-1 bg-transparent text-text-primary focus:outline-none resize-none font-mono text-xs leading-relaxed"
                          />
                        </div>
                      ) : (
                        <div className="p-4 space-y-2 select-text leading-relaxed h-full">
                          {selectedNote.content ? parseMarkdownBlocks(selectedNote.content) : (
                            <span className="italic text-[#8B949E]/50">Note content is empty.</span>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#8B949E] text-xs italic">
                        No active notes found. Create a new one.
                      </div>
                    )}
                  </div>

                  {/* Notes Footer status info */}
                  <div className="p-2 border-t border-border bg-[#0D1117] flex justify-between items-center text-[9px] text-[#8B949E] font-mono">
                    <span>Markdown support</span>
                    {saveStatus === "saving" && <span className="text-warning animate-pulse">Saving note...</span>}
                    {saveStatus === "saved" && <span className="text-success">Saved to local cache</span>}
                  </div>
                </div>
              </div>

              {/* Right Column (Weekly Progress & Monthly Target - Span 3) */}
              <div className="md:col-span-3 space-y-6">
                
                {/* Weekly progress mini chart */}
                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Weekly Progress</span>
                    <span className="text-accent text-[9px] font-bold">18 Commits</span>
                  </div>

                  {/* Custom CSS Bar Charts (Responsive, zero lag) */}
                  <div className="flex items-end justify-between h-24 pt-2 font-mono text-[9px] text-[#8B949E]">
                    {[
                      { day: "M", val: "40%", commits: 2 },
                      { day: "T", val: "80%", commits: 4 },
                      { day: "W", val: "20%", commits: 1 },
                      { day: "T", val: "60%", commits: 3 },
                      { day: "F", val: "100%", commits: 5 },
                      { day: "S", val: "40%", commits: 2 },
                      { day: "S", val: "20%", commits: 1 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 w-6 group cursor-pointer">
                        <div className="w-full bg-[#30363D] rounded overflow-hidden h-16 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: item.val }}
                            transition={{ type: "spring", stiffness: 100, delay: idx * 0.05 }}
                            className="w-full bg-accent group-hover:bg-[#58A6FF] rounded-t transition-colors shadow-[0_0_6px_rgba(47,129,247,0.4)]"
                            title={`${item.commits} commits`}
                          />
                        </div>
                        <span>{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly targets progress stats */}
                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Monthly Target</span>
                    <span className="text-text-secondary text-[9px]">July 2026</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-text-primary">
                        <span>Synced Repositories</span>
                        <span>4 / 5</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: "80%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-text-primary">
                        <span>Total Commit Target</span>
                        <span>78 / 100</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{ width: "78%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-text-primary">
                        <span>Pull Request Reviews</span>
                        <span>3 / 5</span>
                      </div>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{ width: "60%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row Layout Grid: Pinned Repos (Drag & Drop), Actions, Calendar, AI Suggest */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Pinned Repositories (Drag & Drop sortable) (Span 5) */}
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Pinned Repositories</span>
                    <span className="text-[9px] text-[#8B949E]">(Drag & Drop reorder)</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {activePinnedRepos.map((repo, idx) => (
                    <div
                      key={repo.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`flex items-center justify-between p-3 rounded-lg border bg-[#161B22]/40 hover:bg-[#161B22]/80 transition-all cursor-grab active:cursor-grabbing ${
                        draggedIdx === idx
                          ? "border-accent bg-accent/5 opacity-50 border-dashed"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-6 w-6 rounded bg-surface border border-border flex items-center justify-center font-bold text-accent">
                          📁
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-text-primary truncate">{repo.name}</h4>
                          <p className="text-[9px] text-[#8B949E] truncate max-w-[200px]">
                            {repo.description || "No description configured."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[10px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: repo.language === "TypeScript" ? "#3178c6" : (repo.language === "Python" ? "#3572A5" : "#2f81f7") }} />
                          {repo.language || "TypeScript"}
                        </span>
                        <span>⭐ {repo.stargazers_count}</span>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:text-text-primary rounded border border-border/40 hover:border-border bg-surface transition-colors cursor-pointer"
                          title="Open repo in source view"
                        >
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}

                  {activePinnedRepos.length === 0 && (
                    <div className="text-center py-8 text-text-secondary border border-border border-dashed rounded-lg bg-surface/10 text-[10px]">
                      No repositories pinned. Use settings or click the pin button in workspace headers.
                    </div>
                  )}
                </div>
              </div>

              {/* Developer monthly calendar & contribution heat streak (Span 7) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Developer Calendar & Commit logs</span>
                  
                  {/* Streak displays */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
                      <Flame size={12} className="animate-pulse" />
                      <span>{currentStreak} Days Streak</span>
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-[#161B22]/50 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Calendar Grid (Span 7) */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-text-primary border-b border-border pb-1">
                      <span>JULY 2026</span>
                      <span>{weeklyCompletionRate}% Completed</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-[#8B949E]">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <span key={day} className="py-0.5">{day}</span>
                      ))}

                      {/* Padding offsets for July 1 (Wednesday start) */}
                      {Array.from({ length: startDayOffset }).map((_, idx) => (
                        <div key={`offset-${idx}`} className="h-6 w-full" />
                      ))}

                      {/* Day cells */}
                      {calendarDays.map((day) => {
                        const isSelected = day === selectedDay;
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`h-6 w-full rounded flex items-center justify-center font-mono text-[9px] cursor-pointer transition-all border ${getCalendarSquareBg(
                              day
                            )} ${
                              isSelected
                                ? "border-accent ring-1 ring-accent"
                                : ""
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Detail History & Streak (Span 5) */}
                  <div className="lg:col-span-5 border-l border-border/60 pl-0 lg:pl-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-text-primary flex items-center justify-between">
                        <span>Day {selectedDay} Commit Log</span>
                        <span className="text-accent font-mono text-[9px]">
                          {selectedDayData.count} commit{selectedDayData.count !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                        {selectedDayData.count > 0 ? (
                          selectedDayData.messages.map((msg, idx) => (
                            <div key={idx} className="flex gap-1.5 p-1 rounded bg-[#0D1117]/50 border border-border/20 text-[9px] text-[#8B949E]">
                              <span className="text-accent flex-shrink-0">✓</span>
                              <span className="truncate">{msg}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-text-secondary text-[9px] italic">
                            No coding session recorded on this day.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[9px] text-[#8B949E] mt-2">
                      <span>Longest: <strong>{longestStreak} Days</strong></span>
                      <span>Streak streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Action Cards Grid + AI Today's Coding Focus (Side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* AI Coding Focus suggestions (Span 5) */}
              <div className="md:col-span-5 rounded-xl border border-border bg-[#161B22]/50 p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-accent/5 rounded-bl-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-1.5 border-b border-border/50 pb-2">
                  <Sparkles size={13} className="text-[#BC8CFF]" />
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Today's Coding Focus</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {aiFocusSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddGoal(suggestion.text)}
                      className="w-full flex flex-col text-left p-2 rounded border border-border bg-[#0D1117]/30 hover:bg-[#0D1117] transition-all group cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-text-primary group-hover:text-accent transition-colors">
                        {suggestion.text}
                      </span>
                      <span className="text-[9px] text-[#8B949E] mt-0.5">
                        {suggestion.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions (Span 7) */}
              <div className="md:col-span-7 space-y-3">
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block">Quick Actions</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <a
                    href={activeRepo?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-3 rounded-lg border border-border bg-[#161B22]/40 hover:bg-[#161B22] hover:border-accent/40 transition-all text-left cursor-pointer group"
                  >
                    <BookOpen size={16} className="text-accent group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="font-bold text-text-primary text-[11px]">Open Repository</span>
                    <span className="text-[9px] text-[#8B949E] mt-0.5">View GitHub files</span>
                  </a>

                  <button
                    onClick={() => handleAddGoal("Fix outstanding open issue logs")}
                    className="flex flex-col p-3 rounded-lg border border-border bg-[#161B22]/40 hover:bg-[#161B22] hover:border-accent/40 transition-all text-left cursor-pointer group"
                  >
                    <PlusCircle size={16} className="text-success group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="font-bold text-text-primary text-[11px]">Create Issue</span>
                    <span className="text-[9px] text-[#8B949E] mt-0.5">Log new task goal</span>
                  </button>

                  <a
                    href={`${activeRepo?.html_url}/pulls`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-3 rounded-lg border border-border bg-[#161B22]/40 hover:bg-[#161B22] hover:border-accent/40 transition-all text-left cursor-pointer group"
                  >
                    <Layers size={16} className="text-warning group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="font-bold text-text-primary text-[11px]">View PRs</span>
                    <span className="text-[9px] text-[#8B949E] mt-0.5">Open pull requests</span>
                  </a>

                  <a
                    href={profile.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-3 rounded-lg border border-border bg-[#161B22]/40 hover:bg-[#161B22] hover:border-accent/40 transition-all text-left cursor-pointer group"
                  >
                    <Globe size={16} className="text-[#BC8CFF] group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="font-bold text-text-primary text-[11px]">Open Profile</span>
                    <span className="text-[9px] text-[#8B949E] mt-0.5">View GitHub page</span>
                  </a>

                  <button
                    onClick={handleCopyProfileUrl}
                    className="flex flex-col p-3 rounded-lg border border-border bg-[#161B22]/40 hover:bg-[#161B22] hover:border-accent/40 transition-all text-left cursor-pointer group"
                  >
                    {copiedUrl ? (
                      <Check size={16} className="text-success mb-1.5" />
                    ) : (
                      <Share2 size={16} className="text-accent group-hover:scale-110 transition-transform mb-1.5" />
                    )}
                    <span className="font-bold text-text-primary text-[11px]">
                      {copiedUrl ? "Copied URL!" : "Copy Profile URL"}
                    </span>
                    <span className="text-[9px] text-[#8B949E] mt-0.5">Copy share link</span>
                  </button>

                  <button
                    onClick={handleDownloadReport}
                    className="flex flex-col p-3 rounded-lg border border-border bg-[#161B22]/40 hover:bg-[#161B22] hover:border-accent/40 transition-all text-left cursor-pointer group"
                  >
                    {generatingReport ? (
                      <svg className="animate-spin h-4 w-4 text-accent mb-1.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <FileCode size={16} className="text-[#79c0ff] group-hover:scale-110 transition-transform mb-1.5" />
                    )}
                    <span className="font-bold text-text-primary text-[11px]">Developer Report</span>
                    <span className="text-[9px] text-[#8B949E] mt-0.5">Download details</span>
                  </button>

                  <button
                    onClick={handleGenerateResume}
                    className="flex flex-col p-3 rounded-lg border border-border bg-[#161B22]/40 hover:bg-[#161B22] hover:border-accent/40 transition-all text-left cursor-pointer group col-span-2 sm:col-span-1"
                  >
                    {generatingResume ? (
                      <svg className="animate-spin h-4 w-4 text-accent mb-1.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <FileText size={16} className="text-[#3FB950] group-hover:scale-110 transition-transform mb-1.5" />
                    )}
                    <span className="font-bold text-text-primary text-[11px]">Generate Resume</span>
                    <span className="text-[9px] text-[#8B949E] mt-0.5">Export markdown</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
