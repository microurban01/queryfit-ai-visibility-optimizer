
import { 
  Workspace, Metrics, Query, Task, Competitor, SuggestedCompetitor, 
  Market, Domain, PlanTier, Engine, AutomationSettings, 
  GeoAlert, IntegrationSettings, MetricsSnapshot, 
  Priority, QueryStatus, Recommendation, EngineHealth, 
  BlindSpotBadge, OptimizationSolution, SuggestedQuery 
} from '../types';
import { ClarityIntegrationSettings } from '../clarityTypes';
import { GscConnection, SeoOpportunity, GscQueryRow } from '../gscTypes';
import { PagePerformanceSummary } from '../types/performanceTypes';
import { FixPack, FixVariant } from '../types/contentFixTypes';
import { AiRecommendation, TitleMetaVariant, SeoExperiment } from '../types/gscRecommendationsTypes';
import { GscRecommendationEngine } from './gscRecommendationEngine';
import { SeoOpportunityEngine } from './seoOpportunityEngine';

export interface PulseEvent {
  id: string;
  type: 'score_drop' | 'competitor_gain' | 'scan_complete' | 'credit_low' | 'engine_error' | 'new_opportunity';
  title: string;
  description: string;
  timestamp: string;
}

class MockDataService {
  private workspace: Workspace;
  private queries: Query[];
  private suggestedQueries: SuggestedQuery[];
  private competitors: Competitor[];
  private suggestedCompetitors: SuggestedCompetitor[];
  private tasks: Task[];
  private gscConnection: GscConnection;
  private snapshots: MetricsSnapshot[];
  private recommendations: AiRecommendation[];
  private experiments: SeoExperiment[];
  private integrationSettings: IntegrationSettings;

  constructor() {
    this.workspace = {
      id: 'ws-default',
      name: 'TechFlow',
      industry: 'SaaS',
      timezone: 'UTC',
      plan_tier: PlanTier.PRO,
      primary_domain: 'techflow.ai',
      domains: [
        { id: 'd1', url: 'techflow.ai', is_primary: true, added_at: '2023-01-01' },
        { id: 'd2', url: 'docs.techflow.ai', is_primary: false, added_at: '2023-02-15' }
      ],
      credits_balance: 8450,
      credits_limit: 10000,
      default_market: { region: 'US', language: 'en' },
      tracked_markets: [{ region: 'US', language: 'en' }, { region: 'GB', language: 'en' }],
      enabled_engines: [Engine.CHATGPT, Engine.CLAUDE, Engine.GEMINI, Engine.PERPLEXITY, Engine.COPILOT],
      automationEnabled: true,
      automationSettings: { frequency: 'Daily', startTime: '09:00', strategy: 'all' },
      autoRefill: false
    };

    this.queries = this.generateMockQueries();
    this.suggestedQueries = this.generateMockSuggestedQueries();
    this.competitors = this.generateMockCompetitors();
    this.suggestedCompetitors = this.generateMockSuggestedCompetitors();
    this.tasks = this.generateMockTasks();
    this.gscConnection = { isConnected: false, tokenStatus: 'none' };
    this.snapshots = this.generateMockSnapshots();
    this.recommendations = [];
    
    // Initialize mock experiments
    this.experiments = [
      {
        id: 'exp-1',
        workspaceId: 'ws-default',
        type: 'TITLE_META',
        recommendationId: 'rec-1',
        query: 'marketing agency crm',
        pageUrl: 'https://techflow.ai/agency',
        variantChosen: {
          id: 'v1',
          recommendationId: 'rec-1',
          title: 'Best CRM for Marketing Agencies (2024 Review)',
          meta: 'Streamline your agency workflows with TechFlow. The #1 rated CRM for creative teams.',
          rationale: 'Focus on year and authority.'
        },
        deployedAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        baselineMetrics: { clicks: 120, impressions: 4500, ctr: 0.026, position: 12.5 },
        currentMetrics: { clicks: 142, impressions: 4650, ctr: 0.030, position: 11.2 },
        status: 'measuring'
      },
      {
        id: 'exp-2',
        workspaceId: 'ws-default',
        type: 'CONTENT',
        recommendationId: 'rec-2',
        query: 'best crm for startups',
        pageUrl: 'https://techflow.ai/startups',
        notes: 'Added comparison table vs HubSpot.',
        deployedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        baselineMetrics: { clicks: 50, impressions: 2000, ctr: 0.025, position: 8.0 },
        currentMetrics: { clicks: 85, impressions: 2200, ctr: 0.038, position: 4.2 },
        status: 'winner',
        resultSummary: 'Significant lift in CTR and Position after adding feature comparison.'
      },
      {
        id: 'exp-3',
        workspaceId: 'ws-default',
        type: 'TITLE_META',
        recommendationId: 'rec-3',
        query: 'automated workflows',
        pageUrl: 'https://techflow.ai/features/automation',
        variantChosen: {
            id: 'v2',
            recommendationId: 'rec-3',
            title: 'Automate Business Logic | TechFlow',
            meta: 'Save time with our automation engine.',
            rationale: 'Short and punchy.'
        },
        deployedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        baselineMetrics: { clicks: 200, impressions: 10000, ctr: 0.020, position: 5.5 },
        currentMetrics: { clicks: 198, impressions: 10050, ctr: 0.019, position: 5.6 },
        status: 'no_change',
        resultSummary: 'No statistically significant impact observed.'
      }
    ];

    // Initialize ALL keys safely
    this.integrationSettings = {
      gsc: { status: 'disconnected' },
      ga4: { status: 'disconnected' },
      youtube: { status: 'disconnected', apiKey: '' }
    };
  }

