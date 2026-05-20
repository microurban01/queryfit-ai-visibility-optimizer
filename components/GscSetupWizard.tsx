
import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  Search, 
  LayoutDashboard, 
  AlertCircle,
  Link2,
  Loader2
} from 'lucide-react';
import { GscConnection } from '../gscTypes';
import CustomSelect from './CustomSelect';

interface GscSetupWizardProps {
  onConnect: () => Promise<void>;
  onSync: (siteUrl: string) => Promise<void>;
  connection: GscConnection;
}

const GscSetupWizard: React.FC<GscSetupWizardProps> = ({ onConnect, onSync, connection }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSite, setSelectedSite] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock sites for Step 2
  const siteOptions = [
    { code: 'sc-domain:techflow.ai', name: 'techflow.ai (Domain Property)' },
    { code: 'https://app.techflow.ai/', name: 'app.techflow.ai (URL Prefix)' }
  ];

  const handleConnect = async () => {
    setIsConnecting(true);
    await onConnect();
    setIsConnecting(false);
    setStep(2);
  };

  const handleSync = async () => {
    if (!selectedSite) return;
    setIsSyncing(true);
    await onSync(selectedSite);
    setIsSyncing(false);
    // The parent component should handle the transition to dashboard after sync
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-10 px-4">
        {[
          { num: 1, label: 'Connect Account' },
          { num: 2, label: 'Select Property' },
          { num: 3, label: 'Analysis' }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
              step >= s.num 
                ? 'bg-primary-500 text-white shadow-glow' 
                : 'bg-muted text-muted-foreground border border-border'
            }`}>
              {step > s.num ? <Check size={14} strokeWidth={3} /> : s.num}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              step >= s.num ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {s.label}
            </span>
            {s.num < 3 && <div className="w-12 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-[32px] p-8 shadow-soft">
        {/* Step 1: Connect Account */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                <Search size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Connect Search Console</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed max-w-md">
                  Unlock real traffic data. Identify "Quick Wins," rising queries, and cannibalization issues using verified Google data.
                </p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
                <LayoutDashboard size={20} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Read-Only Access</p>
                <p className="text-[10px] text-muted-foreground mt-1">We only fetch performance metrics. No changes are made.</p>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-70"
              >
                {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                {isConnecting ? 'Connecting...' : 'Connect Google Account'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Property */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-500">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Select Property</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Choose the verified site you want to analyze.
                </p>
              </div>
            </div>

            <div className="py-4">
              <CustomSelect 
                label="Verified Properties"
                value={selectedSite}
                options={siteOptions}
                onChange={setSelectedSite}
                placeholder="Select a property..."
              />
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Domain properties (e.g., sc-domain:) are recommended for the most complete data coverage.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSync}
                disabled={!selectedSite || isSyncing}
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                {isSyncing ? 'Analyzing...' : 'Start Analysis'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GscSetupWizard;
