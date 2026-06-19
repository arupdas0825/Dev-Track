import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

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

let app: any;
let auth: any;
let db: any;
let analytics: any;

if (isFirebaseEnabled) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize analytics only on supported client browsers
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
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
      username,
      token,
    };

    // Save user profile state
    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_current_user", JSON.stringify(dtUser));
    }

    return dtUser;
  } else {
    // Mock Login: Generates a mock user state in local storage after a short delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser: DevTrackUser = {
      uid: "mock-uid-alex-rivera-99",
      email: "alex@devtrack.io",
      displayName: "Alex Rivera",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
      username: "devtrack-demo",
      token: "mock-github-access-token",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("devtrack_current_user", JSON.stringify(mockUser));
    }
    
    return mockUser;
  }
}

export async function logOutUser(): Promise<void> {
  if (isFirebaseEnabled && auth) {
    await signOut(auth);
  }
  
  if (typeof window !== "undefined") {
    localStorage.removeItem("devtrack_current_user");
  }
}

export function subscribeToAuthChanges(callback: (user: DevTrackUser | null) => void): () => void {
  if (isFirebaseEnabled && auth) {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Retrieve saved screenName or local storage session token
        let token: string | undefined = undefined;
        let storedUserStr = localStorage.getItem("devtrack_current_user");
        if (storedUserStr) {
          try {
            const parsed = JSON.parse(storedUserStr);
            if (parsed.uid === user.uid) {
              token = parsed.token;
            }
          } catch (e) {}
        }
        
        const username = (user as any).reloadUserInfo?.screenName || user.displayName?.toLowerCase().replace(/\s/g, "") || "developer";
        
        const dtUser: DevTrackUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          username,
          token,
        };
        
        localStorage.setItem("devtrack_current_user", JSON.stringify(dtUser));
        callback(dtUser);
      } else {
        localStorage.removeItem("devtrack_current_user");
        callback(null);
      }
    });
  } else {
    // Mock subscription: Check local storage on mount and invoke callback
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("devtrack_current_user");
      if (stored) {
        try {
          callback(JSON.parse(stored));
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
    }
    // Return empty unsubscribe function
    return () => {};
  }
}

// 2. Firestore Sync Handlers
export async function saveDeveloperMetrics(username: string, data: any): Promise<void> {
  if (isFirebaseEnabled && db) {
    try {
      const userDocRef = doc(db, "developer_profiles", username.toLowerCase());
      await setDoc(userDocRef, {
        username: username.toLowerCase(),
        data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Firestore save failed:", error);
    }
  } else {
    // Local storage sync fallback
    if (typeof window !== "undefined") {
      localStorage.setItem(`devtrack_profile_${username.toLowerCase()}`, JSON.stringify({
        username: username.toLowerCase(),
        data,
        updatedAt: new Date().toISOString(),
      }));
    }
  }
}

export async function getSavedDeveloperMetrics(username: string): Promise<any | null> {
  if (isFirebaseEnabled && db) {
    try {
      const userDocRef = doc(db, "developer_profiles", username.toLowerCase());
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data().data;
      }
    } catch (error) {
      console.error("Firestore fetch failed:", error);
    }
    return null;
  } else {
    // Local storage fetch fallback
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
}