  // --- Data Generation Helpers ---

  private generateMockQueries(): Query[] {
    return [
      {
        id: 'q1',
        workspace_id: 'ws-default',
        text: 'Best CRM for small marketing agencies',
        market: { region: 'US', language: 'en' },
        status: QueryStatus.TRACKED,
        priority: Priority.HIGH,
        tags: ['Commercial', 'CRM'],
        source: 'user',
        overall_score: 72,
        engine_scores: { [Engine.CHATGPT]: 85, [Engine.CLAUDE]: 60, [Engine.GEMINI]: 75, [Engine.PERPLEXITY]: 90, [Engine.COPILOT]: 50 },
        engine_perceptions: {
          [Engine.CHATGPT]: { label: 'Top Contender', sentiment: 'positive', shortSnippet: 'TechFlow is frequently mentioned as a top CRM choice.' },
          [Engine.CLAUDE]: { label: 'Notable', sentiment: 'neutral', shortSnippet: 'Ideally suited for small teams, though integration depth varies.' },
          [Engine.GEMINI]: { label: 'Leader', sentiment: 'positive', shortSnippet: 'TechFlow offers robust automation features.' },
          [Engine.PERPLEXITY]: { label: 'Leader', sentiment: 'positive', shortSnippet: 'TechFlow is a leading CRM for agencies.' },
          [Engine.COPILOT]: { label: 'Mentioned', sentiment: 'neutral', shortSnippet: 'Consider TechFlow for budget-friendly options.' }
        },
        competitor_engine_scores: {},
        delta_7d: 5,
        lastScannedAt: new Date().toISOString(),
        engineHealth: [{ engine: Engine.COPILOT, status: 'missing_key' }],
        citations: { you: 12, leader: 15, topCitedDomain: 'g2.com' },
        citationLeaderboard: [
          { name: 'LogicStream', count: 15, isUser: false },
          { name: 'You (TechFlow)', count: 12, isUser: true, color: '#8b5cf6' },
          { name: 'FluxDesk', count: 8, isUser: false }
        ],
        leaderScore: 78,
        leaderName: 'LogicStream',
        reasonSummary: 'Strong feature recognition but lacking G2 reviews compared to leader.',
        nextBestAction: { title: 'Get listed on "Best CRMs 2024" by G2', effort: '30 min', impact: 'High' },
        volatilityLabel: 'Stable',
        blindSpotBadges: [{ label: 'Missing Pricing', engine: Engine.COPILOT, severity: 'warn' }],
        targetUrl: 'https://techflow.ai/agency-crm'
      },
      {
        id: 'q2',
        workspace_id: 'ws-default',
        text: 'TechFlow vs LogicStream pricing',
        market: { region: 'US', language: 'en' },
        status: QueryStatus.TRACKED,
        priority: Priority.MEDIUM,
        tags: ['Comparison', 'Pricing'],
        source: 'user',
        overall_score: 45,
        engine_scores: { [Engine.CHATGPT]: 50, [Engine.CLAUDE]: 40, [Engine.GEMINI]: 45, [Engine.PERPLEXITY]: 55, [Engine.COPILOT]: 35 },
        engine_perceptions: {
            [Engine.CHATGPT]: { label: 'Mentioned', sentiment: 'neutral', shortSnippet: 'Pricing details are sparse compared to LogicStream.' },
            [Engine.CLAUDE]: { label: 'Mentioned', sentiment: 'neutral', shortSnippet: 'LogicStream offers transparent pricing.' },
            [Engine.GEMINI]: { label: 'Mentioned', sentiment: 'neutral', shortSnippet: 'TechFlow pricing is custom quote based.' },
            [Engine.PERPLEXITY]: { label: 'Mentioned', sentiment: 'neutral', shortSnippet: 'Hard to compare directly without contacting sales.' },
            [Engine.COPILOT]: { label: 'Mentioned', sentiment: 'negative', shortSnippet: 'Pricing page not found.' }
        },
        competitor_engine_scores: {},
        delta_7d: -2,
        lastScannedAt: new Date(Date.now() - 86400000).toISOString(),
        engineHealth: [],
        citations: { you: 3, leader: 12 },
        leaderScore: 88,
        leaderName: 'LogicStream',
        reasonSummary: 'Pricing transparency is low; AI models prefer competitor\'s public pricing page.',
        nextBestAction: { title: 'Publish public pricing page', effort: '15 min', impact: 'High' },
        volatilityLabel: 'Changing',
        blindSpotBadges: []
      }
    ];
  }

