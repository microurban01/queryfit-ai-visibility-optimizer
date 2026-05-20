
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  TrendingUp, 
  Globe, 
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Info,
  MessageSquare,
  Search,
  Bot,
  Zap,
  HelpCircle,
  Link2,
  Filter,
  BarChart2,
  Calendar,
  MousePointer2,
  Trophy,
  ArrowDownToLine,
  Eye,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Competitor, Query, Engine, Backlink } from '../types';
import { ENGINE_METADATA } from '../constants';
import InfoTooltip from '../components/InfoTooltip';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar,
  Cell
} from 'recharts';

interface CompetitorDetailProps {
  competitor: Competitor;
  queries: Query[];
  onBack: () => void;
  onFixQuery: (queryId: string, action?: string) => void;
  initialView?: 'overview' | 'backlinks';
}

const CompetitorDetail: React.FC<CompetitorDetailProps> = ({ competitor, queries, onBack, onFixQuery, initialView }) => {
  const [activeView, setActiveView] = useState<'overview' | 'backlinks'>(initialView || 'overview');
  const [selectedGap, setSelectedGap] = useState<string | null>(null);
  
  // Filter States
  const [backlinkSearch, setBacklinkSearch] = useState('');
  const [backlinkFilter, setBacklinkFilter] = useState<'all' | 'power' | 'traffic' | 'ai-cited'>('all');

  // Time Range State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trendData = useMemo(() => {
    const data = [];
    let days = 30;
    
    if (timeRange === '7d') days = 7;
    else if (timeRange === '90d') days = 90;
    else if (timeRange === 'custom') {
        if (customRange.start && customRange.end) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        } else {
            days = 30; // fallback
        }
    }

    const interval = Math.max(1, Math.floor(days / 10)); // Decimate points for readability if range is large

    for (let i = 0; i < days; i += interval) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        
        // Simulate data with some noise
        const compBase = 40 + Math.sin(i * 0.2) * 10;
        const yourBase = 45 + Math.cos(i * 0.15) * 8 + (i * 0.2); // Upward trend

        data.push({
            name: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: Math.max(0, Math.min(100, Math.floor(compBase + Math.random() * 5))),
            yourScore: Math.max(0, Math.min(100, Math.floor(yourBase + Math.random() * 5)))
        });
    }
    return data;
  }, [timeRange, customRange]);

  const engineComparisonData = Object.values(Engine).map(e => ({
    name: ENGINE_METADATA[e].name,
    you: Math.floor(Math.random() * 40 + 40),
    them: Math.floor(Math.random() * 40 + 35),
    color: ENGINE_METADATA[e].color
  }));

  const beatingQueries = queries.map(q => ({
    ...q,
    compScore: q.overall_score + (Math.random() * 15 + 5),
    gap: Math.random() * 15 + 5,
    answerSnippet: `${competitor.name} is often cited as the preferred choice due to its robust integration layer and slightly lower cost of entry, whereas TechFlow is noted for its deep enterprise capabilities but higher friction on setup.`
  }));

  const activeGapQuery = beatingQueries.find(q => q.id === selectedGap) || beatingQueries[0];

  const filteredBacklinks = useMemo(() => {
    let links = competitor.backlinks || [];
    
    if (backlinkSearch) {
      links = links.filter(l => 
        l.source_title.toLowerCase().includes(backlinkSearch.toLowerCase()) || 
        l.source_url.toLowerCase().includes(backlinkSearch.toLowerCase())
      );
    }

    if (backlinkFilter === 'power') {
      links = links.filter(l => l.domain_rating >= 70);
    } else if (backlinkFilter === 'traffic') {
      links = [...links].sort((a, b) => b.estimated_traffic - a.estimated_traffic);
    } else if (backlinkFilter === 'ai-cited') {
      links = links.filter(l => l.is_ai_cited);
    }

    return links;
  }, [competitor.backlinks, backlinkSearch, backlinkFilter]);

  const getTrustLabel = (dr: number) => {
    if (dr >= 80) return { label: 'Elite', color: 'text-primary-400' };
    if (dr >= 60) return { label: 'High', color: 'text-emerald-400' };
    if (dr >= 40) return { label: 'Medium', color: 'text-amber-400' };
    return { label: 'Common', color: 'text-muted-foreground' };
  };

  const handleCustomApply = () => {
    if (startDateInput && endDateInput) {
        setCustomRange({ start: startDateInput, end: endDateInput });
        setShowDatePicker(false);
    }
  };

  const renderBacklinkRow = (link: Backlink) => {
    const trust = getTrustLabel(link.domain_rating);
    return (
      <tr key={link.id} className="group hover:bg-muted/30 transition-colors border-b border-border/50">
        <td className="py-5 px-6">
          <div className="flex flex-col min-w-0">
            <div className="text-sm font-bold text-foreground group-hover:text-primary-400 transition-colors truncate max-w-md">
              {link.source_title}
            </div>
            <div className="flex items-center gap-2 mt-1 min-w-0">
               <span className="text-[10px] text-muted-foreground font-medium truncate max-w-xs">{link.source_url.replace('https://', '')}</span>
               <a href={link.source_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-card rounded text-muted-foreground hover:text-primary-500 transition-colors opacity-0 group-hover:opacity-100">
                 <ExternalLink size={12} />
               </a>
            </div>
          </div>
        </td>
        <td className="py-5 px-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`text-[10px] font-black uppercase tracking-widest ${trust.color}`}>{trust.label}</div>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shadow-inner border border-white/5">
               <div className="h-full bg-primary-500 shadow-glow" style={{ width: `${link.domain_rating}%` }} />
            </div>
          </div>
        </td>
        <td className="py-5 px-6 text-center">
          <div className="flex flex-col items-center">
            <div className="text-sm font-black text-foreground">
              {link.estimated_traffic > 1000 ? `${(link.estimated_traffic/1000).toFixed(1)}k` : link.estimated_traffic}
            </div>
            <div className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1.5 ${link.estimated_traffic > 10000 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
              {link.estimated_traffic > 10000 ? 'Very Popular' : 'Normal'}
            </div>
          </div>
        </td>
        <td className="py-5 px-6">
          <div className="text-xs font-bold text-muted-foreground/80 truncate max-w-[200px]">
            Linked via: <span className="text-foreground italic">"{link.anchor_text}"</span>
          </div>
        </td>
        <td className="py-5 px-6 text-center">
          {link.is_ai_cited ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded-lg border border-indigo-500/20 uppercase tracking-widest shadow-glow shadow-indigo-500/5">
              <Bot size={12} fill="currentColor" /> Cited by AI
            </div>
          ) : (
            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">Web Only</span>
          )}
        </td>
        <td className="py-5 px-6 text-center">
          <div className="flex items-center justify-center gap-2">
             <div className="text-base font-black text-primary-400">{link.contribution_score}</div>
             <InfoTooltip content="This score measures how much this specific website helps this competitor show up in AI answers like ChatGPT." />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={onBack}
            className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-all border border-border shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Users size={24} className="text-rose-500" />
              <h1 className="text-2xl font-black tracking-tight text-foreground">{competitor.name}</h1>
              <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded uppercase font-black tracking-widest border border-rose-500/20">Competitor</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 font-bold">
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-primary-400" />
                {competitor.domains[0]}
              </div>
              <div className="flex items-center gap-1.5">
                <Link2 size={14} className="text-amber-400" />
                {competitor.backlinks?.length || 0} Growth Connections
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-1 rounded-xl border border-border shadow-inner">
            <button 
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'overview' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Performance
            </button>
            <button 
              onClick={() => setActiveView('backlinks')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'backlinks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Source Sites
            </button>
          </div>
          <button 
            onClick={() => onFixQuery(activeGapQuery.id, 'run-audit')}
            className="bg-primary-600 hover:bg-primary-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95"
          >
            <Zap size={14} fill="currentColor" /> Close the Gap
          </button>
        </div>
      </div>

      {activeView === 'overview' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-card border border-border rounded-[40px] p-8 shadow-soft">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h3 className="font-black text-lg tracking-tight flex items-center gap-2 text-foreground">
                    <TrendingUp size={20} className="text-primary-400" />
                    Growth Trajectory
                    </h3>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Legend */}
                    <div className="flex items-center gap-4 text-[9px] uppercase font-black tracking-widest hidden md:flex">
                        <div className="flex items-center gap-2 text-rose-500">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> {competitor.name}
                        </div>
                        <div className="flex items-center gap-2 text-primary-500">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500" /> You
                        </div>
                    </div>

                    {/* Selector */}
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
                            
                            {/* Popup */}
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
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                    <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight="bold" />
                    <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} fontWeight="bold" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={5} dot={{ r: 5, fill: '#f43f5e', strokeWidth: 3, stroke: 'hsl(var(--card))' }} />
                    <Line type="monotone" dataKey="yourScore" stroke="#8b5cf6" strokeWidth={5} dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 3, stroke: 'hsl(var(--card))' }} strokeDasharray="6 6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-card border border-border rounded-[40px] p-8 shadow-soft flex flex-col">
              <div className="mb-8">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Model Preference</h3>
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase mt-1">Who do AI models pick more often?</p>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engineComparisonData} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="currentColor" className="text-muted-foreground" fontSize={10} width={80} axisLine={false} tickLine={false} fontWeight="black" />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Bar dataKey="you" fill="#8b5cf6" barSize={16} radius={[0, 6, 6, 0]} />
                    <Bar dataKey="them" fill="#f43f5e" barSize={16} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7 bg-card border border-border rounded-[40px] p-8 shadow-soft h-full flex flex-col">
              <div className="flex items-center justify-between mb-8 px-2">
                <div>
                  <h3 className="font-black text-lg tracking-tight text-foreground">Critical Areas</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Questions where {competitor.name} is winning</p>
                </div>
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/10 shadow-inner">
                  <ShieldAlert size={20} />
                </div>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-none max-h-[460px]">
                {beatingQueries.map(q => (
                  <div 
                    key={q.id} 
                    onClick={() => setSelectedGap(q.id)}
                    className={`flex items-center justify-between p-5 rounded-[32px] border transition-all group cursor-pointer shadow-sm ${
                      selectedGap === q.id || (!selectedGap && q === beatingQueries[0]) 
                        ? 'bg-primary-500/5 border-primary-500/30' 
                        : 'bg-muted/20 border-border/50 hover:border-primary-500/20 hover:bg-card'
                    }`}
                  >
                    <div className="flex-1 mr-4">
                      <div className="text-sm font-black text-foreground group-hover:text-primary-400 transition-colors truncate">"{q.text}"</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">Deficit: {q.gap.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-black text-foreground tracking-tighter">{q.compScore.toFixed(0)}%</div>
                        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Rival Score</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary-400 group-hover:border-primary-400/30 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-5 flex flex-col gap-8">
              <div className="bg-[#0a0a0b] border border-white/5 rounded-[40px] p-8 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-primary-500/[0.02] rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/10 shadow-inner">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-foreground tracking-tight">AI Summary</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Why models choose them over you</p>
                  </div>
                </div>
                <div className="p-6 bg-muted/30 border border-border rounded-3xl flex-1 flex flex-col shadow-inner">
                   <div className="flex items-center gap-2 mb-6">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow animate-pulse" />
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Model Analysis</span>
                   </div>
                   <p className="text-base text-foreground font-medium italic border-l-4 border-primary-500/50 pl-6 leading-relaxed flex-1">
                     "{activeGapQuery.answerSnippet}"
                   </p>
                   <div className="mt-8 pt-8 border-t border-border/50 flex justify-between items-end">
                      <div className="space-y-1">
                         <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Main Reason</div>
                         <div className="text-xs font-black text-primary-400">Better Documentation</div>
                      </div>
                      <button 
                        onClick={() => onFixQuery(activeGapQuery.id, 'run-audit')}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Zap size={14} fill="currentColor" className="text-amber-300" />
                        Fix Now
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
           
           {/* Plain-English Header Summary */}
           <div className="bg-primary-500/5 border border-primary-500/10 rounded-[32px] p-8 flex items-start gap-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-primary-400/10 flex items-center justify-center text-primary-400 shrink-0 border border-primary-400/10">
                 <Lightbulb size={32} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-lg font-black text-foreground">Why are we looking at these?</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                   These are the "Evidence Sites" that AI models like Perplexity and ChatGPT use to verify that {competitor.name} is a leader. 
                   By looking at this list, you can find <span className="text-foreground font-bold">new places to get mentioned</span> that will directly increase your own AI visibility.
                 </p>
              </div>
           </div>

           {/* Summary Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-primary-400/10 flex items-center justify-center text-primary-400 border border-primary-400/10 group-hover:scale-105 transition-transform">
                    <Globe size={24} />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-foreground">{competitor.backlinks?.length || 0}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Known Sources</div>
                 </div>
              </div>
              <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-400/10 flex items-center justify-center text-indigo-400 border border-indigo-400/10 group-hover:scale-105 transition-transform">
                    <Zap size={24} fill="currentColor" />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-foreground">{competitor.backlinks?.filter(l => l.is_ai_cited).length || 0}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Found in AI Answers</div>
                 </div>
              </div>
              <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/10 group-hover:scale-105 transition-transform">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-foreground">74.2</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Average Trust Score</div>
                 </div>
              </div>
              <div className="bg-card border border-border rounded-[32px] p-6 shadow-soft flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/10 group-hover:scale-105 transition-transform">
                    <Users size={24} />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-foreground">~840k</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estimated Reach</div>
                 </div>
              </div>
           </div>

           {/* Source Site Grid */}
           <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-soft flex flex-col">
              {/* Toolbar */}
              <div className="p-8 border-b border-border bg-muted/30 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      type="text"
                      placeholder="Search sites or topics..."
                      value={backlinkSearch}
                      onChange={(e) => setBacklinkSearch(e.target.value)}
                      className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-inner"
                    />
                 </div>
                 
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-muted p-1 rounded-xl border border-border shadow-inner">
                       {[
                         { id: 'all', label: 'All Sites', icon: <BarChart2 size={12} /> },
                         { id: 'power', label: 'High Trust (70+)', icon: <Trophy size={12} /> },
                         { id: 'traffic', label: 'Most Popular', icon: <TrendingUp size={12} /> },
                         { id: 'ai-cited', label: 'AI Mentions', icon: <Bot size={12} /> }
                       ].map(f => (
                         <button 
                           key={f.id}
                           onClick={() => setBacklinkFilter(f.id as any)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                             backlinkFilter === f.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                           }`}
                         >
                           {f.icon} {f.label}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto max-h-[600px] no-scrollbar">
                 <table className="w-full border-collapse">
                    <thead className="bg-muted/50 border-b border-border sticky top-0 z-20">
                       <tr className="text-left">
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Where the link is from</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Trust Level</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Popularity</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Link Label</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">AI Status</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">AI Influence</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 relative z-10">
                       {filteredBacklinks.map(renderBacklinkRow)}
                    </tbody>
                 </table>
                 {filteredBacklinks.length === 0 && (
                   <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
                      <Globe size={64} className="mb-6" />
                      <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-widest">No matching sites</h3>
                      <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed">Adjust your filters to discover more connections.</p>
                   </div>
                 )}
              </div>

              {/* Table Footer Insight */}
              <div className="p-8 border-t border-border bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold italic">
                    <Info size={16} className="text-primary-400" />
                    "High Trust sites like TechCrunch are the main reason {competitor.name} shows up in AI tools."
                 </div>
                 <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Live AI Market Data
                 </div>
              </div>
           </div>

           {/* Gap Analysis Banner */}
           <div className="bg-primary-500/5 border border-primary-500/20 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-soft">
              <div className="flex items-center gap-8">
                 <div className="w-20 h-20 rounded-[32px] bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-inner">
                    <Eye size={40} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">Your Missing Citations</h3>
                    <p className="text-sm text-muted-foreground max-w-lg font-medium leading-relaxed">
                       This competitor has <strong className="text-foreground">12 major websites</strong> citing them that don't mention you yet. If you get mentioned on these same sites, your AI ranking could grow by <span className="text-emerald-500 font-black">~14.5%</span>.
                    </p>
                 </div>
              </div>
              <button className="shrink-0 px-8 py-5 bg-foreground text-background hover:bg-foreground/90 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center gap-3">
                 See All Gaps <ArrowRight size={18} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorDetail;
