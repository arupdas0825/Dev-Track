"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { DevTrackUser } from "@/lib/firebase";
import { MAINTENANCE_MODE } from "@/lib/featureFlags";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import Logo from "../ui/Logo";
import { useTheme } from "@/components/ui/ThemeContext";
import { Palette, Bell, Search, LogOut, Layout, ChevronDown, Sparkles } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

interface NavbarProps {
  currentUser: DevTrackUser | null;
  onLoginSuccess: (user: DevTrackUser) => void;
  onLogout: () => void;
  onDemoTrigger?: () => void;
  onOpenSearch?: () => void;
}

export default function Navbar({ currentUser, onLoginSuccess, onLogout, onDemoTrigger, onOpenSearch }: NavbarProps) {
  const { openAuthModal } = useAuthModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { openModal } = useTheme();

  // Scroll listener to activate glassmorphism shrink effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 font-mono ${
        scrolled
          ? "bg-background/75 backdrop-blur-xl border-b border-border/80 shadow-2xl shadow-black/40"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center group transition-transform duration-300 active:scale-95">
            <Logo size={scrolled ? 28 : 34} showText={true} textSize="text-base" />
          </Link>

          {/* Desktop Navigation Links with animated underlines */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            {(currentUser && !MAINTENANCE_MODE ? [
              { label: "Feed", href: "/", id: "feed" },
              { label: "Following", href: "/?tab=following", id: "following" },
              { label: "Score Engine", href: "/dashboard?tab=score", id: "score" },
              { label: "Wrapped", href: "/dashboard?tab=wrapped", id: "wrapped" },
            ] : [
              { label: "Features", href: "/#features", id: "features" },
              { label: "Score Engine", href: "/#features", id: "score" },
              { label: "Wrapped", href: "/#wrapped", id: "wrapped" },
            ]).map(tab => (
              <Link
                key={tab.id}
                href={tab.href}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className="relative px-3.5 py-1.5 rounded-md hover:text-text-primary transition-colors text-text-secondary uppercase tracking-wider"
              >
                {tab.label}
                {hoveredTab === tab.id && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 bg-border/30 border border-border/40 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface/40 text-xs text-text-secondary hover:text-text-primary hover:border-text-secondary/40 hover:bg-surface/80 transition-all font-mono active:scale-95"
              title="Search Repositories and Tabs (Ctrl + K)"
            >
              <Search size={13} className="text-text-secondary group-hover:text-text-primary transition-colors" />
              <span className="text-[10px] tracking-wider">Search...</span>
              <kbd className="px-1.5 py-0.5 text-[9px] bg-background border border-border rounded text-text-secondary font-bold group-hover:text-text-primary transition-colors font-mono">
                Ctrl K
              </kbd>
            </button>
          )}

          <button
            onClick={openModal}
            className="rounded-full p-2 hover:bg-border/40 text-text-secondary hover:text-text-primary transition-all duration-300 active:scale-95"
            title="Theme Settings"
          >
            <Palette size={15} />
          </button>

          <NotificationCenter />

          {currentUser ? (
            <div className="relative">
              {/* Logged in User Pill */}
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-border bg-surface/60 p-1.5 pr-3 text-xs font-semibold hover:border-accent/40 hover:bg-surface transition-all cursor-pointer"
              >
                {currentUser.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.username}
                    className="h-5 w-5 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-surface-secondary flex items-center justify-center text-[10px] text-text-secondary font-bold border border-border">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span>{currentUser.username}</span>
                <ChevronDown size={12} className={`text-text-secondary transition-transform duration-300 ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Premium dropdown menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface shadow-2xl p-1.5 z-50 text-xs font-semibold space-y-0.5"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border/40 transition-colors w-full text-left"
                      >
                        <Layout size={14} />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-diff-remove hover:bg-diff-remove/10 transition-colors w-full text-left cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onDemoTrigger}
                className="rounded-lg border border-border bg-surface/40 px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface/80 transition-all focus:outline-none active:scale-95 cursor-pointer"
              >
                Demo Dashboard
              </button>
              <button
                onClick={() => openAuthModal({ onSuccess: onLoginSuccess })}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent/90 transition-all focus:outline-none shadow-lg shadow-accent/15 hover:shadow-accent/25 active:scale-95 cursor-pointer"
              >
                GitHub Login
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <NotificationCenter />
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-text-secondary hover:bg-border/40 hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between overflow-hidden">
              <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`w-full h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? "opacity-0 translate-x-3" : ""}`} />
              <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-b border-border bg-background md:hidden px-6 py-5 flex flex-col gap-5 overflow-hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {currentUser && !MAINTENANCE_MODE ? (
                <>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 flex items-center gap-1.5 text-accent border-b border-border/20"
                  >
                    <Sparkles size={12} />
                    <span>Feed</span>
                  </Link>
                  <Link
                    href="/?tab=following"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 flex items-center gap-1.5 text-accent border-b border-border/20"
                  >
                    <Sparkles size={12} />
                    <span>Following</span>
                  </Link>
                  <Link
                    href="/dashboard?tab=score"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 border-b border-border/20"
                  >
                    Score Engine
                  </Link>
                  <Link
                    href="/dashboard?tab=wrapped"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 border-b border-border/20"
                  >
                    Wrapped
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 flex items-center gap-1.5 text-accent"
                  >
                    <Layout size={12} />
                    <span>My Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 border-b border-border/20"
                  >
                    Features
                  </Link>
                  <Link
                    href="/#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 border-b border-border/20"
                  >
                    Score Engine
                  </Link>
                  <Link
                    href="/#wrapped"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-text-primary transition-colors py-2 border-b border-border/20"
                  >
                    Wrapped
                  </Link>
                </>
              )}
            </nav>

            <div className="flex flex-col gap-2.5 pt-2">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentUser.photoURL && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.username}
                        className="h-6 w-6 rounded-full object-cover border border-border"
                      />
                    )}
                    <span className="text-xs font-bold text-text-primary">
                      {currentUser.username}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-diff-remove hover:bg-diff-remove/10 transition-colors cursor-pointer"
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
                    className="w-full rounded-lg border border-border bg-surface py-2 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    View Demo Dashboard
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal({ onSuccess: onLoginSuccess });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-lg bg-accent py-2 text-xs font-bold text-white hover:bg-accent/90 cursor-pointer"
                  >
                    GitHub Login
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
