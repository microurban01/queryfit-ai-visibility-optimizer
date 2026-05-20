
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  LayoutDashboard 
} from 'lucide-react';
import { Metrics, Query, Task, Competitor, Workspace, GeoAlert } from '../types';
import MissionHero from '../components/missionControl/MissionHero';
import TrackedQuestionsWidget from '../components/missionControl/TrackedQuestionsWidget';
import NextBestActionsWidget from '../components/missionControl/NextBestActionsWidget';
import TopRivalsWidget from '../components/missionControl/TopRivalsWidget';
import OpportunitiesWidget from '../components/missionControl/OpportunitiesWidget';
import PulseFeed from '../components/missionControl/PulseFeed';
import GeoAlertsSection from '../components/missionControl/GeoAlertsSection';
import AddQueryModal from '../components/AddQueryModal';
import AddCompetitorModal from '../components/AddCompetitorModal';
import CreditConfirmationModal from '../components/CreditConfirmationModal';
import DiscoveryIntelligenceModal from '../components/DiscoveryIntelligenceModal';
import { mockService } from '../services/mockDataService';
import { Engine } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

interface OverviewProps {
  metrics: Metrics;
  queries: Query[];
  tasks: Task[];
  competitors: Competitor[];
  workspace: Workspace;
  onViewCompetitor: (id: string, view?: string) => void;
  onViewQuery: (id: string, action?: string) => void;
  onAddQuery: (text: string, market?: any) => void;
  onAddCompetitor: (name: string, domain: string) => void;
  onNavigateToSuggested: () => void;
  onNavigateToStrategy: () => void;
  onNavigateToRankings: () => void;
  onNavigateToQueries: () => void;
}

