
import React from 'react';
import { SeoExperiment } from '../types/gscRecommendationsTypes';
import { FlaskConical, TrendingUp, TrendingDown, Minus, Clock, CheckCircle2 } from 'lucide-react';

interface GscExperimentCardProps {
  experiment: SeoExperiment;
}

const GscExperimentCard: React.FC<GscExperimentCardProps> = ({ experiment }) => {
  const { status, type, query, variantChosen, baselineMetrics, currentMetrics, deployedAt } = experiment;

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'measuring': return 'Gathering Data';
      case 'winner': return 'Success';
      case 'no_change': return 'Inconclusive';
      default: return s.charAt(0).toUpperCase() + s.slice(1);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'draft': return 'bg-muted text-muted-foreground border-border';
      case 'deployed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'measuring': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'winner': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getTypeLabel = (t: string) => {
      if (t === 'TITLE_META') return 'Headline Test';
      if (t === 'CONTENT') return 'Content Update';
      return t;
  };

  const calculateDelta = (metric: 'ctr' | 'clicks' | 'position') => {
    if (!currentMetrics) return null;
    const base = baselineMetrics[metric];
    const curr = currentMetrics[metric];
    
    if (metric === 'position') {
      const diff = base - curr; // Lower is better
      return { val: diff, improved: diff > 0 };
    }
    
    const diff = curr - base;
    const pct = base > 0 ? (diff / base) * 100 : 0;
    return { val: diff, pct, improved: diff > 0 };
  };

  const deltaCtr = calculateDelta('ctr');
  const deltaPos = calculateDelta('position');

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary-500/20 transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(status)}`}>
              {getStatusLabel(status)}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <FlaskConical size={12} /> {getTypeLabel(type)}
            </span>
          </div>
          <h4 className="text-sm font-black text-foreground truncate max-w-xs" title={query}>
            "{query}"
          </h4>
        </div>
        <div className="text-right">
          {deployedAt && (
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              {new Date(deployedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {variantChosen && (
        <div className="bg-muted/30 p-3 rounded-xl border border-border/50 mb-4">
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Variant Applied</div>
          <div className="text-xs font-medium text-foreground line-clamp-1" title={variantChosen.title}>{variantChosen.title}</div>
        </div>
      )}

      {currentMetrics ? (
        <div className="mt-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/20 rounded-xl border border-border/30 text-center">
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">CTR Change</div>
                <div className={`text-lg font-black flex items-center justify-center gap-1 ${deltaCtr?.improved ? 'text-emerald-500' : 'text-rose-500'}`}>
                {deltaCtr?.improved ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {deltaCtr && (deltaCtr.val * 100).toFixed(1)}%
                </div>
            </div>
            <div className="p-3 bg-muted/20 rounded-xl border border-border/30 text-center">
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Position</div>
                <div className="text-lg font-black text-foreground">
                {currentMetrics.position.toFixed(1)} <span className="text-[10px] text-muted-foreground">vs {baselineMetrics.position.toFixed(1)}</span>
                </div>
            </div>
            </div>
            
            {status === 'measuring' && (
                <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground">
                        <span>Progress</span>
                        <span>Day 5 of 14</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: '35%' }} />
                    </div>
                </div>
            )}

            {experiment.resultSummary && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                    <p className="text-xs font-bold text-emerald-600">{experiment.resultSummary}</p>
                </div>
            )}
        </div>
      ) : (
        <div className="mt-auto p-4 bg-muted/10 rounded-xl border border-dashed border-border flex items-center justify-center text-xs font-bold text-muted-foreground gap-2">
          <Clock size={14} /> Waiting for Data...
        </div>
      )}
    </div>
  );
};

export default GscExperimentCard;
