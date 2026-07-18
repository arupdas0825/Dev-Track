"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Code,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { createPost } from "@/services/devfeedService";
import { DevTrackUser } from "@/types/user";
import { DevFeedPost, PostType, CreatePostInput } from "@/types/devfeed";
import { useToast } from "./useToast";

const POST_TYPES: { value: PostType; label: string; color: string }[] = [
  { value: "general", label: "General", color: "border-border text-text-secondary" },
  { value: "milestone", label: "🏆 Milestone", color: "border-accent/50 text-accent" },
  { value: "launch", label: "🚀 Launch", color: "border-diff-add/50 text-diff-add" },
  { value: "learning", label: "📚 Learning", color: "border-warning/50 text-warning" },
];

const CODE_LANGUAGES = [
  "typescript", "javascript", "python", "rust", "go", "java", "kotlin",
  "swift", "cpp", "c", "csharp", "php", "ruby", "bash", "sql", "html",
  "css", "json", "yaml", "markdown", "other",
];

interface PostComposerProps {
  currentUser: DevTrackUser;
  onPostCreated: (post: DevFeedPost) => void;
}

export default function PostComposer({ currentUser, onPostCreated }: PostComposerProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("general");
  const [showCode, setShowCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const charLimit = 500;
  const remaining = charLimit - content.length;
  const canSubmit = content.trim().length > 0 && !submitting && remaining >= 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const input: CreatePostInput = {
        content: content.trim(),
        type: postType,
        ...(showCode && codeSnippet.trim() ? { codeSnippet: codeSnippet.trim(), codeLanguage } : {}),
        ...(showImage && imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      };
      const post = await createPost(currentUser, input);
      onPostCreated(post);
      // Reset form
      setContent("");
      setPostType("general");
      setShowCode(false);
      setCodeSnippet("");
      setCodeLanguage("typescript");
      setShowImage(false);
      setImageUrl("");
      toast("Post published!", "success");
    } catch (err) {
      console.error("createPost failed:", err);
      toast("Failed to publish post. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      {/* Author row */}
      <div className="flex items-center gap-3">
        {currentUser.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUser.photoURL}
            alt={currentUser.username}
            className="h-8 w-8 rounded-full object-cover border border-border flex-shrink-0"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="text-xs font-semibold text-text-primary">
          @{currentUser.username}
        </span>
      </div>

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share a milestone, a launch, or what you're learning…"
        rows={3}
        className="w-full bg-surface-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-accent/60 transition-colors font-sans leading-relaxed"
      />

      {/* Char counter */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-mono ${
            remaining < 50 ? (remaining < 0 ? "text-diff-remove" : "text-warning") : "text-text-secondary"
          }`}
        >
          {remaining} remaining
        </span>
      </div>

      {/* Post type selector */}
      <div className="flex flex-wrap gap-1.5">
        {POST_TYPES.map((pt) => (
          <button
            key={pt.value}
            onClick={() => setPostType(pt.value)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
              postType === pt.value
                ? pt.color + " bg-surface-secondary"
                : "border-border text-text-secondary hover:border-border/80 hover:bg-surface-secondary"
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Code snippet toggle */}
      <div className="border-t border-border/40 pt-2 space-y-2">
        <button
          onClick={() => setShowCode(!showCode)}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <Code size={12} />
          <span>Code snippet</span>
          {showCode ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {showCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="bg-surface-secondary border border-border rounded-md px-2.5 py-1.5 text-[11px] text-text-secondary focus:outline-none focus:border-accent/60 font-mono cursor-pointer"
            >
              {CODE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste your code here…"
              rows={5}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-text-primary font-mono placeholder-text-secondary resize-y focus:outline-none focus:border-accent/60 transition-colors"
            />
          </motion.div>
        )}
      </div>

      {/* Image URL toggle */}
      <div className="space-y-2">
        <button
          onClick={() => setShowImage(!showImage)}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ImageIcon size={12} />
          <span>Image URL</span>
          {showImage ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {showImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full bg-surface-secondary border border-border rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/60 transition-colors font-mono"
            />
          </motion.div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 active:scale-95 transition-all cursor-pointer"
        >
          {submitting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Send size={13} />
          )}
          <span>{submitting ? "Publishing…" : "Post"}</span>
        </button>
      </div>
    </div>
  );
}
