
import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Sparkles, Filter, RefreshCw, Layers } from 'lucide-react';
import GscRecommendationCard from '../components/GscRecommendationCard';
import GscVariantGenModal from '../components/GscVariantGenModal';
import { mockService } from '../services/mockDataService';
import { AiRecommendation, TitleMetaVariant } from '../types/gscRecommendationsTypes';
import { Task } from '../types';

const GscRecommendationsPage: React.FC = () => {
  const { actions, seoState } = useWorkspace(); // Assuming seoState has GSC data
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecForVariant, setSelectedRecForVariant] = useState<AiRecommendation | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    // Wait for mock service to generate based on current workspace
    await new Promise(resolve => setTimeout(resolve, 600)); 
    const recs = mockService.getGscRecommendations();
    setRecommendations(recs);
    setLoading(false);
  }, []);

  // Load recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, [seoState, fetchRecommendations]); // Reload if GSC state changes

  const handleCreateTask = (rec: AiRecommendation) => {
    const task: Task = {
      id: `t-rec-${Date.now()}`,
      workspace_id: 'ws-current',
      query_id: '', // Would map if we had query ID reference
      title: rec.title,
      steps: rec.steps,
      impact: rec.priority === 'High' ? 'L' : 'M',
      effort: 'S',
      status: 'todo'
    };
    actions.addTaskFromOpportunity(task);
    mockService.saveRecommendationStatus(rec.id, 'task_created');
    setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'task_created' } : r));
  };

  const handleDismiss = (id: string) => {
    mockService.saveRecommendationStatus(id, 'dismissed');
    setRecommendations(prev => prev.filter(r => r.id !== id));
    actions.showToast({ title: 'Recommendation Dismissed', message: 'It has been removed from your feed.', type: 'info' });
  };

  const handleDeployVariant = (variant: TitleMetaVariant) => {
    if (!selectedRecForVariant) return;
    
    mockService.createExperiment({
      id: `exp-${Date.now()}`,
      workspaceId: 'ws-current',
      type: 'TITLE_META',
      recommendationId: selectedRecForVariant.id,
      query: selectedRecForVariant.trigger.query,
      pageUrl: selectedRecForVariant.trigger.page || '',
      variantChosen: variant,
      deployedAt: new Date().toISOString(),
      baselineMetrics: selectedRecForVariant.trigger.metrics,
      status: 'measuring'
    });

    // Mark recommendation as handled so it leaves the list
    setRecommendations(prev => prev.map(r => r.id === selectedRecForVariant.id ? { ...r, status: 'task_created' } : r));

    actions.showToast({ title: 'Experiment Started', message: 'We are now tracking this change.', type: 'success' });
    setSelectedRecForVariant(null);
  };

  const activeRecs = recommendations.filter(r => r.status !== 'dismissed' && r.status !== 'task_created');

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
            <Sparkles size={24} className="text-primary-500" fill="currentColor" />
            Easy SEO Wins
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Actionable optimizations derived from your real Search Console performance.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 active:scale-95"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          <Filter size={12} /> Priority
        </div>
        <div className="flex gap-2">
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground hover:bg-primary-500 hover:text-white transition-all">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {activeRecs.length > 0 ? activeRecs.map(rec => (
          <GscRecommendationCard 
            key={rec.id}
            recommendation={rec}
            onCreateTask={handleCreateTask}
            onGenerateVariants={() => setSelectedRecForVariant(rec)}
            onDismiss={handleDismiss}
          />
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
            <Layers size={48} className="mb-4" />
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest">All caught up</h3>
            <p className="text-sm font-medium text-muted-foreground">No new optimization opportunities detected.</p>
          </div>
        )}
      </div>

      {/* Conditionally render modal to ensure fresh state on every open */}
      {selectedRecForVariant && (
        <GscVariantGenModal 
          isOpen={true}
          onClose={() => setSelectedRecForVariant(null)}
          recommendation={selectedRecForVariant}
          onDeploy={handleDeployVariant}
        />
      )}
    </div>
  );
};

export default GscRecommendationsPage;
