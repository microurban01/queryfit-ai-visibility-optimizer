import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Globe, 
  Loader2, 
  Settings2, 
  Zap, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  BarChart3, 
  Search, 
  AlertTriangle, 
  ArrowRight, 
  Eye, 
  Play, 
  Clock, 
  Layers, 
  Calendar,
  MoreHorizontal,
  Bot,
  Activity,
  Lightbulb,
  ArrowUpRight,
  ShieldCheck,
  MousePointerClick,
  FileText,
  Trophy,
  Smartphone,
  Monitor,
  ListChecks
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Query, Engine, Priority, Task } from '../types';
import ManageQueryModal from '../components/ManageQueryModal';
import CreditConfirmationModal from '../components/CreditConfirmationModal';
import EvidenceDrawer from '../components/EvidenceDrawer';
import ContentAuditModal from '../components/ContentAuditModal';
import OutreachListModal from '../components/OutreachListModal';
import { useWorkspace } from '../context/WorkspaceContext';
import { mockService } from '../services/mockDataService';
import { ENGINE_METADATA } from '../constants';
import InfoTooltip from '../components/InfoTooltip';
import { getFlagEmoji } from '../utils/marketUtils';

interface QueryDetailProps {
  query: Query;
  tasks: Task[];
  onBack: () => void;
  onUpdateQuery: (id: string, updates: Partial<Query>) => void;
  onDeleteQuery: (id: string) => void;
  initialAction?: string;
}

