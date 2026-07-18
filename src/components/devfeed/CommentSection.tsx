"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { getComments, addComment } from "@/services/devfeedService";
import { DevFeedComment } from "@/types/devfeed";
import { DevTrackUser } from "@/types/user";
import { useToast } from "./useToast";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface CommentSectionProps {
  postId: string;
  currentUser: DevTrackUser | null;
}

export default function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<DevFeedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load comments on first expand
  useEffect(() => {
    let cancelled = false;
    getComments(postId)
      .then((data) => { if (!cancelled) setComments(data); })
      .catch(() => { if (!cancelled) toast("Failed to load comments.", "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(async () => {
    if (!currentUser) { toast("Sign in to comment.", "info"); return; }
    if (!input.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await addComment(postId, currentUser, input.trim());
      setComments((prev) => [...prev, comment]);
      setInput("");
    } catch {
      toast("Failed to post comment. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }, [currentUser, input, submitting, postId, toast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-surface-secondary px-4 py-3 space-y-3">
      {/* Comments list */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin text-text-secondary" />
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {comments.length === 0 ? (
            <p className="text-[11px] text-text-secondary text-center py-2">
              No comments yet — be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  {c.authorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.authorAvatarUrl}
                      alt={c.authorUsername}
                      className="h-6 w-6 rounded-full object-cover border border-border flex-shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center text-[9px] font-bold text-text-secondary flex-shrink-0 mt-0.5">
                      {c.authorUsername.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-text-primary">
                        @{c.authorUsername}
                      </span>
                      <span className="text-[10px] text-text-secondary font-mono">
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-primary leading-relaxed mt-0.5 break-words">
                      {c.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Inline composer */}
      {currentUser && (
        <div className="flex items-center gap-2 pt-1 border-t border-border/40">
          {currentUser.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUser.photoURL}
              alt={currentUser.username}
              className="h-6 w-6 rounded-full object-cover border border-border flex-shrink-0"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center text-[9px] font-bold text-text-secondary flex-shrink-0">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment…"
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/60 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || submitting}
            className="p-1.5 rounded-lg bg-accent text-white disabled:opacity-40 hover:bg-accent/90 active:scale-95 transition-all cursor-pointer"
          >
            {submitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
