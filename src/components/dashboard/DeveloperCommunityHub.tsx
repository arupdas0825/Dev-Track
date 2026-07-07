"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  Award,
  Folder,
  Calendar,
  Compass,
  Globe,
  Briefcase,
  Bell,
  Search,
  Plus,
  Send,
  ThumbsUp,
  Bookmark,
  Share2,
  AlertCircle,
  ExternalLink,
  Code,
  Tag,
  Clock,
  UserCheck,
  UserPlus,
  CheckCircle,
  Heart,
  ChevronDown,
  Lock
} from "lucide-react";
import { UserDashboardData } from "@/types";
import { CommunityService, CommunityPost, DiscussionThread, ForumReply, DirectMessage, CommunityJobListing, CommunityDeveloper } from "@/services/communityService";

interface DeveloperCommunityHubProps {
  data: UserDashboardData;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  githubToken: string;
}

export default function DeveloperCommunityHub({
  data,
  activeSubTab,
  setActiveSubTab,
  githubToken
}: DeveloperCommunityHubProps) {
  const username = data.profile.login;
  const myUserId = "self"; // Placeholder for current user ID in local mode

  // Community States
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [developers, setDevelopers] = useState<CommunityDeveloper[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [repliesMap, setRepliesMap] = useState<Record<string, ForumReply[]>>({});
  const [jobs, setJobs] = useState<any[]>([]);

  // Composer States
  const [newPostContent, setNewPostContent] = useState("");
  const [postType, setPostType] = useState<CommunityPost["type"]>("general");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);

  // Discussion Creation State
  const [discTitle, setDiscTitle] = useState("");
  const [discContent, setDiscContent] = useState("");
  const [discCategory, setDiscCategory] = useState<DiscussionThread["category"]>("frontend");
  const [discTags, setDiscTags] = useState("");
  const [showDiscModal, setShowDiscModal] = useState(false);

  // Active Forum Thread View State
  const [activeDiscThread, setActiveDiscThread] = useState<DiscussionThread | null>(null);
  const [newForumReplyText, setNewForumReplyText] = useState("");

  // Messaging States
  const [activeChatUser, setActiveChatUser] = useState<CommunityDeveloper | null>(null);
  const [chatMessages, setChatMessages] = useState<DirectMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [chatCodeSnippet, setChatCodeSnippet] = useState("");
  const [chatCodeLanguage, setChatCodeLanguage] = useState("javascript");
  const [showChatCodeDrawer, setShowChatCodeDrawer] = useState(false);

  // Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // Pre-load data
  useEffect(() => {
    setPosts(CommunityService.getPosts(username));
    setDevelopers(CommunityService.getDevelopers(username));
    setDiscussions(CommunityService.getDiscussions(username));
    
    // Jobs scoring
    const topLangs = data.languages || [];
    setJobs(CommunityService.getJobsWithMatching(topLangs));
  }, [username, data]);

  // Sync messaging window
  useEffect(() => {
    if (activeChatUser) {
      const messages = CommunityService.getMessages(username, activeChatUser.uid);
      setChatMessages(messages);
    }
  }, [activeChatUser, username]);

  // Handle Post Creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = CommunityService.createPost(username, {
      authorId: myUserId,
      authorName: data.profile.name || data.profile.login,
      authorAvatar: data.profile.avatar_url || "U",
      authorTitle: "DevTrack Engineer (You)",
      content: newPostContent,
      type: postType,
      codeSnippet: showCodeDrawer && codeSnippet.trim() ? codeSnippet : undefined,
      codeLanguage: showCodeDrawer && codeSnippet.trim() ? codeLanguage : undefined
    });

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setCodeSnippet("");
    setShowCodeDrawer(false);
  };

  // Handle Likes
  const handleLikePost = (postId: string) => {
    const updated = CommunityService.toggleLikePost(username, postId, myUserId);
    setPosts(updated);
  };

  // Handle Bookmarks
  const handleBookmarkPost = (postId: string) => {
    const updated = CommunityService.toggleBookmarkPost(username, postId, myUserId);
    setPosts(updated);
  };

  // Handle Follow Toggle
  const handleFollowUser = (userId: string) => {
    const updated = CommunityService.followUser(username, myUserId, userId);
    setDevelopers(updated);
  };

  // Handle Discussion Creation
  const handleCreateDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discTitle.trim() || !discContent.trim()) return;

    const newDisc = CommunityService.createDiscussion(username, {
      title: discTitle,
      category: discCategory,
      authorId: myUserId,
      authorName: data.profile.name || data.profile.login,
      authorAvatar: data.profile.avatar_url || "U",
      content: discContent,
      tags: discTags.split(",").map(t => t.trim()).filter(Boolean)
    });

    setDiscussions([newDisc, ...discussions]);
    setDiscTitle("");
    setDiscContent("");
    setDiscTags("");
    setShowDiscModal(false);
  };

  // Fetch Forum Replies
  const getThreadReplies = (parentId: string) => {
    if (repliesMap[parentId]) return repliesMap[parentId];
    const reps = CommunityService.getReplies(username, parentId);
    setRepliesMap(prev => ({ ...prev, [parentId]: reps }));
    return reps;
  };

  // Handle Forum Reply Creation
  const handlePostForumReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDiscThread || !newForumReplyText.trim()) return;

    const reply = CommunityService.addReply(username, activeDiscThread.id, {
      authorId: myUserId,
      authorName: data.profile.name || data.profile.login,
      authorAvatar: data.profile.avatar_url || "U",
      content: newForumReplyText
    });

    const threadReps = getThreadReplies(activeDiscThread.id);
    setRepliesMap(prev => ({
      ...prev,
      [activeDiscThread.id]: [...threadReps, reply]
    }));

    setDiscussions(CommunityService.getDiscussions(username));
    setNewForumReplyText("");
  };

  // Handle Accepted Answer
  const handleAcceptAnswer = (replyId: string) => {
    if (!activeDiscThread) return;
    const { discussions: updatedDiscs, replies: updatedReps } = CommunityService.acceptAnswer(
      username,
      activeDiscThread.id,
      replyId
    );
    setDiscussions(updatedDiscs);
    setRepliesMap(prev => ({ ...prev, [activeDiscThread.id]: updatedReps }));
  };

  // Handle Message Sent
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatUser || (!newChatMessage.trim() && !chatCodeSnippet.trim())) return;

    const newMsg = CommunityService.sendMessage(
      username,
      activeChatUser.uid,
      myUserId,
      newChatMessage,
      showChatCodeDrawer && chatCodeSnippet.trim() ? chatCodeSnippet : undefined,
      showChatCodeDrawer && chatCodeSnippet.trim() ? chatCodeLanguage : undefined
    );

    setChatMessages([...chatMessages, newMsg]);
    setNewChatMessage("");
    setChatCodeSnippet("");
    setShowChatCodeDrawer(false);
  };

  // Universal Search Filters
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
  }, [posts, searchQuery]);

  const filteredDiscussions = useMemo(() => {
    if (!searchQuery) return discussions;
    const q = searchQuery.toLowerCase();
    return discussions.filter(d => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)));
  }, [discussions, searchQuery]);

  const filteredDevelopers = useMemo(() => {
    if (!searchQuery) return developers;
    const q = searchQuery.toLowerCase();
    return developers.filter(d => d.displayName.toLowerCase().includes(q) || d.skills.some(s => s.toLowerCase().includes(q)));
  }, [developers, searchQuery]);

  return (
    <div className="flex-grow space-y-6">
      {/* Hub Top Info */}
      <div className="p-6 rounded-xl border border-border bg-[#161B22] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-bold font-space-grotesk text-text-primary">Ecosystem Community</h2>
          </div>
          <p className="text-xs text-text-secondary">
            Connect with engineering peers, participate in technical discussions, showcase projects, and discover open-source issue matches.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
          <input
            type="text"
            placeholder="Search feed, discussions, devs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-[#0D1117] pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent font-semibold"
          />
        </div>
      </div>

      {/* Main Grid: Left Timeline Feed / Right Sidebar Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Timeline timelines (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Feed Timeline Tab View */}
          {activeSubTab === "community-feed" && (
            <div className="space-y-6">
              
              {/* Post Composer Panel */}
              <form onSubmit={handleCreatePost} className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk">
                  Share milestone or launch project
                </h3>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center font-bold text-xs text-accent">
                    U
                  </div>
                  <textarea
                    placeholder="What are you building today? Supports plain text and code blocks."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="flex-1 min-h-[80px] bg-[#0D1117] border border-border rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-accent font-semibold resize-none"
                  />
                </div>

                {/* Optional code snippet container */}
                {showCodeDrawer && (
                  <div className="bg-[#0D1117] border border-border rounded-lg p-4 space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary">
                      <span className="font-bold uppercase">Code Snippet Wrapper</span>
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="bg-[#161B22] border border-border rounded px-1 focus:outline-none"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="golang">Go</option>
                        <option value="html">HTML/CSS</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="// Write code here..."
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      className="w-full min-h-[100px] bg-[#161B22] border border-border rounded p-2 text-xs font-mono text-[#F0F6FC] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-border/60">
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowCodeDrawer(!showCodeDrawer)}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                        showCodeDrawer ? "bg-accent border-accent text-white" : "border-border bg-[#0D1117] text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Code size={12} />
                      <span>{showCodeDrawer ? "Remove Code" : "Attach Code"}</span>
                    </button>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as CommunityPost["type"])}
                      className="bg-[#0D1117] border border-border rounded-lg px-2 text-[10px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
                    >
                      <option value="general">General Post</option>
                      <option value="launch">Project Launch</option>
                      <option value="milestone">GitHub Milestone</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Send size={11} />
                    <span>Publish Post</span>
                  </button>
                </div>
              </form>

              {/* Posts Feed Timeline */}
              <div className="space-y-4">
                {filteredPosts.map(post => {
                  const hasLiked = post.likes.includes(myUserId);
                  const hasBookmarked = post.bookmarks.includes(myUserId);
                  return (
                    <div key={post.id} className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4 animate-fadeIn">
                      
                      {/* Post Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs text-text-primary">
                            {post.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-text-primary font-space-grotesk">{post.authorName}</h4>
                            <span className="text-[10px] text-text-secondary block font-mono mt-0.5">{post.authorTitle}</span>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono text-text-secondary">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-text-secondary leading-relaxed font-sans">{post.content}</p>

                      {/* Render code block if present */}
                      {post.codeSnippet && (
                        <pre className="bg-[#0D1117] border border-border rounded-lg p-4 text-xs font-mono text-[#F0F6FC] overflow-x-auto">
                          <code>{post.codeSnippet}</code>
                        </pre>
                      )}

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-border/40 text-xs">
                        <div className="flex gap-4 font-bold font-mono">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-1.5 cursor-pointer ${
                              hasLiked ? "text-danger" : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            <Heart size={13} className={hasLiked ? "fill-danger text-danger" : ""} />
                            <span>{post.likes.length}</span>
                          </button>

                          <button
                            onClick={() => setActiveSubTab("community-discussions")}
                            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary cursor-pointer"
                          >
                            <MessageSquare size={13} />
                            <span>{post.commentsCount}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleBookmarkPost(post.id)}
                          className={`cursor-pointer ${
                            hasBookmarked ? "text-accent" : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <Bookmark size={13} className={hasBookmarked ? "fill-accent text-accent" : ""} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Developers Directory Tab */}
          {activeSubTab === "community-developers" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-2">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Developers Directory</h3>
                <p className="text-xs text-text-secondary">Network with active contributors, search profiles, and connect.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDevelopers.map(dev => {
                  const isFollowing = dev.followers.includes(myUserId);
                  return (
                    <div key={dev.uid} className="p-5 rounded-xl border border-border bg-[#161B22] flex flex-col justify-between space-y-4 hover:border-border/80 transition-all animate-fadeIn">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-sm text-text-primary">
                            {dev.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-text-primary font-space-grotesk">{dev.displayName}</h4>
                            <span className="text-[10px] text-text-secondary block font-mono">@{dev.username}</span>
                            <span className="text-[10px] text-[#bc8cff] font-semibold mt-1 block">{dev.title}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-accent font-mono block">Grade {dev.grade}</span>
                          <span className="text-[9px] text-text-secondary font-mono block">{dev.reputation} REP</span>
                        </div>
                      </div>

                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {dev.skills.map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded border border-border/60 bg-[#0D1117] text-[8px] font-mono text-text-secondary">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Connection CTA */}
                      <div className="flex gap-2 pt-2 border-t border-border/40">
                        <button
                          onClick={() => handleFollowUser(dev.uid)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isFollowing
                              ? "bg-[#21262D] border border-border text-text-secondary hover:text-text-primary"
                              : "bg-accent hover:bg-accent/90 text-white"
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck size={11} />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={11} />
                              <span>Follow Developer</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setActiveChatUser(dev);
                            setActiveSubTab("community-messaging");
                          }}
                          className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Forums / Discussions Board */}
          {activeSubTab === "community-discussions" && (
            <div className="space-y-6">
              
              {/* Forum Thread view or list check */}
              {activeDiscThread ? (
                <div className="space-y-6">
                  {/* Back button */}
                  <button
                    onClick={() => setActiveDiscThread(null)}
                    className="px-3.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary rounded-lg text-xs font-bold font-space-grotesk transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    ← Back to Discussions
                  </button>

                  {/* Thread details */}
                  <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4">
                    <div className="flex justify-between items-start border-b border-border/40 pb-3">
                      <div>
                        <span className="text-[9px] font-bold text-accent uppercase tracking-wider px-2 py-0.5 rounded border border-accent/25 bg-accent/5">
                          {activeDiscThread.category}
                        </span>
                        <h3 className="text-sm font-bold text-text-primary font-space-grotesk mt-2">
                          {activeDiscThread.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-text-secondary">
                        {new Date(activeDiscThread.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2.5 items-center text-[10px] text-text-secondary font-mono">
                      <div className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-[8px] text-text-primary">
                        {activeDiscThread.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span>@{activeDiscThread.authorName}</span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed font-sans whitespace-pre-line">
                      {activeDiscThread.content}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {activeDiscThread.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded border border-border/60 bg-[#0D1117] text-[8px] font-mono text-text-secondary">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Thread Replies List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-text-primary font-space-grotesk">
                      Replies ({getThreadReplies(activeDiscThread.id).length})
                    </h4>

                    {getThreadReplies(activeDiscThread.id).map(reply => (
                      <div
                        key={reply.id}
                        className={`p-4 rounded-xl border flex gap-3 relative overflow-hidden ${
                          reply.isAnswer
                            ? "bg-[#3FB950]/5 border-[#3FB950]/30"
                            : "bg-[#161B22] border-border"
                        }`}
                      >
                        {reply.isAnswer && (
                          <div className="absolute top-2 right-2 text-[8px] font-bold text-[#3FB950] border border-[#3FB950]/40 px-1.5 py-0.5 rounded bg-[#3FB950]/10 flex items-center gap-1 uppercase">
                            <CheckCircle size={8} /> Accepted Answer
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs text-text-primary">
                          {reply.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-text-primary font-space-grotesk">{reply.authorName}</span>
                            <span className="text-[9px] font-mono text-text-secondary">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-text-secondary leading-relaxed font-sans">{reply.content}</p>
                          
                          {/* Accept Answer button toggle */}
                          {activeDiscThread.authorId === myUserId && !reply.isAnswer && (
                            <button
                              onClick={() => handleAcceptAnswer(reply.id)}
                              className="px-2.5 py-1 mt-2 bg-[#21262D] hover:bg-[#3FB950]/20 hover:border-[#3FB950]/40 border border-border text-text-secondary hover:text-[#3FB950] font-bold text-[9px] rounded transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1"
                            >
                              <CheckCircle size={10} />
                              <span>Accept as Answer</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Reply Composer */}
                  <form onSubmit={handlePostForumReply} className="p-4 rounded-xl border border-border bg-[#161B22] space-y-3">
                    <textarea
                      placeholder="Write a helpful response... Markdown supported."
                      value={newForumReplyText}
                      onChange={(e) => setNewForumReplyText(e.target.value)}
                      className="w-full min-h-[80px] bg-[#0D1117] border border-border rounded-lg p-3 text-xs text-[#F0F6FC] focus:outline-none focus:border-accent font-semibold resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                      >
                        <Send size={11} />
                        <span>Post Reply</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Discussions Header / Filters */}
                  <div className="p-6 rounded-xl border border-border bg-[#161B22] flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Discussions Forum</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Engage in categorized Q&A dialogues and help peers.</p>
                    </div>

                    <button
                      onClick={() => setShowDiscModal(true)}
                      className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <Plus size={12} />
                      <span>Start Discussion</span>
                    </button>
                  </div>

                  {/* Create Discussion Modal */}
                  {showDiscModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
                      <div className="w-full max-w-lg rounded-xl border border-border bg-[#161B22] shadow-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold font-space-grotesk text-text-primary">Start New Discussion</h3>
                        
                        <form onSubmit={handleCreateDiscussion} className="space-y-3.5 text-xs font-semibold">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-text-secondary block font-bold">Category</label>
                            <select
                              value={discCategory}
                              onChange={(e) => setDiscCategory(e.target.value as DiscussionThread["category"])}
                              className="w-full bg-[#0D1117] border border-border rounded-lg p-2 focus:outline-none"
                            >
                              <option value="frontend">Frontend Development</option>
                              <option value="backend">Backend Systems</option>
                              <option value="ai">AI / LLM Integrations</option>
                              <option value="opensource">Open Source Collaboration</option>
                              <option value="devops">DevOps & CI/CD</option>
                              <option value="career">Career Insights</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-text-secondary block font-bold">Discussion Title</label>
                            <input
                              type="text"
                              placeholder="e.g. How to manage state inside nested React Portals?"
                              value={discTitle}
                              onChange={(e) => setDiscTitle(e.target.value)}
                              className="w-full bg-[#0D1117] border border-border rounded-lg p-2 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-text-secondary block font-bold">Discussion Content</label>
                            <textarea
                              placeholder="Write details of your question here. Paste code snippets if necessary."
                              value={discContent}
                              onChange={(e) => setDiscContent(e.target.value)}
                              className="w-full min-h-[100px] bg-[#0D1117] border border-border rounded-lg p-3 focus:outline-none resize-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-text-secondary block font-bold">Tags (Comma separated)</label>
                            <input
                              type="text"
                              placeholder="React, State, Portals"
                              value={discTags}
                              onChange={(e) => setDiscTags(e.target.value)}
                              className="w-full bg-[#0D1117] border border-border rounded-lg p-2 focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => setShowDiscModal(false)}
                              className="px-4 py-1.5 border border-border hover:bg-[#0D1117] text-text-secondary rounded-lg font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-primary text-white rounded-lg font-bold"
                            >
                              Create Thread
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Discussions list */}
                  <div className="space-y-3">
                    {filteredDiscussions.map(disc => {
                      const upvoted = disc.upvotes.includes(myUserId);
                      return (
                        <div
                          key={disc.id}
                          className="p-5 rounded-xl border border-border bg-[#161B22] flex gap-4 items-start justify-between hover:border-border/80 transition-all cursor-pointer animate-fadeIn"
                          onClick={() => setActiveDiscThread(disc)}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] bg-accent/15 text-accent border border-accent/25 px-1.5 rounded uppercase font-bold">
                                {disc.category}
                              </span>
                              <span className="text-[9px] text-text-secondary font-mono">@{disc.authorName}</span>
                            </div>

                            <h4 className="text-xs font-bold text-[#F0F6FC] hover:text-accent transition-colors font-space-grotesk">
                              {disc.title}
                            </h4>

                            <div className="flex flex-wrap gap-1">
                              {disc.tags.map(t => (
                                <span key={t} className="px-1.5 py-0.5 rounded border border-border/40 bg-[#0D1117] text-[8px] font-mono text-text-secondary">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 items-center" onClick={(e) => e.stopPropagation()}>
                            {/* Upvote score */}
                            <button
                              onClick={() => handleLikePost(disc.id) /* shared action */}
                              className={`p-2 rounded-lg border flex flex-col items-center justify-center min-w-[32px] cursor-pointer ${
                                upvoted ? "border-accent bg-accent/10 text-accent" : "border-border bg-[#0D1117] text-text-secondary hover:text-text-primary"
                              }`}
                            >
                              <ThumbsUp size={11} />
                              <span className="text-[8px] font-mono font-bold mt-1">{disc.upvotes.length}</span>
                            </button>

                            {/* Replies count */}
                            <div className="p-2 rounded-lg border border-border bg-[#0D1117] text-text-secondary flex flex-col items-center min-w-[32px]">
                              <MessageSquare size={11} />
                              <span className="text-[8px] font-mono font-bold mt-1">{disc.repliesCount}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Showcase Gallery */}
          {activeSubTab === "community-showcase" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22]">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Developer Showcase</h3>
                <p className="text-xs text-text-secondary mt-1">Review live projects published by developers in our community.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.filter(p => p.type === "launch").map(post => (
                  <div key={post.id} className="p-5 rounded-xl border border-border bg-[#161B22] flex flex-col justify-between space-y-4 hover:border-border/80 transition-all animate-fadeIn">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-bold text-accent border border-accent/20 bg-accent/5 px-2 py-0.5 rounded uppercase">Project Launch</span>
                        <span className="text-[9px] font-mono text-text-secondary">@{post.authorName}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-sans">{post.content}</p>
                    </div>

                    {post.codeSnippet && (
                      <pre className="bg-[#0D1117] border border-border rounded-lg p-3 text-[10px] font-mono text-[#F0F6FC] overflow-x-auto max-h-36">
                        <code>{post.codeSnippet}</code>
                      </pre>
                    )}

                    <div className="flex justify-between items-center border-t border-border/40 pt-3 text-[10px] text-text-secondary font-mono">
                      <span>Likes: {post.likes.length}</span>
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="px-3 py-1 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary font-bold rounded-md transition-colors cursor-pointer"
                      >
                        Like Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Source Hub */}
          {activeSubTab === "community-opensource" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-2">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Open Source Contributor Matching</h3>
                <p className="text-xs text-text-secondary">Find beginner-friendly good first issues parsed from active repositories.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-border bg-[#161B22] flex items-center justify-between text-xs animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 px-1.5 py-0.5 rounded font-bold uppercase">Good First Issue</span>
                    <h4 className="font-bold text-[#F0F6FC] font-space-grotesk mt-1.5">Vuejs/vite: hydration errors guide docs update</h4>
                    <p className="text-text-secondary text-[11px] font-sans">Help document hydrated states for server modules inside setup wrappers.</p>
                  </div>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0D1117] hover:bg-[#161B22] border border-border rounded-lg text-text-secondary hover:text-text-primary transition-all">
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="p-4 rounded-xl border border-border bg-[#161B22] flex items-center justify-between text-xs animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 px-1.5 py-0.5 rounded font-bold uppercase">Good First Issue</span>
                    <h4 className="font-bold text-[#F0F6FC] font-space-grotesk mt-1.5">facebook/react: fix warnings typo in dev modes</h4>
                    <p className="text-text-secondary text-[11px] font-sans">Fix a typo message printed during duplicate portal instantiation.</p>
                  </div>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0D1117] hover:bg-[#161B22] border border-border rounded-lg text-text-secondary hover:text-text-primary transition-all">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Events Listings */}
          {activeSubTab === "community-events" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22]">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Community Events</h3>
                <p className="text-xs text-text-secondary mt-1">Join upcoming hackathons, tech workshops, and developer AMAs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4 relative overflow-hidden animate-fadeIn">
                  <div className="absolute top-4 right-4 text-[9px] bg-accent/20 border border-accent/40 text-accent px-2 py-0.5 rounded uppercase font-bold">Hackathon</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#F0F6FC] font-space-grotesk">AI Agentic hackathon 2026</h4>
                    <p className="text-xs text-text-secondary">Build autonomic coding agents that solve repository issues natively.</p>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-4 border-t border-border/40 font-mono">
                    <span className="text-emerald-400 font-bold">$10,000 Prize Pool</span>
                    <button className="px-3 py-1 bg-accent text-white font-bold rounded-lg text-[10px] cursor-pointer">RSVP</button>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-4 relative overflow-hidden animate-fadeIn">
                  <div className="absolute top-4 right-4 text-[9px] bg-[#bc8cff]/20 border border-[#bc8cff]/40 text-[#bc8cff] px-2 py-0.5 rounded uppercase font-bold">AMA session</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#F0F6FC] font-space-grotesk">AMA with Evan You</h4>
                    <p className="text-xs text-text-secondary">Discussing Vite 6 module bundling structures and framework architectures.</p>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-4 border-t border-border/40 font-mono">
                    <span className="text-text-secondary">Starts in 3 Days</span>
                    <button className="px-3 py-1 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary font-bold rounded-lg text-[10px] cursor-pointer">Set Reminder</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Groups */}
          {activeSubTab === "community-studygroups" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22]">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Study Groups & Peer Learning</h3>
                <p className="text-xs text-text-secondary mt-1">Join engineering study groups to master specific languages or technologies.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#F0F6FC] font-space-grotesk">System Design Study Group</h4>
                    <span className="text-[9px] text-text-secondary font-mono">42 Members</span>
                  </div>
                  <p className="text-xs text-text-secondary">Discussing distributed systems consensus, event logs, replication, and caching.</p>
                  <button className="w-full py-1.5 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary font-bold text-[10px] rounded-lg cursor-pointer">Join Study Group</button>
                </div>

                <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#F0F6FC] font-space-grotesk">Rust Compiler Internals</h4>
                    <span className="text-[9px] text-text-secondary font-mono">18 Members</span>
                  </div>
                  <p className="text-xs text-text-secondary">Exploring memory ownership, borrow checker validations, and macros engines.</p>
                  <button className="w-full py-1.5 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary font-bold text-[10px] rounded-lg cursor-pointer">Join Study Group</button>
                </div>
              </div>
            </div>
          )}

          {/* Developer Clubs */}
          {activeSubTab === "community-clubs" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22]">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Developer Clubs</h3>
                <p className="text-xs text-text-secondary mt-1">Connect with developers from universities, corporations, or local user groups.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-[#F0F6FC] font-space-grotesk">Stanford Computer Science Club</h4>
                  <p className="text-xs text-text-secondary">Official student engineering club portal on DevTrack.</p>
                  <button className="w-full py-1.5 bg-[#21262D] border border-border text-[10px] text-text-secondary font-bold rounded-lg opacity-60 flex items-center justify-center gap-1 cursor-not-allowed">
                    <Lock size={10} /> Stanford Email Verified Only
                  </button>
                </div>

                <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-[#F0F6FC] font-space-grotesk">Berlin Rustaceans</h4>
                  <p className="text-xs text-text-secondary">Local meetup chapter mapping Rustaceans in Berlin.</p>
                  <button className="w-full py-1.5 bg-[#21262D] hover:bg-[#30363D] border border-border text-text-primary font-bold text-[10px] rounded-lg cursor-pointer">Request Invitation</button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Board with dynamic Match Scoring */}
          {activeSubTab === "community-jobs" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22] space-y-2">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Ecosystem Job Board</h3>
                <p className="text-xs text-text-secondary">Discover open roles showing matching percentage calibrated against your GitHub DNA languages.</p>
              </div>

              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="p-5 rounded-xl border border-border bg-[#161B22] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-border/80 transition-all animate-fadeIn">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F0F6FC] font-space-grotesk">{job.role}</span>
                        <span className="text-[10px] text-text-secondary font-mono">@{job.company}</span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-text-secondary font-mono font-semibold">
                        <span>💰 {job.salary}</span>
                        <span>📍 {job.location}</span>
                        <span>💼 {job.experience}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requirements.map((req: string) => (
                          <span key={req} className="px-2 py-0.5 rounded border border-border bg-[#0D1117] text-[8px] font-mono text-text-secondary">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right justify-between w-full md:w-auto">
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-secondary font-mono block">Git DNA Match</span>
                        <span className={`text-xs font-bold font-mono block ${
                          job.matchScore >= 80 ? "text-[#3FB950]" : job.matchScore >= 50 ? "text-[#D29922]" : "text-text-secondary"
                        }`}>{job.matchScore}%</span>
                      </div>

                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold text-[10px] rounded-lg transition-colors uppercase tracking-wider text-center"
                      >
                        Apply Role
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inbox Notifications */}
          {activeSubTab === "community-notifications" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-[#161B22]">
                <h3 className="text-sm font-bold text-text-primary font-space-grotesk">Inbox Notifications</h3>
                <p className="text-xs text-text-secondary mt-1">Review activity notifications from followers and peer interactions.</p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-[#161B22] relative">
                <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-border/60" />
                <div className="space-y-6 relative">
                  <div className="flex items-start gap-4 text-xs font-semibold pl-1.5 animate-fadeIn">
                    <div className="w-5 h-5 rounded-full bg-accent/25 border border-accent flex items-center justify-center text-[10px] text-accent z-10 font-bold bg-[#161B22]">
                      ✓
                    </div>
                    <div className="flex-1 bg-[#0D1117]/80 border border-border/60 rounded-xl p-3.5 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-text-primary font-space-grotesk">Evan You followed you</h4>
                        <span className="text-[10px] text-text-secondary font-mono">Today</span>
                      </div>
                      <p className="text-text-secondary text-[11px] font-sans">Evan You connected with your profile. Review their latest showcases!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 text-xs font-semibold pl-1.5 animate-fadeIn">
                    <div className="w-5 h-5 rounded-full bg-accent/25 border border-accent flex items-center justify-center text-[10px] text-accent z-10 font-bold bg-[#161B22]">
                      ✓
                    </div>
                    <div className="flex-1 bg-[#0D1117]/80 border border-border/60 rounded-xl p-3.5 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-text-primary font-space-grotesk">Dan Abramov liked your project showcase</h4>
                        <span className="text-[10px] text-text-secondary font-mono">Yesterday</span>
                      </div>
                      <p className="text-text-secondary text-[11px] font-sans">Your recent launch post was liked. Keep sharing engineering milestones!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Direct Messaging Client widget */}
          {activeSubTab === "community-messaging" && (
            <div className="grid grid-cols-1 md:grid-cols-3 border border-border rounded-xl bg-[#161B22] overflow-hidden min-h-[460px]">
              
              {/* Direct Messages sidebar (Span 1) */}
              <div className="border-r border-border bg-[#0D1117] p-4 space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk border-b border-border/40 pb-2">
                  Conversations
                </h3>
                <div className="space-y-2">
                  {developers.slice(0, 3).map(dev => (
                    <button
                      key={dev.uid}
                      onClick={() => setActiveChatUser(dev)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        activeChatUser?.uid === dev.uid
                          ? "bg-accent/15 border-accent text-white"
                          : "border-border bg-[#161B22]/30 text-text-secondary hover:text-text-primary hover:bg-[#161B22]/60"
                      }`}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs text-text-primary">
                          {dev.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#3FB950] border-2 border-[#0D1117]" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold font-space-grotesk block truncate text-[#F0F6FC]">{dev.displayName}</span>
                        <span className="text-[9px] font-mono text-text-secondary truncate block mt-0.5">Online</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Viewport Area (Span 2) */}
              <div className="md:col-span-2 flex flex-col justify-between bg-[#161B22]/20 relative">
                {activeChatUser ? (
                  <>
                    {/* Chat header */}
                    <div className="p-4 border-b border-border bg-[#0D1117] flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs text-text-primary">
                          {activeChatUser.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#F0F6FC] font-space-grotesk block">{activeChatUser.displayName}</span>
                          <span className="text-[9px] text-[#3FB950] font-mono block">typing...</span>
                        </div>
                      </div>
                    </div>

                    {/* Messages feed */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] scrollbar-thin">
                      {chatMessages.map(msg => {
                        const isMe = msg.senderId === myUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 max-w-[80%] ${
                              isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-[9px] text-text-primary flex-shrink-0">
                              {isMe ? "U" : activeChatUser.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className={`p-3 rounded-xl border text-xs ${
                              isMe
                                ? "bg-accent/15 border-accent/40 text-text-primary rounded-tr-none"
                                : "bg-[#0D1117]/80 border-border text-text-secondary rounded-tl-none"
                            }`}>
                              <p className="font-sans leading-relaxed">{msg.content}</p>
                              {msg.codeSnippet && (
                                <pre className="bg-[#161B22] border border-border rounded-lg p-2.5 text-[10px] font-mono text-[#F0F6FC] mt-2 overflow-x-auto">
                                  <code>{msg.codeSnippet}</code>
                                </pre>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat composer */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-[#0D1117] space-y-2.5">
                      {showChatCodeDrawer && (
                        <div className="bg-[#161B22] border border-border rounded-lg p-3 space-y-2 animate-fadeIn text-xs">
                          <div className="flex justify-between items-center text-[9px] font-mono text-text-secondary">
                            <span>Code Snippet Payload</span>
                            <select
                              value={chatCodeLanguage}
                              onChange={(e) => setChatCodeLanguage(e.target.value)}
                              className="bg-[#0D1117] border border-border rounded px-1 focus:outline-none"
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="typescript">TypeScript</option>
                              <option value="golang">Go</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="// Write code here..."
                            value={chatCodeSnippet}
                            onChange={(e) => setChatCodeSnippet(e.target.value)}
                            className="w-full min-h-[80px] bg-[#0D1117] border border-border rounded p-2 font-mono text-white focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowChatCodeDrawer(!showChatCodeDrawer)}
                          className={`px-3 border rounded-lg text-xs font-bold font-mono cursor-pointer ${
                            showChatCodeDrawer ? "bg-accent border-accent text-white" : "border-border bg-[#161B22] text-text-secondary"
                          }`}
                        >
                          Code
                        </button>
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          className="flex-1 appearance-none rounded-lg border border-border bg-[#161B22] px-3.5 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-accent font-semibold"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-text-secondary text-xs">
                    <MessageSquare size={20} className="mb-2 text-text-secondary opacity-60" />
                    <span>Select a conversation from the list to start messaging.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Trending / Insights Sidebar Panel (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Reputation card */}
          <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk border-b border-border pb-2 flex items-center gap-1.5">
              <Award size={13} className="text-accent" />
              <span>Community Reputation</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Community Level:</span>
                <span className="font-bold text-text-primary">Level 8 — Contributor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Reputation Score:</span>
                <span className="font-bold text-accent">1,240 REP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Accepted Answers:</span>
                <span className="font-bold text-emerald-400">14 Solutions</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-bold mb-2">Unlocked Community Badges</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded border border-[#3FB950]/30 bg-[#3FB950]/5 text-[#3FB950] text-[8px] font-mono uppercase tracking-wider font-bold">Helpful Mentor</span>
                <span className="px-2 py-0.5 rounded border border-[#bc8cff]/30 bg-[#bc8cff]/5 text-[#bc8cff] text-[8px] font-mono uppercase tracking-wider font-bold">Top Contributor</span>
              </div>
            </div>
          </div>

          {/* Suggested Connections */}
          <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk border-b border-border pb-2 flex items-center gap-1.5">
              <UserPlus size={13} className="text-accent" />
              <span>Suggested Developers</span>
            </h3>

            <div className="space-y-3">
              {developers.slice(0, 3).map(dev => (
                <div key={dev.uid} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-[10px] text-text-primary">
                      {dev.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold font-space-grotesk block text-text-primary leading-tight">{dev.displayName}</span>
                      <span className="text-[9px] text-[#bc8cff] block font-mono">{dev.title}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollowUser(dev.uid)}
                    className="px-2 py-1 bg-[#21262D] border border-border hover:bg-[#30363D] text-[9px] font-bold rounded cursor-pointer"
                  >
                    {dev.followers.includes(myUserId) ? "Unfollow" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Community Events widget */}
          <div className="p-5 rounded-xl border border-border bg-[#161B22] space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary font-space-grotesk border-b border-border pb-2 flex items-center gap-1.5">
              <Calendar size={13} className="text-accent" />
              <span>Upcoming Events</span>
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1 text-xs">
                <span className="text-[10px] text-[#D29922] font-mono block">July 12, 2026</span>
                <span className="font-bold text-text-primary font-space-grotesk block leading-snug">Vite 6 launch showcase AMA</span>
                <p className="text-[10px] text-text-secondary leading-normal">Interactive AMA with Evan You about bundle configurations.</p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] text-accent font-mono block">July 18, 2026</span>
                <span className="font-bold text-text-primary font-space-grotesk block leading-snug">React Server Components Workshop</span>
                <p className="text-[10px] text-text-secondary leading-normal">Deep dive detailing hydration resolution models.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
