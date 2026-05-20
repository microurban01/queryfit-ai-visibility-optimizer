
import React from 'react';
import { AiRecommendation } from '../types/gscRecommendationsTypes';
import { Lightbulb, ArrowRight, Wand2, CheckCircle2, TrendingUp } from 'lucide-react';

interface GscRecommendationCardProps {
  recommendation: AiRecommendation;
  onCreateTask: (rec: AiRecommendation) => void;
  onGenerateVariants: (rec: AiRecommendation) => void;
  onDismiss: (id: string) => void;
}

const GscRecommendationCard: React.FC<GscRecommendationCardProps> = ({ 
  recommendation, 
  onCreateTask, 
  onGenerateVariants,
  onDismiss
}) => {
  const { trigger, title, plainWhy, steps, estimatedImpact, priority, optionalAiActions } = recommendation;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary-500/30 transition-all group relative overflow-hidden">
      {priority === 'High' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      )}
      
      <div className="flex justify-between items-start mb-4 pl-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
              priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
              priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {priority} Priority
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {trigger.type.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-lg font-black text-foreground leading-tight group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-emerald-500 tracking-tighter">
            +{estimatedImpact.rangeLow}-{estimatedImpact.rangeHigh}
          </div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Est. Monthly {estimatedImpact.metric}
          </div>
        </div>
      </div>

      <div className="pl-3 mb-6">
        <p className="text-sm text-muted-foreground font-medium mb-4 leading-relaxed">
          {plainWhy}
        </p>
        
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <ul className="space-y-2">
            {steps.slice(0, 3).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-medium text-foreground/80">
                <CheckCircle2 size={14} className="text-primary-500 shrink-0 mt-0.5" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pl-3 flex items-center gap-3">
        <button 
          onClick={() => onCreateTask(recommendation)}
          className="flex-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 hover:border-primary-500/30 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          Create Task <ArrowRight size={14} />
        </button>
        
        {optionalAiActions.canGenerateTitleMeta && (
          <button 
            onClick={() => onGenerateVariants(recommendation)}
            className="px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
          >
            <Wand2 size={14} /> AI Variants
          </button>
        )}

        <button 
          onClick={() => onDismiss(recommendation.id)}
          className="px-4 py-2.5 hover:bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Dismiss
        </button>
      </div>
      
      {/* Evidence Footer */}
      <div className="mt-4 pt-4 border-t border-border/50 pl-3 flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
        <span>Proof:</span>
        <span className="flex items-center gap-1"><TrendingUp size={10} /> {trigger.metrics.clicks} Clicks</span>
        <span className="flex items-center gap-1">{(trigger.metrics.ctr * 100).toFixed(1)}% CTR</span>
        <span className="flex items-center gap-1">Pos #{trigger.metrics.position.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default GscRecommendationCard;
