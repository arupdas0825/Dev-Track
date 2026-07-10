"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Receipt,
  TrendingUp,
  Package,
  Users,
  Database,
  Shield,
  Download,
  AlertTriangle,
  Check,
  CheckCircle,
  XCircle,
  X
} from "lucide-react";

// Mock Invoices
const INVOICES = [
  { id: "inv-2026-06", date: "Jun 12, 2026", plan: "Enterprise", seats: 89, amount: 299, status: "paid" },
  { id: "inv-2026-05", date: "May 12, 2026", plan: "Enterprise", seats: 89, amount: 299, status: "paid" },
  { id: "inv-2026-04", date: "Apr 12, 2026", plan: "Enterprise", seats: 75, amount: 249, status: "paid" }
];

export default function BillingPanel() {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [taxId, setTaxId] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toLowerCase() === "devtrack20") {
      setCouponApplied(true);
      setCouponError(false);
    } else {
      setCouponError(true);
      setCouponApplied(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-mono text-[#F0F6FC] bg-[#0D1117] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#30363D] pb-4">
        <div>
          <h2 className="text-xl font-bold">Billing & Subscription</h2>
          <p className="text-xs text-[#8B949E] mt-1">Configure subscription tiers, credit credentials, seats utility, and invoice lists</p>
        </div>
      </div>

      {/* Grid Layout: Left Info, Right Progress meters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-accent uppercase tracking-wider block">CURRENT TIERS ACTIVE</span>
              <h3 className="text-base font-bold text-[#F0F6FC] mt-1">Enterprise Subscription</h3>
              <p className="text-xs text-[#8B949E] mt-1">Renews on July 1, 2027 · $299 / Month</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950] px-2 py-0.5 rounded-full">
                Renews Automatically
              </span>
            </div>
          </div>

          {/* Visa Card summary */}
          <div className="flex items-center gap-3 bg-[#0D1117] border border-[#30363D] p-3.5 rounded-lg text-xs">
            <CreditCard size={18} className="text-[#8B949E]" />
            <div>
              <span className="font-bold text-[#F0F6FC]">Visa ending in 4242</span>
              <span className="text-[10px] text-[#8B949E] block">Expires 12/2028 · Primary Payment Credentials</span>
            </div>
            <button className="ml-auto text-[10px] font-bold text-accent hover:underline">
              Update card
            </button>
          </div>
        </div>

        {/* Right limits meters */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">Workspace Limits Snapshot</h4>
          <div className="space-y-3 text-xs">
            {/* Seats */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8B949E]">Members Seats</span>
                <span className="text-[#F0F6FC]">89 / 150 Slots used</span>
              </div>
              <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "59%" }} />
              </div>
            </div>

            {/* API limits */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8B949E]">API Monthly Gateway Calls</span>
                <span className="text-[#F0F6FC]">4.2M / 10M used</span>
              </div>
              <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "42%" }} />
              </div>
            </div>

            {/* Storage */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8B949E]">Repository Cache Storage</span>
                <span className="text-[#F0F6FC]">847 GB / 2 TB used</span>
              </div>
              <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "41%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#30363D]">
          <h4 className="text-xs font-bold uppercase text-[#8B949E]">Transaction / Invoice Logs</h4>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#21262D]/40 text-[#8B949E] uppercase tracking-wider font-mono">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Billing Date</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Seats Used</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">PDF Download</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b border-[#30363D]/60 hover:bg-[#21262D]/20">
                  <td className="p-4 font-bold text-[#F0F6FC]">{inv.id}</td>
                  <td className="p-4 text-[#8B949E]">{inv.date}</td>
                  <td className="p-4 font-semibold">{inv.plan}</td>
                  <td className="p-4">{inv.seats} Seats</td>
                  <td className="p-4 font-bold">${inv.amount}.00</td>
                  <td className="p-4 text-center">
                    <span className="bg-[#3FB950]/15 text-[#3FB950] px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 hover:bg-[#21262D] rounded text-[#8B949E] hover:text-[#F0F6FC]">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Applied */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase text-[#8B949E]">Coupons & Taxes</h4>

        <div className="flex flex-col sm:flex-row gap-4 items-end text-xs">
          <div className="space-y-1.5 flex-1">
            <label className="text-[#8B949E] font-semibold">Promotion Code</label>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. DEVTRACK20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none flex-1"
              />
              <button type="submit" className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] rounded-lg font-bold">
                Apply
              </button>
            </form>
            {couponApplied && <span className="text-[#3FB950] text-[10px] block mt-1">✓ Promo applied: 20% discount configured.</span>}
            {couponError && <span className="text-[#F85149] text-[10px] block mt-1">✗ Invalid coupon code. Try DEVTRACK20.</span>}
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="text-[#8B949E] font-semibold">Tax ID / Business Registration (Optional)</label>
            <input
              type="text"
              placeholder="e.g. EU123456789"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
