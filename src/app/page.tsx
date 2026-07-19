'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { CardGenerator } from '@/components/card/CardGenerator';
import { HeroIllustration } from '@/components/blocks/HeroIllustration';
import { AuthModal } from '@/components/auth/AuthModal';
import { signInWithGitHub } from '@/lib/firebase';
import { 
  Sparkles, 
  Terminal, 
  Share2, 
  Award, 
  Globe, 
  ArrowRight,
  Cpu,
  Lock,
  Eye,
  Columns,
  CheckCircle2
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authActionTitle, setAuthActionTitle] = useState('Sign in to Continue');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingResume, setPendingResume] = useState<(() => void) | null>(null);

  useEffect(() => {
    // If authenticated, redirect immediately to /feed and do not render marketing landing
    const stored = localStorage.getItem('devtrack_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        router.replace('/feed');
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, [router]);

  const handleRequireAuth = (actionTitle: string, actionMessage?: string, resume?: () => void) => {
    setAuthActionTitle(`Sign in to ${actionTitle}`);
    if (resume) {
      setPendingResume(() => resume);
    } else {
      setPendingResume(null);
    }
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAuthOpen(false);
    if (pendingResume) {
      pendingResume();
      setPendingResume(null);
    }
    router.push('/feed');
  };

  const handleContinueWithGitHub = async () => {
    setIsLoggingIn(true);
    try {
      const user = await signInWithGitHub();
      if (user) {
        handleLoginSuccess();
      }
    } catch (err: any) {
      console.error('GitHub Auth error:', err);
      setIsAuthOpen(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span>Redirecting to your DevTrack feed...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sticky Glass Navbar */}
      <Navbar />

      <main className="relative overflow-hidden pt-8 pb-20">
        {/* Background Ambient Radial Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-cyan-500/10 blur-[140px]" />

        {/* Hero Container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Trust Banner Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>DevTrack 2.0 — Public Developer Identity Platform</span>
            </div>
          </motion.div>

          {/* Main Hero 2-Column Grid */}
          <div className="mt-8 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Section (Headline, Description, Primary Dual CTAs) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Build your professional{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  developer identity.
                </span>
              </h1>

              <p className="text-base text-slate-200 sm:text-lg max-w-2xl leading-relaxed">
                GitHub stores your code. DevTrack showcases <strong className="text-white font-semibold">you</strong>. Transform raw commits, repositories, and pull requests into your verified, AI-powered professional identity.
              </p>

              {/* Primary Dual CTA Bar (Card Generator as Primary, GitHub as Secondary) */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <a
                  href="#card-generator"
                  className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <Terminal className="h-5 w-5" />
                  <span>Generate Card (No Login)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  onClick={handleContinueWithGitHub}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/80 px-5 py-4 text-sm font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <GithubIcon className="h-5 w-5" />
                  <span>{isLoggingIn ? 'Connecting...' : 'Continue with GitHub'}</span>
                </button>
              </div>

              {/* Instant Developer Card Generator Widget */}
              <div id="card-generator" className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <Terminal className="h-4 w-4" />
                    <span>Instant Developer Card Generator</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Instant preview — no signup required
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Lock className="h-3.5 w-3.5" /> Sign in with GitHub to save, download & share
                    </span>
                  </div>
                </div>

                <CardGenerator onRequireAuth={handleRequireAuth} />
              </div>
            </motion.div>

            {/* Right Section (Visual Illustration) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <HeroIllustration />
            </motion.div>
          </div>

          {/* How It Works 3-Step Section */}
          <div className="mt-28 border-t border-white/10 pt-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl font-bold sm:text-3xl text-white">
                How DevTrack Works
              </h2>
              <p className="text-sm text-slate-400">
                Transform your version control footprint into a verified developer identity in three simple steps.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold text-sm mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">Enter Username or Connect</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Start instantly by typing any public GitHub username for a zero-signup card preview, or sign in to sync your profile.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 font-extrabold text-sm mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">AI Analyzes Activity</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Our scoring engine evaluates repository quality, commit cadence, language diversity, and open-source impact.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-extrabold text-sm mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Get Verified Identity</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Mint your collectible Developer Card, track your Developer Score, and showcase your achievements to peers.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div id="features" className="mt-24 border-t border-white/10 pt-16 scroll-mt-20">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl font-bold sm:text-3xl text-white">
                The Professional Network for Developers
              </h2>
              <p className="text-sm text-slate-400">
                Everything you need to turn raw code into a recognized developer career asset.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Developer Card & Score</h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Algorithmic scoring based on code quality, commit consistency, and open-source impact.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5">
                  <span className="text-xs font-semibold text-indigo-400">Verified Scoring →</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-4">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Developer DNA</h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Deep intelligence identifying your architectural archetype, security audits, and ATS resume metrics.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5">
                  <span className="text-xs font-semibold text-purple-400">AI Intelligence →</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 mb-4">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Developer Social Feed</h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Share project launches, repository milestones, code snippets, and technical articles with global peers.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5">
                  <span className="text-xs font-semibold text-cyan-400">Social Stream →</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Export & Showcase</h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Download PNG & PDF cards or share interactive links on your resume, portfolio, and LinkedIn.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5">
                  <span className="text-xs font-semibold text-emerald-400">Export Cards →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA Band */}
          <div className="mt-24 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-8 sm:p-12 text-center backdrop-blur-xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Claim Your Developer Identity?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of developers showcase raw commits, build verified scores, and feature collectible profile cards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href="#card-generator"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Terminal className="h-4 w-4" />
                <span>Generate Card (No Login)</span>
              </a>
              <button
                onClick={handleContinueWithGitHub}
                disabled={isLoggingIn}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-6 py-3.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <GithubIcon className="h-4 w-4" />
                <span>{isLoggingIn ? 'Connecting...' : 'Continue with GitHub'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <span className="font-bold text-white">DevTrack 2.0</span>
              <span className="text-slate-600">|</span>
              <span>The Professional Developer Network</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/feed" className="hover:text-white transition-colors">Feed</a>
              <a href="/projects" className="hover:text-white transition-colors">Projects</a>
              <a href="/community" className="hover:text-white transition-colors">Community</a>
              <a href="/ai" className="hover:text-white transition-colors">AI Suite</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
          <div className="text-center sm:text-left text-[11px] text-slate-500">
            © {new Date().getFullYear()} DevTrack 2.0. Built for software engineers worldwide.
          </div>
        </div>
      </footer>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
        actionTitle={authActionTitle}
      />
    </div>
  );
}

