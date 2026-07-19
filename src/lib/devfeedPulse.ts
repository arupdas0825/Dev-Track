/**
 * devfeedPulse.ts
 * Curated DevTrack Pulse items — editable without touching the component.
 */

export interface PulseItem {
  label: string;
  tag: string;
  count?: number;
}

export const DEVTRACK_PULSE: PulseItem[] = [
  { label: "AI & Machine Learning", tag: "ai", count: 2841 },
  { label: "Open Source Releases", tag: "opensource", count: 1523 },
  { label: "TypeScript Best Practices", tag: "typescript", count: 987 },
  { label: "System Design Patterns", tag: "systemdesign", count: 763 },
  { label: "Web Performance Tips", tag: "webperf", count: 654 },
  { label: "DevOps & Infrastructure", tag: "devops", count: 541 },
  { label: "Career Moves & Growth", tag: "career", count: 488 },
];
