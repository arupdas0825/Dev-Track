"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { DevTrackUser } from "@/lib/firebase";
import AuthModal from "../auth/AuthModal";
import Logo from "../ui/Logo";
import { useTheme } from "@/components/ui/ThemeContext";

interface NavbarProps {
  currentUser: DevTrackUser | null;
  onLoginSuccess: (user: DevTrackUser) => void;
  onLogout: () => void;
  onDemoTrigger?: () => void;
}

export default function Navbar({ currentUser, onLoginSuccess, onLogout, onDemoTrigger }: NavbarProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { setIsThemeModalOpen } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group">
            <Logo size={32} showText={true} textSize="text-base" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <Link href="/#features" className="hover:text-text-primary transition-colors">Features</Link>
            <Link href="/#score-engine" className="hover:text-text-primary transition-colors">Score Engine</Link>
            <Link href="/#wrapped" className="hover:text-text-primary transition-colors">Wrapped</Link>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Universal Theme Palette Button */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer p-2 rounded-lg border border-border bg-surface/30 hover:bg-surface/75"
            title="Theme Settings"
            aria-label="Theme settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.42-.15-.82-.41-1.16-.26-.35-.41-.79-.41-1.27 0-1.1 1-2 2.11-2h1.79c3.08 0 5.88-2.54 5.88-5.7C22 6.5 17.5 2 12 2Z"/>
            </svg>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || currentUser.username}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-surface-secondary flex items-center justify-center text-[10px] text-text-secondary font-bold">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-text-primary">
                  {currentUser.username}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-danger hover:border-danger/30 transition-all focus:outline-none"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onDemoTrigger}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all focus:outline-none"
              >
                View Demo Dashboard
              </button>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-all focus:outline-none shadow-md shadow-accent/10"
              >
                GitHub Login
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background md:hidden px-4 py-4 flex flex-col gap-4 animate-fadeIn">
          <nav className="flex flex-col gap-3 text-sm font-medium text-text-secondary">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-text-primary transition-colors py-1.5"
            >
              Features
            </Link>
            <Link
              href="/#score-engine"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-text-primary transition-colors py-1.5"
            >
              Score Engine
            </Link>
            <Link
              href="/#wrapped"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-text-primary transition-colors py-1.5"
            >
              Wrapped
            </Link>
            {currentUser && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-text-primary transition-colors py-1.5 border-t border-border pt-3"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentUser.photoURL && (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.username}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-semibold text-text-primary">
                    {currentUser.username}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (onDemoTrigger) onDemoTrigger();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg border border-border bg-surface py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  View Demo Dashboard
                </button>
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent/90"
                >
                  GitHub Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={onLoginSuccess}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