  private generateMockSuggestedQueries(): SuggestedQuery[] {
    return [
      {
        id: 'sq1',
        workspace_id: 'ws-default',
        text: 'Automated workflow CRM for agencies',
        market: { region: 'US', language: 'en' },
        status: QueryStatus.SUGGESTED,
        priority: Priority.MEDIUM,
        tags: ['Features'],
        source: 'ai',
        overall_score: 0,
        engine_scores: { [Engine.CHATGPT]: 0, [Engine.CLAUDE]: 0, [Engine.GEMINI]: 0, [Engine.PERPLEXITY]: 0, [Engine.COPILOT]: 0 },
        engine_perceptions: {} as any,
        competitor_engine_scores: {},
        delta_7d: 0,
        lastScannedAt: '',
        engineHealth: [],
        citations: { you: 0, leader: 8 },
        leaderScore: 65,
        leaderName: 'FluxDesk',
        reasonSummary: 'Rising trend in agency searches.',
        nextBestAction: { title: 'Create content', effort: '30 min', impact: 'Med' },
        volatilityLabel: 'Stable',
        blindSpotBadges: [],
        reason: 'High volume query where your competitor FluxDesk is dominating.',
        surge: 24
      }
    ];
  }

  private generateMockCompetitors(): Competitor[] {
    return [
      {
        id: 'c1',
        workspace_id: 'ws-default',
        name: 'LogicStream',
        domains: ['logicstream.io'],
        variants: ['Logic Stream', 'LogicStream CRM'],
        visibility_score: 78,
        citation_count: 142,
        backlinks: [
          { id: 'b1', source_url: 'https://g2.com/products/logicstream', source_title: 'G2 Reviews', domain_rating: 90, estimated_traffic: 50000, anchor_text: 'Best CRM', discovery_date: '2023-10-01', is_ai_cited: true, contribution_score: 95 },
          { id: 'b2', source_url: 'https://techcrunch.com/logicstream-funding', source_title: 'TechCrunch', domain_rating: 92, estimated_traffic: 120000, anchor_text: 'LogicStream raises Series B', discovery_date: '2023-11-15', is_ai_cited: true, contribution_score: 88 }
        ]
      },
      {
        id: 'c2',
        workspace_id: 'ws-default',
        name: 'FluxDesk',
        domains: ['fluxdesk.com'],
        variants: ['Flux Desk'],
        visibility_score: 55,
        citation_count: 89
      }
    ];
  }

