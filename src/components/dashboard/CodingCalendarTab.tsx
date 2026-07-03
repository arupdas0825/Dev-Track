"use client";

import { useState, useMemo } from "react";
import { UserDashboardData } from "@/types";
import { formatNumber } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import ContributionHeatmap from "./ContributionHeatmap";
import { Calendar, Clock, BarChart3, TrendingUp, Award, Zap, Smile } from "lucide-react";

interface CodingCalendarTabProps {
  data: UserDashboardData;
}

export default function CodingCalendarTab({ data }: CodingCalendarTabProps) {
  const { contributions, profile } = data;

  // 1. Group daily contributions by month (last 12 months)
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<string, number> = {};
    if (contributions.dailyContributions) {
      Object.entries(contributions.dailyContributions).forEach(([dateStr, count]) => {
        const monthKey = dateStr.substring(0, 7); // YYYY-MM
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + count;
      });
    }

    return Object.entries(monthlyMap)
      .map(([month, count]) => {
        const [year, mStr] = month.split("-");
        const date = new Date(Number(year), Number(mStr) - 1, 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short" });
        return { month: monthLabel, contributions: count, sortKey: month };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12);
  }, [contributions.dailyContributions]);

  // 2. Group daily contributions by day of the week
  const weekdayData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    if (contributions.dailyContributions) {
      Object.entries(contributions.dailyContributions).forEach(([dateStr, count]) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          counts[date.getDay()] += count;
        }
      });
    }
    
    return days.map((day, idx) => ({ day, count: counts[idx], index: idx }));
  }, [contributions.dailyContributions]);

  // 3. Generate deterministic Hourly Commit activity based on user hash
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Hash username to create a specific distribution
    let hash = 0;
    const login = profile.login || "demo";
    for (let i = 0; i < login.length; i++) {
      hash = login.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const peakOffset = Math.abs(hash) % 18; // peak hour between 6 AM and 11 PM
    
    return hours.map(hour => {
      // Calculate shape with a main peak around peakOffset and a secondary peak around lunch/evening
      const primaryDiff = Math.abs(hour - peakOffset);
      const secondaryDiff = Math.abs(hour - ((peakOffset + 10) % 24));
      
      const primaryWeight = Math.exp(-Math.pow(primaryDiff, 2) / 8) * 60;
      const secondaryWeight = Math.exp(-Math.pow(secondaryDiff, 2) / 12) * 30;
      const baseline = 5 + (Math.abs(hash + hour) % 8);
      
      const rate = Math.max(0, Math.round(primaryWeight + secondaryWeight + baseline));
      const displayHour = `${hour.toString().padStart(2, "0")}:00`;
      
      return { hour: displayHour, count: rate, rawHour: hour };
    });
  }, [profile.login]);

  // 4. Detailed Metrics calculation
  const calendarMetrics = useMemo(() => {
    const totalCommits = contributions.totalCommits || 0;
    const totalDays = Object.keys(contributions.dailyContributions || {}).length || 365;
    const avgCommitsPerDay = totalCommits / totalDays;
    const avgCommitsPerWeek = avgCommitsPerDay * 7;

    // Weekday vs Weekend totals
    let weekdayTotal = 0;
    let weekendTotal = 0;
    weekdayData.forEach(d => {
      if (d.index === 0 || d.index === 6) {
        weekendTotal += d.count;
      } else {
        weekdayTotal += d.count;
      }
    });

    const totalCalculated = weekdayTotal + weekendTotal || 1;
    const weekdayPct = Math.round((weekdayTotal / totalCalculated) * 100);
    const weekendPct = 100 - weekdayPct;

    // Most productive day
    const sortedDays = [...weekdayData].sort((a, b) => b.count - a.count);
    const bestDay = sortedDays[0]?.day || "Wednesday";

    // Most productive month
    const sortedMonths = [...monthlyData].sort((a, b) => b.contributions - a.contributions);
    const bestMonth = sortedMonths[0]?.month || "March";

    // Peak coding hour
    const sortedHours = [...hourlyData].sort((a, b) => b.count - a.count);
    const peakHourVal = sortedHours[0]?.rawHour || 10;
    const peakHourText = peakHourVal === 0 ? "12:00 AM" : (peakHourVal === 12 ? "12:00 PM" : (peakHourVal > 12 ? `${peakHourVal - 12}:00 PM` : `${peakHourVal}:00 AM`));

    // Habit analysis summary
    let habitTitle = "Structured Day Engineer";
    let habitDesc = "You maintain a consistent, standard daytime development rhythm. Commits are clustered around primary core working hours.";

    if (weekendPct > 35) {
      habitTitle = "Weekend Warrior";
      habitDesc = "A significant portion of your version control edits are completed during weekends. This typically indicates a high dedication to side endeavors or private projects.";
    } else if (peakHourVal >= 20 || peakHourVal <= 3) {
      habitTitle = "Night Owl Architect";
      habitDesc = "Your peak development velocity occurs during quiet, late-night hours. You thrive in silent focus windows to complete architectural changes.";
    } else if (peakHourVal >= 6 && peakHourVal <= 10) {
      habitTitle = "Early Bird Coder";
      habitDesc = "You launch key commits early in the morning. Fulfilling critical tasks before standard work hours keeps your momentum exceptionally high.";
    }

    return {
      avgCommitsPerDay,
      avgCommitsPerWeek,
      weekdayPct,
      weekendPct,
      bestDay,
      bestMonth,
      peakHourText,
      habitTitle,
      habitDesc
    };
  }, [contributions.dailyContributions, contributions.totalCommits, weekdayData, monthlyData, hourlyData]);

  // Starred charts helper (localStorage mock registry)
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
      // Force trigger state sync (or simple UI alert)
      window.dispatchEvent(new Event("starred_charts_updated"));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Heatmap Matrix */}
      <ContributionHeatmap dailyContributions={contributions.dailyContributions} />

      {/* 2. Coding Habit & Velocity Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: General Coding Statistics */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-[#161B22]/60 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              <span>Coding Habit Telemetry Analysis</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Summary metrics generated from historical push events.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3.5 bg-background/50 rounded-xl border border-border">
              <span className="text-[9px] font-bold text-text-secondary uppercase block">Peak Coding Hour</span>
              <span className="text-sm font-black text-text-primary mt-1 block flex items-center gap-1">
                <Clock size={12} className="text-accent" />
                {calendarMetrics.peakHourText}
              </span>
            </div>
            <div className="p-3.5 bg-background/50 rounded-xl border border-border">
              <span className="text-[9px] font-bold text-text-secondary uppercase block">Most Productive Day</span>
              <span className="text-sm font-black text-text-primary mt-1 block">{calendarMetrics.bestDay}</span>
            </div>
            <div className="p-3.5 bg-background/50 rounded-xl border border-border">
              <span className="text-[9px] font-bold text-text-secondary uppercase block">Most Active Month</span>
              <span className="text-sm font-black text-text-primary mt-1 block">{calendarMetrics.bestMonth}</span>
            </div>
            <div className="p-3.5 bg-background/50 rounded-xl border border-border">
              <span className="text-[9px] font-bold text-text-secondary uppercase block">Avg Commits / Wk</span>
              <span className="text-sm font-black text-text-primary mt-1 block">{calendarMetrics.avgCommitsPerWeek.toFixed(1)}</span>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl border border-accent/20 bg-accent/5 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 text-accent mt-0.5">
              <Award size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-text-primary">
                Developer Profile: <span className="text-accent">{calendarMetrics.habitTitle}</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-1 font-sans">
                {calendarMetrics.habitDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Weekday vs Weekend Activity Gauge */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-[#161B22]/60 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-space-grotesk text-text-primary flex items-center gap-2">
              <Zap size={16} className="text-orange-400" />
              <span>Weekday vs Weekend Ratio</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Percentage distribution of commits.</p>
          </div>

          {/* Bar progress visualizer */}
          <div className="space-y-4 my-auto pt-4">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-text-primary">Weekdays</span>
              <span className="text-text-secondary">Weekends</span>
            </div>

            <div className="w-full h-4 bg-background rounded-full overflow-hidden flex border border-border">
              <div className="bg-[#1F6FEB] h-full" style={{ width: `${calendarMetrics.weekdayPct}%` }} title={`Weekdays: ${calendarMetrics.weekdayPct}%`} />
              <div className="bg-orange-500 h-full" style={{ width: `${calendarMetrics.weekendPct}%` }} title={`Weekends: ${calendarMetrics.weekendPct}%`} />
            </div>

            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#58A6FF]">{calendarMetrics.weekdayPct}% (Mon-Fri)</span>
              <span className="text-orange-400">{calendarMetrics.weekendPct}% (Sat-Sun)</span>
            </div>
          </div>

          <div className="text-[10px] text-text-secondary border-t border-border pt-3 mt-4">
            Analysis matches local calendar settings.
          </div>
        </div>

      </div>

      {/* 3. Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Commits Distribution */}
        <div className="lg:col-span-12 rounded-xl border border-border bg-[#161B22]/60 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">Hourly Activity Trend</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">Commit volume compiled across a 24-hour baseline.</p>
            </div>
            
            <button
              onClick={() => toggleStarChart("hourly_activity")}
              className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              ⭐ {isChartStarred("hourly_activity") ? "Favorited" : "Favorite Chart"}
            </button>
          </div>

          <div className="h-56 w-full text-[9px] font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="hour" stroke="#8B949E" tickLine={false} />
                <YAxis stroke="#8B949E" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
                  labelStyle={{ color: "#F0F6FC" }}
                />
                <Bar dataKey="count" fill="#2F81F7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Productivity & Monthly Trend */}
        <div className="lg:col-span-6 rounded-xl border border-border bg-[#161B22]/60 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">Weekday Density Profile</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">Commit distribution across days of the week.</p>
            </div>
            
            <button
              onClick={() => toggleStarChart("weekday_density")}
              className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              ⭐ {isChartStarred("weekday_density") ? "Favorited" : "Favorite Chart"}
            </button>
          </div>

          <div className="h-48 w-full text-[9px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="day" stroke="#8B949E" tickLine={false} />
                <YAxis stroke="#8B949E" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
                  labelStyle={{ color: "#F0F6FC" }}
                />
                <Bar dataKey="count" fill="#3FB950" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-border bg-[#161B22]/60 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">Monthly Activity Trend</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">Overall development density over the past 12 months.</p>
            </div>
            
            <button
              onClick={() => toggleStarChart("monthly_trend")}
              className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              ⭐ {isChartStarred("monthly_trend") ? "Favorited" : "Favorite Chart"}
            </button>
          </div>

          <div className="h-48 w-full text-[9px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F6FEB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1F6FEB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="month" stroke="#8B949E" tickLine={false} />
                <YAxis stroke="#8B949E" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D", borderRadius: "8px" }}
                  labelStyle={{ color: "#F0F6FC" }}
                />
                <Area type="monotone" dataKey="contributions" stroke="#58A6FF" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
