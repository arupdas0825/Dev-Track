'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Terminal, 
  Search, 
  Compass, 
  Rss, 
  FolderGit2, 
  Users, 
  Sparkles, 
  User as UserIcon, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export interface NavbarProps {
  currentUser?: any;
  onLoginSuccess?: (user: any) => void;
  onLogout?: () => Promise<void> | void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser: externalUser,
  onLoginSuccess,
  onLogout: externalLogout,
  onOpenSearch,
}) => {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(externalUser || null);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    if (externalUser !== undefined) {
      setCurrentUser(externalUser);
      return;
    }
    const checkUser = () => {
      const stored = localStorage.getItem('devtrack_current_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [externalUser]);

  const handleLogout = () => {
    if (externalLogout) {
      externalLogout();
    }
    localStorage.removeItem('devtrack_current_user');
    localStorage.removeItem('devtrack_github_token');
    setCurrentUser(null);
    setUserDropdown(false);
  };

  const navItems = currentUser
    ? [
        { label: 'Feed', href: '/feed', icon: Rss },
        { label: 'Projects', href: '/projects', icon: FolderGit2 },
        { label: 'Community', href: '/community', icon: Users },
        { label: 'AI Suite', href: '/ai', icon: Sparkles },
        { label: 'Messages', href: '/messages', icon: Terminal },
      ]
    : [
        { label: 'Discover', href: '/#card-generator', icon: Compass },
        { label: 'Community', href: '/community', icon: Users },
        { label: 'Features', href: '/#features', icon: Sparkles },
        { label: 'Projects', href: '/projects', icon: FolderGit2 },
      ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-5">
            <Link href={currentUser ? "/feed" : "/"} className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Terminal className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  DevTrack <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">2.0</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Universal Search & Auth */}
          <div className="flex items-center gap-3">
            {/* Search link */}
            <Link
              href="/search"
              onClick={(e) => {
                if (onOpenSearch) {
                  e.preventDefault();
                  onOpenSearch();
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 hover:border-indigo-500/40 hover:text-white transition-all w-36 sm:w-48"
            >
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <span>Search devs, repos...</span>
              <kbd className="ml-auto hidden sm:inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
            </Link>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-1.5 pr-3 hover:border-indigo-500/40 transition-all"
                >
                  <img
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.username}`}
                    alt={currentUser.displayName || currentUser.username}
                    className="h-7 w-7 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <span className="hidden sm:inline-block text-xs font-medium text-slate-200">
                    @{currentUser.username || 'developer'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur-2xl z-50">
                    <Link
                      href={`/u/${currentUser.username || 'developer'}`}
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>My Developer Identity</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all"
                    >
                      <Terminal className="h-4 w-4" />
                      <span>Settings & Sync</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden sm:block text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-90 hover:shadow-indigo-500/30 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Join Free</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => onLoginSuccess && onLoginSuccess(currentUser)}
        actionTitle="Join DevTrack Identity"
      />
    </>
  );
};

export default Navbar;
