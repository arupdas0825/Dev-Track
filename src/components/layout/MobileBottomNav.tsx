'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, FolderGit2, Activity, Bell, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTabOverride?: string;
  user?: any;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTabOverride,
  user,
  unreadCount = 2,
}) => {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (activeTabOverride) return activeTabOverride;
    if (pathname === '/' || pathname === '/feed') return 'home';
    if (pathname.startsWith('/projects') || pathname.startsWith('/repository')) return 'projects';
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/ai')) return 'analytics';
    if (pathname.startsWith('/notifications')) return 'notifications';
    if (pathname.startsWith('/u/') || pathname.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      href: '/feed',
      icon: Home,
    },
    {
      id: 'projects',
      label: 'Projects',
      href: '/projects',
      icon: FolderGit2,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/dashboard',
      icon: Activity,
    },
    {
      id: 'notifications',
      label: 'Activity',
      href: '/notifications',
      icon: Bell,
      badge: unreadCount,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: user?.username ? `/u/${user.username}` : '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden w-full bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl active:scale-95 transition-all text-center min-w-[60px]"
            >
              {/* Active Tab Glass Highlight Pill */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-indigo-500/20 to-purple-500/15 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative z-10 my-0.5">
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive
                      ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-[10px] font-bold text-slate-950 shadow-sm ring-1 ring-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`relative z-10 text-[10px] font-medium tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
