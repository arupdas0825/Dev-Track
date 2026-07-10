"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Zap,
  Globe,
  TrendingUp,
  BarChart2,
  Download,
  Clock,
  AlertCircle,
  Sliders,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock requests data
const DAILY_REQUESTS = [
  { date: "Jul 1", calls: 145000, errors: 230 },
  { date: "Jul 2", calls: 160000, errors: 450 },
  { date: "Jul 3", calls: 189000, errors: 180 },
  { date: "Jul 4", calls: 210000, errors: 300 },
  { date: "Jul 5", calls: 198000, errors: 220 },
  { date: "Jul 6", calls: 140000, errors: 110 },
  { date: "Jul 7", calls: 135000, errors: 90 },
  { date: "Jul 8", calls: 167000, errors: 140 },
  { date: "Jul 9", calls: 245000, errors: 520 },
  { date: "Jul 10", calls: 290000, errors: 940 }
];

// Success breakdown pie
const PIE_DATA = [
  { name: "Success 2xx", value: 94.1, color: "#3FB950" },
  { name: "Rate Limited 429", value: 3.2, color: "#D29922" },
  { name: "Server Errors 5xx", value: 1.8, color: "#F85149" },
  { name: "Client Errors 4xx", value: 0.9, color: "#2F81F7" }
];

// Latency breakdown
const LATENCY_DATA = [
  { bucket: "<50ms", count: 840 },
  { bucket: "50-100ms", count: 420 },
  { bucket: "100-200ms", count: 189 },
  { bucket: "200-500ms", count: 42 },
  { bucket: ">500ms", count: 12 }
];

export default function UsageAnalyticsPanel() {
  const [dateRange, setDateRange] = useState("7d");
  const [liveRps, setLiveRps] = useState(2847);

  // Live ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRps(prev => {
        const offset = Math.floor(Math.random() * 81) - 40; // -40 to +40
        return Math.max(100, prev + offset);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Usage Analytics
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">Platform request volume, latency distribution histograms, and regional metrics</p>
        </div>

        <div className="flex gap-2">
          {["today", "7d", "30d"].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                dateRange === range
                  ? "bg-[#21262D] border-[#8957E5] text-white"
                  : "bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC]"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Live Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[9px] text-[#8B949E] tracking-wider block">REALTIME TRAFFIC</span>
            <span className="text-xl font-bold mt-1 block">{liveRps} req/s</span>
          </div>
          <div className="w-3 h-3 bg-[#3FB950] rounded-full animate-pulse" />
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[9px] text-[#8B949E] tracking-wider block">SUCCESS RATE</span>
            <span className="text-xl font-bold mt-1 block">99.4%</span>
          </div>
          <span className="text-xs bg-[#3FB950]/15 text-[#3FB950] px-2 py-0.5 rounded-full font-bold">Stable</span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[9px] text-[#8B949E] tracking-wider block">BANDWIDTH USAGE</span>
            <span className="text-xl font-bold mt-1 block">4.2 TB</span>
          </div>
          <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">Limit: 10TB</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Requests timeline */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">Request Timelines (Success vs Errors)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_REQUESTS}>
                <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8B949E" fontSize={9} />
                <YAxis stroke="#8B949E" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                <Area type="monotone" dataKey="calls" stroke="#2F81F7" fill="#2F81F7" fillOpacity={0.1} name="Requests" />
                <Area type="monotone" dataKey="errors" stroke="#F85149" fill="#F85149" fillOpacity={0.15} name="Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency histogram */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">API Gateway Latency Histogram</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LATENCY_DATA}>
                <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                <XAxis dataKey="bucket" stroke="#8B949E" fontSize={9} />
                <YAxis stroke="#8B949E" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#161B22", borderColor: "#30363D" }} />
                <Bar dataKey="count" fill="#8957E5" radius={[4, 4, 0, 0]} name="Requests Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdowns Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Success Donut chart */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">HTTP Status Breakdown</h4>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8B949E]">
            {PIE_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top endpoint lists */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">Top Endpoints Usage</h4>
          <div className="space-y-3">
            {[
              { path: "GET /v1/developer/:username", calls: "1.2M", ms: "89ms", status: "99.9%" },
              { path: "GET /v1/repos/:username", calls: "890K", ms: "134ms", status: "99.8%" },
              { path: "POST /v1/analytics/score", calls: "456K", ms: "234ms", status: "98.9%" }
            ].map((endpoint, i) => (
              <div key={i} className="flex justify-between items-center pb-2 border-b border-[#30363D]/40">
                <div>
                  <code className="text-[#F0F6FC] font-semibold">{endpoint.path}</code>
                  <span className="text-[10px] text-[#8B949E] block mt-0.5">{endpoint.calls} requests · Avg {endpoint.ms}</span>
                </div>
                <span className="text-[#3FB950] font-bold">{endpoint.status} success</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
