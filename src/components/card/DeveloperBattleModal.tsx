"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserDashboardData } from "@/types";
import { fetchGitHubDashboardData } from "@/lib/github";
import DeveloperCard, { getDeveloperCardInfo } from "./DeveloperCard";
import { 
  Sparkles, 
  Swords, 
  Download, 
  Share2, 
  ArrowRight, 
  X, 
  Check, 
  AlertCircle, 
  Terminal, 
  Trophy, 
  Flame, 
  RefreshCw,
  Search,
  Lock
} from "lucide-react";

interface DeveloperBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername: string;
  isAuthenticated: boolean;
  onRequireAuth: (title: string, message: string, resume: () => void) => void;
}

type ModalState = "loading" | "card" | "battle_input" | "battle_loading" | "battle_result" | "error";

const LOADING_STEPS = [
  "Scanning public GitHub repositories & commits...",
  "Analyzing commit consistency & time distribution...",
  "Evaluating code quality & pull request complexity...",
  "Synthesizing AI Developer DNA & Archetype...",
  "Minting collectible Developer Card..."
];

const BATTLE_STEPS = [
  "Fetching opponent repository matrix...",
  "Parsing opponent contribution streaks & quality...",
  "Simulating head-to-head engineering algorithm battle...",
  "Generating AI comparison verdict..."
];

