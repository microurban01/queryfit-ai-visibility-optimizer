import React from 'react';
import { Target, ArrowRight, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { Task, Query } from '../../types';
import InfoTooltip from '../InfoTooltip';

interface NextBestActionsWidgetProps {
  tasks: Task[];
  queries: Query[];
  onOpenStrategy: () => void;
  lastScanAt: string;
}

const NextBestActionsWidget: React.FC<NextBestActionsWidgetProps> = ({ tasks, queries, onOpenStrategy, lastScanAt }) => {
  // Sort tasks: High Impact + Quick Wins first
  // Removed slice to allow scrolling of all pending tasks
  const priorityTasks = tasks
    .filter(t => t.status === 'todo')
    .sort((a, b) => {
      const scoreA = (a.impact === 'L' ? 3 : a.impact === 'M' ? 2 : 1) + (a.effort === 'S' ? 2 : 0);
      const scoreB = (b.impact === 'L' ? 3 : b.impact === 'M' ? 2 : 1) + (b.effort === 'S' ? 2 : 0);
      return scoreB - scoreA;
    });

  return (
    <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft flex flex-col h-full">
      <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-lg tracking-tight text-foreground flex items-center gap-2">
            <Target size={20} className="text-primary-400" />
            Next Actions
            <InfoTooltip content="Recommended tasks to improve your AI rankings and visibility." />
          </h3>
          {priorityTasks.length > 0 && (
            <span className="bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-primary-500/10">
              {priorityTasks.length}
            </span>
          )}
        </div>
        
        <button 
          onClick={onOpenStrategy}
          className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-1.5 transition-colors group"
        >
          See All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="p-6 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {priorityTasks.length > 0 ? priorityTasks.map(task => {
          const queryText = queries.find(q => q.id === task.query_id)?.text;
          
          return (
            <div key={task.id} className="p-4 bg-muted/20 border border-border/50 rounded-2xl hover:border-primary-500/20 transition-all group shrink-0">
              <div className="flex gap-2 mb-2">
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                  task.impact === 'L' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {task.impact === 'L' ? 'High Impact' : 'Normal'}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border flex items-center gap-1">
                  <Clock size={8} /> {task.effort === 'S' ? 'Quick' : '15m+'}
                </span>
              </div>
              
              <h4 className="text-xs font-bold text-foreground mb-1 line-clamp-2">{task.title}</h4>
              <p className="text-[10px] text-muted-foreground truncate mb-3">
                For: "{queryText || 'Unknown Query'}"
              </p>

              <button 
                onClick={onOpenStrategy}
                className="w-full py-2 bg-background border border-border hover:border-primary-500 hover:text-primary-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
              >
                Open in Strategy <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-8">
            <CheckCircle2 size={32} className="mb-2 text-emerald-500" />
            <p className="text-xs font-bold text-foreground">All caught up!</p>
            <button onClick={onOpenStrategy} className="text-[10px] text-primary-500 mt-2 hover:underline">View Strategy Board</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextBestActionsWidget;