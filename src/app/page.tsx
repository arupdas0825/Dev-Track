'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { AuthModal } from '@/components/auth/AuthModal';
import { signInWithGitHub } from '@/lib/firebase';
import { 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  X, 
  Lock,
  AlertCircle
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { DeveloperCard, DeveloperCardData } from '@/components/card/DeveloperCard';
import { GitHubCardService } from '@/services/github/github-card.service';
import {
  AuthTabs,
} from '@/components/blocks/modern-animated-sign-in';
import DevTrackRobotDisplay from '@/components/ui/RobotDisplay';

const SAMPLE_PROFILES: Record<string, DeveloperCardData> = {
  torvalds: {
    username: 'torvalds',
    name: 'Linus Torvalds',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    bio: 'Creator of Linux and Git. Systems Architect & Kernel Master.',
    publicRepos: 7,
    followers: 215000,
    totalStars: 185000,
    stars: 185000,
    totalCommits: 14200,
    score: 998,
    rankTitle: 'Grand Architect',
    archetype: 'System Kernel Creator',
    topLanguages: [
      { name: 'C', percent: 85, color: '#555555' },
      { name: 'Assembly', percent: 10, color: '#6E4C13' },
      { name: 'Shell', percent: 5, color: '#89E051' },
    ],
    contributions: [15, 22, 18, 25, 30, 28, 40, 32, 19, 24, 35, 42, 29, 31],
  },
  gaearon: {
    username: 'gaearon',
    name: 'Dan Abramov',
    avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
    bio: 'Co-created Redux & Create React App. Building developer experiences.',
    publicRepos: 265,
    followers: 84000,
    totalStars: 120000,
    stars: 120000,
    totalCommits: 8900,
    score: 945,
    rankTitle: 'Principal Frontend Architect',
    archetype: 'UI & State Pioneer',
    topLanguages: [
      { name: 'JavaScript', percent: 60, color: '#F7DF1E' },
      { name: 'TypeScript', percent: 35, color: '#3178C6' },
      { name: 'HTML', percent: 5, color: '#E34F26' },
    ],
    contributions: [8, 12, 15, 10, 22, 18, 14, 25, 20, 16, 28, 19, 22, 30],
  },
  shadcn: {
    username: 'shadcn',
    name: 'shadcn',
    avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
    bio: 'Designing and building open source UI components. Re-usable design systems.',
    publicRepos: 92,
    followers: 67000,
    totalStars: 98000,
    stars: 98000,
    totalCommits: 6400,
    score: 962,
    rankTitle: 'Design System Master',
    archetype: 'UI Engineering Lead',
    topLanguages: [
      { name: 'TypeScript', percent: 70, color: '#3178C6' },
      { name: 'React', percent: 20, color: '#61DAFB' },
      { name: 'Tailwind', percent: 10, color: '#06B6D4' },
    ],
    contributions: [12, 18, 24, 29, 35, 22, 19, 31, 28, 40, 32, 26, 38, 45],
  },
};

interface OrbitIcon {
  component: () => ReactNode;
  className: string;
  duration?: number;
  delay?: number;
  angle?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
}

const iconsArray: OrbitIcon[] = [
  // Ring 1 (Radius 80px) - Inner Orbit
  {
    component: () => (
      <img
        width={30}
        height={30}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg'
        alt='HTML5'
      />
    ),
    className: 'size-[30px] border-none bg-transparent',
    duration: 22,
    angle: 0,
    radius: 80,
    path: true,
  },
  {
    component: () => (
      <img
        width={30}
        height={30}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg'
        alt='CSS3'
      />
    ),
    className: 'size-[30px] border-none bg-transparent',
    duration: 22,
    angle: 180,
    radius: 80,
    path: true,
  },

  // Ring 2 (Radius 130px) - Counter-orbit
  {
    component: () => (
      <img
        width={34}
        height={34}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg'
        alt='JavaScript'
      />
    ),
    className: 'size-[34px] border-none bg-transparent',
    duration: 26,
    angle: 45,
    radius: 130,
    reverse: true,
    path: true,
  },
  {
    component: () => (
      <img
        width={34}
        height={34}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg'
        alt='TailwindCSS'
      />
    ),
    className: 'size-[34px] border-none bg-transparent',
    duration: 26,
    angle: 225,
    radius: 130,
    reverse: true,
    path: true,
  },

  // Ring 3 (Radius 180px) - Mid Orbit
  {
    component: () => (
      <img
        width={38}
        height={38}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg'
        alt='TypeScript'
      />
    ),
    className: 'size-[38px] border-none bg-transparent',
    duration: 30,
    angle: 90,
    radius: 180,
    path: true,
  },
  {
    component: () => (
      <img
        width={38}
        height={38}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg'
        alt='React'
      />
    ),
    className: 'size-[38px] border-none bg-transparent',
    duration: 30,
    angle: 270,
    radius: 180,
    path: true,
  },

  // Ring 4 (Radius 230px) - Outer Orbit
  {
    component: () => (
      <img
        width={36}
        height={36}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg'
        alt='Nextjs'
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 34,
    angle: 30,
    radius: 230,
    reverse: true,
    path: true,
  },
  {
    component: () => (
      <img
        width={36}
        height={36}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg'
        alt='Figma'
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 34,
    angle: 150,
    radius: 230,
    reverse: true,
    path: true,
  },
  {
    component: () => (
      <img
        width={36}
        height={36}
        src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg'
        alt='Git'
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 34,
    angle: 270,
    radius: 230,
    reverse: true,
    path: true,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authActionTitle, setAuthActionTitle] = useState('Sign in to Continue');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingResume, setPendingResume] = useState<(() => void) | null>(null);

  // Form & Card Generation state
  const [githubUsername, setGithubUsername] = useState('shadcn');
  const [loadingCard, setLoadingCard] = useState(false);
  const [cardData, setCardData] = useState<DeveloperCardData | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  useEffect(() => {
    // If authenticated, redirect immediately to /feed
    const stored = localStorage.getItem('devtrack_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        router.replace('/feed');
      } catch {
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAndShowCard = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, '') || 'shadcn';
    setLoadingCard(true);
    setErrorMessage(null);

    try {
      const data = await GitHubCardService.fetchRealDeveloperCardData(cleanUser);
      setCardData(data);
      setIsCardModalOpen(true);
    } catch (err: any) {
      console.error('Error fetching Developer Card:', err);
      setErrorMessage(err.message || 'Failed to fetch verified GitHub developer data.');
    } finally {
      setLoadingCard(false);
    }
  };

  const handleCardFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchAndShowCard(githubUsername);
  };

  const handleSampleClick = (sample: string) => {
    setGithubUsername(sample);
    fetchAndShowCard(sample);
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span>Redirecting to your DevTrack feed...</span>
      </div>
    );
  }

  const formFields = {
    header: 'Generate Developer Card',
    subHeader: 'GitHub stores your code. DevTrack showcases you. Enter your GitHub username for an instant preview.',
    fields: [
      {
        label: 'GitHub Username',
        required: true,
        type: 'text' as const,
        placeholder: 'e.g. shadcn, torvalds, gaearon',
        value: githubUsername,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setGithubUsername(e.target.value),
      },
    ],
    submitButton: loadingCard ? 'Generating Card...' : 'Generate Developer Card',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Glass Navbar */}
      <Navbar currentUser={currentUser} onRequireAuth={handleRequireAuth} />

      {/* Main Hero Container */}
      <main className="relative flex-1 flex items-center justify-center overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
        {/* Background Radial Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-cyan-500/10 blur-[140px]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
          {/* Left Side: Interactive 3D Robot Display with DevTrack Branding */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[460px] max-lg:hidden">
            <DevTrackRobotDisplay text="DevTrack" />
          </div>

          {/* Right Side: Animated Card Generation Form */}
          <div className="lg:col-span-6 w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
              {/* Trust Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  DevTrack Identity Engine
                </span>
              </div>

              <AuthTabs
                formFields={formFields}
                googleLogin={isLoggingIn ? 'Connecting to GitHub...' : 'Continue with GitHub'}
                googleLoginIcon={<GithubIcon className="h-5 w-5 text-white" />}
                onGoogleClick={handleContinueWithGitHub}
                handleSubmit={handleCardFormSubmit}
              >
                {/* Quick Presets & Badges below input */}
                <div className="-mt-1 mb-2 space-y-3">
                  {errorMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-400">Quick Samples:</span>
                    {['shadcn', 'gaearon', 'torvalds'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => handleSampleClick(sample)}
                        className="rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[11px] font-mono text-indigo-300 hover:border-indigo-500/40 hover:bg-slate-900 transition-all"
                      >
                        @{sample}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Live GitHub API Data — No signup required</span>
                  </div>
                </div>
              </AuthTabs>
            </div>
          </div>
        </div>
      </main>

      {/* Developer Card Preview Modal */}
      <AnimatePresence>
        {isCardModalOpen && cardData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCardModalOpen(false)}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-3 sm:p-4 shadow-2xl space-y-3 max-h-[95vh] overflow-hidden"
            >
              {/* Developer Card Display */}
              <div className="flex justify-center">
                <DeveloperCard
                  data={cardData}
                  onClose={() => setIsCardModalOpen(false)}
                  onRequireAuth={(action) => {
                    setIsCardModalOpen(false);
                    handleRequireAuth(action);
                  }}
                />
              </div>

              {/* Modal Footer Banner */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 text-indigo-200 text-[11px]">
                  <Lock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Sign in with GitHub to claim and share your verified card!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCardModalOpen(false);
                    handleRequireAuth('Claim & Save Developer Identity');
                  }}
                  className="shrink-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terminal Minimal Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <span className="font-bold text-white">DevTrack</span>
              <span className="text-slate-600">|</span>
              <span>The Professional Developer Network</span>
            </div>
            <div className="flex items-center gap-6 text-[11px]">
              <a href="/feed" className="hover:text-white transition-colors">Feed</a>
              <a href="/projects" className="hover:text-white transition-colors">Projects</a>
              <a href="/community" className="hover:text-white transition-colors">Community</a>
              <a href="/ai" className="hover:text-white transition-colors">AI Suite</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>
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
