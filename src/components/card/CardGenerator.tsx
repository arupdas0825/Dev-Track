'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { DeveloperCard, DeveloperCardData } from './DeveloperCard';
import { GitHubCardService } from '@/services/github/github-card.service';

export interface CardGeneratorRef {
  focusInput: () => void;
}

interface CardGeneratorProps {
  onRequireAuth: (actionTitle: string, actionMessage?: string, resume?: () => void) => void;
}

export const CardGenerator = forwardRef<CardGeneratorRef, CardGeneratorProps>(({ onRequireAuth }, ref) => {
  const [inputUsername, setInputUsername] = useState('shadcn');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardData, setCardData] = useState<DeveloperCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  }));

  const fetchAndShowCard = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, '') || 'shadcn';
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await GitHubCardService.fetchRealDeveloperCardData(cleanUser);
      setCardData(data);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error('Error fetching Developer Card data:', err);
      setErrorMessage(err.message || 'Failed to fetch verified GitHub developer data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchAndShowCard(inputUsername);
  };

  const handleSampleClick = (sample: string) => {
    setInputUsername(sample);
    fetchAndShowCard(sample);
  };

  return (
    <div className="w-full space-y-3">
      {/* Input Form Box */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <GithubIcon className="h-5 w-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputUsername}
              onChange={(e) => {
                setInputUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter GitHub username (e.g. shadcn, torvalds)"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{loading ? 'Fetching API...' : 'Generate Card'}</span>
          </button>
        </form>

        {/* Error State Notice */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick presets & info */}
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-medium text-slate-500">Quick Samples:</span>
            {['shadcn', 'gaearon', 'torvalds'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-1 text-[11px] font-mono text-indigo-300 hover:border-indigo-500/40 hover:bg-slate-900 transition-all"
              >
                @{sample}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Live GitHub API Data
          </span>
        </div>
      </div>

      {/* Developer Card Preview Modal */}
      <AnimatePresence>
        {isModalOpen && cardData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-3 sm:p-4 shadow-2xl space-y-3 max-h-[95vh] overflow-hidden"
            >
              {/* Developer Card Display */}
              <div className="flex justify-center">
                <DeveloperCard
                  data={cardData}
                  isLoading={loading}
                  onClose={() => setIsModalOpen(false)}
                  onRequireAuth={(action) => {
                    setIsModalOpen(false);
                    onRequireAuth(action);
                  }}
                />
              </div>

              {/* Modal Footer Banner */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 text-indigo-200 text-[11px]">
                  <Lock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Sign in with GitHub to claim and share your verified card!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    onRequireAuth('Claim & Save Verified Developer Identity');
                  }}
                  className="shrink-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

CardGenerator.displayName = 'CardGenerator';
