import { GitHubActivityService, LiveEvent } from "./github/github-activity.service";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  difficulty: "Easy" | "Medium" | "Hard";
  timeEst: string;
  type: "daily" | "weekly" | "monthly";
  status: "locked" | "active" | "completed";
  verificationKey: string;
  progress: number; // 0 to 1
  manualRequired?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: string | null; // Date ISO string, null if locked
  progress: number; // 0 to 1
}

export interface DeveloperState {
  totalXp: number;
  level: number;
  rankTitle: string;
  streak: number;
  successRate: number;
  completedCount: number;
  activeDaily: Challenge[];
  activeWeekly: Challenge[];
  activeMonthly: Challenge[];
  achievements: Achievement[];
  history: Array<{ id: string; type: "challenge" | "achievement" | "level"; title: string; xpEarned: number; date: string }>;
  unlockedTitles: string[];
  unlockedFrames: string[];
  unlockedThemes: string[];
  selectedTitle: string;
  selectedFrame: string;
  selectedTheme: string;
}

const XP_MAP: Record<string, number> = {
  commit: 5,
  merged_pr: 25,
  issue_closed: 10,
  repo_created: 30,
  doc_update: 15,
  readme_update: 20,
  os_contribution: 40
};

export function getXpRequiredForLevel(level: number): number {
  return level * 200;
}

export function getLevelRankTitle(level: number): string {
  if (level >= 100) return "Legend";
  if (level >= 75) return "Principal Engineer";
  if (level >= 50) return "Architect";
  if (level >= 35) return "Tech Lead";
  if (level >= 20) return "Senior Engineer";
  if (level >= 10) return "Software Engineer";
  if (level >= 5) return "Junior Developer";
  return "Code Explorer";
}

// Initial achievements template
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "ach-first-commit", title: "First Commit", description: "Push your first commit via version control.", icon: "🔥", xpReward: 50, unlockedAt: null, progress: 0 },
  { id: "ach-first-repo", title: "First Repository", description: "Create your first original repository on GitHub.", icon: "🚀", xpReward: 100, unlockedAt: null, progress: 0 },
  { id: "ach-first-star", title: "First Star", description: "Earn your first star on any public repository.", icon: "⭐", xpReward: 100, unlockedAt: null, progress: 0 },
  { id: "ach-commits-100", title: "100 Commits Club", description: "Log 100 total commits over your activity history.", icon: "💯", xpReward: 250, unlockedAt: null, progress: 0 },
  { id: "ach-commits-500", title: "500 Commits Master", description: "Push 500 total commits across repositories.", icon: "🏆", xpReward: 500, unlockedAt: null, progress: 0 },
  { id: "ach-commits-1000", title: "Git Legend", description: "Surpass 1,000 total commits in repository velocity.", icon: "👑", xpReward: 1000, unlockedAt: null, progress: 0 },
  { id: "ach-streak-30", title: "Hyper Consistent", description: "Maintain a coding streak of 30 days.", icon: "⚡", xpReward: 500, unlockedAt: null, progress: 0 },
  { id: "ach-stars-100", title: "Famous Developer", description: "Accumulate 100 stars across all repositories.", icon: "🌟", xpReward: 1000, unlockedAt: null, progress: 0 },
  { id: "ach-os-hero", title: "Open Source Hero", description: "Contribute to 5+ remote open-source repositories.", icon: "🤝", xpReward: 500, unlockedAt: null, progress: 0 },
  { id: "ach-readme-master", title: "README Master", description: "Write comprehensive README index structures on all repos.", icon: "📘", xpReward: 200, unlockedAt: null, progress: 0 },
  { id: "ach-testing-champion", title: "Testing Champion", description: "Push 10 commits verified containing unit test suites.", icon: "🧪", xpReward: 250, unlockedAt: null, progress: 0 },
  { id: "ach-cloud-explorer", title: "Cloud Explorer", description: "Deploy 2+ projects containing containerization configurations.", icon: "☁", xpReward: 300, unlockedAt: null, progress: 0 },
  { id: "ach-consistency-king", title: "Consistency King", description: "Active coding days exceed 60 days locally.", icon: "🎯", xpReward: 400, unlockedAt: null, progress: 0 }
];

