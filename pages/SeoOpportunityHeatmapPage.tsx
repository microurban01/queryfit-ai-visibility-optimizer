
import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import GscConnectCard from '../components/GscConnectCard';
import GscSetupWizard from '../components/GscSetupWizard';
import OpportunityTiles from '../components/OpportunityTiles';
import OpportunityTable from '../components/OpportunityTable';
import OpportunityDrawer from '../components/OpportunityDrawer';
import { SeoOpportunity } from '../gscTypes';
import { Flame, Filter, Calendar } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const SeoOpportunityHeatmapPage: React.FC = () => {
  const { gscConnection, seoState, actions } = useWorkspace();
  const [selectedOpportunity, setSelectedOpportunity] = useState<SeoOpportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Determine if setup is complete enough to show dashboard
  const showDashboard = gscConnection.isConnected && gscConnection.selectedSiteUrl && seoState.opportunities.length > 0;

  const handleSync = async (siteUrl: string) => {
    setIsSyncing(true);
    await actions.syncGscData(siteUrl);
    setIsSyncing(false);
  };

  const handleSelectOpportunity = (op: SeoOpportunity) => {
    setSelectedOpportunity(op);
    setIsDrawerOpen(true);
  };

  // State 1: Not Setup - Show Wizard
  if (!showDashboard) {
    return (
      <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
            <Flame size={24} className="text-amber-500" fill="currentColor" />
            SEO Opportunity Heatmap
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Identify high-ROI organic search wins using Search Console data.</p>
        </div>
        <div className="py-8">
          <GscSetupWizard 
            onConnect={actions.connectGsc}
            onSync={handleSync}
            connection={gscConnection}
          />
        </div>
      </div>
    );
  }

  // State 2: Connected - Show Dashboard
  return (
    <div className="flex flex-col h-full overflow-hidden page-transition bg-background/50">
      {/* Header Strip */}
      <GscConnectCard 
        connection={gscConnection}
        onDisconnect={actions.disconnectGsc}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-20">
        {/* Filters Bar */}
        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            <Filter size={12} /> Filters
          </div>
          
          <div className="flex items-center gap-2">
            {['7d', '28d', '90d'].map(d => (
              <button 
                key={d}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${seoState.datePreset === d ? 'bg-primary-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Tiles */}
        <OpportunityTiles opportunities={seoState.opportunities} />

        {/* Main Heatmap */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-foreground">Top Opportunities</h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Sorted by Opportunity Score
            </span>
          </div>
          <OpportunityTable 
            opportunities={seoState.opportunities} 
            onSelect={handleSelectOpportunity} 
          />
        </div>
      </div>

      <OpportunityDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        opportunity={selectedOpportunity}
        onCreateTask={actions.addTaskFromOpportunity}
      />
    </div>
  );
};

export default SeoOpportunityHeatmapPage;
