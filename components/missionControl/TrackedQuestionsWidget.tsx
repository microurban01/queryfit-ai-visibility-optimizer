
import React from 'react';
import { Search, ArrowRight, AlertCircle, Trophy, Link2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Query, Priority, Engine } from '../../types';
import { ENGINE_METADATA } from '../../constants';
import InfoTooltip from '../InfoTooltip';

interface TrackedQuestionsWidgetProps {
  queries: Query[];
  onViewQuery: (id: string) => void;
  onViewAll: () => void;
}

const TrackedQuestionsWidget: React.FC<TrackedQuestionsWidgetProps> = ({ queries, onViewQuery, onViewAll }) => {
  // Sort by priority (HIGH first) then gap (largest gap first)
  const sortedQueries = [...queries].sort((a, b) => {
    if (a.priority === Priority.HIGH && b.priority !== Priority.HIGH) return -1;
    if (b.priority === Priority.HIGH && a.priority !== Priority.HIGH) return 1;
    const gapA = a.leaderScore - a.overall_score;
    const gapB = b.leaderScore - b.overall_score;
    return gapB - gapA;
  }).slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col h-full">
      <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
        <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
          <Search size={20} className="text-primary-400" />
          Tracked Questions
          <InfoTooltip content="High-intent questions your customers ask AI. We track if AI models recommend your brand in the answer." />
        </h3>
        <button onClick={onViewAll} className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-1 transition-colors">
          View All <ArrowRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-border/50 flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
        {sortedQueries.map(q => {
          const gap = q.leaderScore - q.overall_score;
          const isTrailing = gap > 0;
          const trend = q.delta_7d;
          
          return (
            <div 
              key={q.id} 
              onClick={() => onViewQuery(q.id)}
              className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="font-bold text-sm text-foreground group-hover:text-primary-400 transition-colors line-clamp-1 flex-1">
                  {q.text}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {trend !== 0 ? (
                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(trend)}%
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
                        <Minus size={10} /> 0%
                    </div>
                  )}
                  <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    q.priority === Priority.HIGH ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {q.priority}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    <span>You vs Leader</span>
                    <span className={isTrailing ? 'text-primary-500' : 'text-emerald-500'}>
                      {isTrailing ? `Trailing by ${gap.toFixed(0)}` : `Leading by ${Math.abs(gap).toFixed(0)}`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden relative">
                    {/* Leader Marker (Background Bar represents Leader if trailing) */}
                    <div className="absolute top-0 left-0 h-full bg-muted-foreground/20" style={{ width: `${q.leaderScore}%` }} />
                    {/* User Score */}
                    <div className={`absolute top-0 left-0 h-full ${isTrailing ? 'bg-primary-500' : 'bg-emerald-500'}`} style={{ width: `${q.overall_score}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                   {q.citations.you > 0 ? (
                     <div className="flex items-center gap-1 text-primary-400" title="Your Citations">
                       <Link2 size={12} /> {q.citations.you}
                     </div>
                   ) : (
                     <div className="flex items-center gap-1 text-rose-500" title="No Citations">
                       <AlertCircle size={12} /> 0
                     </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
        {queries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
            <Search size={32} className="mb-2 text-muted-foreground" />
            <p className="text-xs font-bold text-muted-foreground">No questions tracked yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackedQuestionsWidget;
