
import React from 'react';
import { Smartphone, Monitor, AlertCircle, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { PagePerformanceSummary, CwvSnapshot } from '../types/performanceTypes';
import { getMetricStatus, getStatusColor, getStatusBg, formatMetricValue } from '../constants/coreWebVitalsThresholds';
import InfoTooltip from './InfoTooltip';

interface CoreWebVitalsStripProps {
  data: PagePerformanceSummary;
  onViewDetails: () => void;
  className?: string;
}

const MetricChip: React.FC<{ label: 'LCP' | 'INP' | 'CLS', value: number }> = ({ label, value }) => {
  const status = getMetricStatus(label.toLowerCase() as any, value);
  const colorClass = getStatusColor(status);
  
  const friendlyName = {
    LCP: "Loading",
    INP: "Interactivity",
    CLS: "Stability"
  }[label];

  // Business-First Tooltips
  const tips = {
    LCP: "Loading Speed: Slow sites lose visitors and rank lower in AI search.",
    INP: "Click Responsiveness: Delays when clicking buttons cause user frustration.",
    CLS: "Visual Stability: Elements jumping around destroys trust and readability."
  };

  const statusLabel = status === 'good' ? 'Good' : status === 'needs_work' ? 'Fair' : 'Poor';

  return (
    <InfoTooltip content={tips[label]} className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center w-full">
        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-70 mb-0.5 block text-center truncate w-full">
            {friendlyName}
        </span>
        <div className="flex items-baseline gap-1">
            <span className={`text-[11px] font-black ${colorClass}`}>{statusLabel}</span>
            <span className="text-[9px] text-muted-foreground font-medium opacity-50">({formatMetricValue(label.toLowerCase() as any, value)})</span>
        </div>
      </div>
    </InfoTooltip>
  );
};

const DeviceColumn: React.FC<{ snapshot: CwvSnapshot }> = ({ snapshot }) => {
  const isGood = snapshot.status === 'good';
  
  return (
    <div className={`flex-1 p-3 rounded-xl border flex flex-col justify-center transition-all ${getStatusBg(snapshot.status)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {snapshot.device === 'mobile' ? <Smartphone size={12} className="text-foreground" /> : <Monitor size={12} className="text-foreground" />}
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground">
            {snapshot.device}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${getStatusColor(snapshot.status)}`}>
          {isGood ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          {isGood ? 'Pass' : 'Needs Fix'}
        </div>
      </div>
      
      <div className="flex items-center justify-between px-1 gap-2">
        <MetricChip label="LCP" value={snapshot.metrics.lcp} />
        <div className="w-px h-4 bg-border/50 self-center" />
        <MetricChip label="INP" value={snapshot.metrics.inp} />
        <div className="w-px h-4 bg-border/50 self-center" />
        <MetricChip label="CLS" value={snapshot.metrics.cls} />
      </div>
    </div>
  );
};

const CoreWebVitalsStrip: React.FC<CoreWebVitalsStripProps> = ({ data, onViewDetails, className = "" }) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap size={10} className="text-amber-400" fill="currentColor" />
          Experience Score
          <InfoTooltip content="Real-world user experience metrics that impact your visibility." size={10} />
        </h4>
        <button 
          onClick={onViewDetails}
          className="text-[9px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          View Report <ArrowRight size={10} />
        </button>
      </div>

      <div className="flex gap-2">
        <DeviceColumn snapshot={data.latestMobile} />
        <DeviceColumn snapshot={data.latestDesktop} />
      </div>
    </div>
  );
};

export default CoreWebVitalsStrip;
