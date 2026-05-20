
import { ClarityIntegrationSettings } from './clarityTypes';

export enum PlanTier {
  STARTER = 'STARTER',
  PRO = 'PRO',
  AGENCY = 'AGENCY'
}

export enum Engine {
  CHATGPT = 'CHATGPT',
  CLAUDE = 'CLAUDE',
  GEMINI = 'GEMINI',
  PERPLEXITY = 'PERPLEXITY',
  COPILOT = 'COPILOT'
}

export enum QueryStatus {
  TRACKED = 'TRACKED',
  SUGGESTED = 'SUGGESTED',
  SNOOZED = 'SNOOZED',
  DISMISSED = 'DISMISSED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Market {
  region: string; 
  language: string;
}

export interface Domain {
  id: string;
  url: string;
  is_primary: boolean;
  added_at: string;
}

export interface AutomationSettings {
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  startTime: string;
  strategy: 'all' | 'high' | 'rotation';
}

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  timezone: string;
  plan_tier: PlanTier;
  primary_domain: string; 
  domains: Domain[];
  credits_balance: number;
  credits_limit: number;
  default_market: Market;
  tracked_markets: Market[];
  enabled_engines: Engine[];
  automationEnabled: boolean;
  automationSettings: AutomationSettings;
  autoRefill: boolean;
  claritySettings?: ClarityIntegrationSettings;
}

export interface Backlink {
  id: string;
  source_url: string;
  source_title: string;
  domain_rating: number;
  estimated_traffic: number;
  anchor_text: string;
  discovery_date: string;
  is_ai_cited: boolean;
  contribution_score: number;
}

export interface Competitor {
  id: string;
  workspace_id: string;
  name: string;
  domains: string[];
  variants: string[];
  visibility_score?: number;
  citation_count?: number;
  color?: string;
  logo_url?: string;
  backlinks?: Backlink[];
}

export interface SuggestedCompetitor extends Competitor {
  reason: string;
  mentions_count: number;
}

export interface EngineHealth {
  engine: Engine;
  status: 'ok' | 'missing_key' | 'error';
  errorCode?: string;
}

export interface BlindSpotBadge {
  label: string;
  engine: Engine;
  severity: 'info' | 'warn';
}

export interface OptimizationSolution {
  type: 'content' | 'schema' | 'citation';
  title: string;
  description: string;
  actionSnippet?: string;
  impactScore: number;
}

