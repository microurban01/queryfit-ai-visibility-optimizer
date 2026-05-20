
import React, { useState } from 'react';
import { X, Bell, ShieldAlert, TrendingDown, Sparkles, Check, Loader2 } from 'lucide-react';

interface CustomizeAlertRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: any) => void;
}

const CustomizeAlertRulesModal: React.FC<CustomizeAlertRulesModalProps> = ({ isOpen, onClose, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [rules, setRules] = useState({
    visibilityDrop: 5,
    competitorMention: true,
    newOpportunities: true,
    weeklyDigest: false,
    sensitivity: 'normal'
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(rules);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/10 shadow-inner">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Intelligence Thresholds</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Configure Smart Notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Visibility Drop Threshold */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground">
                <TrendingDown size={14} className="text-rose-500" />
                Visibility Drop Alert
              </div>
              <span className="text-xs font-black text-primary-400">{rules.visibilityDrop}% Threshold</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="25" 
              value={rules.visibilityDrop}
              onChange={(e) => setRules({...rules, visibilityDrop: parseInt(e.target.value)})}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary-400"
            />
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
              Notify me only if my Visibility Index for a high-priority query drops by more than {rules.visibilityDrop}%.
            </p>
          </div>

          <div className="h-px bg-border/50" />

          {/* Toggle Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-2xl group hover:border-primary-400/30 transition-all">
              <div className="flex gap-4">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shrink-0 h-fit">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Competitor Benchmarking</div>
                  <p className="text-[10px] text-muted-foreground font-medium">Alert when a rival gains a citation on a top-tier domain.</p>
                </div>
              </div>
              <button 
                onClick={() => setRules({...rules, competitorMention: !rules.competitorMention})}
                className={`w-10 h-5 rounded-full relative transition-all ${rules.competitorMention ? 'bg-primary-500 shadow-glow' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rules.competitorMention ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-2xl group hover:border-primary-400/30 transition-all">
              <div className="flex gap-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 shrink-0 h-fit">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Discovery Engine</div>
                  <p className="text-[10px] text-muted-foreground font-medium">Notify when new high-surge opportunities are detected.</p>
                </div>
              </div>
              <button 
                onClick={() => setRules({...rules, newOpportunities: !rules.newOpportunities})}
                className={`w-10 h-5 rounded-full relative transition-all ${rules.newOpportunities ? 'bg-primary-500 shadow-glow' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rules.newOpportunities ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save Alert Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeAlertRulesModal;
