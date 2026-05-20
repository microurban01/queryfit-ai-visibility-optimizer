
export type PerformanceSource = "field" | "lab";
export type MetricStatus = "good" | "needs_work" | "poor";

export interface CoreWebVitalsMetrics {
  lcp: number; // Largest Contentful Paint (seconds)
  inp: number; // Interaction to Next Paint (milliseconds)
  cls: number; // Cumulative Layout Shift (unitless)
}

export interface CwvSnapshot {
  id: string;
  url: string;
  device: "mobile" | "desktop";
  source: PerformanceSource;
  percentile?: number; // e.g., 75 for field data
  metrics: CoreWebVitalsMetrics;
  status: MetricStatus;
  capturedAt: string;
}

export interface PagePerformanceSummary {
  url: string;
  queryId?: string; // Associated query if applicable
  latestMobile: CwvSnapshot;
  latestDesktop: CwvSnapshot;
  overallStatus: MetricStatus;
  history?: { date: string; mobileScore: number; desktopScore: number }[]; // 0-100 score
  issues: string[]; // Generated task suggestions
}
