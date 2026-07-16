"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { subscribeToAuthChanges, logOutUser, DevTrackUser } from "@/lib/firebase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import DeveloperBattleModal from "@/components/card/DeveloperBattleModal";
import { InteractiveRobotSpline } from "@/components/blocks/interactive-3d-robot";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Terminal,
  Activity,
  Award,
  Brain,
  Calendar,
  Folder,
  GitCommit,
  GitPullRequest,
  Users,
  Gift,
  Shield,
  Compass,
  Clock,
  ArrowRight,
  Laptop,
  Tablet,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

// Intersection Counter helper component
function CounterUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  return (
    <motion.span
      onViewportEnter={() => {
        if (hasRun) return;
        setHasRun(true);
        let start = 0;
        const end = target;
        const totalDuration = 1200; // ms
        const stepTime = Math.max(10, Math.floor(totalDuration / end));
        const timer = setInterval(() => {
          start += Math.ceil(end / 40);
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setCount(start);
        }, stepTime);
      }}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [searchUsername, setSearchUsername] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const { openAuthModal } = useAuthModal();
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [battleTargetUser, setBattleTargetUser] = useState("");

  // Firebase auth sync
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logOutUser();
    setCurrentUser(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setBattleTargetUser(searchUsername.trim().toLowerCase());
    setBattleModalOpen(true);
  };

  const handleDemoTrigger = () => {
    setBattleTargetUser("demo");
    setBattleModalOpen(true);
  };

  const handleLoginSuccess = (user: DevTrackUser) => {
    setCurrentUser(user);
    router.push(`/dashboard?user=${user.username}`);
  };

  // Stagger container animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/30 selection:text-text-primary overflow-x-hidden font-mono">
      {/* Dynamic Navigation */}
      <Navbar
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onDemoTrigger={handleDemoTrigger}
        onOpenSearch={() => {
          setBattleTargetUser("demo");
          setBattleModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 pt-16">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-6 pb-10 md:pt-8 md:pb-14 flex items-center min-h-[calc(100vh-4rem)]">
          {/* Subtle grid mesh background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-surface)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-surface)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 w-full">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
              {/* Left copy */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 px-3.5 py-1 text-[10px] font-bold text-purple-300 mb-4 uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <Sparkles size={12} className="text-accent animate-pulse" />
                    Instant AI Developer Card Generator + Battle Arena
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display text-text-primary leading-[1.15]">
                    Generate Your <br />
                    <span className="bg-gradient-to-r from-accent via-purple-400 to-diff-add bg-clip-text text-transparent">AI Developer Card.</span>
                  </h1>
                  
                  <p className="mt-3 text-xs sm:text-sm text-text-secondary max-w-lg leading-relaxed font-mono">
                    No login. No signup. No onboarding. Enter your GitHub username to instantly sequence your AI Developer DNA, discover your collectible archetype, and clash head-to-head with friends in the battle arena.
                  </p>
                </motion.div>

                {/* Direct Search Input */}
                <motion.form
                  onSubmit={handleSearch}
                  className="mt-6 max-w-lg w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary text-xs">
                        <span>github.com/</span>
                      </div>
                      <input
                        type="text"
                        placeholder="username (e.g. torvalds)"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        className="w-full pl-28 pr-4 py-3.5 rounded-xl border border-border/80 bg-surface/80 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-xs font-semibold shadow-inner"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent to-purple-600 text-white font-bold text-xs transition-all hover:opacity-95 focus:outline-none flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(59,130,246,0.35)] shrink-0 active:scale-95"
                    >
                      <Sparkles size={15} />
                      <span>Build Your Developer Card</span>
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="mt-2 text-xs text-diff-remove flex items-center gap-1">
                      <AlertCircle size={11} /> {errorMessage}
                    </p>
                  )}
                </motion.form>

                {/* Quick suggest triggers */}
                <motion.div
                  className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-secondary font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <span className="text-[11px]">Or generate instant cards:</span>
                  {["torvalds", "gaearon", "yyx990803", "shadcn", "demo"].map((uname) => (
                    <button
                      key={uname}
                      type="button"
                      onClick={() => {
                        setBattleTargetUser(uname);
                        setBattleModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-md bg-surface border border-border/60 hover:border-accent/60 hover:text-white text-accent font-mono text-[11px] transition-colors cursor-pointer"
                    >
                      @{uname}
                    </button>
                  ))}
                </motion.div>
              </div>

              {/* Right column: Interactive 3D Robot Whobee */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0 h-[380px] sm:h-[460px] lg:h-[500px] w-full">
                <motion.div
                  className="w-full h-full relative"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <InteractiveRobotSpline
                    scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                    className="w-full h-full"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Social Proof */}
        <section className="py-12 border-t border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {[
                { label: "Developers Analysed", value: 12450, suffix: "+" },
                { label: "Repositories Indexed", value: 241080, suffix: "" },
                { label: "Commits Logged", value: 894520, suffix: "+" },
                { label: "Frameworks Detected", value: 48, suffix: "" },
                { label: "DNA Profiles Created", value: 9850, suffix: "" }
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="text-xl md:text-2xl font-bold font-display text-accent">
                    <CounterUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[9px] text-text-secondary uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Features Section (Major Upgrade) */}
        <section id="features" className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Platform Core</span>
              <h2 className="text-3xl font-bold font-display text-text-primary sm:text-4xl">
                Analytics Reimagined for Engineers
              </h2>
              <p className="text-text-secondary text-xs leading-relaxed">
                DevTrack bridges the gap between raw commits and engineering insight. We index repository architectures, and catalog code blueprints.
              </p>
            </div>

            {/* Grid of feature blocks */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                {
                  title: "Developer DNA",
                  icon: Sparkles,
                  color: "text-accent border-accent/20 bg-accent/5",
                  desc: "Calculate engineering personality styles, dimensions, habits, and career compatibility models from push events.",
                  why: "Helps developers discover strengths and match roles."
                },
                {
                  title: "Repo Intelligence",
                  icon: Folder,
                  color: "text-diff-add border-diff-add/20 bg-diff-add/5",
                  desc: "Audits repository metadata, documentation coverage, dependabot security settings, and checklists.",
                  why: "Find which directories need cleanup or licenses."
                },
                {
                  title: "AI Insights",
                  icon: Brain,
                  color: "text-accent border-accent/20 bg-accent/5",
                  desc: "Generates natural language summaries outlining strengths, weaknesses, and custom roadmap milestones.",
                  why: "Translate raw metrics into career growth steps."
                },
                {
                  title: "Time Machine",
                  icon: Clock,
                  color: "text-warning border-warning/20 bg-warning/5",
                  desc: "Interactive commit activity replay showing code velocity milestones, addition sizes, and branch metrics.",
                  why: "Trace product cycles and release momentum."
                },
                {
                  title: "Ecosystem Languages",
                  icon: Compass,
                  color: "text-diff-remove border-diff-remove/20 bg-diff-remove/5",
                  desc: "Extracts language distribution values, computing balance metrics to map stack polyglot profiles.",
                  why: "Shows your technical diversity and stack focus."
                },
                {
                  title: "Coding Calendar",
                  icon: Calendar,
                  color: "text-accent border-accent/20 bg-accent/5",
                  desc: "Animated heatmaps mapping daily contributions, streaks, active hours, and holiday schedules.",
                  why: "Visualize when you write code most consistently."
                },
                {
                  title: "Developer Score",
                  icon: Award,
                  color: "text-warning border-warning/20 bg-warning/5",
                  desc: "Algorithmic score indexing capability across quality, documentation, community, scale, and consistency.",
                  why: "A comprehensive benchmark of codebase standards."
                },
                {
                  title: "GitHub Wrapped",
                  icon: Gift,
                  color: "text-diff-remove border-diff-remove/20 bg-diff-remove/5",
                  desc: "A shareable cinematic recap of your biggest achievements, milestones, top repository, and code percentile.",
                  why: "A gorgeous yearly recap card for socials."
                }
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={childVariants}
                    className="group rounded-xl border border-border bg-surface/30 p-6 flex flex-col justify-between hover:bg-surface/60 hover:border-text-secondary/40 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${feat.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-text-primary font-display uppercase tracking-wider">{feat.title}</h3>
                        <p className="text-[10px] text-text-secondary leading-relaxed font-mono">{feat.desc}</p>
                      </div>
                    </div>
                    <div className="text-[9px] text-text-secondary border-t border-border/40 mt-4 pt-2 font-mono italic">
                      🎯 Why it matters: {feat.why}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 4. Live Product Preview (Interactive Mock Dashboard) */}
        <section className="py-24 border-t border-b border-border/50 bg-background relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-[10px] font-bold text-diff-add uppercase tracking-widest">Interactive Preview</span>
              <h2 className="text-3xl font-bold font-display text-text-primary sm:text-4xl">
                Experience DevTrack in Real-Time
              </h2>
              <p className="text-text-secondary text-xs leading-relaxed">
                Toggle dimensions to simulate dashboard responsive layouts across desktop, tablet, and mobile views.
              </p>

              {/* View toggle tabs */}
              <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface/60 border border-border/60 mt-4">
                {[
                  { id: "desktop", label: "Desktop", icon: Laptop },
                  { id: "tablet", label: "Tablet", icon: Tablet },
                  { id: "mobile", label: "Mobile", icon: Smartphone }
                ].map(dev => {
                  const Icon = dev.icon;
                  const isActive = previewDevice === dev.id;
                  return (
                    <button
                      key={dev.id}
                      onClick={() => setPreviewDevice(dev.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                        isActive ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon size={12} />
                      <span>{dev.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Mock Window Container */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  width: previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "640px" : "320px"
                }}
                className="max-w-4xl w-full border border-border bg-surface/30 rounded-xl shadow-2xl overflow-hidden font-mono text-[10px]"
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[9px] text-text-secondary font-semibold">DevTrack Intelligence Workspace</span>
                  </div>
                  <span className="text-[9px] text-text-secondary">Demo Mode</span>
                </div>

                {/* Dashboard layout */}
                <div className="p-5 space-y-4">
                  {/* Grid blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Health Card */}
                    <div className="rounded-lg border border-border bg-background/60 p-4 space-y-2">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span>Repository Health</span>
                        <Activity size={12} className="text-diff-add" />
                      </div>
                      <div className="text-lg font-bold text-text-primary font-display">S (94/100)</div>
                      <p className="text-[8px] text-text-secondary leading-relaxed">No critical vulnerabilities or licensing warnings detected.</p>
                    </div>

                    {/* Commit activity */}
                    <div className="rounded-lg border border-border bg-background/60 p-4 space-y-2">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span>Coding Streak</span>
                        <TrendingUp size={12} className="text-accent" />
                      </div>
                      <div className="text-lg font-bold text-text-primary font-display">45 Days</div>
                      <p className="text-[8px] text-text-secondary leading-relaxed">Weekly average: 15.3 commits logged across major branches.</p>
                    </div>

                    {/* OS Contributions */}
                    <div className="rounded-lg border border-border bg-background/60 p-4 space-y-2">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span>Open Source Index</span>
                        <GitPullRequest size={12} className="text-accent" />
                      </div>
                      <div className="text-lg font-bold text-text-primary font-display">84 PRs Merged</div>
                      <p className="text-[8px] text-text-secondary leading-relaxed">Active collaborator status mapped globally.</p>
                    </div>
                  </div>

                  {/* Contribution heatmap simulation */}
                  <div className="rounded-lg border border-border bg-background/60 p-4 space-y-3">
                    <span className="text-[9px] text-text-secondary font-bold block uppercase tracking-wider">Contribution Density Timeline</span>
                    <div className="flex flex-wrap gap-1">
                      {[...Array(60)].map((_, idx) => {
                        const colors = ["bg-surface", "bg-diff-add/20", "bg-diff-add/40", "bg-diff-add/70", "bg-diff-add"];
                        // Pick pseudo-random color based on index
                        const colorIdx = (idx * 7 + 13) % colors.length;
                        return (
                          <div key={idx} className={`h-2.5 w-2.5 rounded-sm ${colors[colorIdx]}`} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. Wrapped Section (Redesigned Cinematic Panel) */}
        <section id="wrapped" className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Yearly Retrospective</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold font-display text-text-primary tracking-tight leading-[1.1]">
                Your Entire Year of Coding — <br />
                <span className="bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent">Wrapped.</span>
              </h2>
              <p className="text-text-secondary text-xs max-w-xl mx-auto leading-relaxed mt-2 font-mono">
                Unlock a beautiful cinematic story summarizing your repository highlights, longest coding streak, top languages, and collaborator percentile.
              </p>
            </div>

            {/* Interactive Preview Wrapped Card */}
            <div className="max-w-sm mx-auto rounded-xl border border-border bg-surface p-6 shadow-2xl relative overflow-hidden text-left font-mono border-accent/20">
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent/15 rounded-bl-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-[10px] font-bold text-accent tracking-wider uppercase">DEVTRACK WRAPPED</span>
                <span className="text-[10px] text-text-secondary">2026</span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-[8px] text-text-secondary uppercase tracking-wider">TOP ECOSYSTEM</div>
                  <div className="text-lg font-bold font-display text-text-primary">TypeScript</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[8px] text-text-secondary uppercase tracking-wider">ACTIVE STREAK</div>
                    <div className="text-sm font-bold text-text-primary">45 Days</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-text-secondary uppercase tracking-wider">COMMITS LOGGED</div>
                    <div className="text-sm font-bold text-text-primary">642 Pushes</div>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3 space-y-1">
                  <div className="text-[8px] text-text-secondary uppercase tracking-wider">BIGGEST ACHIEVEMENT</div>
                  <div className="text-xs font-bold text-diff-add">Open Source Maverick</div>
                  <p className="text-[9px] text-text-secondary leading-relaxed">Accumulated 3,000+ stars on original repositories.</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between text-[8px] text-text-secondary">
                <span>DEVTRACK.IO</span>
                <span className="text-diff-add font-bold bg-diff-add/10 border border-diff-add/20 px-1.5 py-0.5 rounded uppercase">TOP 1.8% WORLDWIDE</span>
              </div>
            </div>

            {/* Preview Wrapped Button */}
            <div className="pt-4">
              <button
                onClick={handleDemoTrigger}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-xs font-bold text-white hover:bg-accent/90 transition-all shadow-lg shadow-accent/15 cursor-pointer active:scale-95"
              >
                <span>Preview Your Wrapped</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* 6. Developer Journey Timeline */}
        <section className="py-24 border-t border-border bg-background relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Onboarding Timeline</span>
              <h2 className="text-3xl font-bold font-display text-text-primary sm:text-4xl">
                The Developer Journey
              </h2>
              <p className="text-text-secondary text-xs leading-relaxed">
                See how DevTrack indexes your profile and extracts insights sequentially.
              </p>
            </div>

            {/* Horizontal Timeline */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-6 text-center text-xs font-mono relative">
              {[
                { step: "1", title: "GitHub Login", desc: "OAuth verification" },
                { step: "2", title: "Repo Sync", desc: "Metadata indexing" },
                { step: "3", title: "Analytics", desc: "Streaks calculation" },
                { step: "4", title: "Developer DNA", desc: "Personality model" },
                { step: "5", title: "AI Insights", desc: "Automated roadmaps" },
                { step: "6", title: "Career Match", desc: "Platform index" },
                { step: "7", title: "Wrapped", desc: "Cinematic summaries" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-3 relative group">
                  <div className="h-8 w-8 rounded-full border border-accent bg-background text-accent text-xs font-bold flex items-center justify-center mx-auto z-10 relative">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">{item.title}</div>
                    <p className="text-[9px] text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Call To Action (Premium Backdrop Mesh) */}
        <section className="relative overflow-hidden py-24 bg-gradient-to-r from-surface to-background border-t border-border">
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-text-primary tracking-tight leading-[1.2]">
              Discover the Story Behind Your Code.
            </h2>
            <p className="text-text-secondary text-xs max-w-md mx-auto leading-relaxed font-mono">
              Join thousands of developers grading consistency, scoring repository quality, and reviewing technical growth.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setBattleTargetUser("demo");
                  setBattleModalOpen(true);
                }}
                className="rounded-lg bg-accent px-6 py-3 text-xs font-bold text-white hover:bg-accent/90 transition-all shadow-lg shadow-accent/15 cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Sparkles size={14} />
                <span>Build Developer Card</span>
              </button>
              <button
                onClick={handleDemoTrigger}
                className="rounded-lg border border-border bg-surface/60 px-6 py-3 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface transition-all cursor-pointer active:scale-95"
              >
                View Sandbox Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Flagship Modals */}
      <DeveloperBattleModal
        isOpen={battleModalOpen}
        onClose={() => setBattleModalOpen(false)}
        initialUsername={battleTargetUser}
        isAuthenticated={!!currentUser}
        onRequireAuth={(title, message) => {
          openAuthModal({
            title,
            message,
            onSuccess: handleLoginSuccess
          });
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
