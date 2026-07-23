// src/components/ui/ThemeContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeProfile =
  | "github-dark"
  | "github-dark-dimmed"
  | "github-dark-hc"
  | "devtrack-midnight"
  | "devtrack-neon-blue"
  | "devtrack-graphite"
  | "devtrack-emerald"
  | "devtrack-purple-matrix";
export type AccentColor = "blue" | "green" | "purple" | "orange" | "red" | "cyan";
export type LayoutDensity = "default" | "compact" | "wide";
export type InterfaceSettings = {
  animations: boolean;
  reducedMotion: boolean;
  cardHover: boolean;
  blurEffects: boolean;
  glowEffects: boolean;
  compactSidebar: boolean;
  compactCards: boolean;
};
export type ChartSettings = {
  animatedCharts: boolean;
  heatmapStyle: "github" | "devtrack" | "minimal";
};

export interface ThemeContextProps {
  mode: ThemeMode;
  profile: ThemeProfile;
  accent: AccentColor;
  layout: LayoutDensity;
  interface: InterfaceSettings;
  chart: ChartSettings;
  modalOpen: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setProfile: (profile: ThemeProfile) => void;
  setAccent: (accent: AccentColor) => void;
  setLayout: (layout: LayoutDensity) => void;
  setInterface: (settings: Partial<InterfaceSettings>) => void;
  setChart: (settings: Partial<ChartSettings>) => void;
  openModal: () => void;
  closeModal: () => void;
}

const defaultInterface: InterfaceSettings = {
  animations: true,
  reducedMotion: false,
  cardHover: true,
  blurEffects: true,
  glowEffects: true,
  compactSidebar: false,
  compactCards: false,
};

const defaultChart: ChartSettings = {
  animatedCharts: true,
  heatmapStyle: "github",
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const themeProfiles: Record<ThemeProfile, Record<string, string>> = {
  "github-dark": {
    "--background": "#0d1117",
    "--surface": "#161b22",
    "--surface-secondary": "#21262d",
    "--border": "#30363d",
    "--accent": "#58a6ff",
  },
  "github-dark-dimmed": {
    "--background": "#0d1117",
    "--surface": "#161b22",
    "--surface-secondary": "#21262d",
    "--border": "#30363d",
    "--accent": "#6e7681",
  },
  "github-dark-hc": {
    "--background": "#0d1117",
    "--surface": "#161b22",
    "--surface-secondary": "#21262d",
    "--border": "#f1e3bc",
    "--accent": "#ffb300",
  },
  "devtrack-midnight": {
    "--background": "#0a0c10",
    "--surface": "#14171c",
    "--surface-secondary": "#1a1d23",
    "--border": "#2d323c",
    "--accent": "#1e40af",
  },
  "devtrack-neon-blue": {
    "--background": "#020617",
    "--surface": "#091135",
    "--surface-secondary": "#0d1c4a",
    "--border": "#17386b",
    "--accent": "#3b82f6",
  },
  "devtrack-graphite": {
    "--background": "#111418",
    "--surface": "#1c2127",
    "--surface-secondary": "#262c33",
    "--border": "#404752",
    "--accent": "#6366f1",
  },
  "devtrack-emerald": {
    "--background": "#041c15",
    "--surface": "#07352c",
    "--surface-secondary": "#084d3a",
    "--border": "#2e7d5b",
    "--accent": "#10b981",
  },
  "devtrack-purple-matrix": {
    "--background": "#181125",
    "--surface": "#241a34",
    "--surface-secondary": "#30243e",
    "--border": "#5b4475",
    "--accent": "#a78bfa",
  },
};

const accentColors: Record<AccentColor, string> = {
  blue: "#58a6ff",
  green: "#3fb950",
  purple: "#a371f7",
  orange: "#d29922",
  red: "#f85149",
  cyan: "#1f6feb",
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [profile, setProfile] = useState<ThemeProfile>("github-dark");
  const [accent, setAccent] = useState<AccentColor>("blue");
  const [layout, setLayout] = useState<LayoutDensity>("default");
  const [interfaceSettings, setInterfaceSettings] =
    useState<InterfaceSettings>(defaultInterface);
  const [chartSettings, setChartSettings] = useState<ChartSettings>(defaultChart);
  const [modalOpen, setModalOpen] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedMode = localStorage.getItem("devtrack_theme_mode") as ThemeMode;
    const storedProfile = localStorage.getItem("devtrack_theme_profile") as ThemeProfile;
    const storedAccent = localStorage.getItem("devtrack_accent_color") as AccentColor;
    const storedLayout = localStorage.getItem("devtrack_layout_density") as LayoutDensity;
    const storedInterface = localStorage.getItem("devtrack_interface_settings");
    const storedChart = localStorage.getItem("devtrack_chart_settings");
    if (storedMode) setMode(storedMode);
    if (storedProfile) setProfile(storedProfile);
    if (storedAccent) setAccent(storedAccent);
    if (storedLayout) setLayout(storedLayout);
    if (storedInterface) setInterfaceSettings(JSON.parse(storedInterface));
    if (storedChart) setChartSettings(JSON.parse(storedChart));
  }, []);

  // Apply theme variables whenever relevant state changes
  useEffect(() => {
    if (typeof document === "undefined") return;
    const effectiveMode =
      mode === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : mode;

    if (effectiveMode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.setProperty("--background", "#ffffff");
      document.documentElement.style.setProperty("--surface", "#f8fafc");
      document.documentElement.style.setProperty("--surface-secondary", "#f1f5f9");
      document.documentElement.style.setProperty("--border", "rgba(0, 0, 0, 0.08)");
      document.documentElement.style.setProperty("--foreground", "#0f172a");
      document.documentElement.style.setProperty("--text-primary", "#0f172a");
      document.documentElement.style.setProperty("--text-secondary", "#475569");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      const vars = themeProfiles[profile];
      Object.entries(vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
      document.documentElement.style.setProperty("--foreground", "#F0F6FC");
      document.documentElement.style.setProperty("--text-primary", "#F0F6FC");
      document.documentElement.style.setProperty("--text-secondary", "#8B949E");
    }
    // Apply accent override
    document.documentElement.style.setProperty("--accent", accentColors[accent]);

    // Persist
    localStorage.setItem("devtrack_theme_mode", mode);
    localStorage.setItem("devtrack_theme_profile", profile);
    localStorage.setItem("devtrack_accent_color", accent);
    localStorage.setItem("devtrack_layout_density", layout);
    localStorage.setItem(
      "devtrack_interface_settings",
      JSON.stringify(interfaceSettings)
    );
    localStorage.setItem("devtrack_chart_settings", JSON.stringify(chartSettings));
  }, [mode, profile, accent, layout, interfaceSettings, chartSettings]);

  const toggleThemeMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setInterface = (partial: Partial<InterfaceSettings>) => {
    setInterfaceSettings((prev) => ({ ...prev, ...partial }));
  };
  const setChart = (partial: Partial<ChartSettings>) => {
    setChartSettings((prev) => ({ ...prev, ...partial }));
  };

  const value: ThemeContextProps = {
    mode,
    profile,
    accent,
    layout,
    interface: interfaceSettings,
    chart: chartSettings,
    modalOpen,
    setMode,
    toggleThemeMode,
    setProfile,
    setAccent,
    setLayout,
    setInterface,
    setChart,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
