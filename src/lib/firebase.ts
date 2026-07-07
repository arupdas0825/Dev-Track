import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut, onAuthStateChanged, User, Auth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { UserDashboardData, GitHubRepository, GitHubProfile, ContributionStats, DeveloperScore, UserProfileDoc, UserAnalyticsDoc, DevTrackUser } from "../types";
export type { DevTrackUser };
import { GitHubUserService } from "../services/github/github-user.service";
import { GitHubRepositoryService } from "../services/github/github-repository.service";
import { GitHubAnalyticsService } from "../services/github/github-analytics.service";
import { GitHubContributionService } from "../services/github/github-contribution.service";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if variables are configured
const isFirebaseEnabled = 
  typeof window !== "undefined" && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
export let db: Firestore | undefined;
let analytics: Analytics | undefined;


if (isFirebaseEnabled) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize analytics only on supported client browsers
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app!);
        }
      }).catch(() => {});
    }
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
  }
}

// 1. Auth Handlers
export async function signInWithGitHub(): Promise<DevTrackUser> {
  if (isFirebaseEnabled && auth) {
    const provider = new GithubAuthProvider();
    provider.addScope("read:user");
    provider.addScope("repo");
    
    const result = await signInWithPopup(auth, provider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || undefined;
    const user = result.user;
    
    // Extract github username from profile
    const username = (user as any).reloadUserInfo?.screenName || user.displayName?.toLowerCase().replace(/\s/g, "") || "developer";

    const dtUser: DevTrackUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      username: username.toLowerCase(),
      token,
    };

    // Save user profile state
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_current_user", JSON.stringify(dtUser));
      if (token) {
        localStorage.setItem("devtrack_github_token", token);
      }
    }

    return dtUser;
  } else {
    // Under strict "No mock data" requirement, throw error if configuration is missing
    throw new Error("Firebase configuration is missing or disabled. Cannot log in.");
  }
}

export async function logOutUser(): Promise<void> {
  if (isFirebaseEnabled && auth) {
    await signOut(auth);
  }
  
  if (typeof window !== "undefined") {
    localStorage.removeItem("devtrack_current_user");
    localStorage.removeItem("devtrack_github_token");
  }
}

export function subscribeToAuthChanges(callback: (user: DevTrackUser | null) => void): () => void {
  if (isFirebaseEnabled && auth) {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Retrieve saved screenName or local storage session token
        let token: string | undefined = undefined;
        const storedUserStr = localStorage.getItem("devtrack_current_user");
        if (storedUserStr) {
          try {
            const parsed = JSON.parse(storedUserStr);
            if (parsed.uid === user.uid) {
              token = parsed.token;
            }
          } catch (e) {}
        }
        
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("devtrack_github_token") || undefined;
        }
        
        const username = (user as any).reloadUserInfo?.screenName || user.displayName?.toLowerCase().replace(/\s/g, "") || "developer";
        
        const dtUser: DevTrackUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          username: username.toLowerCase(),
          token,
        };
        
        localStorage.setItem("devtrack_current_user", JSON.stringify(dtUser));
        callback(dtUser);
      } else {
        localStorage.removeItem("devtrack_current_user");
        localStorage.removeItem("devtrack_github_token");
        callback(null);
      }
    });
  } else {
    if (typeof window !== "undefined") {
      callback(null);
    }
    return () => {};
  }
}

// 2. Firestore Sync Handlers (Phases 1, 2, 3 & 6)
export async function syncUserAndReposInFirestore(
  uid: string,
  username: string,
  token?: string
): Promise<UserDashboardData> {
  if (!isFirebaseEnabled || !db) {
    throw new Error("Firebase is not initialized or configured.");
  }

  // 1. Fetch live profile and repos from services
  const profile = await GitHubUserService.fetchUserProfile(username, token);
  const repositories = await GitHubRepositoryService.fetchUserProfileRepos(username, token);

  // 2. Fetch live contributions from GitHubContributionService
  const contributions = await GitHubContributionService.fetchUserContributions(username, token);

  // 3. Compute analytics and dashboard data
  const { analyticsDoc, dashboardData } = GitHubAnalyticsService.calculateDashboardAnalytics(
    uid,
    profile,
    repositories,
    contributions
  );

  // 4. Save profile in users/{uid}
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);
  const now = new Date().toISOString();
  let createdAt = now;
  let privacy: "public" | "unlisted" | "private" = "public";
  let pinnedRepos: string[] = [];
  if (userDocSnap.exists()) {
    const existing = userDocSnap.data();
    if (existing.createdAt) {
      createdAt = existing.createdAt;
    }
    if (existing.privacy) {
      privacy = existing.privacy;
    }
    if (existing.pinnedRepos) {
      pinnedRepos = existing.pinnedRepos;
    }
  }

  const profilePayload: UserProfileDoc = {
    uid,
    githubId: profile.id,
    username: profile.login.toLowerCase(),
    displayName: profile.name || null,
    email: profile.email || null,
    avatarUrl: profile.avatar_url || null,
    bio: profile.bio || null,
    company: profile.company || null,
    location: profile.location || null,
    blog: profile.blog || null,
    followers: profile.followers,
    following: profile.following,
    publicRepos: profile.public_repos,
    createdAt,
    lastLogin: now,
    privacy,
    pinnedRepos
  };

  await setDoc(userDocRef, profilePayload, { merge: true });

  // 5. Save repositories in repositories/{uid}/items subcollection
  const batch = writeBatch(db);
  for (const repo of repositories) {
    const repoDocRef = doc(db, "repositories", uid, "items", repo.name);
    batch.set(repoDocRef, {
      name: repo.name,
      description: repo.description || null,
      language: repo.language || null,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      visibility: repo.private ? "private" : "public",
      createdDate: repo.created_at,
      updatedDate: repo.updated_at,
      size: repo.size || 0,
      fork: repo.fork || false,
    }, { merge: true });
  }
  await batch.commit();

  // 6. Save analytics in analytics/{uid}
  const analyticsDocRef = doc(db, "analytics", uid);
  await setDoc(analyticsDocRef, analyticsDoc, { merge: true });

  // Also update local storage cache for fast rendering
  if (typeof window !== "undefined") {
    localStorage.setItem(`devtrack_profile_${username.toLowerCase()}`, JSON.stringify({
      username: username.toLowerCase(),
      data: dashboardData,
      updatedAt: now,
    }));
  }

  return dashboardData;
}

