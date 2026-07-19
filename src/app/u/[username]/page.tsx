"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { getUserFromFirestore, incrementProfileView, subscribeToAuthChanges } from "@/lib/firebase";
import {
  MapPin,
  Building,
  Link as LinkIcon,
  ShieldCheck,
  TrendingUp,
  Flame,
  Search,
  BadgeCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Share2,
  Loader2,
  Users,
  GitBranch,
  Star,
  GitFork,
  FileText,
  BarChart2,
  Image,
  Video,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ShareModal from "@/components/dashboard/ShareModal";
import { useGithubProfile } from "@/hooks/useGithubProfile";
import { useRepositories } from "@/hooks/useRepositories";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DevTrackUser, UserProfileDoc } from "@/types/user";
import { DevFeedComment } from "@/types/devfeed";
import { UserDashboardData } from "@/types";
import { getUserUidByUsername, getCommentsByAuthorId } from "@/services/devfeedService";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import dynamic from "next/dynamic";
import { ToastProvider } from "@/components/devfeed/useToast";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonFeed } from "@/components/ui/SkeletonLoader";
import DeveloperBattleModal from "@/components/card/DeveloperBattleModal";
import { useAuthModal } from "@/components/auth/AuthModalContext";

const FollowButton = dynamic(() => import("@/components/devfeed/FollowButton"), { ssr: false });
const ProfilePostsTab = dynamic(() => import("@/components/devfeed/ProfilePostsTab"), { ssr: false });

// ─── Language color map (simplified) ─────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

// ─── Profile Header ───────────────────────────────────────────────────────────

function ProfileHeader({
  activeData,
  profileDoc,
  profileUid,
  currentUser,
  isOwnProfile,
  isUnclaimed,
  onShare,
  onBattle,
}: {
  activeData: UserDashboardData;
  profileDoc: UserProfileDoc | null;
  profileUid: string | null;
  currentUser: DevTrackUser | null;
  isOwnProfile: boolean;
  isUnclaimed: boolean;
  onShare: () => void;
  onBattle: () => void;
}) {
  const { profile } = activeData;
  const devFeedFollowers = profileDoc?.devFeedFollowersCount ?? 0;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden mb-4">
      {/* Cover gradient */}
      <div className="h-24 sm:h-32 bg-gradient-to-r from-accent/30 via-accent/10 to-surface-secondary relative" />

      {/* Avatar + actions row */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 -mt-10 sm:-mt-12">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.name || profile.login}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-surface object-cover bg-surface-secondary"
              />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-surface bg-surface-secondary flex items-center justify-center text-accent font-bold text-3xl">
                {(profile.name || profile.login)[0].toUpperCase()}
              </div>
            )}
            {/* Verified badge */}
            <div
              className="absolute -bottom-1 -right-1 bg-surface border border-border rounded-full p-1 text-accent"
              title="DevTrack Verified"
            >
              <BadgeCheck size={16} />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-2">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="px-4 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold text-text-primary hover:bg-surface-secondary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Edit profile
              </Link>
            ) : (
              <>
                {profileUid && (
                  <FollowButton
                    viewerUid={currentUser?.uid ?? null}
                    profileUid={profileUid}
                  />
                )}
                <a
                  href={`https://github.com/${profile.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  <ExternalLink size={12} />
                  GitHub
                </a>
              </>
            )}
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              aria-label="Share profile"
            >
              <Share2 size={12} />
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="mt-3">
          <h1 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2 flex-wrap">
            {profile.name || profile.login}
            <BadgeCheck size={18} className="text-accent flex-shrink-0" />
          </h1>
          <p className="text-sm text-text-secondary">@{profile.login}</p>

          {profile.bio && (
            <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-2xl line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {profile.location && (
              <span className="flex items-center gap-1 text-[12px] text-text-secondary">
                <MapPin size={11} /> {profile.location}
              </span>
            )}
            {profile.company && (
              <span className="flex items-center gap-1 text-[12px] text-text-secondary">
                <Building size={11} /> {profile.company}
              </span>
            )}
            {profile.blog && (
              <a
                href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[12px] text-accent hover:underline"
              >
                <LinkIcon size={11} /> {profile.blog.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1 text-[12px] text-text-secondary">
              <CalendarDays size={11} />
              Joined {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
            </span>
          </div>

          {/* Connection stats */}
          <div className="mt-3 flex flex-wrap gap-4 text-[12px]">
            <span className="text-text-secondary">
              <strong className="text-text-primary font-bold">{profile.followers.toLocaleString()}</strong> GitHub followers
            </span>
            <span className="text-text-secondary">
              <strong className="text-text-primary font-bold">{profile.following.toLocaleString()}</strong> following
            </span>
            {devFeedFollowers > 0 && (
              <span className="text-text-secondary">
                <strong className="text-accent font-bold">{devFeedFollowers.toLocaleString()}</strong> DevFeed followers
              </span>
            )}
          </div>
        </div>

        {/* Unclaimed banner */}
        {isUnclaimed && (
          <div className="mt-3 p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-[11px] text-text-primary font-mono">
            💡 <strong>Unclaimed live preview</strong> — Are you{" "}
            <strong className="text-accent">@{profile.login}</strong>?{" "}
            <Link href="/dashboard" className="underline hover:text-accent font-bold">
              Claim your profile
            </Link>{" "}
            to unlock analytics & posts.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Card (owner only) ─────────────────────────────────────────────

function AnalyticsCard({ profileDoc }: { profileDoc: UserProfileDoc | null }) {
  const views = profileDoc?.profileViewsCount ?? 0;
  const impressions = profileDoc?.postImpressionsCount ?? 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 mb-4">
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">
        Analytics · past 7 days
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <TrendingUp size={16} className="mx-auto text-accent mb-1" />
          <p className="text-base font-bold text-text-primary">{views.toLocaleString()}</p>
          <p className="text-[10px] text-text-secondary">Profile views</p>
        </div>
        <div className="text-center">
          <Flame size={16} className="mx-auto text-warning mb-1" />
          <p className="text-base font-bold text-text-primary">{impressions.toLocaleString()}</p>
          <p className="text-[10px] text-text-secondary">Post impressions</p>
        </div>
        <div className="text-center">
          <Search size={16} className="mx-auto text-diff-add mb-1" />
          <p className="text-base font-bold text-text-primary">—</p>
          <p className="text-[10px] text-text-secondary">Search appearances</p>
        </div>
      </div>
    </div>
  );
}

// ─── About section ────────────────────────────────────────────────────────────

function AboutSection({ bio }: { bio: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!bio) return null;
  const isLong = bio.length > 200;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 mb-4">
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">About</h2>
      <p className={`text-sm text-text-primary leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
        {bio}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 flex items-center gap-1 text-[11px] text-accent hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          {expanded ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> …more</>}
        </button>
      )}
    </div>
  );
}

