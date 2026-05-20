
import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PagePerformanceSummary } from '../types/performanceTypes';
import { 
  Zap, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Activity, 
  ExternalLink, 
  Timer, 
  Layout, 
  MousePointer2,
  Gauge,
  ArrowRight,
  Search,
  Code
} from 'lucide-react';
import { 
  getMetricStatus, 
  getStatusColor, 
  getStatusBg, 
  formatMetricValue 
} from '../constants/coreWebVitalsThresholds';
import InfoTooltip from '../components/InfoTooltip';
import TechnicalFixModal from '../components/TechnicalFixModal';

const PerformancePage: React.FC = () => {
  const { actions, queries, workspace } = useWorkspace();
  const [pages, setPages] = useState<PagePerformanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Technical Fix Modal State (Core Web Vitals)
  const [techFixState, setTechFixState] = useState<{ isOpen: boolean; url: string; metrics: any }>({
    isOpen: false,
    url: '',
    metrics: { lcp: 0, inp: 0, cls: 0 }
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setPages(actions.getTopPerformancePages());
      setIsLoading(false);
    };
    loadData();
  }, [actions]);

  // Handle opening the technical audit for a specific page row
  const handleOpenTechAudit = (page: PagePerformanceSummary) => {
    const data = deviceView === 'mobile' ? page.latestMobile : page.latestDesktop;
    setTechFixState({
      isOpen: true,
      url: page.url,
      metrics: data.metrics
    });
  };

  const handleGenerateSpeedFixes = () => {
    // Find the page with the worst LCP on mobile to prioritize
    const worstPage = [...pages].sort((a, b) => 
        (b.latestMobile.metrics.lcp || 0) - (a.latestMobile.metrics.lcp || 0)
    )[0];

    if (worstPage) {
        setTechFixState({
            isOpen: true,
            url: worstPage.url,
            metrics: worstPage.latestMobile.metrics
        });
    } else {
        actions.showToast({
            title: 'No Pages Found',
            message: 'Add pages to your workspace to generate fixes.',
            type: 'warning'
        });
    }
  };

  // --- Aggregations ---
  const totalPages = pages.length;
  
  const calculateSiteScore = () => {
    if (totalPages === 0) return 0;
    const sum = pages.reduce((acc, p) => {
        const metrics = deviceView === 'mobile' ? p.latestMobile.metrics : p.latestDesktop.metrics;
        const lcpScore = Math.max(0, Math.min(100, (4.0 - metrics.lcp) / (4.0 - 2.5) * 100));
        return acc + lcpScore;
    }, 0);
    return Math.round(sum / totalPages);
  };

  const siteScore = calculateSiteScore();
  const scoreColor = siteScore >= 90 ? 'text-emerald-500' : siteScore >= 50 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = siteScore >= 90 ? 'bg-emerald-500' : siteScore >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  // Human-friendly labels
  const vitalsDistribution = [
    { id: 'lcp', name: 'Loading Speed', label: 'LCP', icon: <Timer size={14} />, desc: "How fast content appears" },
    { id: 'inp', name: 'Responsiveness', label: 'INP', icon: <MousePointer2 size={14} />, desc: "Delay after clicking" },
    { id: 'cls', name: 'Visual Stability', label: 'CLS', icon: <Layout size={14} />, desc: "Unexpected layout shifts" },
  ];

  const getMetricStats = (metricKey: 'lcp' | 'inp' | 'cls') => {
    let good = 0;
    let needs = 0;
    let poor = 0;
    pages.forEach(p => {
      const m = deviceView === 'mobile' ? p.latestMobile.metrics : p.latestDesktop.metrics;
      const status = getMetricStatus(metricKey, m[metricKey]);
      if (status === 'good') good++;
      else if (status === 'poor') poor++;
      else needs++;
    });
    return { good, needs, poor };
  };

  // Translate technical issues to human-readable issues
  const translateIssue = (issue: string) => {
    if (issue.includes('LCP')) return 'Slow Mobile Load';
    if (issue.includes('CLS')) return 'Shifting Layout';
    if (issue.includes('INP')) return 'Unresponsive';
    return issue;
  };

  const filteredPages = pages.filter(p => p.url.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
            <Zap size={28} className="text-amber-400" fill="currentColor" />
            Website Speed
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Understand how your website speed impacts user experience and rankings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted p-1 rounded-xl border border-border flex shadow-inner">
             <button 
               onClick={() => setDeviceView('mobile')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${deviceView === 'mobile' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
               <Smartphone size={14} /> Mobile
             </button>
             <button 
               onClick={() => setDeviceView('desktop')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${deviceView === 'desktop' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
             >
               <Monitor size={14} /> Desktop
             </button>
          </div>
          <button 
            onClick={() => { setIsLoading(true); setTimeout(() => { setPages(actions.getTopPerformancePages()); setIsLoading(false); }, 1000); }}
            className="p-2.5 bg-card hover:bg-muted border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score Card */}
        <div className="lg:col-span-4 bg-card border border-border rounded-[32px] p-8 shadow-soft flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-24 bg-primary-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
           
           <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} />
                User Experience Score
              </h3>
              <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${siteScore >= 90 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : siteScore >= 50 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                {siteScore >= 90 ? 'Excellent' : siteScore >= 50 ? 'Fair' : 'Needs Work'}
              </div>
           </div>
           
           <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <span className={`text-7xl font-black tracking-tighter ${scoreColor}`}>{siteScore}</span>
              <span className="text-xl font-bold text-muted-foreground">/ 100</span>
           </div>
           
           <div className="relative z-10">
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                 <div className={`h-full rounded-full transition-all duration-1000 ${scoreBg}`} style={{ width: `${siteScore}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 font-medium flex items-center gap-2">
                 <TrendingUp size={12} className="text-primary-400" />
                 Based on average mobile performance
              </p>
           </div>
        </div>

        {/* Vitals Health (Friendly Names) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-[32px] p-8 shadow-soft flex flex-col justify-center gap-6">
           <div className="flex justify-between items-center mb-1">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Experience Signals</h3>
              <span className="text-[9px] font-bold text-muted-foreground">{totalPages} Pages Analyzed</span>
           </div>
           
           <div className="space-y-5">
              {vitalsDistribution.map((metric) => {
                const stats = getMetricStats(metric.id as any);
                const total = stats.good + stats.needs + stats.poor || 1; 
                
                return (
                  <div key={metric.id} className="space-y-2">
                     <div className="flex justify-between text-xs font-bold text-foreground items-center">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-muted text-muted-foreground border border-border">{metric.icon}</div>
                          <div className="flex flex-col">
                            <span className="tracking-tight leading-none">{metric.name}</span>
                            <span className="text-[8px] font-medium text-muted-foreground opacity-70">{metric.desc}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black ${stats.poor > 0 ? 'text-rose-500' : stats.needs > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                           {stats.poor > 0 ? `${stats.poor} Poor` : stats.needs > 0 ? `${stats.needs} To Improve` : 'All Good'}
                        </span>
                     </div>
                     <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex border border-border/30">
                        <div className="h-full bg-emerald-500" style={{ width: `${(stats.good / total) * 100}%` }} />
                        <div className="h-full bg-amber-500" style={{ width: `${(stats.needs / total) * 100}%` }} />
                        <div className="h-full bg-rose-500" style={{ width: `${(stats.poor / total) * 100}%` }} />
                     </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Optimization Impact (CTA) */}
        <div className="lg:col-span-3 bg-primary-500/5 border border-primary-500/10 rounded-[32px] p-8 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-24 bg-primary-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="p-3 bg-primary-500/10 rounded-2xl w-fit text-primary-500 mb-4 border border-primary-500/10">
                 <ArrowUpRight size={24} />
              </div>
              <h4 className="text-lg font-black text-foreground mb-2 tracking-tight">Boost AI Visibility</h4>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-6">
                Faster loading pages (under 2.5s) are <strong className="text-foreground">15% more likely</strong> to be cited as sources by AI models like Google Gemini.
              </p>
              <button 
                onClick={handleGenerateSpeedFixes}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap size={14} fill="currentColor" /> Get Technical Fixes
              </button>
            </div>
        </div>
      </div>

      {/* Pages List Section */}
      <div className="bg-card border border-border rounded-[40px] shadow-soft overflow-hidden flex flex-col">
         <div className="p-8 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-background rounded-2xl border border-border/50 shadow-sm text-primary-500">
                 <Layout size={24} />
               </div>
               <div>
                 <h3 className="font-black text-lg tracking-tight text-foreground">Page Inventory</h3>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-0.5">
                   {filteredPages.length} Pages • {deviceView === 'mobile' ? 'Mobile Experience' : 'Desktop Experience'}
                 </p>
               </div>
            </div>
            
            <div className="relative w-full md:w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
               <input 
                 type="text" 
                 placeholder="Search URL..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-primary-500 transition-colors shadow-sm"
               />
            </div>
         </div>

         <div className="divide-y divide-border/50">
            {filteredPages.length > 0 ? filteredPages.map(page => {
               const data = deviceView === 'mobile' ? page.latestMobile : page.latestDesktop;
               return (
                 <div key={page.url} className="p-6 hover:bg-muted/10 transition-colors group flex flex-col xl:flex-row items-center gap-6">
                    {/* URL & Status */}
                    <div className="flex-1 min-w-0 w-full">
                       <div className="flex items-center gap-3 mb-2">
                          <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${data.status === 'good' ? 'bg-emerald-500' : data.status === 'poor' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          <a href={page.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-foreground hover:text-primary-400 transition-colors truncate flex items-center gap-2">
                             {page.url.replace('https://', '')}
                             <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                          </a>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                          {page.issues.length > 0 ? (
                             page.issues.map((issue, i) => (
                               <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[9px] font-bold text-rose-500 uppercase tracking-wide">
                                  <AlertCircle size={10} /> {translateIssue(issue)}
                               </span>
                             ))
                          ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-bold text-emerald-500 uppercase tracking-wide">
                                <CheckCircle2 size={10} /> Optimized
                             </span>
                          )}
                       </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="flex gap-4 w-full xl:w-auto overflow-x-auto no-scrollbar py-2">
                       {(['lcp', 'inp', 'cls'] as const).map(metric => {
                          const val = data.metrics[metric];
                          const status = getMetricStatus(metric, val);
                          const color = getStatusColor(status);
                          const bg = getStatusBg(status);
                          
                          // Friendly Labels for Cards
                          const friendly = { lcp: 'Loading', inp: 'Interact', cls: 'Stability' }[metric];

                          return (
                             <div key={metric} className={`flex flex-col justify-center p-3 rounded-xl border w-28 shrink-0 transition-all ${bg}`}>
                                <div className="flex justify-between items-center mb-1">
                                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{friendly}</span>
                                   <div className={`w-1.5 h-1.5 rounded-full ${status === 'good' ? 'bg-emerald-500' : status === 'poor' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                </div>
                                <span className={`text-lg font-black ${color}`}>{formatMetricValue(metric, val)}</span>
                             </div>
                          );
                       })}
                    </div>

                    {/* Action */}
                    <div className="w-full xl:w-auto flex justify-end">
                       <button 
                         onClick={() => handleOpenTechAudit(page)}
                         className="px-6 py-3 bg-background border border-border hover:border-primary-500 hover:text-primary-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group/btn flex items-center gap-2 whitespace-nowrap"
                       >
                          <Code size={14} className="text-muted-foreground group-hover:text-primary-500 transition-colors" /> View Audit
                       </button>
                    </div>
                 </div>
               );
            }) : (
               <div className="p-24 text-center flex flex-col items-center justify-center opacity-40">
                  <Monitor size={64} className="mb-6 text-muted-foreground" />
                  <h3 className="text-xl font-black text-foreground uppercase tracking-widest">No Pages Found</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs font-medium">Adjust your filters or add more pages to track.</p>
               </div>
            )}
         </div>
      </div>

      {/* Technical Performance Audit */}
      <TechnicalFixModal 
        isOpen={techFixState.isOpen}
        onClose={() => setTechFixState({ ...techFixState, isOpen: false })}
        url={techFixState.url}
        metrics={techFixState.metrics}
      />

    </div>
  );
};

export default PerformancePage;
