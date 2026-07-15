"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { signInWithGitHub, DevTrackUser } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../ui/Logo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: DevTrackUser) => void;
  title?: string;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, title, message }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loginButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Set mounted state for client-side rendering (portal requires document to be available)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Background Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus Capture and Restoration
  useEffect(() => {
    if (isOpen) {
      if (typeof document !== "undefined") {
        previousFocusRef.current = document.activeElement as HTMLElement;
      }
      
      const timer = setTimeout(() => {
        loginButtonRef.current?.focus();
      }, 50);

      return () => clearTimeout(timer);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGitHub();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to authenticate with GitHub. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Do not render anything during SSR
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto" 
          style={{ zIndex: 9999 }}
        >
          {/* Full-screen backdrop: rgba(0,0,0,0.65) + 12px blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22 } }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000]/65 backdrop-blur-[12px]"
            style={{ zIndex: 9998 }}
          />

          {/* Premium Glassmorphism Card: 520px max-width, 24px blur, custom shadows */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: 20, 
              transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="relative w-full max-w-[92vw] sm:w-[520px] overflow-hidden rounded-[32px] border p-6 md:p-8"
            style={{
              zIndex: 9999,
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.45), 0 0 80px rgba(59, 130, 246, 0.25)"
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-text-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
              aria-label="Close dialog"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center py-4">
              {/* DevTrack Logo */}
              <Logo size={56} showText={false} className="mb-6" />

              <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-text-primary tracking-tight">
                {title || "Sign in to Dev-Track"}
              </h2>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-sm">
                {message || "Connect your account to analyze your coding consistency, calculate your developer metrics, and unlock personalized career recommendations."}
              </p>

              {error && (
                <div className="mt-4 w-full rounded border border-danger/20 bg-danger/10 px-3 py-2 text-left text-xs text-danger">
                  {error}
                </div>
              )}

              <button
                ref={loginButtonRef}
                onClick={handleLogin}
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-[#F0F6FC] px-4 py-3 text-sm font-semibold text-[#0D1117] hover:bg-[#E0E6EC] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#0D1117]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                    </svg>
                    <span>Continue with GitHub</span>
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-text-secondary font-mono">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure OAuth verification. We never write to your repos.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
