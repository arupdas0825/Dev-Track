// ============================================================
// DevTrack Enterprise — TypeScript Type Definitions
// ============================================================

export type OrgRole =
  | "owner"
  | "admin"
  | "manager"
  | "recruiter"
  | "hr"
  | "developer"
  | "viewer"
  | "custom";

export type SubscriptionPlan = "free" | "pro" | "team" | "enterprise";

export type ApiKeyType = "read" | "write" | "temporary" | "production" | "sandbox";

export type ApiKeyStatus = "active" | "expired" | "revoked";

export type AuditEventType =
  | "login"
  | "logout"
  | "api_call"
  | "role_change"
  | "billing_change"
  | "repo_sync"
  | "workspace_update"
  | "security_event"
  | "member_invite"
  | "member_remove"
  | "key_generated"
  | "key_revoked"
  | "org_created"
  | "team_created"
  | "permission_change"
  | "integration_connect"
  | "integration_disconnect";

export type AuditSeverity = "info" | "warning" | "critical";

export type IntegrationStatus = "connected" | "available" | "coming_soon";

export type IntegrationCategory = "vcs" | "communication" | "project" | "hosting" | "cloud";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  brandColor: string;
  domain: string;
  workspace: string;
  timezone: string;
  plan: SubscriptionPlan;
  memberCount: number;
  teamCount: number;
  repoCount: number;
  healthScore: number;
  avgGrade: string;
  monthlyActivity: number;
  openSourceContributions: number;
  createdAt: string;
  ownerId: string;
  isVerified: boolean;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  role: OrgRole;
  customRoleLabel?: string;
  teams: string[];
  joinedAt: string;
  lastActive: string;
  grade: string;
  score: number;
  contributions: number;
  status: "active" | "suspended" | "pending";
  twoFAEnabled: boolean;
}

export interface OrgTeam {
  id: string;
  orgId: string;
  name: string;
  description: string;
  leadId: string;
  leadName: string;
  leadAvatar: string;
  members: string[];
  memberCount: number;
  repos: string[];
  velocity: number;
  velocityTrend: "up" | "down" | "stable";
  sprintMetrics: SprintMetrics;
  avgGrade: string;
  healthScore: number;
  createdAt: string;
  color: string;
}

export interface SprintMetrics {
  sprintName: string;
  startDate: string;
  endDate: string;
  plannedPoints: number;
  completedPoints: number;
  velocity: number;
  burndown: { day: string; remaining: number; ideal: number }[];
  topContributors: { name: string; avatar: string; commits: number }[];
}

export interface ApiKey {
  id: string;
  orgId: string;
  name: string;
  type: ApiKeyType;
  prefix: string;        // e.g. "dtk_prod_"
  maskedKey: string;     // e.g. "dtk_prod_****abc123"
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  usageCount: number;
  status: ApiKeyStatus;
  permissions: string[];
  createdBy: string;
  environment: "production" | "sandbox";
  dailyUsage: { date: string; requests: number }[];
}

export interface AuditLog {
  id: string;
  orgId: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  actor: string;
  actorAvatar: string;
  actorRole: OrgRole;
  target: string;
  description: string;
  metadata: Record<string, string | number | boolean>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  sessionId: string;
}

export interface BillingPlan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  seats: number | null;
  features: string[];
  apiCallsPerMonth: number | null;
  storageGB: number;
  supportLevel: "community" | "email" | "priority" | "dedicated";
  isPopular: boolean;
}

export interface Invoice {
  id: string;
  orgId: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  description: string;
  invoiceDate: string;
  dueDate: string;
  pdfUrl: string;
  seats: number;
  plan: SubscriptionPlan;
}

export interface OrgBilling {
  orgId: string;
  currentPlan: SubscriptionPlan;
  seatCount: number;
  seatUsed: number;
  apiCallsUsed: number;
  apiCallsLimit: number | null;
  storageUsedGB: number;
  storageLimitGB: number;
  renewalDate: string;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  invoices: Invoice[];
  couponCode?: string;
  discountPct?: number;
  taxRate?: number;
  taxLabel?: string;
}

export interface UsageMetrics {
  orgId: string;
  dailyRequests: { date: string; requests: number; errors: number }[];
  monthlyRequests: { month: string; requests: number }[];
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  successRate: number;
  errorRate: number;
  bandwidthGB: number;
  storageGB: number;
  topEndpoints: {
    path: string;
    method: string;
    calls: number;
    avgLatencyMs: number;
    errorRate: number;
  }[];
  topUsers: {
    username: string;
    avatar: string;
    requests: number;
    lastActive: string;
  }[];
  regionalUsage: {
    region: string;
    countryCode: string;
    requests: number;
    lat: number;
    lng: number;
  }[];
  realtimeRps: number;
}

export interface SecuritySettings {
  orgId: string;
  securityScore: number;
  twoFAEnforced: boolean;
  twoFAEnrollmentRate: number;
  ssoEnabled: boolean;
  ssoProvider: "saml" | "oidc" | "none";
  ssoEndpoint: string;
  oauthApps: OAuthApp[];
  activeSessions: ActiveSession[];
  trustedDevices: TrustedDevice[];
  ipWhitelist: string[];
  securityAlerts: SecurityAlert[];
}

export interface OAuthApp {
  id: string;
  name: string;
  clientId: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
}

export interface ActiveSession {
  id: string;
  userId: string;
  username: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  lastSeen: string;
  isCurrent: boolean;
}

export interface TrustedDevice {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  addedAt: string;
  lastUsed: string;
}

export interface SecurityAlert {
  id: string;
  type: "failed_login" | "new_device" | "ip_violation" | "suspicious_api" | "token_abuse";
  severity: AuditSeverity;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logoChar: string;        // Emoji or letter for logo placeholder
  logoColor: string;
  status: IntegrationStatus;
  connectedAt?: string;
  webhookUrl?: string;
  scopes?: string[];
  lastSync?: string;
  eventCount?: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: "production" | "staging" | "development" | "all";
  rolloutPct: number;
  createdAt: string;
  updatedBy: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "outage";
  cpuUsagePct: number;
  memoryUsagePct: number;
  avgLatencyMs: number;
  uptimePct: number;
  activeConnections: number;
  queueDepth: number;
  services: {
    name: string;
    status: "up" | "degraded" | "down";
    latencyMs: number;
    uptime: number;
  }[];
  incidents: {
    id: string;
    title: string;
    severity: AuditSeverity;
    startedAt: string;
    resolvedAt?: string;
    status: "investigating" | "identified" | "monitoring" | "resolved";
  }[];
}

export interface EnterpriseDashboardStats {
  orgCount: number;
  activeUsers: number;
  totalRepositories: number;
  monthlyActivity: number;
  developerHealthScore: number;
  avgGrade: string;
  openSourceContributions: number;
  apiMonthlyRequests: number;
  storageGB: number;
  bandwidthGB: number;
  teamVelocity: number;
  deploymentStatus: "passing" | "partial" | "failing";
  velocityHistory: { week: string; velocity: number }[];
  activityHistory: { date: string; commits: number; prs: number; reviews: number }[];
}

export interface Permission {
  resource: string;
  actions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
  };
}

export interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  description: string;
  isCustom: boolean;
  permissions: Permission[];
  memberCount: number;
  color: string;
}
