'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DevTrackLogo } from '@/components/ui/DevTrackLogo';
import { logOutUser } from '@/lib/firebase';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { LiquidMetalButton } from '@/components/ui/LiquidMetalButton';
import { LiquidMetalWrapper } from '@/components/ui/LiquidMetalWrapper';
import {
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Bell,
  CheckCircle2,
  Code,
  Activity,
  Home,
  MessageSquare,
  Loader2,
  Users,
  Sparkles,
  Briefcase,
} from 'lucide-react';

import { MobileTopBar } from './MobileTopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHamburgerMenu } from './MobileHamburgerMenu';
import { MobileSearchModal } from './MobileSearchModal';
import { MobilePostComposer } from '@/components/devfeed/MobilePostComposer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);

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
    { name: 'Connections', href: '/network', icon: Users, matchExact: false },
    { name: 'AI Insights', href: '/ai', icon: Sparkles, matchExact: false },
    { name: 'Job Analyser', href: '/jobs', icon: Briefcase, matchExact: false },
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

      <MobileBottomNav
        user={user}
        onOpenComposer={() => setIsMobileComposerOpen(true)}
      />

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

      <MobilePostComposer
        isOpen={isMobileComposerOpen}
        onClose={() => setIsMobileComposerOpen(false)}
        user={user}
        onPostCreated={() => {
          if (pathname === '/feed') {
            window.location.reload();
          } else {
            router.push('/feed');
          }
        }}
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
              <DevTrackLogo size={32} animated={false} />
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                DevTrack
              </span>
            </Link>

            {/* Left Navigation Links with Liquid Metal Shader Border */}
            <nav className="hidden lg:flex items-center gap-1.5 relative h-full">
              {leftNavLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = index === activeNavIndex;
                return (
                  <Link key={link.name} href={link.href}>
                    <LiquidMetalWrapper
                      borderRadius="12px"
                      active={isActive}
                      padding="1.5px"
                      className="transition-all"
                    >
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold transition-all ${
                        isActive ? 'text-cyan-300 font-extrabold' : 'text-slate-300 hover:text-white'
                      }`}>
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="whitespace-nowrap">{link.name}</span>
                      </div>
                    </LiquidMetalWrapper>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* CENTERED GLOBAL SEARCH BAR WITH LIQUID METAL BORDER */}
          <div className="hidden md:flex flex-1 max-w-xs mx-2 relative" ref={searchRef}>
            <LiquidMetalWrapper borderRadius="14px" className="w-full" padding="1.5px">
              <form onSubmit={handleSearchSubmit} className="w-full relative px-3 py-1.5 flex items-center">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                  placeholder="Search developers..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-mono"
                />
                {isSearching && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400 shrink-0 ml-2" />
                )}
              </form>
            </LiquidMetalWrapper>

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

          {/* RIGHT PROFILE, THEME TOGGLE & AUTH BUTTONS */}
          <div className="flex items-center gap-2">

            {/* Notification + Message Icons with Liquid Metal Shader Border */}
            <div className="hidden md:flex items-center gap-1.5">
              <Link href="/notifications" aria-label="Notifications">
                <LiquidMetalWrapper borderRadius="12px" padding="1.5px">
                  <div className="relative p-2 text-slate-300 hover:text-white flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  </div>
                </LiquidMetalWrapper>
              </Link>

              <Link href="/messages" aria-label="Messages">
                <LiquidMetalWrapper borderRadius="12px" padding="1.5px">
                  <div className="relative p-2 text-slate-300 hover:text-white flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
                  </div>
                </LiquidMetalWrapper>
              </Link>
            </div>

            <ThemeToggle />

            {user ? (
              <div className="relative" ref={menuRef}>
                <LiquidMetalButton
                  width={145}
                  height={40}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="flex items-center gap-2 px-1">
                    <TierAvatar
                      src={user.avatarUrl || user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
                      alt={username}
                      tier={user.tier || 'Diamond'}
                      size="sm"
                      className="w-6 h-6 rounded-lg"
                    />
                    <span className="text-xs font-bold text-slate-100 font-mono truncate max-w-[75px]">{username}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </div>
                </LiquidMetalButton>

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
              <LiquidMetalButton
                label="Sign In"
                onClick={() => onRequireAuth?.('Sign In')}
              />
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
