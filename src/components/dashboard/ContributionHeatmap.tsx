"use client";

import { useState, useMemo } from "react";

interface ContributionHeatmapProps {
  dailyContributions?: Record<string, number>;
  loading?: boolean;
}

export default function ContributionHeatmap({
  dailyContributions = {},
  loading = false,
}: ContributionHeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Available years based on data or last 3 years
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1, currentYear - 2]);
    Object.keys(dailyContributions).forEach((dateStr) => {
      const y = parseInt(dateStr.substring(0, 4), 10);
      if (!isNaN(y) && y > 2000) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [dailyContributions, currentYear]);

  // Generate 53 weeks (371 days) matrix for selected year
  const { weeks, monthHeaders, totalYearContribs } = useMemo(() => {
    const isCurrent = selectedYear === currentYear;
    const today = new Date();
    
    // Determine end date for grid calculation
    let endDate: Date;
    if (isCurrent) {
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else {
      endDate = new Date(selectedYear, 11, 31);
    }

    // Start 52 weeks (364 days) before end date
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);
    
    // Adjust startDate to preceding Sunday so columns align cleanly with weeks (Sun-Sat)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const cells: { dateStr: string; count: number; level: number; month: string }[] = [];
    let total = 0;

    const tempDate = new Date(startDate);
    const totalDays = 371; // 53 weeks

    for (let i = 0; i < totalDays; i++) {
      const y = tempDate.getFullYear();
      const m = String(tempDate.getMonth() + 1).padStart(2, "0");
      const d = String(tempDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const count = dailyContributions[dateStr] || 0;
      total += count;

      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 4) level = 2;
      else if (count > 4 && count <= 8) level = 3;
      else if (count > 8) level = 4;

      const monthName = tempDate.toLocaleDateString("en-US", { month: "short" });
      cells.push({ dateStr, count, level, month: monthName });

      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Group into 53 columns (weeks of 7 days)
    const weekCols: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekCols.push(cells.slice(i, i + 7));
    }

    // Determine month headers placement across columns
    const headers: { month: string; colIndex: number }[] = [];
    let lastMonth = "";
    weekCols.forEach((col, idx) => {
      if (col[0] && col[0].month !== lastMonth) {
        lastMonth = col[0].month;
        headers.push({ month: lastMonth, colIndex: idx });
      }
    });

    return { weeks: weekCols, monthHeaders: headers, totalYearContribs: total };
  }, [dailyContributions, selectedYear, currentYear]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-[#30363D]/50 rounded" />
        <div className="h-32 w-full bg-[#0D1117]/60 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-6 space-y-4 relative font-mono">
      {/* Top Controls & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h3 className="text-sm font-bold font-space-grotesk text-[#F0F6FC] flex items-center gap-2">
            <span>{totalYearContribs.toLocaleString()} Contributions</span>
            <span className="text-xs text-[#8B949E] font-normal font-mono">in {selectedYear}</span>
          </h3>
          <p className="text-[10px] text-[#8B949E] mt-0.5">Real-time GitHub activity telemetry.</p>
        </div>

        {/* Year Selector Buttons */}
        <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                selectedYear === yr
                  ? "bg-[#1F6FEB] text-white shadow-sm"
                  : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]"
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Heatmap Container */}
      <div className="relative overflow-x-auto scrollbar-none pb-2 pt-1">
        <div className="min-w-[750px] flex flex-col gap-1 select-none">
          
          {/* Top Month Labels */}
          <div className="flex text-[9px] text-[#8B949E] pl-8 h-4 relative">
            {monthHeaders.map((hdr, idx) => {
              // Position month label horizontally over matching column index (14px per column)
              const leftPos = hdr.colIndex * 14;
              return (
                <span
                  key={idx}
                  className="absolute"
                  style={{ left: `${leftPos + 32}px` }}
                >
                  {hdr.month}
                </span>
              );
            })}
          </div>

          {/* Grid Rows with Left Weekday Labels */}
          <div className="flex gap-2 items-start">
            {/* Weekday Labels Column */}
            <div className="flex flex-col gap-[3px] text-[9px] text-[#8B949E] pt-[2px] h-[98px] justify-between w-6 text-right pr-1">
              <span className="h-[11px] leading-[11px]"></span>
              <span className="h-[11px] leading-[11px]">Mon</span>
              <span className="h-[11px] leading-[11px]"></span>
              <span className="h-[11px] leading-[11px]">Wed</span>
              <span className="h-[11px] leading-[11px]"></span>
              <span className="h-[11px] leading-[11px]">Fri</span>
              <span className="h-[11px] leading-[11px]"></span>
            </div>

            {/* Heatmap Columns (53 Weeks) */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    let colorClass = "bg-[#161B22]";
                    if (day.level === 1) colorClass = "bg-[#0e4429]";
                    if (day.level === 2) colorClass = "bg-[#006d32]";
                    if (day.level === 3) colorClass = "bg-[#26a641]";
                    if (day.level === 4) colorClass = "bg-[#39d353]";

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            dateStr: day.dateStr,
                            count: day.count,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        tabIndex={0}
                        aria-label={`${day.count} contributions on ${day.dateStr}`}
                        className={`h-[11px] w-[11px] rounded-[2px] transition-transform duration-150 hover:scale-125 hover:z-20 cursor-pointer ${colorClass} focus:outline-none focus:ring-1 focus:ring-[#58A6FF]`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 px-2.5 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[10px] text-[#F0F6FC] shadow-xl font-mono"
          style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
        >
          <div className="font-bold text-[#58A6FF]">
            {hoveredCell.count === 0 ? "No contributions" : `${hoveredCell.count} contribution${hoveredCell.count > 1 ? "s" : ""}`}
          </div>
          <div className="text-[#8B949E] text-[9px]">
            {new Date(hoveredCell.dateStr).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#30363D] text-[10px] text-[#8B949E]">
        <a
          href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/viewing-contributions-on-your-profile"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#58A6FF] transition-colors"
        >
          Learn how contributions are counted
        </a>

        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#161B22]" title="0 contributions" />
          <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#0e4429]" title="1-2 contributions" />
          <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#006d32]" title="3-4 contributions" />
          <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#26a641]" title="5-8 contributions" />
          <div className="h-2.5 w-2.5 rounded-[1.5px] bg-[#39d353]" title="8+ contributions" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
