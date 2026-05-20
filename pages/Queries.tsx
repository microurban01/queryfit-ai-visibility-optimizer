
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Zap, 
  Plus, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Settings2,
  Trophy,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Query, Workspace, Engine, Priority } from '../types';
import InfoTooltip from '../components/InfoTooltip';
import AddQueryModal from '../components/AddQueryModal';
import CreditConfirmationModal from '../components/CreditConfirmationModal';
import ManageQueryModal from '../components/ManageQueryModal';
import { mockService } from '../services/mockDataService';
import { ENGINE_METADATA } from '../constants';
import { getFlagEmoji } from '../utils/marketUtils';

interface QueriesProps {
  queries: Query[];
  workspace: Workspace;
  onAddQuery: (text: string, market?: any) => void;
  onViewQuery: (id: string) => void;
  onDeleteQuery: (id: string) => void;
  onUpdateQuery: (id: string, updates: Partial<Query>) => void;
  initialIsAdding?: boolean;
  onCancelAdd?: () => void;
}

const Queries: React.FC<QueriesProps> = ({ 
  queries, 
  workspace, 
  onAddQuery, 
  onViewQuery, 
  onDeleteQuery,
  onUpdateQuery,
  initialIsAdding, 
  onCancelAdd 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'high' | 'drops' | 'gains'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [showScanConfirm, setShowScanConfirm] = useState(false);
  
  // Management Modal
  const [managingQuery, setManagingQuery] = useState<Query | null>(null);

  useEffect(() => {
    if (initialIsAdding) {
      setIsAddModalOpen(true);
    }
  }, [initialIsAdding]);

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    if (onCancelAdd) onCancelAdd();
  };

  const filteredQueries = useMemo(() => {
    let result = queries.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'high') {
      result = result.filter(q => q.priority === Priority.HIGH);
    } else if (filterStatus === 'drops') {
      result = result.filter(q => q.delta_7d < 0);
    } else if (filterStatus === 'gains') {
      result = result.filter(q => q.delta_7d > 0);
    }
    
    return result;
  }, [queries, searchTerm, filterStatus]);

  const initiateScan = () => {
    setShowScanConfirm(true);
  };

  const handleConfirmScan = (selectedEngines: Engine[]) => {
    setShowScanConfirm(false);
    setIsScanningAll(true);
    // Simulate scan
    setTimeout(() => {
      mockService.deductCredits(selectedEngines.length * queries.length);
      setIsScanningAll(false);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Search size={24} className="text-primary-500" />
            Tracked Queries
            <InfoTooltip content="High-intent queries your brand should be recommended for across all tracked regions." />
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Monitoring visibility, blind spots, and competitive gaps.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={initiateScan}
            disabled={isScanningAll || queries.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isScanningAll 
                ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
                : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50'
            }`}
          >
            {isScanningAll ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-amber-400" fill="currentColor" />}
            Scan All
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 hover:border-primary-500/30 text-[10px] font-black uppercase tracking-widest transition-all group active:scale-95"
          >
            <Plus size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            Add Query
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search tracked questions..." 
            className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Queries' },
            { id: 'high', label: 'High Priority' },
            { id: 'drops', label: 'Recent Drops' },
            { id: 'gains', label: 'Recent Gains' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                filterStatus === f.id 
                  ? 'bg-primary-500/10 text-primary-500 border-primary-500/20 shadow-sm' 
                  : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {filteredQueries.length > 0 ? filteredQueries.map(q => {
          const gap = q.leaderScore - q.overall_score;
          const isTrailing = gap > 0;
          
          return (
            <div 
              key={q.id}
              onClick={() => onViewQuery(q.id)}
              className="group bg-card border border-border rounded-[24px] p-6 hover:border-primary-500/30 transition-all shadow-sm cursor-pointer relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                
                {/* 1. Identity Column (Left) */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                      q.priority === Priority.HIGH ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                      q.priority === Priority.MEDIUM ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {q.priority}
                    </span>
                    
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/30 border border-border/50 rounded-md text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                       <span>{getFlagEmoji(q.market.region)}</span>
                       <span>{q.market.language.toUpperCase()}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary-400 transition-colors leading-snug">
                    "{q.text}"
                  </h3>
                </div>

                {/* 2. Intelligence Strip (Middle) - Uses empty space effectively */}
                <div className="hidden lg:flex flex-col gap-3 w-72 xl:w-96 shrink-0 px-4 border-l border-r border-border/30 bg-muted/[0.02]">
                   {/* Competitive Gap Bar */}
                   <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                           <Trophy size={10} className="text-amber-500" />
                           Vs. {q.leaderName}
                         </span>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${isTrailing ? 'text-primary-500' : 'text-emerald-500'}`}>
                           {isTrailing ? `Trailing by ${gap}%` : 'Market Leader'}
                         </span>
                      </div>
                      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden relative">
                         {/* Leader Marker (Background represents leader score) */}
                         <div className="absolute top-0 left-0 h-full bg-foreground/10" style={{ width: `${q.leaderScore}%` }} />
                         {/* User Score */}
                         <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isTrailing ? 'bg-primary-500' : 'bg-emerald-500'}`} style={{ width: `${q.overall_score}%` }} />
                      </div>
                   </div>

                   {/* Compact Engine Status */}
                   <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Engine Coverage</span>
                      <div className="flex -space-x-1">
                        {workspace.enabled_engines.slice(0, 5).map(engine => {
                          const score = q.engine_scores[engine];
                          const meta = ENGINE_METADATA[engine];
                          return (
                            <div 
                              key={engine} 
                              className={`w-2 h-2 rounded-full mx-0.5 transition-all ${score > 0 ? 'opacity-100' : 'opacity-20'}`}
                              style={{ backgroundColor: meta.color }}
                              title={`${meta.name}: ${score}`}
                            />
                          );
                        })}
                      </div>
                   </div>
                </div>

                {/* 3. KPI Results (Right) */}
                <div className="flex items-center justify-between lg:justify-end gap-6 lg:gap-8 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-border/40">
                  
                  {/* Visibility */}
                  <div className="flex flex-col items-end min-w-[80px]">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black tracking-tighter ${
                        q.overall_score >= 80 ? 'text-emerald-500' : 
                        q.overall_score >= 50 ? 'text-amber-500' : 
                        'text-rose-500'
                      }`}>
                        {q.overall_score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       {q.delta_7d !== 0 && (
                        <span className={`text-[9px] font-black uppercase flex items-center ${q.delta_7d > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {q.delta_7d > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {Math.abs(q.delta_7d)}%
                        </span>
                      )}
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Visibility</span>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-border hidden lg:block" />

                  {/* Citations */}
                  <div className="text-right min-w-[60px]">
                    <div className="text-2xl font-black text-foreground tracking-tighter">
                      {q.citations.you}
                    </div>
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                      Citations
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setManagingQuery(q); }}
                    className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border ml-2"
                  >
                    <Settings2 size={18} />
                  </button>
                </div>

              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
            <Search size={48} className="mb-4 text-muted-foreground" />
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest">No queries found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new question to track.</p>
          </div>
        )}
      </div>

      <AddQueryModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        onAdd={(text, market) => {
          onAddQuery(text, market);
          handleCloseAddModal();
        }} 
      />

      {managingQuery && (
        <ManageQueryModal
          isOpen={!!managingQuery}
          onClose={() => setManagingQuery(null)}
          query={managingQuery}
          onUpdate={onUpdateQuery}
          onDelete={onDeleteQuery}
        />
      )}

      {workspace && (
        <CreditConfirmationModal 
          isOpen={showScanConfirm}
          onClose={() => setShowScanConfirm(false)}
          onConfirm={handleConfirmScan}
          workspace={workspace}
          itemCount={queries.length}
          isProcessing={isScanningAll}
        />
      )}
    </div>
  );
};

export default Queries;
