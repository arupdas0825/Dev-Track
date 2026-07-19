export interface DevTrackUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string; // GitHub handle
  token?: string; // GitHub Access Token if retrieved
}

export interface UserProfileDoc {
  uid: string;
  githubId: number;
  username: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  lastLogin: string;
  privacy?: "public" | "unlisted" | "private";
  pinnedRepos?: string[];
  // DevFeed native social counters (separate from GitHub-sourced followers/following)
  devFeedFollowersCount?: number;
  devFeedFollowingCount?: number;
  postsCount?: number;
  // Profile analytics counters
  profileViewsCount?: number;
  postImpressionsCount?: number;
}
