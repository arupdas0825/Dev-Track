'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { Heart, MessageSquare, Repeat2, Share2, Star, GitFork, ExternalLink, Code2, Sparkles, Check } from 'lucide-react';
import { FeedPost } from './PostCard';

interface MobilePostCardProps {
  post: FeedPost;
  onRequireAuth?: () => void;
}

export const MobilePostCard: React.FC<MobilePostCardProps> = ({ post, onRequireAuth }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DevTrack Post by @${post.author?.username || post.authorUsername || 'developer'}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Clipboard error
      }
    }
  };

  const contentThreshold = 180;
  const shouldTruncate = post.content.length > contentThreshold;
  const displayedContent = shouldTruncate && !isExpanded ? `${post.content.slice(0, contentThreshold)}...` : post.content;

  const authorName = post.author?.name || 'Verified Developer';
  const authorUsername = post.author?.username || 'developer';
  const avatarUrl = post.author?.avatarUrl || 'https://avatars.githubusercontent.com/u/9919?v=4';
  const tier = (post.author?.tier as any) || 'Diamond';

  return (
    <article className="w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-lg hover:border-slate-700/80 transition-all">
      {/* Header: Author & Tier Avatar */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/u/${authorUsername}`} className="flex items-center gap-3 group">
          <TierAvatar
            src={avatarUrl}
            alt={authorName}
            tier={tier}
            size="md"
            className="w-10 h-10 rounded-xl ring-2 ring-cyan-500/30 group-active:scale-95 transition-transform"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                {authorName}
              </h3>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                {tier}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono truncate">
              @{authorUsername} • <span className="text-slate-500">{post.createdAt || 'Just now'}</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Post Content */}
      <div className="text-sm text-slate-200 leading-relaxed mb-3 font-sans">
        <p>{displayedContent}</p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-cyan-400 font-semibold mt-1 hover:underline focus:outline-none"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Embedded GitHub Repository Card Preview */}
      {post.repoUrl && (
        <div className="mb-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold truncate">
              <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{post.repoUrl.replace('https://github.com/', '')}</span>
            </div>
            <a
              href={post.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-2 font-mono">
            {post.aiSummary || 'Verified repository project card on DevTrack identity network.'}
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>TypeScript</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              <span>1.4k</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-3 h-3 text-indigo-400" />
              <span>180</span>
            </div>
          </div>
        </div>
      )}

      {/* Media Image / GIF if present */}
      {post.imageUrl && (
        <div className="mb-3 overflow-hidden rounded-xl border border-slate-800">
          <img src={post.imageUrl} alt="Post Attachment" className="w-full h-auto object-cover max-h-64" />
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-mono font-medium p-1.5 rounded-xl active:scale-90 transition-all ${
            liked ? 'text-rose-500 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Heart className={`w-4.5 h-4.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{likesCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={onRequireAuth}
          className="flex items-center gap-1.5 text-xs font-mono font-medium p-1.5 rounded-xl hover:text-slate-200 active:scale-90 transition-all"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>{post.commentsCount || 0}</span>
        </button>

        {/* Repost */}
        <button
          onClick={onRequireAuth}
          className="flex items-center gap-1.5 text-xs font-mono font-medium p-1.5 rounded-xl hover:text-cyan-400 active:scale-90 transition-all"
        >
          <Repeat2 className="w-4.5 h-4.5" />
          <span>Repost</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-mono font-medium p-1.5 rounded-xl hover:text-indigo-400 active:scale-90 transition-all"
        >
          {copied ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Share2 className="w-4.5 h-4.5" />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>
    </article>
  );
};
