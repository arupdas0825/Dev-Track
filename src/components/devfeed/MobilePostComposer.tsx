'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Code, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { FeedPost } from './PostCard';

interface MobilePostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onPostCreated: (post: FeedPost) => void;
}

export const MobilePostComposer: React.FC<MobilePostComposerProps> = ({
  isOpen,
  onClose,
  user,
  onPostCreated,
}) => {
  const [content, setContent] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newPost: FeedPost = {
        id: `post_${Date.now()}`,
        author: {
          name: user?.name || user?.username || 'Verified Developer',
          username: user?.username || 'developer',
          avatarUrl: user?.avatarUrl || user?.photoURL || 'https://avatars.githubusercontent.com/u/9919?v=4',
          tier: user?.tier || 'Master',
        },
        type: repoUrl ? 'project_launch' : 'text',
        content: content.trim(),
        repoUrl: repoUrl.trim() || undefined,
        likesCount: 1,
        commentsCount: 0,
        createdAt: 'Just now',
        aiSummary: repoUrl ? 'Community project launch verified on DevTrack.' : undefined,
      };

      onPostCreated(newPost);
      setIsSubmitting(false);
      setContent('');
      setRepoUrl('');
      setShowRepoInput(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm block md:hidden"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 rounded-t-3xl p-4 shadow-2xl block md:hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-sm text-slate-100 font-mono">Create Update</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Author details */}
            <div className="flex items-center gap-3 pt-3">
              <TierAvatar
                src={user?.avatarUrl || user?.photoURL || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                alt={user?.name || user?.username || 'Developer'}
                tier={user?.tier || 'Diamond'}
                size="sm"
                className="w-9 h-9 rounded-xl"
              />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">{user?.name || user?.username || 'Developer'}</h4>
                <span className="text-[10px] font-mono text-cyan-400">Public Developer Feed</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a project launch, kernel update, or dev insight..."
                  className="w-full h-32 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none font-sans"
                  autoFocus
                />

                {showRepoInput && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-cyan-500/40">
                    <Code className="w-4 h-4 text-cyan-400 shrink-0" />
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Action Bar & Submit */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRepoInput(!showRepoInput)}
                    className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 active:scale-95 transition-all ${
                      showRepoInput
                        ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span className="font-mono text-[11px]">Attach Repo</span>
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 active:scale-95 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-xs text-slate-950 flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
