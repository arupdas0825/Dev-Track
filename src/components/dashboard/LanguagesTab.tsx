"use client";

import { UserDashboardData } from "@/types";
import { formatBytes } from "@/lib/utils";

interface LanguagesTabProps {
  data: UserDashboardData;
}

export default function LanguagesTab({ data }: LanguagesTabProps) {
  const { languages } = data;

  if (languages.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center text-text-secondary text-sm">
        No language metrics discovered in public repositories.
      </div>
    );
  }

  // Categorize languages specifically into Phase 5 buckets
  const phase5Buckets: Record<string, { name: string; bytes: number; color: string }> = {
    TypeScript: { name: "TypeScript", bytes: 0, color: "#3178c6" },
    JavaScript: { name: "JavaScript", bytes: 0, color: "#f1e05a" },
    Python: { name: "Python", bytes: 0, color: "#3572A5" },
    Java: { name: "Java", bytes: 0, color: "#b07219" },
    "C++": { name: "C++", bytes: 0, color: "#f34b7d" },
    Other: { name: "Other", bytes: 0, color: "#8B949E" },
  };

  let totalBytes = 0;
  languages.forEach((lang) => {
    const key = lang.name;
    if (key === "TypeScript" || key === "JavaScript" || key === "Python" || key === "Java" || key === "C++") {
      phase5Buckets[key].bytes += lang.bytes;
    } else {
      phase5Buckets["Other"].bytes += lang.bytes;
    }
    totalBytes += lang.bytes;
  });

  const categorizedLanguages = Object.values(phase5Buckets)
    .map((lang) => {
      const percentage = totalBytes > 0 ? Math.round((lang.bytes / totalBytes) * 100) : 0;
      return {
        ...lang,
        percentage,
      };
    })
    .filter((lang) => lang.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes);

  const renderPieChart = (stats: typeof categorizedLanguages) => {
    const r = 50;
    const cx = 80;
    const cy = 80;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * r;
    
    let currentOffset = 0;
    
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-around">
        <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible flex-shrink-0">
          <g transform="rotate(-90 80 80)">
            {stats.map((slice) => {
              const strokeLength = (slice.percentage / 100) * circumference;
              const offset = currentOffset;
              currentOffset += strokeLength;
              return (
                <circle
                  key={slice.name}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-300 hover:opacity-85"
                >
                  <title>{`${slice.name}: ${slice.percentage}%`}</title>
                </circle>
              );
            })}
          </g>
        </svg>
        
        {/* Legend */}
        <div className="flex flex-col gap-2.5 font-mono text-xs text-left w-full sm:w-auto">
          {stats.map((slice) => (
            <div key={slice.name} className="flex items-center gap-2">
              <span
                style={{ backgroundColor: slice.color }}
                className="h-3 w-3 rounded-sm flex-shrink-0"
              />
              <span className="text-text-primary font-bold">{slice.name}</span>
              <span className="text-text-secondary">({slice.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBarChart = (stats: typeof categorizedLanguages) => {
    const height = 120;
    const width = 280;
    const maxVal = Math.max(...stats.map(d => d.percentage), 1);
    const barWidth = 24;
    const gap = 16;
    
    return (
      <svg width="100%" height={height + 30} viewBox={`0 0 ${width} ${height + 30}`} className="overflow-visible max-w-[280px]">
        {stats.map((item, index) => {
          const barHeight = (item.percentage / maxVal) * height;
          const x = index * (barWidth + gap) + 20;
          const y = height - barHeight + 10;
          
          return (
            <g key={item.name}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="3"
                fill={item.color}
                className="transition-all duration-300 hover:opacity-85"
              />
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fill="var(--text-secondary)"
                fontSize="9"
                textAnchor="middle"
                className="font-mono font-bold"
              >
                {item.percentage}%
              </text>
              <text
                x={x + barWidth / 2}
                y={height + 22}
                fill="var(--text-secondary)"
                fontSize="9"
                textAnchor="middle"
                className="font-mono font-bold"
              >
                {item.name.substring(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Common libraries associated with each language for premium context
  const getEcosystemLibs = (lang: string): string[] => {
    switch (lang) {
      case "TypeScript":
      case "JavaScript":
        return ["React", "Next.js", "Vite", "Node.js", "TailwindCSS"];
      case "Python":
        return ["FastAPI", "NumPy", "Pandas", "PyTorch", "Django"];
      case "Go":
        return ["Gin", "Go Modules", "gRPC", "Hugo", "Cobra"];
      case "Rust":
        return ["Cargo", "Tokio", "Tauri", "Actix", "Serde"];
      case "Java":
        return ["Spring Boot", "Maven", "Gradle", "Hibernate", "JUnit"];
      case "HTML":
      case "CSS":
        return ["Sass", "PostCSS", "Semantic HTML", "CSS Modules"];
      default:
        return ["Ecosystem tools", "Standard Libraries", "CLI Utilities"];
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase 5: Language Distribution Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold font-space-grotesk text-text-primary mb-6 self-start">
            Ecosystem Distribution (Pie Chart)
          </h3>
          {renderPieChart(categorizedLanguages)}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold font-space-grotesk text-text-primary mb-6 self-start">
            Language Percentages (Bar Chart)
          </h3>
          {renderBarChart(categorizedLanguages)}
        </div>
      </div>

      {/* Ecosystem Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categorizedLanguages.map(lang => (
          <div
            key={lang.name}
            className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: lang.color }}
                    className="h-3 w-3 rounded-full"
                  />
                  <h4 className="text-sm font-bold text-text-primary font-space-grotesk">
                    {lang.name}
                  </h4>
                </div>
                <span className="text-[10px] font-bold font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
                  {lang.percentage}%
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">INDEXED SIZE:</span>
                  <span className="text-text-primary">{formatBytes(lang.bytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">ECOSYSTEM MATURITY:</span>
                  <span className="text-success font-bold">Stable</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border/40 pt-4">
              <span className="text-[10px] font-mono text-text-secondary uppercase block mb-2">
                Ecosystem Frameworks & Tools
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getEcosystemLibs(lang.name).map(lib => (
                  <span
                    key={lib}
                    className="text-[9px] font-bold text-text-secondary bg-surface-secondary border border-border px-2 py-0.5 rounded"
                  >
                    {lib}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
