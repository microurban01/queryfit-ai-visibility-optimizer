
import React from 'react';
import { SeoOpportunity } from '../gscTypes';
import { ArrowUpRight, MousePointer2, Eye, Percent, Trophy } from 'lucide-react';

interface OpportunityTableProps {
  opportunities: SeoOpportunity[];
  onSelect: (opportunity: SeoOpportunity) => void;
}

const OpportunityTable: React.FC<OpportunityTableProps> = ({ opportunities, onSelect }) => {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-500';
    if (score >= 60) return 'bg-amber-500/20 text-amber-500';
    return 'bg-muted text-muted-foreground';
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'LOW_CTR': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'QUICK_WIN': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'RISING': return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
      case 'MISMATCH': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4 pl-6">Score</th>
              <th className="p-4">Opportunity Type</th>
              <th className="p-4">Query / Top Page</th>
              <th className="p-4 text-center">Impressions</th>
              <th className="p-4 text-center">Clicks</th>
              <th className="p-4 text-center">CTR</th>
              <th className="p-4 text-center">Position</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {opportunities.map((op) => (
              <tr 
                key={op.id} 
                onClick={() => onSelect(op)}
                className="group hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <td className="p-4 pl-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${getScoreColor(op.score)}`}>
                    {op.score}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getTypeBadge(op.type)}`}>
                    {op.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 max-w-xs">
                  <div className="font-bold text-foreground truncate" title={op.query}>"{op.query}"</div>
                  <div className="text-[10px] text-muted-foreground font-medium truncate mt-1 flex items-center gap-1">
                    <ArrowUpRight size={10} /> {op.page?.replace('https://', '')}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-xs font-bold text-foreground">{op.impressions.toLocaleString()}</div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-xs font-bold text-foreground">{op.clicks.toLocaleString()}</div>
                </td>
                <td className="p-4 text-center">
                  <div className={`text-xs font-black ${op.type === 'LOW_CTR' ? 'text-rose-500' : 'text-foreground'}`}>
                    {(op.ctr * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-xs font-bold text-foreground flex items-center justify-center gap-1">
                    {op.position <= 3 && <Trophy size={10} className="text-amber-400" />}
                    {op.position.toFixed(1)}
                  </div>
                </td>
                <td className="p-4 text-right pr-6">
                  <button className="px-3 py-1.5 bg-muted hover:bg-primary-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {opportunities.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-muted-foreground opacity-50">
                  <div className="flex flex-col items-center">
                    <MousePointer2 size={32} className="mb-2" />
                    <span className="text-xs font-black uppercase tracking-widest">No opportunities match your filters</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunityTable;