export default function DeveloperBattleModal({
  isOpen,
  onClose,
  initialUsername,
  isAuthenticated,
  onRequireAuth
}: DeveloperBattleModalProps) {
  const [status, setStatus] = useState<ModalState>("loading");
  const [primaryData, setPrimaryData] = useState<UserDashboardData | null>(null);
  const [opponentData, setOpponentData] = useState<UserDashboardData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [opponentInput, setOpponentInput] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Scroll lock when modal isOpen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Initial loading effect when modal opens or initialUsername changes
  useEffect(() => {
    if (!isOpen || !initialUsername) return;

    let isCancelled = false;
    setStatus("loading");
    setLoadingStepIndex(0);
    setErrorMsg("");

    // Cycle through cinematic loading steps
    const stepInterval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    fetchGitHubDashboardData(initialUsername)
      .then((data) => {
        if (isCancelled) return;
        setPrimaryData(data);
        // Ensure minimum cinematic display time (around 3 seconds)
        setTimeout(() => {
          if (!isCancelled) {
            setStatus("card");
          }
        }, 3000);
      })
      .catch((err) => {
        if (isCancelled) return;
        setErrorMsg(err.message || "Failed to generate card. Please verify the username exists.");
        setStatus("error");
      })
      .finally(() => {
        clearInterval(stepInterval);
      });

    return () => {
      isCancelled = true;
      clearInterval(stepInterval);
    };
  }, [isOpen, initialUsername]);

  const handleStartBattleFetch = async (friendUser: string) => {
    const target = friendUser.trim();
    if (!target) return;

    setStatus("battle_loading");
    setLoadingStepIndex(0);
    setErrorMsg("");

    const battleInterval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < BATTLE_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 550);

    try {
      const data = await fetchGitHubDashboardData(target);
      setOpponentData(data);
      setTimeout(() => {
        setStatus("battle_result");
      }, 2400);
    } catch (err: any) {
      setErrorMsg(err.message || `Could not fetch data for @${target}. Make sure they are a valid GitHub user.`);
      setStatus("error");
    } finally {
      clearInterval(battleInterval);
    }
  };

  const exportCardPNG = (username: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0D1117";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#6366F1";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("DevTrack 2.0 Identity Card", 40, 50);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`Developer: @${username}`, 40, 100);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "14px sans-serif";
      ctx.fillText("Verified DevTrack Score & Profile Card", 40, 130);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `devtrack_card_${username}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
  };

  const shareCard = (username: string) => {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert(`DevTrack profile URL copied to clipboard: ${shareUrl}`);
    } else {
      alert(`DevTrack profile URL: ${shareUrl}`);
    }
  };

  const handleLockedAction = (
    actionTitle: string,
    actionMessage: string,
    callback?: () => void
  ) => {
    if (!isAuthenticated) {
      onRequireAuth(actionTitle, actionMessage, () => {
        if (callback) callback();
        else alert("Feature activated! Preparing your high-resolution asset...");
      });
    } else if (callback) {
      callback();
    } else {
      alert("Feature activated! Preparing your high-resolution asset...");
    }
  };

  if (!mounted || !isOpen) return null;

  // Helper for AI Verdict calculation
  const getBattleVerdict = () => {
    if (!primaryData || !opponentData) return "";
    const p = getDeveloperCardInfo(primaryData);
    const o = getDeveloperCardInfo(opponentData);

    if (p.score > o.score) {
      return `🏆 VERDICT: @${p.username} (${p.archetype}) outclasses @${o.username} (${o.archetype}) by ${p.score - o.score} points! With higher overall metrics and ${(p.stars ?? p.totalStars ?? 0).toLocaleString()} total stars, @${p.username} claims total victory in this coding clash.`;
    } else if (o.score > p.score) {
      return `👑 VERDICT: @${o.username} (${o.archetype}) takes the crown! Outscoring @${p.username} by ${o.score - p.score} points with elite ${o.topLanguage} craftsmanship and Level ${o.level} stats.`;
    } else {
      return `⚡ VERDICT: DEAD HEAT TIE! Both @${p.username} and @${o.username} stand equal at ${p.score}/100. True kindred spirits of the engineering arena!`;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono">
      {/* Dark Blur Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#000000]/80 backdrop-blur-xl z-[9991]"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 30 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[9992] w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[32px] border border-white/15 bg-[#0D1117]/95 p-5 sm:p-8 shadow-[0_25px_100px_rgba(0,0,0,0.85)] text-text-primary"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-2 rounded-full bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {/* STATE 1: CINEMATIC LOADING SEQUENCE */}
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
            >
              <div className="relative mb-8">
                <div className="h-20 w-20 rounded-full border-2 border-accent/20 border-t-accent animate-spin flex items-center justify-center" />
                <Terminal size={32} className="text-accent absolute inset-0 m-auto animate-pulse" />
              </div>

              <span className="text-[11px] font-bold tracking-widest text-accent uppercase font-space-grotesk mb-2">
                DEVTRACK AI SYSTEM SCAN
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-space-grotesk text-white mb-6 min-h-[3.5rem] flex items-center justify-center">
                {LOADING_STEPS[loadingStepIndex]}
              </h3>

              {/* Progress Bar */}
              <div className="w-full bg-[#161B22] rounded-full h-2 overflow-hidden border border-border/60">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent via-purple-500 to-[#3FB950]"
                  initial={{ width: "10%" }}
                  animate={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-text-secondary mt-3">
                Step {loadingStepIndex + 1} of {LOADING_STEPS.length}
              </p>
            </motion.div>
          )}

          {/* STATE 2: SINGLE CARD DISPLAY */}
          {status === "card" && primaryData && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4"
            >
              {/* Left: The Collectible Card */}
              <div className="flex-1 flex justify-center w-full max-w-[400px]">
                <DeveloperCard data={getDeveloperCardInfo(primaryData)} />
              </div>

              {/* Right: Action Controls & Battle Launcher */}
              <div className="flex-1 flex flex-col justify-center max-w-lg w-full space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold mb-3">
                    <Sparkles size={14} />
                    <span>Card Minted Successfully</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-space-grotesk text-white tracking-tight">
                    Your Developer Identity
                  </h2>
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                    We synthesized your public commits, language distribution, and repo quality into a collectible AI trading card.
                  </p>
                </div>

                {/* Primary CTA: Battle a Friend */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/30 via-accent/15 to-[#161B22] border border-purple-500/40 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                      <Swords size={22} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-space-grotesk text-white">
                        Friend Battle Arena
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Compare cards side-by-side with any developer
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStatus("battle_input")}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-accent text-white font-bold font-space-grotesk text-sm hover:opacity-95 shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Battle a Friend Now</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Locked / Premium Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleLockedAction(
                      "Download High-Resolution Card",
                      "Sign in with GitHub to export your collectible card PNG, customize holographic borders, and unlock dark/light themes.",
                      () => exportCardPNG(primaryData?.profile?.login || initialUsername)
                    )}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#161B22] border border-border/60 hover:border-accent/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download size={17} className="text-accent" />
                      <span className="text-xs font-semibold text-white">Download (PNG)</span>
                    </div>
                    {!isAuthenticated && <Lock size={14} className="text-text-secondary group-hover:text-accent transition-colors" />}
                  </button>

                  <button
                    onClick={() => handleLockedAction(
                      "Share to X & LinkedIn",
                      "Sign in with GitHub to generate your custom public share card URL and showcase your badge to recruiters.",
                      () => shareCard(primaryData?.profile?.login || initialUsername)
                    )}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#161B22] border border-border/60 hover:border-accent/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Share2 size={17} className="text-cyan-400" />
                      <span className="text-xs font-semibold text-white">Share Card</span>
                    </div>
                    {!isAuthenticated && <Lock size={14} className="text-text-secondary group-hover:text-cyan-400 transition-colors" />}
                  </button>
                </div>

                <button
                  onClick={() => handleLockedAction(
                    "Sequence Full Developer DNA",
                    "Sign in to access your comprehensive repository diagnostics, 12-month consistency heatmap, and AI career recommendations.",
                    () => { if (typeof window !== "undefined") window.location.href = "/ai"; }
                  )}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold font-space-grotesk text-white transition-all flex items-center justify-center gap-2"
                >
                  <span>Sequence Full DNA Dashboard</span>
                  {!isAuthenticated && <Lock size={13} className="text-text-secondary" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 3: BATTLE INPUT & MATCHMAKING */}
          {status === "battle_input" && (
            <motion.div
              key="battle_input"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="py-10 max-w-xl mx-auto text-center"
            >
              <div className="inline-flex p-3 rounded-2xl bg-purple-500/20 text-purple-300 mb-4">
                <Swords size={32} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-space-grotesk text-white">
                Who Do You Want to Battle?
              </h2>
              <p className="text-sm text-text-secondary mt-2 mb-8">
                Enter any GitHub username to initiate a head-to-head algorithm comparison against <span className="text-accent font-bold">@{primaryData?.profile.login}</span>.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStartBattleFetch(opponentInput);
                }}
                className="flex flex-col sm:flex-row gap-3 mb-6"
              >
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Enter opponent GitHub username (e.g., torvalds)"
                    value={opponentInput}
                    onChange={(e) => setOpponentInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#161B22] border border-border/80 text-white placeholder-text-secondary/60 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!opponentInput.trim()}
                  className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-accent text-white font-bold font-space-grotesk text-sm hover:opacity-95 disabled:opacity-50 transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <Swords size={18} />
                  <span>Initiate Battle</span>
                </button>
              </form>

              {/* Quick suggest chips */}
              <div className="text-left">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2.5">
                  Or pick a legendary developer:
                </span>
                <div className="flex flex-wrap gap-2">
                  {["torvalds", "gaearon", "yyx990803", "shadcn", "sindresorhus"].map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => {
                        setOpponentInput(target);
                        handleStartBattleFetch(target);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#161B22] border border-border/60 hover:border-purple-500/60 hover:bg-purple-500/10 text-xs text-text-secondary hover:text-white transition-colors"
                    >
                      @{target}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-border/40 flex justify-between items-center">
                <button
                  onClick={() => setStatus("card")}
                  className="text-xs text-text-secondary hover:text-white transition-colors"
                >
                  ← Back to my card
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 4: BATTLE LOADING SEQUENCE */}
          {status === "battle_loading" && (
            <motion.div
              key="battle_loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto"
            >
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin flex items-center justify-center" />
                <Swords size={36} className="text-purple-400 absolute inset-0 m-auto animate-bounce" />
              </div>

              <span className="text-[11px] font-bold tracking-widest text-purple-400 uppercase font-space-grotesk mb-2">
                ARENA SIMULATION IN PROGRESS
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-space-grotesk text-white mb-6 min-h-[3.5rem] flex items-center justify-center">
                {BATTLE_STEPS[loadingStepIndex]}
              </h3>

              <div className="w-full bg-[#161B22] rounded-full h-2 overflow-hidden border border-border/60">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"
                  initial={{ width: "10%" }}
                  animate={{ width: `${((loadingStepIndex + 1) / BATTLE_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          )}

          {/* STATE 5: HEAD-TO-HEAD BATTLE RESULT */}
          {status === "battle_result" && primaryData && opponentData && (
            <motion.div
              key="battle_result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-4 space-y-8"
            >
              {/* Top Banner: Verdict */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#161B22] to-indigo-950/60 border border-purple-500/40 shadow-2xl text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2">
                  <Trophy size={14} className="text-amber-400" />
                  <span>OFFICIAL DEVTRACK BATTLE RESULT</span>
                </div>
                <p className="text-sm sm:text-base font-semibold font-space-grotesk text-white max-w-3xl mx-auto leading-relaxed">
                  {getBattleVerdict()}
                </p>
              </div>

              {/* Two Side-By-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center relative">
                {/* VS Badge in center */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 items-center justify-center font-extrabold text-white text-lg shadow-[0_0_30px_rgba(236,72,153,0.6)] border-2 border-white/20">
                  VS
                </div>

                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3 block">
                    CHALLENGER (YOU)
                  </span>
                  <DeveloperCard data={getDeveloperCardInfo(primaryData)} />
                </div>

                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 block">
                    OPPONENT
                  </span>
                  <DeveloperCard data={getDeveloperCardInfo(opponentData)} />
                </div>
              </div>

              {/* Head-to-Head Comparison Table */}
              <div className="rounded-2xl border border-border/60 bg-[#161B22]/80 overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                  <h4 className="text-sm font-bold font-space-grotesk text-white">
                    Metric Comparison Matrix
                  </h4>
                  <span className="text-xs text-text-secondary">Direct Algorithm Analysis</span>
                </div>

                {(() => {
                  const pInfo = getDeveloperCardInfo(primaryData);
                  const oInfo = getDeveloperCardInfo(opponentData);

                  const pLevel = pInfo.level ?? 1;
                  const oLevel = oInfo.level ?? 1;
                  const pStars = pInfo.totalStars || pInfo.stars || 0;
                  const oStars = oInfo.totalStars || oInfo.stars || 0;
                  const pRepos = pInfo.publicRepos || 0;
                  const oRepos = oInfo.publicRepos || 0;
                  const pFollowers = pInfo.followers || 0;
                  const oFollowers = oInfo.followers || 0;

                  const metrics = [
                    { label: "Overall Score", p: `${pInfo.score}/100`, o: `${oInfo.score}/100`, pWin: pInfo.score > oInfo.score, oWin: oInfo.score > pInfo.score },
                    { label: "Developer Level", p: `LVL ${pLevel}`, o: `LVL ${oLevel}`, pWin: pLevel > oLevel, oWin: oLevel > pLevel },
                    { label: "Repositories", p: pRepos, o: oRepos, pWin: pRepos > oRepos, oWin: oRepos > pRepos },
                    { label: "Total Stars Earned", p: pStars.toLocaleString(), o: oStars.toLocaleString(), pWin: pStars > oStars, oWin: oStars > pStars },
                    { label: "Followers Network", p: pFollowers.toLocaleString(), o: oFollowers.toLocaleString(), pWin: pFollowers > oFollowers, oWin: oFollowers > pFollowers },
                    { label: "Top Stack", p: pInfo.topLanguage || "TypeScript", o: oInfo.topLanguage || "TypeScript", pWin: false, oWin: false }
                  ];

                  return (
                    <div className="divide-y divide-border/30">
                      {metrics.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 px-5 py-3 text-xs sm:text-sm items-center">
                          <div className={`font-semibold ${row.pWin ? "text-[#3FB950] font-bold" : "text-text-primary"}`}>
                            {row.p} {row.pWin && "★"}
                          </div>
                          <div className="text-center font-bold text-text-secondary uppercase tracking-wider text-[11px]">
                            {row.label}
                          </div>
                          <div className={`text-right font-semibold ${row.oWin ? "text-purple-400 font-bold" : "text-text-primary"}`}>
                            {row.oWin && "★ "} {row.o}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => setStatus("battle_input")}
                  className="py-3 px-6 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 font-bold font-space-grotesk text-sm transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span>Challenge Another Friend</span>
                </button>

                <button
                  onClick={() => handleLockedAction(
                    "Save & Download Battle Report",
                    "Sign in with GitHub to save this battle to your leaderboard history and export a head-to-head graphic."
                  )}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-accent to-purple-600 text-white font-bold font-space-grotesk text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>Download Battle Report</span>
                  {!isAuthenticated && <Lock size={14} className="opacity-80" />}
                </button>

                <button
                  onClick={() => setStatus("card")}
                  className="py-3 px-6 rounded-xl bg-[#161B22] border border-border/60 hover:bg-white/5 text-text-secondary hover:text-white font-bold font-space-grotesk text-sm transition-all"
                >
                  Return to Single Card
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 6: ERROR */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center max-w-md mx-auto"
            >
              <div className="inline-flex p-3 rounded-full bg-danger/15 text-danger mb-4">
                <AlertCircle size={36} />
              </div>
              <h3 className="text-xl font-bold font-space-grotesk text-white">
                Scan Interrupted
              </h3>
              <p className="text-sm text-text-secondary mt-2 mb-6">
                {errorMsg || "Could not complete the analysis. Make sure the GitHub username exists and is publicly accessible."}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStatus("loading")}
                  className="py-2.5 px-5 rounded-xl bg-accent text-white font-bold text-sm"
                >
                  Retry Scan
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-5 rounded-xl bg-[#161B22] border border-border text-text-secondary text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    document.body
  );
}