// ─── Top Skills ───────────────────────────────────────────────────────────────

function TopSkillsSection({ languages }: { languages: { name: string; percentage: number; color: string }[] }) {
  const top = languages.slice(0, 8);
  if (top.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 mb-4">
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Top Skills</h2>
      <div className="flex flex-wrap gap-2">
        {top.map((lang) => (
          <span
            key={lang.name}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold"
            style={{
              borderColor: `${lang.color}40`,
              color: lang.color,
              backgroundColor: `${lang.color}12`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            {lang.name}
            <span className="opacity-60 text-[10px]">{lang.percentage}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Featured Section ─────────────────────────────────────────────────────────

function FeaturedSection({
  blog,
  login,
  topRepos,
}: {
  blog: string | null;
  login: string;
  topRepos: { name: string; description: string | null; html_url: string; stargazers_count: number; forks_count: number; language: string | null }[];
}) {
  if (!blog && topRepos.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 mb-4">
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Featured</h2>
      <div className="space-y-3">
        {blog && (
          <a
            href={blog.startsWith("http") ? blog : `https://${blog}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-secondary hover:bg-border/20 transition-all group focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              <LinkIcon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                {blog.replace(/^https?:\/\//, "")}
              </p>
              <p className="text-[11px] text-text-secondary">Portfolio / personal site</p>
            </div>
            <ExternalLink size={12} className="text-text-secondary flex-shrink-0 mt-1" />
          </a>
        )}
        {topRepos.slice(0, 3).map((repo) => (
          <a
            key={repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-secondary hover:bg-border/20 transition-all group focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <div className="h-10 w-10 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary flex-shrink-0">
              <GitBranch size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                {repo.name}
              </p>
              {repo.description && (
                <p className="text-[11px] text-text-secondary line-clamp-1">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {repo.language && (
                  <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: LANG_COLORS[repo.language] ?? "#8A94A3" }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-0.5 text-[10px] text-text-secondary">
                  <Star size={10} /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-text-secondary">
                  <GitFork size={10} /> {repo.forks_count}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Section ─────────────────────────────────────────────────────────

type ActivityTab = "posts" | "comments" | "images";

function CommentsTab({ authorId, currentUser }: { authorId: string; currentUser: DevTrackUser | null }) {
  const [comments, setComments] = useState<DevFeedComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCommentsByAuthorId(authorId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [authorId]);

  if (loading) return <div className="py-4"><SkeletonFeed /></div>;
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={22} />}
        title="No comments yet"
        description="Comments posted on DevFeed will show up here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="p-3 rounded-xl border border-border bg-surface">
          <p className="text-xs text-text-secondary mb-1">
            Replied · {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <p className="text-sm text-text-primary">{c.content}</p>
        </div>
      ))}
    </div>
  );
}

function ActivitySection({
  username,
  authorId,
  currentUser,
  languages,
}: {
  username: string;
  authorId: string | null;
  currentUser: DevTrackUser | null;
  languages: { name: string; percentage: number; imageUrl?: string | null }[];
}) {
  const [activeTab, setActiveTab] = useState<ActivityTab>("posts");

  const TABS: { id: ActivityTab; label: string; icon: React.ReactNode }[] = [
    { id: "posts", label: "Posts", icon: <FileText size={13} /> },
    { id: "comments", label: "Comments", icon: <MessageSquare size={13} /> },
    { id: "images", label: "Images", icon: <Image size={13} /> },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-4 mb-4">
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Activity</h2>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border/50 mb-4 overflow-x-auto pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        <ProfilePostsTab username={username} currentUser={currentUser} />
      )}
      {activeTab === "comments" && authorId && (
        <CommentsTab authorId={authorId} currentUser={currentUser} />
      )}
      {activeTab === "images" && (
        <EmptyState
          icon={<Image size={22} />}
          title="No images yet"
          description="Posts with images will appear here."
        />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function PublicProfilePageInner() {
  const params = useParams();
  const username = ((params.username as string) || "").toLowerCase();
  const { openAuthModal } = useAuthModal();

  const [activeData, setActiveData] = useState<UserDashboardData | null>(null);
  const [profileDoc, setProfileDoc] = useState<UserProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isUnclaimed, setIsUnclaimed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<DevTrackUser | null>(null);
  const [profileUid, setProfileUid] = useState<string | null>(null);

  // Auth subscription
  useEffect(() => {
    const unsub = subscribeToAuthChanges((user) => setCurrentUser(user));
    return unsub;
  }, []);

  // Load Firestore profile
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getUserFromFirestore(username);
        if (!data) {
          setIsUnclaimed(true);
        } else if (data.privacy === "private") {
          setIsPrivate(true);
        } else {
          setActiveData(data);
          // Also load profileDoc for analytics
          if (db) {
            const uid = await getUserUidByUsername(username);
            if (uid) {
              setProfileUid(uid);
              const snap = await getDoc(doc(db, "users", uid));
              if (snap.exists()) setProfileDoc(snap.data() as UserProfileDoc);
            }
          }
        }
      } catch {
        setIsUnclaimed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  // Resolve profile uid
  useEffect(() => {
    if (!username || profileUid) return;
    getUserUidByUsername(username).then(setProfileUid).catch(() => {});
  }, [username, profileUid]);

  // Track profile view (once per session, not own profile)
  useEffect(() => {
    if (!profileUid || !currentUser) return;
    if (currentUser.uid === profileUid) return;
    incrementProfileView(profileUid, currentUser.uid);
  }, [profileUid, currentUser]);

  // Set page title
  useEffect(() => {
    if (activeData) {
      const name = activeData.profile.name || activeData.profile.login;
      document.title = `${name} (@${activeData.profile.login}) · DevTrack`;
    }
  }, [activeData]);

  // Unclaimed fallback
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("devtrack_github_token") || "" : "";
  const { profile: liveProfile, loading: liveProfileLoading } = useGithubProfile(isUnclaimed ? username : "", storedToken);
  const { repositories: liveRepos, loading: liveReposLoading } = useRepositories(isUnclaimed ? username : "", storedToken);
  const {
    languages: liveLangs,
    contributions: liveContribs,
    score: liveScore,
    aiInsights: liveInsights,
    wrapped: liveWrapped,
    loading: liveAnalyticsLoading,
  } = useAnalytics(isUnclaimed ? username : "", storedToken);

  const fallbackDashboardData = useMemo((): UserDashboardData | null => {
    if (!isUnclaimed || !liveProfile || !liveContribs || !liveScore || !liveInsights || !liveWrapped) return null;
    return {
      profile: liveProfile,
      repositories: liveRepos || [],
      languages: liveLangs || [],
      contributions: liveContribs,
      score: liveScore,
      aiInsights: liveInsights,
      wrapped: liveWrapped,
      privacy: "public",
      pinnedRepos: [],
    };
  }, [isUnclaimed, liveProfile, liveRepos, liveLangs, liveContribs, liveScore, liveInsights, liveWrapped]);

  const data = activeData || fallbackDashboardData;
  const isFetchingLive = isUnclaimed && (liveProfileLoading || liveReposLoading || liveAnalyticsLoading);
  const isOwnProfile = !!(currentUser && profileUid && currentUser.uid === profileUid);

  // Top repos for Featured section
  const topRepos = useMemo(() => {
    if (!data) return [];
    const pinned = (data.pinnedRepos || []);
    const pinList = pinned.length > 0
      ? data.repositories.filter((r) => pinned.includes(r.name))
      : [];
    if (pinList.length > 0) return pinList.slice(0, 3);
    return [...data.repositories]
      .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
      .slice(0, 3);
  }, [data]);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading || isFetchingLive) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={() => {}} onLogout={() => {}} onOpenSearch={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center text-text-secondary pt-24">
          <Loader2 size={28} className="animate-spin text-accent mb-3" />
          <span className="text-xs font-semibold uppercase tracking-widest animate-pulse font-mono">
            Loading profile…
          </span>
        </div>
      </div>
    );
  }

  // ─── Private ───────────────────────────────────────────────────────────────
  if (isPrivate) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={() => {}} onLogout={() => {}} onOpenSearch={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto pt-24">
          <div className="h-12 w-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary mb-4">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">Private Profile</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            This profile is set to private by the owner.
          </p>
        </div>
      </div>
    );
  }

  // ─── Not found ─────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={currentUser} onLoginSuccess={() => {}} onLogout={() => {}} onOpenSearch={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto pt-24">
          <p className="text-sm text-text-secondary">Profile not found for <strong>@{username}</strong>.</p>
          <Link href="/" className="mt-4 text-xs text-accent hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const publicUrl = typeof window !== "undefined" ? window.location.href : `/u/${data.profile.login}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
        onOpenSearch={() => {}}
      />

      {/* SEO schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: data.profile.name || data.profile.login,
            url: publicUrl,
            image: data.profile.avatar_url,
            description: data.profile.bio,
            sameAs: [`https://github.com/${data.profile.login}`],
          }),
        }}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        publicUrl={publicUrl}
        username={data.profile.login}
        displayName={data.profile.name}
        grade={data.score.grade || "B"}
        score={data.score.overall || 75}
        mainStack={data.languages[0]?.name || "TypeScript"}
      />

      <DeveloperBattleModal
        isOpen={battleModalOpen}
        onClose={() => setBattleModalOpen(false)}
        initialUsername={data.profile.login}
        isAuthenticated={!!currentUser}
        onRequireAuth={(title, message) => openAuthModal({ title, message })}
      />

      <main className="flex-grow mx-auto w-full max-w-3xl px-4 pt-20 pb-12">
        {/* LinkedIn-style header */}
        <ProfileHeader
          activeData={data}
          profileDoc={profileDoc}
          profileUid={profileUid}
          currentUser={currentUser}
          isOwnProfile={isOwnProfile}
          isUnclaimed={isUnclaimed}
          onShare={() => setShareOpen(true)}
          onBattle={() => setBattleModalOpen(true)}
        />

        {/* Analytics (own profile only) */}
        {isOwnProfile && <AnalyticsCard profileDoc={profileDoc} />}

        {/* About */}
        <AboutSection bio={data.profile.bio} />

        {/* Top Skills */}
        <TopSkillsSection languages={data.languages} />

        {/* Featured repos + portfolio */}
        <FeaturedSection
          blog={data.profile.blog}
          login={data.profile.login}
          topRepos={topRepos}
        />

        {/* Activity (posts / comments) */}
        <ToastProvider>
          <ActivitySection
            username={data.profile.login}
            authorId={profileUid}
            currentUser={currentUser}
            languages={data.languages}
          />
        </ToastProvider>

        {/* Quick links to full dashboard */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={`/dashboard?user=${data.profile.login}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <BarChart2 size={13} />
            Full Dashboard
          </Link>
          <button
            onClick={() => setBattleModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-accent/30 bg-accent/10 text-xs font-semibold text-accent hover:bg-accent/20 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none cursor-pointer"
          >
            <Users size={13} />
            Developer Battle
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <ToastProvider>
      <PublicProfilePageInner />
    </ToastProvider>
  );
}
