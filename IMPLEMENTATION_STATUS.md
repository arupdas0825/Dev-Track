# DevTrack Implementation Status — Real GitHub Data Engine

This document details the completed features, Firestore database layout, API orchestration, and security enhancements for the developer intelligence layer of DevTrack.

---

## Completed Features

### 1. Real GitHub Data Integration (API Service Layer)
* Implemented modular service layers inside `src/services/github/`:
  - **`github-user.service.ts`**: Direct interaction with `/user` (authenticated profile) and `/users/{username}` (public lookup).
  - **`github-repository.service.ts`**: Directly fetches repositories for users with pagination up to 100 repositories.
  - **`github-analytics.service.ts`**: Processes repository files, sums stargazers/forks, groups language bytes, and calculates consistency/streaks, overall developer index score, and AI career recommendations.
* Removed mock elements, fake statistics, and loading loops. All dashboard stats are computed from live GitHub API metrics.

### 2. Segregated Database Synchronization & Caching
* Moved Firestore document syncing from flat developer profiles to three distinct collections:
  - **`users` Collection:** Stores user details and authentication metadata at path `users/{uid}`.
  - **`repositories` Subcollection:** Stores detailed repository analytics at path `repositories/{uid}/items/{repoName}`.
  - **`analytics` Collection:** Stores computed language data, developer scores, and AI recommendations at path `analytics/{uid}`.
* Implemented first-login vs returning user detection, preserving document `createdAt` while updating `lastLogin`.

### 3. Reusable React Custom Hooks
* Built modular custom hooks in `src/hooks/` to subscribe to database records or fall back to live fetches:
  - **`useGithubProfile.ts`**: Subscribes to profile doc in Firestore or falls back to live profile fetch.
  - **`useRepositories.ts`**: Subscribes to repositories subcollection in Firestore.
  - **`useAnalytics.ts`**: Subscribes to computed developer analytics in Firestore.
* Integrated hooks within `src/components/dashboard/DashboardContent.tsx` with skeleton loading states and robust offline fallbacks on API rate limiting.

### 4. Security Enhancements
* Audited and moved all Firebase configuration constants to Next.js environment variables.
* Added pattern-based exclusions in `.gitignore` for `.env`, `.env.local`, and Firebase service account private key files.
* Created a `.env.example` file to outline configuration requirements.

---

## Database Structure (Firestore Layout)

```
Firestore
 ├── users/
 │    └── {uid}  --> UserProfileDoc (flat fields: uid, githubId, username, displayName, email, avatarUrl, bio, followers, following, publicRepos, createdAt, lastLogin)
 ├── repositories/
 │    └── {uid}/
 │         └── items/
 │              └── {repoName} --> Repository details (name, description, language, stars, forks, watchers, visibility, createdDate, updatedDate)
 └── analytics/
      └── {uid}  --> UserAnalyticsDoc (totalRepositories, totalStars, totalForks, topLanguages, languageDistribution, mostActiveLanguage, openSourceScore, activityScore, developerScore, scoreBreakdown, contributions, aiInsights, wrapped)
```

---

## Data & API Orchestration Flow

### Authentication Flow
1. User clicks **Login with GitHub** in UI.
2. Firebase Authentication handles OAuth pop-up, returning the Firebase `User` object and the GitHub Access Token.
3. Access token is stored in `localStorage` under `devtrack_github_token`.
4. Firebase Auth listener triggers, and the dashboard transitions.

### GitHub API & Firestore Sync Flow
1. Logged-in user loads `/dashboard`.
2. UI checks `getUserFromFirestore(targetUser)`.
3. If found, displays cached profile, repositories, and analytics immediately.
4. Concurrently dispatches a background task calling `syncUserAndReposInFirestore()`:
   - Fetches live `/user`, `/user/repos`, and `/user/events` from GitHub API.
   - Saves flat profile to `users/{uid}`.
   - Batch writes repositories to `repositories/{uid}/items/{repoName}`.
   - Computes stats and saves to `analytics/{uid}`.
   - Updates local state, rendering fresh data reactively.
5. If lookup fails or rate limits trigger, the dashboard falls back to cached Firestore data.

---

## Next Development Phases (Roadmap)
1. **Repository Quality Inspection:** Drill down into repository size, build configs, commit structures, and issue resolution speeds.
2. **AI Career Roadmap Upgrades:** Connect AI recommendations to local developer trends and specific skills.
3. **Advanced Rate Limit Caching:** Implement request batching and server-side proxies to optimize API call thresholds.
