
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Zap, 
  Filter, 
  ChevronRight, 
  MoreHorizontal,
  Search,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  Target,
  ArrowRight,
  ChevronLeft,
  Trophy,
  Activity,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  BarChart3,
  Play,
  ListTodo,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Task, Query, Engine } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import CreditConfirmationModal from '../components/CreditConfirmationModal';
import { mockService } from '../services/mockDataService';
import InfoTooltip from '../components/InfoTooltip';

interface StrategyProps {
  tasks: Task[];
  queries: Query[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const Strategy: React.FC<StrategyProps> = ({ tasks, queries, onUpdateTask }) => {
  const { workspace, actions, snapshots } = useWorkspace();
  const [filter, setFilter] = useState<'all' | 'high-impact' | 'quick-wins'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [copiedContent, setCopiedContent] = useState(false);
  
  const [completedStepIndices, setCompletedStepIndices] = useState<Record<string, Set<number>>>({});

  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [targetedQueryId, setTargetedQueryId] = useState<string | null>(null);
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false);

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);
  const selectedQuery = useMemo(() => queries.find(q => q.id === selectedTask?.query_id), [queries, selectedTask]);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'high-impact') {
      result = result.filter(t => t.impact === 'L');
    } else if (filter === 'quick-wins') {
      result = result.filter(t => t.effort === 'S');
    }
    
    return result;
  }, [tasks, filter, searchTerm]);

  // Identify the "Hero Task" - Highest Impact, Todo status
  const focusTask = useMemo(() => {
    return filteredTasks.find(t => t.status === 'todo' && t.impact === 'L') || filteredTasks.find(t => t.status === 'todo');
  }, [filteredTasks]);

  const handleRunGlobalScan = () => {
    setTargetedQueryId(null);
    setShowConfirmModal(true);
  };

  const handleRunSingleScan = (queryId: string) => {
    setTargetedQueryId(queryId);
    setShowConfirmModal(true);
  };

  const handleConfirmScan = (selectedEngines: Engine[]) => {
    setShowConfirmModal(false);
    setIsScanning(true);
    setScanSuccess(false);
    
    setTimeout(() => {
      const itemCount = targetedQueryId ? 1 : queries.length;
      mockService.deductCredits(itemCount * selectedEngines.length);
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 3000);
    }, 2000);
  };

  const handleRefreshMetrics = async () => {
    if (!selectedTask || !selectedTask.query_id) return;
    setIsRefreshingMetrics(true);
    await actions.refreshMetrics(selectedTask.id, selectedTask.query_id);
    setIsRefreshingMetrics(false);
  };

  const toggleStep = (taskId: string, index: number) => {
    setCompletedStepIndices(prev => {
      const taskSteps = new Set(prev[taskId] || []);
      if (taskSteps.has(index)) taskSteps.delete(index);
      else taskSteps.add(index);
      return { ...prev, [taskId]: taskSteps };
    });
  };

  const handleCopyFix = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const columns = [
    { id: 'todo', label: 'Ready to Start', icon: <Circle size={14} />, color: 'text-muted-foreground', bg: 'bg-muted/10', tooltip: 'Optimization tasks identified by AI.' },
    { id: 'doing', label: 'In Progress', icon: <Loader2 size={14} className="animate-spin" />, color: 'text-primary-400', bg: 'bg-primary-500/5', tooltip: 'Tasks currently being implemented.' },
    { id: 'done', label: 'Review & Verify', icon: <CheckCircle2 size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/5', tooltip: 'Completed tasks ready for re-scanning.' }
  ];

  const renderTaskCard = (task: Task) => {
    const queryName = queries.find(q => q.id === task.query_id)?.text || 'Unknown Query';
    const completedCount = completedStepIndices[task.id]?.size || 0;
    const progress = (completedCount / task.steps.length) * 100;

    return (
      <div 
        key={task.id}
        onClick={() => setSelectedTaskId(task.id)}
        className={`group relative p-5 bg-card hover:bg-muted/20 border border-border rounded-2xl shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md overflow-hidden ${
          task.impact === 'L' ? 'shadow-[0_0_15px_-3px_rgba(139,92,246,0.1)] border-primary-500/20' : ''
        }`}
      >
        {/* Glow for high impact */}
        {task.impact === 'L' && (
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
        )}

        <div className="flex justify-between items-start mb-3 pl-2">
          <div className="flex flex-wrap gap-2">
            {task.impact === 'L' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-400 border border-primary-500/20">
                <Zap size={10} fill="currentColor" /> High Impact
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
              <Clock size={10} /> {task.effort === 'S' ? 'Quick Win' : 'Deep Work'}
            </span>
          </div>
        </div>

        <div className="pl-2 mb-4">
          <h4 className="text-sm font-bold text-foreground leading-snug mb-1 group-hover:text-primary-400 transition-colors">
            {task.title}
          </h4>
          <p className="text-[10px] text-muted-foreground font-medium truncate flex items-center gap-1.5">
            <Target size={10} /> {queryName}
          </p>
        </div>

        {/* Progress Bar or Action */}
        <div className="pl-2 mt-auto">
          {task.status === 'done' ? (
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 handleRunSingleScan(task.query_id);
               }}
               className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
             >
               <RefreshCw size={12} /> Verify Impact
             </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                {completedCount}/{task.steps.length} Steps
              </span>
            </div>
          )}
        </div>
        
        {/* Hover Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <ChevronRight size={20} className="text-primary-500" />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex relative overflow-hidden page-transition bg-background">
      {/* Main Board */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
              <CheckSquare size={24} className="text-primary-500" />
              Strategy Planner
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Execute AI-generated tasks to close visibility gaps.</p>
          </div>
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text"
                placeholder="Filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-muted/50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none w-40 transition-all focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex gap-1">
              {(['all', 'high-impact', 'quick-wins'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    filter === f ? 'bg-primary-500 text-white shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {f.replace('-', ' ')}
                </button>
              ))}
            </div>
            <button 
              onClick={handleRunGlobalScan}
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-black text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              <Zap size={12} fill="currentColor" /> Global Re-Scan
            </button>
          </div>
        </div>

        {/* Recommended Focus Hero (Only if items in Todo) */}
        {focusTask && filter !== 'quick-wins' && (
          <div className="mb-8 shrink-0 animate-in slide-in-from-top-4 duration-500">
            <div 
              onClick={() => setSelectedTaskId(focusTask.id)}
              className="relative bg-gradient-to-r from-primary-900/10 to-primary-600/5 border border-primary-500/20 rounded-[28px] p-6 cursor-pointer group overflow-hidden hover:border-primary-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 p-32 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary-500/10 transition-all" />
              
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Recommended Focus
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                  Highest ROI Opportunity
                </span>
              </div>

              <div className="flex justify-between items-end relative z-10">
                <div>
                  <h3 className="text-xl font-black text-foreground mb-1 group-hover:text-primary-400 transition-colors">
                    {focusTask.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Target size={12} /> {queries.find(q => q.id === focusTask.query_id)?.text}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>Est. Time: {focusTask.effort === 'S' ? '15 min' : '45 min'}</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 hover:border-primary-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                  Start Mission <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`flex flex-col h-full rounded-[28px] overflow-hidden border border-border/40 ${col.bg}`}>
                <div className="p-5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background border border-border/50 ${col.color}`}>
                      {col.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-foreground flex items-center gap-2">
                        {col.label}
                        <InfoTooltip content={col.tooltip} />
                      </h3>
                      <span className="text-[10px] font-bold text-muted-foreground opacity-70">{columnTasks.length} Tasks</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3">
                  {columnTasks.length > 0 ? (
                    columnTasks.map(renderTaskCard)
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 min-h-[200px]">
                      <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mb-3">
                        <ListTodo size={20} className="text-muted-foreground" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Drawer Side Panel */}
      {selectedTaskId && selectedTask && (
        <div className="w-[500px] bg-card border-l border-border h-full flex flex-col animate-in slide-in-from-right duration-300 z-50 shadow-2xl relative">
          <div className="p-8 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setSelectedTaskId(null)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
              >
                <ChevronLeft size={16} /> Close Planner
              </button>
              
              {/* Task Actions Menu */}
              <div className="flex gap-2 relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all border ${isMenuOpen ? 'bg-muted text-foreground border-foreground/20' : 'border-border'}`}
                >
                  <MoreHorizontal size={18} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                    <div className="p-1 space-y-0.5">
                      <button 
                        onClick={() => { onUpdateTask(selectedTask.id, { impact: selectedTask.impact === 'L' ? 'M' : 'L' }); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                      >
                        {selectedTask.impact === 'L' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        {selectedTask.impact === 'L' ? 'Lower Priority' : 'Raise Priority'}
                      </button>
                      <button 
                        onClick={() => { onUpdateTask(selectedTask.id, { effort: selectedTask.effort === 'S' ? 'M' : 'S' }); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                      >
                        <Clock size={14} />
                        {selectedTask.effort === 'S' ? 'Mark as Deep Work' : 'Mark as Quick Win'}
                      </button>
                      <div className="h-px bg-white/5 my-1" />
                      <button 
                        onClick={() => { actions.deleteTask(selectedTask.id); setSelectedTaskId(null); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                      >
                        <Trash2 size={14} />
                        Delete Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  selectedTask.impact === 'L' ? 'bg-primary-500 text-white border-primary-600' : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {selectedTask.impact === 'L' ? 'High Impact' : 'Med Impact'}
                </span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  Est. Effort: {selectedTask.effort === 'S' ? '15 min' : '1 hr'}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                {selectedTask.title}
              </h2>
              {selectedQuery && (
                <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
                   <div className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                     <Target size={12} /> Target Question
                   </div>
                   <p className="text-xs font-bold text-foreground italic">"{selectedQuery.text}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-none">
             
             {/* Traffic Proof Results Section */}
             {selectedTask.latestSnapshotId ? (
                <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={14} /> Traffic Proof Verified
                    </h4>
                    <button 
                      onClick={handleRefreshMetrics} 
                      disabled={isRefreshingMetrics}
                      className="text-[9px] font-black uppercase text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <RefreshCw size={10} className={isRefreshingMetrics ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>
                  
                  {(() => {
                    const latest = snapshots.find(s => s.id === selectedTask.latestSnapshotId);
                    const baseline = snapshots.find(s => s.id === selectedTask.baselineSnapshotId);
                    
                    if (!latest || !baseline) return <div className="text-xs text-muted-foreground">Loading metrics...</div>;

                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background/50 rounded-xl p-3 border border-emerald-500/10">
                          <div className="text-[9px] text-muted-foreground font-black uppercase">GSC Clicks</div>
                          <div className="text-lg font-black text-foreground flex items-end gap-1">
                            {latest.gsc?.clicks}
                            <span className="text-[9px] text-emerald-500 mb-1">
                              +{((latest.gsc?.clicks || 0) - (baseline.gsc?.clicks || 0))}
                            </span>
                          </div>
                        </div>
                        <div className="bg-background/50 rounded-xl p-3 border border-emerald-500/10">
                          <div className="text-[9px] text-muted-foreground font-black uppercase">GA4 Sessions</div>
                          <div className="text-lg font-black text-foreground flex items-end gap-1">
                            {latest.ga4?.sessions}
                            <span className="text-[9px] text-emerald-500 mb-1">
                              +{((latest.ga4?.sessions || 0) - (baseline.ga4?.sessions || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>
             ) : (
               <section className="bg-muted/20 border border-border rounded-2xl p-5 flex flex-col items-center text-center">
                 <BarChart3 size={24} className="text-muted-foreground mb-2" />
                 <h4 className="text-xs font-bold text-foreground">Measure Your Impact</h4>
                 <p className="text-[10px] text-muted-foreground mt-1 mb-3">Connect GSC & GA4 to see traffic uplift from this task.</p>
                 <button 
                   onClick={handleRefreshMetrics}
                   className="text-[9px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-400"
                 >
                   Refresh Data
                 </button>
               </section>
             )}

             {selectedTask.generatedFixContent && (
               <section>
                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Zap size={14} className="text-amber-400" />
                   AI Generated Fix
                 </h4>
                 <div className="bg-muted/10 border border-border rounded-xl p-4 relative group">
                   <pre className="text-xs font-medium text-foreground whitespace-pre-wrap font-sans max-h-48 overflow-y-auto custom-scrollbar">
                     {selectedTask.generatedFixContent}
                   </pre>
                   <button 
                     onClick={() => selectedTask.generatedFixContent && handleCopyFix(selectedTask.generatedFixContent)}
                     className="absolute top-2 right-2 p-2 bg-card hover:bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                   >
                     {copiedContent ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                   </button>
                 </div>
               </section>
             )}

             <section>
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-primary-400" /> 
                  Step-by-Step Resolution
                </h4>
                <div className="space-y-4">
                   {selectedTask.steps.map((step, idx) => {
                     const isLastStep = idx === selectedTask.steps.length - 1;
                     const isChecked = completedStepIndices[selectedTask.id]?.has(idx);
                     
                     return (
                       <div key={idx} className="flex flex-col gap-3 group">
                         <div className="flex gap-4">
                            <button 
                              onClick={() => toggleStep(selectedTask.id, idx)}
                              className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                isChecked ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-muted/50 border-border hover:border-primary-500/50 text-transparent hover:text-primary-500/50'
                              }`}
                            >
                               <CheckSquare size={14} />
                            </button>
                            <div className="flex-1">
                               <p className={`text-sm font-bold leading-relaxed transition-all ${isChecked ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'}`}>{step}</p>
                               <p className="text-[10px] text-muted-foreground font-medium mt-1">Recommended for visibility lift.</p>
                            </div>
                         </div>
                         
                         {/* Integrated Rescan Button at the final step */}
                         {isLastStep && isChecked && (
                           <div className="ml-10 animate-in slide-in-from-top-2 duration-300">
                             <button 
                               onClick={() => {
                                 onUpdateTask(selectedTask.id, { status: 'done' });
                                 handleRunSingleScan(selectedTask.query_id);
                                 handleRefreshMetrics();
                               }}
                               className="flex items-center gap-3 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full"
                             >
                               {isScanning ? (
                                 <Loader2 size={16} className="animate-spin" />
                               ) : (
                                 <RefreshCw size={16} />
                               )}
                               {isScanning ? 'Syncing...' : 'Complete & Verify Traffic Impact'}
                             </button>
                             <p className="mt-2 text-[9px] text-emerald-500/70 font-bold px-2 italic uppercase tracking-tighter">
                               Updates Visibility Index & Refreshes Metrics
                             </p>
                           </div>
                         )}
                       </div>
                     );
                   })}
                </div>
             </section>

             <div className="h-px bg-border/50" />

             <section>
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" /> 
                  Why this matters
                </h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Completing these actions targets specific <span className="text-foreground font-black">blind spots</span> detected in LLM responses. Our AI estimates that resolving this task will close the visibility gap with rivals by <span className="text-emerald-500 font-black">~12.4%</span> for this specific query.
                </p>
             </section>
          </div>

          <div className="p-8 border-t border-border bg-muted/30 space-y-4">
             {selectedTask.status !== 'done' ? (
               <button 
                onClick={() => {
                  onUpdateTask(selectedTask.id, { status: selectedTask.status === 'todo' ? 'doing' : 'done' });
                  if (selectedTask.status === 'doing') setSelectedTaskId(null);
                }}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
               >
                 {selectedTask.status === 'todo' ? 'Begin Implementation' : 'Mark as Optimized'} <ArrowRight size={16} />
               </button>
             ) : (
               <div className="space-y-3">
                 <button 
                  onClick={() => {
                    handleRunSingleScan(selectedTask.query_id);
                    handleRefreshMetrics();
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                 >
                   <Zap size={16} fill="currentColor" className="text-amber-300" /> Verify Implementation
                 </button>
                 <button 
                  onClick={() => onUpdateTask(selectedTask.id, { status: 'todo' })}
                  className="w-full py-3 bg-muted hover:bg-border text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                   Reopen Task
                 </button>
               </div>
             )}
          </div>
        </div>
      )}

      {workspace && (
        <CreditConfirmationModal 
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmScan}
          workspace={workspace}
          itemCount={targetedQueryId ? 1 : queries.length}
          costPerItem={5}
          isProcessing={isScanning}
        />
      )}
    </div>
  );
};

// Helper icon component since Star isn't exported by lucide-react in current version used
const Star: React.FC<any> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default Strategy;
