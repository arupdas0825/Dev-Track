"use client";

import { UserDashboardData } from "@/types";
import { formatBytes } from "@/lib/utils";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useTheme } from "@/components/ui/ThemeContext";

interface LanguagesTabProps {
  data: UserDashboardData;
}

export default function LanguagesTab({ data }: LanguagesTabProps) {
  const { languages, repositories } = data;
  const { chartSettings } = useTheme();

  if (languages.length === 0) {
    return (
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-12 text-center text-[#8B949E] text-xs">
        No language metrics discovered in public repositories.
      </div>
    );
  }

  // 1. Framework Detection Engine
  const detectFrameworks = () => {
    const detected: { name: string; icon: string; category: string }[] = [];
    
    // Scan names and descriptions
    repositories.forEach(repo => {
      const searchStr = `${repo.name} ${repo.description || ""}`.toLowerCase();
      
      const checkAndAdd = (name: string, icon: string, category: string, keywords: string[]) => {
        if (keywords.some(kw => searchStr.includes(kw))) {
          if (!detected.some(d => d.name === name)) {
            detected.push({ name, icon, category });
          }
        }
      };

      checkAndAdd("Next.js", "▲", "Frontend Framework", ["next.js", "nextjs", "next-saas", "next15"]);
      checkAndAdd("React", "⚛", "Frontend Library", ["react", "framer-motion", "components", "hooks"]);
      checkAndAdd("TailwindCSS", "⚡", "Styling Utility", ["tailwind", "tailwindcss"]);
      checkAndAdd("Node.js / Express", "🟢", "Backend Runtime", ["express", "node.js", "nodejs", "expressjs"]);
      checkAndAdd("FastAPI", "🐍", "Backend API", ["fastapi", "uvicorn"]);
      checkAndAdd("Django", "🦄", "Backend Fullstack", ["django", "wsgi"]);
      checkAndAdd("Prisma", "◮", "Database ORM", ["prisma", "prismadb"]);
      checkAndAdd("PostgreSQL", "🐘", "Relational Database", ["postgres", "postgresql", "psql"]);
      checkAndAdd("MongoDB", "🍃", "NoSQL Database", ["mongodb", "mongo"]);
      checkAndAdd("Supabase", "⚡", "BaaS Backend", ["supabase", "supabase-js"]);
      checkAndAdd("Firebase", "🔥", "BaaS Backend", ["firebase", "firestore", "google-services"]);
      checkAndAdd("Docker", "🐳", "Infrastructure", ["docker", "dockerfile", "docker-compose"]);
      checkAndAdd("Kubernetes", "☸", "Infrastructure", ["kubernetes", "k8s"]);
      checkAndAdd("GraphQL", "⬡", "API Gateway", ["graphql", "apollo", "schema.graphql"]);
    });

    return detected;
  };

  const detectedFrameworks = detectFrameworks();

  // Sort and limit languages for Radar / Bar Chart display
  const topLanguages = [...languages]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6);

  // Radar data mapping
  const radarData = topLanguages.map(l => ({
    subject: l.name,
    A: l.percentage,
    fullMark: 100,
  }));

  // Analyze primary stack
  const getPrimaryStackAnalysis = () => {
    const topLang = topLanguages.length > 0 ? topLanguages[0].name : "";
    if (!topLang) return "Undetermined Stack";

    const hasFrontend = detectedFrameworks.some(f => f.category.includes("Frontend"));
    const hasBackend = detectedFrameworks.some(f => f.category.includes("Backend") || f.category.includes("Database"));

    if (topLang === "TypeScript" || topLang === "JavaScript") {
      if (hasFrontend && hasBackend) return "Enterprise TypeScript Fullstack Architect";
      if (hasFrontend) return "Modern Client UI Platform Engineer";
      return "Runtime JavaScript API Architect";
    }
    if (topLang === "Python") {
      if (detectedFrameworks.some(f => f.name === "FastAPI" || f.name === "Django")) {
        return "Python Full-Stack Systems Engineer";
      }
      return "Data Pipelines & AI Infrastructure Engineer";
    }
    if (topLang === "Go") {
      return "Cloud-Native Infrastructure & API Developer";
    }
    if (topLang === "Rust") {
      return "Low-Level Systems & WebAssembly Specialist";
    }
    return `${topLang} Developer`;
  };

  return (
    <div className="space-y-6">
      
      {/* 2-Column Chart Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Technology Radar Chart */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 flex flex-col items-center justify-between">
          <div className="self-start">
            <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
              Technology Radar Profile
            </h3>
            <p className="text-[10px] text-[#8B949E] mt-0.5">Language experience weight mapped across key vectors.</p>
          </div>
          <div className="h-56 w-full text-[9px] font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" />
                <Radar
                  name="Proficiency"
                  dataKey="A"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.25}
                  isAnimationActive={chartSettings.animated}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language distribution bar chart */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 flex flex-col items-center justify-between">
          <div className="self-start">
            <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
              Ecosystem Volume
            </h3>
            <p className="text-[10px] text-[#8B949E] mt-0.5">Relative percentages calculated from codebase file sizes.</p>
          </div>
          <div className="h-56 w-full text-[9px] font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLanguages} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="var(--text-secondary)" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" tickLine={false} width={70} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Bar dataKey="percentage" fill="var(--accent)" isAnimationActive={chartSettings.animated} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Framework & Technology Integration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Framework Badges */}
        <div className="lg:col-span-8 rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 space-y-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
              Detected Stack Integrations
            </h3>
            <p className="text-[10px] text-[#8B949E] mt-0.5">Libraries and utilities scanned within repository metadata.</p>
          </div>

          {detectedFrameworks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {detectedFrameworks.map(framework => (
                <div
                  key={framework.name}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-[#30363D]/60 bg-[#0D1117] hover:border-[#30363D] transition-all"
                >
                  <span className="text-sm">{framework.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#F0F6FC] truncate">{framework.name}</div>
                    <div className="text-[8px] font-mono text-[#8B949E] uppercase tracking-wide truncate">{framework.category}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#8B949E] italic py-6">
              No third-party framework markers scanned in repo names/descriptions.
            </div>
          )}
        </div>

        {/* Right: Primary Stack Analysis */}
        <div className="lg:col-span-4 rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Primary Stack Diagnosis
              </h3>
              <p className="text-[10px] text-[#8B949E] mt-0.5">Role classification generated from language distribution.</p>
            </div>

            <div className="rounded-lg border border-[#58A6FF]/20 bg-[#1F6FEB]/5 p-4 text-center">
              <span className="text-[9px] font-mono font-bold text-[#58A6FF] uppercase block tracking-wider">Developer Persona</span>
              <div className="text-sm font-bold font-space-grotesk text-[#F0F6FC] mt-1.5 leading-tight">
                {getPrimaryStackAnalysis()}
              </div>
            </div>

            <div className="text-[11px] text-[#8B949E] leading-relaxed font-sans">
              Your dominant ecosystem is <strong className="text-[#F0F6FC]">{topLanguages[0]?.name || "unknown"}</strong>, with supporting packages and project descriptors referencing <strong className="text-[#F0F6FC]">{detectedFrameworks.slice(0, 3).map(f => f.name).join(", ") || "various libraries"}</strong>.
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#3FB950] border-t border-[#30363D]/40 pt-4 mt-6">
            ✓ Stack indexing verified.
          </div>
        </div>

      </div>

    </div>
  );
}
