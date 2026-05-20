
import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Activity, Minus } from 'lucide-react';
import { Query } from '../../types';
import InfoTooltip from '../InfoTooltip';

interface TopMoversWidgetProps {
  queries: Query[];
  onViewQuery: (id: string) => void;
}

const TopMoversWidget: React.FC<TopMoversWidgetProps> = ({ queries, onViewQuery }) => {
  
  const drops = [...queries]
    .filter(q => q.delta_7d < 0)
    .sort((a, b) => a.delta_7d - b.delta_7d)
    .slice(0, 3);

  const gains = [...queries]
    .filter(q => q.delta_7d > 0)
    .sort((a, b) => b.delta_7d - a.delta_7d)
    .slice(0, 3);

  const renderList = (items: Query[], type: 'drops' | 'gains') => {
    if (items.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-6 bg-muted/20 rounded-2xl border border-dashed border-border/50">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
            <Minus size={14} className="text-muted-foreground" />
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            No {type}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((q) => {
          const prevScore = Math.max(0, Math.min(100, q.overall_score - q.delta_7d));
          return (
            <div 
              key={q.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary-500/30 transition-all group shadow-sm"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                    type === 'drops'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {q.delta_7d > 0 ? '+' : ''}{q.delta_7d}%
                  </span>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-muted-foreground/40">{prevScore}</span>
                    <ArrowRight size={10} className="text-muted-foreground/30" />
                    <span className={`text-xl font-black ${type === 'drops' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {q.overall_score}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold text-foreground truncate" title={q.text}>
                  "{q.text}"
                </div>
              </div>

              <button 
                onClick={() => onViewQuery(q.id)}
                className="shrink-0 p-3 bg-muted hover:bg-primary-600 hover:text-white rounded-xl text-muted-foreground transition-all flex items-center justify-center group/btn"
              >
                <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/20 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
            <Activity size={16} className="text-primary-400" />
            Movement Tracker
            <InfoTooltip content="Queries with the largest visibility shifts over the last 7 days." />
          </h3>
        </div>
      </div>

      {/* Split Lists */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Drops Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="p-1.5 bg-rose-500/10 rounded-md text-rose-500">
              <TrendingDown size={12} />
            </div>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Top Drops</span>
          </div>
          {renderList(drops, 'drops')}
        </div>

        {/* Gains Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-500">
              <TrendingUp size={12} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Top Gains</span>
          </div>
          {renderList(gains, 'gains')}
        </div>

      </div>
    </div>
  );
};

export default TopMoversWidget;
