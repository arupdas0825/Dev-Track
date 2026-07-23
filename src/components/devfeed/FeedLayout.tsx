'use client';

import React, { useState, useEffect } from 'react';
import { LeftProfileSidebar } from './LeftProfileSidebar';
import { CreatePostWidget } from './CreatePostWidget';
import { PostCard, FeedPost } from './PostCard';
import { TrendingSidebar } from './TrendingSidebar';
import { AuthModal } from '../auth/AuthModal';

import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileHamburgerMenu } from '@/components/layout/MobileHamburgerMenu';
import { MobileSearchModal } from '@/components/layout/MobileSearchModal';
import { MobilePostCard } from './MobilePostCard';
import { MobilePostComposer } from './MobilePostComposer';
import { Plus, Sparkles } from 'lucide-react';

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post_101',
    author: {
      name: 'shadcn',
      username: 'shadcn',
      avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
      tier: 'Master',
      archetype: 'UI Engineering Lead'
    },
    type: 'project_launch',
    content: '🚀 Excited to announce DevTrack 2.0 Identity Platform! Built from scratch with Next.js App Router, Tailwind, Framer Motion, and AI profile scoring.',
    repoUrl: 'https://github.com/shadcn/ui',
    likesCount: 142,
    commentsCount: 18,
    createdAt: '2 hours ago',
    aiSummary: 'High impact project launch: verified 99.8% code efficiency and architecture quality.'
  },
  {
    id: 'post_102',
    author: {
      name: 'Linus Torvalds',
      username: 'torvalds',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      tier: 'Apex',
      archetype: 'System Kernel Creator'
    },
    type: 'repo_update',
    content: 'Pushed kernel patch v6.12-rc4 with optimized memory locking primitives and low-latency scheduling fixes.',
    repoUrl: 'https://github.com/torvalds/linux',
    likesCount: 520,
    commentsCount: 64,
    createdAt: '5 hours ago',
    aiSummary: 'Kernel memory optimization update. Re-verified by AI security analyzer.'
  },
  {
    id: 'post_103',
    author: {
      name: 'Dan Abramov',
      username: 'gaearon',
      avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
      tier: 'Legend',
      archetype: 'UI & State Pioneer'
    },
    type: 'code_snippet',
    content: 'Quick tip when designing async server components: leverage suspense boundaries around independent data queries to unblock rendering streaming.',
    likesCount: 210,
    commentsCount: 15,
    createdAt: '8 hours ago',
    aiSummary: 'Best practice pattern for Next.js App Router React Server Components.'
  }
];

export const FeedLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authActionTitle, setAuthActionTitle] = useState('Sign in to Continue');

  // Mobile Modals & Sheet State
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('devtrack_current_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleRequireAuth = (actionName: string = 'Interact') => {
    setAuthActionTitle(`Sign in to ${actionName}`);
    setIsAuthOpen(true);
  };

  const handlePostCreated = (newPost: FeedPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <>
      {/* 📱 MOBILE VIEW CONTAINER (< md) */}
      <div className="block md:hidden min-h-screen bg-slate-950 text-slate-100 pb-24">
        <MobileTopBar
          user={user}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenHamburger={() => setIsHamburgerOpen(true)}
          onOpenAuth={() => handleRequireAuth('Sign In')}
        />

        <main className="px-3 py-4 space-y-4 max-w-lg mx-auto">
          {/* Quick Create Update Bar on Mobile */}
          <div
            onClick={() => setIsComposerOpen(true)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40 flex items-center justify-center font-mono font-bold text-xs">
              +
            </div>
            <span className="text-xs text-slate-400 font-sans">Share code update, repo launch, or dev insight...</span>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <MobilePostCard
                key={post.id}
                post={post}
                onRequireAuth={() => handleRequireAuth('React or Comment')}
              />
            ))}
          </div>
        </main>

        {/* Floating FAB for Quick Post */}
        <button
          onClick={() => setIsComposerOpen(true)}
          className="fixed bottom-20 right-4 z-40 p-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-90 transition-all block md:hidden"
          aria-label="Create Post"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Mobile Navigation Bar */}
        <MobileBottomNav user={user} activeTabOverride="home" />

        {/* Mobile Modals */}
        <MobileHamburgerMenu
          isOpen={isHamburgerOpen}
          onClose={() => setIsHamburgerOpen(false)}
          user={user}
          onOpenAuth={() => handleRequireAuth('Sign In')}
        />

        <MobileSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <MobilePostComposer
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          user={user}
          onPostCreated={handlePostCreated}
        />
      </div>

      {/* 💻 DESKTOP VIEW CONTAINER (>= md) */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <LeftProfileSidebar
                user={user}
                onRequireAuth={() => handleRequireAuth('Claim Profile')}
              />
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-6">
            <CreatePostWidget
              user={user}
              onPostCreated={handlePostCreated}
              onRequireAuth={() => handleRequireAuth('Post Updates')}
            />

            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onRequireAuth={() => handleRequireAuth('React or Comment')}
                />
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <TrendingSidebar />
            </div>
          </aside>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        actionTitle={authActionTitle}
      />
    </>
  );
};