  private generateMockSuggestedCompetitors(): SuggestedCompetitor[] {
    return [
      {
        id: 'sc1',
        workspace_id: 'ws-default',
        name: 'PipeDrive',
        domains: ['pipedrive.com'],
        variants: [],
        reason: 'Frequently appears in "Best CRM" lists alongside you.',
        mentions_count: 450
      }
    ];
  }

  private generateMockTasks(): Task[] {
    return [
      {
        id: 't1',
        workspace_id: 'ws-default',
        query_id: 'q1',
        title: 'Fix Missing Pricing on Copilot',
        steps: ['Add pricing schema to landing page', 'Submit URL to Bing Webmaster Tools'],
        impact: 'L',
        effort: 'S',
        status: 'todo'
      },
      {
        id: 't2',
        workspace_id: 'ws-default',
        query_id: 'q2',
        title: 'Update G2 Profile',
        steps: ['Update feature list on G2', 'Ask for 5 new reviews'],
        impact: 'M',
        effort: 'M',
        status: 'doing'
      }
    ];
  }

  private generateMockSnapshots(): MetricsSnapshot[] {
    // Generate baseline/latest pairs for queries
    return [
      {
        id: 'snap-1-base',
        workspaceId: 'ws-default',
        queryId: 'q1',
        source: 'baseline',
        capturedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        gsc: { clicks: 120, impressions: 4500, ctr: 0.026, position: 12.5 },
        ga4: { sessions: 150, engagedSessions: 80, conversions: 2 }
      },
      {
        id: 'snap-1-latest',
        workspaceId: 'ws-default',
        queryId: 'q1',
        source: 'latest',
        capturedAt: new Date().toISOString(),
        gsc: { clicks: 185, impressions: 5200, ctr: 0.035, position: 8.2 },
        ga4: { sessions: 210, engagedSessions: 120, conversions: 5 }
      }
    ];
  }

  // --- Public API Methods ---

  getWorkspace() { return this.workspace; }
  getQueries() { return this.queries; }
  getSuggestedQueries() { return this.suggestedQueries; }
  getCompetitors() { return this.competitors; }
  getSuggestedCompetitors() { return this.suggestedCompetitors; }
  getTasks() { return this.tasks; }
  getSnapshots(id: string) { return this.snapshots; }
  getIntegrationSettings(id: string) { return this.integrationSettings; }

  getMetrics(domainId?: string): Metrics {
    return {
      overallVisibilityIndex: 72,
      delta: 5,
      mentionsRate: 45,
      mentionsDelta: 12,
      citationsCount: 158,
      citationsDelta: 8,
      volatility: 'stable',
      engineAverages: { 
        [Engine.CHATGPT]: 78, 
        [Engine.CLAUDE]: 65, 
        [Engine.GEMINI]: 72, 
        [Engine.PERPLEXITY]: 82, 
        [Engine.COPILOT]: 55 
      },
      credits_used_today: 45,
      marketShare: [
        { id: 'you', name: 'You', value: 72, color: '#8b5cf6' },
        { id: 'c1', name: 'LogicStream', value: 78, color: '#f43f5e' },
        { id: 'c2', name: 'FluxDesk', value: 55, color: '#10b981' }
      ],
      availableMarkets: ['US', 'GB']
    };
  }

  getHistoryData(days: number) {
    return Array.from({ length: days }).map((_, i) => ({
      day: new Date(Date.now() - (days - 1 - i) * 86400000).toLocaleDateString(),
      score: 60 + Math.floor(Math.random() * 20)
    }));
  }

  getPulseFeed(): PulseEvent[] {
    return [
      { id: 'e1', type: 'score_drop', title: 'Gemini Visibility Dip', description: 'Score dropped by 5% for "Enterprise CRM"', timestamp: '2h ago' },
      { id: 'e2', type: 'new_opportunity', title: 'New Question Detected', description: 'High surge for "CRM with AI automation"', timestamp: '5h ago' },
      { id: 'e3', type: 'scan_complete', title: 'Daily Scan Complete', description: 'Updated metrics for 52 queries', timestamp: '1d ago' }
    ];
  }

