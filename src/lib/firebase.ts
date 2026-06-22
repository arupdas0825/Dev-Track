import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut, onAuthStateChanged, User, Auth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { UserDashboardData, GitHubRepository, GitHubProfile, ContributionStats, DeveloperScore } from "../types";
import { fetchGitHubDashboardData } from "./github";

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
let db: Firestore | undefined;
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

// User representation for Dev-Track
export interface DevTrackUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string; // GitHub handle
  token?: string; // GitHub Access Token if retrieved
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

  // 1. Fetch complete real data from GitHub
  const dashboardData = await fetchGitHubDashboardData(username, token);

  // 2. Reference user document
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  const now = new Date().toISOString();
  let createdAt = now;

  if (userDocSnap.exists()) {
    const existingData = userDocSnap.data();
    if (existingData.createdAt) {
      createdAt = existingData.createdAt;
    }
  }

  // 3. User document payload (Phase 1, 2, & 6)
  const userPayload = {
    uid,
    githubId: dashboardData.profile.id,
    username: dashboardData.profile.login.toLowerCase(),
    displayName: dashboardData.profile.name || null,
    email: dashboardData.profile.email || null,
    avatar: dashboardData.profile.avatar_url || null,
    bio: dashboardData.profile.bio || null,
    followers: dashboardData.profile.followers,
    following: dashboardData.profile.following,
    publicRepos: dashboardData.profile.public_repos,
    githubCreatedAt: dashboardData.profile.created_at,
    createdAt,
    lastLogin: now,

    // Store calculated score metrics
    consistencyScore: dashboardData.score.consistency,
    repositoryScore: dashboardData.score.repoQuality,
    diversityScore: dashboardData.score.diversity,
    communityScore: dashboardData.score.openSource,
    complexityScore: dashboardData.score.complexity,
    overallScore: dashboardData.score.overall,
    scoreBreakdown: dashboardData.score.breakdown,

    // Nested payloads for dashboard reconstruction
    score: dashboardData.score,
    contributions: dashboardData.contributions,
    aiInsights: dashboardData.aiInsights,
    wrapped: dashboardData.wrapped,
    languages: dashboardData.languages,
  };

  await setDoc(userDocRef, userPayload, { merge: true });

  // 4. Batch store repositories in subcollection (Phase 3)
  const batch = writeBatch(db);
  for (const repo of dashboardData.repositories) {
    const repoDocRef = doc(db, "users", uid, "repositories", repo.name);
    batch.set(repoDocRef, {
      name: repo.name,
      description: repo.description || null,
      language: repo.language || null,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      visibility: repo.private ? "private" : "public",
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      size: repo.size || 0,
      fork: repo.fork || false,
    }, { merge: true });
  }

  await batch.commit();

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

export async function getUserFromFirestore(username: string): Promise<UserDashboardData | null> {
  if (!isFirebaseEnabled || !db) {
    return null;
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    // Fetch repositories subcollection
    const reposRef = collection(db, "users", uid, "repositories");
    const reposSnapshot = await getDocs(reposRef);
    const repositories: GitHubRepository[] = [];

    reposSnapshot.forEach((doc) => {
      const repoData = doc.data();
      repositories.push({
        id: repoData.id || Math.floor(Math.random() * 1000000),
        name: repoData.name,
        full_name: `${userData.username}/${repoData.name}`,
        html_url: `https://github.com/${userData.username}/${repoData.name}`,
        description: repoData.description,
        fork: repoData.fork || false,
        created_at: repoData.createdAt,
        updated_at: repoData.updatedAt,
        pushed_at: repoData.updatedAt,
        size: repoData.size || 0,
        stargazers_count: repoData.stars,
        watchers_count: repoData.stars,
        language: repoData.language,
        forks_count: repoData.forks,
        open_issues_count: 0,
      });
    });

    // Reconstruct GitHubProfile
    const profile: GitHubProfile = {
      login: userData.username,
      id: userData.githubId,
      avatar_url: userData.avatar,
      html_url: `https://github.com/${userData.username}`,
      name: userData.displayName,
      company: userData.company || null,
      blog: userData.blog || null,
      location: userData.location || null,
      email: userData.email,
      bio: userData.bio,
      public_repos: userData.publicRepos,
      public_gists: userData.publicGists || 0,
      followers: userData.followers,
      following: userData.following,
      created_at: userData.githubCreatedAt,
    };

    const contributions: ContributionStats = userData.contributions;
    const score: DeveloperScore = userData.score;
    const aiInsights = userData.aiInsights;
    const wrapped = userData.wrapped;
    const languages = userData.languages || [];

    const dashboardData: UserDashboardData = {
      profile,
      repositories,
      languages,
      contributions,
      score,
      aiInsights,
      wrapped,
    };

    return dashboardData;
  } catch (error) {
    console.error("Failed to fetch user from Firestore:", error);
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
