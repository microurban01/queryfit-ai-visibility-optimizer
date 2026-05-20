
import React, { useState } from 'react';
import { 
  Flame, 
  ExternalLink, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Layout, 
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import ClaritySetupWizard from '../components/ClaritySetupWizard';
import ClarityEmbedFrame from '../components/ClarityEmbedFrame';
import { ClarityDeepLinks } from '../services/ClarityDeepLinks';
import InfoTooltip from '../components/InfoTooltip';

const HeatmapsPage: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);

  if (!workspace) return null;

  const settings = workspace.claritySettings;
  const isConnected = settings && settings.enabled && settings.projectId;

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Clarity? Setup data will be removed locally.')) {
      actions.disconnectClarity();
      setIsEditing(false);
    }
  };

  // If not connected, show the Wizard
  if (!isConnected) {
    return (
      <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <Flame size={24} className="text-orange-500" fill="currentColor" />
            Heatmaps & Recordings
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Visualize user behavior with Microsoft Clarity integration.</p>
        </div>
        <div className="py-8">
          <ClaritySetupWizard onComplete={actions.updateClaritySettings} initialDomain={workspace.primary_domain} />
        </div>
      </div>
    );
  }

  // Connected State
  return (
    <div className="flex flex-col h-full overflow-hidden page-transition bg-background/50">
      {/* Header Bar */}
      <div className="px-8 py-6 border-b border-border bg-card/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
              <Flame size={24} className="text-orange-500" fill="currentColor" />
              Heatmaps
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Visualize user behavior with Microsoft Clarity integration.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={ClarityDeepLinks.getDashboardUrl(settings.projectId)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-muted/50 hover:bg-muted border border-border transition-all text-foreground"
          >
            Dashboard <ExternalLink size={12} />
          </a>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {isEditing && (
          <div className="absolute top-0 left-0 w-full z-30 bg-muted/90 backdrop-blur-md border-b border-border p-6 animate-in slide-in-from-top-5">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex gap-8">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Website Domain</label>
                  <div className="text-sm font-bold text-foreground">{settings.websiteDomain}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Consent Mode</label>
                  <div className="text-sm font-bold text-foreground">{settings.consentModeEnabled ? 'Active' : 'Disabled'}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Verified At</label>
                  <div className="text-sm font-bold text-foreground">{settings.verifiedAt ? new Date(settings.verifiedAt).toLocaleDateString() : 'Pending'}</div>
                </div>
              </div>
              <button 
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Trash2 size={14} /> Disconnect
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <ClarityEmbedFrame 
            projectId={settings.projectId} 
            className="flex-1 w-full shadow-2xl shadow-black/50" 
          />
          
          {/* Footer Note */}
          <div className="mt-4 flex items-center justify-center gap-6 opacity-60">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
              <Layout size={12} /> Powered by Microsoft Clarity
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
              <AlertTriangle size={12} className="text-amber-500" /> 
              No PII Collected
              <InfoTooltip content="QueryFit does not store visitor recordings. All data is managed directly by Microsoft Clarity." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapsPage;
