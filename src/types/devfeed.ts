// DevFeed Phase 1 — Firestore-mapped types

export type PostType = "milestone" | "launch" | "learning" | "general";

// posts/{postId}
export interface DevFeedPost {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  content: string;
  type: PostType;
  codeSnippet: string | null;
  codeLanguage: string | null;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string; // ISO string
}

// likes/{postId}_{userId}  — composite doc id
export interface DevFeedLike {
  postId: string;
  userId: string;
  createdAt: string;
}

// comments/{commentId}  — top-level collection, filtered by postId
export interface DevFeedComment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

// follows/{followerId}_{followingId}  — composite doc id
export interface DevFeedFollow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

// Input shape for createPost
export interface CreatePostInput {
  content: string;
  type: PostType;
  codeSnippet?: string;
  codeLanguage?: string;
  imageUrl?: string;
}
