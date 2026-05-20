
import React from 'react';
import { X, Check, ShieldCheck, ArrowRight, Loader2, Star, Zap } from 'lucide-react';
import { PlanTier } from '../types';

interface PlanUpgradeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: PlanTier;
  newPlan: {
    tier: PlanTier;
    price: number;
    credits: string;
    features: string[];
  } | null;
  isProcessing: boolean;
}

const PlanUpgradeConfirmationModal: React.FC<PlanUpgradeConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentPlan,
  newPlan,
  isProcessing
}) => {
  if (!isOpen || !newPlan) return null;

  const getTierRank = (tier: PlanTier) => {
    const ranks = { [PlanTier.STARTER]: 0, [PlanTier.PRO]: 1, [PlanTier.AGENCY]: 2 };
    return ranks[tier];
  };

  const isDowngrade = getTierRank(newPlan.tier) < getTierRank(currentPlan);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-card border border-border w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${isDowngrade ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'}`}>
              {isDowngrade ? <Zap size={24} /> : <Star size={24} fill="currentColor" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Switch Subscription</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Plan Configuration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="flex items-center justify-center gap-6">
            <div className="flex-1 p-4 bg-muted/30 border border-border rounded-2xl text-center grayscale opacity-60">
              <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current</div>
              <div className="text-xs font-black text-foreground">{currentPlan}</div>
            </div>
            <ArrowRight size={20} className="text-primary-500" />
            <div className="flex-1 p-4 bg-primary-500/10 border border-primary-500/30 rounded-2xl text-center shadow-glow shadow-primary-500/5">
              <div className="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-1">
                {isDowngrade ? 'Downgrading To' : 'Upgrading To'}
              </div>
              <div className="text-xs font-black text-foreground">{newPlan.tier}</div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">New Plan Features</div>
             <div className="grid grid-cols-2 gap-3">
                {newPlan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-xl">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-[11px] font-bold text-foreground truncate">{f}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-primary-500/5 border border-primary-500/20 rounded-3xl p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 bg-primary-500/[0.02] rounded-full translate-x-1/2 -translate-y-1/2" />
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Subscription Total</div>
             <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-foreground tracking-tighter">${newPlan.price}</span>
                <span className="text-sm font-bold text-muted-foreground">/mo</span>
             </div>
             <p className="text-[11px] text-muted-foreground font-medium mt-4">
               Your billing cycle will reset. Any unused credits from your current period will be <strong className="text-foreground">carried forward</strong>.
             </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <ShieldCheck size={14} />
            Secure Plan Management
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Back
            </button>
            <button 
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>{isDowngrade ? 'Confirm Downgrade' : 'Confirm & Activate'} <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeConfirmationModal;
