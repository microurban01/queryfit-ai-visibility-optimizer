
export interface IntegrationSettings {
  gsc: { status: "disconnected" | "connected"; connectedAt?: string; propertyUrl?: string; note?: string };
  ga4: { status: "disconnected" | "connected"; connectedAt?: string; propertyId?: string; note?: string };
}

export interface MetricsSnapshot {
  id: string;
  workspaceId: string;
  queryId: string;
  opportunityId?: string;
  taskId?: string;
  pageUrl?: string;
  source: "baseline" | "latest";
  capturedAt: string;
  gsc?: { clicks: number; impressions: number; ctr: number; position: number };
  ga4?: { sessions: number; engagedSessions: number; conversions: number };
}

export interface Recommendation {
  id: string;
  workspaceId: string;
  queryId: string;
  opportunityId?: string;
  type: "content" | "technical" | "links" | "pr" | "influencer" | "affiliate" | "cro";
  title: string;
  why: string;
  evidence: { label: string; value: string; source: "gsc" | "ga4" | "scan" | "manual" }[];
  impactScore: number; // 0-100
  effortScore: number; // 0-100
  confidenceScore: number; // 0-100
  priorityScore: number;
  steps: string[];
  status: "new" | "in_progress" | "done" | "dismissed";
  createdAt: string;
  updatedAt: string;
}
