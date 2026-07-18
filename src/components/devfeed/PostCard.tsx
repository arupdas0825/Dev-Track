"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, ExternalLink } from "lucide-react";
import { DevFeedPost, PostType } from "@/types/devfeed";
import { DevTrackUser } from "@/types/user";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_BADGE: Record<PostType, { label: string; className: string }> = {
  milestone: { label: "🏆 Milestone", className: "border-accent/40 text-accent bg-accent/5" },
  launch:    { label: "🚀 Launch",    className: "border-diff-add/40 text-diff-add bg-diff-add/5" },
  learning:  { label: "📚 Learning",  className: "border-warning/40 text-warning bg-warning/5" },
  general:   { label: "General",      className: "border-border text-text-secondary" },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: DevFeedPost;
  currentUser: DevTrackUser | null;
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const badge = TYPE_BADGE[post.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      <div className="p-4 space-y-3">
        {/* Header: author + meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.authorAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.authorAvatarUrl}
                alt={post.authorUsername}
                className="h-8 w-8 rounded-full object-cover border border-border flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">
                {post.authorUsername.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/u/${post.authorUsername}`}
                  className="text-xs font-bold text-text-primary hover:text-accent transition-colors truncate"
                >
                  {post.authorDisplayName || post.authorUsername}
                </Link>
                <Link
                  href={`/u/${post.authorUsername}`}
                  className="text-[10px] text-text-secondary hover:text-text-primary transition-colors font-mono"
                >
                  @{post.authorUsername}
                </Link>
              </div>
              <span className="text-[10px] text-text-secondary font-mono">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Post type badge */}
          {post.type !== "general" && (
            <span
              className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Code snippet */}
        {post.codeSnippet && (
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface-secondary">
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                {post.codeLanguage || "code"}
              </span>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(post.codeSnippet!);
                  }
                }}
                className="text-[10px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Copy"
              >
                Copy
              </button>
            </div>
            <pre className="overflow-x-auto p-3 text-[12px] text-text-primary font-mono leading-relaxed scrollbar-thin">
              <code>{post.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-full max-h-80 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-4 pt-1 border-t border-border/40">
          <LikeButton
            postId={post.id}
            initialCount={post.likesCount}
            currentUser={currentUser}
          />

          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1.5 text-[11px] text-text-secondary hover:text-accent transition-colors cursor-pointer"
          >
            <MessageCircle size={14} />
            <span>{post.commentsCount}</span>
          </button>

          <a
            href={`/u/${post.authorUsername}`}
            className="ml-auto text-[10px] text-text-secondary hover:text-accent transition-colors flex items-center gap-1"
          >
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Comments section (expand/collapse) */}
      {commentsOpen && (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
        />
      )}
    </motion.div>
  );
}
