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
  Users,
  Bot,
  ChevronDown,
  LayoutDashboard,
  Menu,
  X,
  Bell,
  CheckCircle2,
  ExternalLink,
  Code
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

  const username = user?.username || user?.displayName?.toLowerCase().replace(/\s+/g, '') || 'developer';
  const avatarUrl = user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;

  const navLinks = [
    { name: 'Feed', href: '/feed', icon: LayoutDashboard },
    { name: 'Generator', href: '/', icon: Sparkles },
    { name: 'Projects', href: '/projects', icon: Code },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'AI Suite', href: '/ai', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
        
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl shrink-0"
        >
          <DevTrackLogo size={36} />
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              DevTrack
              <span className="rounded-md bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                2.0
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Logged In & Visitor) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devs, repos, tech... ⌘K"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden sm:inline-block rounded border border-white/10 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </div>
          </form>
        </div>

        {/* Right Section: Auth State / Profile Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            /* Logged In State: Notifications & User Profile Section */
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button
                type="button"
                className="relative rounded-xl border border-white/10 bg-slate-900/60 p-2 text-slate-400 hover:border-indigo-500/40 hover:text-white transition-all max-sm:hidden"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              </button>

              {/* User Profile Section & Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 pr-3 hover:border-indigo-500/40 transition-all focus:outline-none"
                >
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="h-8 w-8 rounded-xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-white max-w-[100px] truncate leading-tight">
                      {user.displayName || username}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">@{username}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/15 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 divide-y divide-white/10"
                    >
                      {/* Dropdown User Info Header */}
                      <div className="p-3 space-y-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={username}
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/40"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-extrabold text-white truncate">
                              {user.displayName || username}
                            </h4>
                            <p className="text-[11px] text-indigo-400 font-mono truncate">@{username}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verified Developer Identity</span>
                        </div>
                      </div>

                      {/* Dropdown Navigation Options */}
                      <div className="py-1.5 space-y-0.5">
                        <Link
                          href={`/u/${username}`}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300 transition-all"
                        >
                          <User className="h-4 w-4 text-indigo-400" />
                          <span>View Public Profile</span>
                        </Link>
                        <Link
                          href="/"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300 transition-all"
                        >
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span>Identity Card Generator</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300 transition-all"
                        >
                          <Settings className="h-4 w-4 text-cyan-400" />
                          <span>Account Settings</span>
                        </Link>
                      </div>

                      {/* Sign Out Button */}
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-all"
                        >
                          <LogOut className="h-4 w-4 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Logged Out / Visitor State: Sign In Button */
            <button
              type="button"
              onClick={() => {
                if (onRequireAuth) {
                  onRequireAuth('Sign in with GitHub');
                } else {
                  router.push('/');
                }
              }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl border border-white/10 bg-slate-900/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition-all"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-slate-950 p-4 lg:hidden space-y-3"
          >
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devs, repos..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </form>

            {/* Links List */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                      isActive ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logged in info / Sign Out on mobile */}
            {user ? (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={avatarUrl} alt={username} className="h-7 w-7 rounded-lg" />
                  <span className="text-xs font-bold text-white">@{username}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
