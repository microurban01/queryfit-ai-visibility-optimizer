
export type RecommendationCategory = "TITLE_META" | "CONTENT_UPDATE" | "INTERNAL_LINKS" | "TECH_FIX" | "INTENT_MATCH";
export type ExperimentStatus = "draft" | "deployed" | "measuring" | "winner" | "no_change";

export interface GscMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscTrigger {
  type: "LOW_CTR" | "QUICK_WIN" | "RISING" | "MISMATCH";
  query: string;
  page?: string;
  metrics: GscMetrics;
  dateRange: { start: string; end: string };
}

export interface AiRecommendation {
  id: string;
  workspaceId: string;
  trigger: GscTrigger;
  category: RecommendationCategory;
  priority: "High" | "Medium" | "Low";
  confidence: 0 | 25 | 50 | 75 | 100;
  title: string;
  plainWhy: string;
  steps: string[];
  optionalAiActions: {
    canGenerateTitleMeta?: boolean;
    canGenerateContentChecklist?: boolean;
    canGenerateInternalLinks?: boolean;
  };
  estimatedImpact: {
    metric: "clicks" | "ctr";
    rangeLow: number;
    rangeHigh: number;
    timeframeDays: 14 | 28;
    disclaimer: string;
  };
  createdAt: string;
  status: "new" | "saved" | "task_created" | "done" | "dismissed";
}

export interface TitleMetaVariant {
  id: string;
  recommendationId: string;
  title: string;
  meta: string;
  rationale: string;
}

export interface SeoExperiment {
  id: string;
  workspaceId: string;
  type: "TITLE_META" | "CONTENT";
  recommendationId: string;
  query: string;
  pageUrl: string;
  variantChosen?: TitleMetaVariant;
  deployedAt?: string;
  notes?: string;
  baselineMetrics: GscMetrics;
  currentMetrics?: GscMetrics;
  status: ExperimentStatus;
  resultSummary?: string;
}