export const ChallengesEngine = {
  // Load developer state
  getInitialState(username: string): DeveloperState {
    if (typeof window === "undefined") {
      return {
        totalXp: 0,
        level: 1,
        rankTitle: "Code Explorer",
        streak: 0,
        successRate: 100,
        completedCount: 0,
        activeDaily: [],
        activeWeekly: [],
        activeMonthly: [],
        achievements: DEFAULT_ACHIEVEMENTS,
        history: [],
        unlockedTitles: ["Code Explorer"],
        unlockedFrames: ["Standard Border"],
        unlockedThemes: ["Midnight Dark"],
        selectedTitle: "Code Explorer",
        selectedFrame: "Standard Border",
        selectedTheme: "Midnight Dark"
      };
    }

    const cached = localStorage.getItem(`devtrack_gamification_${username}`);
    if (cached) {
      try {
        const state = JSON.parse(cached) as DeveloperState;
        // Merge missing achievements templates if any
        if (state.achievements.length !== DEFAULT_ACHIEVEMENTS.length) {
          const merged = [...DEFAULT_ACHIEVEMENTS];
          state.achievements.forEach(a => {
            const idx = merged.findIndex(m => m.id === a.id);
            if (idx !== -1) merged[idx] = a;
          });
          state.achievements = merged;
        }
        return state;
      } catch (e) {}
    }

    // Default state
    const defaultState: DeveloperState = {
      totalXp: 0,
      level: 1,
      rankTitle: "Code Explorer",
      streak: 0,
      successRate: 100,
      completedCount: 0,
      activeDaily: [
        { id: "d-push-1", title: "Push 1 Commit", description: "Commit and push your local modifications to GitHub.", xpReward: 10, difficulty: "Easy", timeEst: "10 mins", type: "daily", status: "active", verificationKey: "commits:1", progress: 0 },
        { id: "d-issue-1", title: "Open or Close an Issue", description: "Log an issue report or close a resolved bug index.", xpReward: 15, difficulty: "Easy", timeEst: "15 mins", type: "daily", status: "active", verificationKey: "issue:1", progress: 0 },
        { id: "d-refactor-1", title: "Refactor Existing Code", description: "Structure code bases. Commit message must contain 'refactor'.", xpReward: 25, difficulty: "Medium", timeEst: "45 mins", type: "daily", status: "active", verificationKey: "refactor:1", progress: 0, manualRequired: true },
        { id: "d-readme-1", title: "Update Documentation", description: "Improve README files. Commit message must contain 'readme' or 'docs'.", xpReward: 20, difficulty: "Easy", timeEst: "10 mins", type: "daily", status: "active", verificationKey: "readme:1", progress: 0 }
      ],
      activeWeekly: [
        { id: "w-commits-20", title: "20 Commits Sprint", description: "Surpass 20 commits across this week.", xpReward: 100, difficulty: "Medium", timeEst: "4 days", type: "weekly", status: "active", verificationKey: "commits:20", progress: 0 },
        { id: "w-pr-3", title: "PR Collaborative Merge", description: "Merge or reviews 3 pull requests.", xpReward: 120, difficulty: "Hard", timeEst: "3 days", type: "weekly", status: "active", verificationKey: "pr:3", progress: 0 },
        { id: "w-os-1", title: "Contribute to Open Source", description: "Commit or PR to a repository owned by another developer.", xpReward: 150, difficulty: "Hard", timeEst: "5 days", type: "weekly", status: "active", verificationKey: "os_contribution:1", progress: 0 }
      ],
      activeMonthly: [
        { id: "m-commits-50", title: "50 Commits Marathon", description: "Log 50 commits over the month.", xpReward: 250, difficulty: "Hard", timeEst: "15 days", type: "monthly", status: "active", verificationKey: "commits:50", progress: 0 },
        { id: "m-stars-5", title: "Gain 5 Stars", description: "Accumulate 5 new stargazers on public repos.", xpReward: 150, difficulty: "Medium", timeEst: "20 days", type: "monthly", status: "active", verificationKey: "stars:5", progress: 0 },
        { id: "m-streak-10", title: "Maintain 10-Day Streak", description: "Code consistently for 10 active days.", xpReward: 200, difficulty: "Medium", timeEst: "10 days", type: "monthly", status: "active", verificationKey: "streak:10", progress: 0 }
      ],
      achievements: DEFAULT_ACHIEVEMENTS,
      history: [],
      unlockedTitles: ["Code Explorer"],
      unlockedFrames: ["Standard Border"],
      unlockedThemes: ["Midnight Dark"],
      selectedTitle: "Code Explorer",
      selectedFrame: "Standard Border",
      selectedTheme: "Midnight Dark"
    };

    localStorage.setItem(`devtrack_gamification_${username}`, JSON.stringify(defaultState));
    return defaultState;
  },

  // Save developer state
  saveState(username: string, state: DeveloperState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`devtrack_gamification_${username}`, JSON.stringify(state));
  },

  // Awards XP to player, checks for level up
  awardXp(state: DeveloperState, amount: number, sourceTitle: string): { updatedState: DeveloperState; levelUp: boolean } {
    const updated = { ...state };
    updated.totalXp += amount;
    
    // Add history log entry
    updated.history = [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        type: "challenge",
        title: sourceTitle,
        xpEarned: amount,
        date: new Date().toISOString().split("T")[0]
      },
      ...updated.history
    ];

    // Compute Level up check
    let currentLvl = updated.level;
    let xpNeeded = getXpRequiredForLevel(currentLvl);
    let tempXp = updated.totalXp;
    
    // Sum previous level XP requirements
    let levelCheck = 1;
    let accumulatedXp = 0;
    while (levelCheck < currentLvl) {
      accumulatedXp += getXpRequiredForLevel(levelCheck);
      levelCheck++;
    }
    
    let xpInCurrentLevel = tempXp - accumulatedXp;
    let levelUpOccurred = false;

    while (xpInCurrentLevel >= getXpRequiredForLevel(currentLvl)) {
      xpInCurrentLevel -= getXpRequiredForLevel(currentLvl);
      currentLvl++;
      levelUpOccurred = true;
    }

    if (levelUpOccurred) {
      updated.level = currentLvl;
      updated.rankTitle = getLevelRankTitle(currentLvl);
      
      // Log level up in history
      updated.history = [
        {
          id: `lvl-${Date.now()}`,
          type: "level",
          title: `Leveled Up to Level ${currentLvl} (${updated.rankTitle})`,
          xpEarned: 0,
          date: new Date().toISOString().split("T")[0]
        },
        ...updated.history
      ];

      // Add unlocks
      const unlockReward = this.checkLevelUnlocks(currentLvl);
      if (unlockReward.title && !updated.unlockedTitles.includes(unlockReward.title)) {
        updated.unlockedTitles.push(unlockReward.title);
      }
      if (unlockReward.frame && !updated.unlockedFrames.includes(unlockReward.frame)) {
        updated.unlockedFrames.push(unlockReward.frame);
      }
      if (unlockReward.theme && !updated.unlockedThemes.includes(unlockReward.theme)) {
        updated.unlockedThemes.push(unlockReward.theme);
      }
    }

    return { updatedState: updated, levelUp: levelUpOccurred };
  },

  checkLevelUnlocks(level: number): { title?: string; frame?: string; theme?: string } {
    if (level === 5) return { title: "Git Novice" };
    if (level === 10) return { title: "Software Engineer", theme: "Slate Blue" };
    if (level === 20) return { title: "Senior Engineer", frame: "Neon Border" };
    if (level === 35) return { title: "Tech Lead", theme: "Cyberpunk Violet" };
    if (level === 50) return { title: "Architect", frame: "Golden Frame" };
    if (level === 75) return { title: "Principal Engineer", frame: "Holographic Highlight" };
    if (level === 100) return { title: "Legendary Dev", theme: "Cosmic Glow" };
    return {};
  },

  // Scans user activity logs to verify active challenges
  async verifyActivity(username: string, token: string, state: DeveloperState): Promise<{ updatedState: DeveloperState; newlyCompleted: string[]; earnedXp: number }> {
    const updated = { ...state };
    let earnedXp = 0;
    const newlyCompleted: string[] = [];

    // Get live activity events from GitHub
    const events = await GitHubActivityService.fetchUserEvents(username, token);
    
    // Sort events from today, this week (7d), and this month (30d)
    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date();
    const localTodayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);

    const todayEvents = events.filter(e => {
      const eDate = new Date(e.createdAt);
      const eDateOnly = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
      return eDateOnly.getTime() === localTodayOnly.getTime();
    });

    const weeklyEvents = events.filter(e => new Date(e.createdAt) >= oneWeekAgo);
    const monthlyEvents = events.filter(e => new Date(e.createdAt) >= oneMonthAgo);

    // Map helper to evaluate challenge progress
    const checkChallenge = (chal: Challenge, evts: LiveEvent[]): { progress: number; status: Challenge["status"] } => {
      if (chal.status === "completed") return { progress: 1.0, status: "completed" };

      const [key, countVal] = chal.verificationKey.split(":");
      const targetCount = parseInt(countVal, 10) || 1;
      let matchedCount = 0;

      if (key === "commits") {
        // Count pushes
        const pushes = evts.filter(e => e.type === "push");
        matchedCount = pushes.length; // Approximate 1 commit per push event
      } else if (key === "issue") {
        const issues = evts.filter(e => e.type === "issue_opened" || e.type === "issue_closed");
        matchedCount = issues.length;
      } else if (key === "issue_closed") {
        const closed = evts.filter(e => e.type === "issue_closed");
        matchedCount = closed.length;
      } else if (key === "pr") {
        const prs = evts.filter(e => e.type === "pr_opened" || e.type === "pr_merged");
        matchedCount = prs.length;
      } else if (key === "pr_review") {
        const reviews = evts.filter(e => e.type === "pr_merged" || e.type === "pr_closed");
        matchedCount = reviews.length;
      } else if (key === "create_repo") {
        const repos = evts.filter(e => e.type === "create");
        matchedCount = repos.length;
      } else if (key === "readme" || key === "docs") {
        const commits = evts.filter(e => e.type === "push" && e.details?.commitMsg?.toLowerCase().includes("readme"));
        matchedCount = commits.length;
      } else if (key === "refactor") {
        const commits = evts.filter(e => e.type === "push" && e.details?.commitMsg?.toLowerCase().includes("refactor"));
        matchedCount = commits.length;
      } else if (key === "tests") {
        const commits = evts.filter(e => e.type === "push" && e.details?.commitMsg?.toLowerCase().includes("test"));
        matchedCount = commits.length;
      } else if (key === "deploy") {
        const deploys = evts.filter(e => e.type === "push" && (e.details?.commitMsg?.toLowerCase().includes("deploy") || e.details?.commitMsg?.toLowerCase().includes("publish")));
        matchedCount = deploys.length;
      } else if (key === "os_contribution") {
        const osEvts = evts.filter(e => {
          const isOwnRepo = e.repoName.startsWith(username + "/");
          return !isOwnRepo && (e.type === "push" || e.type === "pr_opened" || e.type === "pr_merged");
        });
        matchedCount = osEvts.length;
      } else if (key === "streak") {
        matchedCount = state.streak;
      } else if (key === "stars") {
        // Fallback or incremental star gain
        matchedCount = 0;
      } else if (key === "followers") {
        matchedCount = 0;
      }

      const pct = Math.min(1.0, matchedCount / targetCount);
      return {
        progress: pct,
        status: pct >= 1.0 ? "completed" : "active"
      };
    };

    // 1. Process daily
    updated.activeDaily = updated.activeDaily.map(chal => {
      const evaluation = checkChallenge(chal, todayEvents);
      if (evaluation.status === "completed" && chal.status !== "completed") {
        newlyCompleted.push(chal.id);
        earnedXp += chal.xpReward;
        updated.completedCount++;
      }
      return { ...chal, progress: evaluation.progress, status: evaluation.status };
    });

    // 2. Process weekly
    updated.activeWeekly = updated.activeWeekly.map(chal => {
      const evaluation = checkChallenge(chal, weeklyEvents);
      if (evaluation.status === "completed" && chal.status !== "completed") {
        newlyCompleted.push(chal.id);
        earnedXp += chal.xpReward;
        updated.completedCount++;
      }
      return { ...chal, progress: evaluation.progress, status: evaluation.status };
    });

    // 3. Process monthly
    updated.activeMonthly = updated.activeMonthly.map(chal => {
      const evaluation = checkChallenge(chal, monthlyEvents);
      if (evaluation.status === "completed" && chal.status !== "completed") {
        newlyCompleted.push(chal.id);
        earnedXp += chal.xpReward;
        updated.completedCount++;
      }
      return { ...chal, progress: evaluation.progress, status: evaluation.status };
    });

    // Perform XP awards if earned
    let currentXpState = updated;
    if (earnedXp > 0) {
      const levelResults = this.awardXp(currentXpState, earnedXp, `${newlyCompleted.length} Challenges Verified`);
      currentXpState = levelResults.updatedState;
    }

    // Re-verify Achievements
    currentXpState = this.verifyAchievements(currentXpState);

    // Save progress
    this.saveState(username, currentXpState);

    return { updatedState: currentXpState, newlyCompleted, earnedXp };
  },

  // Manual verification handler for developer self-attestation
  manualVerifyChallenge(username: string, challengeId: string, state: DeveloperState): { updatedState: DeveloperState; success: boolean } {
    const updated = { ...state };
    let chal: Challenge | undefined;

    const findAndComplete = (arr: Challenge[]): boolean => {
      const idx = arr.findIndex(c => c.id === challengeId);
      if (idx !== -1 && arr[idx].status !== "completed") {
        chal = arr[idx];
        arr[idx].progress = 1.0;
        arr[idx].status = "completed";
        updated.completedCount++;
        return true;
      }
      return false;
    };

    const found = findAndComplete(updated.activeDaily) || findAndComplete(updated.activeWeekly) || findAndComplete(updated.activeMonthly);
    
    if (found && chal) {
      const levelResults = this.awardXp(updated, chal.xpReward, `${chal.title} (Self Attested)`);
      const finalState = this.verifyAchievements(levelResults.updatedState);
      this.saveState(username, finalState);
      return { updatedState: finalState, success: true };
    }

    return { updatedState: state, success: false };
  },

  // Scans achievements conditions and marks completed
  verifyAchievements(state: DeveloperState): DeveloperState {
    const updated = { ...state };
    
    // We map each achievement trigger check
    updated.achievements = updated.achievements.map(ach => {
      if (ach.unlockedAt) return ach; // Already unlocked

      let progress = 0;
      let isUnlocked = false;

      // Local heuristic triggers based on history/XP
      if (ach.id === "ach-first-commit") {
        progress = updated.completedCount >= 1 ? 1.0 : 0.2;
        isUnlocked = updated.completedCount >= 1;
      } else if (ach.id === "ach-first-repo") {
        progress = updated.history.some(h => h.title.includes("Create")) ? 1.0 : 0;
        isUnlocked = updated.history.some(h => h.title.includes("Create")) || updated.completedCount >= 3;
      } else if (ach.id === "ach-first-star") {
        isUnlocked = updated.history.some(h => h.title.includes("Stars")) || updated.level >= 3;
        progress = isUnlocked ? 1.0 : 0.3;
      } else if (ach.id === "ach-commits-100") {
        progress = Math.min(1.0, updated.totalXp / 1000);
        isUnlocked = updated.totalXp >= 1000;
      } else if (ach.id === "ach-commits-500") {
        progress = Math.min(1.0, updated.totalXp / 4000);
        isUnlocked = updated.totalXp >= 4000;
      } else if (ach.id === "ach-commits-1000") {
        progress = Math.min(1.0, updated.totalXp / 10000);
        isUnlocked = updated.totalXp >= 10000;
      } else if (ach.id === "ach-streak-30") {
        progress = Math.min(1.0, updated.streak / 30);
        isUnlocked = updated.streak >= 30;
      } else if (ach.id === "ach-os-hero") {
        const osCount = updated.history.filter(h => h.title.toLowerCase().includes("open source")).length;
        progress = Math.min(1.0, osCount / 5);
        isUnlocked = osCount >= 5;
      } else if (ach.id === "ach-readme-master") {
        const readmeCount = updated.history.filter(h => h.title.toLowerCase().includes("readme")).length;
        progress = Math.min(1.0, readmeCount / 3);
        isUnlocked = readmeCount >= 3;
      } else if (ach.id === "ach-testing-champion") {
        const testCount = updated.history.filter(h => h.title.toLowerCase().includes("test")).length;
        progress = Math.min(1.0, testCount / 5);
        isUnlocked = testCount >= 5;
      } else if (ach.id === "ach-cloud-explorer") {
        const cloudCount = updated.history.filter(h => h.title.toLowerCase().includes("deploy") || h.title.toLowerCase().includes("docker")).length;
        progress = Math.min(1.0, cloudCount / 2);
        isUnlocked = cloudCount >= 2;
      } else if (ach.id === "ach-consistency-king") {
        progress = Math.min(1.0, updated.completedCount / 30);
        isUnlocked = updated.completedCount >= 30;
      }

      if (isUnlocked) {
        return {
          ...ach,
          progress: 1.0,
          unlockedAt: new Date().toISOString().split("T")[0]
        };
      }
      return { ...ach, progress };
    });

    // Check if any newly unlocked achievements need XP rewards
    let newXpEarned = 0;
    updated.achievements.forEach((ach, idx) => {
      const prevAchState = state.achievements[idx];
      if (ach.unlockedAt && !prevAchState.unlockedAt) {
        newXpEarned += ach.xpReward;
      }
    });

    if (newXpEarned > 0) {
      // Award XP silently
      updated.totalXp += newXpEarned;
      updated.history = [
        {
          id: `ach-unlock-${Date.now()}`,
          type: "achievement",
          title: `Unlocked Achievement Awards`,
          xpEarned: newXpEarned,
          date: new Date().toISOString().split("T")[0]
        },
        ...updated.history
      ];
    }

    return updated;
  },

  // Generates simulated leaderboards
  getLeaderboards(userXp: number, username: string): Record<string, Array<{ rank: number; name: string; xp: number; level: number; isSelf?: boolean }>> {
    const listGen = (offset: number) => [
      { rank: 1, name: "yyx990803 (Evan You)", xp: 12450, level: 62 },
      { rank: 2, name: "torvalds (Linus Torvalds)", xp: 10840, level: 54 },
      { rank: 3, name: "gaearon (Dan Abramov)", xp: 9530, level: 47 },
      { rank: 4, name: "charlie_dev", xp: 5200 + offset, level: 26 },
      { rank: 5, name: "elizabeth_code", xp: 4800 + offset, level: 24 },
      { rank: 6, name: "marcus_engineer", xp: 3200 + offset, level: 16 }
    ];

    const insertUser = (list: any[]) => {
      const userLevel = calculateLevelFromXp(userXp).level;
      const userItem = { rank: 99, name: username, xp: userXp, level: userLevel, isSelf: true };
      
      const fullList = [...list, userItem].sort((a, b) => b.xp - a.xp);
      return fullList.map((item, idx) => ({ ...item, rank: idx + 1 }));
    };

    return {
      global: insertUser(listGen(0)),
      friends: insertUser([
        { rank: 1, name: "alex_coder", xp: 2500, level: 12 },
        { rank: 2, name: "sophie_dev", xp: 1800, level: 9 },
        { rank: 3, name: "robert_sys", xp: 900, level: 4 }
      ]),
      org: insertUser([
        { rank: 1, name: "tech_lead_ver", xp: 7500, level: 37 },
        { rank: 2, name: "senior_cloud_eng", xp: 5800, level: 29 }
      ]),
      country: insertUser(listGen(-1000))
    };
  }
};

function calculateLevelFromXp(totalXp: number): { level: number; currentXp: number; nextLevelXp: number } {
  let level = 1;
  let xpNeeded = getXpRequiredForLevel(level);
  let remainingXp = totalXp;
  
  while (remainingXp >= xpNeeded) {
    remainingXp -= xpNeeded;
    level++;
    xpNeeded = getXpRequiredForLevel(level);
  }
  
  return {
    level,
    currentXp: remainingXp,
    nextLevelXp: xpNeeded
  };
}
