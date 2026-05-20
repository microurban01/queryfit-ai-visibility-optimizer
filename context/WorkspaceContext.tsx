
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Workspace, Metrics, Query, Task, Competitor, SuggestedCompetitor, Market, Domain, ToastMessage, SuggestedQuery, PlanTier, Engine, IntegrationSettings, MetricsSnapshot, Recommendation, AutomationSettings } from '../types';
import { ClarityIntegrationSettings } from '../clarityTypes';
import { GscConnection, SeoOpportunityState } from '../gscTypes';
import { PagePerformanceSummary } from '../types/performanceTypes';
import { FixPack, FixVariant } from '../types/contentFixTypes';
import { mockService } from '../services/mockDataService';
import { GscClient } from '../services/gscClient';

interface WorkspaceContextType {
  workspace: Workspace | null;
  metrics: Metrics | null;
  queries: Query[];
  suggestedQueries: SuggestedQuery[];
  competitors: Competitor[];
  suggestedCompetitors: SuggestedCompetitor[];
  tasks: Task[];
  activeDomainId: string | null;
  isLoading: boolean;
  toasts: ToastMessage[];
  theme: 'light' | 'dark';
  
  gscConnection: GscConnection;
  seoState: SeoOpportunityState;

  // Traffic Proof
  integrationSettings: IntegrationSettings;
  snapshots: MetricsSnapshot[];
  trafficRecommendations: Recommendation[];

