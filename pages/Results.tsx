
import React, { useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Minus, 
  Activity, 
  Filter, 
  Layers, 
  DollarSign, 
  MousePointerClick, 
  BarChart3, 
  Calendar,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import InfoTooltip from '../components/InfoTooltip';

const Results: React.FC = () => {
  const { snapshots, queries, tasks } = useWorkspace();

  // 1. Data Processing: Link Queries -> Snapshots -> Tasks
  const results = useMemo(() => {
    return queries.map(q => {
      const qSnapshots = snapshots.filter(s => s.queryId === q.id);
      const baseline = qSnapshots.find(s => s.source === 'baseline');
      const latest = qSnapshots.find(s => s.source === 'latest');
      
      // Find the task that likely caused this change (completed tasks for this query)
      const relatedTask = tasks.find(t => t.query_id === q.id && t.status === 'done');
      
      // Only interesting if we have both snapshots
      if (!baseline || !latest) return null;

      const clickDelta = (latest.gsc?.clicks || 0) - (baseline.gsc?.clicks || 0);
      const sessionDelta = (latest.ga4?.sessions || 0) - (baseline.ga4?.sessions || 0);
      const ctrDelta = (latest.gsc?.ctr || 0) - (baseline.gsc?.ctr || 0);
      
      // Mock Traffic Value (e.g. $1.50 per click)
      const valueCreated = clickDelta > 0 ? clickDelta * 1.5 : 0;

      return {
        id: q.id,
        queryText: q.text,
        taskTitle: relatedTask?.title || "Content Optimization",
        baseline,
        latest,
        clickDelta,
        sessionDelta,
        ctrDelta,
        valueCreated,
        date: new Date(latest.capturedAt).toLocaleDateString()
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.clickDelta - a.clickDelta);
  }, [queries, snapshots, tasks]);

  // 2. Aggregate Metrics
  const totalClickLift = results.reduce((acc, r) => acc + (r.clickDelta > 0 ? r.clickDelta : 0), 0);
  const totalValueCreated = results.reduce((acc, r) => acc + r.valueCreated, 0);
  const successRate = results.length > 0 
    ? Math.round((results.filter(r => r.clickDelta > 0).length / results.length) * 100) 
    : 0;

  // 3. Mock Chart Data: "Baseline vs Actual" Trajectory
  // In a real app, this would be daily historical data. Here we simulate a cumulative lift curve.
  const chartData = useMemo(() => {
    if (results.length === 0) return [];
    
    // Create a 30-day view
    return Array.from({ length: 14 }).map((_, i) => {
      const day = i + 1;
      const progress = day / 14; // 0 to 1
      
      // Baseline is flat-ish
      const baselineTraffic = 100 + (Math.random() * 20);
      
      // Actual curves upward based on total lift
      const liftCurve = totalClickLift * (progress * progress); // Quadratic growth curve
      const actualTraffic = baselineTraffic + liftCurve;

      return {
        day: `Day ${day}`,
        Baseline: Math.round(baselineTraffic),
        Actual: Math.round(actualTraffic)
      };
    });
  }, [totalClickLift]);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
          <TrendingUp size={24} className="text-emerald-500" />
          Traffic Impact
        </h1>
        <p className="text-sm text-muted-foreground font-medium max-w-2xl">
          See how your changes are driving real traffic. This dashboard links your completed tasks to visitor growth, so you can see exactly what's working.
        </p>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Total Click Lift */}
        <div className="relative group bg-card border border-border rounded-[32px] p-8 shadow-soft overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/10 transition-colors blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-emerald-500">
              <MousePointerClick size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Total Click Lift</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-foreground tracking-tighter">
                +{totalClickLift.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-muted-foreground">clicks</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
              <TrendingUp size={12} />
              Across {results.length} verified tasks
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated Value */}
        <div className="relative group bg-card border border-border rounded-[32px] p-8 shadow-soft overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-amber-500/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/10 transition-colors blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-amber-500">
              <DollarSign size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Est. Traffic Value</span>
              <InfoTooltip content="Calculated based on average CPC ($1.50) for these keywords if purchased via Ads." />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-foreground tracking-tighter">
                ${totalValueCreated.toLocaleString()}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit border border-amber-500/20">
              <Activity size={12} />
              Organic Savings
            </div>
          </div>
        </div>

        {/* Metric 3: Success Rate */}
        <div className="relative group bg-card border border-border rounded-[32px] p-8 shadow-soft overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-primary-500/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary-500/10 transition-colors blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-primary-400">
              <CheckCircle2 size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Task Success Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-foreground tracking-tighter">
                {successRate}%
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-lg w-fit border border-primary-500/20">
              <BarChart3 size={12} />
              Positive ROI
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      {results.length > 0 && (
        <div className="bg-card border border-border rounded-[32px] p-8 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Cumulative Impact</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Comparing actual traffic performance vs. projected baseline.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" /> Actual
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-700" /> Baseline
              </div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Actual" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="Baseline" stroke="#52525b" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Attribution Log */}
      <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft">
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
              <Layers size={14} /> Verified Optimizations
            </h3>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary-500/50 transition-all">
                <Filter size={10} /> Filter By Task
             </button>
          </div>
        </div>
        
        {results.length > 0 ? (
          <div className="divide-y divide-border/50">
            {results.map((res) => (
              <div key={res.id} className="group p-6 hover:bg-muted/10 transition-all flex flex-col xl:flex-row items-center gap-6">
                
                {/* 1. Context Column */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} /> {res.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary-400">
                      {res.taskTitle}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-foreground truncate" title={res.queryText}>
                    "{res.queryText}"
                  </div>
                </div>

                {/* 2. Before/After Metrics */}
                <div className="flex items-center gap-8 w-full xl:w-auto justify-between xl:justify-end">
                  
                  {/* Clicks */}
                  <div className="text-right">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Clicks</div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground line-through decoration-rose-500/50">{res.baseline.gsc?.clicks}</span>
                      <ArrowRight size={12} className="text-muted-foreground/50" />
                      <span className="text-lg font-black text-foreground">{res.latest.gsc?.clicks}</span>
                    </div>
                  </div>

                  {/* CTR */}
                  <div className="text-right hidden sm:block">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">CTR</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${res.ctrDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {((res.latest.gsc?.ctr || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Lift Badge */}
                  <div className={`w-28 flex flex-col items-end justify-center p-2 rounded-xl border ${
                    res.clickDelta > 0 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : res.clickDelta < 0 
                        ? 'bg-rose-500/10 border-rose-500/20' 
                        : 'bg-muted border-border'
                  }`}>
                    <div className={`text-lg font-black ${
                      res.clickDelta > 0 ? 'text-emerald-500' : res.clickDelta < 0 ? 'text-rose-500' : 'text-muted-foreground'
                    }`}>
                      {res.clickDelta > 0 ? '+' : ''}{res.clickDelta}
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Click Lift</div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-24 text-center opacity-40">
            <Layers size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-black uppercase tracking-widest text-foreground">No Verified Results Yet</h4>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Complete tasks in the Strategy Planner and click "Verify Impact" to populate this report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
