'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DevTrackLogo } from '@/components/ui/DevTrackLogo';
import { logOutUser } from '@/lib/firebase';
import { GithubIcon } from '@/components/ui/GithubIcon';
import {
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Code,
  Activity,
  Home,
  MessageSquare,
  Loader2
} from 'lucide-react';

export interface NavbarProps {
  currentUser?: any;
  onLoginSuccess?: (user: any) => void;
  onLogout?: () => Promise<void> | void;
  onOpenSearch?: () => void;
  onRequireAuth?: (actionTitle: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser: propUser,
  onLogout,
  onRequireAuth,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(propUser || null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);
  const [isLimelightReady, setIsLimelightReady] = useState(false);

  // Sync user state from props or localStorage
  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('devtrack_current_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
    }
  }, [propUser]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live GitHub user search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('devtrack_github_token') ?? undefined : undefined;
        const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(searchQuery.trim())}&per_page=5`, { headers });
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json.items || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSignOut = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await logOutUser();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setIsProfileMenuOpen(false);
      router.push('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/u/${encodeURIComponent(searchQuery.trim().replace(/^@/, ''))}`);
    }
  };

  const username = user?.username || user?.displayName?.toLowerCase().replace(/\s+/g, '') || 'shadcn';
  const avatarUrl = user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;

  // Dedicated core navigation items (Home, Projects, GitHub Analytics)
  const leftNavLinks = [
    { name: 'Home', href: '/', icon: Home, matchExact: true },
    { name: 'Projects', href: '/projects', icon: Code, matchExact: false },
    { name: 'GitHub Analytics', href: `/u/${username}?tab=analytics`, icon: Activity, matchExact: false },
  ];

  // Calculate current active link index for the Limelight animation (defaults to 0 for Home)
  const rawIndex = leftNavLinks.findIndex((link) =>
    link.matchExact ? pathname === link.href : pathname.startsWith(link.href.split('?')[0])
  );
  const activeNavIndex = rawIndex >= 0 ? rawIndex : 0;

  // Position Limelight Spotlight effect dynamically over active tab
  useEffect(() => {
    const updateLimelight = () => {
      const limelight = limelightRef.current;
      const activeItem = navItemRefs.current[activeNavIndex];

      if (limelight && activeItem) {
        const newLeft = activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2;
        limelight.style.left = `${newLeft}px`;
        if (!isLimelightReady) {
          setIsLimelightReady(true);
        }
      }
    };

    updateLimelight();
    const animId = requestAnimationFrame(updateLimelight);
    window.addEventListener('resize', updateLimelight);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateLimelight);
    };
  }, [activeNavIndex, isLimelightReady, pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all font-sans">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
        
        {/* BRAND LOGO & LEFT NAVIGATION LINKS WITH LIMELIGHT SPOTLIGHT ANIMATION */}
        <div className="flex items-center gap-6 shrink-0 h-full">
          <Link 
            href="/" 
            className="group flex items-center gap-2.5 focus-visible:outline-none rounded-xl"
          >
            <DevTrackLogo size={32} />
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              DevTrack
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30 font-mono">
                2.0
              </span>
            </span>
          </Link>

          {/* Left Navigation Links with Limelight Animation */}
          <nav className="hidden lg:flex items-center gap-1 relative h-full">
            {leftNavLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = index === activeNavIndex;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  ref={(el) => { navItemRefs.current[index] = el; }}
                  className={`relative z-20 flex items-center gap-2 px-3.5 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'text-indigo-300 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Dynamic Limelight Spotlight Beam Indicator */}
            <div
              ref={limelightRef}
              className={`absolute top-0 z-30 w-10 h-[4px] rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 shadow-[0_0_24px_rgba(99,102,241,1)] ${
                isLimelightReady ? 'transition-[left] duration-300 ease-in-out' : ''
              }`}
              style={{ left: '-999px' }}
            >
              <div className="absolute left-[-50%] top-[4px] w-[200%] h-14 [clip-path:polygon(10%_100%,35%_0,65%_0,90%_100%)] bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent pointer-events-none" />
            </div>
          </nav>
        </div>

        {/* CENTERED GLOBAL SEARCH BAR WITH LIVE GITHUB SUGGESTIONS */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              {isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              ) : (
                <Search className="h-3.5 w-3.5 text-slate-500" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
              placeholder="Search devs on GitHub... ⌘K"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-9 pr-10 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <kbd className="hidden sm:inline-block rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Live Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSearchDropdown && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/15 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 space-y-1 font-sans"
              >
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                      router.push(`/u/${item.login}`);
                    }}
                    className="flex items-center gap-3 w-full rounded-xl p-2 text-left hover:bg-indigo-500/15 transition-all cursor-pointer group"
                  >
                    <img
                      src={item.avatar_url}
                      alt={item.login}
                      className="h-8 w-8 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-white group-hover:text-indigo-300 truncate">
                          @{item.login}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 shrink-0">
                          ✓ Verified
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">View GitHub Developer Profile</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SECTION: NOTIFICATIONS, MESSAGES & USER PROFILE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Button Link */}
          <Link
            href="/notifications"
            className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              pathname === '/notifications'
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-indigo-500/40 hover:text-white'
            }`}
            title="Notifications"
          >
            <div className="relative">
              <Bell className="h-3.5 w-3.5 text-indigo-400" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <span className="hidden xl:inline">Notifications</span>
          </Link>

          {/* Messages Button Link */}
          <Link
            href="/messages"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              pathname === '/messages'
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-indigo-500/40 hover:text-white'
            }`}
            title="Messages"
          >
            <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden xl:inline">Messages</span>
          </Link>

          {user ? (
            /* User Profile & Dropdown */
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-1 pr-2.5 hover:border-indigo-500/40 transition-all focus:outline-none cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="h-7 w-7 rounded-xl object-cover ring-2 ring-indigo-500/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
                <span className="hidden sm:inline text-xs font-extrabold text-white max-w-[90px] truncate">
                  @{username}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/15 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 divide-y divide-white/10 font-sans"
                  >
                    {/* User Info */}
                    <div className="p-2.5 space-y-1">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={avatarUrl}
                          alt={username}
                          className="h-8 w-8 rounded-xl object-cover ring-2 ring-indigo-500/40"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-extrabold text-white truncate">
                            {user.displayName || username}
                          </h4>
                          <p className="text-[10px] text-indigo-400 font-mono truncate">@{username}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>Verified Identity</span>
                      </div>
                    </div>

                    {/* Navigation Options */}
                    <div className="py-1.5 space-y-0.5">
                      <Link
                        href={`/u/${username}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300 transition-all"
                      >
                        <User className="h-3.5 w-3.5 text-indigo-400" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300 transition-all"
                      >
                        <Settings className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Visitor Sign In Button */
            <button
              type="button"
              onClick={() => {
                if (onRequireAuth) {
                  onRequireAuth('Sign in with GitHub');
                } else {
                  router.push('/');
                }
              }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl border border-white/10 bg-slate-900/60 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition-all"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-slate-950 p-4 lg:hidden space-y-3"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devs..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </form>

            <div className="space-y-1">
              {leftNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold ${
                      isActive ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
