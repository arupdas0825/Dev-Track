'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DevTrackLogo } from '@/components/ui/DevTrackLogo';
import { logOutUser } from '@/lib/firebase';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { TierAvatar } from '@/components/ui/TierAvatar';
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

import { MobileTopBar } from './MobileTopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHamburgerMenu } from './MobileHamburgerMenu';
import { MobileSearchModal } from './MobileSearchModal';

export interface NavbarProps {
  currentUser?: any;
  onLoginSuccess?: (user: any) => void;
  onLogout?: () => Promise<void> | void;
  onOpenSearch?: () => void;
  onRequireAuth?: (actionTitle: string) => void;
  onOpenTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser: propUser,
  onLogout,
  onRequireAuth,
  onOpenTheme,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(propUser || null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Mobile states
  const [isMobileHamburgerOpen, setIsMobileHamburgerOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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

  // Dedicated core navigation items
  const leftNavLinks = [
    { name: 'Home', href: '/feed', icon: Home, matchExact: true },
    { name: 'Projects', href: '/projects', icon: Code, matchExact: false },
    { name: 'GitHub Analytics', href: `/u/${username}?tab=analytics`, icon: Activity, matchExact: false },
  ];

  const rawIndex = leftNavLinks.findIndex((link) =>
    link.matchExact ? pathname === link.href : pathname.startsWith(link.href.split('?')[0])
  );
  const activeNavIndex = rawIndex >= 0 ? rawIndex : 0;

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
    <>
      {/* 📱 MOBILE NAVIGATION (BAR & BOTTOM NAV) */}
      <MobileTopBar
        user={user}
        onOpenSearch={() => setIsMobileSearchOpen(true)}
        onOpenHamburger={() => setIsMobileHamburgerOpen(true)}
        onOpenAuth={() => onRequireAuth?.('Sign In')}
      />

      <MobileBottomNav user={user} />

      <MobileHamburgerMenu
        isOpen={isMobileHamburgerOpen}
        onClose={() => setIsMobileHamburgerOpen(false)}
        user={user}
        onOpenTheme={onOpenTheme}
        onLogout={handleSignOut}
        onOpenAuth={() => onRequireAuth?.('Sign In')}
      />

      <MobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />

      {/* 💻 DESKTOP HEADER NAVBAR (>= md) */}
      <header className="sticky top-0 z-50 hidden md:block w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all font-sans">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
          
          {/* BRAND LOGO & LEFT NAVIGATION LINKS */}
          <div className="flex items-center gap-6 shrink-0 h-full">
            <Link 
              href="/feed" 
              className="group flex items-center gap-2.5 focus-visible:outline-none rounded-xl"
            >
              <DevTrackLogo size={32} />
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                DevTrack
                <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/30 font-mono">
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
                        ? 'text-cyan-300 font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div
                ref={limelightRef}
                className={`absolute top-0 z-30 w-10 h-[4px] rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 shadow-[0_0_24px_rgba(34,211,238,1)] ${
                  isLimelightReady ? 'transition-[left] duration-300 ease-in-out' : ''
                }`}
                style={{ left: '-999px' }}
              >
                <div className="absolute left-[-50%] top-[4px] w-[200%] h-14 [clip-path:polygon(10%_100%,35%_0,65%_0,90%_100%)] bg-gradient-to-b from-cyan-500/40 via-purple-500/20 to-transparent pointer-events-none" />
              </div>
            </nav>
          </div>

          {/* CENTERED GLOBAL SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                placeholder="Search developers (e.g. torvalds, gaearon)..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-cyan-400" />
              )}
            </form>

            {/* LIVE SEARCH DROPDOWN */}
            <AnimatePresence>
              {showSearchDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1 font-sans"
                >
                  <p className="px-3 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">GitHub Developers</p>
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/u/${item.login}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <TierAvatar
                          src={item.avatar_url}
                          alt={item.login}
                          tier="Diamond"
                          size="sm"
                          className="w-7 h-7 rounded-lg"
                        />
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{item.login}</p>
                          <p className="text-[10px] text-slate-400 font-mono">github.com/{item.login}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">View →</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PROFILE & AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-1.5 pr-3 hover:bg-slate-800 transition-all"
                >
                  <TierAvatar
                    src={user.avatarUrl || user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
                    alt={username}
                    tier={user.tier || 'Diamond'}
                    size="sm"
                    className="w-7 h-7 rounded-lg"
                  />
                  <span className="text-xs font-bold text-slate-200">{username}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1 font-sans"
                    >
                      <Link
                        href={`/u/${username}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900"
                      >
                        <User className="h-4 w-4 text-cyan-400" />
                        <span>Profile & Score</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-900"
                      >
                        <Settings className="h-4 w-4 text-purple-400" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => onRequireAuth?.('Sign In')}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:opacity-95 active:scale-95 transition-all"
              >
                <GithubIcon className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