const Overview: React.FC<OverviewProps> = ({
  metrics,
  queries,
  tasks,
  competitors,
  workspace,
  onViewCompetitor,
  onViewQuery,
  onAddQuery,
  onAddCompetitor,
  onNavigateToSuggested,
  onNavigateToStrategy,
  onNavigateToRankings,
  onNavigateToQueries
}) => {
  const { actions } = useWorkspace();
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showScanConfirm, setShowScanConfirm] = useState(false);
  
  const [isAddQueryModalOpen, setIsAddQueryModalOpen] = useState(false);
  const [isAddCompetitorModalOpen, setIsAddCompetitorModalOpen] = useState(false);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);

  // Time Range State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customDays, setCustomDays] = useState(60); // Default for custom

  // Geo Alerts State
  const [geoAlerts, setGeoAlerts] = useState<GeoAlert[]>([]);

  useEffect(() => {
    // Initialize alerts
    setGeoAlerts(mockService.getGeoAlerts());
  }, []);

  const handleScanConfirm = (selectedEngines: Engine[]) => {
    setShowScanConfirm(false);
    setIsScanning(true);
    // Simulate scan
    setTimeout(() => {
      mockService.deductCredits(selectedEngines.length * queries.length);
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 3000);
    }, 2500);
  };

  const handleCustomDateChange = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setCustomDays(diffDays > 0 ? diffDays : 1);
  };

  const handleResolveAlert = (id: string) => {
    const alert = geoAlerts.find(a => a.id === id);
    if (!alert) return;

    // Handle deep linking based on alert type/entity
    if (alert.entityId) {
        if (alert.type === 'competitor') {
            onViewCompetitor(alert.entityId, alert.targetView);
            // Optionally remove from view if desired, but navigation usually implies "handling" it.
            // keeping it visible acts as a log.
            return;
        } else if (alert.type === 'sentiment' || alert.type === 'citation' || alert.type === 'misinformation') {
            onViewQuery(alert.entityId, alert.targetView);
            return;
        }
    }

    // Default simulation functionality if no deep link
    if (alert.action === 'Review Docs' || alert.action === 'View Source') {
       actions.showToast({
         title: 'Opening Evidence',
         message: `Accessing source details for "${alert.title}"...`,
         type: 'info'
       });
    } else {
       actions.showToast({
         title: 'Alert Resolved',
         message: 'Risk acknowledged and archived.',
         type: 'success'
       });
       // Only remove from UI if it was a simple dismissal
       setGeoAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  const pulseEvents = mockService.getPulseFeed();
  const performanceData = mockService.getTopPerformancePages()[0]; // Mock top page for hero

  // Calculate days for mock data fetch
  const historyDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : customDays;

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LayoutDashboard size={24} className="text-primary-500" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Real-time visibility intelligence for <span className="text-foreground font-bold">{workspace.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowScanConfirm(true)} 
            disabled={isScanning} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isScanning 
                ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
                : scanSuccess 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50'
            }`}
          >
            {isScanning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Syncing...</span>
              </>
            ) : scanSuccess ? (
              <>
                <CheckCircle2 size={14} />
                <span>Updated</span>
              </>
            ) : (
              <>
                <Zap size={14} className="text-amber-400" fill="currentColor" />
                <span>Full Scan</span>
              </>
            )}
          </button>

          <button 
            onClick={() => setIsAddQueryModalOpen(true)} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 hover:border-primary-500/30 text-[10px] font-black uppercase tracking-widest transition-all group"
          >
            <Plus size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            <span>Add Query</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Row 1: Executive Summary */}
        <div className="xl:col-span-3">
          <MissionHero 
            score={metrics.overallVisibilityIndex}
            delta={metrics.delta}
            engineScores={metrics.engineAverages}
            trendData={mockService.getHistoryData(historyDays)}
            lastScanAt={new Date().toISOString()}
            performanceData={performanceData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            onCustomDateChange={handleCustomDateChange}
          />
        </div>
        <div className="xl:col-span-1">
          <NextBestActionsWidget 
            tasks={tasks}
            queries={queries}
            onOpenStrategy={onNavigateToStrategy}
            lastScanAt={new Date().toISOString()}
          />
        </div>

        {/* Row 2: Tracked Questions, Rivals, & Discovery */}
        <div className="xl:col-span-2 min-h-[400px]">
          <TrackedQuestionsWidget 
            queries={queries} 
            onViewQuery={onViewQuery} 
            onViewAll={onNavigateToQueries}
          />
        </div>
        <div className="xl:col-span-1 min-h-[400px]">
          <TopRivalsWidget 
            competitors={competitors}
            queries={queries}
            onManageRivals={onNavigateToRankings}
            onViewCompetitor={onViewCompetitor}
          />
        </div>
        <div className="xl:col-span-1 min-h-[400px]">
           <OpportunitiesWidget 
              opportunities={mockService.getSuggestedQueries()}
              onViewAll={onNavigateToSuggested}
            />
        </div>

        {/* Row 3: Scan-Based Risk Monitor (Full Width) */}
        <div className="xl:col-span-4">
          <GeoAlertsSection alerts={geoAlerts} onResolve={handleResolveAlert} />
        </div>

        {/* Row 4: Pulse (Full Width) */}
        <div className="xl:col-span-4">
           <PulseFeed events={pulseEvents} />
        </div>

      </div>

      {/* Modals */}
      <AddQueryModal 
        isOpen={isAddQueryModalOpen} 
        onClose={() => setIsAddQueryModalOpen(false)} 
        onAdd={onAddQuery} 
      />
      
      <AddCompetitorModal
        isOpen={isAddCompetitorModalOpen}
        onClose={() => setIsAddCompetitorModalOpen(false)}
        onAdd={onAddCompetitor}
      />

      <DiscoveryIntelligenceModal
        isOpen={isDiscoveryModalOpen}
        onClose={() => setIsDiscoveryModalOpen(false)}
        onComplete={onNavigateToSuggested}
      />

      <CreditConfirmationModal 
        isOpen={showScanConfirm}
        onClose={() => setShowScanConfirm(false)}
        onConfirm={handleScanConfirm}
        workspace={workspace}
        itemCount={queries.length}
        isProcessing={isScanning}
      />
    </div>
  );
};

export default Overview;
