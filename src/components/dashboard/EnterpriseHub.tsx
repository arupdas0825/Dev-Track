"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Building2,
  Users,
  UsersRound,
  ShieldCheck,
  Key,
  BarChart2,
  CreditCard,
  FileText,
  Shield,
  Plug,
  ChevronRight
} from "lucide-react";

// Lazy-load sub-panels (dynamic imports to keep bundle efficient)
import EnterpriseDashboardPanel from "./enterprise/EnterpriseDashboardPanel";
import OrganizationsPanel from "./enterprise/OrganizationsPanel";
import MembersPanel from "./enterprise/MembersPanel";
import TeamsPanel from "./enterprise/TeamsPanel";
import AdminPanel from "./enterprise/AdminPanel";
import ApiKeysPanel from "./enterprise/ApiKeysPanel";
import UsageAnalyticsPanel from "./enterprise/UsageAnalyticsPanel";
import BillingPanel from "./enterprise/BillingPanel";
import AuditLogsPanel from "./enterprise/AuditLogsPanel";
import SecurityPanel from "./enterprise/SecurityPanel";
import IntegrationsPanel from "./enterprise/IntegrationsPanel";

// ─── Sub-tab definitions ────────────────────────────────────────────────────
const ENTERPRISE_TABS = [
  {
    id: "enterprise-dashboard",
    label: "Enterprise Dashboard",
    icon: LayoutGrid,
    description: "Platform overview & KPIs",
    color: "#8957E5",
  },
  {
    id: "enterprise-organizations",
    label: "Organizations",
    icon: Building2,
    description: "Manage workspaces & orgs",
    color: "#2F81F7",
  },
  {
    id: "enterprise-members",
    label: "Members",
    icon: Users,
    description: "Invite & manage members",
    color: "#3FB950",
  },
  {
    id: "enterprise-teams",
    label: "Teams",
    icon: UsersRound,
    description: "Team workspaces & metrics",
    color: "#D29922",
  },
  {
    id: "enterprise-admin",
    label: "Admin Panel",
    icon: ShieldCheck,
    description: "Roles, permissions & flags",
    color: "#F85149",
  },
  {
    id: "enterprise-api-keys",
    label: "API Keys",
    icon: Key,
    description: "API credentials & docs",
    color: "#8957E5",
  },
  {
    id: "enterprise-usage",
    label: "Usage Analytics",
    icon: BarChart2,
    description: "Traffic, latency & bandwidth",
    color: "#2F81F7",
  },
  {
    id: "enterprise-billing",
    label: "Billing",
    icon: CreditCard,
    description: "Plans, invoices & seats",
    color: "#3FB950",
  },
  {
    id: "enterprise-audit",
    label: "Audit Logs",
    icon: FileText,
    description: "Immutable event history",
    color: "#D29922",
  },
  {
    id: "enterprise-security",
    label: "Security",
    icon: Shield,
    description: "2FA, SSO & IP controls",
    color: "#F85149",
  },
  {
    id: "enterprise-integrations",
    label: "Integrations",
    icon: Plug,
    description: "Connect your tools",
    color: "#8957E5",
  },
] as const;

type EnterpriseTabId = (typeof ENTERPRISE_TABS)[number]["id"];

interface EnterpriseHubProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

// ─── Panel renderer ─────────────────────────────────────────────────────────
function renderPanel(tab: string) {
  switch (tab) {
    case "enterprise-dashboard":    return <EnterpriseDashboardPanel />;
    case "enterprise-organizations": return <OrganizationsPanel />;
    case "enterprise-members":      return <MembersPanel />;
    case "enterprise-teams":        return <TeamsPanel />;
    case "enterprise-admin":        return <AdminPanel />;
    case "enterprise-api-keys":     return <ApiKeysPanel />;
    case "enterprise-usage":        return <UsageAnalyticsPanel />;
    case "enterprise-billing":      return <BillingPanel />;
    case "enterprise-audit":        return <AuditLogsPanel />;
    case "enterprise-security":     return <SecurityPanel />;
    case "enterprise-integrations": return <IntegrationsPanel />;
    default:                        return <EnterpriseDashboardPanel />;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function EnterpriseHub({ activeSubTab, setActiveSubTab }: EnterpriseHubProps) {
  const resolvedTab: EnterpriseTabId =
    ENTERPRISE_TABS.find(t => t.id === activeSubTab)?.id ?? "enterprise-dashboard";

  const activeTabMeta = ENTERPRISE_TABS.find(t => t.id === resolvedTab)!;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Enterprise Banner ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-6 pt-6 pb-4 border-b border-[#30363D]"
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "linear-gradient(135deg, #8957E5, #2F81F7)" }}
          >
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#F0F6FC] font-mono tracking-tight">
                Enterprise
              </h1>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-widest"
                style={{
                  background: "linear-gradient(135deg, #8957E522, #2F81F722)",
                  border: "1px solid #8957E550",
                  color: "#8957E5",
                }}
              >
                🏢 Intelligence Platform
              </span>
            </div>
            <p className="text-[11px] text-[#8B949E] font-mono mt-0.5">
              {activeTabMeta.description}
            </p>
          </div>
        </div>

        {/* ── Horizontal sub-tab strip ──────────────────────────────────── */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 scrollbar-thin">
          {ENTERPRISE_TABS.map((tab) => {
            const isActive = tab.id === resolvedTab;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono
                  whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${isActive
                    ? "text-white"
                    : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
                  }
                `}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${tab.color}22, ${tab.color}11)`,
                  border: `1px solid ${tab.color}44`,
                  color: tab.color,
                } : {
                  border: "1px solid transparent",
                }}
              >
                <Icon size={12} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="enterprise-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: tab.color }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Active Panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={resolvedTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {renderPanel(resolvedTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
