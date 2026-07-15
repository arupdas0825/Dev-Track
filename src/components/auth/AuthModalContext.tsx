"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DevTrackUser } from "@/lib/firebase";
import AuthModal from "./AuthModal";

interface AuthModalContextType {
  isOpen: boolean;
  openAuthModal: (options?: {
    title?: string;
    message?: string;
    onSuccess?: (user: DevTrackUser) => void;
  }) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [successCallback, setSuccessCallback] = useState<((user: DevTrackUser) => void) | undefined>(undefined);

  const pathname = usePathname();

  // Clean persistent states on mount to prevent refresh reopen issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authModal");
      sessionStorage.removeItem("authModal");
      localStorage.removeItem("devtrack_auth_modal");
      sessionStorage.removeItem("devtrack_auth_modal");
    }
    // Safety reset
    setIsOpen(false);
  }, []);

  // Close modal automatically on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const openAuthModal = (options?: {
    title?: string;
    message?: string;
    onSuccess?: (user: DevTrackUser) => void;
  }) => {
    setTitle(options?.title);
    setMessage(options?.message);
    // Use function functional state to store functions correctly in state
    setSuccessCallback(() => options?.onSuccess);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  const handleSuccess = (user: DevTrackUser) => {
    if (successCallback) {
      successCallback(user);
    }
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        onSuccess={handleSuccess}
        title={title}
        message={message}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
