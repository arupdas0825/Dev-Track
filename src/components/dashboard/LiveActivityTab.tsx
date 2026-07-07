import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bell,
  GitPullRequest,
  HelpCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Star,
  Users,
  Folder,
  Tag,
  FileText,
  Settings,
  Shield,
  Layers,
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";
import {
  GitHubActivityService,
  LiveEvent,
  GitHubNotification,
  SyncLog
} from "@/services/github/github-activity.service";
import { UserDashboardData } from "@/types";

interface LiveActivityTabProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  dashboardData: UserDashboardData | null;
  githubToken: string;
}

export default function LiveActivityTab({
  activeSubTab,
  setActiveSubTab,
  dashboardData,
  githubToken
}: LiveActivityTabProps) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [notifications, setNotifications] = useState<GitHubNotification[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  
  // Config state
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // in seconds
  const [syncStatus, setSyncStatus] = useState<"live" | "syncing" | "offline">("live");
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [secondsToNextRefresh, setSecondsToNextRefresh] = useState<number>(30);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all"); // 'today', 'yesterday', '7days', 'all'
  
  // Watchlist state
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [newWatchRepo, setNewWatchRepo] = useState("");
  
  // Desktop notifications settings
  const [desktopNotifEnabled, setDesktopNotifEnabled] = useState(false);
  const [notifPreferences, setNotifPreferences] = useState({
    stars: true,
    followers: true,
    prs: true,
    issues: true,
    releases: true
  });

  const username = dashboardData?.profile?.login || "demo";

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setDesktopNotifEnabled(permission === "granted");
    }
  };

  // Trigger browser notification
  const triggerNotification = (title: string, body: string) => {
    if (desktopNotifEnabled && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico"
      });
    }
  };

  // Fetch Activity and Notifications
  const performSync = async () => {
    setSyncStatus("syncing");
    const startTime = Date.now();
    try {
      const fetchedEvents = await GitHubActivityService.fetchUserEvents(username, githubToken);
      const fetchedNotifs = await GitHubActivityService.fetchNotifications(githubToken);
      
      // Look for new events to trigger notifications
      if (events.length > 0 && fetchedEvents.length > events.length) {
        const newEvts = fetchedEvents.filter(fe => !events.some(e => e.id === fe.id));
        newEvts.forEach(evt => {
          if (evt.type === "star" && notifPreferences.stars) {
            triggerNotification("⭐ New Star Received", `${evt.actorName} starred ${evt.repoName}`);
          } else if (evt.type === "follow" && notifPreferences.followers) {
            triggerNotification("👤 New Follower", `${evt.actorName} started following you`);
          } else if (evt.type === "pr_opened" && notifPreferences.prs) {
            triggerNotification("🔌 Pull Request Opened", `${evt.actorName} opened PR on ${evt.repoName}`);
          }
        });
      }

      setEvents(fetchedEvents);
      setNotifications(fetchedNotifs);
      setLastSyncTime(new Date());
      setSyncStatus("live");
      
      // Append sync log
      const newLog: SyncLog = {
        id: `sync-${Date.now()}`,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        eventsCount: fetchedEvents.length,
        status: "success"
      };
      setSyncLogs(prev => [newLog, ...prev].slice(0, 50));
    } catch (e) {
      setSyncStatus("offline");
      const newLog: SyncLog = {
        id: `sync-err-${Date.now()}`,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        eventsCount: 0,
        status: "error",
        errorMsg: e instanceof Error ? e.message : "Sync error"
      };
      setSyncLogs(prev => [newLog, ...prev].slice(0, 50));
    }
  };

  // Run initial fetch
  useEffect(() => {
    performSync();
  }, [username, githubToken]);

  // Set up timer for refresh intervals
  useEffect(() => {
    setSecondsToNextRefresh(refreshInterval);
  }, [refreshInterval]);

  useEffect(() => {
    if (refreshInterval === 0) return; // Manual refresh only

    const timer = setInterval(() => {
      setSecondsToNextRefresh(prev => {
        if (prev <= 1) {
          performSync();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, username, githubToken, events]);

  // Extract unique repositories for filtering
  const uniqueRepos = useMemo(() => {
    const reposSet = new Set<string>();
    events.forEach(e => {
      if (e.repoName) reposSet.add(e.repoName);
    });
    return Array.from(reposSet);
  }, [events]);

  // Handle Watchlist operations
  const addToWatchlist = () => {
    if (newWatchRepo && !watchlist.includes(newWatchRepo)) {
      setWatchlist(prev => [...prev, newWatchRepo]);
      setNewWatchRepo("");
    }
  };

  const removeFromWatchlist = (repo: string) => {
    setWatchlist(prev => prev.filter(r => r !== repo));
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Search query filter
      const matchesSearch =
        e.repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.details?.commitMsg?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        
      // Repository filter
      const matchesRepo = selectedRepo === "all" ? true : e.repoName === selectedRepo;

      // Event type filter
      const matchesType = eventTypeFilter === "all" ? true : e.type === eventTypeFilter;

      // Watchlist filter
      const matchesWatchlist = watchlist.length === 0 ? true : watchlist.includes(e.repoName);

      return matchesSearch && matchesRepo && matchesType && matchesWatchlist;
    });
  }, [events, searchQuery, selectedRepo, eventTypeFilter, watchlist]);

  // Sub-tabs list matching design prompt
  const subTabs = [
    { id: "live-feed", label: "Activity Feed", icon: Activity },
    { id: "live-notifications", label: "Notifications", icon: Bell },
    { id: "live-repos", label: "Repository Events", icon: Folder },
    { id: "live-prs", label: "Pull Requests", icon: GitPullRequest },
    { id: "live-issues", label: "Issues", icon: HelpCircle },
    { id: "live-releases", label: "Releases", icon: Tag },
    { id: "live-social", label: "Stars & Followers", icon: Users },
    { id: "live-timeline", label: "Live Timeline", icon: Clock },
    { id: "live-sync", label: "Sync History", icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time sync engine dashboard widget */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-5 flex md:flex-row flex-col justify-between items-start md:items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            {syncStatus === "syncing" ? (
              <RefreshCw size={24} className="animate-spin text-yellow-500" />
            ) : syncStatus === "live" ? (
              <>
                <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </>
            ) : (
              <span className="inline-flex rounded-full h-3 w-3 bg-rose-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-space-grotesk text-[#F0F6FC]">GitHub Heartbeat Engine</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#21262D] border border-[#30363D] text-[#8B949E]">
                {syncStatus === "live" ? "🟢 Connected" : syncStatus === "syncing" ? "🟡 Syncing" : "🔴 Offline"}
              </span>
            </div>
            <p className="text-xs text-[#8B949E] mt-1 font-mono">
              Last synced: {lastSyncTime.toLocaleTimeString()} | Refresh interval: {refreshInterval}s
            </p>
          </div>
        </div>

        {/* Polling control panel */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] p-1 rounded-lg">
            {[30, 60, 300].map(val => (
              <button
                key={val}
                onClick={() => setRefreshInterval(val)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                  refreshInterval === val
                    ? "bg-[#21262D] text-[#F0F6FC] border border-[#30363D]"
                    : "text-[#8B949E] hover:text-[#F0F6FC]"
                }`}
              >
                {val === 30 ? "30s" : val === 60 ? "1m" : "5m"}
              </button>
            ))}
            <button
              onClick={() => setRefreshInterval(0)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                refreshInterval === 0
                  ? "bg-[#21262D] text-[#F0F6FC] border border-[#30363D]"
                  : "text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              Manual
            </button>
          </div>

          <button
            onClick={performSync}
            disabled={syncStatus === "syncing"}
            className="flex items-center gap-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-bold text-[#F0F6FC] px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncStatus === "syncing" ? "animate-spin" : ""} />
            Sync Now
          </button>
        </div>
      </div>

      {/* Sub-Navigation Grid */}
      <div className="flex border-b border-[#30363D] overflow-x-auto scrollbar-none gap-2">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? "border-[#2F81F7] text-[#F0F6FC]"
                  : "border-transparent text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Sub-pages Render */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* 1. Activity Feed View */}
            {activeSubTab === "live-feed" && (
              <div className="space-y-4">
                {/* Watchlist Quick add panel */}
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4">
                  <h3 className="text-xs font-bold text-[#F0F6FC] mb-3 flex items-center gap-2">
                    <Folder size={12} className="text-[#2F81F7]" />
                    Repository Watchlist Filter
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. vercel/next.js"
                      value={newWatchRepo}
                      onChange={(e) => setNewWatchRepo(e.target.value)}
                      className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7]"
                    />
                    <button
                      onClick={addToWatchlist}
                      className="bg-[#2F81F7] hover:bg-[#2F81F7]/90 text-white font-bold text-xs px-4 py-1.5 rounded-lg cursor-pointer"
                    >
                      Watch Repo
                    </button>
                  </div>
                  {watchlist.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {watchlist.map(repo => (
                        <span
                          key={repo}
                          className="flex items-center gap-2 text-[10px] font-mono bg-[#21262D] border border-[#30363D] text-[#8B949E] px-2 py-0.5 rounded-full"
                        >
                          {repo}
                          <button
                            onClick={() => removeFromWatchlist(repo)}
                            className="hover:text-rose-500 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search / Filters */}
                <div className="flex md:flex-row flex-col gap-3">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B949E]" />
                    <input
                      type="text"
                      placeholder="Search events, authors, branches..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#2F81F7]"
                    />
                  </div>
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none"
                  >
                    <option value="all">All Repositories</option>
                    {uniqueRepos.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Timeline display */}
                <div className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#30363D] rounded-xl text-[#8B949E] text-xs">
                      No matching events found. Make sure you are authenticated or check filters.
                    </div>
                  ) : (
                    <div className="relative border-l border-[#30363D] ml-4 space-y-6 py-2">
                      {filteredEvents.map((evt, idx) => (
                        <div key={evt.id} className="relative pl-6 animate-fadeIn">
                          {/* Indicator circle dot */}
                          <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#30363D] border-2 border-[#0D1117] z-10 group-hover:bg-[#2F81F7] transition-colors" />
                          
                          <div className="bg-[#161B22]/30 border border-[#30363D] rounded-xl p-4 flex gap-4 items-start hover:border-[#30363D]/80 hover:bg-[#161B22]/50 transition-all">
                            <img
                              src={evt.actorAvatar}
                              alt={evt.actorName}
                              className="w-8 h-8 rounded-full border border-[#30363D]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-[#F0F6FC]">{evt.actorName}</span>
                                <span className="text-[10px] text-[#8B949E] font-mono">
                                  {new Date(evt.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-xs text-[#8B949E] mt-1">
                                {evt.description} in{" "}
                                <a
                                  href={evt.repoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#2F81F7] hover:underline"
                                >
                                  {evt.repoName}
                                </a>
                              </p>

                              {/* Details Payload rendering */}
                              {evt.details?.commitMsg && (
                                <div className="mt-2 text-[11px] font-mono bg-[#0D1117] border border-[#30363D] rounded-lg p-2 text-[#8B949E]">
                                  {evt.details.commitMsg}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Notifications Center */}
            {activeSubTab === "live-notifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#F0F6FC] flex items-center gap-2">
                    <Bell size={14} className="text-yellow-500" />
                    Unread Notifications ({notifications.filter(n => n.unread).length})
                  </h3>
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                      triggerNotification("Marked all Read", "All active notifications marked read.");
                    }}
                    className="text-xs text-[#2F81F7] hover:underline cursor-pointer font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2.5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#30363D] rounded-xl text-[#8B949E] text-xs">
                      All clean! No notifications found.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`border rounded-xl p-4 flex justify-between items-center gap-4 transition-all ${
                          notif.unread
                            ? "bg-[#2F81F7]/5 border-[#2F81F7]/30"
                            : "bg-[#161B22]/20 border-[#30363D]"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] text-[#8B949E] font-mono uppercase bg-[#21262D] border border-[#30363D] px-2 py-0.5 rounded">
                            {notif.reason}
                          </span>
                          <h4 className="text-xs font-bold text-[#F0F6FC] mt-2">
                            {notif.subject.title}
                          </h4>
                          <span className="text-[10px] text-[#8B949E] block mt-1">
                            Repository: {notif.repository.full_name}
                          </span>
                        </div>
                        {notif.unread && (
                          <button
                            onClick={() => {
                              setNotifications(prev =>
                                prev.map(n => (n.id === notif.id ? { ...n, unread: false } : n))
                              );
                            }}
                            className="bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[10px] font-bold text-[#F0F6FC] px-2 py-1 rounded"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. Repository Events View */}
            {activeSubTab === "live-repos" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {uniqueRepos.map(repo => {
                    const repoEvents = events.filter(e => e.repoName === repo);
                    return (
                      <div
                        key={repo}
                        className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4 hover:border-[#2F81F7]/40 transition-colors"
                      >
                        <h4 className="text-xs font-bold text-[#F0F6FC] truncate">{repo}</h4>
                        <div className="mt-3 flex items-center justify-between text-xs text-[#8B949E]">
                          <span>Events tracked</span>
                          <span className="font-mono font-bold text-[#F0F6FC]">{repoEvents.length}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedRepo(repo);
                              setActiveSubTab("live-feed");
                            }}
                            className="text-[10px] text-[#2F81F7] hover:underline"
                          >
                            View feed →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Pull Requests View */}
            {activeSubTab === "live-prs" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC]">🔌 Pull Requests Timeline</h3>
                <div className="space-y-2">
                  {events
                    .filter(e => e.type.startsWith("pr_"))
                    .map(evt => (
                      <div
                        key={evt.id}
                        className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#F0F6FC]">
                            {evt.details?.prTitle || evt.description}
                          </h4>
                          <span className="text-[10px] text-[#8B949E] block mt-1">
                            {evt.repoName} | {evt.actorName}
                          </span>
                        </div>
                        <a
                          href={evt.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2F81F7] hover:underline text-xs"
                        >
                          View PR
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 5. Issues View */}
            {activeSubTab === "live-issues" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC]">🐞 Issues Timeline</h3>
                <div className="space-y-2">
                  {events
                    .filter(e => e.type.startsWith("issue_"))
                    .map(evt => (
                      <div
                        key={evt.id}
                        className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#F0F6FC]">
                            {evt.details?.issueTitle || evt.description}
                          </h4>
                          <span className="text-[10px] text-[#8B949E] block mt-1">
                            {evt.repoName} | Opened by {evt.actorName}
                          </span>
                        </div>
                        <a
                          href={evt.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2F81F7] hover:underline text-xs"
                        >
                          View Issue
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 6. Releases View */}
            {activeSubTab === "live-releases" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#F0F6FC]">🏷️ Releases Timeline</h3>
                <div className="space-y-2">
                  {events
                    .filter(e => e.type === "release")
                    .map(evt => (
                      <div
                        key={evt.id}
                        className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#F0F6FC]">
                            {evt.details?.releaseTitle || evt.description}
                          </h4>
                          <span className="text-[10px] text-[#8B949E] block mt-1">
                            {evt.repoName} | Tag: {evt.details?.releaseTag}
                          </span>
                        </div>
                        <a
                          href={evt.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2F81F7] hover:underline text-xs"
                        >
                          Download Release
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 7. Stars & Followers View */}
            {activeSubTab === "live-social" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5">
                  <h3 className="text-xs font-bold text-[#F0F6FC] mb-4">Followers Trend</h3>
                  <div className="h-40 w-full flex items-end justify-between gap-1.5 pt-4">
                    {/* Simulated visual timeline trend */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          style={{ height: `${20 + Math.sin(i / 2) * 50 + 10}px` }}
                          className="w-full bg-[#2F81F7] rounded-t hover:bg-[#2F81F7]/80 transition-colors"
                        />
                        <span className="text-[8px] text-[#8B949E] font-mono">M{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#F0F6FC]">Recent Interactions</h4>
                  {events
                    .filter(e => e.type === "star" || e.type === "follow")
                    .map(evt => (
                      <div
                        key={evt.id}
                        className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.actorAvatar}
                            alt={evt.actorName}
                            className="w-6 h-6 rounded-full"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#F0F6FC]">{evt.actorName}</span>
                            <span className="text-xs text-[#8B949E] ml-1">{evt.description}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 8. Live Timeline View */}
            {activeSubTab === "live-timeline" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#F0F6FC]">Event Range Tracker</h3>
                  <div className="flex gap-2">
                    {["Today", "Yesterday", "7 Days", "All"].map(range => (
                      <button
                        key={range}
                        className="bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] px-2 py-1 text-[10px] font-bold text-[#F0F6FC] rounded-lg cursor-pointer"
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border border-[#30363D] bg-[#161B22]/20 rounded-xl p-4 text-[#8B949E] text-xs text-center">
                  Live calendar stream will compile events as they arrive during this session.
                </div>
              </div>
            )}

            {/* 9. Sync History View */}
            {activeSubTab === "live-sync" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-5">
                  <h3 className="text-xs font-bold text-[#F0F6FC] mb-4">Sync Configuration</h3>
                  <div className="space-y-4 text-xs text-[#8B949E]">
                    <div className="flex justify-between items-center">
                      <span>Desktop Notifications</span>
                      <button
                        onClick={requestNotificationPermission}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer border transition-colors ${
                          desktopNotifEnabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                            : "bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:bg-[#30363D]"
                        }`}
                      >
                        {desktopNotifEnabled ? "Enabled" : "Request Permission"}
                      </button>
                    </div>

                    <div className="border-t border-[#30363D] pt-4 space-y-2">
                      <span className="font-bold text-[#F0F6FC] block">Alert Preferences</span>
                      {Object.keys(notifPreferences).map(key => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer capitalize">
                          <input
                            type="checkbox"
                            checked={(notifPreferences as any)[key]}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setNotifPreferences(prev => ({ ...prev, [key]: checked }));
                            }}
                            className="rounded border-[#30363D] bg-[#0D1117] text-[#2F81F7] focus:ring-0"
                          />
                          <span>Alert on new {key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#F0F6FC]">Sync Log entries</h4>
                  {syncLogs.length === 0 ? (
                    <div className="text-center py-6 text-[#8B949E] text-xs">
                      No sync logs captured yet.
                    </div>
                  ) : (
                    syncLogs.map(log => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-[#30363D] bg-[#161B22]/30 p-3 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className={`font-mono uppercase font-bold text-[10px] ${
                            log.status === "success" ? "text-emerald-500" : "text-rose-500"
                          }`}>
                            {log.status}
                          </span>
                          <span className="text-[#8B949E] ml-2">
                            {new Date(log.startedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="font-mono text-[#8B949E]">
                          Duration: {log.durationMs}ms | Events: {log.eventsCount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
