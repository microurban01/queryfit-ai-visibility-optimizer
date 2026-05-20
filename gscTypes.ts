
export interface GscConnection {
  isConnected: boolean;
  selectedSiteUrl?: string;
  selectedSiteLabel?: string;
  lastSyncAt?: string;
  tokenStatus: 'none' | 'ok' | 'expired' | 'error';
  accessToken?: string;
  expiresAt?: number;
}

export interface GscQueryRow {
  keys: string[]; // [query, page] usually
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export type OpportunityType = 'LOW_CTR' | 'QUICK_WIN' | 'RISING' | 'MISMATCH';

export interface SeoOpportunity {
  id: string;
  type: OpportunityType;
  query: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  score: number; // 0-100
  why: string;
  recommendedAction: string;
  trackedQuestionId?: string;
  expectedTargetUrl?: string;
  actualTopUrl?: string;
}

export interface SeoOpportunityState {
  datePreset: '7d' | '28d' | '90d';
  searchType: 'web' | 'image' | 'video' | 'news' | 'discover';
  device: 'all' | 'desktop' | 'mobile' | 'tablet';
  country: string; // 'all' or ISO code
  queryContains: string;
  minImpressions: number;
  opportunities: SeoOpportunity[];
  rows: GscQueryRow[]; // Raw data
  isLoading: boolean;
  error?: string;
}