export interface CitationRank {
  name: string;
  count: number;
  isUser?: boolean;
  color?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export interface EnginePerception {
  label: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  shortSnippet: string;
}

export interface Query {
  id: string;
  workspace_id: string;
  text: string;
  market: Market;
  status: QueryStatus;
  priority: Priority;
  tags: string[];
  source: 'user' | 'ai';
  targetUrl?: string;
  overall_score: number;
  engine_scores: Record<Engine, number>;
  engine_perceptions: Record<Engine, EnginePerception>;
  competitor_engine_scores: Record<string, Record<Engine, number>>;
  delta_7d: number;
  lastScannedAt: string;
  engineHealth: EngineHealth[];
  citations: { 
    you: number; 
    leader: number; 
    topCitedDomain?: string; 
  };
  citationLeaderboard?: CitationRank[];
  leaderScore: number;
  leaderName: string;
  reasonSummary: string;
  nextBestAction: { 
    taskId?: string; 
    title: string; 
    effort: '5 min' | '15 min' | '30 min'; 
    impact: 'High' | 'Med' | 'Low'; 
  };
  volatilityLabel: 'Stable' | 'Changing' | 'Unstable';
  blindSpotBadges: BlindSpotBadge[];
  solutions?: OptimizationSolution[];
}

export interface SuggestedQuery extends Query {
  reason: string;
  surge: number;
}

export interface Task {
  id: string;
  workspace_id: string;
  query_id: string;
  title: string;
  steps: string[];
  impact: 'S' | 'M' | 'L';
  effort: 'S' | 'M' | 'L';
  status: 'todo' | 'doing' | 'done';
  generatedFixContent?: string;
  recommendationId?: string;
  opportunityId?: string;
  baselineSnapshotId?: string;
  latestSnapshotId?: string;
}

export interface Metrics {
  overallVisibilityIndex: number;
  delta: number;
  mentionsRate: number;
  mentionsDelta: number;
  citationsCount: number;
  citationsDelta: number;
  volatility: 'stable' | 'changing' | 'highly-volatile';
  engineAverages: Record<Engine, number>;
  credits_used_today: number;
  marketShare: { id: string; name: string; value: number; color: string; }[];
  availableMarkets: string[];
}

export interface ScanResult {
  score: number;
  mention_present: boolean;
  citation_present: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface GeoAlert {
  id: string;
  title: string;
  type: 'sentiment' | 'misinformation' | 'citation' | 'blocking' | 'competitor';
  description: string;
  severity: 'critical' | 'warning' | 'info';
  engine: string;
  action: string;
  timestamp?: string;
  confidence?: 'high' | 'medium' | 'low';
  evidence?: string;
  entityId?: string;
  targetView?: string;
}

export interface IntegrationSettings {
  gsc: { status: "disconnected" | "connected"; connectedAt?: string; propertyUrl?: string; note?: string };
  ga4: { status: "disconnected" | "connected"; connectedAt?: string; propertyId?: string; note?: string };
  youtube?: { status: "disconnected" | "connected"; apiKey?: string };
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
  impactScore: number;
  effortScore: number;
  confidenceScore: number;
  priorityScore: number;
  steps: string[];
  status: "new" | "in_progress" | "done" | "dismissed";
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  thumbnail: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  thumbnailUrl: string;
  publishedAt: string;
  country?: string;
  defaultLanguage?: string;
  keywords: string[];
  topicCategories: string[];
  uploadsPlaylistId?: string;
  madeForKids?: boolean;
  email?: string;
  socialLinks?: { platform: string; url: string }[];
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
    hiddenSubscriberCount: boolean;
  };
}

export interface InfluencerReport {
  error: boolean;
  profile: {
    userId: string;
    profile: {
      userId: string;
      fullname: string;
      username: string;
      url: string;
      picture: string;
      followers: number;
      engagements: number;
      engagementRate: number;
      averageViews: number;
      handle: string;
      city: string;
      state: string;
      gender: string;
      country: string;
      language?: string;
      ageGroup: string;
      isVerified: boolean;
      postsCount: number;
      totalViews: number;
      description: string;
      interests: string[];
    };
    contacts: { value: string; type: string }[];
    audience: {
      notable: number;
      genders: { code: string; weight: number }[];
      geoCountries: { name: string; code: string; weight: number }[];
      ages: { code: string; weight: number }[];
      languages: { name: string; code: string; weight: number }[];
      gendersPerAge?: { male: number; female: number }[];
      notableUsers?: any[];
      audienceLookalikes?: any[];
    };
    statsByContentType?: {
      all: {
        engagements: number;
        engagementRate: number;
        avgLikes: number;
        avgComments: number;
        statHistory: {
          month: string;
          avgEngagements: number;
          avgViews: number;
          avgShares: number;
          avgSaves: number;
        }[];
        avgPosts4weeks: number;
      };
      videos?: any;
      shorts?: any;
      streams?: any;
    };
    recentPosts: {
      id: string;
      text: string;
      url: string;
      created: string;
      likes: number;
      comments: number;
      views: number;
      type: string;
      video?: string;
      thumbnail: string;
      title: string;
    }[];
    popularPosts: any[];
    sponsoredPosts: {
      sponsors: { domain: string; logo_url: string }[];
      paidPostPerformance: number;
      paidPostPerformanceViews: number;
      sponsoredPostsMedianViews: number;
      sponsoredPostsMedianLikes: number;
      nonSponsoredPostsMedianViews: number;
      nonSponsoredPostsMedianLikes: number;
    }[];
    audienceExtra?: {
        followersRange?: { leftNumber: number; rightNumber: number };
        engagementRateDistribution?: { min: number; max: number; total: number; median: boolean }[];
    };
    lookalikesByTopics?: any[];
    audienceCommenters?: any;
  };
}

export interface AudienceOverlapReport {
  error: boolean;
  reportInfo: {
    totalFollowers: number;
    totalUniqueFollowers: number;
  };
  data: {
    userId: string;
    username: string;
    followers: number;
    uniquePercentage: number;
    overlappingPercentage: number;
  }[];
}

export interface YouTubeUser {
  userId: string;
  username: string;
  fullname: string;
  picture: string;
  followers: number;
  isVerified: boolean;
  handle: string;
}
