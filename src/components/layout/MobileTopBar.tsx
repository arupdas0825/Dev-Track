'use client';

import React from 'react';
import Link from 'next/link';
import { DevTrackLogo } from '@/components/ui/DevTrackLogo';
import { TierAvatar } from '@/components/ui/TierAvatar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Bell, MessageSquare, Menu, Search, User } from 'lucide-react';

interface MobileTopBarProps {
  user?: any;
  unreadNotifications?: number;
  unreadMessages?: number;
  onOpenNotifications?: () => void;
  onOpenMessages?: () => void;
  onOpenSearch?: () => void;
  onOpenHamburger?: () => void;
  onOpenAuth?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  user,
  unreadNotifications = 2,
  unreadMessages = 1,
  onOpenNotifications,
  onOpenMessages,
  onOpenSearch,
  onOpenHamburger,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 block md:hidden w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <Link href="/feed" className="flex items-center gap-2 group active:scale-95 transition-transform">
          <DevTrackLogo className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
          <span className="font-mono text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            DevTrack
          </span>
        </Link>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800/80 active:scale-95 transition-all"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-slate-300" />
          </button>

          {/* Messages Button */}
          <button
            onClick={onOpenMessages}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800/80 active:scale-95 transition-all"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5 text-slate-300" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800/80 active:scale-95 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-300" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 ring-2 ring-slate-950"></span>
              </span>
            )}
          </button>

          {/* User Profile Avatar or Sign In */}
          {user ? (
            <Link
              href={`/u/${user.username || user.displayName?.toLowerCase().replace(/\s+/g, '') || 'shadcn'}`}
              className="ml-1 active:scale-95 transition-transform shrink-0"
            >
              <TierAvatar
                src={user.avatarUrl || user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username || 'user'}`}
                alt={user.name || user.username || 'User'}
                tier={user.tier || 'Diamond'}
                size="sm"
                className="w-8 h-8 rounded-xl ring-1 ring-cyan-500/30"
              />
            </Link>
          ) : (
            <button
              onClick={onOpenAuth}
              className="ml-1 p-2 rounded-xl text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 active:scale-95 transition-all flex items-center justify-center"
              aria-label="Sign In"
            >
              <User className="w-5 h-5 text-cyan-400" />
            </button>
          )}

          {/* Hamburger Menu Toggle */}
          <button
            onClick={onOpenHamburger}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 active:scale-95 transition-all ml-0.5"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
