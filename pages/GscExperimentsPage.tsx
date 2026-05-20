
import React, { useEffect, useState } from 'react';
import { FlaskConical, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { mockService } from '../services/mockDataService';
import GscExperimentCard from '../components/GscExperimentCard';
import { SeoExperiment } from '../types/gscRecommendationsTypes';

const GscExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<SeoExperiment[]>([]);

  useEffect(() => {
    const exps = mockService.getExperiments();
    // Simulate updating metrics for deployed experiments
    const updated = exps.map(e => {
      if (e.status === 'measuring' && !e.currentMetrics) {
        return {
          ...e,
          currentMetrics: {
            ...e.baselineMetrics,
            ctr: e.baselineMetrics.ctr * 1.15, // Simulating a lift
            clicks: Math.round(e.baselineMetrics.clicks * 1.15)
          }
        };
      }
      return e;
    });
    setExperiments(updated);
  }, []);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
            <FlaskConical size={24} className="text-indigo-500" />
            Experiment Tracker
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Monitor the impact of your SEO changes on click-through rates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {experiments.length > 0 ? experiments.map(exp => (
          <GscExperimentCard key={exp.id} experiment={exp} />
        )) : (
          <div className="col-span-full bg-muted/20 border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center opacity-50">
            <FlaskConical size={48} className="mb-4" />
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest">No Active Experiments</h3>
            <p className="text-sm font-medium text-muted-foreground max-w-sm mt-2">
              Deploy a variant from the Recommendations tab to start tracking performance changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GscExperimentsPage;
