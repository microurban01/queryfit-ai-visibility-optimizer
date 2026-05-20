
import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Unlink, 
  ShieldAlert, 
  Swords, 
  MessageSquareWarning, 
  ArrowRight,
  AlertTriangle,
  FileWarning,
  ShieldCheck,
  CheckCircle2,
  Activity,
  X
} from 'lucide-react';
import { GeoAlert } from '../../types';
import InfoTooltip from '../InfoTooltip';

interface GeoAlertsSectionProps {
  alerts: GeoAlert[];
  onResolve: (id: string) => void;
}

const GeoAlertsSection: React.FC<GeoAlertsSectionProps> = ({ alerts, onResolve }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal state if new alerts appear
  useEffect(() => {
    if (alerts.length > 0) {
      setIsDismissed(false);
    }
  }, [alerts.length]);

  // If dismissed and no alerts, hide the entire section to save space
  if (alerts.length === 0 && isDismissed) {
    return null;
  }
  
  const getSeverityStyles = (severity: GeoAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-rose-500/20 hover:border-rose-500/40',
          iconColor: 'text-rose-500',
          iconBg: 'bg-rose-500/10',
          indicator: 'bg-rose-500'
        };
      case 'warning':
        return {
          border: 'border-amber-500/20 hover:border-amber-500/40',
          iconColor: 'text-amber-500',
          iconBg: 'bg-amber-500/10',
          indicator: 'bg-amber-500'
        };
      default:
        return {
          border: 'border-border hover:border-primary-500/30',
          iconColor: 'text-primary-400',
          iconBg: 'bg-primary-500/10',
          indicator: 'bg-primary-500'
        };
    }
  };

  const getConfidenceBadge = (confidence: GeoAlert['confidence']) => {
    if (!confidence) return null;
    const colors = {
      high: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      low: 'bg-muted text-muted-foreground border-border'
    };
    return (
      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${colors[confidence]}`}>
        {confidence} Confidence
      </span>
    );
  };

  const getAlertIcon = (type: GeoAlert['type']) => {
    switch(type) {
      case 'sentiment': return <MessageSquareWarning size={20} />;
      case 'misinformation': return <BrainCircuit size={20} />;
      case 'citation': return <Unlink size={20} />;
      case 'blocking': return <ShieldAlert size={20} />;
      case 'competitor': return <Swords size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };

  // Limit to top 5 highest priority alerts
  const visibleAlerts = alerts.slice(0, 5);

  // Dynamic grid configuration to prevent empty space
  const gridColsClass = (() => {
    switch (visibleAlerts.length) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
    }
  })();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Activity size={20} className="text-muted-foreground" />
            Scan-Based Risk Monitor
            <InfoTooltip content="Risks detected in the latest scan compared to your baseline. Includes tone shifts, access issues, and competitor movements." />
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Issues detected in the latest scan vs previous baseline.
          </p>
        </div>
        <div className="flex gap-2">
           <span className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border">
             <span className={`w-2 h-2 rounded-full ${alerts.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></span>
             {alerts.length > 0 ? `${alerts.length} Risks Detected` : 'No Risks Found'}
           </span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="relative w-full p-8 rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
          <button 
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 right-4 p-2 text-emerald-500/30 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all"
            title="Dismiss & Hide Section"
          >
            <X size={16} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/10 shadow-lg shadow-emerald-500/10">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-lg font-black text-foreground tracking-tight">Baseline Secure</h3>
          <p className="text-sm text-muted-foreground font-medium mt-2 max-w-md leading-relaxed">
            No critical sentiment shifts, citation losses, or crawl blocks detected in the latest scan.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl">
            <CheckCircle2 size={12} /> Scan Complete
          </div>
        </div>
      ) : (
        <>
          <div className={`grid gap-4 ${gridColsClass}`}>
            {visibleAlerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              return (
                <div 
                  key={alert.id}
                  className={`relative p-5 rounded-2xl border bg-card/50 hover:bg-card transition-all group shadow-sm ${styles.border} flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  {/* Severity Dot */}
                  <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${styles.indicator} opacity-60`} />

                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${styles.iconBg} ${styles.iconColor}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                  </div>

                  <div className="flex-1 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{alert.engine}</span>
                      {getConfidenceBadge(alert.confidence)}
                    </div>
                    <h3 className="text-sm font-black mb-1.5 text-foreground">{alert.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-3">
                      {alert.description}
                    </p>
                    {alert.evidence && (
                      <div className="text-[10px] font-mono text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/50 truncate">
                        Evidence: {alert.evidence}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-[9px] font-bold text-muted-foreground/50">{alert.timestamp}</span>
                    <button 
                      onClick={() => onResolve(alert.id)}
                      className="py-2 px-4 bg-background border border-border hover:border-primary-500 hover:text-primary-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      {alert.action} <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {alerts.length > 5 && (
            <div className="flex justify-center">
              <button className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-1 transition-colors">
                View all {alerts.length} risks <ArrowRight size={10} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GeoAlertsSection;
