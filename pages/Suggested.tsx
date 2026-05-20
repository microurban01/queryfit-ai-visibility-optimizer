
import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  Zap, 
  ArrowRight, 
  X, 
  Loader2, 
  Target, 
  Ghost, 
  Trophy, 
  ChevronLeft, 
  Cpu, 
  Coins,
  TrendingUp,
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { SuggestedQuery, Engine } from '../types';
import CreditConfirmationModal from '../components/CreditConfirmationModal';
import { useWorkspace } from '../context/WorkspaceContext';
import { mockService } from '../services/mockDataService';
import InfoTooltip from '../components/InfoTooltip';

interface SuggestedProps {
  suggestedQueries: SuggestedQuery[];
  onTrack: (query: SuggestedQuery) => void;
  onDismiss: (id: string) => void;
  onNavigateToTracked: () => void;
}

const Suggested: React.FC<SuggestedProps> = ({ 
  suggestedQueries, 
  onTrack, 
  onDismiss,
  onNavigateToTracked
}) => {
  const { workspace, actions } = useWorkspace();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedQuery = suggestedQueries.find(q => q.id === selectedId) || null;

  const handleTrackInitiate = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmTrack = async (selectedEngines: Engine[]) => {
    if (!selectedQuery) return;
    setIsTracking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    mockService.deductCredits(selectedEngines.length);
    const queryText = selectedQuery.text;
    onTrack(selectedQuery);
    setIsTracking(false);
    setShowConfirmModal(false);
    setSelectedId(null);
    actions.showToast({
      title: 'Mission Initialized',
      message: `Tracking protocols active for "${queryText}".`,
      type: 'success',
      actionLabel: 'View Data',
      onAction: onNavigateToTracked
    });
  };

  const handleDismiss = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedQuery && !e) return;
    
    // If called from the list item directly
    const idToDismiss = selectedQuery ? selectedQuery.id : (e?.currentTarget.getAttribute('data-id') || '');
    
    if (idToDismiss) {
        onDismiss(idToDismiss);
        setSelectedId(null);
    }
  };

  // Calculate summary stats
  const avgSurge = Math.round(suggestedQueries.reduce((acc, q) => acc + q.surge, 0) / (suggestedQueries.length || 1));
  const highPriorityCount = suggestedQueries.filter(q => q.surge > 20).length;

  return (
    <div className="flex h-full overflow-hidden page-transition bg-background relative">
      
      {/* LEFT PANEL: Intelligence Feed */}
      <div className={`flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none transition-all duration-500 ${selectedId ? 'w-1/2 pr-4' : 'w-full'}`}>
        
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
                <Sparkles className="text-indigo-500" size={24} fill="currentColor" />
                Discovery Feed
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Real-time search patterns detected by our AI mesh.
              </p>
            </div>
            
            {/* Summary Pills */}
            {suggestedQueries.length > 0 && (
                <div className="flex gap-2">
                    <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                        <Activity size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{avgSurge}% Avg Velocity</span>
                    </div>
                    <div className="px-3 py-1.5 bg-card border border-border rounded-xl flex items-center gap-2">
                        <Target size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{suggestedQueries.length} Opportunities</span>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* The Feed */}
        <div className="space-y-4">
          {suggestedQueries.length > 0 ? suggestedQueries.map((sq) => {
            const isSelected = selectedId === sq.id;
            return (
              <div 
                key={sq.id} 
                onClick={() => setSelectedId(sq.id)}
                className={`group relative rounded-[24px] border transition-all cursor-pointer overflow-hidden ${
                  isSelected 
                    ? 'bg-indigo-900/10 border-indigo-500/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]' 
                    : 'bg-card border-border hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {/* Selection Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isSelected ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-500/50'}`} />

                <div className="p-6">
                  {/* Top Row: Meta */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                            sq.surge > 20 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-muted text-muted-foreground border-border'
                        }`}>
                            <TrendingUp size={10} /> +{sq.surge}% Surge
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-muted/50 text-muted-foreground border border-border/50">
                            {sq.tags[0]}
                        </span>
                    </div>
                    {isSelected ? (
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Viewing Dossier</div>
                    ) : (
                        <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>

                  {/* Main Content */}
                  <h3 className={`text-lg font-bold leading-tight mb-2 transition-colors ${isSelected ? 'text-indigo-300' : 'text-foreground group-hover:text-indigo-200'}`}>
                    "{sq.text}"
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                    {sq.reason}
                  </p>

                  {/* Footer Metrics */}
                  <div className="mt-5 pt-4 border-t border-border/50 flex items-center gap-6">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Rival Gap</span>
                        <span className="text-xs font-black text-rose-500">-{sq.leaderScore}%</span>
                     </div>
                     <div className="w-px h-6 bg-border/50" />
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Current Leader</span>
                        <span className="text-xs font-bold text-foreground">{sq.leaderName}</span>
                     </div>
                     
                     {/* Hover Action (Desktop) */}
                     <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                            Analyze <ArrowRight size={10} />
                        </span>
                     </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-border rounded-[32px]">
              <Ghost size={48} className="mb-4 text-muted-foreground" />
              <h3 className="text-lg font-black text-foreground mb-1 uppercase tracking-widest">Feed is quiet</h3>
              <p className="text-xs text-muted-foreground max-w-xs font-medium">Our AI hasn't detected any new high-velocity patterns for your industry today.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Intelligence Dossier */}
      {selectedQuery && (
        <div className="w-[550px] bg-[#09090b] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 absolute right-0 top-0 bottom-0 z-20">
          
          {/* Header */}
          <div className="p-8 pb-6 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setSelectedId(null)}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white flex items-center gap-2 transition-colors"
              >
                <ChevronLeft size={14} /> Back to Feed
              </button>
              <div className="flex items-center gap-2">
                 <div className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                    AI Confidence: 94%
                 </div>
                 <button 
                    onClick={(e) => handleDismiss(e)}
                    className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                 >
                    <X size={16} />
                 </button>
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white leading-tight mb-2">
                "{selectedQuery.text}"
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                <Search size={12} /> Detected in {selectedQuery.market.region} • {selectedQuery.market.language.toUpperCase()}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            
            {/* Why This Matters */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-500" /> Strategic Insight
                </h3>
                <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                    <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                        {selectedQuery.reason}
                    </p>
                </div>
            </section>

            {/* Competitive Gap Visual */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Trophy size={12} className="text-amber-500" /> Market Standing
                </h3>
                
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                    {/* Rival Bar */}
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                            <span>{selectedQuery.leaderName} (Leader)</span>
                            <span className="text-white">{selectedQuery.leaderScore}% Share</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${selectedQuery.leaderScore}%` }} />
                        </div>
                    </div>
                    {/* Your Bar (Projected baseline of 0 usually, or low) */}
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                            <span>You (Current)</span>
                            <span className="text-zinc-600">Not Tracked</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-zinc-700 w-px" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ROI Forecast */}
            <section className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-card border border-border rounded-2xl">
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Growth Velocity</div>
                    <div className="text-2xl font-black text-emerald-500 flex items-center gap-2">
                        +{selectedQuery.surge}% <TrendingUp size={16} />
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-2 font-bold">Week over Week</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl">
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Content Effort</div>
                    <div className="text-2xl font-black text-white">
                        Med
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-2 font-bold">Est. 2-3 hours</div>
                </div>
            </section>

            {/* Tactical Plan */}
            <section>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Cpu size={12} className="text-indigo-500" /> Plan of Action
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">1</div>
                        Track question to establish baseline
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">2</div>
                        Analyze {selectedQuery.leaderName}'s citations
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">3</div>
                        Execute content optimization task
                    </div>
                </div>
            </section>

          </div>

          {/* Footer Action */}
          <div className="p-8 border-t border-white/10 bg-white/[0.02]">
             <div className="flex items-center justify-between mb-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Coins size={10} /> Cost: 5 Credits</span>
                <span>Ready to execute?</span>
             </div>
             <button 
                onClick={handleTrackInitiate}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
             >
                <Zap size={16} fill="currentColor" className="text-white group-hover:text-yellow-300 transition-colors" />
                Initialize Tracking
             </button>
          </div>

        </div>
      )}

      {/* Confirmation Modal */}
      {workspace && (
        <CreditConfirmationModal 
          isOpen={showConfirmModal}
          onClose={() => !isTracking && setShowConfirmModal(false)}
          onConfirm={handleConfirmTrack}
          workspace={workspace}
          itemCount={1}
          isProcessing={isTracking}
          title="Activate Opportunity"
          description={
            <>
              Initializing tracking for <span className="text-white font-bold">"{selectedQuery?.text}"</span>. This will establish your baseline visibility score.
            </>
          }
        />
      )}
    </div>
  );
};

export default Suggested;
