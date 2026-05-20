
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Globe, 
  Key, 
  Bell, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Server,
  Plus,
  Trash2,
  Check,
  Star,
  ExternalLink,
  Monitor,
  MapPin,
  Languages,
  X,
  Loader2,
  Power,
  Building2,
  ArrowLeftRight,
  BadgeCheck
} from 'lucide-react';
import { Engine, Market } from '../types';
import { ENGINE_METADATA, INDUSTRIES } from '../constants';
import { useWorkspace } from '../context/WorkspaceContext';
import { getFlagEmoji, COMMON_LANGUAGES, COMMON_REGIONS } from '../utils/marketUtils';
import CustomSelect from '../components/CustomSelect';
import InfoTooltip from '../components/InfoTooltip';

// Mock list of workspaces a user might belong to
const ALL_USER_WORKSPACES = [
  { id: 'ws-default', name: 'TechFlow', domain: 'techflow.ai', plan: 'PRO', role: 'Owner' },
  { id: 'ws-personal', name: 'Alex Personal', domain: 'alex.dev', plan: 'STARTER', role: 'Owner' },
  { id: 'ws-agency', name: 'Growth Partners', domain: 'growth.agency', plan: 'AGENCY', role: 'Admin' }
];

const Settings: React.FC<{ initialTab?: string }> = ({ initialTab = 'engines' }) => {
  const { workspace, actions } = useWorkspace();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [connectionMode, setConnectionMode] = useState<'managed' | 'direct'>('managed');
  const [newDomainUrl, setNewDomainUrl] = useState('');
  
  // Workspace management state
  const [wsName, setWsName] = useState(workspace?.name || '');
  const [wsIndustryCode, setWsIndustryCode] = useState(() => {
    return INDUSTRIES.find(i => i.name === workspace?.industry)?.code || '';
  });
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Market adding state
  const [newMarket, setNewMarket] = useState<Market>({ region: 'US', language: 'en' });
  const [isAddingMarket, setIsAddingMarket] = useState(false);
  const [marketAddSuccess, setMarketAddSuccess] = useState(false);

  // Domain adding state
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [domainAddSuccess, setDomainAddSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Update local state if workspace changes (e.g. after switch)
  useEffect(() => {
    if (workspace) {
      setWsName(workspace.name);
      const ind = INDUSTRIES.find(i => i.name === workspace.industry);
      if (ind) setWsIndustryCode(ind.code);
    }
  }, [workspace]);

  if (!workspace) return null;

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainUrl.trim() || isAddingDomain) return;

    setIsAddingDomain(true);
    setDomainAddSuccess(false);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    actions.addDomain(newDomainUrl.trim());
    setNewDomainUrl('');
    setIsAddingDomain(false);
    setDomainAddSuccess(true);
    
    setTimeout(() => setDomainAddSuccess(false), 2000);
  };

  const handleSaveWorkspace = async () => {
    const selectedIndustry = INDUSTRIES.find(i => i.code === wsIndustryCode)?.name;
    if (!wsName.trim() || !selectedIndustry || isSavingWorkspace) return;

    setIsSavingWorkspace(true);
    setSaveSuccess(false);

    try {
      await actions.updateWorkspace(wsName.trim(), selectedIndustry);
      setIsSavingWorkspace(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save workspace", error);
      setIsSavingWorkspace(false);
    }
  };

  const handleAddMarket = () => {
    if (isAddingMarket) return;
    
    // Duplicate Check
    const isDuplicate = workspace.tracked_markets.some(
      m => m.region === newMarket.region && m.language === newMarket.language
    );

    if (isDuplicate) {
      alert("This market is already being tracked.");
      return;
    }

    setIsAddingMarket(true);
    setTimeout(() => {
      actions.addTrackedMarket(newMarket);
      setIsAddingMarket(false);
      setMarketAddSuccess(true);
      // Form Reset
      setNewMarket({ region: 'US', language: 'en' });
      // Feedback reset
      setTimeout(() => setMarketAddSuccess(false), 2000);
    }, 400);
  };

  const handleSwitchWorkspace = (ws: typeof ALL_USER_WORKSPACES[0]) => {
    if (ws.id === workspace.id) return;
    actions.switchWorkspace(ws.id, ws.name, ws.domain);
  };

  // Ensure current workspace is in the list (if it was created dynamically)
  const workspacesList = [...ALL_USER_WORKSPACES];
  if (!workspacesList.find(w => w.id === workspace.id)) {
    workspacesList.unshift({
      id: workspace.id,
      name: workspace.name,
      domain: workspace.primary_domain,
      plan: workspace.plan_tier,
      role: 'Owner'
    });
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
          <SettingsIcon size={24} className="text-primary-500" />
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Configure your workspace, domains, and AI engine connections.</p>
      </div>

      <div className="flex gap-8">
        <aside className="w-64 space-y-1 shrink-0">
          {[
            { id: 'workspace', label: 'Workspace Info', icon: SettingsIcon },
            { id: 'engines', label: 'AI Connection', icon: Server },
            { id: 'domains', label: 'Tracked Domains', icon: Globe },
            { id: 'markets', label: 'Markets & Localization', icon: MapPin },
            { id: 'team', label: 'Team & Access', icon: Users },
            { id: 'notifications', label: 'Alert Rules', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary-500/10 text-primary-400 shadow-sm border border-primary-500/10' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 max-w-3xl space-y-8">
          {activeTab === 'markets' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Target Markets</h3>
                    <InfoTooltip content="Defining target markets helps our AI prioritize regions for discovery and optimization." size={16} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                    <div className="md:col-span-5">
                      <CustomSelect
                        label="Region"
                        value={newMarket.region}
                        options={COMMON_REGIONS}
                        onChange={(code) => setNewMarket({ ...newMarket, region: code })}
                        showFlag
                        searchable
                        searchPlaceholder="Search regions..."
                        placeholder="Select region"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <CustomSelect
                        label="Language"
                        value={newMarket.language}
                        options={COMMON_LANGUAGES}
                        onChange={(code) => setNewMarket({ ...newMarket, language: code })}
                        searchable
                        searchPlaceholder="Search languages..."
                        placeholder="Select language"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <button 
                        onClick={handleAddMarket}
                        disabled={isAddingMarket}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center transition-all shadow-glow active:scale-95 border ${
                          marketAddSuccess 
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20' 
                            : 'bg-primary-600 border-primary-700 hover:bg-primary-500 text-white shadow-primary-500/10'
                        }`}
                      >
                        {isAddingMarket ? <Loader2 size={20} className="animate-spin" /> : marketAddSuccess ? <Check size={20} /> : <Plus size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {workspace.tracked_markets.length > 0 ? workspace.tracked_markets.map((m) => (
                      <div key={`${m.region}-${m.language}`} className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-2xl group hover:border-primary-500/30 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="text-2xl w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-inner">
                             {getFlagEmoji(m.region)}
                           </div>
                           <div>
                              <div className="text-sm font-black text-foreground">
                                {COMMON_REGIONS.find(r => r.code === m.region)?.name || m.region}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                {COMMON_LANGUAGES.find(l => l.code === m.language)?.name || m.language} ({m.language.toUpperCase()})
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => actions.removeTrackedMarket(m.region, m.language)}
                          className="p-2 hover:bg-card rounded-lg text-muted-foreground hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )) : (
                      <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground/30">
                        <MapPin size={32} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No target markets configured</p>
                      </div>
                    )}
                  </div>
               </div>

               <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-6 flex gap-4 shadow-sm">
                 <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500 h-fit">
                   <Globe size={24} />
                 </div>
                 <div>
                   <h4 className="font-black text-foreground mb-1">Localization Strategy</h4>
                   <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                     Removing a market hides it from your dashboard but won't delete historical data. To stop tracking specific questions in a region, manage them in the <strong className="text-foreground">Tracked Questions</strong> tab.
                   </p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'engines' && (
            <div className="space-y-6">
              
              {/* Active Intelligence Models Selection */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Active Intelligence Models</h3>
                   <InfoTooltip content="Select which AI models you want to include in your visibility scans. Disabling a model stops credit consumption for it." size={16} />
                </div>
                
                <div className="space-y-3">
                  {Object.values(Engine).map((e) => {
                    const isEnabled = workspace.enabled_engines?.includes(e);
                    return (
                      <div key={e} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isEnabled ? 'bg-muted/30 border-primary-500/30 shadow-sm' : 'bg-transparent border-border opacity-60'}`}>
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-all"
                            style={{ backgroundColor: isEnabled ? ENGINE_METADATA[e].color : '#333' }}
                          >
                            {ENGINE_METADATA[e].icon}
                          </div>
                          <div>
                            <div className="text-sm font-black text-foreground">{ENGINE_METADATA[e].name}</div>
                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                              {isEnabled ? 'Active' : 'Disabled'}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => actions.toggleEngine(e)}
                          className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${isEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Engine Connection Mode</h3>
                   <InfoTooltip content="Standard mode is recommended for 95% of users. Use Direct Mode only for high-volume enterprise needs." size={16} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setConnectionMode('managed')}
                    className={`p-5 rounded-2xl border text-left transition-all relative ${
                      connectionMode === 'managed' 
                        ? 'bg-primary-500/5 border-primary-500 shadow-sm' 
                        : 'bg-muted/30 border-border hover:border-primary-500/20'
                    }`}
                  >
                    {connectionMode === 'managed' && <CheckCircle2 size={16} className="absolute top-4 right-4 text-primary-500" />}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${connectionMode === 'managed' ? 'bg-primary-500 text-white' : 'bg-card text-muted-foreground'}`}>
                        <Zap size={20} fill={connectionMode === 'managed' ? 'currentColor' : 'none'} />
                      </div>
                      <div className="font-black text-sm text-foreground">Standard (Managed)</div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      Use QueryFit's global AI infrastructure. One click, no API keys needed. <strong className="text-foreground">Deducts credits per scan.</strong>
                    </p>
                  </button>

                  <button 
                    onClick={() => setConnectionMode('direct')}
                    className={`p-5 rounded-2xl border text-left transition-all relative ${
                      connectionMode === 'direct' 
                        ? 'bg-primary-500/5 border-primary-500 shadow-sm' 
                        : 'bg-muted/30 border-border hover:border-primary-500/20'
                    }`}
                  >
                    {connectionMode === 'direct' && <CheckCircle2 size={16} className="absolute top-4 right-4 text-primary-500" />}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${connectionMode === 'direct' ? 'bg-primary-500 text-white' : 'bg-card text-muted-foreground'}`}>
                        <Key size={20} />
                      </div>
                      <div className="font-black text-sm text-foreground">Direct API (BYOAK)</div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                      Connect your own OpenAI/Gemini accounts. <strong className="text-foreground">Waives credit fees</strong>, but requires technical setup.
                    </p>
                  </button>
                </div>
              </div>

              {connectionMode === 'managed' ? (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex gap-4">
                   <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 h-fit">
                     <CheckCircle2 size={24} />
                   </div>
                   <div>
                     <h4 className="font-black text-foreground mb-1">Infrastructure is Ready</h4>
                     <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                       You are currently using the <strong className="text-foreground">QueryFit Global Mesh</strong>. This provides 99.9% uptime and allows us to perform deeper analysis of AI answers using our proprietary scoring algorithms.
                     </p>
                   </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4">Your Custom Endpoints</h3>
                  {workspace.enabled_engines.map((e) => (
                    <div key={e} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl group hover:border-primary-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: ENGINE_METADATA[e].color }}
                        >
                          {ENGINE_METADATA[e].icon}
                        </div>
                        <div>
                          <div className="text-sm font-black text-foreground">{ENGINE_METADATA[e].name}</div>
                          <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
                            {e === Engine.COPILOT ? 'Requires Proxy' : 'Missing Key'}
                            <AlertCircle size={10} className="text-amber-500" />
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-card border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'domains' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Tracked Properties</h3>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/5 px-2 py-1 rounded border border-primary-500/10">
                    {workspace.domains.length} Sites Linked
                  </span>
                </div>

                <form onSubmit={handleAddDomain} className="flex gap-3 mb-8">
                  <div className="flex-1 relative">
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="e.g. docs.brand.com"
                      className="w-full bg-muted border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium shadow-inner"
                      value={newDomainUrl}
                      onChange={(e) => setNewDomainUrl(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isAddingDomain || !newDomainUrl.trim()}
                    className={`px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all flex items-center justify-center gap-2 min-w-[160px] active:scale-95 ${
                      domainAddSuccess 
                        ? 'bg-emerald-600 shadow-emerald-500/20' 
                        : 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20'
                    }`}
                  >
                    {isAddingDomain ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : domainAddSuccess ? (
                      <Check size={16} />
                    ) : (
                      <><Plus size={16} /> Add Domain</>
                    )}
                  </button>
                </form>

                <div className="space-y-3">
                  {workspace.domains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-5 bg-muted/20 border border-border rounded-2xl group hover:border-primary-500/30 transition-all shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                          domain.is_primary ? 'bg-primary-500 text-white border-primary-600 shadow-glow shadow-primary-500/20' : 'bg-card border-border text-muted-foreground'
                        }`}>
                          <Monitor size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-black text-foreground tracking-tight">{domain.url}</span>
                            {domain.is_primary && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 shadow-sm">Primary</span>
                            )}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1.5 opacity-60">Linked on {new Date(domain.added_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {!domain.is_primary && (
                          <InfoTooltip content="Set as Primary">
                            <button 
                              onClick={() => actions.setPrimaryDomain(domain.id)}
                              className="p-2.5 hover:bg-card rounded-xl text-muted-foreground hover:text-amber-500 transition-all border border-transparent hover:border-border"
                            >
                              <Star size={18} />
                            </button>
                          </InfoTooltip>
                        )}
                        <InfoTooltip content="Remove Domain">
                          <button 
                            onClick={() => actions.deleteDomain(domain.id)}
                            className="p-2.5 hover:bg-card rounded-xl text-muted-foreground hover:text-rose-500 transition-all border border-transparent hover:border-border"
                          >
                            <Trash2 size={18} />
                          </button>
                        </InfoTooltip>
                        <InfoTooltip content="Visit Site">
                          <a 
                            href={`https://${domain.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2.5 hover:bg-card rounded-xl text-muted-foreground hover:text-primary-500 transition-all border border-transparent hover:border-border"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </InfoTooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-8">
              {/* General Configuration */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
                 <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-8">General Configuration</h3>
                 <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Workspace Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium shadow-inner" 
                        value={wsName}
                        onChange={(e) => setWsName(e.target.value)}
                      />
                   </div>
                   <div className="space-y-2">
                      <CustomSelect
                        label="Industry"
                        value={wsIndustryCode}
                        options={INDUSTRIES}
                        onChange={(code) => setWsIndustryCode(code)}
                        searchable
                        searchPlaceholder="Search industries..."
                        placeholder="Select industry"
                      />
                   </div>
                   <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                     <AlertCircle size={18} className="text-amber-500 shrink-0" />
                     <p className="text-[10px] text-muted-foreground leading-relaxed">Changing industry settings will reset your <strong>Market Opportunity</strong> suggestions as our AI re-calibrates for a different niche.</p>
                   </div>
                   <button 
                    onClick={handleSaveWorkspace}
                    disabled={isSavingWorkspace || !wsName.trim()}
                    className={`px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 border min-w-[180px] ${
                      saveSuccess 
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/20' 
                        : 'bg-primary-600 border-primary-700 hover:bg-primary-500 text-white'
                    }`}
                   >
                     {isSavingWorkspace ? (
                       <>
                         <Loader2 size={16} className="animate-spin" />
                         Saving...
                       </>
                     ) : saveSuccess ? (
                       <>
                         <Check size={16} />
                         Changes Saved
                       </>
                     ) : (
                       'Save Workspace'
                     )}
                   </button>
                 </div>
              </div>

              {/* My Workspaces */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">My Workspaces</h3>
                   <button 
                     onClick={() => actions.showToast({ title: "Coming Soon", message: "Workspace creation is disabled in demo mode.", type: 'info' })} 
                     className="text-[10px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                   >
                     <Plus size={12} /> Create New
                   </button>
                 </div>
                 
                 <div className="space-y-3">
                   {workspacesList.map((ws) => {
                     const isActive = ws.id === workspace.id;
                     return (
                       <div key={ws.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isActive ? 'bg-primary-500/5 border-primary-500/20' : 'bg-muted/20 border-border hover:bg-muted/40'}`}>
                         <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm ${isActive ? 'bg-primary-500 text-white border-primary-600' : 'bg-card text-muted-foreground border-border'}`}>
                             <Building2 size={18} />
                           </div>
                           <div>
                             <div className="flex items-center gap-2">
                               <span className={`text-sm font-bold ${isActive ? 'text-primary-500' : 'text-foreground'}`}>{ws.name}</span>
                               <span className="text-[8px] font-black bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border uppercase tracking-widest">{ws.plan}</span>
                             </div>
                             <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{ws.role} • {ws.domain}</div>
                           </div>
                         </div>
                         
                         {isActive ? (
                           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-lg shadow-lg shadow-primary-500/20 text-[10px] font-black uppercase tracking-widest">
                             <Check size={12} strokeWidth={4} /> Current
                           </div>
                         ) : (
                           <button 
                             onClick={() => handleSwitchWorkspace(ws)}
                             className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-card border border-transparent hover:border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group"
                           >
                             Switch <ArrowLeftRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                           </button>
                         )}
                       </div>
                     );
                   })}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
