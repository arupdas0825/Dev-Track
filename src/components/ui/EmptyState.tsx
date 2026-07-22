"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn">
      <div className="h-16 w-16 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center text-accent mb-4 shadow-inner">
        {icon ? (
          icon
        ) : (
          <img
            src="/devtrack-logo.png"
            alt="DevTrack Brand Logo"
            className="h-10 w-10 object-contain animate-logo-breathe"
          />
        )}
      </div>

      <h3 className="text-base font-bold font-space-grotesk text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-xs text-text-secondary max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {primaryActionLabel && onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent/90 transition-all shadow-md shadow-accent/10 focus:outline-none"
          >
            {primaryActionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all focus:outline-none"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
