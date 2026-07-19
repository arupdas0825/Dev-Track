/**
 * devfeedService.ts
 * Service layer for DevFeed — posts, likes, comments, follows.
 * Follows exact conventions of src/lib/firebase.ts:
 *   - Guards every function with isFirebaseEnabled / db check
 *   - Uses increment() for counters (no read-modify-write)
 *   - Explicit return types on all exported functions
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  increment,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DevFeedPost,
  DevFeedLike,
  DevFeedComment,
  DevFeedFollow,
  CreatePostInput,
} from "@/types/devfeed";
import { DevTrackUser } from "@/types/user";

const isFirebaseEnabled =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ─── helpers ──────────────────────────────────────────────────────────────────

function assertFirebase(): void {
  if (!isFirebaseEnabled || !db) {
    throw new Error(
      "Firebase is not initialized or configured. Cannot perform DevFeed operation."
    );
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function docToPost(snap: QueryDocumentSnapshot<DocumentData>): DevFeedPost {
  const d = snap.data();
  return {
    id: snap.id,
    authorId: d.authorId,
    authorUsername: d.authorUsername,
    authorDisplayName: d.authorDisplayName ?? null,
    authorAvatarUrl: d.authorAvatarUrl ?? null,
    content: d.content,
    type: d.type,
    codeSnippet: d.codeSnippet ?? null,
    codeLanguage: d.codeLanguage ?? null,
    imageUrl: d.imageUrl ?? null,
    likesCount: d.likesCount ?? 0,
    commentsCount: d.commentsCount ?? 0,
    createdAt: d.createdAt,
  };
}

function docToComment(snap: QueryDocumentSnapshot<DocumentData>): DevFeedComment {
  const d = snap.data();
  return {
    id: snap.id,
    postId: d.postId,
    authorId: d.authorId,
    authorUsername: d.authorUsername,
    authorDisplayName: d.authorDisplayName ?? null,
    authorAvatarUrl: d.authorAvatarUrl ?? null,
    content: d.content,
    createdAt: d.createdAt,
  };
}

// ─── posts ────────────────────────────────────────────────────────────────────

/**
 * Creates a new post authored by the given user.
 */
export async function createPost(
  author: DevTrackUser,
  input: CreatePostInput
): Promise<DevFeedPost> {
  assertFirebase();

  const postsRef = collection(db!, "posts");
  const postRef = doc(postsRef);
  const now = new Date().toISOString();

  const payload: Omit<DevFeedPost, "id"> = {
    authorId: author.uid,
    authorUsername: author.username,
    authorDisplayName: author.displayName ?? null,
    authorAvatarUrl: author.photoURL ?? null,
    content: input.content,
    type: input.type,
    codeSnippet: input.codeSnippet ?? null,
    codeLanguage: input.codeLanguage ?? null,
    imageUrl: input.imageUrl ?? null,
    likesCount: 0,
    commentsCount: 0,
    createdAt: now,
  };

  await setDoc(postRef, payload);

  // Increment postsCount on the author's user doc (merge-safe)
  const userRef = doc(db!, "users", author.uid);
  await setDoc(userRef, { postsCount: increment(1) }, { merge: true });

  return { id: postRef.id, ...payload };
}

// ─── feed ─────────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20;

/**
 * Global feed across all users ("Everyone" tab).
 * Uses single-field query + client-side sorting so no composite index is required.
 */
export async function getEveryoneFeed(
  cursor?: string,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ posts: DevFeedPost[]; nextCursor: string | null }> {
  assertFirebase();

  const q = query(collection(db!, "posts"), limit(200));
  const snap = await getDocs(q);
  const allPosts: DevFeedPost[] = [];
  snap.forEach((s) => allPosts.push(docToPost(s)));

  allPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  let startIndex = 0;
  if (cursor) {
    const idx = allPosts.findIndex((p) => p.createdAt === cursor);
    startIndex = idx !== -1 ? idx + 1 : allPosts.findIndex((p) => p.createdAt < cursor);
    if (startIndex === -1) startIndex = allPosts.length;
  }

  const page = allPosts.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < allPosts.length;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].createdAt : null;

  return { posts: page, nextCursor };
}

