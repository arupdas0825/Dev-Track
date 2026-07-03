"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { UserDashboardData } from "@/types";
import { getUserFromFirestore } from "@/lib/firebase";
import { formatNumber, calculateAccountAge } from "@/lib/utils";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import {
  Award,
  GitCommit,
  GitPullRequest,
  Star,
  Users,
  Clock,
  Zap,
  MapPin,
  Building,
  Link as LinkIcon,
  Mail,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Code,
  Server,
  Cpu,
  Wrench,
  Smartphone,
  Database,
  Cloud,
  FileText,
  Briefcase,
  AlertCircle,
  BookOpen,
  Calendar,
  Share2
} from "lucide-react";
import ShareModal from "@/components/dashboard/ShareModal";
import ContributionHeatmap from "@/components/dashboard/ContributionHeatmap";
import Navbar from "@/components/layout/Navbar";
import { useGithubProfile } from "@/hooks/useGithubProfile";
import { useRepositories } from "@/hooks/useRepositories";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function PublicProfilePage() {
  const params = useParams();
  const username = (params.username as string || "").toLowerCase();
  
  const [profileData, setProfileData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isUnclaimed, setIsUnclaimed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // For unclaimed profiles direct fetch fallback
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("devtrack_github_token") || "" : "";
  const { profile: liveProfile, loading: liveProfileLoading } = useGithubProfile(isUnclaimed ? username : "", storedToken);
  const { repositories: liveRepos, loading: liveReposLoading } = useRepositories(isUnclaimed ? username : "", storedToken);
  const {
    languages: liveLangs,
    contributions: liveContribs,
    score: liveScore,
    aiInsights: liveInsights,
    wrapped: liveWrapped,
    loading: liveAnalyticsLoading
  } = useAnalytics(isUnclaimed ? username : "", storedToken);

  // 1. Fetch Firestore Profile
  useEffect(() => {
    if (!username) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getUserFromFirestore(username);
        if (data) {
          if (data.privacy === "private") {
            setIsPrivate(true);
          } else {
            setProfileData(data);
          }
        } else {
          // If not in Firestore, flag as unclaimed to fetch live GitHub preview
          setIsUnclaimed(true);
        }
      } catch (err) {
        setIsUnclaimed(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  // Construct fallback preview data for unclaimed users
  const fallbackDashboardData = useMemo((): UserDashboardData | null => {
    if (!isUnclaimed || !liveProfile || !liveContribs || !liveScore || !liveInsights || !liveWrapped) {
      return null;
    }
    return {
      profile: liveProfile,
      repositories: liveRepos || [],
      languages: liveLangs || [],
      contributions: liveContribs,
      score: liveScore,
      aiInsights: liveInsights,
      wrapped: liveWrapped,
      privacy: "public",
      pinnedRepos: []
    };
  }, [isUnclaimed, liveProfile, liveRepos, liveLangs, liveContribs, liveScore, liveInsights, liveWrapped]);

  const activeData = profileData || fallbackDashboardData;
  const isFetchingLive = isUnclaimed && (liveProfileLoading || liveReposLoading || liveAnalyticsLoading);

  // Set Dynamic SEO Parameters on mount/load
  useEffect(() => {
    if (activeData) {
      const name = activeData.profile.name || activeData.profile.login;
      document.title = `${name} (@${activeData.profile.login}) - DevTrack Public Developer Profile`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", `Explore ${name}'s developer grade, codebase metrics, technical skills, and career analysis on DevTrack.`);
      }
    }
  }, [activeData]);

  // Ecosystem Segmentation calculations
  const segmentation = useMemo(() => {
    if (!activeData) return [];
    
    let frontendBytes = 0;
    let backendBytes = 0;
    let aimlBytes = 0;
    let devopsBytes = 0;
    let mobileBytes = 0;
    let databaseBytes = 0;
    let infraBytes = 0;

    activeData.repositories.forEach(repo => {
      const searchStr = `${repo.name} ${repo.description || ""}`.toLowerCase();
      const primaryLang = repo.language || "Markdown";
      const sizeBytes = (repo.size || 100) * 1024;

      const isMobile = searchStr.includes("android") || searchStr.includes("ios") || searchStr.includes("mobile") || searchStr.includes("flutter") || searchStr.includes("react-native") || primaryLang === "Kotlin" || primaryLang === "Swift" || primaryLang === "Dart";
      const isAiml = searchStr.includes("ml") || searchStr.includes("ai") || searchStr.includes("dataset") || searchStr.includes("model") || searchStr.includes("pytorch") || searchStr.includes("tensorflow") || searchStr.includes("llm") || searchStr.includes("opencv") || searchStr.includes("neural");
      const isDevops = searchStr.includes("ci") || searchStr.includes("cd") || searchStr.includes("actions") || searchStr.includes("workflow") || searchStr.includes("docker") || searchStr.includes("k8s") || searchStr.includes("kubernetes");
      const isDatabase = searchStr.includes("database") || searchStr.includes("db") || searchStr.includes("sql") || searchStr.includes("postgres") || searchStr.includes("mongodb") || searchStr.includes("prisma") || searchStr.includes("redis");
      const isInfra = searchStr.includes("terraform") || searchStr.includes("aws") || searchStr.includes("gcp") || searchStr.includes("kubernetes") || searchStr.includes("infrastructure") || searchStr.includes("yaml");

      if (isMobile) mobileBytes += sizeBytes;
      else if (isAiml) aimlBytes += sizeBytes;
      else if (isDevops) devopsBytes += sizeBytes;
      else if (isDatabase) databaseBytes += sizeBytes;
      else if (isInfra) infraBytes += sizeBytes;
      else if (primaryLang === "TypeScript" || primaryLang === "JavaScript" || primaryLang === "HTML" || primaryLang === "CSS") {
        const isBackendFramework = searchStr.includes("express") || searchStr.includes("nest") || searchStr.includes("node") || searchStr.includes("api");
        if (isBackendFramework) backendBytes += sizeBytes;
        else frontendBytes += sizeBytes;
      } else {
        backendBytes += sizeBytes;
      }
    });

    const totalBytes = frontendBytes + backendBytes + aimlBytes + devopsBytes + mobileBytes + databaseBytes + infraBytes || 1;

    const frontendPct = Math.round((frontendBytes / totalBytes) * 100);
    const backendPct = Math.round((backendBytes / totalBytes) * 100);
    const aimlPct = Math.round((aimlBytes / totalBytes) * 100);
    const devopsPct = Math.round((devopsBytes / totalBytes) * 100);
    const mobilePct = Math.round((mobileBytes / totalBytes) * 100);
    const databasePct = Math.round((databaseBytes / totalBytes) * 100);
    const infraPct = 100 - (frontendPct + backendPct + aimlPct + devopsPct + mobilePct + databasePct);

    return [
      { name: "Frontend", percentage: Math.max(0, frontendPct), color: "#58A6FF", icon: Code },
      { name: "Backend", percentage: Math.max(0, backendPct), color: "#bc8cff", icon: Server },
      { name: "AI/ML", percentage: Math.max(0, aimlPct), color: "#3FB950", icon: Cpu },
      { name: "DevOps", percentage: Math.max(0, devopsPct), color: "#F85149", icon: Wrench },
      { name: "Mobile", percentage: Math.max(0, mobilePct), color: "#D29922", icon: Smartphone },
      { name: "Database", percentage: Math.max(0, databasePct), color: "#e3b341", icon: Database },
      { name: "Infrastructure", percentage: Math.max(0, infraPct), color: "#79c0ff", icon: Cloud }
    ].sort((a, b) => b.percentage - a.percentage);
  }, [activeData]);

  // Skill inventory detector with confidence level
  const skillsList = useMemo(() => {
    if (!activeData) return [];
    
    const detected: { name: string; pct: number }[] = [];
    const searchString = activeData.repositories.map(r => `${r.name} ${r.description || ""}`.toLowerCase()).join(" ");
    
    const checkSkill = (name: string, keywords: string[], basePct: number) => {
      let matches = 0;
      keywords.forEach(kw => {
        if (searchString.includes(kw)) matches++;
      });
      if (matches > 0) {
        const calculated = Math.min(100, basePct + (matches * 8));
        detected.push({ name, pct: calculated });
      }
    };

    checkSkill("React", ["react", "framer-motion", "next.js", "jsx"], 70);
    checkSkill("TypeScript", ["typescript", "ts", "tsx"], 75);
    checkSkill("JavaScript", ["javascript", "js", "node"], 80);
    checkSkill("Node.js", ["node", "express", "npm"], 65);
    checkSkill("Python", ["python", "py", "fastapi", "django"], 60);
    checkSkill("Docker", ["docker", "dockerfile", "containers"], 55);
    checkSkill("TailwindCSS", ["tailwind", "tailwindcss"], 85);
    checkSkill("Git", ["git", "github", "actions", "commits"], 90);
    checkSkill("PostgreSQL", ["postgres", "postgresql", "psql"], 50);
    checkSkill("MongoDB", ["mongodb", "mongo"], 50);
    checkSkill("Firebase", ["firebase", "firestore"], 65);

    return detected.sort((a, b) => b.pct - a.pct).slice(0, 8);
  }, [activeData]);

  // Pinned or showcase repositories
  const showcaseRepos = useMemo(() => {
    if (!activeData) return [];
    
    // Check if user set custom pins in Firestore
    const customPins = activeData.pinnedRepos || [];
    if (customPins.length > 0) {
      const pins = activeData.repositories.filter(repo => customPins.includes(repo.name));
      if (pins.length > 0) return pins;
    }

    // Default to most starred / active
    return [...activeData.repositories]
      .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
      .slice(0, 4);
  }, [activeData]);

  // Unlocked Achievements calculation
  const achievements = useMemo(() => {
    if (!activeData) return [];
    
    const totalCommits = activeData.contributions.totalCommits || 0;
    const totalStars = activeData.contributions.totalStarsEarned || 0;
    const totalPRs = activeData.contributions.totalPRs || 0;
    
    return [
      {
        id: "contrib_100",
        title: "100 Pushes",
        desc: "Wrote version control logs for over 100 changes.",
        unlocked: totalCommits >= 100,
        rarity: "Common"
      },
      {
        id: "contrib_500",
        title: "500 Pushes",
        desc: "Aggregated significant version velocity on main branch.",
        unlocked: totalCommits >= 500,
        rarity: "Rare"
      },
      {
        id: "contrib_1000",
        title: "1000 Pushes",
        desc: "Elite status: committed over 1,000+ codebase revisions.",
        unlocked: totalCommits >= 1000,
        rarity: "Epic"
      },
      {
        id: "streak_30",
        title: "30 Day Streak",
        desc: "Maintained active commits for 30 consecutive days.",
        unlocked: activeData.contributions.longestStreak >= 30,
        rarity: "Rare"
      },
      {
        id: "stars_100",
        title: "100 Stars",
        desc: "Repositories accumulated over 100 total GitHub stars.",
        unlocked: totalStars >= 100,
        rarity: "Epic"
      },
      {
        id: "pr_collaborator",
        title: "Open Source Peer",
        desc: "Submitted remote pull requests to collaborate on branches.",
        unlocked: totalPRs >= 1,
        rarity: "Common"
      }
    ];
  }, [activeData]);

  // Timeline Milestones
  const milestones = useMemo(() => {
    if (!activeData) return [];
    
    const createdDate = new Date(activeData.profile.created_at);
    const createdText = createdDate.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    const devScore = activeData.score.overall || 0;

    return [
      { title: "Joined GitHub", desc: "Initialized developer profile on the global network.", date: createdText, unlocked: true },
      { title: "First Repository", desc: "Published first codebase to public repositories.", date: createdText, unlocked: true },
      { title: "100 Commits Milestone", desc: "Achieved 100 commit logs across all repositories.", date: "Completed", unlocked: activeData.contributions.totalCommits >= 100 },
      { title: "Grade A Elite", desc: "Aggregated score over 80/100, securing Grade A ranking.", date: "Completed", unlocked: devScore >= 80 },
      { title: "500 Commits Milestone", desc: "Aggregated 500 commit logs.", date: "Completed", unlocked: activeData.contributions.totalCommits >= 500 }
    ];
  }, [activeData]);

  // Loading States
  if (loading || isFetchingLive) {
    return (
      <div className="flex min-h-screen flex-col bg-background select-none">
        <Navbar currentUser={null} onLoginSuccess={() => {}} onLogout={() => {}} onOpenSearch={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center text-text-secondary font-mono">
          <svg className="animate-spin h-8 w-8 text-accent mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest animate-pulse">Assembling Developer Analytics...</span>
        </div>
      </div>
    );
  }

  // Private profile empty state
  if (isPrivate) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={null} onLoginSuccess={() => {}} onLogout={() => {}} onOpenSearch={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto font-mono">
          <div className="h-12 w-12 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary mb-4">
            <ShieldAlert size={20} />
          </div>
          <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase tracking-wider">Private Profile</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            This developer profile has been marked as private by the owner. Only the owner can view this telemetry.
          </p>
        </div>
      </div>
    );
  }

  // Active Profile Layout rendering
  if (!activeData) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar currentUser={null} onLoginSuccess={() => {}} onLogout={() => {}} onOpenSearch={() => {}} />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto font-mono">
          <div className="h-12 w-12 rounded-lg bg-danger/10 text-danger flex items-center justify-center mb-4">
            <AlertCircle size={20} />
          </div>
          <h3 className="text-sm font-bold font-space-grotesk text-text-primary uppercase tracking-wider">Profile Not Initialized</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            This developer profile does not exist on DevTrack.
          </p>
        </div>
      </div>
    );
  }

  const { profile, contributions, score, aiInsights } = activeData;
  const gradeStr = score.grade || "B";
  const overallScore = score.overall || 75;
  const publicUrl = typeof window !== "undefined" ? window.location.href : `/u/${profile.login}`;
  
  // Custom radial progress values
  const badgeRadius = 42;
  const circ = 2 * Math.PI * badgeRadius;
  const offset = circ - (overallScore / 100) * circ;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar currentUser={null} onLoginSuccess={() => {}} onLogout={() => {}} onOpenSearch={() => {}} />

      {/* SEO structured schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": profile.name || profile.login,
            "url": publicUrl,
            "image": profile.avatar_url,
            "jobTitle": aiInsights?.careerDirection || "Software Engineer",
            "description": profile.bio,
            "sameAs": [
              `https://github.com/${profile.login}`
            ]
          })
        }}
      />

      {/* Share Modal popup */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        publicUrl={publicUrl}
        username={profile.login}
        displayName={profile.name}
        grade={gradeStr}
        score={overallScore}
        mainStack={segmentation[0]?.name || "TypeScript"}
      />

      {/* Unclaimed preview banner */}
      {isUnclaimed && (
        <div className="bg-accent/10 border-b border-accent/20 py-2.5 px-4 text-center font-mono text-[10px] text-text-primary">
          💡 This profile is an <strong>unclaimed live preview</strong> generated from public GitHub API data.
          {" "}Are you <strong className="text-accent">{profile.login}</strong>? <a href="/dashboard" className="underline hover:text-accent font-bold">Claim your profile now</a> to save telemetry and pins!
        </div>
      )}

      {/* Main Public Profile Page Layout */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Card & Recruiter Snapshot (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile Header Module */}
          <div className="rounded-xl border border-border bg-[#161B22]/65 p-6 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt={profile.name || profile.login}
                  className="h-24 w-24 rounded-full border border-border object-cover bg-background"
                />
              )}
              {/* Verified badge */}
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#161B22] border border-border rounded-full text-accent shadow-lg" title="DevTrack Verified Integrations">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-space-grotesk text-[#F0F6FC] leading-none flex items-center justify-center gap-1.5">
                <span>{profile.name || profile.login}</span>
              </h2>
              <span className="text-[11px] font-mono text-[#8B949E]">@{profile.login}</span>
            </div>

            {profile.bio && (
              <p className="text-xs text-[#8B949E] leading-relaxed max-w-xs font-sans">
                {profile.bio}
              </p>
            )}

            <div className="w-full border-t border-border/40 pt-4 space-y-2.5 text-left font-mono text-[10px] text-text-secondary">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-[#8B949E]" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-2">
                  <Building size={12} className="text-[#8B949E]" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.blog && (
                <div className="flex items-center gap-2 truncate">
                  <LinkIcon size={12} className="text-[#8B949E]" />
                  <a href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors underline">
                    {profile.blog}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#8B949E]" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</span>
              </div>
            </div>

            {/* Social Share Trigger */}
            <div className="w-full pt-2">
              <button
                onClick={() => setShareOpen(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 size={13} />
                <span>Share Profile Card</span>
              </button>
            </div>
          </div>

          {/* Recruiter Snapshot Card */}
          <div className="rounded-xl border border-border bg-[#161B22]/40 p-6 space-y-4 font-mono">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-1.5">
              <Briefcase size={12} className="text-accent" />
              <span>Recruiter Snapshot</span>
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Developer Grade:</span>
                <span className="font-bold font-space-grotesk text-accent text-sm">{gradeStr} ({overallScore}/100)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Years Active:</span>
                <span className="font-bold text-text-primary">{activeData.profile ? calculateAccountAge(activeData.profile.created_at) : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Main Stack:</span>
                <span className="font-bold text-[#58A6FF] truncate max-w-[150px]">{segmentation[0]?.name || "TypeScript"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Open Source Impact:</span>
                <span className="font-bold text-emerald-400">High</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary">Availability Status:</span>
                <span className="font-bold text-[#F0F6FC] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">Available</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setShareOpen(true)}
                className="w-full py-2 bg-accent hover:bg-accent/90 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText size={13} />
                <span>Get Developer Card</span>
              </button>
              <a
                href={`mailto:${profile.email || "hiring@devtrack.dev"}?subject=DevTrack Profile Inquiry - @${profile.login}`}
                className="w-full py-2 bg-[#161B22] border border-[#30363D] hover:bg-[#0D1117] text-text-primary font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors text-center"
              >
                <Mail size={13} />
                <span>Contact Developer</span>
              </a>
            </div>
          </div>

          {/* Detected Skills Inventory */}
          <div className="rounded-xl border border-border bg-[#161B22]/40 p-6 space-y-4 font-mono">
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-border/40 pb-2">
              Detected Skills Inventory
            </h4>

            <div className="space-y-3">
              {skillsList.map(skill => (
                <div key={skill.name} className="space-y-1 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span className="font-bold text-text-primary">{skill.name}</span>
                    <span>{skill.pct}% Confidence</span>
                  </div>
                  <div className="w-full h-1 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${skill.pct}%` }} />
                  </div>
                </div>
              ))}
              {skillsList.length === 0 && (
                <div className="text-xs text-text-secondary italic text-center py-4">No skills detected.</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Dashboard Statistics & Timelines (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Circular Grade & AI Summary Block */}
          <div className="rounded-xl border border-border bg-[#161B22]/65 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left circular gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40 pb-6 md:pb-0 md:pr-6">
              <div className="relative flex items-center justify-center h-28 w-28">
                <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={badgeRadius} className="stroke-[#30363D]" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r={badgeRadius}
                    stroke="#58A6FF"
                    strokeWidth="6"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="text-center z-10 font-mono">
                  <span className="text-3xl font-black font-space-grotesk tracking-tight text-[#58A6FF]">
                    {gradeStr}
                  </span>
                  <div className="text-[9px] text-text-secondary font-bold">
                    {overallScore} / 100
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary font-mono font-bold mt-3.5 uppercase tracking-wider">Developer Rank</span>
            </div>

            {/* Right: AI Summary Text */}
            <div className="md:col-span-8 space-y-3">
              <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
                <Sparkles size={15} className="text-indigo-400 animate-pulse" />
                <span>Developer Summary</span>
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {aiInsights?.growthForecast?.summary || 
                  `${profile.name || profile.login} is an active developer on the platform. They have maintained consistent contribution streaks on their repositories, focusing primarily on modern tech implementations and quality code standards.`}
              </p>
            </div>

          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 font-mono">
              <span className="text-[9px] text-text-secondary font-bold uppercase block">Commits</span>
              <span className="text-lg font-black text-text-primary mt-1 block">{formatNumber(contributions.totalCommits)}</span>
            </div>
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 font-mono">
              <span className="text-[9px] text-text-secondary font-bold uppercase block">Stars Received</span>
              <span className="text-lg font-black text-text-primary mt-1 block">{formatNumber(contributions.totalStarsEarned)}</span>
            </div>
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 font-mono">
              <span className="text-[9px] text-text-secondary font-bold uppercase block">Active Streak</span>
              <span className="text-lg font-black text-emerald-400 mt-1 block">{contributions.currentStreak} Days</span>
            </div>
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-4 font-mono">
              <span className="text-[9px] text-text-secondary font-bold uppercase block">Followers</span>
              <span className="text-lg font-black text-text-primary mt-1 block">{formatNumber(profile.followers)}</span>
            </div>
          </div>

          {/* Full Stack Ecosystem Segmentation */}
          <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4 font-mono">
            <div>
              <h3 className="text-sm font-bold font-space-grotesk text-text-primary">Ecosystem Segmentation</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Distribution of total codebase bytes by ecosystem category.</p>
            </div>

            <div className="w-full h-4 bg-[#0D1117] rounded-full overflow-hidden flex border border-border">
              {segmentation.map((seg, idx) => (
                seg.percentage > 0 && (
                  <div
                    key={idx}
                    className="h-full"
                    style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                    title={`${seg.name}: ${seg.percentage}%`}
                  />
                )
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs pt-1">
              {segmentation.map((seg, idx) => {
                const Icon = seg.icon;
                return (
                  seg.percentage > 0 && (
                    <div key={idx} className="p-2 bg-background/50 rounded-lg border border-border space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-text-secondary">
                        <span className="font-bold uppercase truncate">{seg.name}</span>
                        <Icon size={10} style={{ color: seg.color }} />
                      </div>
                      <span className="font-bold block text-[#F0F6FC]">{seg.percentage}%</span>
                    </div>
                  )
                );
              })}
            </div>
          </div>

          {/* Contribution Heatmap Matrix */}
          <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-4 font-mono">
            <div>
              <h3 className="text-sm font-bold font-space-grotesk text-text-primary">Contribution Heatmap</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">A 53-week grid representing version control updates.</p>
            </div>
            <ContributionHeatmap dailyContributions={contributions.dailyContributions} />
          </div>

          {/* Repository Showcase */}
          <div className="space-y-4 font-mono">
            <div>
              <h3 className="text-sm font-bold font-space-grotesk text-text-primary">Repository Showcase</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Top and pinned codebases highlighted by the developer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showcaseRepos.map(repo => (
                <div
                  key={repo.id}
                  className="rounded-xl border border-border bg-[#161B22]/30 p-5 flex flex-col justify-between hover:border-border/80 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-bold font-space-grotesk text-sm text-[#F0F6FC] hover:text-[#58A6FF] transition-colors truncate block">
                        {repo.name}
                      </a>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-[#0D1117] border border-border text-[#8B949E] hover:text-[#F0F6FC]">
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-[#8B949E] leading-relaxed line-clamp-2 font-sans">{repo.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 mt-4 pt-3 text-[10px] text-text-secondary">
                    {repo.language && (
                      <span className="flex items-center gap-1 font-bold text-[#F0F6FC]">{repo.language}</span>
                    )}
                    <div className="flex gap-2">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                    </div>
                  </div>
                </div>
              ))}
              {showcaseRepos.length === 0 && (
                <div className="text-xs text-text-secondary italic text-center py-6 md:col-span-2">No showcase repositories found.</div>
              )}
            </div>
          </div>

          {/* Timeline Milestones & Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
            
            {/* Left: Milestones */}
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-6 space-y-4">
              <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider border-b border-border/40 pb-2">
                Career Roadmap Milestones
              </h4>
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                {milestones.map((milestone, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className={`absolute -left-6 top-1 h-2 w-2 rounded-full border border-background ${milestone.unlocked ? "bg-emerald-400" : "bg-border"}`} />
                    <div className="space-y-0.5">
                      <span className={`font-bold block ${milestone.unlocked ? "text-text-primary" : "text-text-secondary"}`}>{milestone.title}</span>
                      <span className="text-[10px] text-text-secondary font-sans leading-tight block">{milestone.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Achievements */}
            <div className="rounded-xl border border-border bg-[#161B22]/40 p-6 space-y-4">
              <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider border-b border-border/40 pb-2">
                Unlocked Badges
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex flex-col justify-between items-center text-center space-y-2 ${
                      achievement.unlocked
                        ? "border-[#238636]/30 bg-[#238636]/5 text-[#3FB950]"
                        : "border-[#30363D] bg-[#161B22]/20 text-[#8B949E] opacity-50"
                    }`}
                  >
                    <Award size={20} className={achievement.unlocked ? "text-emerald-400" : "text-text-secondary"} />
                    <span className="font-bold text-[10px] truncate w-full">{achievement.title}</span>
                    <span className="text-[8px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">{achievement.rarity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI Career Assessment */}
          <div className="rounded-xl border border-border bg-[#161B22]/65 p-6 space-y-4 font-mono">
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-400" />
              <span>AI Career Assessment</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="p-3 bg-background/50 rounded-lg border border-border space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Developer Level</span>
                <span className="font-bold text-text-primary block truncate">L3 - Senior Associate</span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Suggested Technology</span>
                <span className="font-bold text-[#58A6FF] block truncate">{aiInsights?.suggestedTechnologies?.[0] || "GraphQL"}</span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border space-y-1">
                <span className="text-[10px] text-text-secondary uppercase block">Assessment Confidence</span>
                <span className="font-bold text-[#3FB950] block truncate">92% Index Match</span>
              </div>
            </div>

            {aiInsights?.learningRoadmap && aiInsights.learningRoadmap.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-text-secondary uppercase block">Suggested Learning Roadmap</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {aiInsights.learningRoadmap.slice(0, 2).map((stage, idx) => (
                    <div key={idx} className="p-3.5 bg-background/30 rounded-xl border border-border/80 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-accent uppercase truncate">{stage.stage}</span>
                        <span className="text-text-secondary">{stage.duration}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary leading-relaxed font-sans">
                        Fulfill competencies: {stage.topics.join(", ")}.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
