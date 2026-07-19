'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  GitBranch, 
  Code2, 
  FileText, 
  Video, 
  Send, 
  Sparkles, 
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface CreatePostWidgetProps {
  user: any;
  onPostCreated: (post: any) => void;
  onRequireAuth: () => void;
}

export const CreatePostWidget: React.FC<CreatePostWidgetProps> = ({
  user,
  onPostCreated,
  onRequireAuth
}) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<string>('project_launch');
  const [repoUrl, setRepoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypeTabs = [
    { id: 'project_launch', label: 'Launch', icon: Rocket },
    { id: 'repo_update', label: 'Repo Update', icon: GitBranch },
    { id: 'code_snippet', label: 'Snippet', icon: Code2 },
    { id: 'article', label: 'Article', icon: FileText },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newPost = {
        id: 'post_' + Date.now(),
        author: {
          name: user.displayName || user.username || 'Developer',
          username: user.username || 'developer',
          avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`,
          archetype: 'Core Software Architect'
        },
        type: postType,
        content,
        repoUrl: repoUrl || undefined,
        likesCount: 1,
        commentsCount: 0,
        createdAt: 'Just now',
        aiSummary: 'AI analysis verified this post as a high-impact technical project launch.'
      };
      onPostCreated(newPost);
      setContent('');
      setRepoUrl('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl">
      {/* Category Selection Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-3 mb-4 overflow-x-auto scrollbar-none">
        {postTypeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = postType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPostType(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            !user
              ? 'Sign in to share project launches, technical discussions, and repository updates...'
              : postType === 'project_launch'
              ? 'Tell the community about your project launch (What problem does it solve? What tech stack did you use?).'
              : 'Share code snippets, technical thoughts, or repository updates...'
          }
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
        />

        {/* Optional Repo URL link */}
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="GitHub Repository or Demo URL (optional)"
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => !user && onRequireAuth()}
              className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>Media</span>
            </button>
            <button
              type="button"
              onClick={() => !user && onRequireAuth()}
              className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>AI Polish</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Post Update'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
