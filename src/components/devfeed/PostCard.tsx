'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Sparkles, 
  ExternalLink, 
  Rocket, 
  GitBranch, 
  Code2, 
  FileText,
  Check
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import Link from 'next/link';

export interface FeedPost {
  id: string;
  author?: {
    name: string;
    username: string;
    avatarUrl: string;
    archetype?: string;
    tier?: string;
  };
  authorId?: string;
  authorUsername?: string;
  authorDisplayName?: string | null;
  authorAvatarUrl?: string | null;
  type: string;
  content: string;
  repoUrl?: string;
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  imageUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  aiSummary?: string;
}

interface PostCardProps {
  post: FeedPost;
  currentUser?: any;
  onRequireAuth?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onRequireAuth }) => {
  const [likes, setLikes] = useState(post.likesCount);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([]);

  const authorName = post.author?.name || post.authorDisplayName || post.authorUsername || 'Developer';
  const authorUsername = post.author?.username || post.authorUsername || 'developer';
  const authorAvatarUrl = post.author?.avatarUrl || post.authorAvatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${authorUsername}`;
  const archetype = post.author?.archetype || 'Core Engineer';

  const handleLike = () => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('devtrack_current_user') : null;
    if (!user && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (liked) {
      setLikes(likes - 1);
      setLiked(false);
    } else {
      setLikes(likes + 1);
      setLiked(true);
    }
  };

  const handleBookmark = () => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('devtrack_current_user') : null;
    if (!user && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setBookmarked(!bookmarked);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const user = typeof window !== 'undefined' ? localStorage.getItem('devtrack_current_user') : null;
    if (!user && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (!commentInput.trim()) return;
    setCommentsList([...commentsList, commentInput]);
    setCommentInput('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project_launch':
      case 'launch':
        return <Rocket className="h-3.5 w-3.5 text-indigo-400" />;
      case 'repo_update':
      case 'milestone':
        return <GitBranch className="h-3.5 w-3.5 text-purple-400" />;
      case 'code_snippet':
      case 'learning':
        return <Code2 className="h-3.5 w-3.5 text-cyan-400" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-emerald-400" />;
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-white/20"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${authorUsername}`}>
            <img
              src={authorAvatarUrl}
              alt={authorName}
              className="h-11 w-11 rounded-2xl object-cover ring-2 ring-white/10 hover:ring-indigo-500 transition-all"
            />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/u/${authorUsername}`}
                className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
              >
                {authorName}
              </Link>
              <span className="text-xs text-indigo-400 font-medium">@{authorUsername}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                {archetype}
              </span>
              <span className="text-[10px] text-slate-500">• {post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Post Type Badge */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-300">
          {getTypeIcon(post.type)}
          <span className="capitalize">{post.type.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-3">
        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* Repo Link Box */}
        {post.repoUrl && (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white">
                <GithubIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="truncate text-xs font-bold text-white">{post.repoUrl}</h5>
                <p className="text-[11px] text-slate-400">View Open Source Codebase</p>
              </div>
            </div>
            <a
              href={post.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all"
            >
              <span>Repo</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* AI Insight Pill */}
        {post.aiSummary && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 text-xs text-purple-200">
            <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{post.aiSummary}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              liked ? 'text-rose-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span>{likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentsCount + commentsList.length}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              bookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add technical feedback or question..."
              className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
            >
              Reply
            </button>
          </form>

          {commentsList.map((cmt, idx) => (
            <div key={idx} className="rounded-xl border border-white/5 bg-slate-950/40 p-2.5 text-xs text-slate-300">
              <span className="font-bold text-indigo-400 mr-2">@you:</span>
              {cmt}
            </div>
          ))}
        </div>
      )}
    </motion.article>
  );
};

export default PostCard;
