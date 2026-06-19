"use client";

import { UserDashboardData } from "@/types";

interface ScoreTabProps {
  data: UserDashboardData;
}

export default function ScoreTab({ data }: ScoreTabProps) {
  const { score } = data;

  // Render a responsive SVG radar chart
  const renderRadarChart = () => {
    const width = 300;
    const height = 300;
    const cx = width / 2;
    const cy = height / 2;
    const rMax = 95; // Max radius of pentagon

    // 5 dimensions
    const variables = [
      { key: "consistency", label: "Consistency", val: score.consistency },
      { key: "repoQuality", label: "Quality", val: score.repoQuality },
      { key: "diversity", label: "Diversity", val: score.diversity },
      { key: "openSource", label: "OS Impact", val: score.openSource },
      { key: "complexity", label: "Complexity", val: score.complexity },
    ];

    const getCoordinates = (index: number, val: number) => {
      const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
      // Value is out of 20
      const radius = (val / 20) * rMax;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return { x, y };
    };

    // 1. Concentric Pentagon rings (grid lines at 4, 8, 12, 16, 20)
    const rings = [4, 8, 12, 16, 20];
    const ringPoints = rings.map((ringValue) => {
      return variables
        .map((_, index) => {
          const { x, y } = getCoordinates(index, ringValue);
          return `${x},${y}`;
        })
        .join(" ");
    });

    // 2. Axes lines from center to outer vertices
    const axesLines = variables.map((_, index) => {
      const { x, y } = getCoordinates(index, 20);
      return { x1: cx, y1: cy, x2: x, y2: y };
    });

    // 3. User score polygon
    const userPolygonPoints = variables
      .map((item, index) => {
        const { x, y } = getCoordinates(index, item.val);
        return `${x},${y}`;
      })
      .join(" ");

    // 4. Label coordinates (placed slightly further out)
    const labelDistance = 22; // offset in pixels
    const labels = variables.map((item, index) => {
      const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + (rMax + labelDistance) * Math.cos(angle);
      const y = cy + (rMax + labelDistance) * Math.sin(angle);
      
      // Fine-tune alignments
      let textAnchor: "start" | "end" | "middle" = "middle";
      if (Math.cos(angle) > 0.1) textAnchor = "start";
      else if (Math.cos(angle) < -0.1) textAnchor = "end";

      return { label: item.label, x, y, textAnchor };
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[280px] mx-auto overflow-visible">
        {/* Background Pentagon Rings */}
        {ringPoints.map((points, index) => (
          <polygon
            key={index}
            points={points}
            fill="none"
            stroke="var(--border)"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
        ))}

        {/* Axes Lines */}
        {axesLines.map((axis, index) => (
          <line
            key={index}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="var(--border)"
            strokeWidth="0.8"
          />
        ))}

        {/* Outer Ring boundary */}
        <polygon
          points={ringPoints[ringPoints.length - 1]}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* User Stats Polygon */}
        <polygon
          points={userPolygonPoints}
          fill="rgba(47, 129, 247, 0.15)"
          stroke="var(--accent)"
          strokeWidth="2"
          className="animate-pulse"
        />

        {/* User Points dot indicators */}
        {variables.map((item, index) => {
          const { x, y } = getCoordinates(index, item.val);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3.5"
              fill="var(--background)"
              stroke="var(--accent)"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {labels.map((item, index) => (
          <text
            key={index}
            x={item.x}
            y={item.y + 4} // small vertical adjust
            fill="var(--text-secondary)"
            fontSize="10px"
            fontWeight="bold"
            fontFamily="var(--font-inter), monospace"
            textAnchor={item.textAnchor}
          >
            {item.label}
          </text>
        ))}
      </svg>
    );
  };

  const getScoreClassification = (val: number): { label: string; color: string } => {
    if (val >= 90) return { label: "Elite Architect", color: "text-success border-success/30 bg-success/5" };
    if (val >= 75) return { label: "Senior Engineer", color: "text-accent border-accent/30 bg-accent/5" };
    if (val >= 50) return { label: "Competent Builder", color: "text-warning border-warning/30 bg-warning/5" };
    return { label: "Novice Builder", color: "text-text-secondary border-border bg-surface" };
  };

  const classification = getScoreClassification(score.overall);

  return (
    <div className="space-y-6">
      {/* Overview Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-xl border border-border bg-surface p-6">
        <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start justify-center">
          <span className="text-[10px] font-mono text-text-secondary uppercase">Aggregate score</span>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-space-grotesk text-text-primary mt-1">
            {score.overall}
          </h2>
          <span className={`mt-3 inline-flex text-xs font-bold px-3 py-1 rounded border ${classification.color}`}>
            {classification.label}
          </span>
          <p className="mt-4 text-xs text-text-secondary leading-relaxed max-w-[200px]">
            Aggregated profile value across consistency, quality, diversity, impact, and volume.
          </p>
        </div>

        <div className="md:col-span-8 flex justify-center py-4 border-t md:border-t-0 md:border-l border-border/60">
          {renderRadarChart()}
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-bold font-space-grotesk text-text-primary border-b border-border/40 pb-3">
          Evaluation Diagnostic
        </h3>

        <div className="space-y-5 font-mono text-xs">
          {/* Consistency */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">CONSISTENCY</span>
                <span className="text-[10px] text-text-secondary">({score.consistency}/20)</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{score.breakdown.consistencyReason}</p>
            </div>
            <div className="w-24 h-1.5 bg-surface-secondary rounded-full overflow-hidden self-center flex-shrink-0">
              <div className="h-full bg-[#39d353]" style={{ width: `${(score.consistency / 20) * 100}%` }} />
            </div>
          </div>

          {/* Quality */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start border-t border-border/30 pt-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">REPOSITORY QUALITY</span>
                <span className="text-[10px] text-text-secondary">({score.repoQuality}/20)</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{score.breakdown.repoQualityReason}</p>
            </div>
            <div className="w-24 h-1.5 bg-surface-secondary rounded-full overflow-hidden self-center flex-shrink-0">
              <div className="h-full bg-accent" style={{ width: `${(score.repoQuality / 20) * 100}%` }} />
            </div>
          </div>

          {/* Diversity */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start border-t border-border/30 pt-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">TECHNICAL DIVERSITY</span>
                <span className="text-[10px] text-text-secondary">({score.diversity}/20)</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{score.breakdown.diversityReason}</p>
            </div>
            <div className="w-24 h-1.5 bg-surface-secondary rounded-full overflow-hidden self-center flex-shrink-0">
              <div className="h-full bg-[#8957e5]" style={{ width: `${(score.diversity / 20) * 100}%` }} />
            </div>
          </div>

          {/* Open Source */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start border-t border-border/30 pt-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">OPEN SOURCE IMPACT</span>
                <span className="text-[10px] text-text-secondary">({score.openSource}/20)</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{score.breakdown.openSourceReason}</p>
            </div>
            <div className="w-24 h-1.5 bg-surface-secondary rounded-full overflow-hidden self-center flex-shrink-0">
              <div className="h-full bg-warning" style={{ width: `${(score.openSource / 20) * 100}%` }} />
            </div>
          </div>

          {/* Complexity */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start border-t border-border/30 pt-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">PROJECT COMPLEXITY</span>
                <span className="text-[10px] text-text-secondary">({score.complexity}/20)</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{score.breakdown.complexityReason}</p>
            </div>
            <div className="w-24 h-1.5 bg-surface-secondary rounded-full overflow-hidden self-center flex-shrink-0">
              <div className="h-full bg-danger" style={{ width: `${(score.complexity / 20) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
