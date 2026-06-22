"use client";

import { useTheme, ThemeMode, ThemeProfile, AccentColor, LayoutDensity, InterfaceSettings } from "./ThemeContext";

export default function ThemeSettingsModal() {
  const {
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
  } = useTheme();

  if (!isThemeModalOpen) return null;

  const themesList: { id: ThemeProfile; name: string; bg: string; card: string; border: string; accent: string }[] = [
    { id: "github-dark", name: "GitHub Dark", bg: "#0D1117", card: "#161B22", border: "#30363D", accent: "#58A6FF" },
    { id: "github-dark-dimmed", name: "GitHub Dark Dimmed", bg: "#22272E", card: "#2D333B", border: "#444C56", accent: "#539BF5" },
    { id: "github-dark-hc", name: "GitHub High Contrast", bg: "#010409", card: "#0D1117", border: "#484F58", accent: "#409EFF" },
    { id: "dt-midnight", name: "DevTrack Midnight", bg: "#0B0E14", card: "#111520", border: "#1E2538", accent: "#3B82F6" },
    { id: "dt-neon-blue", name: "DevTrack Neon Blue", bg: "#020817", card: "#0B1329", border: "#1D2D50", accent: "#00D2FF" },
    { id: "dt-graphite", name: "DevTrack Graphite", bg: "#18181B", card: "#202023", border: "#3F3F46", accent: "#F4F4F5" },
    { id: "dt-emerald", name: "DevTrack Emerald", bg: "#061F17", card: "#0B3F30", border: "#124E3F", accent: "#34D399" },
    { id: "dt-purple-matrix", name: "Purple Matrix", bg: "#0F051D", card: "#1A0B36", border: "#31146C", accent: "#A855F7" },
  ];

  const accentsList: { id: AccentColor; name: string; color: string }[] = [
    { id: "blue", name: "Blue", color: "#58A6FF" },
    { id: "green", name: "Green", color: "#3FB950" },
    { id: "purple", name: "Purple", color: "#A855F7" },
    { id: "orange", name: "Orange", color: "#F97316" },
    { id: "red", name: "Red", color: "#F85149" },
    { id: "cyan", name: "Cyan", color: "#00FFE7" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsThemeModalOpen(false)}
        className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md"
      />

      {/* Modal Card / Bottom Sheet */}
      <div className="relative w-full max-w-4xl h-[85vh] sm:h-[80vh] bg-[#0d1117] sm:rounded-xl border border-[#30363D] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363D] bg-[#161B22]/50">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5 text-[#58A6FF]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l.75-2.543a2.375 2.375 0 011.666-1.667l2.543-.75m-3.238 3.24l.75-2.543m0 0l3.041-3.04a.75.75 0 111.061 1.06L13.02 15.03a.75.75 0 01-1.06 0l-1.06-1.06z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-sm font-bold text-[#F0F6FC] font-space-grotesk tracking-wide uppercase">
              Theme & Layout Settings
            </h2>
          </div>
          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="p-1 rounded hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Core Layout Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left panel - Config Settings (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
            
            {/* SECTION 1: THEME MODE */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Theme Mode
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setThemeMode(mode)}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                      themeMode === mode
                        ? "border-[#58A6FF] bg-[#1F6FEB]/10 text-[#58A6FF]"
                        : "border-[#30363D] bg-[#161B22]/40 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 2: DEVTRACK THEMES */}
            {themeMode !== "light" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                  DevTrack Dark Themes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {themesList.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setThemeProfile(theme.id)}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        themeProfile === theme.id
                          ? "border-[#58A6FF] bg-[#161B22]"
                          : "border-[#30363D]/60 bg-[#161B22]/30 hover:border-[#30363D] hover:bg-[#161B22]/50"
                      }`}
                    >
                      {/* Theme preview samples block */}
                      <div
                        className="w-full h-12 rounded border border-[#30363D]/40 flex items-center justify-around mb-2.5 p-1"
                        style={{ backgroundColor: theme.bg }}
                      >
                        <div className="h-6 w-6 rounded shadow" style={{ backgroundColor: theme.card }} />
                        <div className="h-6 w-3 rounded border" style={{ borderColor: theme.border }} />
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.accent }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#F0F6FC]">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: ACCENT COLORS */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Accent Colors
              </h3>
              <div className="flex flex-wrap gap-3">
                {accentsList.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setAccentColor(acc.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      accentColor === acc.id
                        ? "border-[#58A6FF] bg-[#1F6FEB]/10 text-[#58A6FF]"
                        : "border-[#30363D]/60 bg-[#161B22]/20 text-[#8B949E] hover:text-[#F0F6FC]"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/20 flex-shrink-0"
                      style={{ backgroundColor: acc.color }}
                    />
                    <span>{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 4: INTERFACE SETTINGS */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Interface Customizations
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interfaceSettings.animations}
                    disabled={interfaceSettings.reducedMotion}
                    onChange={() => toggleInterfaceSetting("animations")}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0 disabled:opacity-40"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Enable Micro-animations</span>
                    <span className="block text-[10px] text-[#8B949E]">Transitions and animations.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interfaceSettings.reducedMotion}
                    onChange={() => toggleInterfaceSetting("reducedMotion")}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Reduced Motion</span>
                    <span className="block text-[10px] text-[#8B949E]">Disable heavy rendering.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interfaceSettings.cardHover}
                    onChange={() => toggleInterfaceSetting("cardHover")}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Card Hover Effects</span>
                    <span className="block text-[10px] text-[#8B949E]">Activate scaling & shadow overlays.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interfaceSettings.blur}
                    onChange={() => toggleInterfaceSetting("blur")}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Glassmorphic Blur</span>
                    <span className="block text-[10px] text-[#8B949E]">Apply backdrop filter blurs.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interfaceSettings.glow}
                    onChange={() => toggleInterfaceSetting("glow")}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Glow Effects</span>
                    <span className="block text-[10px] text-[#8B949E]">Show background ambient glows.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interfaceSettings.compactSidebar}
                    onChange={() => toggleInterfaceSetting("compactSidebar")}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Compact Sidebar</span>
                    <span className="block text-[10px] text-[#8B949E]">Narrow sidebar menu width.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interfaceSettings.compactCards}
                    onChange={() => toggleInterfaceSetting("compactCards")}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Compact Spacing</span>
                    <span className="block text-[10px] text-[#8B949E]">Condense padding inside cards.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* SECTION 5: LAYOUT DENSITY */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Layout Width Constraints
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(["default", "compact", "wide"] as LayoutDensity[]).map((dens) => (
                  <button
                    key={dens}
                    onClick={() => setLayoutDensity(dens)}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                      layoutDensity === dens
                        ? "border-[#58A6FF] bg-[#1F6FEB]/10 text-[#58A6FF]"
                        : "border-[#30363D] bg-[#161B22]/40 text-[#8B949E] hover:text-[#F0F6FC]"
                    }`}
                  >
                    {dens} Layout
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 6: CHART SETTINGS */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Chart Analytics settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-2.5 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chartSettings.animated}
                    onChange={toggleChartAnimation}
                    className="mt-0.5 rounded border-[#30363D] bg-[#0D1117] text-[#1F6FEB] focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="block font-bold text-[#F0F6FC]">Animated Charts</span>
                    <span className="block text-[10px] text-[#8B949E]">Enable Recharts drawing paths.</span>
                  </div>
                </label>

                <div className="flex flex-col gap-1 p-2 rounded border border-[#30363D]/40 bg-[#161B22]/10">
                  <span className="font-bold text-[#F0F6FC]">Contribution Heatmap Style</span>
                  <select
                    value={chartSettings.heatmapStyle}
                    onChange={(e) => setHeatmapStyle(e.target.value as any)}
                    className="w-full mt-1.5 px-2 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[10px] text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
                  >
                    <option value="github">Standard GitHub Green</option>
                    <option value="devtrack">DevTrack Accent Hue</option>
                    <option value="minimal">Minimal Monochrome Scale</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right panel - Live Preview (Desktop Only) */}
          <div className="hidden md:flex w-[350px] border-l border-[#30363D] bg-[#0d1117] p-5 flex-col justify-between select-none">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-wider block">
                Live Interface Preview
              </span>

              {/* Mock Window Shell */}
              <div className="rounded-xl border border-border bg-[#0D1117] overflow-hidden shadow-2xl flex flex-col h-72">
                
                {/* Mock Navbar */}
                <div className="h-8 border-b border-border bg-surface/80 flex items-center justify-between px-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 rounded-full bg-accent flex items-center justify-center text-[7px] text-white font-bold">DT</div>
                    <span className="text-[8px] font-bold text-text-primary">DevTrack</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-accent" />
                    <span className="h-4.5 w-4.5 rounded-full bg-surface-secondary" />
                  </div>
                </div>

                {/* Mock Container */}
                <div className="flex-1 flex overflow-hidden">
                  
                  {/* Mock Sidebar */}
                  <div className={`border-r border-border bg-surface/30 p-2 flex flex-col gap-1.5 ${interfaceSettings.compactSidebar ? "w-10" : "w-20"} transition-all`}>
                    <span className="h-2 w-full rounded bg-surface-secondary" />
                    <span className="h-2 w-8/12 rounded bg-surface-secondary" />
                    <span className="h-2 w-10/12 rounded bg-accent" />
                  </div>

                  {/* Mock Content */}
                  <div className="flex-1 p-3 flex flex-col gap-2.5 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="h-3.5 w-16 rounded bg-text-primary" />
                      <span className="h-3 w-8 rounded-full bg-success/20 border border-success/30 text-[6px] text-success text-center">Score: 92</span>
                    </div>

                    {/* Mock Card */}
                    <div className={`rounded border border-border bg-surface/40 flex flex-col gap-1.5 transition-all ${interfaceSettings.compactCards ? "p-1.5" : "p-3"} ${interfaceSettings.cardHover ? "hover:scale-102 hover:border-accent hover:shadow-lg" : ""}`}>
                      <span className="h-2.5 w-full rounded bg-text-secondary/50" />
                      <span className="h-2 w-8/12 rounded bg-text-secondary/30" />
                      <div className="h-6 w-full rounded bg-[#0D1117]/60 border border-border/40 p-1 flex items-end gap-0.5">
                        <span className="h-2 w-full rounded bg-accent" />
                        <span className="h-3.5 w-full rounded bg-accent" />
                        <span className="h-1 w-full rounded bg-accent" />
                        <span className="h-5 w-full rounded bg-accent" />
                      </div>
                    </div>
                  </div>

                </div>

              </div>
              
              <div className="text-[10px] text-[#8B949E] leading-relaxed">
                <span className="font-bold text-[#58A6FF]">ProTip:</span> Interactive element colors, card margins, card padding, border spacing, and glows will update in real-time behind this sheet.
              </div>
            </div>

            <button
              onClick={() => setIsThemeModalOpen(false)}
              className="w-full py-2.5 rounded-lg bg-accent text-[#F0F6FC] text-xs font-bold transition-all focus:outline-none cursor-pointer shadow-md shadow-accent/15"
            >
              Apply Preferences
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
