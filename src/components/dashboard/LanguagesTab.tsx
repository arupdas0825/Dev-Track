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
      {/* Horizontal Language Distribution Bar */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-base font-bold font-space-grotesk text-text-primary mb-4">
          Ecosystem Distribution
        </h3>

        {/* GitHub style percentage bar */}
        <div className="h-4 w-full flex rounded-full overflow-hidden bg-surface-secondary border border-border/40">
          {languages.map((lang, index) => (
            <div
              key={lang.name}
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:opacity-90"
              title={`${lang.name}: ${lang.percentage}%`}
            />
          ))}
        </div>

        {/* Labels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          {languages.map(lang => (
            <div key={lang.name} className="flex items-start gap-2.5">
              <span
                style={{ backgroundColor: lang.color }}
                className="h-3 w-3 rounded-full mt-1 flex-shrink-0"
              />
              <div>
                <h4 className="text-xs font-bold text-text-primary">{lang.name}</h4>
                <p className="text-[10px] text-text-secondary mt-0.5 font-mono">
                  {lang.percentage}% ({formatBytes(lang.bytes)})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ecosystem Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map(lang => (
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
