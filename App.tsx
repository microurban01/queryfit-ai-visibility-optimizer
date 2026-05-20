
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Queries from './pages/Queries';
import QueryDetail from './pages/QueryDetail';
import Suggested from './pages/Suggested';
import CompetitorHub from './pages/CompetitorHub';
import CompetitorDetail from './pages/CompetitorDetail';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Automation from './pages/Automation';
import Strategy from './pages/Strategy';
import HeatmapsPage from './pages/HeatmapsPage';
import SeoOpportunityHeatmapPage from './pages/SeoOpportunityHeatmapPage';
import GscRecommendationsPage from './pages/GscRecommendationsPage';
import GscExperimentsPage from './pages/GscExperimentsPage';
import PerformancePage from './pages/PerformancePage';
import Integrations from './pages/Integrations';
import Results from './pages/Results';
import CreatorsYouTube from './pages/CreatorsYouTube';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { 
  Bell, 
  ChevronDown, 
  Search, 
  Loader2, 
  Settings as SettingsIcon,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  User,
  CreditCard,
  LogOut,
  BarChart3,
  Check,
  Plus,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import AddDomainModal from './components/AddDomainModal';
import AutomationControlModal from './components/AutomationControlModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import { AutomationSettings } from './types';
import InfoTooltip from './components/InfoTooltip';

const AppContent: React.FC = () => {
  const { workspace, isLoading, actions, queries, tasks, competitors, suggestedQueries, metrics, activeDomainId, toasts, theme } = useWorkspace();
  const [activePage, setActivePage] = useState('overview');
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const switcherRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setIsSearchModalOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [autoOpenAddQuery, setAutoOpenAddQuery] = useState(false);
  
  // State for deep linking actions/views
  const [detailViewMode, setDetailViewMode] = useState<string | undefined>(undefined);

  const handleViewCompetitor = (id: string, view?: string) => {
    setSelectedCompetitorId(id);
    setDetailViewMode(view);
    setActivePage('competitor-detail');
  };

  const handleViewQuery = (id: string, action?: string) => {
    setSelectedQueryId(id);
    setDetailViewMode(action);
    setActivePage('query-detail');
  };

  const handleSearchNavigate = (type: 'query' | 'competitor' | 'task', id: string) => {
    if (type === 'query') {
        handleViewQuery(id);
    } else if (type === 'competitor') {
        handleViewCompetitor(id);
    } else if (type === 'task') {
        setActivePage('strategy');
        // In a fuller implementation, we would pass the task ID to highlight it
    }
    setIsSearchModalOpen(false);
  };

  const handleNavigateToQueries = (isAdding: boolean = false) => {
    setAutoOpenAddQuery(isAdding);
    setActivePage('queries');
  };

  const handleNavigateToSettings = (tab?: string) => {
    setActiveTab(tab);
    setActivePage('settings');
    setIsUserMenuOpen(false);
  };

  const handleAutomationSave = (settings: AutomationSettings, enabled: boolean) => {
    actions.updateAutomationSettings(settings);
    if (workspace?.automationEnabled !== enabled) {
      actions.toggleAutomation(enabled);
    }
  };

  const handleAutomationToggle = () => {
    if (workspace?.automationEnabled) {
      actions.toggleAutomation(false);
    } else {
      setIsAutomationModalOpen(true);
    }
  };

  const handleAddDomain = (url: string) => {
    actions.addDomain(url);
    actions.showToast({
      title: 'Domain Added',
      message: `${url} has been added to your workspace.`,
      type: 'success'
    });
  };

  if (isLoading || !workspace || !metrics) return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-muted-foreground">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
        <span className="text-[10px] font-black tracking-widest uppercase opacity-50">Loading Workspace...</span>
      </div>
    </div>
  );

  const activeDomain = workspace.domains.find(d => d.id === activeDomainId) || workspace.domains[0];

  const renderContent = () => {
    switch (activePage) {
      case 'overview':
        return (
          <Overview 
            metrics={metrics} 
            queries={queries}
            tasks={tasks} 
            competitors={competitors} 
            workspace={workspace}
            onViewCompetitor={handleViewCompetitor} 
            onViewQuery={handleViewQuery}
            onAddQuery={actions.addQuery}
            onAddCompetitor={actions.addCompetitor}
            onNavigateToSuggested={() => setActivePage('suggested')}
            onNavigateToStrategy={() => setActivePage('strategy')}
            onNavigateToRankings={() => setActivePage('competitor-hub')}
            onNavigateToQueries={() => handleNavigateToQueries(false)}
          />
        );
      case 'queries':
        return (
          <Queries 
            queries={queries} 
            workspace={workspace}
            onAddQuery={actions.addQuery} 
            onViewQuery={handleViewQuery} 
            onDeleteQuery={actions.deleteQuery}
            onUpdateQuery={actions.updateQuery}
            initialIsAdding={autoOpenAddQuery}
            onCancelAdd={() => setAutoOpenAddQuery(false)}
          />
        );
      case 'strategy':
        return <Strategy tasks={tasks} queries={queries} onUpdateTask={actions.updateTask} />;
      case 'suggested':
        return <Suggested suggestedQueries={suggestedQueries} onTrack={actions.trackSuggestedQuery} onDismiss={actions.dismissSuggestedQuery} onNavigateToTracked={() => setActivePage('queries')} />;
      case 'competitor-hub':
        return <CompetitorHub competitors={competitors} suggestedCompetitors={[]} onViewCompetitor={handleViewCompetitor} onTrackCompetitor={() => {}} onDismissCompetitor={() => {}} onAddCompetitor={actions.addCompetitor} />;
      case 'competitor-detail':
        const comp = competitors.find(c => c.id === selectedCompetitorId);
        return comp ? <CompetitorDetail competitor={comp} queries={queries} onBack={() => setActivePage('competitor-hub')} onFixQuery={handleViewQuery} initialView={detailViewMode as any} /> : null;
      case 'query-detail':
        const q = queries.find(query => query.id === selectedQueryId);
        return q ? <QueryDetail query={q} tasks={tasks} onBack={() => setActivePage('queries')} onUpdateQuery={actions.updateQuery} onDeleteQuery={actions.deleteQuery} initialAction={detailViewMode} /> : null;
      case 'automation': return <Automation />;
      case 'reports': return <Reports />;
      case 'alerts': return <Alerts />;
      case 'settings': return <Settings initialTab={activeTab} />;
      case 'billing': return <Billing />;
      case 'heatmaps': return <HeatmapsPage />;
      case 'seo-heatmap': return <SeoOpportunityHeatmapPage />;
      case 'ai-recs': return <GscRecommendationsPage />;
      case 'experiments': return <GscExperimentsPage />;
      case 'performance': return <PerformancePage />;
      case 'integrations': return <Integrations />;
      case 'results': return <Results />;
      case 'creators-youtube': return <CreatorsYouTube />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        activePage={activePage === 'competitor-detail' ? 'competitor-hub' : activePage === 'query-detail' ? 'queries' : activePage} 
        setActivePage={(page) => {
          setAutoOpenAddQuery(false);
          setActiveTab(undefined);
          setDetailViewMode(undefined);
          setActivePage(page);
        }} 
        onAddQueryClick={() => handleNavigateToQueries(true)}
        workspace={workspace} 
      />
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <header className="h-20 border-b border-border bg-card/30 flex items-center justify-between px-8 z-40 shrink-0">
          
          <div className="flex items-center gap-4">
            <div className="relative" ref={switcherRef}>
              <InfoTooltip content="Switch Workspace">
                <button 
                  onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                  className={`flex items-center gap-3 p-2 rounded-2xl transition-all group ${isWorkspaceMenuOpen ? 'bg-primary-500/10' : 'hover:bg-muted/50'}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center font-black text-xs text-primary-400 shadow-sm">
                    {workspace.name.charAt(0)}
                  </div>
                  <div className="text-left pr-2">
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-black text-foreground tracking-tight leading-none">{workspace.name}</div>
                      <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-300 ${isWorkspaceMenuOpen ? 'rotate-180 text-primary-500' : ''}`} />
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest opacity-60 truncate max-w-[120px]">{activeDomain?.url}</div>
                  </div>
                </button>
              </InfoTooltip>

              {isWorkspaceMenuOpen && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-[#09090b] border border-white/10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                  <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Switch Workspace</span>
                  </div>
                  <div className="p-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                    {workspace.domains.map(d => (
                      <button 
                        key={d.id}
                        onClick={() => { actions.setActiveDomain(d.id); setIsWorkspaceMenuOpen(false); }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${activeDomainId === d.id ? 'bg-primary-600 shadow-lg shadow-primary-500/20' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`p-2 rounded-xl ${activeDomainId === d.id ? 'bg-white/20 text-white' : 'bg-zinc-900 border border-white/5 text-zinc-400 group-hover:text-white'}`}>
                            <BarChart3 size={16} />
                          </div>
                          <span className={`text-xs font-bold truncate ${activeDomainId === d.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{d.url}</span>
                        </div>
                        {activeDomainId === d.id && <Check size={14} strokeWidth={4} className="text-white mr-2" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 bg-zinc-950/50 border-t border-white/5 space-y-1">
                    <button onClick={() => { setIsAddDomainModalOpen(true); setIsWorkspaceMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all group">
                      <div className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 group-hover:text-white transition-colors">
                        <Plus size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Domain</span>
                    </button>
                    <button onClick={() => { setActiveTab('domains'); setActivePage('settings'); setIsWorkspaceMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all group">
                      <div className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 group-hover:text-white transition-colors">
                        <SettingsIcon size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Manage Domains</span>
                    </button>
                    <button onClick={() => setIsCreateModalOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 transition-all border border-primary-500/20 group">
                      <div className="p-1.5 rounded-lg bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
                        <Plus size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">New Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 border-r border-border/50">
               
               <InfoTooltip content={workspace.automationEnabled ? "Automation Active" : "Enable Automation"}>
                 <button 
                    onClick={handleAutomationToggle}
                    className="flex items-center gap-2 cursor-pointer group mr-2 focus:outline-none"
                 >
                    <div className={`
                      relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300
                      ${workspace.automationEnabled 
                        ? 'bg-primary-600' 
                        : 'bg-zinc-800 border border-white/10 group-hover:border-white/20'
                      }
                    `}>
                        <span className={`
                          ${workspace.automationEnabled ? 'translate-x-5 bg-white shadow-sm' : 'translate-x-1 bg-zinc-500'} 
                          inline-block h-3 w-3 transform rounded-full transition-transform duration-300
                        `} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      workspace.automationEnabled 
                        ? 'text-foreground' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}>
                        Auto
                    </span>
                 </button>
               </InfoTooltip>

               <InfoTooltip content={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                 <button 
                   onClick={() => actions.toggleTheme()} 
                   className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                 >
                   {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                 </button>
               </InfoTooltip>

               <InfoTooltip content="Global Search (Ctrl+K)">
                 <button 
                   onClick={() => setIsSearchModalOpen(true)}
                   className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                 >
                   <Search size={18} />
                 </button>
               </InfoTooltip>
               
               <InfoTooltip content="Notifications">
                 <button onClick={() => setActivePage('alerts')} className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all relative">
                   <Bell size={18} />
                   <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#111]" />
                 </button>
               </InfoTooltip>
            </div>
            
            <div className="relative" ref={userMenuRef}>
              <InfoTooltip content="User Menu">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-3 p-1 pr-3 rounded-full border transition-all ${isUserMenuOpen ? 'bg-primary-500/10 border-primary-500/20' : 'bg-transparent border-transparent hover:bg-muted hover:border-border'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-2 ring-background">AU</div>
                  <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180 text-primary-500' : ''}`} />
                </button>
              </InfoTooltip>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-[#09090b] border border-white/10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 bg-primary-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm font-black text-white shadow-lg">
                        AU
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white tracking-tight">Admin User</div>
                        <div className="text-[10px] font-medium text-zinc-500">admin@techflow.ai</div>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-[9px] font-black uppercase tracking-widest border border-primary-500/20">Pro Plan</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button onClick={() => handleNavigateToSettings('workspace')} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all group">
                      <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-primary-500/30 group-hover:text-primary-400 transition-colors shadow-sm">
                        <User size={16} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-white group-hover:text-primary-400 transition-colors">Account Profile</div>
                        <div className="text-[10px] text-zinc-500">Manage seats & roles</div>
                      </div>
                    </button>
                    
                    <button onClick={() => { setActivePage('billing'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all group">
                      <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-primary-500/30 group-hover:text-primary-400 transition-colors shadow-sm">
                        <CreditCard size={16} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-white group-hover:text-primary-400 transition-colors">Subscription</div>
                        <div className="text-[10px] text-zinc-500">Billing & Invoices</div>
                      </div>
                    </button>
                  </div>

                  <div className="p-2 border-t border-white/5 bg-zinc-950/50">
                    <button onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-all group">
                      <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-rose-500/30 group-hover:text-rose-500 transition-colors shadow-sm">
                        <LogOut size={16} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-[9999] max-w-sm w-full">
          {toasts.map(toast => (
            <div key={toast.id} className="bg-card border border-border rounded-2xl p-4 shadow-soft animate-in slide-in-from-right-10 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : toast.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary-500/10 text-primary-500'}`}>
                {toast.type === 'success' ? <CheckCircle2 size={16} /> : toast.type === 'error' ? <AlertTriangle size={16} /> : <Info size={16} />}
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black text-foreground mb-1 leading-none uppercase tracking-widest">{toast.title}</h4>
                <p className="text-[10px] text-muted-foreground font-medium">{toast.message}</p>
              </div>
              <button onClick={() => actions.removeToast(toast.id)} className="p-1 hover:bg-muted rounded-lg text-muted-foreground"><X size={14} /></button>
            </div>
          ))}
        </div>
      </main>

      <CreateWorkspaceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={actions.createWorkspace} />
      <AddDomainModal isOpen={isAddDomainModalOpen} onClose={() => setIsAddDomainModalOpen(false)} onAdd={handleAddDomain} />
      
      {workspace && (
        <AutomationControlModal 
          isOpen={isAutomationModalOpen}
          onClose={() => setIsAutomationModalOpen(false)}
          onSave={handleAutomationSave}
          currentSettings={workspace.automationSettings}
          isEnabled={workspace.automationEnabled}
          queryCount={queries.length}
          engineCount={workspace.enabled_engines?.length || 5}
        />
      )}

      {workspace && (
        <GlobalSearchModal 
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          queries={queries}
          competitors={competitors}
          tasks={tasks}
          onNavigate={handleSearchNavigate}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
};

export default App;