/**
 * Pull-based feed for a user: their own posts + posts from followed users.
 * Respects Firestore's 30-item `in` operator limit by chunking author IDs.
 * Uses single-field queries and client-side sorting so no composite index is required.
 */
export async function getFeedForUser(
  uid: string,
  cursor?: string,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ posts: DevFeedPost[]; nextCursor: string | null }> {
  assertFirebase();

  // 1. Resolve the set of authors: uid + everyone uid follows
  const followsSnap = await getDocs(
    query(collection(db!, "follows"), where("followerId", "==", uid))
  );
  const authorIds: string[] = [uid];
  followsSnap.forEach((s) => {
    const f = s.data() as DevFeedFollow;
    if (!authorIds.includes(f.followingId)) {
      authorIds.push(f.followingId);
    }
  });

  // 2. Chunk into groups of 30 (Firestore `in` limit)
  const chunks = chunkArray(authorIds, 30);

  // 3. Fire all chunk queries in parallel (using single-field index only)
  const allPosts: DevFeedPost[] = [];
  await Promise.all(
    chunks.map(async (chunk) => {
      const q = query(
        collection(db!, "posts"),
        where("authorId", "in", chunk),
        limit(200)
      );
      const snap = await getDocs(q);
      snap.forEach((s) => allPosts.push(docToPost(s)));
    })
  );

  // 4. Sort by createdAt desc in memory
  allPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  // 5. Apply cursor and pagination
  let startIndex = 0;
  if (cursor) {
    const idx = allPosts.findIndex((p) => p.createdAt === cursor);
    startIndex = idx !== -1 ? idx + 1 : allPosts.findIndex((p) => p.createdAt < cursor);
    if (startIndex === -1) startIndex = allPosts.length;
  }

  const page = allPosts.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < allPosts.length;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].createdAt : null;

  return { posts: page, nextCursor };
}

/**
 * Fetches posts by a specific username (for profile Posts tab).
 * Uses single-field query + client-side sort so no composite index is required.
 */
export async function getPostsByUsername(
  username: string,
  cursor?: string,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ posts: DevFeedPost[]; nextCursor: string | null }> {
  assertFirebase();

  const q = query(
    collection(db!, "posts"),
    where("authorUsername", "==", username.toLowerCase()),
    limit(200)
  );

  const snap = await getDocs(q);
  const allPosts: DevFeedPost[] = [];
  snap.forEach((s) => allPosts.push(docToPost(s)));

  allPosts.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  let startIndex = 0;
  if (cursor) {
    const idx = allPosts.findIndex((p) => p.createdAt === cursor);
    startIndex = idx !== -1 ? idx + 1 : allPosts.findIndex((p) => p.createdAt < cursor);
    if (startIndex === -1) startIndex = allPosts.length;
  }

  const page = allPosts.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < allPosts.length;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].createdAt : null;

  return { posts: page, nextCursor };
}


// ─── likes ────────────────────────────────────────────────────────────────────

/**
 * Toggles a like on a post. Uses a write batch to atomically update the like
 * doc and the post's likesCount via increment() — safe under concurrent writes.
 */
export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean }> {
  assertFirebase();

  const likeId = `${postId}_${userId}`;
  const likeRef = doc(db!, "likes", likeId);
  const postRef = doc(db!, "posts", postId);

  const existing = await getDoc(likeRef);

  const batch = writeBatch(db!);

  if (existing.exists()) {
    // Unlike
    batch.delete(likeRef);
    batch.update(postRef, { likesCount: increment(-1) });
    await batch.commit();
    return { liked: false };
  } else {
    // Like
    const payload: DevFeedLike = {
      postId,
      userId,
      createdAt: new Date().toISOString(),
    };
    batch.set(likeRef, payload);
    batch.update(postRef, { likesCount: increment(1) });
    await batch.commit();
    return { liked: true };
  }
}

/**
 * Checks if a user has liked a specific post.
 */