const QueryDetail: React.FC<QueryDetailProps> = ({ query, tasks, onBack, onUpdateQuery, onDeleteQuery, initialAction }) => {
  const { workspace, actions, snapshots, integrationSettings, refreshState } = useWorkspace();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [evidenceEngine, setEvidenceEngine] = useState<Engine | null>(null);
  const [citationTab, setCitationTab] = useState<'targets' | 'yours'>('targets');
  
  // Time Range State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    if (initialAction) {
        if (initialAction.startsWith('evidence:')) {
            const engineKey = initialAction.split(':')[1];
            const engineEnum = Object.values(Engine).find(e => e === engineKey);
            if (engineEnum) setEvidenceEngine(engineEnum);
        } else if (initialAction === 'run-audit') {
            setIsAuditModalOpen(true);
        }
    }
  }, [initialAction]);

  const activeEngines = workspace?.enabled_engines || Object.values(Engine);

  // -- Derived Metrics --
  const relevantTasks = tasks.filter(t => t.query_id === query.id && t.status !== 'done');
  
  // Get Traffic Data
  const latestSnapshot = snapshots.find(s => s.queryId === query.id && s.source === 'latest');
  
  const gscConnected = integrationSettings.gsc.status === 'connected';

  // -- Mock History Data for Chart --
  const historyData = useMemo(() => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Simulate a starting score based on current score and range
    let currentScore = query.overall_score;
    
    // Create a mock "range delta" for longer periods based on the 7d trend
    // This makes the chart look consistent with the recent trend direction but scaled
    let rangeDelta = query.delta_7d;
    if (timeRange === '30d') rangeDelta = query.delta_7d * 2.5;
    if (timeRange === '90d') rangeDelta = query.delta_7d * 4;

    const startScore = currentScore - rangeDelta;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      const progress = i / (days - 1); 
      // Simple interpolation with noise
      let score = startScore + (currentScore - startScore) * progress;
      score += (Math.random() * 6 - 3); 
      
      data.push({
        date: timeRange === '7d' 
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString(),
        score: Math.max(0, Math.min(100, Math.round(score)))
      });
    }
    // Ensure last point matches reality
    if (data.length > 0) {
        data[data.length - 1].score = query.overall_score;
    }
    return data;
  }, [query.overall_score, query.delta_7d, timeRange]);

  // -- Mock Standings Data --
  const standings = useMemo(() => {
    const items = [
      { name: 'You (TechFlow)', score: query.overall_score, citations: query.citations.you, isUser: true, trend: query.delta_7d },
      { name: query.leaderName, score: query.leaderScore, citations: query.citations.leader, isUser: false, trend: 2 }, // Mock trend for leader
      { name: 'FluxDesk', score: Math.max(10, query.leaderScore - 12), citations: Math.max(0, query.citations.leader - 3), isUser: false, trend: -5 },
      { name: 'Zenith CRM', score: Math.max(5, query.leaderScore - 25), citations: Math.max(0, query.citations.leader - 5), isUser: false, trend: 0 },
    ];
    return items.sort((a, b) => b.score - a.score).map((item, i) => ({ ...item, rank: i + 1 }));
  }, [query]);

  // -- Mocking Dynamic "Why Losing" Bullets --
  const whyLosingReasons = useMemo(() => {
    const reasons = [];
    if (query.overall_score < query.leaderScore) {
      reasons.push({ 
        title: "Authority Deficit",
        text: `Competitor "${query.leaderName}" is cited by 3 high-authority domains (G2, TechCrunch) that are missing from your profile.`, 
        severity: 'high' 
      });
    }
    if (query.citations.you === 0) {
      reasons.push({ 
        title: "Zero Citation Risk",
        text: "You have zero verified citations for this query. This drastically increases the risk of AI hallucination or total omission.", 
        severity: 'critical' 
      });
    }
    if (query.engine_scores[Engine.COPILOT] < 50) {
      reasons.push({ 
        title: "Content Readability",
        text: "Copilot failed to extract pricing information from your target page. Your schema markup may be broken or missing.", 
        severity: 'medium' 
      });
    }
    // Fallback
    if (reasons.length === 0) {
      reasons.push({ 
        title: "Semantic Gap",
        text: "Your content depth is lower than the top 3 results. AI models prefer the more comprehensive answers provided by rivals.", 
        severity: 'medium' 
      });
      reasons.push({ 
        title: "Keyword Density",
        text: "Semantic density for secondary intent keywords is low compared to the category average.", 
        severity: 'low' 
      });
    }
    return reasons.slice(0, 3);
  }, [query]);

  // -- Mocking Citation Gaps --
  const citationGaps = [
    { 
      id: 'g1',
      domain: 'g2.com', 
      url: 'https://www.g2.com/products/logicstream/reviews', 
      title: 'LogicStream Reviews 2024: Details, Pricing, & Features',
      type: 'Review', 
      citing: 'LogicStream', 
      authority: 94 
    },
    { 
      id: 'g2',
      domain: 'techcrunch.com', 
      url: 'https://techcrunch.com/2023/11/15/logicstream-raises-series-b', 
      title: 'LogicStream raises Series B to automate agency workflows',
      type: 'News', 
      citing: 'LogicStream', 
      authority: 92 
    },
    { 
      id: 'g3',
      domain: 'hubspot.com', 
      url: 'https://blog.hubspot.com/marketing/best-agency-crm', 
      title: 'The 15 Best CRMs for Marketing Agencies in 2024',
      type: 'Listicle', 
      citing: 'FluxDesk', 
      authority: 89 
    },
    { 
      id: 'g4',
      domain: 'reddit.com', 
      url: 'https://reddit.com/r/marketing/comments/18x/best_crm_for_small_agency', 
      title: 'r/marketing: What CRM are you guys using in 2024?',
      type: 'Discussion', 
      citing: 'Zenith CRM', 
      authority: 85 
    }
  ];

  const handleRunScan = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmScan = (selectedEngines: Engine[]) => {
    setShowConfirmModal(false);
    setIsScanning(true);
    setScanSuccess(false);
    
    // Simulate API delay
    setTimeout(() => {
      mockService.deductCredits(selectedEngines.length);
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 3000);
    }, 2000);
  };

  const handleConfirmOutreach = (selectedGaps: typeof citationGaps) => {
    selectedGaps.forEach(gap => {
      const task: Task = {
        id: `task-outreach-${gap.id}-${Date.now()}`,
        workspace_id: workspace?.id || 'ws-default',
        query_id: query.id,
        title: `Outreach: Get cited in "${gap.title}"`,
        steps: [
          `Analyze "${gap.title}" on ${gap.domain} for context.`,
          `Identify the author or editor contact info.`,
          `Draft pitch highlighting ${query.text} relevance.`,
          `Send outreach email.`
        ],
        impact: gap.authority > 80 ? 'L' : 'M',
        effort: 'M',
        status: 'todo'
      };
      mockService.addTask(task);
    });
    
    refreshState();
    actions.showToast({
      title: 'Strategy Updated',
      message: `${selectedGaps.length} outreach tasks added to your plan.`,
      type: 'success'
    });
  };

  const scoreColor = query.overall_score >= 80 ? 'text-emerald-500' : query.overall_score >= 50 ? 'text-amber-500' : 'text-rose-500';

  // Audit Mock Scores for the Widget
  const auditScore = 67;
  const auditColor = auditScore >= 80 ? 'text-emerald-500' : auditScore >= 60 ? 'text-amber-500' : 'text-rose-500';
  const auditBg = auditScore >= 80 ? 'bg-emerald-500' : auditScore >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background relative">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <button 
            onClick={onBack}
            className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-all border border-border shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Target size={24} className="text-primary-500" />
              <h1 className="text-2xl font-black tracking-tight text-foreground">{query.text}</h1>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-muted/30 text-muted-foreground border border-border/50 flex items-center gap-1.5">
                  <span className="text-base leading-none">{getFlagEmoji(query.market.region)}</span>
                  <span>{query.market.region} / {query.market.language.toUpperCase()}</span>
                </span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                  query.priority === Priority.HIGH ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                  'bg-muted/50 text-muted-foreground border-border/50'
                }`}>
                  {query.priority} Priority
                </span>
                {query.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-muted/30 text-muted-foreground border border-border/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Metadata Line */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground mt-3 font-medium">
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-primary-400" />
                <a href={query.targetUrl} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors hover:underline">
                  {query.targetUrl ? new URL(query.targetUrl).hostname : 'No target URL set'}
                </a>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-muted-foreground/70" />
                Last scan: {new Date(query.lastScannedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
              isScanning 
                ? 'bg-muted/30 text-muted-foreground cursor-not-allowed border border-transparent' 
                : scanSuccess
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50'
            }`}
          >
            {isScanning ? (
              <Loader2 size={14} className="animate-spin" />
            ) : scanSuccess ? (
              <CheckCircle2 size={14} />
            ) : (
              <Zap size={14} className="text-amber-400" fill="currentColor" />
            )}
            {isScanning ? 'Syncing...' : scanSuccess ? 'Scan Complete' : 'Re-Scan'}
          </button>
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-all border border-transparent hover:border-border"
          >
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Vital Stats Row */}
      <div className="flex flex-wrap items-center gap-8 py-4 border-b border-border/60">
        {[
          { label: 'Verified Citations', val: `${query.citations.you}`, sub: `/ ${query.citations.leader} Leader`, icon: <Link2 size={16} />, color: 'text-foreground' },
          { label: 'Engine Presence', val: `${activeEngines.filter(e => query.engine_scores[e] > 0).length}`, sub: `/ ${activeEngines.length} Active`, icon: <Bot size={16} />, color: 'text-foreground' },
          { label: 'Volatility', val: query.volatilityLabel, icon: <Activity size={16} />, color: query.volatilityLabel === 'Stable' ? 'text-emerald-500' : 'text-rose-500' },
          { label: 'Sentiment', val: 'Positive', icon: <CheckCircle2 size={16} />, color: 'text-emerald-500' },
          { 
            label: 'Average Google Rank', 
            val: gscConnected && latestSnapshot?.gsc ? `#${latestSnapshot.gsc.position.toFixed(1)}` : '-', 
            icon: <BarChart3 size={16} />, 
            color: 'text-foreground',
            sub: gscConnected ? undefined : 'No Data'
          },
        ].map((stat, i) => (
          <div key={i} className="flex gap-3 items-center group">
            <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border group-hover:border-primary-500/30 group-hover:text-primary-400 transition-colors">
              {stat.icon}
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1 opacity-70">{stat.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-sm font-black ${stat.color}`}>{stat.val}</span>
                {stat.sub && <span className="text-[10px] font-bold text-muted-foreground/60">{stat.sub}</span>}
              </div>
            </div>
          </div>
        ))}

        {/* Traffic Signal moved to Vitals Row */}
        {gscConnected && latestSnapshot?.gsc && (
          <>
            <div className="w-px h-8 bg-border" />
            <div className="flex gap-6 items-center">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border">
                  <MousePointerClick size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1 opacity-70">Org. Clicks</div>
                  <div className="text-sm font-black text-foreground">{latestSnapshot.gsc.clicks}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (8): Metrics & Diagnostics */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* VISIBILITY INDEX */}
          <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-primary-500/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary-500/10 transition-all blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10 gap-4">
              <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                <Eye size={20} className="text-primary-400" />
                Visibility Index
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
                  <span className={`text-xs font-bold ${query.delta_7d >= 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                    {query.delta_7d >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {query.delta_7d > 0 ? '+' : ''}{query.delta_7d}%
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">7 Day Change</span>
                </div>

                <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
                  {(['7d', '30d', '90d'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wide transition-all ${
                        timeRange === range 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {range.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
              <div className="md:col-span-3 flex flex-col items-center justify-center border-r border-border/50 pr-4">
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-6xl font-black tracking-tighter ${scoreColor}`}>
                    {query.overall_score}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Overall Score</span>
                </div>
                
                <div className="mt-6 flex flex-col items-center w-full">
                  <div className="w-full flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                    <span>Market Leader</span>
                    <span>Gap: {Math.abs(query.overall_score - query.leaderScore)}%</span>
                  </div>
                  <div className="w-full bg-muted/50 p-2.5 rounded-xl border border-border/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{query.leaderName}</span>
                    <span className="text-xs font-black text-primary-400">{query.leaderScore}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-9 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight="bold" />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} fontWeight="bold" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                      labelStyle={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '900' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={4} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* PAGE OPTIMIZATION AUDIT (Renamed from Target Page Health) */}
          <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex flex-col md:flex-row gap-6 relative overflow-hidden">
             {/* Decorative */}
             <div className="absolute top-0 right-0 p-24 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <div className="flex-1 relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                   <ListChecks size={20} className="text-emerald-500" />
                   Page Optimization Audit
                 </h3>
                 <button 
                   onClick={() => setIsAuditModalOpen(true)}
                   className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-border/50"
                 >
                   View Checklist <ArrowRight size={12} />
                 </button>
               </div>
               
               <div className="flex items-end gap-6">
                 <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-2">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Technical Health</span>
                       <div className="text-right">
                          <span className={`text-2xl font-black tracking-tighter ${auditColor}`}>{auditScore}/100</span>
                          <span className="ml-2 text-[9px] font-bold text-muted-foreground">6 Passed · 2 Issues</span>
                       </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                       <div className={`h-full rounded-full ${auditBg}`} style={{ width: `${auditScore}%` }} />
                    </div>
                 </div>
                 
                 <div className="flex gap-3">
                    <div className="px-4 py-2 bg-muted/30 border border-border/50 rounded-xl flex flex-col items-center">
                       <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-muted-foreground uppercase">
                          <Smartphone size={10} /> Mobile Speed
                       </div>
                       <div className="text-xs font-black text-rose-500">Poor (3.2s)</div>
                    </div>
                    <div className="px-4 py-2 bg-muted/30 border border-border/50 rounded-xl flex flex-col items-center">
                       <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-muted-foreground uppercase">
                          <Monitor size={10} /> Desktop Speed
                       </div>
                       <div className="text-xs font-black text-emerald-500">Great (0.8s)</div>
                    </div>
                 </div>
               </div>
             </div>
          </div>

          {/* MARKET STANDINGS */}
          <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                    <Trophy size={20} className="text-amber-400" /> 
                    Query Standings
                </h3>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Share of Voice</span>
            </div>
            
            <div className="divide-y divide-border/60">
                {standings.map((item) => (
                    <div 
                        key={item.name} 
                        className={`group flex items-center justify-between px-6 py-4 transition-all ${item.isUser ? 'bg-primary-500/5 hover:bg-primary-500/10' : 'hover:bg-muted/40'}`}
                    >
                        <div className="flex items-center gap-4 w-[240px]">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${
                                item.rank === 1 ? 'bg-amber-400 text-white border-amber-500 shadow-sm' : 
                                item.rank === 2 ? 'bg-muted text-muted-foreground border-border' :
                                'bg-transparent text-muted-foreground/50 border-transparent'
                            }`}>
                                {item.rank}
                            </div>
                            <div>
                                <div className={`text-sm font-bold ${item.isUser ? 'text-primary-500' : 'text-foreground'}`}>
                                    {item.name}
                                    {item.isUser && <span className="ml-2 text-[8px] bg-primary-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 px-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${item.isUser ? 'bg-primary-500' : 'bg-muted-foreground/30'}`} 
                                        style={{ width: `${item.score}%` }}
                                    />
                                </div>
                                <span className="text-xs font-black text-foreground w-8 text-right">{item.score}</span>
                            </div>
                        </div>

                        <div className="w-[120px] flex justify-end gap-6 text-right">
                            <div>
                                <div className="text-xs font-bold text-foreground">{item.citations}</div>
                                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Citations</div>
                            </div>
                            <div className="w-16 flex justify-end">
                                <div className={`text-xs font-bold flex items-center gap-1 ${
                                    item.trend > 0 ? 'text-emerald-500' : item.trend < 0 ? 'text-rose-500' : 'text-muted-foreground'
                                }`}>
                                    {item.trend > 0 ? <TrendingUp size={12} /> : item.trend < 0 ? <TrendingDown size={12} /> : <div className="w-3" />}
                                    {item.trend !== 0 ? `${Math.abs(item.trend)}%` : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* ENGINE BREAKDOWN */}
          <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                    <Bot size={20} className="text-primary-400" /> 
                    Engine Breakdown
                </h3>
            </div>
            
            <div className="divide-y divide-border/60">
                {activeEngines.map(engine => {
                    const score = query.engine_scores[engine];
                    const meta = ENGINE_METADATA[engine];
                    const isLinked = score > 60;
                    const isMentioned = score > 0;
                    const hasError = query.engineHealth.find(h => h.engine === engine)?.status !== 'ok';

                    return (
                        <div 
                            key={engine} 
                            className="group flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-all"
                        >
                            <div className="flex items-center gap-4 w-[200px]">
                                <div className={`p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-colors`}>
                                    {React.cloneElement(meta.icon as React.ReactElement<any>, { size: 16 })}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-foreground">{meta.name}</div>
                                    <div className={`text-[9px] font-bold uppercase tracking-widest ${isLinked ? 'text-emerald-500' : isMentioned ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                        {hasError ? 'Error' : isLinked ? 'Linked' : isMentioned ? 'Mentioned' : 'Missing'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex justify-center">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-foreground">{score}</span>
                                    <span className="text-[9px] text-muted-foreground font-bold uppercase">/100</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setEvidenceEngine(engine)}
                                className="px-3 py-1.5 rounded-lg bg-transparent border border-border hover:border-primary-500/50 hover:bg-primary-500/5 text-[10px] font-bold text-muted-foreground hover:text-primary-400 transition-all flex items-center gap-2 group/btn"
                            >
                                <FileText size={12} />
                                Evidence Log
                            </button>
                        </div>
                    );
                })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4): Action Plan & Supporting Data */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* DIAGNOSTICS - WHY YOU'RE LOSING */}
          <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-400" />
                Why You're Losing
              </h3>
              <div className="bg-muted/50 text-foreground px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-border/50">
                {whyLosingReasons.length} Critical Issues
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {whyLosingReasons.map((reason, i) => (
                <div key={i} className="flex gap-4 items-start p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-border transition-colors group">
                  <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                    reason.severity === 'critical' ? 'bg-rose-500/10 text-rose-500' : 
                    reason.severity === 'high' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {reason.severity === 'critical' ? <AlertCircle size={18} /> : reason.severity === 'high' ? <TrendingDown size={18} /> : <Lightbulb size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">{reason.title}</h4>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                      {reason.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionability Card (WHAT TO DO NEXT) */}
          <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col h-[400px]">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                <Target size={20} className="text-primary-400" />
                What To Do Next
              </h3>
              {relevantTasks.length > 0 && (
                <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-glow">
                  {relevantTasks.length} Ready
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {relevantTasks.length > 0 ? relevantTasks.map(task => (
                <div key={task.id} className="p-5 bg-muted/20 hover:bg-card border border-border/50 hover:border-primary-500/20 rounded-2xl transition-all cursor-pointer group relative overflow-hidden">
                  {/* Task Impact Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.impact === 'L' ? 'bg-primary-500' : 'bg-muted'}`} />
                  
                  <div className="pl-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-md border uppercase tracking-wide whitespace-nowrap bg-muted/50 text-muted-foreground border-border/50`}>
                        {task.impact === 'L' ? 'High Impact' : 'Quick Win'}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1">
                        <TrendingUp size={10} /> +{task.impact === 'L' ? '12%' : '4%'} Lift
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary-400 transition-colors leading-tight mb-2">
                      {task.title}
                    </h4>
                    
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mb-3 line-clamp-2">
                      {task.steps[0] || "Optimize content structure to align with AI preference models."}
                    </p>

                    <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity pt-2 border-t border-border/50">
                      <button 
                        onClick={(e) => { e.stopPropagation(); actions.showToast({ title: 'Fix Generated', message: 'Copied to clipboard.', type: 'success' }); }}
                        className="flex-1 py-1.5 bg-background border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-foreground hover:border-primary-500/50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Zap size={10} /> Generate Fix
                      </button>
                      <div className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 px-2">
                        <Clock size={10} /> {task.effort === 'S' ? '5m' : '15m'}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
                  <h4 className="text-lg font-black text-foreground uppercase tracking-widest">All optimizations complete!</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-2 max-w-[200px]">Great job. Run a fresh scan to see if new gaps appear.</p>
                </div>
              )}
            </div>
          </div>

          {/* AUTHORITY SOURCES */}
          <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col min-h-[380px]">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                <Link2 size={20} className="text-primary-400" />
                Authority Sources
              </h3>
              <div className="flex bg-muted p-0.5 rounded-lg">
                <button 
                  onClick={() => setCitationTab('targets')}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide rounded-lg transition-all ${citationTab === 'targets' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Competitor Gaps
                </button>
                <button 
                  onClick={() => setCitationTab('yours')}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide rounded-lg transition-all ${citationTab === 'yours' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Your Citations
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {citationTab === 'targets' ? (
                <div className="space-y-3 flex-1">
                  {citationGaps.map((gap) => (
                    <div key={gap.id} className="flex flex-col gap-2 p-3 bg-muted/20 rounded-xl border border-border/50 group hover:border-primary-500/20 transition-all">
                      
                      <div className="flex items-start justify-between gap-3">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:text-foreground shrink-0">
                              {gap.domain.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-foreground truncate">{gap.domain}</div>
                              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{gap.type}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-wide whitespace-nowrap">
                               Cites {gap.citing}
                            </span>
                            <a href={gap.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary-500 transition-colors">
                               <ExternalLink size={12} />
                            </a>
                         </div>
                      </div>

                      <div className="pl-11 pr-2">
                         <a href={gap.url} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-foreground/80 hover:text-primary-400 transition-colors line-clamp-1 block mb-1">
                            {gap.title}
                         </a>
                         <div className="flex items-center gap-2">
                            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                               <div className="h-full bg-primary-500/50" style={{ width: `${gap.authority}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground">{gap.authority} DA</span>
                         </div>
                      </div>

                    </div>
                  ))}
                  <div className="mt-auto pt-4">
                    <button onClick={() => setIsOutreachModalOpen(true)} className="w-full py-3 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-border/50">
                      Create Outreach List
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-6">
                  <Link2 size={32} className="mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">{query.citations.you} Sources Verified</p>
                  <div className="text-[9px] text-muted-foreground mt-2">
                    {query.citations.topCitedDomain && `Top Source: ${query.citations.topCitedDomain}`}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <ManageQueryModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        query={query} 
        onUpdate={onUpdateQuery}
        onDelete={onDeleteQuery}
      />

      <CreditConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)} 
        onConfirm={handleConfirmScan}
        workspace={workspace}
        itemCount={1}
        isProcessing={isScanning}
      />

      <EvidenceDrawer 
        open={!!evidenceEngine} 
        onClose={() => setEvidenceEngine(null)} 
        engine={evidenceEngine} 
        query={query} 
      />

      <ContentAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        queryText={query.text}
        url={query.targetUrl || 'https://techflow.ai/pricing'}
      />

      <OutreachListModal
        isOpen={isOutreachModalOpen}
        onClose={() => setIsOutreachModalOpen(false)}
        gaps={citationGaps}
        onConfirm={handleConfirmOutreach}
      />
    </div>
  );
};

export default QueryDetail;