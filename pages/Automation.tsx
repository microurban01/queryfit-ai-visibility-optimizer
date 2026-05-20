
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Coins, 
  Info, 
  AlertCircle,
  Play,
  Pause,
  ArrowRight,
  Globe,
  Loader2
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { useWorkspace } from '../context/WorkspaceContext';
import PurchaseConfirmationModal from '../components/PurchaseConfirmationModal';
import { Engine, AutomationSettings } from '../types';

const Automation: React.FC = () => {
  const { workspace, actions, queries } = useWorkspace();
  const isScheduleEnabled = workspace?.automationEnabled ?? true; 
  
  // Initialize from global state, fallback to defaults
  const [settings, setSettings] = useState<AutomationSettings>({
    frequency: 'Daily',
    startTime: '09:00',
    strategy: 'all'
  });

  // Sync local state with workspace state on load
  useEffect(() => {
    if (workspace?.automationSettings) {
      setSettings(workspace.automationSettings);
    }
  }, [workspace?.automationSettings]);

  // Handle updates immediately to global state
  const handleSettingChange = (updates: Partial<AutomationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    actions.updateAutomationSettings(newSettings);
  };

  // Booster Credit State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isProcessingBooster, setIsProcessingBooster] = useState(false);
  const boosterPack = { amount: 5000, price: 149, label: 'Automation Booster' };

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const frequencies = [
    { name: 'Daily', desc: 'Real-time visibility tracking', costMult: 30 },
    { name: 'Weekly', desc: 'Balanced insights & costs', costMult: 4 },
    { name: 'Monthly', desc: 'Long-term trend analysis', costMult: 1 },
  ];

  // Generate 24 hours of options adjusted to the user's local timezone
  const timeOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      const utcHour = i;
      const date = new Date();
      date.setUTCHours(utcHour, 0, 0, 0);
      
      // Format local time based on user locale
      const localTimeStr = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      const utcLabel = `${utcHour.toString().padStart(2, '0')}:00 UTC`;
      
      options.push({
        code: `${utcHour.toString().padStart(2, '0')}:00`,
        name: `${localTimeStr} (Local) / ${utcLabel}`
      });
    }
    return options;
  }, []);

  const strategyOptions = [
    { code: 'all', name: 'Scan All Tracked Queries' },
    { code: 'high', name: 'High Priority Only (Credits-Saver)' },
    { code: 'rotation', name: 'Smart Rotation (Beta)' },
  ];

  const activeEngines = workspace?.enabled_engines || Object.values(Engine);
  const engineCount = activeEngines.length;
  const costPerScan = queries.length * engineCount;
  
  const estimatedMonthlyCost = useMemo(() => {
    const selectedFreq = frequencies.find(f => f.name === settings.frequency);
    return selectedFreq ? costPerScan * selectedFreq.costMult : 0;
  }, [settings.frequency, costPerScan]);

  const gap = workspace ? estimatedMonthlyCost - workspace.credits_balance : 0;

  if (!workspace) return null;

  const handleConfirmBooster = async () => {
    setIsProcessingBooster(true);
    try {
      await actions.topUpCredits(boosterPack.amount);
      actions.showToast({
        title: 'Booster Added',
        message: `Successfully injected ${boosterPack.amount.toLocaleString()} credits into your automation engine.`,
        type: 'success'
      });
      setIsPurchaseModalOpen(false);
    } catch (error) {
      actions.showToast({
        title: 'Purchase Failed',
        message: 'Could not process booster credit purchase.',
        type: 'error'
      });
    } finally {
      setIsProcessingBooster(false);
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <Zap size={24} className="text-primary-500" fill="currentColor" />
            Automation Hub
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Control the QueryFit engine and manage your automated scan schedule.</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
           <div className="flex items-center gap-2">
             <div className={`w-2.5 h-2.5 rounded-full ${isScheduleEnabled ? 'bg-emerald-500 shadow-glow' : 'bg-muted-foreground/30'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
               Engine Status: {isScheduleEnabled ? 'Active' : 'Paused'}
             </span>
           </div>
           <button 
             onClick={() => actions.toggleAutomation(!isScheduleEnabled)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
               isScheduleEnabled ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-primary-600 text-white hover:bg-primary-500'
             }`}
           >
             {isScheduleEnabled ? <><Pause size={12} /> Pause Engine</> : <><Play size={12} /> Resume Engine</>}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          {/* Frequency Selection */}
          <div className={`bg-card border border-border rounded-2xl p-8 shadow-soft transition-opacity duration-300 ${!isScheduleEnabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Scanning Frequency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {frequencies.map((f) => (
                <button
                  key={f.name}
                  onClick={() => handleSettingChange({ frequency: f.name as any })}
                  className={`p-6 rounded-2xl border text-left transition-all group ${
                    settings.frequency === f.name 
                      ? 'bg-primary-500/5 border-primary-500 shadow-sm' 
                      : 'bg-muted/30 border-border hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl border transition-colors ${
                      settings.frequency === f.name ? 'bg-primary-500 text-white' : 'bg-card border-border text-muted-foreground group-hover:text-foreground'
                    }`}>
                      {f.name === 'Daily' ? <Clock size={20} /> : <Calendar size={20} />}
                    </div>
                    {settings.frequency === f.name && <CheckCircle2 size={18} className="text-primary-500" />}
                  </div>
                  <div className="text-base font-black text-foreground mb-1">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground font-medium leading-relaxed">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Engine Settings */}
          <div className={`bg-card border border-border rounded-2xl p-8 shadow-soft transition-opacity duration-300 ${!isScheduleEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operational Window</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-500/5 border border-primary-500/10 rounded text-[9px] font-bold text-primary-400 w-fit uppercase">
                  <Globe size={10} /> Local Region: {userTimezone}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest">
                <Info size={12} /> Defaulting to high-activity hours
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <CustomSelect
                      label="Batch Start Time"
                      value={settings.startTime}
                      options={timeOptions}
                      onChange={(val) => handleSettingChange({ startTime: val })}
                      placeholder="Select time"
                    />
                  </div>
                  <div className="mb-1">
                    <div className="p-3.5 bg-muted/50 border border-border rounded-2xl text-[10px] font-bold text-muted-foreground italic flex items-center gap-2 h-[54px] whitespace-nowrap">
                      <ArrowRight size={12} /> Approx. 4h finish
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <CustomSelect
                  label="Priority Strategy"
                  value={settings.strategy}
                  options={strategyOptions}
                  onChange={(val) => handleSettingChange({ strategy: val as any })}
                  placeholder="Select strategy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-primary-500/30 rounded-3xl p-8 relative overflow-hidden shadow-soft">
            <div className="absolute top-0 right-0 p-24 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Coins size={18} className="text-primary-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Monthly Usage</span>
              </div>
              <div className="text-4xl font-black tracking-tighter mb-2 text-foreground">{estimatedMonthlyCost.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Engine Credits</div>
              
              <div className="mt-8 pt-6 border-t border-border space-y-4">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Your current plan</span>
                  <span className="text-foreground">{(workspace.credits_balance).toLocaleString()} Credits</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Forecast Gap</span>
                  <span className={`font-black ${gap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {gap > 0 ? `+${gap.toLocaleString()} needed` : 'Fully Covered'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Active Models</span>
                  <span className="text-foreground">{engineCount} Engines</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsPurchaseModalOpen(true)}
                className="w-full mt-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap size={14} fill="currentColor" />
                Add Booster Credits
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Automation Benefits</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 size={14} />
                 </div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Daily consistency helps AI models "remember" your brand associations.</p>
              </div>
              <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 size={14} />
                 </div>
                 <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Early detection of competitor citation surges on new domains.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex gap-3">
             <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
             <p className="text-[10px] text-muted-foreground leading-relaxed">
               Automation is currently limited by your <strong className="text-foreground">API Keys</strong>. Ensure all keys in Settings are valid for the engine to run.
             </p>
          </div>
        </div>
      </div>

      <PurchaseConfirmationModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={handleConfirmBooster}
        pack={boosterPack}
        isProcessing={isProcessingBooster}
      />
    </div>
  );
};

export default Automation;
