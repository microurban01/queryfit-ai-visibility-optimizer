import React, { useState } from 'react';
import { Users, ArrowUpRight, Trophy, ArrowRight } from 'lucide-react';
import { Competitor, Query } from '../../types';
import InfoTooltip from '../InfoTooltip';

interface TopRivalsWidgetProps {
  competitors: Competitor[];
  queries: Query[];
  onManageRivals: () => void;
  onViewCompetitor: (id: string) => void;
}

const TopRivalsWidget: React.FC<TopRivalsWidgetProps> = ({ competitors, queries, onManageRivals, onViewCompetitor }) => {
  const [mode, setMode] = useState<'global' | 'tracked'>('global');

  // Aggregate "Global" leaders from actual tracked queries
  const globalLeaders = React.useMemo(() => {
    const counts: Record<string, number> = {};
    queries.forEach(q => {
      if (q.leaderName && q.leaderName !== 'You' && q.leaderName !== 'TechFlow SaaS') {
        counts[q.leaderName] = (counts[q.leaderName] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => {
        const comp = competitors.find(c => c.name === name);
        return { 
          name, 
          count, 
          isTracked: !!comp,
          id: comp?.id 
        };
      });
  }, [queries, competitors]);

  const trackedRivals = React.useMemo(() => {
    return competitors.map(c => ({
      id: c.id,
      name: c.name,
      count: queries.filter(q => q.leaderName === c.name).length,
      isTracked: true
    })).sort((a, b) => b.count - a.count);
  }, [competitors, queries]);

  const list = mode === 'global' ? globalLeaders : trackedRivals;

  return (
    <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col h-full">
      <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
            <Users size={20} className="text-amber-400" />
            Top Rivals
            <InfoTooltip content="Competitors that AI models recommend instead of you." />
          </h3>
          {list.length > 0 && (
            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-amber-500/10">
              {list.length}
            </span>
          )}
        </div>
        
        <button 
          onClick={onManageRivals}
          className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-1.5 transition-colors group"
        >
          See All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="px-4 pt-4 shrink-0">
        <div className="flex bg-muted p-1 rounded-xl border border-border">
          <button 
            onClick={() => setMode('global')}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'global' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Global Leaders
          </button>
          <button 
            onClick={() => setMode('tracked')}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'tracked' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            My Rivals
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {list.length > 0 ? list.map((rival, i) => (
          <div 
            key={i} 
            onClick={() => rival.id && onViewCompetitor(rival.id)}
            className={`flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/50 hover:border-primary-500/20 transition-all group ${rival.id ? 'cursor-pointer hover:bg-muted/30' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center font-black text-xs text-muted-foreground shadow-sm group-hover:text-primary-500 transition-colors">
                {rival.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-foreground group-hover:text-primary-500 transition-colors">{rival.name}</div>
                <div className="text-[9px] font-medium text-muted-foreground">Leads {rival.count} queries</div>
              </div>
            </div>
            {mode === 'global' && !rival.isTracked ? (
              <span className="text-[8px] font-black bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded uppercase border border-primary-500/10">
                Untracked
              </span>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (rival.id) onViewCompetitor(rival.id);
                }}
                className="p-1.5 hover:bg-card rounded-lg text-muted-foreground hover:text-primary-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        )) : (
          <div className="text-center py-8 opacity-50 flex flex-col items-center justify-center h-full">
            <Trophy size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-[10px] font-black text-muted-foreground uppercase">No data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRivalsWidget;