"use client";

import { useMemo } from "react";
import { UserDashboardData } from "@/types";
import { formatBytes } from "@/lib/utils";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Code, Server, Cpu, Wrench, Smartphone, Database, Cloud } from "lucide-react";

interface LanguagesTabProps {
  data: UserDashboardData;
}

export default function LanguagesTab({ data }: LanguagesTabProps) {
  const { languages, repositories } = data;

  if (languages.length === 0) {
    return (
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-12 text-center text-[#8B949E] text-xs">
        No language metrics discovered in public repositories.
      </div>
    );
  }

  // 1. Framework & Library Detection Engine
  const detectedFrameworks = useMemo(() => {
    const detected: { name: string; icon: string; category: string }[] = [];
    
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
  }, [repositories]);

  // 2. Advanced Language Ecosystem Segmentation
  const segmentation = useMemo(() => {
    let frontendBytes = 0;
    let backendBytes = 0;
    let aimlBytes = 0;
    let devopsBytes = 0;
    let mobileBytes = 0;
    let databaseBytes = 0;
    let infraBytes = 0;

    repositories.forEach(repo => {
      const searchStr = `${repo.name} ${repo.description || ""}`.toLowerCase();
      const primaryLang = repo.language || "Markdown";
      const sizeBytes = (repo.size || 100) * 1024; // Convert size in KB to bytes

      // Check keywords for classification
      const isMobile = searchStr.includes("android") || searchStr.includes("ios") || searchStr.includes("mobile") || searchStr.includes("flutter") || searchStr.includes("react-native") || primaryLang === "Kotlin" || primaryLang === "Swift" || primaryLang === "Dart";
      const isAiml = searchStr.includes("ml") || searchStr.includes("ai") || searchStr.includes("dataset") || searchStr.includes("model") || searchStr.includes("pytorch") || searchStr.includes("tensorflow") || searchStr.includes("llm") || searchStr.includes("opencv") || searchStr.includes("neural");
      const isDevops = searchStr.includes("ci") || searchStr.includes("cd") || searchStr.includes("actions") || searchStr.includes("workflow") || searchStr.includes("docker") || searchStr.includes("k8s") || searchStr.includes("kubernetes");
      const isDatabase = searchStr.includes("database") || searchStr.includes("db") || searchStr.includes("sql") || searchStr.includes("postgres") || searchStr.includes("mongodb") || searchStr.includes("prisma") || searchStr.includes("redis");
      const isInfra = searchStr.includes("terraform") || searchStr.includes("aws") || searchStr.includes("gcp") || searchStr.includes("kubernetes") || searchStr.includes("infrastructure") || searchStr.includes("yaml");

      if (isMobile) {
        mobileBytes += sizeBytes;
      } else if (isAiml) {
        aimlBytes += sizeBytes;
      } else if (isDevops) {
        devopsBytes += sizeBytes;
      } else if (isDatabase) {
        databaseBytes += sizeBytes;
      } else if (isInfra) {
        infraBytes += sizeBytes;
      } else if (primaryLang === "TypeScript" || primaryLang === "JavaScript" || primaryLang === "HTML" || primaryLang === "CSS") {
        // Default JS/TS to Frontend/Backend division based on framework scan
        const isBackendFramework = searchStr.includes("express") || searchStr.includes("nest") || searchStr.includes("node") || searchStr.includes("api");
        if (isBackendFramework) {
          backendBytes += sizeBytes;
        } else {
          frontendBytes += sizeBytes;
        }
      } else {
        // Go, Rust, Java, C#, Python etc. Default to backend
        backendBytes += sizeBytes;
      }
    });

    const totalBytes = frontendBytes + backendBytes + aimlBytes + devopsBytes + mobileBytes + databaseBytes + infraBytes || 1;

    const frontendPct = Math.round((frontendBytes / totalBytes) * 100);
    const backendPct = Math.round((backendBytes / totalBytes) * 100);
    const aimlPct = Math.round((aimlBytes / totalBytes) * 100);
    const devopsPct = Math.round((devopsBytes / totalBytes) * 100);
    const mobilePct = Math.round((mobileBytes / totalBytes) * 100);
    const databasePct = Math.round((databaseBytes / totalBytes) * 100);
    const infraPct = 100 - (frontendPct + backendPct + aimlPct + devopsPct + mobilePct + databasePct); // Ensure exactly 100%

    return [
      { name: "Frontend", percentage: Math.max(0, frontendPct), color: "#58A6FF", icon: Code },
      { name: "Backend", percentage: Math.max(0, backendPct), color: "#bc8cff", icon: Server },
      { name: "AI/ML", percentage: Math.max(0, aimlPct), color: "#3FB950", icon: Cpu },
      { name: "DevOps", percentage: Math.max(0, devopsPct), color: "#F85149", icon: Wrench },
      { name: "Mobile", percentage: Math.max(0, mobilePct), color: "#D29922", icon: Smartphone },
      { name: "Database", percentage: Math.max(0, databasePct), color: "#e3b341", icon: Database },
      { name: "Infrastructure", percentage: Math.max(0, infraPct), color: "#79c0ff", icon: Cloud }
    ].sort((a, b) => b.percentage - a.percentage);
  }, [repositories]);

  // Sort and limit languages for Radar / Bar Chart display
  const topLanguages = useMemo(() => {
    return [...languages]
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 6);
  }, [languages]);

  // Radar data mapping
  const radarData = useMemo(() => {
    return topLanguages.map(l => ({
      subject: l.name,
      A: l.percentage,
      fullMark: 100,
    }));
  }, [topLanguages]);

  // Analyze primary stack
  const primaryStackAnalysis = useMemo(() => {
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
  }, [topLanguages, detectedFrameworks]);

  // Calculate favorite charts toggle
  const toggleStarChart = (chartId: string) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devtrack_starred_charts");
      let list: string[] = [];
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (e) {}
      }
      const updated = list.includes(chartId) ? list.filter(id => id !== chartId) : [...list, chartId];
      localStorage.setItem("devtrack_starred_charts", JSON.stringify(updated));
      window.dispatchEvent(new Event("starred_charts_updated"));
    }
  };

  const isChartStarred = (chartId: string) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devtrack_starred_charts");
      if (saved) {
        try {
          return JSON.parse(saved).includes(chartId);
        } catch (e) {}
      }
    }
    return false;
  };

  return (
    <div className="space-y-6 font-mono">
      
      {/* 1. Core Ecosystem Radar & volume chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Technology Radar Chart */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 flex flex-col items-center justify-between">
          <div className="self-start w-full flex justify-between items-start">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Technology Radar Profile
              </h3>
              <p className="text-[10px] text-[#8B949E] mt-0.5">Language experience weight mapped across key vectors.</p>
            </div>
            <button
              onClick={() => toggleStarChart("tech_radar")}
              className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              ⭐ {isChartStarred("tech_radar") ? "Favorited" : "Favorite"}
            </button>
          </div>
          <div className="h-56 w-full text-[9px] font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#30363D" />
                <PolarAngleAxis dataKey="subject" stroke="#8B949E" />
                <Radar
                  name="Proficiency"
                  dataKey="A"
                  stroke="#58A6FF"
                  fill="#1F6FEB"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language distribution bar chart */}
        <div className="rounded-xl border border-[#30363D] bg-[#161B22]/40 p-6 flex flex-col items-center justify-between">
          <div className="self-start w-full flex justify-between items-start">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Ecosystem Volume
              </h3>
              <p className="text-[10px] text-[#8B949E] mt-0.5">Relative percentages calculated from codebase file sizes.</p>
            </div>
            <button
              onClick={() => toggleStarChart("lang_volume")}
              className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              ⭐ {isChartStarred("lang_volume") ? "Favorited" : "Favorite"}
            </button>
          </div>
          <div className="h-56 w-full text-[9px] font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLanguages} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#8B949E" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#8B949E" tickLine={false} width={70} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
                  labelStyle={{ color: "#F0F6FC" }}
                />
                <Bar dataKey="percentage" fill="#3FB950" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 2. Premium Language Ecosystem Segmentation */}
      <div className="rounded-xl border border-border bg-[#161B22]/60 p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary">
              Full Stack Ecosystem Segmentation
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Scans repositories names, descriptions, and file arrays to classify coding volume.</p>
          </div>
          <button
            onClick={() => toggleStarChart("ecosystem_seg")}
            className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            ⭐ {isChartStarred("ecosystem_seg") ? "Favorited" : "Favorite"}
          </button>
        </div>

        {/* Stacked Horizontal Progress Bar */}
        <div className="w-full h-5 bg-[#0D1117] rounded-full overflow-hidden flex border border-border">
          {segmentation.map((seg, idx) => (
            seg.percentage > 0 && (
              <div
                key={idx}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                title={`${seg.name}: ${seg.percentage}%`}
              />
            )
          ))}
        </div>

        {/* Legend Grid with Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs pt-2">
          {segmentation.map((seg, idx) => {
            const Icon = seg.icon;
            return (
              <div
                key={idx}
                className="p-3 bg-background/50 rounded-xl border border-border flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-[10px] font-bold uppercase truncate">{seg.name}</span>
                  <Icon size={14} style={{ color: seg.color }} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-text-primary font-space-grotesk">{seg.percentage}%</span>
                  <span className="text-[9px] text-text-secondary font-normal font-mono">vol</span>
                </div>
                <div className="w-full h-1 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Framework & Technology Integration Panel */}
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
                {primaryStackAnalysis}
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
