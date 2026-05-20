
import React, { useState } from 'react';
import { 
  BarChart3, 
  Link2, 
  CheckCircle2, 
  Search, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  Flame,
  Youtube,
  Key,
  ExternalLink,
  HelpCircle,
  X,
  Wand2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import ClaritySetupWizard from '../components/ClaritySetupWizard';
import InfoTooltip from '../components/InfoTooltip';

const Integrations: React.FC = () => {
  const { integrationSettings, workspace, actions } = useWorkspace();
  const [connectingSource, setConnectingSource] = useState<'gsc' | 'ga4' | 'youtube' | null>(null);
  const [inputValues, setInputValues] = useState({ gsc: '', ga4: '', youtube: '' });
  const [showClarityWizard, setShowClarityWizard] = useState(false);

  const handleInputChange = (key: 'gsc' | 'ga4' | 'youtube', value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const handleConnect = async (source: 'gsc' | 'ga4' | 'youtube') => {
    const value = inputValues[source];
    if (!value) return;
    
    setConnectingSource(source);
    
    // Artificial delay for UX feeling
    await new Promise(r => setTimeout(r, 800));

    if (source === 'youtube') {
      actions.saveYoutubeKey(value);
    } else {
      await actions.connectTrafficSource(source, value);
    }
    
    setConnectingSource(null);
    setInputValues(prev => ({ ...prev, [source]: '' }));
  };

  const handleClarityComplete = (settings: any) => {
    actions.updateClaritySettings(settings);
    setShowClarityWizard(false);
    actions.showToast({ title: 'Clarity Connected', message: 'Heatmaps are now active.', type: 'success' });
  };

  const isClarityConnected = workspace?.claritySettings?.enabled && workspace?.claritySettings?.projectId;
  const isYoutubeConnected = integrationSettings.youtube?.status === 'connected';

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
          <Link2 size={24} className="text-primary-500" />
          Data Connections
        </h1>
        <p className="text-sm text-muted-foreground font-medium max-w-2xl">
          Connect your analytics stack to unlock the full power of QueryFit. We use these sources to verify AI visibility against real-world traffic and user behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 1. Google Search Console */}
        <div className={`group p-8 rounded-[32px] border transition-all flex flex-col relative overflow-hidden ${integrationSettings.gsc.status === 'connected' ? 'bg-card border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-card border-border shadow-soft hover:border-primary-500/30'}`}>
          {integrationSettings.gsc.status === 'connected' && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-[100px] -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110" />}
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#2da44e]/10 flex items-center justify-center border border-[#2da44e]/20">
                <Search size={28} className="text-[#2da44e]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Search Console</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Organic Performance</p>
              </div>
            </div>
            {integrationSettings.gsc.status === 'connected' ? (
              <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={12} strokeWidth={3} /> Active
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border">
                Disconnected
              </span>
            )}
          </div>

          <div className="space-y-6 flex-1 flex flex-col relative z-10">
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Enables <strong>Baseline vs. Latest</strong> reporting. We track Click, Impression, and CTR changes for every query you optimize to prove ROI.
            </p>
            
            {integrationSettings.gsc.status === 'disconnected' ? (
              <div className="space-y-3 mt-auto">
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="text" 
                    placeholder="Property URL (e.g. https://techflow.ai)"
                    className="w-full bg-muted/30 border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:font-medium"
                    value={inputValues.gsc}
                    onChange={(e) => handleInputChange('gsc', e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => handleConnect('gsc')}
                  disabled={!inputValues.gsc || connectingSource === 'gsc'}
                  className="w-full py-4 bg-foreground text-background hover:bg-foreground/90 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {connectingSource === 'gsc' ? <Loader2 size={14} className="animate-spin" /> : 'Connect Property'}
                </button>
              </div>
            ) : (
              <div className="mt-auto p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Connected Property</div>
                  <div className="text-xs font-bold text-foreground truncate max-w-[200px]">{integrationSettings.gsc.propertyUrl}</div>
                </div>
                <button onClick={() => actions.disconnectTrafficSource('gsc')} className="p-2 hover:bg-background rounded-xl text-muted-foreground hover:text-rose-500 transition-colors border border-transparent hover:border-border">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Google Analytics 4 */}
        <div className={`group p-8 rounded-[32px] border transition-all flex flex-col relative overflow-hidden ${integrationSettings.ga4.status === 'connected' ? 'bg-card border-orange-500/20 shadow-lg shadow-orange-500/5' : 'bg-card border-border shadow-soft hover:border-primary-500/30'}`}>
          {integrationSettings.ga4.status === 'connected' && <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-[100px] -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110" />}

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#f9ab00]/10 flex items-center justify-center border border-[#f9ab00]/20">
                <BarChart3 size={28} className="text-[#f9ab00]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Google Analytics 4</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Traffic Quality</p>
              </div>
            </div>
            {integrationSettings.ga4.status === 'connected' ? (
              <span className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
                <CheckCircle2 size={12} strokeWidth={3} /> Active
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border">
                Disconnected
              </span>
            )}
          </div>

          <div className="space-y-6 flex-1 flex flex-col relative z-10">
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Enables <strong>Conversion Attribution</strong>. Verify if the traffic driven by AI optimization actually converts on your landing pages.
            </p>
            
            {integrationSettings.ga4.status === 'disconnected' ? (
              <div className="space-y-3 mt-auto">
                <div className="relative">
                  <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="text" 
                    placeholder="Measurement ID (G-XXXXXXXX)"
                    className="w-full bg-muted/30 border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:font-medium"
                    value={inputValues.ga4}
                    onChange={(e) => handleInputChange('ga4', e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => handleConnect('ga4')}
                  disabled={!inputValues.ga4 || connectingSource === 'ga4'}
                  className="w-full py-4 bg-foreground text-background hover:bg-foreground/90 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {connectingSource === 'ga4' ? <Loader2 size={14} className="animate-spin" /> : 'Connect Stream'}
                </button>
              </div>
            ) : (
              <div className="mt-auto p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Measurement ID</div>
                  <div className="text-xs font-bold text-foreground truncate max-w-[200px]">{integrationSettings.ga4.propertyId}</div>
                </div>
                <button onClick={() => actions.disconnectTrafficSource('ga4')} className="p-2 hover:bg-background rounded-xl text-muted-foreground hover:text-rose-500 transition-colors border border-transparent hover:border-border">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Microsoft Clarity */}
        <div className={`group p-8 rounded-[32px] border transition-all flex flex-col relative overflow-hidden ${isClarityConnected ? 'bg-card border-rose-500/20 shadow-lg shadow-rose-500/5' : 'bg-card border-border shadow-soft hover:border-primary-500/30'}`}>
          {isClarityConnected && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-[100px] -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110" />}

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff4f00]/10 flex items-center justify-center border border-[#ff4f00]/20">
                <Flame size={28} className="text-[#ff4f00]" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Microsoft Clarity</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Behavior Heatmaps</p>
              </div>
            </div>
            {isClarityConnected ? (
              <span className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
                <CheckCircle2 size={12} strokeWidth={3} /> Active
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border">
                Disconnected
              </span>
            )}
          </div>

          <div className="space-y-6 flex-1 flex flex-col relative z-10">
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Visualize <strong>User Behavior</strong>. See click maps, scroll depth, and recordings to understand how AI traffic engages with your content.
            </p>
            
            {!isClarityConnected ? (
              <div className="space-y-3 mt-auto">
                <div className="relative opacity-50">
                  <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <div className="w-full bg-muted/30 border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-muted-foreground flex items-center">
                    <span>Configuration required via Wizard</span>
                  </div>
                </div>
                
                {/* Spacer to align with YouTube's 'Get API Key' line */}
                <div className="h-[22px]" />

                <button 
                  onClick={() => setShowClarityWizard(true)}
                  className="w-full py-4 bg-foreground text-background hover:bg-foreground/90 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Flame size={14} /> Launch Setup Wizard
                </button>
              </div>
            ) : (
              <div className="mt-auto p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Clarity Project</div>
                  <div className="text-xs font-bold text-foreground truncate max-w-[200px]">{workspace?.claritySettings?.projectId}</div>
                </div>
                <button 
                  onClick={() => { if(confirm('Disconnect Clarity?')) actions.disconnectClarity(); }}
                  className="p-2 hover:bg-background rounded-xl text-muted-foreground hover:text-rose-500 transition-colors border border-transparent hover:border-border"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4. YouTube Data API (New) */}
        <div className={`group p-8 rounded-[32px] border transition-all flex flex-col relative overflow-hidden ${isYoutubeConnected ? 'bg-card border-red-600/20 shadow-lg shadow-red-600/5' : 'bg-card border-border shadow-soft hover:border-primary-500/30'}`}>
          {isYoutubeConnected && <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-bl-[100px] -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110" />}

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-600/20">
                <Youtube size={28} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">YouTube Data</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Creator Discovery</p>
              </div>
            </div>
            {isYoutubeConnected ? (
              <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-600/20">
                <CheckCircle2 size={12} strokeWidth={3} /> Active
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border">
                Disconnected
              </span>
            )}
          </div>

          <div className="space-y-6 flex-1 flex flex-col relative z-10">
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Find and analyze <strong>Influencers</strong> who can cite your brand. Required for the Creator Finder module.
            </p>
            
            {!isYoutubeConnected ? (
              <div className="space-y-3 mt-auto">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="password" 
                    placeholder="Enter API Key"
                    className="w-full bg-muted/30 border border-border rounded-2xl pl-11 pr-4 py-4 text-xs font-bold text-foreground focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:font-medium"
                    value={inputValues.youtube}
                    onChange={(e) => handleInputChange('youtube', e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                   <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[9px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
                     <HelpCircle size={10} /> Get API Key
                   </a>
                </div>
                <button 
                  onClick={() => handleConnect('youtube')}
                  disabled={!inputValues.youtube || connectingSource === 'youtube'}
                  className="w-full py-4 bg-foreground text-background hover:bg-foreground/90 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {connectingSource === 'youtube' ? <Loader2 size={14} className="animate-spin" /> : 'Save Key'}
                </button>
              </div>
            ) : (
              <div className="mt-auto p-4 bg-red-600/5 border border-red-600/10 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">API Key Stored</div>
                  <div className="text-xs font-bold text-foreground">••••••••••••••••</div>
                </div>
                <button 
                  onClick={() => actions.saveYoutubeKey('') /* Resets key */} 
                  className="p-2 hover:bg-background rounded-xl text-muted-foreground hover:text-rose-500 transition-colors border border-transparent hover:border-border"
                  title="Remove Key"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Security Assurance */}
      <div className="bg-primary-500/5 border border-primary-500/10 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="p-4 bg-primary-500/10 rounded-2xl text-primary-500 shrink-0 border border-primary-500/10 shadow-inner">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h4 className="text-lg font-black text-foreground mb-1">Bring Your Own Key (BYOK)</h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-2xl">
            QueryFit uses your API credentials directly in your browser session to fetch read-only metrics. 
            We do not store your tokens on our servers. This ensures maximum privacy and data security for your organization.
          </p>
        </div>
        <div className="md:ml-auto">
           <a href="#" className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1 hover:underline">
             Read Security Policy <ExternalLink size={10} />
           </a>
        </div>
      </div>

      {/* Clarity Setup Wizard Modal */}
      {showClarityWizard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowClarityWizard(false)} />
          <div className="bg-card border border-border w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10">
            <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                    <Flame size={20} fill="currentColor" />
                 </div>
                 <h3 className="text-xl font-black text-foreground">Connect Microsoft Clarity</h3>
              </div>
              <button onClick={() => setShowClarityWizard(false)} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <ClaritySetupWizard 
                onComplete={handleClarityComplete} 
                initialDomain={workspace?.primary_domain} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
