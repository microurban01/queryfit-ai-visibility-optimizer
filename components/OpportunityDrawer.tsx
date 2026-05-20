
import React from 'react';
import { X, Search, Globe, Zap, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SeoOpportunity } from '../gscTypes';
import { Task } from '../types';

interface OpportunityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: SeoOpportunity | null;
  onCreateTask: (task: Task) => void;
}

const OpportunityDrawer: React.FC<OpportunityDrawerProps> = ({ 
  isOpen, 
  onClose, 
  opportunity, 
  onCreateTask 
}) => {
  if (!isOpen || !opportunity) return null;

  const handleCreateTask = () => {
    const task: Task = {
      id: `task-seo-${Date.now()}`,
      workspace_id: 'ws-current', // In real app, get from context
      query_id: opportunity.trackedQuestionId || '',
      title: `SEO Fix: ${opportunity.type.replace('_', ' ')} for "${opportunity.query}"`,
      steps: [
        `Analyze SERP intent for "${opportunity.query}"`,
        opportunity.recommendedAction,
        'Submit URL to GSC for re-indexing'
      ],
      impact: opportunity.score > 80 ? 'L' : 'M',
      effort: 'S',
      status: 'todo'
    };
    onCreateTask(task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="w-[500px] bg-card border-l border-border h-full relative z-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500 border border-primary-500/20">
                {opportunity.type.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Score: {opportunity.score}
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
              <X size={20} />
            </button>
          </div>
          
          <h2 className="text-2xl font-black text-foreground leading-tight mb-4">
            "{opportunity.query}"
          </h2>
          
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-card border border-border p-3 rounded-xl">
            <Globe size={14} className="text-primary-400" />
            <span className="truncate">{opportunity.page}</span>
            <a href={opportunity.page} target="_blank" rel="noopener noreferrer" className="ml-auto hover:text-foreground">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/20 border border-border rounded-2xl text-center">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Position</div>
              <div className="text-2xl font-black text-foreground">{opportunity.position.toFixed(1)}</div>
            </div>
            <div className="p-4 bg-muted/20 border border-border rounded-2xl text-center">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Impressions</div>
              <div className="text-2xl font-black text-foreground">{opportunity.impressions.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-muted/20 border border-border rounded-2xl text-center">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Clicks</div>
              <div className="text-2xl font-black text-foreground">{opportunity.clicks.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-muted/20 border border-border rounded-2xl text-center">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">CTR</div>
              <div className={`text-2xl font-black ${opportunity.type === 'LOW_CTR' ? 'text-rose-500' : 'text-emerald-500'}`}>
                {(opportunity.ctr * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-primary-500/5 border border-primary-500/10 rounded-3xl p-6">
            <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Search size={14} /> Diagnostic
            </h4>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {opportunity.why}
            </p>
          </div>

          {/* Recommendation */}
          <div>
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> Recommended Action
            </h4>
            <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
              <p className="text-sm font-bold text-foreground mb-4">
                {opportunity.recommendedAction}
              </p>
              <button 
                onClick={handleCreateTask}
                className="w-full py-3 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 hover:border-primary-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Create Strategy Task <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {opportunity.type === 'MISMATCH' && opportunity.expectedTargetUrl && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
              <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Cannibalization Alert</div>
              <div className="text-xs text-muted-foreground mb-1">Target Page:</div>
              <div className="text-xs font-bold text-foreground truncate mb-3">{opportunity.expectedTargetUrl}</div>
              <div className="text-xs text-muted-foreground mb-1">Actual Ranking Page:</div>
              <div className="text-xs font-bold text-foreground truncate">{opportunity.page}</div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDrawer;
