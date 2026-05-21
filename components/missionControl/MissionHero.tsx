import React, { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Eye, Zap, Smartphone, Monitor, Link2, AlertCircle, Calendar } from 'lucide-react';
import { Engine } from '../../types';
import { PagePerformanceSummary } from '../../types/performanceTypes';
import { ENGINE_METADATA } from '../../constants';
import { getMetricStatus, getStatusColor, formatMetricValue } from '../../constants/coreWebVitalsThresholds';
import InfoTooltip from '../InfoTooltip';

interface MissionHeroProps {
  score: number;
  delta: number;
  engineScores: Record<Engine, number>;
  trendData: { day: string; score: number }[];
  lastScanAt: string;
  leaderScore?: number;
  leaderName?: string;
  performanceData?: PagePerformanceSummary;
  isGscConnected?: boolean;
  timeRange?: '7d' | '30d' | '90d' | 'custom';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'custom') => void;
  onCustomDateChange?: (start: Date, end: Date) => void;
}

const MissionHero: React.FC<MissionHeroProps> = ({ 
  score, 
  delta, 
  engineScores, 
  trendData,
  lastScanAt,
  leaderScore = 78,
  leaderName = "LogicStream",
  performanceData,
  isGscConnected = false,
  timeRange = '30d',
  onTimeRangeChange,
  onCustomDateChange
}) => {
  const isPositive = delta >= 0;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Guard against empty data for Recharts
  const safeTrendData = trendData && trendData.length > 0 ? trendData : [{ day: 'Now', score: score }];

  // Dynamic score color
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500';
  const gap = Math.abs(leaderScore - score);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const applyCustomDate = () => {
    if (startDate && endDate && onCustomDateChange) {
      onCustomDateChange(new Date(startDate), new Date(endDate));
      setShowDatePicker(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-[32px] p-8 shadow-soft relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 p-32 bg-primary-500/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary-500/10 transition-all blur-3xl pointer-events-none" />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10 mb-8">
        
        {/* Left: Score & Leader Stats */}
        <div className="xl:col-span-4 flex flex-col justify-between xl:border-r border-border/50 xl:pr-8">
          
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                <Eye size={20} className="text-primary-400" />
                Visibility Index
                <InfoTooltip content="Your overall 'Share of Voice' in AI answers, calculated as the average score of all your tracked questions." />
             </h2>
             <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{delta}%
             </span>
          </div>

          <div className="flex flex-col items-center py-4">
            <span className={`text-7xl font-black tracking-tighter ${scoreColor}`}>
              {score}
            </span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Overall Score</span>
          </div>

          <div className="space-y-3 mt-4">
             <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  Market Leader
                  <InfoTooltip content="The #1 brand that AI recommends for your tracked topics." size={10} />
                </span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Gap: {gap}%</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                 <span className="text-sm font-bold text-foreground">{leaderName}</span>
                 <span className="text-sm font-black text-primary-400">{leaderScore}</span>
             </div>
             <div className="flex justify-center mt-2">
               <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  <Activity size={10} /> Last scan: {new Date(lastScanAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </div>
             </div>
          </div>

        </div>

        {/* Right: Trend Chart & Core Web Vitals */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Time Range Selector */}
          <div className="flex justify-end">
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border w-fit relative">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    onTimeRangeChange?.(range);
                    setShowDatePicker(false);
                  }}
                  className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                    timeRange === range
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
              <div className="relative" ref={datePickerRef}>
                <button
                    onClick={() => {
                      onTimeRangeChange?.('custom');
                      setShowDatePicker(!showDatePicker);
                    }}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${
                      timeRange === 'custom'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
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
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">End</label>
                              <input 
                                  type="date" 
                                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-border">
                          <button 
                              onClick={applyCustomDate}
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

          <div className="w-full min-w-0 shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp size={10} className="text-primary-400" />
                Visibility Trend
              </span>
            </div>
            <div className="w-full h-[200px] min-h-[200px]">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={safeTrendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="rgba(255,255,255,0.35)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                    fontWeight="bold"
                    interval="preserveStartEnd"
                    minTickGap={32}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.35)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickCount={5}
                    fontWeight="bold"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                    labelStyle={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '900' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Visibility"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="url(#heroGradient)"
                    animationDuration={800}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Integrated Core Web Vitals */}
          {performanceData && (
            <div className="flex flex-col gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl relative">
               
               <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-amber-400" fill="currentColor" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      Page Speed & UX 
                      {isGscConnected ? (
                        <span className="text-emerald-500 ml-1">(Real Users)</span>
                      ) : (
                        <span className="text-amber-500 ml-1">(Estimated)</span>
                      )}
                    </span>
                  </div>
                  {!isGscConnected && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle size={10} className="text-amber-500" />
                      <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">Connect GSC for Accuracy</span>
                    </div>
                  )}
               </div>

               {[
                 { type: 'mobile', icon: Smartphone, data: performanceData.latestMobile },
                 { type: 'desktop', icon: Monitor, data: performanceData.latestDesktop }
               ].map((device, idx) => (
                 <div key={device.type} className={`flex items-center gap-4 ${idx === 0 ? 'pb-3 border-b border-border/50' : 'pt-1'}`}>
                    <div className="w-20 flex items-center gap-2 text-muted-foreground">
                        <div className="p-1.5 bg-muted/50 rounded-md">
                          <device.icon size={12} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest">{device.type}</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-3 gap-4">
                        {(['lcp', 'inp', 'cls'] as const).map(metric => {
                          const value = device.data.metrics[metric];
                          const status = getMetricStatus(metric, value);
                          const color = getStatusColor(status);
                          
                          return (
                            <div key={metric} className="flex flex-col">
                              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 opacity-70">{metric.toUpperCase()}</span>
                              <span className={`text-xs font-black ${color}`}>
                                {formatMetricValue(metric, value)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    
                    <div className="w-16 flex justify-end">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                         device.data.status === 'good' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                         device.data.status === 'poor' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                         'bg-amber-500/10 text-amber-500 border-amber-500/20'
                       }`}>
                          {device.data.status === 'good' ? 'Pass' : 'Fail'}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Engine Breakdown Strip */}
      <div className="relative z-10 pt-8 border-t border-border/50 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Object.values(Engine).map(engine => {
          const score = engineScores[engine] || 0;
          const meta = ENGINE_METADATA[engine];
          
          return (
            <div key={engine} className="flex flex-col gap-2 group cursor-pointer hover:bg-muted/20 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <div 
                   className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover:text-foreground transition-colors"
                   style={{ color: score > 0 ? meta.color : undefined }}
                 >
                   {React.cloneElement(meta.icon as React.ReactElement<any>, { size: 14 })}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-foreground transition-colors">{meta.name}</span>
              </div>
              <div className="flex items-end gap-2 px-1">
                 <span className="text-2xl font-black text-foreground">{score}</span>
                 <span className="text-[9px] font-bold text-muted-foreground mb-1.5">/100</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden px-1">
                 {/* Unified Primary Color Bar for cleaner look */}
                 <div 
                   className="h-full rounded-full transition-all duration-1000 bg-primary-500"
                   style={{ 
                     width: `${score}%`,
                     opacity: score > 0 ? 1 : 0.3
                   }}
                 />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MissionHero;