import React from 'react';
import { Activity, TrendingDown, Zap, AlertTriangle, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { PulseEvent } from '../../services/mockDataService';
import InfoTooltip from '../InfoTooltip';

interface PulseFeedProps {
  events: PulseEvent[];
}

const PulseFeed: React.FC<PulseFeedProps> = ({ events }) => {
  
  const getIcon = (type: PulseEvent['type']) => {
    switch (type) {
      case 'score_drop': return <TrendingDown size={14} className="text-rose-500" />;
      case 'competitor_gain': return <ShieldAlert size={14} className="text-amber-500" />;
      case 'scan_complete': return <Zap size={14} className="text-emerald-500" />;
      case 'credit_low': return <AlertCircle size={14} className="text-orange-500" />;
      case 'engine_error': return <AlertTriangle size={14} className="text-rose-500" />;
      case 'new_opportunity': return <Sparkles size={14} className="text-primary-400" />;
      default: return <Activity size={14} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col h-full">
      <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
        <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
          <Activity size={20} className="text-primary-400" />
          The Pulse
          <InfoTooltip content="A live timeline of score changes and new events." />
        </h3>
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-card px-2 py-1 rounded border border-border">Live</div>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {events.map(event => (
          <div key={event.id} className="flex gap-3 relative group">
            {/* Timeline Line */}
            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border group-last:hidden" />
            
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-border bg-muted/30">
              {getIcon(event.type)}
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-foreground">{event.title}</h4>
                <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-8 opacity-50">
            <p className="text-xs font-bold text-muted-foreground">No recent activity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PulseFeed;