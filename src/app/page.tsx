"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { subscribeToAuthChanges, logOutUser, DevTrackUser } from "@/lib/firebase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [searchUsername, setSearchUsername] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to Firebase Auth
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
    setIsSearching(true);
    setErrorMessage(null);
    
    // Redirect to dashboard with the query parameter
    router.push(`/dashboard?user=${encodeURIComponent(searchUsername.trim().toLowerCase())}`);
  };

  const handleDemoTrigger = () => {
    router.push("/dashboard?user=demo");
  };

  const handleLoginSuccess = (user: DevTrackUser) => {
    setCurrentUser(user);
    // Redirect to their logged-in dashboard profile
    router.push(`/dashboard?user=${user.username}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/30 selection:text-text-primary">
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onDemoTrigger={handleDemoTrigger}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
              {/* Left Column: CTAs and Copy */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-accent mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    v1.0 Developer Analytics
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-space-grotesk text-text-primary leading-[1.1]">
                    Understand Your <br className="hidden sm:inline" />
                    <span className="text-accent">Developer Journey.</span>
                  </h1>
                  
                  <p className="mt-4 text-base sm:text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed">
                    DevTrack analyzes GitHub activity and transforms it into actionable developer intelligence. Grade consistency, score repositories, and outline roadmaps.
                  </p>
                </motion.div>

                {/* Direct Search Input */}
                <motion.form
                  onSubmit={handleSearch}
                  className="mt-8 max-w-lg"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                        <span className="text-sm font-semibold">github.com/</span>
                      </div>
                      <input
                        type="text"
                        placeholder="username"
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        className="w-full pl-28 pr-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none transition-all text-sm font-semibold"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-6 py-3 rounded-lg bg-primary hover:bg-success text-white font-semibold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSearching ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze Profile</span>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="mt-2 text-xs text-danger">{errorMessage}</p>
                  )}
                </motion.form>

                {/* Sub CTA Links */}
                <motion.div
                  className="mt-4 flex items-center gap-4 text-xs text-text-secondary font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span>Or explore:</span>
                  <button onClick={handleDemoTrigger} className="text-accent hover:underline font-semibold text-left">
                    View gaearon (React)
                  </button>
                  <span>•</span>
                  <button onClick={handleDemoTrigger} className="text-accent hover:underline font-semibold text-left">
                    View torvalds (Linux)
                  </button>
                </motion.div>
              </div>

              {/* Right Column: Premium Technical Dashboard Mockup */}
              <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                <motion.div
                  className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Window Bar */}
                  <div className="flex items-center justify-between border-b border-border bg-surface-secondary px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-danger/70" />
                      <div className="h-3 w-3 rounded-full bg-warning/70" />
                      <div className="h-3 w-3 rounded-full bg-success/70" />
                    </div>
                    <div className="text-xs text-text-secondary font-mono">devtrack.io/dashboard</div>
                    <div className="w-12" />
                  </div>

                  {/* Window Content */}
                  <div className="p-5 font-mono text-xs leading-relaxed space-y-4 text-text-secondary">
                    {/* Mock Header Info */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#3178c6] flex items-center justify-center text-text-primary text-[10px] font-bold">
                          TS
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">alex-developer</div>
                          <div className="text-[10px]">Active Developer</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-text-secondary">Developer Score</div>
                        <div className="text-sm font-bold text-success font-space-grotesk">92/100</div>
                      </div>
                    </div>

                    {/* Score Breakdown Row */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="rounded border border-border/40 bg-background/50 p-2">
                        <span className="text-text-primary">Consistency:</span> 18/20
                      </div>
                      <div className="rounded border border-border/40 bg-background/50 p-2">
                        <span className="text-text-primary">Repo Quality:</span> 19/20
                      </div>
                      <div className="rounded border border-border/40 bg-background/50 p-2">
                        <span className="text-text-primary">Open Source:</span> 19/20
                      </div>
                      <div className="rounded border border-border/40 bg-background/50 p-2">
                        <span className="text-text-primary">Complexity:</span> 19/20
                      </div>
                    </div>

                    {/* Terminal Activity */}
                    <div className="bg-[#090D12] rounded p-3 text-[10px] border border-border/60 overflow-hidden relative">
                      <div className="text-success">$ devtrack-ai-insight generate</div>
                      <div className="text-text-primary mt-1">Analyzing repository architectures...</div>
                      <div className="text-text-secondary mt-1">
                        &gt; Primary language: TypeScript (82%)<br />
                        &gt; Detected framework: Next.js 15 App Router<br />
                        &gt; Core strength: High documentation index (100% desc)
                      </div>
                      <div className="text-accent mt-1">✓ AI Career Recommendation: Fullstack Web Architect</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Core Features Section */}
        <section id="features" className="py-20 border-t border-border bg-[#0a0e14]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold font-space-grotesk text-text-primary sm:text-4xl">
                Analytics Tailored for Engineering Excellence
              </h2>
              <p className="mt-4 text-text-secondary text-sm sm:text-base">
                We compute raw repository histories, language structures, and pull request data, delivering a transparent diagnostic.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
                <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-primary font-space-grotesk">Coding Consistency</h3>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed flex-1">
                  Grade commit regularity and streak habits instead of simple lines of code. Understand coding momentum.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-primary font-space-grotesk">Repository Quality</h3>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed flex-1">
                  Evaluate descriptions, documentation index, star thresholds, and issue resolutions. Reward well-documented projects.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
                <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-primary font-space-grotesk">Technical Diversity</h3>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed flex-1">
                  Grade codebases across technologies, calculating ecosystem depth and specialization indices.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
                <div className="h-10 w-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center mb-4">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-text-primary font-space-grotesk">Open Source Impact</h3>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed flex-1">
                  Synthesize external contributions, pull request merges, forks, and issues. Discover developer collaboration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Developer Score Engine Info Section */}
        <section id="score-engine" className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6 flex flex-col justify-center text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                  Score Architecture
                </span>
                <h2 className="text-3xl font-bold font-space-grotesk text-text-primary sm:text-4xl">
                  The Dev-Track Index (0-100)
                </h2>
                <p className="mt-4 text-sm text-text-secondary leading-relaxed">
                  Most platforms count simple stars. We built an algorithmic index mapping developer codebases across five distinct dimensions, evaluating overall capability.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex gap-3">
                    <span className="text-success font-semibold font-mono text-sm">01</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Logarithmic Stars Grading</h4>
                      <p className="text-xs text-text-secondary mt-1">Calculates averaged stargazers on logarithmic curves, prevent outlier distortion.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-success font-semibold font-mono text-sm">02</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Ecosystem Entropy</h4>
                      <p className="text-xs text-text-secondary mt-1">Measures language diversity ratios via balance algorithms, distinguishing generalists from specialists.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-success font-semibold font-mono text-sm">03</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Complexity Verification</h4>
                      <p className="text-xs text-text-secondary mt-1">Synthesizes file sizes and build configs to verify source project scope vs simple scripts.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Mathematical visual table */}
              <div className="lg:col-span-6">
                <div className="rounded-xl border border-border bg-surface p-6 font-mono text-xs text-text-secondary">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3 font-semibold text-text-primary">
                    <span>DIMENSION</span>
                    <span>WEIGHT</span>
                    <span>METRIC DETAILS</span>
                  </div>

                  <div className="divide-y divide-border/50">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-text-primary font-semibold">Consistency</span>
                      <span>20%</span>
                      <span>Commit days + consecutive streak</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-text-primary font-semibold">Repo Quality</span>
                      <span>20%</span>
                      <span>Documentation index + stars</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-text-primary font-semibold">Diversity</span>
                      <span>20%</span>
                      <span>Unique language count + entropy</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-text-primary font-semibold">Open Source</span>
                      <span>20%</span>
                      <span>Fork count + public merges</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-text-primary font-semibold">Complexity</span>
                      <span>20%</span>
                      <span>Code volume + config density</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded bg-background/50 p-3 text-[10px] leading-relaxed">
                    <span className="text-accent font-semibold">Algorithm Note:</span> A score of 70+ indicates professional repository standards. A score of 90+ puts the profile in the top 3% of global developers.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. GitHub Wrapped & Final CTA */}
        <section id="wrapped" className="py-20 border-t border-border bg-[#0a0e14] relative">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Yearly Reports
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-space-grotesk text-text-primary mt-2">
              GitHub Wrapped 2026
            </h2>
            <p className="mt-4 text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
              Unlock a shareable, premium report summarizing your primary language, longest coding streak, major achievements, and contributor percentile.
            </p>

            {/* Simulated Wrapped Card */}
            <div className="mt-10 max-w-sm mx-auto rounded-xl border border-border bg-[#121820] p-6 shadow-2xl relative overflow-hidden text-left font-mono">
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent/10 rounded-bl-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold text-accent">DEVTRACK WRAPPED</span>
                <span className="text-xs text-text-secondary">2026</span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-[10px] text-text-secondary uppercase">TOP ECOSYSTEM</div>
                  <div className="text-base font-bold font-space-grotesk text-text-primary">TypeScript</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-text-secondary uppercase">ACTIVE STREAK</div>
                    <div className="text-sm font-bold text-text-primary">45 Days</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-secondary uppercase">COMMITS</div>
                    <div className="text-sm font-bold text-text-primary">642 Pushes</div>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3">
                  <div className="text-[10px] text-text-secondary uppercase">BIGGEST ACHIEVEMENT</div>
                  <div className="text-xs font-bold text-success mt-0.5">Open Source Maverick</div>
                  <p className="text-[10px] text-text-secondary mt-1">Accumulated 3,000+ stars on original source repositories.</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between text-[9px] text-text-secondary">
                <span>DEVTRACK.IO</span>
                <span className="text-success font-semibold">TOP 1.8% WORLDWIDE</span>
              </div>
            </div>

            {/* Bottom Form */}
            <div className="mt-16 max-w-md mx-auto">
              <h3 className="text-lg font-bold font-space-grotesk text-text-primary">
                Analyze your footprint instantly
              </h3>
              <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter GitHub Username"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 text-xs font-semibold focus:border-accent focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-lg bg-primary hover:bg-success text-white font-semibold text-xs transition-all disabled:opacity-50"
                >
                  {isSearching ? "Processing..." : "Generate Analysis"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
