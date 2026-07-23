'use client';

import React, { useState, useEffect, use } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MobileProfileView } from '@/components/profile/MobileProfileView';
import { DeveloperCard, DeveloperCardData } from '@/components/card/DeveloperCard';
import { AuthModal } from '@/components/auth/AuthModal';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { 
  Flame, 
  Star, 
  GitFork, 
  GitCommit, 
  Award, 
  FolderGit2, 
  Calendar, 
  MapPin, 
  Globe,
  Building,
  CheckCircle2, 
  Share2, 
  Users, 
  Activity,
  GitPullRequest,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Clock,
  BookOpen,
  TrendingUp,
  Code2,
  Check,
  Pencil,
  Save,
  X
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import Link from 'next/link';

import { GitHubCardService } from '@/services/github/github-card.service';
import { GitHubRepositoryService } from '@/services/github/github-repository.service';
import { GitHubUserService } from '@/services/github/github-user.service';
import { GitHubContributionService } from '@/services/github/github-contribution.service';
import { GitHubRepository, ContributionStats } from '@/types';
import ContributionHeatmap from '@/components/dashboard/ContributionHeatmap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

type ProfileTab = 'overview' | 'pinned' | 'posts' | 'achievements' | 'analytics';

export default function UserProfilePage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const username = resolvedParams.username || 'shadcn';

  const initialTab = (resolvedSearchParams.tab as ProfileTab) || 'overview';
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<DeveloperCardData>({
    username: username,
    name: username,
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
    publicRepos: 0,
    followers: 0,
    following: 0,
    totalStars: 0,
    totalForks: 0,
    topLanguages: [],
  });

  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<GitHubRepository[]>([]);
  const [contributions, setContributions] = useState<ContributionStats | null>(null);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customAbout, setCustomAbout] = useState<string>('');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState<string>('');

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authActionTitle, setAuthActionTitle] = useState('Sign in with GitHub');

  // Load current user and stored custom About text
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('devtrack_current_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {}
      }
      const savedAbout = localStorage.getItem(`devtrack_about_${username.toLowerCase()}`);
      if (savedAbout) {
        setCustomAbout(savedAbout);
        setAboutInput(savedAbout);
      }
    }
  }, [username]);

  // Ownership Check: Is this my profile or someone else's profile?
  const isOwnProfile = Boolean(
    currentUser &&
    currentUser.username &&
    currentUser.username.toLowerCase() === username.toLowerCase()
  );

  // Load all live GitHub data for the target user
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('devtrack_github_token') ?? undefined : undefined;

    Promise.all([
      GitHubCardService.fetchRealDeveloperCardData(username, token),
      GitHubRepositoryService.fetchUserProfileRepos(username, token),
      GitHubRepositoryService.fetchPinnedRepositories(username, token),
      GitHubContributionService.fetchUserContributions(username, token),
      GitHubUserService.fetchUserEvents(username, token),
      token && !isOwnProfile ? GitHubUserService.checkIsFollowing(username, token) : Promise.resolve(false),
    ])
      .then(([cardData, userRepos, pinned, contribStats, events, followingStatus]) => {
        if (isCancelled) return;
        setProfileData(cardData);
        setRepos(userRepos);
        setPinnedRepos(pinned);
        setContributions(contribStats);
        setUserEvents(events);
        setIsFollowing(followingStatus);

        // If no custom about stored, prefill with GitHub bio
        const savedAbout = typeof window !== 'undefined' ? localStorage.getItem(`devtrack_about_${username.toLowerCase()}`) : null;
        if (!savedAbout && cardData.bio) {
          setCustomAbout(cardData.bio);
          setAboutInput(cardData.bio);
        }
      })
      .catch((err) => {
        console.error('Error fetching live GitHub profile data:', err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [username, isOwnProfile]);

  // Handle saving custom About section (Max 1000 chars)
  const handleSaveAbout = () => {
    const trimmed = aboutInput.slice(0, 1000);
    setCustomAbout(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`devtrack_about_${username.toLowerCase()}`, trimmed);
    }
    setIsEditingAbout(false);
  };

  // Handle live GitHub follow/unfollow functionality (Other User Profiles)
  const handleFollowToggle = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('devtrack_github_token') : null;

    if (!token) {
      setAuthActionTitle(`Sign in with GitHub to follow @${username}`);
      setIsAuthOpen(true);
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const success = await GitHubUserService.unfollowGitHubUser(username, token);
        if (success) {
          setIsFollowing(false);
          setProfileData((prev) => ({
            ...prev,
            followers: Math.max(0, prev.followers - 1),
          }));
        }
      } else {
        const success = await GitHubUserService.followGitHubUser(username, token);
        if (success) {
          setIsFollowing(true);
          setProfileData((prev) => ({
            ...prev,
            followers: prev.followers + 1,
          }));
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update GitHub follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Top 2 Most Active Projects selected dynamically from live repos
  const topActiveRepos = [...repos]
    .filter((r) => !r.fork)
    .sort((a, b) => new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime())
    .slice(0, 2);

  // Total calculated contributions sum
  const totalContribCount = contributions?.dailyContributions
    ? Object.values(contributions.dailyContributions).reduce((sum, val) => sum + val, 0)
    : (contributions?.totalCommits || 0) + (contributions?.totalPRs || 0) + (contributions?.totalIssues || 0);

  // DevTrack Achievements
  const devTrackAchievements = [
    {
      id: 'first_repo',
      title: 'First Repository',
      desc: 'Created at least one public repository on GitHub.',
      unlocked: profileData.publicRepos >= 1,
      progress: Math.min(100, profileData.publicRepos >= 1 ? 100 : 0),
      icon: FolderGit2,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    },
    {
      id: '100_contribs',
      title: 'First 100 Contributions',
      desc: 'Achieved 100+ contributions in the contribution calendar.',
      unlocked: totalContribCount >= 100,
      progress: Math.min(100, Math.round((totalContribCount / 100) * 100)),
      icon: Flame,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      id: 'open_source',
      title: 'Open Source Contributor',
      desc: 'Created or merged pull requests across GitHub codebases.',
      unlocked: (contributions?.totalPRs || 0) >= 1,
      progress: (contributions?.totalPRs || 0) >= 1 ? 100 : 0,
      icon: GitPullRequest,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      id: '100_stars',
      title: '100 Stars Earned',
      desc: 'Accumulated 100+ stargazers across public repositories.',
      unlocked: profileData.totalStars >= 100,
      progress: Math.min(100, Math.round((profileData.totalStars / 100) * 100)),
      icon: Star,
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    },
    {
      id: 'community_builder',
      title: 'Community Builder',
      desc: 'Reached 50+ network followers or repository forks.',
      unlocked: profileData.followers >= 50 || (profileData.totalForks || 0) >= 50,
      progress: Math.min(100, Math.round((Math.max(profileData.followers, profileData.totalForks || 0) / 50) * 100)),
      icon: Users,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      id: 'consistent_coder',
      title: 'Consistent Coder',
      desc: 'Maintained an active contribution streak of 14+ days.',
      unlocked: (contributions?.longestStreak || 0) >= 14,
      progress: Math.min(100, Math.round(((contributions?.longestStreak || 0) / 14) * 100)),
      icon: TrendingUp,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      id: 'rising_developer',
      title: 'Rising Developer',
      desc: 'Published 10+ public repositories on GitHub.',
      unlocked: profileData.publicRepos >= 10,
      progress: Math.min(100, Math.round((profileData.publicRepos / 10) * 100)),
      icon: Code2,
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    },
    {
      id: 'elite_developer',
      title: 'Elite Developer',
      desc: 'Reached Developer Score of 80+ or Grade A status.',
      unlocked: (profileData.numericScore || 0) >= 80,
      progress: Math.min(100, Math.round(((profileData.numericScore || 0) / 80) * 100)),
      icon: Award,
      color: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    },
  ];

  // Official GitHub Profile Badges
  const gitHubBadges = [
    { name: 'Arctic Code Vault Contributor', icon: '❄️', desc: 'Contributed code to repositories archived in the 2020 GitHub Arctic Code Vault.' },
    { name: 'GitHub Sponsor', icon: '💖', desc: 'Sponsors open-source developers and projects on GitHub.' },
    { name: 'Pull Shark', icon: '🦈', desc: 'Opened pull requests that were merged into repositories.' },
    { name: 'Pair Extraordinaire', icon: '👯', desc: 'Co-authored commits in merged pull requests.' },
    { name: 'Starstruck', icon: '⭐', desc: 'Created a repository that earned community stargazers.' },
    { name: 'Quickdraw', icon: '⚡', desc: 'Closed an issue or pull request within 5 minutes of creation.' },
  ];

  // Language stats formatting
  const languageStats = (profileData.topLanguages || []).map((lang) => ({
    name: lang.name,
    percent: lang.percent,
    color: lang.color,
  }));

  // Recharts Monthly trend data
  const monthlyTrendData = React.useMemo(() => {
    if (!contributions?.dailyContributions) return [];
    const map: Record<string, number> = {};
    Object.entries(contributions.dailyContributions).forEach(([dateStr, count]) => {
      const monthKey = dateStr.substring(0, 7);
      map[monthKey] = (map[monthKey] || 0) + count;
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([mKey, count]) => {
        const [y, m] = mKey.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          contributions: count,
        };
      });
  }, [contributions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      <Navbar />

      {/* 📱 MOBILE NATIVE STACKED PROFILE (< md) */}
      <div className="px-3 pt-3 block md:hidden">
        <MobileProfileView
          profileData={{
            ...profileData,
            location: profileData.location ?? undefined,
            company: profileData.company ?? undefined,
            website: profileData.blog ?? undefined,
            followersCount: profileData.followers,
            followingCount: 280,
            grade: 'A+',
          }}
          isOwnProfile={isOwnProfile}
          onEditProfile={() => setIsEditingAbout(!isEditingAbout)}
        />
      </div>

      {/* 💻 DESKTOP HERO & PROFILE LAYOUT (>= md) */}
      <div className="hidden md:block">
        {/* Hero Cover Header */}
        <div className="relative h-56 sm:h-64 w-full bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#818CF8_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        </div>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        {/* Profile Header Card */}
        <div className="relative -mt-20 z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="relative">
              <TierAvatar
                src={profileData.avatarUrl}
                alt={profileData.name}
                tier={profileData.tier || 'Silver'}
                size="xl"
              />
              <div className="absolute -bottom-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profileData.name}
                </h1>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-400">
                  ✓ Verified GitHub Identity
                </span>
              </div>
              <p className="text-sm font-semibold text-indigo-400">@{profileData.username}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-400 font-mono">
                {profileData.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    {profileData.location}
                  </span>
                )}
                {profileData.company && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    {profileData.company}
                  </span>
                )}
                {profileData.blog && (
                  <a
                    href={profileData.blog.startsWith('http') ? profileData.blog : `https://${profileData.blog}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-300 hover:text-white transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    Website
                  </a>
                )}
                {profileData.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    Joined GitHub {profileData.createdAt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC ACTION BUTTONS (MY PROFILE vs OTHER USER PROFILE) */}
          <div className="flex flex-wrap items-center gap-3">
            {isOwnProfile ? (
              /* MY PROFILE ACTIONS: Edit Profile & Share Profile */
              <>
                <button
                  type="button"
                  onClick={() => setIsEditingAbout(!isEditingAbout)}
                  className="flex items-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/15 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25 shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
                >
                  <Pencil className="h-4 w-4 text-indigo-400" />
                  <span>{isEditingAbout ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </>
            ) : (
              /* OTHER USER PROFILE ACTIONS: Follow on GitHub & Share Profile */
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-lg transition-all cursor-pointer ${
                  isFollowing
                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-emerald-500/10 hover:bg-emerald-500/25'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/20 hover:opacity-95'
                }`}
              >
                {isFollowing ? <Check className="h-4 w-4 text-emerald-400" /> : <GithubIcon className="h-4 w-4" />}
                <span>{isFollowing ? 'Following on GitHub' : 'Follow on GitHub'}</span>
                <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono">
                  {profileData.followers}
                </span>
              </button>
            )}

            {/* Share Profile Button */}
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.href : '';
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                  alert(`Copied Developer Profile link to clipboard: ${url}`);
                }
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Share2 className="h-4 w-4 text-indigo-400" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* PROFILE TAB NAVIGATION BAR (5 Tabs) */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto border-b border-white/10 pb-3 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGridIcon },
            { id: 'pinned', label: 'Pinned Repositories', icon: FolderGit2 },
            { id: 'posts', label: 'Posts & Updates', icon: MessageSquare },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'analytics', label: 'GitHub Analytics', icon: Activity },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`flex items-center gap-2 shrink-0 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <IconComp className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="mt-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Main Content Area (Col 1-7) */}
              <div className="lg:col-span-7 space-y-6">
                {/* About Section (Editable for My Profile, Read-Only for Others) */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      About Developer
                    </h3>
                    {isOwnProfile && !isEditingAbout && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAbout(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {isOwnProfile && isEditingAbout ? (
                    <div className="space-y-3">
                      <textarea
                        value={aboutInput}
                        onChange={(e) => setAboutInput(e.target.value.slice(0, 1000))}
                        maxLength={1000}
                        rows={4}
                        placeholder="Write a bio about your software development journey, skills, and goals..."
                        className="w-full rounded-2xl border border-indigo-500/40 bg-slate-950/80 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed"
                      />
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{aboutInput.length}/1000 characters</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingAbout(false)}
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveAbout}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {customAbout || profileData.bio || `${profileData.name} is a software engineer publishing open-source projects on GitHub.`}
                    </p>
                  )}

                  {/* Facebook / LinkedIn Style Live Statistics Grid */}
                  <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 text-center">
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Followers</span>
                      <span className="text-base sm:text-lg font-extrabold text-indigo-300 mt-0.5 block">{profileData.followers}</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 text-center">
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Following</span>
                      <span className="text-base sm:text-lg font-extrabold text-purple-300 mt-0.5 block">{profileData.following || 0}</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 text-center">
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Public Repos</span>
                      <span className="text-base sm:text-lg font-extrabold text-white mt-0.5 block">{profileData.publicRepos}</span>
                    </div>
                  </div>
                </div>

                {/* Top 2 Most Active Projects (Dynamically Selected) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <span>Top 2 Most Active Projects</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">Selected from live GitHub pushes</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {topActiveRepos.length > 0 ? (
                      topActiveRepos.map((repo) => (
                        <div
                          key={repo.id}
                          className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm sm:text-base font-extrabold text-white font-mono flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-indigo-400" />
                                {repo.name}
                              </h4>
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:border-indigo-500/40 hover:text-white transition-all"
                              >
                                <span>View Repo</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {repo.description || 'No description provided.'}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400 font-mono">
                            <div className="flex items-center gap-3">
                              {repo.language && (
                                <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                                  {repo.language}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-amber-300 font-bold">
                                <Star className="h-3.5 w-3.5 fill-amber-300" /> {repo.stargazers_count}
                              </span>
                              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                                <GitFork className="h-3.5 w-3.5" /> {repo.forks_count}
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-500">
                              Updated {new Date(repo.pushed_at || repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center text-xs text-slate-400 italic">
                        No public activity repositories indexed.
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Recent GitHub Activity Timeline */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>Live GitHub Event Stream</span>
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-mono">Live Sync</span>
                  </div>

                  <div className="space-y-3">
                    {userEvents.length > 0 ? (
                      userEvents.slice(0, 5).map((evt: any, i: number) => (
                        <div
                          key={evt.id || i}
                          className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-3 text-xs"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            <GitCommit className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200 truncate">
                                {evt.type.replace('Event', '')} on {evt.repo?.name || 'GitHub'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(evt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-400 truncate font-mono">
                              {evt.payload?.commits?.[0]?.message || evt.payload?.action || 'Pushed updates to repository.'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center py-4">
                        No recent public GitHub event telemetry recorded.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Verified Developer Card (Col 8-12) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="sticky top-24">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Collectible Developer Card
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ✓ Live Verified
                    </span>
                  </div>
                  <DeveloperCard
                    data={profileData}
                    isLoading={loading}
                    onRequireAuth={(action) => {
                      setAuthActionTitle(action);
                      setIsAuthOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PINNED REPOSITORIES */}
          {activeTab === 'pinned' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-mono flex items-center gap-2">
                    <FolderGit2 className="h-5 w-5 text-indigo-400" />
                    <span>Pinned GitHub Repositories</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Live pinned repositories fetched directly from GitHub's profile registry.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                  {pinnedRepos.length} Pinned
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pinnedRepos.length > 0 ? (
                  pinnedRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white font-mono truncate max-w-[180px]">
                            {repo.name}
                          </h4>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {repo.description || 'No description provided for this repository.'}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                              <span className="h-2 w-2 rounded-full bg-indigo-400" />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-amber-300 font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-300" /> {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1 text-cyan-300 font-bold">
                            <GitFork className="h-3.5 w-3.5" /> {repo.forks_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center text-xs text-slate-400 italic">
                    No pinned repositories found for @{username}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: POSTS & UPDATES (Placeholder for now) */}
          {activeTab === 'posts' && (
            <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950/98 to-slate-900/90 p-10 text-center max-w-xl mx-auto space-y-4 shadow-2xl backdrop-blur-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/20">
                <MessageSquare className="h-8 w-8" />
              </div>

              <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono font-bold text-purple-300">
                ✨ Phase 6 Roadmap Feature
              </span>

              <h3 className="text-xl font-black text-white font-space-grotesk">
                Posts & Developer Updates
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                DevTrack is currently prioritizing the core Profile module as the foundation of developer identity. Social posts and developer updates will launch in an upcoming release.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                  Return to Overview Dashboard
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-8">
              {/* GitHub Official Badges */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>GitHub Profile Badges</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {gitHubBadges.map((badge) => (
                    <div
                      key={badge.name}
                      className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl flex items-start gap-3.5"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200">{badge.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DevTrack Auto-Awarded Achievements */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>DevTrack Verified Achievements</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {devTrackAchievements.map((ach) => {
                    const IconComp = ach.icon;
                    return (
                      <div
                        key={ach.id}
                        className={`rounded-3xl border p-4 backdrop-blur-xl flex flex-col justify-between transition-all ${
                          ach.unlocked
                            ? 'border-indigo-500/40 bg-slate-900/90 shadow-lg shadow-indigo-500/10'
                            : 'border-white/5 bg-slate-950/40 opacity-70'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${ach.color}`}>
                              <IconComp className="h-5 w-5" />
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                                ach.unlocked
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {ach.unlocked ? 'Unlocked' : 'Locked'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-extrabold text-white">{ach.title}</h4>
                            <p className="mt-1 text-[11px] text-slate-400 leading-normal">{ach.desc}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>Progress</span>
                            <span>{ach.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${ach.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GITHUB ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Contributions</span>
                  <span className="text-xl font-extrabold text-white mt-1 block">{totalContribCount}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Current Streak</span>
                  <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                    {contributions?.currentStreak !== null && contributions?.currentStreak !== undefined
                      ? `${contributions.currentStreak}d`
                      : 'Not Available from GitHub'}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Longest Streak</span>
                  <span className="text-xl font-extrabold text-amber-300 mt-1 block">
                    {contributions?.longestStreak ? `${contributions.longestStreak}d` : '0d'}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Stars</span>
                  <span className="text-xl font-extrabold text-yellow-300 mt-1 block">{profileData.totalStars}</span>
                </div>
              </div>

              {/* 365-Day Contribution Heatmap Grid */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>365-Day GitHub Contribution Calendar</span>
                  </h3>
                </div>
                <ContributionHeatmap dailyContributions={contributions?.dailyContributions || {}} />
              </div>

              {/* Language Breakdown & Recharts Monthly Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Language Distribution */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Language Distribution
                  </h3>
                  <div className="space-y-3">
                    {languageStats.length > 0 ? (
                      languageStats.map((lang) => (
                        <div key={lang.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                              {lang.name}
                            </span>
                            <span className="font-bold">{lang.percent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No language metrics indexed.</p>
                    )}
                  </div>
                </div>

                {/* Monthly Activity Recharts */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Monthly Activity Trend
                  </h3>
                  <div className="h-48 w-full text-xs font-mono">
                    {monthlyTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                          <XAxis dataKey="month" stroke="#8B949E" />
                          <YAxis stroke="#8B949E" />
                          <Tooltip contentStyle={{ backgroundColor: '#0D1117', borderColor: '#30363D', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="contributions" stroke="#818CF8" fill="#6366F1" fillOpacity={0.25} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-10 text-center">No trend data available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        actionTitle={authActionTitle}
      />
    </div>
  );
}

function LayoutGridIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
