import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { SuggestedQuery } from '../../types';
import InfoTooltip from '../InfoTooltip';

interface OpportunitiesWidgetProps {
  opportunities: SuggestedQuery[];
  onViewAll: () => void;
}

const OpportunitiesWidget: React.FC<OpportunitiesWidgetProps> = ({ opportunities, onViewAll }) => {
  const topOpps = [...opportunities].sort((a, b) => b.surge - a.surge).slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col h-full relative group/widget">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center relative z-10">
        <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-500" />
          Query Discovery
          <InfoTooltip content="High-velocity queries where your brand is currently invisible but competitors appear in AI answers (mentioned/cited)." />
        </h3>
        {opportunities.length > 0 && (
           <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-indigo-500/10 shadow-glow shadow-indigo-500/5">
             {opportunities.length} New
           </span>
        )}
      </div>

      <div className="p-6 space-y-3 flex-1 overflow-y-auto custom-scrollbar relative z-10">
        {topOpps.length > 0 ? topOpps.map((opp) => (
          <div 
            key={opp.id} 
            onClick={onViewAll}
            className="group relative p-4 rounded-2xl bg-card border border-border hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden shadow-sm"
          >
             {/* Hover State Background */}
             <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/[0.02] transition-colors" />
             
             <div className="flex justify-between items-start gap-4 mb-3 relative z-10">
                <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-relaxed group-hover:text-indigo-400 transition-colors">
                  "{opp.text}"
                </h4>
                <div className="shrink-0 p-1.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                   <ArrowRight size={12} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
             </div>

             <div className="flex items-center gap-2 relative z-10">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                   <TrendingUp size={10} className="text-emerald-500" />
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">+{opp.surge}% Surge</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/5 border border-rose-500/10">
                   <AlertCircle size={10} className="text-rose-500" />
                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Gap: {opp.leaderScore}%</span>
                </div>
             </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-8">
            <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mb-3">
               <Sparkles size={20} className="text-muted-foreground" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No new opportunities</p>
          </div>
        )}
      </div>
      
      <div className="p-6 pt-2 shrink-0 relative z-10">
         <button 
           onClick={onViewAll} 
           className="w-full py-2 bg-background border border-border hover:border-primary-500 hover:text-primary-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
         >
           View Full Feed <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default OpportunitiesWidget;