  refreshState: (domainId?: string) => void;
  actions: {
    addQuery: (text: string, market?: Market) => void;
    deleteQuery: (id: string) => void;
    updateQuery: (id: string, updates: Partial<Query>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    trackSuggestedQuery: (sq: SuggestedQuery) => void;
    dismissSuggestedQuery: (id: string) => void;
    addCompetitor: (name: string, domain: string) => void;
    trackCompetitor: (sc: SuggestedCompetitor) => void;
    dismissCompetitor: (id: string) => void;
    addDomain: (url: string) => void;
    deleteDomain: (id: string) => void;
    setPrimaryDomain: (id: string) => void;
    setActiveDomain: (id: string) => void;
    switchWorkspace: (workspaceId: string, name: string, domain: string) => void;
    createWorkspace: (name: string, domains: string[], industry: string) => void;
    updateWorkspace: (name: string, industry: string) => Promise<void>;
    addTrackedMarket: (market: Market) => void;
    removeTrackedMarket: (region: string, language: string) => void;
    showToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
    topUpCredits: (amount: number) => Promise<void>;
    updatePlanTier: (tier: PlanTier) => Promise<void>;
    toggleEngine: (engine: Engine) => void;
    toggleTheme: () => void;
    toggleAutomation: (enabled: boolean) => void; 
    updateAutomationSettings: (settings: AutomationSettings) => void; 
    toggleAutoRefill: (enabled: boolean) => void; // Added
    
    updateClaritySettings: (settings: ClarityIntegrationSettings) => void;
    disconnectClarity: () => void;

    connectGsc: () => Promise<void>;
    disconnectGsc: () => void;
    syncGscData: (siteUrl: string) => Promise<void>;
    addTaskFromOpportunity: (task: Task) => void;

    getPerformanceSummary: (url: string, queryId?: string) => PagePerformanceSummary;
    runPerformanceCheck: (url: string) => Promise<PagePerformanceSummary>;
    getTopPerformancePages: () => PagePerformanceSummary[];

    generateAuditFixes: (params: { url: string, keyword: string, auditItemId: string, auditCategory: string, auditLabel: string, manualHtml?: string }) => Promise<FixPack | 'FETCH_BLOCKED'>;
    applyAuditFix: (variant: FixVariant, url: string, auditItemId: string, auditLabel: string) => void;

    // Traffic Proof Actions
    connectTrafficSource: (source: 'gsc' | 'ga4', property: string) => Promise<void>;
    disconnectTrafficSource: (source: 'gsc' | 'ga4') => void;
    createActionPlan: (opportunity: SuggestedQuery) => Promise<void>;
    refreshMetrics: (taskId: string, queryId: string) => Promise<MetricsSnapshot>;
    
    // YouTube
    saveYoutubeKey: (key: string) => void;
  };
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [suggestedQueries, setSuggestedQueries] = useState<SuggestedQuery[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<SuggestedCompetitor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('queryfit-theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  const [gscConnection, setGscConnection] = useState<GscConnection>(mockService.getGscConnection());
  const [seoState, setSeoState] = useState<SeoOpportunityState>({
    datePreset: '28d',
    searchType: 'web',
    device: 'all',
    country: 'all',
    queryContains: '',
    minImpressions: 100,
    opportunities: [],
    rows: [],
    isLoading: false
  });

  // Traffic Proof State
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(mockService.getIntegrationSettings(''));
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([]);
  const [trafficRecommendations, setTrafficRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('queryfit-theme', theme);
  }, [theme]);

  const refreshState = useCallback((domainId?: string) => {
    const ws = mockService.getWorkspace();
    const currentDomainId = domainId || activeDomainId || ws.domains.find(d => d.is_primary)?.id || ws.domains[0]?.id || null;
    
    setWorkspace({ ...ws });
    setMetrics({ ...mockService.getMetrics(currentDomainId || undefined) });
    setQueries([...mockService.getQueries()]);
    setSuggestedQueries([...mockService.getSuggestedQueries()]);
    setCompetitors([...mockService.getCompetitors()]);
    setSuggestedCompetitors([...mockService.getSuggestedCompetitors()]);
    setTasks([...mockService.getTasks()]);
    setGscConnection(mockService.getGscConnection());
    
    // Traffic Proof Updates
    setIntegrationSettings(mockService.getIntegrationSettings(ws.id));
    setSnapshots(mockService.getSnapshots(ws.id));

    setActiveDomainId(currentDomainId);
    setIsLoading(false);
  }, [activeDomainId]);

  useEffect(() => {
    refreshState();
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Actions
  const actions = {
    showToast,
    removeToast,
    addQuery: (text: string, market?: Market) => { mockService.addQuery(text, market); refreshState(); },
    deleteQuery: (id: string) => { setQueries(prev => prev.filter(q => q.id !== id)); showToast({title:'Query Deleted', message:'Removed', type:'info'}); },
    updateQuery: (id: string, updates: Partial<Query>) => { setQueries(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q)); },
    updateTask: (id: string, updates: Partial<Task>) => { setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)); },
    deleteTask: (id: string) => { mockService.deleteTask(id); refreshState(); showToast({ title: 'Task Deleted', message: 'Removed from planner.', type: 'info' }); },
    trackSuggestedQuery: (sq: SuggestedQuery) => { mockService.addQuery(sq.text, sq.market); mockService.removeSuggestedQuery(sq.id); refreshState(); },
    dismissSuggestedQuery: (id: string) => { mockService.removeSuggestedQuery(id); refreshState(); },
    addCompetitor: (name: string, domain: string) => { mockService.addCompetitor(name, domain); refreshState(); },
    trackCompetitor: (sc: SuggestedCompetitor) => { setCompetitors(prev => [sc, ...prev]); setSuggestedCompetitors(prev => prev.filter(c => c.id !== sc.id)); },
    dismissCompetitor: (id: string) => { setSuggestedCompetitors(prev => prev.filter(c => c.id !== id)); },
    addDomain: (url: string) => { mockService.addDomain(url); refreshState(); },
    deleteDomain: (id: string) => { mockService.deleteDomain(id); refreshState(); },
    setPrimaryDomain: (id: string) => { mockService.setPrimaryDomain(id); refreshState(); },
    setActiveDomain: (id: string) => { setActiveDomainId(id); setMetrics({ ...mockService.getMetrics(id) }); },
    switchWorkspace: (workspaceId: string, name: string, domain: string) => {
      setIsLoading(true);
      setTimeout(() => {
        setWorkspace(prev => prev ? { ...prev, id: workspaceId, name, primary_domain: domain } : null);
        setIsLoading(false);
      }, 800);
    },
    createWorkspace: (name: string, domains: string[], industry: string) => {
      setIsLoading(true);
      setTimeout(() => {
        const newDomains = domains.map((d, i) => ({
            id: `d-${Date.now()}-${i}`,
            url: d,
            is_primary: i === 0,
            added_at: new Date().toISOString()
        }));

        setWorkspace(prev => prev ? { 
            ...prev, 
            id: `ws-${Date.now()}`, 
            name, 
            primary_domain: domains[0], 
            domains: newDomains,
            industry 
        } : null);
        setActiveDomainId(newDomains[0].id);
        setIsLoading(false);
      }, 1200);
    },
    updateWorkspace: async (name: string, industry: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkspace(prev => prev ? { ...prev, name, industry } : null);
    },
    addTrackedMarket: (market: Market) => { mockService.addTrackedMarket(market); refreshState(); },
    removeTrackedMarket: (region: string, language: string) => { mockService.removeTrackedMarket(region, language); refreshState(); },
    topUpCredits: async (amount: number) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      mockService.topUpCredits(amount);
      refreshState();
    },
    updatePlanTier: async (tier: PlanTier) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      mockService.setPlanTier(tier);
      refreshState();
    },
    toggleEngine: (engine: Engine) => { mockService.toggleWorkspaceEngine(engine); refreshState(); },
    toggleTheme: () => { setTheme(prev => prev === 'dark' ? 'light' : 'dark'); },
    toggleAutomation: (enabled: boolean) => {
      mockService.setAutomation(enabled);
      refreshState();
      showToast({ title: enabled ? 'Automation Enabled' : 'Automation Paused', message: enabled ? 'Scheduled scans are active.' : 'Scheduled scans paused.', type: 'info' });
    },
    updateAutomationSettings: (settings: AutomationSettings) => {
      mockService.updateAutomationSettings(settings);
      refreshState();
      showToast({ title: 'Configuration Saved', message: 'Automation schedule updated successfully.', type: 'success' });
    },
    toggleAutoRefill: (enabled: boolean) => {
      mockService.setAutoRefill(enabled);
      refreshState();
      showToast({ 
        title: enabled ? 'Auto-Refill Enabled' : 'Auto-Refill Paused', 
        message: enabled ? 'Wallet will auto-refill when low.' : 'Manual top-up required.', 
        type: enabled ? 'success' : 'info' 
      });
    },
    updateClaritySettings: (settings: ClarityIntegrationSettings) => { mockService.updateClaritySettings(settings); refreshState(); },
    disconnectClarity: () => { mockService.disconnectClarity(); refreshState(); },
    connectGsc: async () => { setGscConnection(prev => ({ ...prev, isConnected: true, tokenStatus: 'ok', lastSyncAt: new Date().toISOString() })); mockService.setGscConnection({ isConnected: true, tokenStatus: 'ok' }); },
    disconnectGsc: () => { setGscConnection({ isConnected: false, tokenStatus: 'none' }); setSeoState(prev => ({ ...prev, opportunities: [], rows: [] })); mockService.setGscConnection({ isConnected: false, tokenStatus: 'none' }); },
    syncGscData: async (siteUrl: string) => {
      setSeoState(prev => ({ ...prev, isLoading: true }));
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = mockService.generateGscMockData(siteUrl, queries);
        setSeoState(prev => ({ ...prev, rows: mockData.rows, opportunities: mockData.opportunities, isLoading: false }));
        setGscConnection(prev => ({ ...prev, selectedSiteUrl: siteUrl, lastSyncAt: new Date().toISOString() }));
      } catch (error) {
        setSeoState(prev => ({ ...prev, isLoading: false }));
      }
    },
    addTaskFromOpportunity: (task: Task) => { mockService.addTask(task); refreshState(); showToast({ title: 'Task Created', message: 'Added to Strategy Planner.', type: 'success' }); },
    getPerformanceSummary: (url, queryId) => mockService.getPerformanceSummary(url, queryId),
    runPerformanceCheck: (url) => mockService.runPerformanceCheck(url),
    getTopPerformancePages: () => mockService.listTopPerformancePages(workspace?.id || ''),

    generateAuditFixes: async (params) => {
      return mockService.generateFixPack(params);
    },
    applyAuditFix: (variant, url, auditItemId, auditLabel) => {
      const task = mockService.createTaskFromFix(workspace?.id || 'ws-default', '', url, auditItemId, variant);
      refreshState();
      showToast({ 
        title: 'Strategy Task Created', 
        message: `Task added: "Apply Fix: ${variant.title}"`, 
        type: 'success',
        actionLabel: 'View Task',
        onAction: () => { /* Logic handled by router or user nav */ }
      });
    },

    // --- TRAFFIC PROOF ACTIONS ---
    connectTrafficSource: (source: 'gsc' | 'ga4', property: string) => {
      return actions.connectTrafficSource(source, property);
    },
    disconnectTrafficSource: (source: 'gsc' | 'ga4') => {
      return actions.disconnectTrafficSource(source);
    },
    createActionPlan: (opportunity: SuggestedQuery) => {
      return actions.createActionPlan(opportunity);
    },
    refreshMetrics: (taskId: string, queryId: string) => {
      return actions.refreshMetrics(taskId, queryId);
    },
    
    // YouTube
    saveYoutubeKey: (key: string) => {
      mockService.saveYoutubeKey(key);
      refreshState();
      showToast({ title: 'Key Saved', message: 'YouTube API Key securely stored.', type: 'success' });
    }
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspace, metrics, queries, suggestedQueries, competitors, suggestedCompetitors, tasks, activeDomainId, isLoading, toasts, theme, 
      gscConnection, seoState,
      integrationSettings, snapshots, trafficRecommendations,
      refreshState, actions 
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
