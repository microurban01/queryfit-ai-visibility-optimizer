
import React from 'react';
import { X, CreditCard, ShieldCheck, Coins, ArrowRight, Loader2 } from 'lucide-react';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pack: {
    amount: number;
    price: number;
    label: string;
  } | null;
  isProcessing: boolean;
}

const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  pack,
  isProcessing
}) => {
  if (!isOpen || !pack) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-card border border-border w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/10 shadow-inner">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Confirm Purchase</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Secure Checkout</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8 text-center">
          <div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Selected Package</div>
            <div className="text-2xl font-black text-foreground tracking-tight">{pack.label}</div>
            <div className="flex items-center justify-center gap-2 mt-2 text-primary-400 font-bold">
              <Coins size={16} />
              <span>{pack.amount.toLocaleString()} Credits</span>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-3xl p-8 shadow-inner relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 bg-primary-500/[0.02] rounded-full translate-x-1/2 -translate-y-1/2" />
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total to Charge</div>
             <div className="text-5xl font-black text-foreground tracking-tighter">${pack.price}</div>
             <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-center gap-3">
                <div className="w-8 h-5 bg-zinc-800 rounded border border-white/5 flex items-center justify-center">
                   <div className="w-4 h-2 bg-rose-500/40 rounded-full blur-[1px]" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">Visa ending in <span className="text-foreground">4242</span></span>
             </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <ShieldCheck size={14} />
            Encrypted & Secure Transaction
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>Complete Purchase <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseConfirmationModal;
