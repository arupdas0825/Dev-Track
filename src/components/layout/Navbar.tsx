'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Code,
  Activity,
  Home,
  MessageSquare
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
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all font-sans">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
        
        {/* BRAND LOGO & LEFT NAVIGATION LINKS */}
        <div className="flex items-center gap-6 shrink-0">
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

          {/* Left Navigation Links next to logo */}
          <nav className="hidden lg:flex items-center gap-1">
            {leftNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.matchExact
                ? pathname === link.href
                : pathname.startsWith(link.href.split('?')[0]);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                      : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CENTERED GLOBAL SEARCH BAR */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devs, repos, tech... ⌘K"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-9 pr-10 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <kbd className="hidden sm:inline-block rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </div>
          </form>
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
                        <span>Public Profile</span>
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
                placeholder="Search devs, repos..."
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
