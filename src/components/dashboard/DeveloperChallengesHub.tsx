"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Zap,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  Compass,
  Gift,
  History,
  Lock,
  CheckCircle,
  RefreshCw,
  Search,
  Star,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";
import { UserDashboardData } from "@/types";
import { ChallengesEngine, DeveloperState, Challenge, getXpRequiredForLevel, getLevelRankTitle } from "@/services/challengesEngine";

interface DeveloperChallengesHubProps {
  data: UserDashboardData;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  githubToken: string;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
}

export default function DeveloperChallengesHub({
  data,
  activeSubTab,
  setActiveSubTab,
  githubToken
}: DeveloperChallengesHubProps) {
  const username = data.profile.login;
  const [gameState, setGameState] = useState<DeveloperState | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; sub: string; type: "success" | "achievement" | "level" } | null>(null);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  // Load state on mount
  useEffect(() => {
    const state = ChallengesEngine.getInitialState(username);
    
    // Dynamically calculate streak from real contribution stats if present
    if (data.contributions?.currentStreak) {
      state.streak = data.contributions.currentStreak;
    }
    
    setGameState(state);
  }, [username, data]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Confetti physics animation
  useEffect(() => {
    if (confetti.length === 0) return;
    
    const interval = setInterval(() => {
      setConfetti(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed + 1.2, // Gravity
            speed: p.speed * 0.96 // Drag
          }))
          .filter(p => p.y < 120 && p.x > -20 && p.x < 120)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [confetti]);

  const triggerConfetti = () => {
    const colors = ["#58A6FF", "#3FB950", "#D29922", "#F85149", "#BC8CFF"];
    const particles: ConfettiParticle[] = Array.from({ length: 80 }).map((_, i) => ({
      id: i + Date.now(),
      x: 50, // Center X percent
      y: 40, // Center Y percent
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 6
    }));
    setConfetti(particles);
  };

  const handleVerify = async () => {
    if (!gameState) return;
    setLoading(true);
    
    try {
      const { updatedState, newlyCompleted, earnedXp } = await ChallengesEngine.verifyActivity(
        username,
        githubToken,
        gameState
      );

      // Check level-up threshold comparison
      const levelUp = updatedState.level > gameState.level;

      setGameState(updatedState);

      if (levelUp) {
        setToast({
          message: "🎉 LEVEL UP!",
          sub: `You reached Level ${updatedState.level} (${updatedState.rankTitle})`,
          type: "level"
        });
        triggerConfetti();
      } else if (newlyCompleted.length > 0) {
        setToast({
          message: `🏆 Verified ${newlyCompleted.length} Mission${newlyCompleted.length > 1 ? "s" : ""}!`,
          sub: `Earned +${earnedXp} XP`,
          type: "success"
        });
      } else {
        setToast({
          message: "ℹ️ Sync Completed",
          sub: "GitHub activity is up-to-date. Keep coding to finish remaining tasks!",
          type: "success"
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        message: "⚠️ Sync Error",
        sub: "Could not fetch recent events from GitHub. Try again later.",
        type: "success"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (chalId: string) => {
    if (!gameState) return;
    const { updatedState, success } = ChallengesEngine.manualVerifyChallenge(username, chalId, gameState);
    if (success) {
      const levelUp = updatedState.level > gameState.level;
      setGameState(updatedState);
      
      const completedChal = [...gameState.activeDaily, ...gameState.activeWeekly, ...gameState.activeMonthly].find(c => c.id === chalId);
      
      if (levelUp) {
        setToast({
          message: "🎉 LEVEL UP!",
          sub: `You reached Level ${updatedState.level} (${updatedState.rankTitle})`,
          type: "level"
        });
        triggerConfetti();
      } else {
        setToast({
          message: "🔥 Challenge Self-Attested",
          sub: `Completed: ${completedChal?.title || "Challenge"}. Earned +${completedChal?.xpReward || 0} XP.`,
          type: "success"
        });
      }
    }
  };

  // Calculations
  const calculatedLevel = useMemo(() => {
    if (!gameState) return { level: 1, currentXp: 0, nextLevelXp: 200, progressPct: 0 };
    
    // Sum previous levels requirements
    let levelCheck = 1;
    let accumulatedXp = 0;
    while (levelCheck < gameState.level) {
      accumulatedXp += getXpRequiredForLevel(levelCheck);
      levelCheck++;
    }
    const currentXp = gameState.totalXp - accumulatedXp;
    const nextLevelXp = getXpRequiredForLevel(gameState.level);
    const progressPct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

    return {
      level: gameState.level,
      currentXp,
      nextLevelXp,
      progressPct
    };
  }, [gameState]);

  // Leaderboard inserts
  const leaderboards = useMemo(() => {
    if (!gameState) return { global: [], friends: [], org: [], country: [] };
    return ChallengesEngine.getLeaderboards(gameState.totalXp, username);
  }, [gameState, username]);

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-text-secondary">
        <svg className="animate-spin h-6 w-6 text-accent mr-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Loading gamification engine...</span>
      </div>
    );
  }

  // Quick tabs list
  const tabButtons = [
    { id: "challenges-dashboard", label: "Dashboard", icon: Award },
    { id: "challenges-daily", label: "Dailies", icon: Clock },
    { id: "challenges-weekly", label: "Weeklies", icon: Calendar },
    { id: "challenges-monthly", label: "Monthlies", icon: Calendar },
    { id: "challenges-achievements", label: "Badges", icon: Star },
    { id: "challenges-xp", label: "Levels", icon: TrendingUp },
    { id: "challenges-leaderboards", label: "Leaderboards", icon: Users },
    { id: "challenges-missions", label: "Special", icon: Compass },
    { id: "challenges-rewards", label: "Rewards", icon: Gift },
    { id: "challenges-history", label: "History", icon: History }
  ];

  return (
    <div className="flex-1 space-y-6 relative overflow-visible">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl border shadow-2xl flex items-start gap-3 w-80 backdrop-blur-md ${
              toast.type === "level"
                ? "bg-[#D29922]/20 border-[#D29922] text-yellow-100"
                : toast.type === "achievement"
                ? "bg-[#BC8CFF]/20 border-[#BC8CFF] text-[#F0F6FC]"
                : "bg-accent/20 border-accent text-white"
            }`}
          >
            <div className="p-2 rounded-lg bg-surface/80">
              {toast.type === "level" ? "👑" : toast.type === "achievement" ? "⭐" : "✓"}
            </div>
            <div>
              <h4 className="text-xs font-bold font-space-grotesk">{toast.message}</h4>
              <p className="text-[10px] text-text-secondary mt-1">{toast.sub}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti canvas */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confetti.map(p => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: "6px",
              height: "6px",
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              transform: `rotate(${p.angle}rad)`,
              opacity: 0.8
            }}
          />
        ))}
      </div>

      {/* Hub Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border border-border bg-[#161B22] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-bold font-space-grotesk text-text-primary">
              Developer Challenges
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Build coding habits, maintain streaks, and complete daily verified missions on GitHub.
          </p>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-border rounded-lg text-xs font-bold text-text-primary transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Scanning GitHub Feed..." : "Sync GitHub Activity"}</span>
        </button>
      </div>

      {/* Hub Tabs Menu */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {tabButtons.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap border transition-all cursor-pointer ${
                isActive
                  ? "bg-accent border-accent text-white"
                  : "border-border bg-[#0D1117] text-text-secondary hover:text-text-primary hover:border-accent/40"
              }`}
            >
              <TabIcon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeSubTab === "challenges-dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level Profile Card */}
            <div className="md:col-span-2 p-6 rounded-xl border border-border bg-[#161B22] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-40 h-40 rounded-full bg-accent/5 blur-3xl" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent font-space-grotesk text-lg shadow-inner">
                    {calculatedLevel.level}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary font-space-grotesk">
                      Level {calculatedLevel.level} — {gameState.rankTitle}
                    </h3>
                    <p className="text-[10px] text-text-secondary font-mono mt-0.5">
                      {gameState.totalXp} Total XP Mapped
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-text-secondary">
                    <span>XP progress: {calculatedLevel.currentXp} / {calculatedLevel.nextLevelXp}</span>
                    <span>{calculatedLevel.progressPct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#0D1117] overflow-hidden border border-border p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculatedLevel.progressPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-accent relative"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Ranks list overview */}
              <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-border/60">
                <div className="text-center p-2 rounded-lg bg-[#0D1117]/60 border border-border/40">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">Streak</span>
                  <span className="text-xs font-mono font-bold text-orange-400 mt-1 block">🔥 {gameState.streak} Days</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#0D1117]/60 border border-border/40">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">Missions Done</span>
                  <span className="text-xs font-mono font-bold text-accent mt-1 block">✓ {gameState.completedCount}</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#0D1117]/60 border border-border/40">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">Success Rate</span>
                  <span className="text-xs font-mono font-bold text-[#3FB950] mt-1 block">100%</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#0D1117]/60 border border-border/40">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">Rank Level</span>
                  <span className="text-[10px] font-semibold text-[#BC8CFF] mt-1 block truncate">{gameState.rankTitle}</span>
                </div>
              </div>
            </div>

            {/* Quick stats / active task count */}
            <div className="p-6 rounded-xl border border-border bg-[#161B22] flex flex-col justify-between">
              <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk">
                Challenges Summary
              </h3>

              <div className="space-y-4 my-4">
                <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
                  <span className="text-text-secondary font-semibold">Active Daily Missions</span>
                  <span className="font-mono font-bold text-text-primary">{gameState.activeDaily.filter(c => c.status !== "completed").length} / {gameState.activeDaily.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
                  <span className="text-text-secondary font-semibold">Active Weekly Missions</span>
                  <span className="font-mono font-bold text-text-primary">{gameState.activeWeekly.filter(c => c.status !== "completed").length} / {gameState.activeWeekly.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                  <span className="text-text-secondary font-semibold">Achievements Unlocked</span>
                  <span className="font-mono font-bold text-[#D29922]">{gameState.achievements.filter(a => a.unlockedAt).length} / {gameState.achievements.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2">
                  <span className="text-text-secondary font-semibold">Active Special Events</span>
                  <span className="font-mono font-bold text-[#BC8CFF]">3 Events Open</span>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab("challenges-daily")}
                className="w-full py-2 bg-accent hover:bg-accent/90 text-white font-bold text-[10px] rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
              >
                Go to Active Challenges
              </button>
            </div>

            {/* Weekly calendar mapping */}
            <div className="md:col-span-3 p-6 rounded-xl border border-border bg-[#161B22] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk">
                  Weekly Habit Metrics
                </h3>
                <span className="text-[10px] font-mono text-text-secondary">Last 7 Days Scanned</span>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - idx));
                  const dateString = date.toISOString().split("T")[0];
                  // Check daily contributions count
                  const count = data.contributions?.dailyContributions?.[dateString] || 0;
                  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                  return (
                    <div key={idx} className="flex flex-col items-center p-3 rounded-lg bg-[#0D1117]/80 border border-border/40">
                      <span className="text-[9px] font-bold text-text-secondary">{dayName}</span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mt-2 border ${
                        count > 0 ? "bg-[#3FB950]/20 border-[#3FB950] text-[#3FB950]" : "bg-surface border-border text-text-secondary"
                      }`}>
                        {count}
                      </div>
                      <span className="text-[9px] font-mono text-text-secondary mt-1">{count > 0 ? "Active" : "Idle"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Daily Challenges list */}
        {activeSubTab === "challenges-daily" && (
          <ChallengeList
            title="Daily Missions"
            desc="Refreshed every 24 hours. Connects to today's GitHub event stack."
            challenges={gameState.activeDaily}
            onManualVerify={handleManualVerify}
          />
        )}

        {/* Weekly Challenges list */}
        {activeSubTab === "challenges-weekly" && (
          <ChallengeList
            title="Weekly Objectives"
            desc="Longer habit-building milestones to complete over 7 days."
            challenges={gameState.activeWeekly}
            onManualVerify={handleManualVerify}
          />
        )}

        {/* Monthly Challenges list */}
        {activeSubTab === "challenges-monthly" && (
          <ChallengeList
            title="Monthly Milestones"
            desc="High-reward marathon objectives checking 30 days of work."
            challenges={gameState.activeMonthly}
            onManualVerify={handleManualVerify}
          />
        )}

        {/* Achievements badging */}
        {activeSubTab === "challenges-achievements" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-[#161B22]">
              <h3 className="text-sm font-bold text-text-primary font-space-grotesk flex items-center gap-2">
                <Star className="text-[#D29922] fill-[#D29922]" size={16} />
                Unlocked Badge Achievements
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Collectible digital badges verifying master class accomplishments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gameState.achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                    ach.unlockedAt
                      ? "bg-[#161B22] border-accent/40 shadow-lg"
                      : "bg-[#161B22]/40 border-border/50 opacity-70"
                  }`}
                >
                  <div className="text-3xl p-1 bg-[#0D1117]/80 rounded-lg border border-border/40 select-none">
                    {ach.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary font-space-grotesk flex items-center gap-1.5">
                      {ach.title}
                      {ach.unlockedAt && (
                        <span className="text-[8px] bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 px-1 rounded uppercase font-bold">Unlocked</span>
                      )}
                    </h4>
                    <p className="text-[10px] text-text-secondary leading-relaxed">{ach.description}</p>
                    
                    {ach.unlockedAt ? (
                      <span className="text-[9px] text-[#D29922] font-mono block pt-1.5">✓ Unlocked {ach.unlockedAt}</span>
                    ) : (
                      <div className="space-y-1 pt-1.5">
                        <div className="w-24 h-1.5 rounded-full bg-[#0D1117] border border-border overflow-hidden">
                          <div style={{ width: `${ach.progress * 100}%` }} className="h-full bg-accent/60" />
                        </div>
                        <span className="text-[8px] text-text-secondary font-mono block">Progress: {Math.round(ach.progress * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* XP Levels definitions */}
        {activeSubTab === "challenges-xp" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-[#161B22]">
              <h3 className="text-sm font-bold text-text-primary font-space-grotesk">
                XP & Level Progression Tiers
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Unlock career titles, dashboard frames, and special themes as you climb levels.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-[#161B22] overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-border/80 text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Level Range</th>
                    <th className="py-2.5">Career Badge Title</th>
                    <th className="py-2.5">XP Required / Level</th>
                    <th className="py-2.5">Unlocks & Rewards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-3 font-mono font-bold text-accent">Lvl 1 - 4</td>
                    <td className="py-3 text-text-primary font-space-grotesk">Code Explorer</td>
                    <td className="py-3 font-mono text-text-secondary">200 XP</td>
                    <td className="py-3 text-text-secondary">Default Starter Kit</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono font-bold text-accent">Lvl 5 - 9</td>
                    <td className="py-3 text-text-primary font-space-grotesk">Junior Developer</td>
                    <td className="py-3 font-mono text-text-secondary">1,000 XP</td>
                    <td className="py-3 text-[#3FB950]">Title: "Git Novice"</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono font-bold text-accent">Lvl 10 - 19</td>
                    <td className="py-3 text-text-primary font-space-grotesk">Software Engineer</td>
                    <td className="py-3 font-mono text-text-secondary">2,000 XP</td>
                    <td className="py-3 text-[#bc8cff]">Theme: "Slate Blue"</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono font-bold text-accent">Lvl 20 - 34</td>
                    <td className="py-3 text-text-primary font-space-grotesk">Senior Engineer</td>
                    <td className="py-3 font-mono text-text-secondary">4,000 XP</td>
                    <td className="py-3 text-orange-400">Frame: "Neon Border"</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono font-bold text-accent">Lvl 35 - 49</td>
                    <td className="py-3 text-text-primary font-space-grotesk">Tech Lead</td>
                    <td className="py-3 font-mono text-text-secondary">7,000 XP</td>
                    <td className="py-3 text-[#BC8CFF]">Theme: "Cyberpunk Violet"</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono font-bold text-accent">Lvl 50+</td>
                    <td className="py-3 text-text-primary font-space-grotesk">Architect / Legend</td>
                    <td className="py-3 font-mono text-text-secondary">10,000+ XP</td>
                    <td className="py-3 text-yellow-400">Animated Profile Frames & Gold Badges</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaderboards */}
        {activeSubTab === "challenges-leaderboards" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-2">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">
                  Ecosystem Leaderboard
                </h3>
                <p className="text-xs text-text-secondary">
                  Compete with peer developers globally. Ranked by developer XP and contributions.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-3">
                {leaderboards.global.map((user, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold ${
                      user.isSelf
                        ? "bg-accent/15 border-accent text-white"
                        : "bg-[#0D1117]/80 border-border text-text-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono font-bold text-center">{idx + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-[10px] text-text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-space-grotesk text-text-primary">{user.name}</span>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <span>Lvl {user.level}</span>
                      <span className="text-accent">{user.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar segments */}
            <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4 h-fit">
              <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk border-b border-border pb-2">
                Leaderboard Filters
              </h3>
              
              <div className="space-y-2.5">
                <button className="w-full text-left py-2 px-3 bg-accent text-white rounded-lg text-xs font-bold font-space-grotesk cursor-pointer">
                  🌎 Global Rankings
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-[#0D1117] text-text-secondary hover:text-text-primary border border-border/40 rounded-lg text-xs font-bold font-space-grotesk cursor-pointer">
                  👥 Friends Rankings
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-[#0D1117] text-text-secondary hover:text-text-primary border border-border/40 rounded-lg text-xs font-bold font-space-grotesk cursor-pointer">
                  🏢 Organization / Teams
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Special timed missions */}
        {activeSubTab === "challenges-missions" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-[#161B22]">
              <h3 className="text-sm font-bold text-text-primary font-space-grotesk">
                Special & Timed Events
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Participate in limited time events to earn massive XP multipliers and unique badge items.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-xs font-bold bg-[#D29922]/20 border border-[#D29922]/40 text-[#D29922] px-2 py-0.5 rounded uppercase">Active</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-text-primary font-space-grotesk">Hacktoberfest Celebration</h4>
                  <p className="text-xs text-text-secondary">Open source contribution marathon. Merge 4 pull requests in remote repos.</p>
                </div>
                <div className="flex justify-between items-center text-xs pt-4 border-t border-border/60">
                  <span className="font-mono text-[#D29922] font-bold">+500 XP Reward</span>
                  <span className="text-[10px] text-text-secondary">Ends in 24 Days</span>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-xs font-bold bg-accent/20 border border-accent/40 text-accent px-2 py-0.5 rounded uppercase">Coming Soon</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-text-primary font-space-grotesk">AI & LLM Integration Challenge</h4>
                  <p className="text-xs text-text-secondary">Deploy a repository containing AI orchestration configurations (Langchain/OpenAI).</p>
                </div>
                <div className="flex justify-between items-center text-xs pt-4 border-t border-border/60">
                  <span className="font-mono text-accent font-bold">+300 XP Reward</span>
                  <span className="text-[10px] text-text-secondary">Starts next week</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rewards */}
        {activeSubTab === "challenges-rewards" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-[#161B22]">
              <h3 className="text-sm font-bold text-text-primary font-space-grotesk">
                Unlocked Items & Rewards
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Customize your DevTrack experience with unlocked items, custom titles, borders, and themes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Titles Column */}
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary border-b border-border pb-2">Unlocked Titles</h4>
                <div className="space-y-2">
                  {gameState.unlockedTitles.map((title, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-[#0D1117] border border-border text-xs text-text-primary font-bold font-space-grotesk">
                      <span>{title}</span>
                      <span className="text-[8px] bg-accent/15 text-accent border border-accent/30 px-1 rounded uppercase">Active</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 rounded bg-surface border border-border/40 text-xs text-text-secondary font-bold opacity-60">
                    <span>Git Commander</span>
                    <span className="text-[8px] border border-border px-1 rounded uppercase flex items-center gap-1">
                      <Lock size={8} /> Lvl 15
                    </span>
                  </div>
                </div>
              </div>

              {/* Borders/Frames Column */}
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary border-b border-border pb-2">Profile Frames</h4>
                <div className="space-y-2">
                  {gameState.unlockedFrames.map((frame, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-[#0D1117] border border-border text-xs text-text-primary font-bold font-space-grotesk">
                      <span>{frame}</span>
                      <span className="text-[8px] bg-accent/15 text-accent border border-accent/30 px-1 rounded uppercase">Active</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 rounded bg-surface border border-border/40 text-xs text-text-secondary font-bold opacity-60">
                    <span>Golden Edge</span>
                    <span className="text-[8px] border border-border px-1 rounded uppercase flex items-center gap-1">
                      <Lock size={8} /> Lvl 50
                    </span>
                  </div>
                </div>
              </div>

              {/* Themes Column */}
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary border-b border-border pb-2">Themes</h4>
                <div className="space-y-2">
                  {gameState.unlockedThemes.map((theme, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-[#0D1117] border border-border text-xs text-text-primary font-bold font-space-grotesk">
                      <span>{theme}</span>
                      <span className="text-[8px] bg-accent/15 text-accent border border-accent/30 px-1 rounded uppercase">Active</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-2 rounded bg-surface border border-border/40 text-xs text-text-secondary font-bold opacity-60">
                    <span>Cyberpunk Violet</span>
                    <span className="text-[8px] border border-border px-1 rounded uppercase flex items-center gap-1">
                      <Lock size={8} /> Lvl 35
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History log timeline */}
        {activeSubTab === "challenges-history" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-[#161B22]">
              <h3 className="text-sm font-bold text-text-primary font-space-grotesk">
                Challenges History & Log
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Your past completed challenges, levels, and unlocks.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-[#161B22] relative">
              <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-border/60" />
              
              {gameState.history.length === 0 ? (
                <div className="text-center p-8 text-text-secondary text-xs">
                  No activity history logged yet. Complete challenges and sync your GitHub feed to see records.
                </div>
              ) : (
                <div className="space-y-6 relative">
                  {gameState.history.map((log, i) => (
                    <div key={log.id} className="flex items-start gap-4 text-xs font-semibold pl-1.5 animate-fadeIn">
                      <div className="w-5 h-5 rounded-full bg-accent/25 border border-accent flex items-center justify-center text-[10px] text-accent z-10 font-bold bg-[#161B22]">
                        {log.type === "level" ? "👑" : log.type === "achievement" ? "🏆" : "✓"}
                      </div>
                      <div className="flex-1 bg-[#0D1117]/80 border border-border/60 rounded-xl p-3.5 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-text-primary font-space-grotesk">{log.title}</h4>
                          <span className="text-[10px] text-text-secondary font-mono">{log.date}</span>
                        </div>
                        {log.xpEarned > 0 && (
                          <span className="text-[9px] font-mono text-accent">+ {log.xpEarned} XP Earned</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub Component: Challenges List mapping
interface ChallengeListProps {
  title: string;
  desc: string;
  challenges: Challenge[];
  onManualVerify: (id: string) => void;
}

function ChallengeList({ title, desc, challenges, onManualVerify }: ChallengeListProps) {
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-xl border border-border bg-[#161B22]">
        <h3 className="text-sm font-bold text-text-primary font-space-grotesk">{title}</h3>
        <p className="text-xs text-text-secondary mt-1">{desc}</p>
      </div>

      <div className="space-y-3">
        {challenges.map(chal => {
          const isDone = chal.status === "completed";
          return (
            <div
              key={chal.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isDone
                  ? "bg-[#161B22] border-[#3FB950]/30 opacity-80"
                  : "bg-[#161B22] border-border"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-space-grotesk text-text-primary">{chal.title}</h4>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    chal.difficulty === "Easy"
                      ? "bg-[#3FB950]/10 border-[#3FB950]/20 text-[#3FB950]"
                      : chal.difficulty === "Medium"
                      ? "bg-[#D29922]/10 border-[#D29922]/20 text-[#D29922]"
                      : "bg-[#F85149]/10 border-[#F85149]/20 text-[#F85149]"
                  }`}>
                    {chal.difficulty}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{chal.description}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-mono text-text-secondary">
                    <span>Progress: {Math.round(chal.progress * 100)}%</span>
                  </div>
                  <div className="w-full max-w-sm h-1.5 rounded-full bg-[#0D1117] border border-border overflow-hidden">
                    <div style={{ width: `${chal.progress * 100}%` }} className={`h-full ${isDone ? "bg-[#3FB950]" : "bg-accent"}`} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between md:justify-end">
                <div className="text-right">
                  <span className="text-xs font-bold text-accent block font-mono">+{chal.xpReward} XP</span>
                  <span className="text-[10px] text-text-secondary block font-mono">{chal.timeEst}</span>
                </div>

                {isDone ? (
                  <div className="px-3.5 py-1.5 bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950] font-bold text-[10px] rounded-lg flex items-center gap-1 select-none">
                    <CheckCircle size={12} />
                    <span>COMPLETED</span>
                  </div>
                ) : chal.manualRequired ? (
                  <button
                    onClick={() => onManualVerify(chal.id)}
                    className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary hover:text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Info size={12} className="text-[#D29922]" />
                    <span>Attest Manually</span>
                  </button>
                ) : (
                  <div className="px-3.5 py-1.5 bg-[#0D1117] border border-border text-text-secondary font-bold text-[10px] rounded-lg flex items-center gap-1.5 select-none uppercase tracking-wider">
                    <span>Auto scan</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