export async function getUserFromFirestore(username: string, targetUid?: string): Promise<UserDashboardData | null> {
  if (!isFirebaseEnabled || !db) {
    return null;
  }

  try {
    let uid = targetUid;
    let profileData: UserProfileDoc | null = null;

    // Check if logged in user matches
    if (!uid && auth?.currentUser) {
      uid = auth.currentUser.uid;
    }

    if (uid) {
      // Direct doc lookup by uid to adhere strictly to security rules (request.auth.uid == userId)
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        profileData = userDocSnap.data() as UserProfileDoc;
      }
    }

    // Fallback query by username if direct doc lookup wasn't performed or found
    if (!profileData) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      profileData = userDoc.data() as UserProfileDoc;
      uid = profileData.uid;
    }

    if (!uid || !profileData) return null;

    // 2. Fetch analytics document from analytics/{uid}
    const analyticsDocRef = doc(db, "analytics", uid);
    const analyticsDocSnap = await getDoc(analyticsDocRef);
    if (!analyticsDocSnap.exists()) {
      return null;
    }
    const analyticsData = analyticsDocSnap.data() as UserAnalyticsDoc;

    // 3. Fetch repositories subcollection from repositories/{uid}/items
    const reposRef = collection(db, "repositories", uid, "items");
    const reposSnapshot = await getDocs(reposRef);
    const repositories: GitHubRepository[] = [];

    reposSnapshot.forEach((doc) => {
      const repoData = doc.data();
      repositories.push({
        id: repoData.id || Math.floor(Math.random() * 1000000),
        name: repoData.name,
        full_name: `${profileData!.username}/${repoData.name}`,
        html_url: `https://github.com/${profileData!.username}/${repoData.name}`,
        description: repoData.description,
        fork: repoData.fork || false,
        created_at: repoData.createdDate,
        updated_at: repoData.updatedDate,
        pushed_at: repoData.updatedDate,
        size: repoData.size || 0,
        stargazers_count: repoData.stars,
        watchers_count: repoData.watchers || repoData.stars,
        language: repoData.language,
        forks_count: repoData.forks,
        open_issues_count: 0,
        private: repoData.visibility === "private",
        visibility: repoData.visibility,
      });
    });

    // 4. Reconstruct GitHubProfile
    const profile: GitHubProfile = {
      login: profileData.username,
      id: profileData.githubId,
      avatar_url: profileData.avatarUrl || "",
      html_url: `https://github.com/${profileData.username}`,
      name: profileData.displayName,
      company: profileData.company,
      blog: profileData.blog,
      location: profileData.location,
      email: profileData.email,
      bio: profileData.bio,
      public_repos: profileData.publicRepos,
      public_gists: 0,
      followers: profileData.followers,
      following: profileData.following,
      created_at: profileData.createdAt,
    };

    const dashboardData: UserDashboardData = {
      profile,
      repositories,
      languages: analyticsData.languageDistribution || [],
      contributions: analyticsData.contributions,
      score: analyticsData.scoreBreakdown,
      aiInsights: analyticsData.aiInsights,
      wrapped: analyticsData.wrapped,
      privacy: profileData.privacy || "public",
      pinnedRepos: profileData.pinnedRepos || [],
    };

    return dashboardData;
  } catch (error: any) {
    // Gracefully handle permission errors or missing docs without polluting console
    if (error?.code !== "permission-denied") {
      console.warn("Firestore user lookup notice:", error?.message || error);
    }
    return null;
  }
}

// Deprecated wrapper functions for backward compatibility with other files if needed
export async function saveDeveloperMetrics(username: string, data: any): Promise<void> {
  // Sync wrapper, if currentUser exists we sync using the proper schema
  if (typeof window !== "undefined") {
    localStorage.setItem(`devtrack_profile_${username.toLowerCase()}`, JSON.stringify({
      username: username.toLowerCase(),
      data,
      updatedAt: new Date().toISOString(),
    }));
  }
}

export async function getSavedDeveloperMetrics(username: string): Promise<any | null> {
  const firestoreUser = await getUserFromFirestore(username);
  if (firestoreUser) {
    return firestoreUser;
  }
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`devtrack_profile_${username.toLowerCase()}`);
    if (stored) {
      try {
        return JSON.parse(stored).data;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export async function updatePublicProfileSettings(
  uid: string,
  privacy: "public" | "unlisted" | "private",
  pinnedRepos: string[]
): Promise<void> {
  if (!isFirebaseEnabled || !db) return;
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, { privacy, pinnedRepos }, { merge: true });
}
