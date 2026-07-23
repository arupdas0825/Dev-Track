'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  Code, 
  Rocket, 
  GitCommit, 
  FileText, 
  Terminal, 
  Brain,
  Link as LinkIcon, 
  Loader2 
} from 'lucide-react';
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
  const [selectedType, setSelectedType] = useState<'text' | 'project_launch' | 'repo_update' | 'article' | 'code_snippet' | 'ai_insight'>('text');
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const creationTypes = [
    { id: 'text', label: 'New Post', icon: FileText, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' },
    { id: 'project_launch', label: 'Launch Project', icon: Rocket, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
    { id: 'repo_update', label: 'Repo Update', icon: GitCommit, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
    { id: 'article', label: 'Article', icon: FileText, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
    { id: 'code_snippet', label: 'Snippet', icon: Terminal, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
    { id: 'ai_insight', label: 'AI Insight', icon: Brain, color: 'text-pink-400 bg-pink-950/40 border-pink-800/40' },
  ];

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
        type: selectedType as any,
        content: content.trim(),
        repoUrl: repoUrl.trim() || undefined,
        likesCount: 1,
        commentsCount: 0,
        createdAt: 'Just now',
        aiSummary: selectedType === 'project_launch' ? 'Community project launch verified on DevTrack.' : undefined,
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

            {/* Creation Types Selection */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-b border-slate-800/60">
              {creationTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id as any);
                      if (type.id === 'project_launch' || type.id === 'repo_update') {
                        setShowRepoInput(true);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Author details */}
            <div className="flex items-center gap-3 pt-3">
              <TierAvatar
                src={user?.avatarUrl || user?.photoURL || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                alt={user?.name || user?.username || 'Developer'}
                tier={user?.tier || 'Diamond'}
                size="sm"
                className="w-8 h-8 rounded-xl"
              />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">{user?.name || user?.username || 'Verified Developer'}</h4>
                <p className="text-[10px] font-mono text-cyan-400">@{user?.username || 'developer'}</p>
              </div>
            </div>

            {/* Textarea & Inputs */}
            <form onSubmit={handleSubmit} className="mt-3 flex-1 flex flex-col justify-between gap-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  selectedType === 'project_launch'
                    ? 'Share your project release notes, architecture highlights, and demo links...'
                    : selectedType === 'code_snippet'
                    ? 'Paste your code snippet or architectural pattern...'
                    : 'Share a developer insight, code tip, or project update...'
                }
                rows={4}
                className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-sans resize-none"
              />

              {showRepoInput && (
                <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-2">
                  <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo-name"
                    className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              {/* Actions footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRepoInput(!showRepoInput)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      showRepoInput ? 'bg-cyan-950 text-cyan-400 border-cyan-800' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Repo</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Post</span>
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