  getGeoAlerts(): GeoAlert[] {
    return [
      {
        id: 'ga1',
        title: 'Negative Sentiment Shift',
        type: 'sentiment',
        description: 'Claude is generating answers with a "Complex Setup" caveat for your brand.',
        severity: 'warning',
        engine: 'Claude',
        action: 'Review Docs',
        confidence: 'high',
        evidence: 'Snippet: "TechFlow is powerful but noted for complex initial configuration."',
        entityId: 'q1',
        targetView: 'evidence:CLAUDE'
      },
      {
        id: 'ga2',
        title: 'Competitor Citation Gain',
        type: 'competitor',
        description: 'LogicStream gained a new high-authority citation on TechCrunch.',
        severity: 'info',
        engine: 'Perplexity',
        action: 'View Source',
        confidence: 'medium',
        entityId: 'c1',
        targetView: 'backlinks'
      }
    ];
  }

  // --- Actions ---

  addQuery(text: string, market?: Market) {
    const newQ: Query = {
      id: `q-${Date.now()}`,
      workspace_id: this.workspace.id,
      text,
      market: market || { region: 'US', language: 'en' },
      status: QueryStatus.TRACKED,
      priority: Priority.MEDIUM,
      tags: [],
      source: 'user',
      overall_score: 0,
      engine_scores: { [Engine.CHATGPT]: 0, [Engine.CLAUDE]: 0, [Engine.GEMINI]: 0, [Engine.PERPLEXITY]: 0, [Engine.COPILOT]: 0 },
      engine_perceptions: {} as any,
      competitor_engine_scores: {},
      delta_7d: 0,
      lastScannedAt: new Date().toISOString(),
      engineHealth: [],
      citations: { you: 0, leader: 0 },
      leaderScore: 0,
      leaderName: 'Unknown',
      reasonSummary: 'New query initialized.',
      nextBestAction: { title: 'Initial Scan', effort: '5 min', impact: 'High' },
      volatilityLabel: 'Stable',
      blindSpotBadges: []
    };
    this.queries.push(newQ);
  }

  removeSuggestedQuery(id: string) {
    this.suggestedQueries = this.suggestedQueries.filter(q => q.id !== id);
  }

  addCompetitor(name: string, domain: string) {
    this.competitors.push({
      id: `c-${Date.now()}`,
      workspace_id: this.workspace.id,
      name,
      domains: [domain],
      variants: [],
      visibility_score: 0,
      citation_count: 0
    });
  }

  addDomain(url: string) {
    this.workspace.domains.push({ id: `d-${Date.now()}`, url, is_primary: false, added_at: new Date().toISOString() });
  }

  deleteDomain(id: string) {
    this.workspace.domains = this.workspace.domains.filter(d => d.id !== id);
  }

  setPrimaryDomain(id: string) {
    this.workspace.domains = this.workspace.domains.map(d => ({ ...d, is_primary: d.id === id }));
    const primary = this.workspace.domains.find(d => d.is_primary);
    if (primary) this.workspace.primary_domain = primary.url;
  }

  addTrackedMarket(m: Market) {
    this.workspace.tracked_markets.push(m);
  }

  removeTrackedMarket(region: string, language: string) {
    this.workspace.tracked_markets = this.workspace.tracked_markets.filter(m => !(m.region === region && m.language === language));
  }

  topUpCredits(amount: number) {
    this.workspace.credits_balance += amount;
  }

  deductCredits(amount: number) {
    this.workspace.credits_balance = Math.max(0, this.workspace.credits_balance - amount);
  }

  setPlanTier(tier: PlanTier) {
    this.workspace.plan_tier = tier;
  }

  toggleWorkspaceEngine(e: Engine) {
    if (this.workspace.enabled_engines.includes(e)) {
      this.workspace.enabled_engines = this.workspace.enabled_engines.filter(eng => eng !== e);
    } else {
      this.workspace.enabled_engines.push(e);
    }
  }

  setAutomation(enabled: boolean) {
    this.workspace.automationEnabled = enabled;
  }

  updateAutomationSettings(settings: AutomationSettings) {
    this.workspace.automationSettings = settings;
  }

  setAutoRefill(enabled: boolean) {
    this.workspace.autoRefill = enabled;
  }