export async function isLiked(postId: string, userId: string): Promise<boolean> {
  assertFirebase();
  const likeRef = doc(db!, "likes", `${postId}_${userId}`);
  const snap = await getDoc(likeRef);
  return snap.exists();
}

// ─── comments ─────────────────────────────────────────────────────────────────

/**
 * Adds a comment to a post. Atomically increments the post's commentsCount.
 */
export async function addComment(
  postId: string,
  author: DevTrackUser,
  content: string
): Promise<DevFeedComment> {
  assertFirebase();

  const commentsRef = collection(db!, "comments");
  const commentRef = doc(commentsRef);
  const postRef = doc(db!, "posts", postId);
  const now = new Date().toISOString();

  const payload: Omit<DevFeedComment, "id"> = {
    postId,
    authorId: author.uid,
    authorUsername: author.username,
    authorDisplayName: author.displayName ?? null,
    authorAvatarUrl: author.photoURL ?? null,
    content,
    createdAt: now,
  };

  const batch = writeBatch(db!);
  batch.set(commentRef, payload);
  batch.update(postRef, { commentsCount: increment(1) });
  await batch.commit();

  return { id: commentRef.id, ...payload };
}

/**
 * Fetches all comments for a post, ordered by createdAt ascending.
 */
export async function getComments(postId: string): Promise<DevFeedComment[]> {
  assertFirebase();

  const q = query(
    collection(db!, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  const comments: DevFeedComment[] = [];
  snap.forEach((s) => comments.push(docToComment(s)));
  return comments;
}

// ─── follows ──────────────────────────────────────────────────────────────────

/**
 * Toggles a follow relationship. Atomically updates devFeedFollowersCount /
 * devFeedFollowingCount on both user docs.
 */
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<{ following: boolean }> {
  assertFirebase();

  const followId = `${followerId}_${followingId}`;
  const followRef = doc(db!, "follows", followId);
  const followerUserRef = doc(db!, "users", followerId);
  const followingUserRef = doc(db!, "users", followingId);

  const existing = await getDoc(followRef);
  const batch = writeBatch(db!);

  if (existing.exists()) {
    // Unfollow
    batch.delete(followRef);
    batch.set(followerUserRef, { devFeedFollowingCount: increment(-1) }, { merge: true });
    batch.set(followingUserRef, { devFeedFollowersCount: increment(-1) }, { merge: true });
    await batch.commit();
    return { following: false };
  } else {
    // Follow
    const payload: DevFeedFollow = {
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    };
    batch.set(followRef, payload);
    batch.set(followerUserRef, { devFeedFollowingCount: increment(1) }, { merge: true });
    batch.set(followingUserRef, { devFeedFollowersCount: increment(1) }, { merge: true });
    await batch.commit();
    return { following: true };
  }
}

/**
 * Checks if followerId is currently following followingId.
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  assertFirebase();
  const followRef = doc(db!, "follows", `${followerId}_${followingId}`);
  const snap = await getDoc(followRef);
  return snap.exists();
}

/**
 * Resolves a username to a uid by querying users collection.
 * Returns null if not found.
 */
export async function getUserUidByUsername(
  username: string
): Promise<string | null> {
  assertFirebase();
  const q = query(
    collection(db!, "users"),
    where("username", "==", username.toLowerCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return (snap.docs[0].data() as { uid: string }).uid;
}

/**
 * Returns up to `limitCount` users that the current user doesn't already follow,
 * ordered by their devFeedFollowersCount descending.
 * Excludes the current user.
 */
export interface SuggestedDeveloper {
  uid: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  devFeedFollowersCount: number;
}

export async function getSuggestedDevelopers(
  currentUserId: string,
  limitCount = 5
): Promise<SuggestedDeveloper[]> {
  if (!isFirebaseEnabled || !db) return [];
  try {
    // Get all users this person already follows
    const followsSnap = await getDocs(
      query(collection(db, "follows"), where("followerId", "==", currentUserId))
    );
    const alreadyFollowing = new Set<string>([currentUserId]);
    followsSnap.forEach((s) => {
      const d = s.data() as { followingId: string };
      alreadyFollowing.add(d.followingId);
    });

    // Get top users by follower count
    const usersSnap = await getDocs(
      query(collection(db, "users"), orderBy("devFeedFollowersCount", "desc"), limit(50))
    );

    const results: SuggestedDeveloper[] = [];
    usersSnap.forEach((s) => {
      if (results.length >= limitCount) return;
      const d = s.data() as {
        uid: string;
        username: string;
        displayName?: string | null;
        avatarUrl?: string | null;
        bio?: string | null;
        devFeedFollowersCount?: number;
      };
      if (alreadyFollowing.has(d.uid)) return;
      results.push({
        uid: d.uid,
        username: d.username,
        displayName: d.displayName ?? null,
        avatarUrl: d.avatarUrl ?? null,
        bio: d.bio ?? null,
        devFeedFollowersCount: d.devFeedFollowersCount ?? 0,
      });
    });
    return results;
  } catch {
    return [];
  }
}

/**
 * Fetches all comments by a specific user (for the profile Comments tab).
 */
export async function getCommentsByAuthorId(
  authorId: string,
  pageSize = 20
): Promise<DevFeedComment[]> {
  assertFirebase();
  const q = query(
    collection(db!, "comments"),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  const comments: DevFeedComment[] = [];
  snap.forEach((s) => comments.push(docToComment(s)));
  return comments;
}

/**
 * Fetches all bookmarked (liked) post IDs for a user.
 */
export async function getLikedPostIds(userId: string): Promise<string[]> {
  if (!isFirebaseEnabled || !db) return [];
  try {
    const q = query(collection(db, "likes"), where("userId", "==", userId), limit(200));
    const snap = await getDocs(q);
    const ids: string[] = [];
    snap.forEach((s) => {
      const d = s.data() as DevFeedLike;
      ids.push(d.postId);
    });
    return ids;
  } catch {
    return [];
  }
}

/**
 * Fetches posts by an array of post IDs (for saved/bookmarked view).
 */
export async function getPostsByIds(postIds: string[]): Promise<DevFeedPost[]> {
  if (!isFirebaseEnabled || !db || postIds.length === 0) return [];
  try {
    const chunks = chunkArray(postIds, 30);
    const all: DevFeedPost[] = [];
    await Promise.all(
      chunks.map(async (chunk) => {
        const q = query(collection(db!, "posts"), where("__name__", "in", chunk));
        const snap = await getDocs(q);
        snap.forEach((s) => all.push(docToPost(s)));
      })
    );
    all.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    return all;
  } catch {
    return [];
  }
}

/**
 * Fetches users that `uid` is following (for the network panel).
 */
export async function getFollowingUsers(uid: string): Promise<SuggestedDeveloper[]> {
  if (!isFirebaseEnabled || !db) return [];
  try {
    const followsSnap = await getDocs(
      query(collection(db, "follows"), where("followerId", "==", uid), limit(100))
    );
    const followingIds: string[] = [];
    followsSnap.forEach((s) => {
      const d = s.data() as { followingId: string };
      followingIds.push(d.followingId);
    });
    if (followingIds.length === 0) return [];

    const chunks = chunkArray(followingIds, 30);
    const users: SuggestedDeveloper[] = [];
    await Promise.all(
      chunks.map(async (chunk) => {
        const q = query(collection(db!, "users"), where("uid", "in", chunk));
        const snap = await getDocs(q);
        snap.forEach((s) => {
          const d = s.data() as {
            uid: string;
            username: string;
            displayName?: string | null;
            avatarUrl?: string | null;
            bio?: string | null;
            devFeedFollowersCount?: number;
          };
          users.push({
            uid: d.uid,
            username: d.username,
            displayName: d.displayName ?? null,
            avatarUrl: d.avatarUrl ?? null,
            bio: d.bio ?? null,
            devFeedFollowersCount: d.devFeedFollowersCount ?? 0,
          });
        });
      })
    );
    return users;
  } catch {
    return [];
  }
}

