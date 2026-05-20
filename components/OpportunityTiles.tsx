
import React from 'react';
import { SeoOpportunity } from '../gscTypes';
import { MousePointer2, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface OpportunityTilesProps {
  opportunities: SeoOpportunity[];
}

const OpportunityTiles: React.FC<OpportunityTilesProps> = ({ opportunities }) => {
  const counts = {
    LOW_CTR: opportunities.filter(o => o.type === 'LOW_CTR').length,
    QUICK_WIN: opportunities.filter(o => o.type === 'QUICK_WIN').length,
    RISING: opportunities.filter(o => o.type === 'RISING').length,
    MISMATCH: opportunities.filter(o => o.type === 'MISMATCH').length,
  };

  const tiles = [
    { label: 'Low CTR', count: counts.LOW_CTR, icon: <MousePointer2 size={18} />, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'High views, low clicks' },
    { label: 'Quick Wins', count: counts.QUICK_WIN, icon: <Zap size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Pos 4-15 opportunities' },
    { label: 'Rising Stars', count: counts.RISING, icon: <TrendingUp size={18} />, color: 'text-primary-400', bg: 'bg-primary-500/10', desc: 'Momentum spikes' },
    { label: 'Mismatch', count: counts.MISMATCH, icon: <AlertTriangle size={18} />, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Wrong page ranking' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary-500/20 transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-xl ${tile.bg} ${tile.color} border border-transparent group-hover:border-${tile.color.split('-')[1]}-500/20`}>
              {tile.icon}
            </div>
            <div className={`text-2xl font-black ${tile.count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {tile.count}
            </div>
          </div>
          <div>
            <div className="text-xs font-black text-foreground uppercase tracking-widest">{tile.label}</div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{tile.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OpportunityTiles;