  updateClaritySettings(s: ClarityIntegrationSettings) {
    this.workspace.claritySettings = s;
  }

  disconnectClarity() {
    this.workspace.claritySettings = undefined;
  }

  // --- GSC & SEO ---

  setGscConnection(conn: Partial<GscConnection>) {
    this.gscConnection = { ...this.gscConnection, ...conn };
  }

  getGscConnection() {
    return this.gscConnection;
  }

  generateGscMockData(siteUrl: string, queries: Query[]) {
    // Generate mock rows
    const rows: GscQueryRow[] = queries.map((q, i) => ({
      keys: [q.text, q.targetUrl || `https://${siteUrl}/page-${i}`],
      clicks: Math.floor(Math.random() * 500),
      impressions: Math.floor(Math.random() * 5000),
      ctr: Math.random() * 0.1,
      position: Math.random() * 20 + 1
    }));

    // Analyze using the engine
    const opportunities = SeoOpportunityEngine.analyze(rows, queries, 100);
    return { rows, opportunities };
  }

  getGscRecommendations(): AiRecommendation[] {
    // If no real data, generate fake recommendations
    if (this.recommendations.length === 0) {
      const mockOpps: SeoOpportunity[] = [
        {
          id: 'opp-1', type: 'LOW_CTR', query: 'enterprise crm solutions', page: 'https://techflow.ai/enterprise',
          clicks: 120, impressions: 8500, ctr: 0.014, position: 8.5, score: 85,
          why: 'High visibility but low engagement.', recommendedAction: 'Update metadata.'
        },
        {
          id: 'opp-2', type: 'QUICK_WIN', query: 'marketing agency crm', page: 'https://techflow.ai/agency',
          clicks: 450, impressions: 3200, ctr: 0.14, position: 5.2, score: 78,
          why: 'Ranking #5, close to top 3.', recommendedAction: 'Add content depth.'
        }
      ];
      this.recommendations = GscRecommendationEngine.generate(mockOpps, this.workspace.id);
    }
    return this.recommendations;
  }

  saveRecommendationStatus(id: string, status: string) {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) rec.status = status as any;
  }

  addTask(task: Task) {
    this.tasks.push(task);
  }

  deleteTask(id: string) {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  createTaskFromFix(workspaceId: string, queryId: string, url: string, auditItemId: string, variant: FixVariant) {
    const task: Task = {
      id: `task-fix-${Date.now()}`,
      workspace_id: workspaceId,
      query_id: queryId || 'q1', // Default or find relevant
      title: `Apply Fix: ${variant.title}`,
      steps: [
        `Locate ${variant.whereToPaste}`,
        `Replace content with generated variant for "${variant.keyword}"`,
        `Verify update`
      ],
      impact: 'M',
      effort: 'S',
      status: 'todo',
      generatedFixContent: variant.content
    };
    this.tasks.push(task);
    return task;
  }

  // --- Performance ---

  getTopPerformancePages() {
    return this.listTopPerformancePages(this.workspace.id);
  }

  listTopPerformancePages(workspaceId: string): PagePerformanceSummary[] {
    return [
      {
        url: 'https://techflow.ai/pricing',
        latestMobile: { id: 's1', url: 'https://techflow.ai/pricing', device: 'mobile', source: 'field', metrics: { lcp: 2.8, inp: 150, cls: 0.05 }, status: 'needs_work', capturedAt: new Date().toISOString() },
        latestDesktop: { id: 's2', url: 'https://techflow.ai/pricing', device: 'desktop', source: 'field', metrics: { lcp: 1.2, inp: 40, cls: 0.0 }, status: 'good', capturedAt: new Date().toISOString() },
        overallStatus: 'needs_work',
        issues: ['LCP > 2.5s on mobile'],
        history: Array.from({length: 10}, (_, i) => ({ date: `2024-05-${10+i}`, mobileScore: 60 + i, desktopScore: 90 }))
      },
      {
        url: 'https://techflow.ai/features',
        latestMobile: { id: 's3', url: 'https://techflow.ai/features', device: 'mobile', source: 'field', metrics: { lcp: 1.5, inp: 80, cls: 0.01 }, status: 'good', capturedAt: new Date().toISOString() },
        latestDesktop: { id: 's4', url: 'https://techflow.ai/features', device: 'desktop', source: 'field', metrics: { lcp: 0.9, inp: 30, cls: 0.0 }, status: 'good', capturedAt: new Date().toISOString() },
        overallStatus: 'good',
        issues: [],
        history: Array.from({length: 10}, (_, i) => ({ date: `2024-05-${10+i}`, mobileScore: 85 + i, desktopScore: 95 }))
      }
    ];
  }

  getPerformanceSummary(url: string, queryId?: string): PagePerformanceSummary {
    return this.listTopPerformancePages('')[0]; // Mock
  }

  async runPerformanceCheck(url: string): Promise<PagePerformanceSummary> {
    await new Promise(r => setTimeout(r, 2000));
    return this.listTopPerformancePages('')[0];
  }

  // --- Content Fixes ---

  async generateFixPack(params: any): Promise<FixPack | 'FETCH_BLOCKED'> {
    await new Promise(r => setTimeout(r, 1500));
    if (!params.manualHtml) return 'FETCH_BLOCKED'; // Simulate CORS block for demo
    
    // In a real implementation, this would call FixGenerator with parsed content
    return {
      auditItemId: params.auditItemId,
      url: params.url,
      language: 'en',
      keyword: params.keyword,
      createdAt: new Date().toISOString(),
      variants: [
        { id: 'v1', auditItemId: params.auditItemId, location: 'title', kind: 'text', title: 'Option 1', whereToPaste: 'Title', language: 'en', keyword: params.keyword, estimatedKeywordDensity: 0.1, content: `Best ${params.keyword} in 2024` },
        { id: 'v2', auditItemId: params.auditItemId, location: 'title', kind: 'text', title: 'Option 2', whereToPaste: 'Title', language: 'en', keyword: params.keyword, estimatedKeywordDensity: 0.1, content: `${params.keyword}: The Complete Guide` }
      ],
      cacheKey: 'mock-cache-key'
    };
  }

  async generateTitleMetaVariants(recId: string): Promise<TitleMetaVariant[]> {
    await new Promise(r => setTimeout(r, 2000));
    return [
      { id: 'v1', recommendationId: recId, title: 'Optimized Title A', meta: 'New meta description A', rationale: 'Uses emotional hook.' },
      { id: 'v2', recommendationId: recId, title: 'Optimized Title B', meta: 'New meta description B', rationale: 'Focuses on clarity.' }
    ];
  }

  // --- Traffic Proof ---

  connectTrafficSource(source: 'gsc' | 'ga4', property: string) {
    if (source === 'gsc') {
      this.integrationSettings.gsc = { status: 'connected', propertyUrl: property, connectedAt: new Date().toISOString() };
    } else {
      this.integrationSettings.ga4 = { status: 'connected', propertyId: property, connectedAt: new Date().toISOString() };
    }
    return Promise.resolve();
  }

  disconnectTrafficSource(source: 'gsc' | 'ga4') {
    if (source === 'gsc') {
      this.integrationSettings.gsc = { status: 'disconnected' };
    } else {
      this.integrationSettings.ga4 = { status: 'disconnected' };
    }
  }

  createActionPlan(opportunity: SuggestedQuery) {
    const task: Task = {
      id: `task-opp-${opportunity.id}`,
      workspace_id: this.workspace.id,
      query_id: '',
      title: `Capture Opportunity: "${opportunity.text}"`,
      steps: ['Analyze competitor content', 'Create draft', 'Publish'],
      impact: 'L',
      effort: 'M',
      status: 'todo'
    };
    this.tasks.push(task);
    return Promise.resolve();
  }

  async refreshMetrics(taskId: string, queryId: string): Promise<MetricsSnapshot> {
    await new Promise(r => setTimeout(r, 1000));
    return this.snapshots[1]; // Return latest mock
  }

  // --- YouTube ---

  saveYoutubeKey(key: string) {
    this.integrationSettings.youtube = { status: 'connected', apiKey: key };
  }

  // --- Experiments ---

  createExperiment(exp: SeoExperiment) {
    this.experiments.push(exp);
  }

  getExperiments() {
    return this.experiments;
  }
}

export const mockService = new MockDataService();
