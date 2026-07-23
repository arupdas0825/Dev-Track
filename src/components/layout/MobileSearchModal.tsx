'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, History, TrendingUp, User, ChevronRight, Star, GitFork, ArrowLeft } from 'lucide-react';
import { TierAvatar } from '@/components/ui/TierAvatar';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_DEVELOPERS = [
  { username: 'torvalds', name: 'Linus Torvalds', tier: 'Emerald' as const, score: 998, avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4' },
  { username: 'gaearon', name: 'Dan Abramov', tier: 'Diamond' as const, score: 945, avatar: 'https://avatars.githubusercontent.com/u/810438?v=4' },
  { username: 'shadcn', name: 'shadcn', tier: 'Gold' as const, score: 920, avatar: 'https://avatars.githubusercontent.com/u/124599?v=4' },
  { username: 'sponsors', name: 'GitHub Sponsors', tier: 'Silver' as const, score: 880, avatar: 'https://avatars.githubusercontent.com/u/9919?v=4' },
];

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('devtrack_recent_searches');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          setRecentSearches(['torvalds', 'gaearon', 'shadcn']);
        }
      } else {
        setRecentSearches(['torvalds', 'gaearon', 'shadcn']);
      }
    }
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search logic
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('devtrack_github_token') ?? undefined : undefined;
        const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;

        const res = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query.trim())}&per_page=8`, { headers });
        if (res.ok) {
          const json = await res.json();
          setResults(json.items || []);
        }
      } catch (err) {
        console.warn('Search query failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (username: string) => {
    const updated = [username, ...recentSearches.filter((s) => s.toLowerCase() !== username.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devtrack_recent_searches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devtrack_recent_searches');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950 flex flex-col block md:hidden"
        >
          {/* Sticky Top Bar Input */}
          <div className="sticky top-0 z-10 p-3 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search developers, repos, tags..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-sans"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search Loading Indicator */}
            {isSearching && (
              <div className="flex items-center justify-center py-8 text-cyan-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Searching GitHub network...</span>
              </div>
            )}

            {/* Live Search Results */}
            {!isSearching && query.trim().length >= 2 && (
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                  Search Results ({results.length})
                </p>
                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={`/u/${item.login}`}
                        onClick={() => {
                          saveRecentSearch(item.login);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 active:scale-98 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <TierAvatar
                            src={item.avatar_url}
                            alt={item.login}
                            tier="Diamond"
                            size="sm"
                            className="w-10 h-10 rounded-xl"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-slate-100">{item.login}</h4>
                            <p className="text-xs text-cyan-400 font-mono">github.com/{item.login}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                            Verified Dev
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60">
                    <p className="text-sm text-slate-400">No GitHub developers found matching &quot;{query}&quot;</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recent Searches</span>
                  </div>
                  <button onClick={clearRecentSearches} className="text-[11px] text-slate-500 hover:text-slate-300">
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3 text-slate-500" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Developers */}
            {!query && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Trending Developers</span>
                </div>
                <div className="space-y-2">
                  {TRENDING_DEVELOPERS.map((dev) => (
                    <Link
                      key={dev.username}
                      href={`/u/${dev.username}`}
                      onClick={() => {
                        saveRecentSearch(dev.username);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-950 border border-slate-800/80 hover:border-purple-500/40 active:scale-98 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <TierAvatar src={dev.avatar} alt={dev.name} tier={dev.tier} size="sm" className="w-10 h-10 rounded-xl" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-100">{dev.name}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                              {dev.tier}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">@{dev.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-cyan-400">{dev.score}</span>
                        <p className="text-[10px] text-slate-500">DevScore</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
