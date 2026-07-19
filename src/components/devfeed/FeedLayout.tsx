'use client';

import React, { useState, useEffect } from 'react';
import { LeftProfileSidebar } from './LeftProfileSidebar';
import { CreatePostWidget } from './CreatePostWidget';
import { PostCard, FeedPost } from './PostCard';
import { TrendingSidebar } from './TrendingSidebar';
import { AuthModal } from '../auth/AuthModal';

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post_101',
    author: {
      name: 'shadcn',
      username: 'shadcn',
      avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar (Col 1-3) */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <LeftProfileSidebar
              user={user}
              onRequireAuth={() => handleRequireAuth('Claim Profile')}
            />
          </div>
        </aside>

        {/* Center Main Feed (Col 4-8) */}
        <main className="lg:col-span-6 space-y-6">
          {/* Post Generator Box */}
          <CreatePostWidget
            user={user}
            onPostCreated={handlePostCreated}
            onRequireAuth={() => handleRequireAuth('Post Updates')}
          />

          {/* Feed Posts Stack */}
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

        {/* Right Sidebar (Col 9-12) */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <TrendingSidebar />
          </div>
        </aside>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        actionTitle={authActionTitle}
      />
    </div>
  );
};
