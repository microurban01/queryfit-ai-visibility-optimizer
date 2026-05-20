
import React, { useState, useMemo, useEffect } from 'react';
import { X, Zap, Clock, Calendar, Coins, Check, AlertCircle, Globe, PauseCircle } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import CustomSelect from './CustomSelect';
import { AutomationSettings } from '../types';

interface AutomationControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AutomationSettings, enabled: boolean) => void;
  currentSettings: AutomationSettings;
  isEnabled: boolean;
  queryCount: number;
  engineCount: number;
}

const AutomationControlModal: React.FC<AutomationControlModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentSettings,
  isEnabled, 
  queryCount,
  engineCount = 5 
}) => {
  const [frequency, setFrequency] = useState(currentSettings.frequency);
  const [startTime, setStartTime] = useState(currentSettings.startTime);
  const [strategy, setStrategy] = useState(currentSettings.strategy);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFrequency(currentSettings.frequency);
      setStartTime(currentSettings.startTime);
      setStrategy(currentSettings.strategy);
    }
  }, [isOpen, currentSettings]);

  // Generate 24 hours of options adjusted to the user's local timezone
  const timeOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      const utcHour = i;
      const date = new Date();
      date.setUTCHours(utcHour, 0, 0, 0);
      
      const localTimeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const utcLabel = `${utcHour.toString().padStart(2, '0')}:00 UTC`;
      
      options.push({
        code: `${utcHour.toString().padStart(2, '0')}:00`,
        name: `${localTimeStr} (Local) / ${utcLabel}`
      });
    }
    return options;
  }, []);

  const costPerScan = queryCount * engineCount;

  const frequencies = [
    { label: 'Daily', icon: <Zap size={16} />, cost: costPerScan * 30, desc: 'Aggressive tracking for fast-moving markets.' },
    { label: 'Weekly', icon: <Clock size={16} />, cost: costPerScan * 4, desc: 'Balanced monitoring for established brands.' },
    { label: 'Monthly', icon: <Calendar size={16} />, cost: costPerScan, desc: 'Long-term baseline visibility tracking.' },
  ];

  const estimatedMonthlyCost = useMemo(() => {
    const selectedFreq = frequencies.find(f => f.label === frequency);
    return selectedFreq ? selectedFreq.cost : 0;
  }, [frequency, frequencies]); 

  const strategyOptions = [
    { code: 'all', name: 'Scan All Tracked Queries' },
    { code: 'high', name: 'High Priority Only (Credits-Saver)' },
    { code: 'rotation', name: 'Smart Rotation (Beta)' },
  ];

  if (!isOpen) return null;

  const handleSaveClick = () => {
    // Implicitly enable automation when saving settings
    onSave({ frequency, startTime, strategy } as AutomationSettings, true);
    onClose();
  };

  const handlePauseClick = () => {
    onSave({ frequency, startTime, strategy } as AutomationSettings, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10 flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-inner">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Scan Automation</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Configure Autonomous Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Configuration Area */}
          <div className="space-y-8">
            
            {/* Frequency Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scanning Frequency</span>
                <InfoTooltip content="Set how often the Global Mesh infrastructure checks AI engines for your brand mentions." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {frequencies.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => setFrequency(f.label as any)}
                    className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between h-32 ${
                      frequency === f.label 
                        ? 'bg-primary-500/10 border-primary-500 shadow-sm' 
                        : 'bg-muted/10 border-border hover:border-primary-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg transition-colors ${frequency === f.label ? 'bg-primary-500 text-white shadow-glow shadow-primary-500/20' : 'bg-muted text-muted-foreground'}`}>
                        {f.icon}
                      </div>
                      {frequency === f.label && <Check size={16} className="text-primary-500" strokeWidth={3} />}
                    </div>
                    <div className="mt-auto">
                      <div className="text-xs font-black text-foreground">{f.label}</div>
                      <div className="text-[9px] text-muted-foreground font-medium leading-tight line-clamp-2 mt-1">{f.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time & Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <CustomSelect
                  label="Batch Start Time"
                  value={startTime}
                  options={timeOptions}
                  onChange={setStartTime}
                  placeholder="Select time"
                />
                <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold text-muted-foreground">
                  <Globe size={10} /> Local Region Time
                </div>
              </div>
              <div className="space-y-2">
                <CustomSelect
                  label="Priority Strategy"
                  value={strategy}
                  options={strategyOptions}
                  onChange={(code) => setStrategy(code as any)}
                  placeholder="Select strategy"
                />
              </div>
            </div>

            {/* Consumption Summary */}
            <div className="bg-primary-500/5 border border-primary-500/10 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary-500/10 rounded-xl text-primary-400">
                  <Coins size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Consumption Forecast</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-black text-foreground">{estimatedMonthlyCost.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Est. Monthly Credits</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    Based on scanning <strong className="text-foreground">{queryCount} tracked queries</strong> across <strong className="text-foreground">{engineCount} engines</strong> at <strong className="text-foreground">{frequency}</strong> frequency.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-primary-500/10 flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                <AlertCircle size={14} />
                Requires Valid API Keys in Settings
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex gap-4 shrink-0">
          {isEnabled ? (
            <button 
              onClick={handlePauseClick}
              className="flex-1 py-4 bg-muted hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 border border-transparent text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <PauseCircle size={16} /> Pause Automation
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
          )}
          
          <button 
            onClick={handleSaveClick}
            className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check size={16} /> {isEnabled ? 'Update Configuration' : 'Enable & Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationControlModal;
