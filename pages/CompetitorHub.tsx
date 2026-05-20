
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Users, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  ExternalLink, 
  BarChart3, 
  Plus, 
  Search,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  Zap,
  Bot,
  SortDesc,
  Filter,
  BarChart2,
  ArrowRightLeft,
  Check,
  Eye,
  EyeOff,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Link2,
  FileCode
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Competitor, SuggestedCompetitor, Engine } from '../types';
import { ENGINE_METADATA } from '../constants';
import AddCompetitorModal from '../components/AddCompetitorModal';
import InfoTooltip from '../components/InfoTooltip';
import { useWorkspace } from '../context/WorkspaceContext';

interface CompetitorHubProps {
  competitors: Competitor[];
  suggestedCompetitors: SuggestedCompetitor[];
  onViewCompetitor: (id: string, view?: string) => void;
  onTrackCompetitor: (sc: SuggestedCompetitor) => void;
  onDismissCompetitor: (id: string) => void;
  onAddCompetitor: (name: string, domain: string) => void;
}

type SortOption = 'visibility' | 'citations' | 'name' | 'growth';

const COLORS = [
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

const CompetitorHub: React.FC<CompetitorHubProps> = ({ 
  competitors, 
  suggestedCompetitors, 
  onViewCompetitor,
  onTrackCompetitor,
  onDismissCompetitor,
  onAddCompetitor
}) => {
  const { metrics, actions } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'standings' | 'rivals' | 'discovery'>('rivals');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('visibility');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Chart Selection State
  const [visibleCompetitors, setVisibleCompetitors] = useState<Set<string>>(new Set());
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  
  // Custom Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Derived Calculations
  const yourScore = metrics?.overallVisibilityIndex || 74;
  const avgMarketVisibility = Math.round(competitors.reduce((acc, curr) => acc + (curr.visibility_score || 0), 0) / (competitors.length || 1));
  const topThreat = [...competitors].sort((a, b) => (b.visibility_score || 0) - (a.visibility_score || 0))[0];

  // Initialize visible competitors (You + Top 5)
  useEffect(() => {
    const topIds = [...competitors]
      .sort((a, b) => (b.visibility_score || 0) - (a.visibility_score || 0))
      .slice(0, 5)
      .map(c => c.id);
    setVisibleCompetitors(new Set(['you', ...topIds]));
  }, [competitors]);

  // Handle outside click for date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomApply = () => {
    if (startDateInput && endDateInput) {
        setCustomRange({ start: startDateInput, end: endDateInput });
        setShowDatePicker(false);
    }
  };

  const toggleVisibility = (id: string) => {
    const newSet = new Set(visibleCompetitors);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleCompetitors(newSet);
  };

  const sortedCompetitors = useMemo(() => {
    return [...competitors]
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.domains[0].toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'visibility') return (b.visibility_score || 0) - (a.visibility_score || 0);
        if (sortBy === 'citations') return (b.citation_count || 0) - (a.citation_count || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'growth') return Math.random() - 0.5; // Mock growth for now
        return 0;
      });
  }, [competitors, searchTerm, sortBy]);

  const standings = useMemo(() => {
    return [
      { id: 'you', name: 'You (TechFlow)', score: yourScore, status: 'Rising Fast', isUser: true, logo_url: '' },
      ...competitors.map(c => ({
        id: c.id,
        name: c.name,
        score: c.visibility_score || 0,
        status: (c.visibility_score || 0) > 60 ? 'Steady' : 'Emerging',
        isUser: false,
        logo_url: c.logo_url
      }))
    ].sort((a, b) => b.score - a.score);
  }, [competitors, yourScore]);

  // Generate Chart Data
  const chartData = useMemo(() => {
    let days = 30;
    let endDate = new Date();

    if (timeRange === '7d') days = 7;
    else if (timeRange === '90d') days = 90;
    else if (timeRange === 'custom') {
        if (customRange.start && customRange.end) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            endDate = end;
            const diffTime = Math.abs(end.getTime() - start.getTime());
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
    }
    
    // Safety check
    if (days <= 0 || isNaN(days)) days = 30;
    
    return Array.from({ length: days }).map((_, i) => {
      const date = new Date(endDate);
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const point: any = { name: dateStr };
      
      // User Trend - Add some realistic movement
      const trendFactor = i / days;
      point['you'] = Math.max(0, Math.min(100, yourScore + Math.sin(i * 0.3) * 5 + (trendFactor * 5)));

      // Competitor Trends
      competitors.forEach((c, idx) => {
        const base = c.visibility_score || 50;
        // Deterministic pseudo-random noise based on index
        const noise = Math.cos(i * 0.2 + idx) * 8 + (Math.sin(i * 0.5) * 4); 
        point[c.id] = Math.max(0, Math.min(100, base + noise));
      });

      return point;
    });
  }, [competitors, yourScore, timeRange, customRange]);

  const handleFixSchema = () => {
    actions.showToast({
        title: 'Task Created',
        message: 'Schema validation task added to Strategy Planner.',
        type: 'success'
    });
  };

  const handleViewGaps = () => {
    const logicStream = competitors.find(c => c.name === 'LogicStream');
    if (logicStream) {
        onViewCompetitor(logicStream.id, 'backlinks');
    } else if (competitors.length > 0) {
        onViewCompetitor(competitors[0].id, 'backlinks');
    } else {
        actions.showToast({ title: 'No Competitors', message: 'Add competitors to view gaps.', type: 'info' });
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
            <Trophy size={24} className="text-amber-400" />
            Market Intelligence
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Track rival visibility and discover emerging market threats.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-muted p-1 rounded-xl border border-border shadow-inner">
            {[
              { id: 'standings', label: 'Standings', icon: <Trophy size={14} /> },
              { id: 'rivals', label: 'My Rivals', icon: <Users size={14} /> },
              { id: 'discovery', label: 'Discovery', icon: <Sparkles size={14} />, count: suggestedCompetitors.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-card text-foreground shadow-sm border border-white/5' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-primary-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 hover:border-primary-500/30 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary-500/5"
          >
            <Plus size={16} strokeWidth={3} />
            Add Competitor
          </button>
        </div>
      </div>

      {activeTab === 'rivals' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Market Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex items-center gap-5 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-emerald-500/[0.02] rounded-full blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 group-hover:scale-105 transition-transform">
                   <TrendingUp size={24} />
                </div>
                <div>
                   <div className="text-3xl font-black text-foreground">{avgMarketVisibility}%</div>
                   <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-1">
                      Avg Market SOV
                      <InfoTooltip content="The average visibility score of all tracked competitors in your workspace." />
                   </div>
                </div>
             </div>

             <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex items-center gap-5 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-primary-500/[0.02] rounded-full blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/10 group-hover:scale-105 transition-transform">
                   <Users size={24} />
                </div>
                <div>
                   <div className="text-3xl font-black text-foreground">{competitors.length}</div>
                   <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-1">
                      Tracked Rivals
                      <InfoTooltip content="Total number of brands you are currently benchmarking against." />
                   </div>
                </div>
             </div>

             <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex items-center gap-5 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-rose-500/[0.02] rounded-full blur-2xl" />
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/10 group-hover:scale-105 transition-transform">
                   <ShieldAlert size={24} />
                </div>
                <div>
                   <div className="text-xl font-black text-foreground truncate max-w-[150px]">{topThreat?.name || 'N/A'}</div>
                   <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-1">
                      Dominant Threat
                      <InfoTooltip content="The rival currently holding the highest aggregate visibility score." />
                   </div>
                </div>
             </div>
          </div>

          {/* New Interactive Chart Section */}
          <div className="bg-card border border-border rounded-[32px] p-8 shadow-soft flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-h-[350px] flex flex-col">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary-400" />
                    Market Share History
                  </h3>
                  
                  {/* Time Range Selector */}
                  <div className="flex bg-muted/50 p-1 rounded-lg border border-border relative">
                    {(['7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => { setTimeRange(range); setShowDatePicker(false); }}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                                timeRange === range ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                    
                    <div className="relative" ref={datePickerRef}>
                      <button
                          onClick={() => {
                              setTimeRange('custom');
                              setShowDatePicker(!showDatePicker);
                          }}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${
                              timeRange === 'custom' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                          <Calendar size={10} className="mb-0.5" /> CUSTOM
                      </button>
                      
                      {showDatePicker && (
                          <div className="absolute top-full right-0 mt-3 p-4 bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col gap-4 min-w-[280px] animate-in fade-in zoom-in-95 duration-200">
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">Start</label>
                                      <input 
                                          type="date" 
                                          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                                          value={startDateInput}
                                          onChange={(e) => setStartDateInput(e.target.value)}
                                      />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">End</label>
                                      <input 
                                          type="date" 
                                          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                                          value={endDateInput}
                                          onChange={(e) => setEndDateInput(e.target.value)}
                                      />
                                  </div>
                              </div>
                              <div className="flex justify-end pt-2 border-t border-border">
                                  <button 
                                      onClick={handleCustomApply}
                                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                                  >
                                      Apply Range
                                  </button>
                              </div>
                          </div>
                      )}
                    </div>
                  </div>
               </div>
               
               <div className="flex-1 w-full min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight="bold" />
                     <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        labelStyle={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '900' }}
                     />
                     {/* You Line */}
                     {visibleCompetitors.has('you') && (
                        <Line 
                          type="monotone" 
                          dataKey="you" 
                          name="You (TechFlow)" 
                          stroke="#8b5cf6" 
                          strokeWidth={3} 
                          dot={false}
                          activeDot={{ r: 6, fill: '#8b5cf6' }}
                        />
                     )}
                     {/* Competitor Lines */}
                     {competitors.map((c, idx) => {
                        if (!visibleCompetitors.has(c.id)) return null;
                        return (
                          <Line 
                            key={c.id}
                            type="monotone" 
                            dataKey={c.id} 
                            name={c.name} 
                            stroke={COLORS[idx % COLORS.length]} 
                            strokeWidth={2} 
                            dot={false}
                            activeDot={{ r: 6, fill: COLORS[idx % COLORS.length] }}
                          />
                        );
                     })}
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Interactive Legend Side Panel */}
            <div className="lg:w-72 border-l border-border/50 lg:pl-8 flex flex-col">
               <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Filter size={12} /> Compare Rivals
               </h4>
               <div className="space-y-2 overflow-y-auto max-h-[320px] custom-scrollbar pr-2">
                  {/* You Toggle */}
                  <button 
                    onClick={() => toggleVisibility('you')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${
                      visibleCompetitors.has('you') 
                        ? 'bg-primary-500/10 border-primary-500/30' 
                        : 'bg-transparent border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full shadow-sm ${visibleCompetitors.has('you') ? 'bg-primary-500' : 'bg-muted border border-muted-foreground/30'}`} />
                       <span className={`text-xs font-bold ${visibleCompetitors.has('you') ? 'text-foreground' : 'text-muted-foreground'}`}>You (TechFlow)</span>
                    </div>
                    {visibleCompetitors.has('you') ? <Eye size={14} className="text-primary-500" /> : <EyeOff size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground" />}
                  </button>

                  {/* Competitor Toggles */}
                  {competitors.map((c, idx) => {
                    const isVisible = visibleCompetitors.has(c.id);
                    const color = COLORS[idx % COLORS.length];
                    return (
                      <button 
                        key={c.id}
                        onClick={() => toggleVisibility(c.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${
                          isVisible
                            ? 'bg-card border-border shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-3 h-3 rounded-full shadow-sm transition-colors`}
                            style={{ backgroundColor: isVisible ? color : 'transparent', border: isVisible ? 'none' : '1px solid #52525b' }} 
                          />
                          <span className={`text-xs font-bold truncate max-w-[140px] text-left ${isVisible ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {c.name}
                          </span>
                        </div>
                        {isVisible ? (
                          <Check size={14} className="text-foreground" style={{ color }} /> 
                        ) : (
                          <Plus size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
               </div>
            </div>
          </div>

          {/* CRITICAL ISSUES / WHY YOU'RE LOSING SECTION */}
          <div className="w-full bg-[#0f0f11] border border-white/5 rounded-[32px] p-8 shadow-soft">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
                   <AlertTriangle size={20} className="text-amber-400" />
                   Why You're Losing
                </h3>
                <span className="bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20 shadow-sm">
                   2 Critical Issues
                </span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-card/50 border border-border/50 rounded-2xl flex flex-col gap-4 hover:border-amber-500/20 transition-all group">
                   <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/10 shadow-inner">
                         <TrendingDown size={20} />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-foreground mb-1">Authority Deficit</h4>
                         <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            Competitor <span className="text-foreground font-bold">"LogicStream"</span> is cited by 3 high-authority domains (G2, TechCrunch) that are missing from your profile.
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={handleViewGaps}
                     className="w-full py-2.5 bg-muted/30 hover:bg-muted text-xs font-bold text-foreground rounded-xl border border-border/50 transition-all flex items-center justify-center gap-2 group/btn"
                   >
                     <Link2 size={14} className="text-amber-500" /> View Gaps <ArrowRight size={12} className="opacity-0 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                   </button>
                </div>

                <div className="p-5 bg-card/50 border border-border/50 rounded-2xl flex flex-col gap-4 hover:border-indigo-500/20 transition-all group">
                   <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/10 shadow-inner">
                         <Bot size={20} />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-foreground mb-1">Content Readability</h4>
                         <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            Copilot failed to extract pricing information from your target page. Your <span className="text-foreground font-bold">schema markup</span> may be broken or missing.
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={handleFixSchema}
                     className="w-full py-2.5 bg-muted/30 hover:bg-muted text-xs font-bold text-foreground rounded-xl border border-border/50 transition-all flex items-center justify-center gap-2 group/btn"
                   >
                     <FileCode size={14} className="text-indigo-500" /> Fix Schema <ArrowRight size={12} className="opacity-0 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                   </button>
                </div>
             </div>
          </div>

          {/* Search & Sort Hub */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 border border-border/50 p-4 rounded-[28px] backdrop-blur-sm">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="Search rivals by name or domain..." 
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl py-2.5 pl-12 pr-4 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden lg:block">Sort By</span>
                <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                   {[
                     { id: 'visibility', label: 'SOV', icon: <Trophy size={12} /> },
                     { id: 'citations', label: 'Links', icon: <Link2 size={12} /> },
                     { id: 'growth', label: 'Growth', icon: <TrendingUp size={12} /> },
                     { id: 'name', label: 'A-Z', icon: <SortDesc size={12} /> }
                   ].map(opt => (
                     <button
                       key={opt.id}
                       onClick={() => setSortBy(opt.id as SortOption)}
                       className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                         sortBy === opt.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                       }`}
                     >
                       {opt.icon} {opt.label}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Rivals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCompetitors.map((comp) => (
              <div key={comp.id} className="bg-card border border-border rounded-[32px] p-8 hover:border-primary-500/30 transition-all group shadow-soft flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-primary-500/[0.01] rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-primary-500/[0.04] transition-all pointer-events-none" />
                
                {/* Status Bar */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-xl text-muted-foreground group-hover:text-primary-500 group-hover:bg-primary-500/5 group-hover:border-primary-500/20 transition-all shadow-inner">
                        {comp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-foreground tracking-tight leading-none group-hover:text-primary-400 transition-colors">{comp.name}</h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <TrendingUp size={10} /> +2.4%
                        </span>
                        <span className="text-[9px] text-muted-foreground font-bold truncate max-w-[100px]">{comp.domains[0]}</span>
                      </div>
                    </div>
                  </div>
                  <a href={`https://${comp.domains[0]}`} target="_blank" className="text-muted-foreground hover:text-foreground transition-all p-2 bg-muted/20 hover:bg-muted rounded-xl border border-transparent hover:border-border">
                    <ExternalLink size={16} />
                  </a>
                </div>

                {/* Strategic Context */}
                <div className="mb-6 p-4 bg-muted/20 rounded-2xl border border-border/50 group-hover:border-primary-500/10 transition-colors">
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Zap size={10} className="text-amber-500" /> Key Territory
                  </div>
                  <div className="text-xs font-bold text-foreground">Dominates "Best Enterprise Integration"</div>
                  <div className="text-[10px] text-muted-foreground mt-1 font-medium">Beating you in 8/12 comparison queries.</div>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl shadow-inner group-hover:border-primary-500/10 transition-all">
                    <div className="text-[9px] text-muted-foreground font-black uppercase mb-1 tracking-widest flex items-center gap-1">
                      Visibility
                      <InfoTooltip content="Aggregated SOV for this rival across all workspace queries." />
                    </div>
                    <div className="text-2xl font-black text-foreground tracking-tighter">{comp.visibility_score || 0}%</div>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl shadow-inner group-hover:border-primary-500/10 transition-all">
                    <div className="text-[9px] text-muted-foreground font-black uppercase mb-1 tracking-widest flex items-center gap-1">
                      Citations
                      <InfoTooltip content="Total unique domains citing this brand in AI answers." />
                    </div>
                    <div className="text-2xl font-black text-foreground tracking-tighter">{(comp.citation_count || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Comparison Bar (Head-to-Head) */}
                <div className="mb-8">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SOV vs You</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${(comp.visibility_score || 0) > yourScore ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {(comp.visibility_score || 0) > yourScore ? 'Behind Leader' : 'Leading Market'}
                      </span>
                   </div>
                   <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex shadow-inner border border-white/5">
                      <div className="h-full bg-primary-500 shadow-glow" style={{ width: `${yourScore}%` }} />
                      <div className="h-full bg-rose-500/40 border-l border-background" style={{ width: `${Math.max(5, (comp.visibility_score || 0))}%` }} />
                   </div>
                   <div className="flex justify-between mt-1 text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">
                      <span>You ({yourScore}%)</span>
                      <span>Them ({comp.visibility_score}%)</span>
                   </div>
                </div>

                <div className="flex gap-2 mt-auto">
                   <button 
                     onClick={() => onViewCompetitor(comp.id)}
                     className="flex-1 py-3 bg-muted/50 hover:bg-primary-600 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-muted-foreground hover:border-primary-600 shadow-sm active:scale-95 group/btn"
                   >
                     <BarChart2 size={14} />
                     Analyze Gaps
                   </button>
                   <button 
                     onClick={() => onViewCompetitor(comp.id)}
                     className="p-3 bg-muted/50 hover:bg-primary-500/10 border border-transparent hover:border-primary-500/20 rounded-xl text-muted-foreground hover:text-primary-500 transition-all"
                     title="Side-by-side"
                   >
                     <ArrowRightLeft size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>

          {sortedCompetitors.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-border rounded-[40px]">
              <Users size={64} className="mb-6" />
              <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-widest">No matching rivals</h3>
              <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed">Adjust your filters or add a new brand to track performance.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'standings' && (
        <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              League Leaderboard
              <InfoTooltip content="Current market leaders based on aggregated visibility across all tracked questions." />
            </h3>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Market Awareness Index</div>
          </div>
          <div className="divide-y divide-border/50">
            {standings.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-6 flex items-center justify-between hover:bg-muted/50 transition-colors group cursor-pointer ${item.isUser ? 'bg-primary-500/[0.03]' : ''}`}
                onClick={() => !item.isUser && onViewCompetitor(item.id)}
              >
                <div className="flex items-center gap-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border border-border shadow-inner ${
                    index === 0 ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' :
                    index === 1 ? 'bg-zinc-300 text-zinc-700 border-zinc-400 shadow-md' :
                    index === 2 ? 'bg-orange-400 text-white border-orange-500 shadow-md' :
                    'bg-muted text-muted-foreground/50'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className={`text-base font-black ${item.isUser ? 'text-primary-500' : 'text-foreground'}`}>
                      {item.name}
                      {item.isUser && <span className="ml-3 text-[9px] font-black bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded uppercase tracking-widest border border-primary-500/20">Active Workspace</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {item.status === 'Rising Fast' ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-muted-foreground/30" />}
                      <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60">{item.status}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                   <div className="text-right">
                      <div className={`text-3xl font-black tracking-tighter ${item.isUser ? 'text-primary-500' : 'text-foreground'}`}>
                        {item.score}%
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60 mt-1">SOV Score</div>
                   </div>
                   <div className="p-3 rounded-xl bg-muted/50 text-muted-foreground group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-all border border-transparent group-hover:border-primary-500/20">
                      <ArrowRight size={18} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'discovery' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {suggestedCompetitors.length > 0 ? suggestedCompetitors.map((sc) => (
            <div key={sc.id} className="bg-card border border-border rounded-[32px] p-8 hover:border-rose-500/30 transition-all group shadow-soft relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500/20" />
              
              <div className="flex items-start gap-6 mb-8">
                {sc.logo_url ? (
                    <img 
                      src={sc.logo_url} 
                      className="w-16 h-16 rounded-2xl border border-border shadow-inner object-cover bg-muted shrink-0" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-2xl font-black text-muted-foreground shrink-0 border border-border group-hover:border-rose-500/30 transition-colors shadow-inner">
                      {sc.name.charAt(0)}
                    </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xl font-black text-foreground tracking-tight">{sc.name}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/10 shadow-sm shadow-rose-500/5">
                      <ShieldAlert size={12} /> Emerging Threat
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold mb-4">
                    <Globe size={14} className="text-primary-500" />
                    {sc.domains[0]}
                  </div>
                  <div className="p-5 bg-muted/50 rounded-[24px] border border-border group-hover:bg-card transition-colors relative shadow-inner">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">
                      <Bot size={14} className="text-rose-500" />
                      AI Analyst Insight
                    </div>
                    <p className="text-xs text-foreground leading-relaxed font-medium italic opacity-90">
                      "{sc.reason}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onTrackCompetitor(sc)}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                >
                  <Plus size={16} strokeWidth={3} />
                  Start Tracking Rival
                </button>
                <button 
                  onClick={() => onDismissCompetitor(sc.id)}
                  className="px-6 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground py-3.5 rounded-xl flex items-center justify-center transition-colors font-black uppercase text-[10px] tracking-widest border border-transparent hover:border-border/50"
                >
                  Ignore
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-border rounded-[40px]">
              <Users size={64} className="mb-6" />
              <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-widest">No hidden threats</h3>
              <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed uppercase">Your competitive landscape is stable. We'll alert you if fresh rivals emerge in AI results.</p>
            </div>
          )}
        </div>
      )}

      <AddCompetitorModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={onAddCompetitor} 
      />
    </div>
  );
};

const Link2: React.FC<any> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

const ArrowRight: React.FC<any> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default CompetitorHub;
