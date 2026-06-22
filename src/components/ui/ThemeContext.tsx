"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeProfile =
  | "github-dark"
  | "github-dark-dimmed"
  | "github-dark-hc"
  | "dt-midnight"
  | "dt-neon-blue"
  | "dt-graphite"
  | "dt-emerald"
  | "dt-purple-matrix";

export type AccentColor = "blue" | "green" | "purple" | "orange" | "red" | "cyan";

export type LayoutDensity = "default" | "compact" | "wide";

export interface InterfaceSettings {
  animations: boolean;
  reducedMotion: boolean;
  cardHover: boolean;
  blur: boolean;
  glow: boolean;
  compactSidebar: boolean;
  compactCards: boolean;
}

export interface ChartSettings {
  animated: boolean;
  heatmapStyle: "github" | "devtrack" | "minimal";
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themeProfile: ThemeProfile;
  setThemeProfile: (profile: ThemeProfile) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
  layoutDensity: LayoutDensity;
  setLayoutDensity: (density: LayoutDensity) => void;
  interfaceSettings: InterfaceSettings;
  toggleInterfaceSetting: (setting: keyof InterfaceSettings) => void;
  chartSettings: ChartSettings;
  toggleChartAnimation: () => void;
  setHeatmapStyle: (style: "github" | "devtrack" | "minimal") => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [themeProfile, setThemeProfileState] = useState<ThemeProfile>("github-dark");
  const [accentColor, setAccentColorState] = useState<AccentColor>("blue");
  const [layoutDensity, setLayoutDensityState] = useState<LayoutDensity>("default");
  
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>({
    animations: true,
    reducedMotion: false,
    cardHover: true,
    blur: true,
    glow: true,
    compactSidebar: false,
    compactCards: false,
  });

  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    animated: true,
    heatmapStyle: "github",
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("dt_pref_theme_mode") as ThemeMode;
      const profile = localStorage.getItem("dt_pref_theme_profile") as ThemeProfile;
      const accent = localStorage.getItem("dt_pref_accent_color") as AccentColor;
      const density = localStorage.getItem("dt_pref_layout_density") as LayoutDensity;

      if (mode) setThemeModeState(mode);
      if (profile) setThemeProfileState(profile);
      if (accent) setAccentColorState(accent);
      if (density) setLayoutDensityState(density);

      try {
        const storedInterface = localStorage.getItem("dt_pref_interface_settings");
        if (storedInterface) {
          setInterfaceSettings(JSON.parse(storedInterface));
        }
        const storedCharts = localStorage.getItem("dt_pref_chart_settings");
        if (storedCharts) {
          setChartSettings(JSON.parse(storedCharts));
        }
      } catch (e) {
        console.error("Failed to parse settings from localStorage:", e);
      }
    }
  }, []);

  // Update localStorage and document attributes whenever values change
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("dt_pref_theme_mode", mode);
  };

  const setThemeProfile = (profile: ThemeProfile) => {
    setThemeProfileState(profile);
    localStorage.setItem("dt_pref_theme_profile", profile);
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem("dt_pref_accent_color", accent);
  };

  const setLayoutDensity = (density: LayoutDensity) => {
    setLayoutDensityState(density);
    localStorage.setItem("dt_pref_layout_density", density);
  };

  const toggleInterfaceSetting = (setting: keyof InterfaceSettings) => {
    setInterfaceSettings((prev) => {
      const updated = { ...prev, [setting]: !prev[setting] };
      // Special check: if reducedMotion is enabled, disable animations
      if (setting === "reducedMotion" && updated.reducedMotion) {
        updated.animations = false;
      }
      localStorage.setItem("dt_pref_interface_settings", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleChartAnimation = () => {
    setChartSettings((prev) => {
      const updated = { ...prev, animated: !prev.animated };
      localStorage.setItem("dt_pref_chart_settings", JSON.stringify(updated));
      return updated;
    });
  };

  const setHeatmapStyle = (style: "github" | "devtrack" | "minimal") => {
    setChartSettings((prev) => {
      const updated = { ...prev, heatmapStyle: style };
      localStorage.setItem("dt_pref_chart_settings", JSON.stringify(updated));
      return updated;
    });
  };

  // Sync classes to <html>
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    // 1. Remove all old theme profiles and light classes
    const classesToRemove = [
      "theme-github-light",
      "theme-github-dark",
      "theme-github-dark-dimmed",
      "theme-github-dark-hc",
      "dt-midnight",
      "dt-neon-blue",
      "dt-graphite",
      "dt-emerald",
      "dt-purple-matrix"
    ];
    root.classList.remove(...classesToRemove);

    // 2. Determine active theme class based on mode
    let activeClass = "";
    if (themeMode === "light") {
      activeClass = "theme-github-light";
    } else if (themeMode === "dark") {
      activeClass = themeProfile;
    } else {
      // System mode
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      activeClass = isSystemDark ? themeProfile : "theme-github-light";
    }
    root.classList.add(activeClass);

    // 3. Remove and apply accent classes
    const accents = ["accent-blue", "accent-green", "accent-purple", "accent-orange", "accent-red", "accent-cyan"];
    root.classList.remove(...accents);
    root.classList.add(`accent-${accentColor}`);

    // 4. Interface Toggles
    root.classList.toggle("no-animations", !interfaceSettings.animations);
    root.classList.toggle("reduced-motion", interfaceSettings.reducedMotion);
    root.classList.toggle("disable-card-hover", !interfaceSettings.cardHover);
    root.classList.toggle("no-blur", !interfaceSettings.blur);
    root.classList.toggle("no-glow", !interfaceSettings.glow);
    root.classList.toggle("compact-sidebar", interfaceSettings.compactSidebar);
    root.classList.toggle("compact-cards", interfaceSettings.compactCards);

    // 5. Layout density
    root.classList.remove("layout-default", "layout-compact", "layout-wide");
    root.classList.add(`layout-${layoutDensity}`);
  }, [themeMode, themeProfile, accentColor, layoutDensity, interfaceSettings]);

  // System listener for theme changes
  useEffect(() => {
    if (typeof window === "undefined" || themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = document.documentElement;
      const isSystemDark = media.matches;
      const activeClass = isSystemDark ? themeProfile : "theme-github-light";

      const themeClasses = [
        "theme-github-light",
        "theme-github-dark",
        "theme-github-dark-dimmed",
        "theme-github-dark-hc",
        "dt-midnight",
        "dt-neon-blue",
        "dt-graphite",
        "dt-emerald",
        "dt-purple-matrix"
      ];
      root.classList.remove(...themeClasses);
      root.classList.add(activeClass);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themeMode, themeProfile]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        themeProfile,
        setThemeProfile,
        accentColor,
        setAccentColor,
        layoutDensity,
        setLayoutDensity,
        interfaceSettings,
        toggleInterfaceSetting,
        chartSettings,
        toggleChartAnimation,
        setHeatmapStyle,
        isThemeModalOpen,
        setIsThemeModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
