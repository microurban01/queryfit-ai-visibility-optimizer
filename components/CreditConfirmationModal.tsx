
import React, { useState, useEffect } from 'react';
import { X, Zap, Coins, AlertCircle, Loader2, Check } from 'lucide-react';
import { Workspace, Engine } from '../types';
import { ENGINE_METADATA } from '../constants';

interface CreditConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedEngines: Engine[]) => void;
  workspace: Workspace;
  itemCount: number;
  costPerItem?: number;
  isProcessing?: boolean;
  title?: string;
  description?: React.ReactNode;
}

const CreditConfirmationModal: React.FC<CreditConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  workspace, 
  itemCount, 
  isProcessing = false,
  title,
  description
}) => {
  const [selectedEngines, setSelectedEngines] = useState<Engine[]>([]);

  // Initialize with workspace defaults when opening
  useEffect(() => {
    if (isOpen && workspace) {
      setSelectedEngines(workspace.enabled_engines || Object.values(Engine));
    }
  }, [isOpen, workspace]);

  if (!isOpen) return null;

  const toggleEngine = (engine: Engine) => {
    setSelectedEngines(prev => {
      if (prev.includes(engine)) {
        // Prevent deselecting the last engine
        if (prev.length === 1) return prev;
        return prev.filter(e => e !== engine);
      }
      return [...prev, engine];
    });
  };

  const toggleAll = () => {
    if (selectedEngines.length === Object.values(Engine).length) {
      setSelectedEngines([]);
    } else {
      setSelectedEngines(Object.values(Engine));
    }
  };

  // 1 Credit per Engine per Item
  const totalCost = itemCount * selectedEngines.length;
  const canAfford = workspace.credits_balance >= totalCost;
  const balancePercentage = Math.min(100, (workspace.credits_balance / workspace.credits_limit) * 100);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5">
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/10">
                <Zap size={20} fill="currentColor" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">{title || 'Confirm Scan'}</h3>
            </div>
            <div className="text-sm text-zinc-400 font-medium leading-relaxed">
              {description || (
                <>Refreshing <span className="text-white font-bold">{itemCount}</span> {itemCount === 1 ? 'question' : 'questions'} via the Global Mesh.</>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-transparent hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-8 space-y-6">
          
          {/* Model Selection List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Engines</span>
              <button 
                onClick={toggleAll}
                className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
              >
                {selectedEngines.length === Object.values(Engine).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.values(Engine).map((engine) => {
                const isActive = selectedEngines.includes(engine);
                const meta = ENGINE_METADATA[engine];
                
                return (
                  <button
                    key={engine}
                    onClick={() => toggleEngine(engine)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all group ${
                      isActive 
                        ? 'bg-zinc-900 border-primary-500/40 shadow-[0_0_15px_-5px_rgba(139,92,246,0.15)]' 
                        : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Icon stays colored for recognition, but subtle */}
                      <div 
                        className={`transition-colors ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                        style={{ color: meta.color }}
                      >
                        {React.cloneElement(meta.icon as React.ReactElement<any>, { size: 18 })}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                        {meta.name}
                      </span>
                    </div>
                    
                    {/* Uniform Checkbox Style */}
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isActive 
                        ? 'bg-primary-600 border-primary-600 text-white' 
                        : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-600'
                    }`}>
                      {isActive && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost Summary Dashboard */}
          <div className="bg-zinc-900/50 rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estimated Cost</span>
              <div className="flex items-center gap-2">
                <Coins size={14} className="text-amber-500" />
                <span className="text-sm font-black text-white">{totalCost.toLocaleString()} Credits</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Balance After Scan</span>
                <span className={`text-[10px] font-bold ${canAfford ? 'text-zinc-400' : 'text-rose-500'}`}>
                  {(workspace.credits_balance - totalCost).toLocaleString()} / {workspace.credits_limit.toLocaleString()}
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${canAfford ? 'bg-zinc-700' : 'bg-rose-500'}`}
                  style={{ width: `${balancePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {!canAfford && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 font-medium">
                Insufficient credits. Please top up your wallet to continue.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-6 flex gap-3">
          <button 
            onClick={onClose}
            className="h-12 flex-1 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(selectedEngines)}
            disabled={!canAfford || isProcessing || selectedEngines.length === 0}
            className="h-12 flex-[2] bg-primary-600 hover:bg-primary-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm & Scan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditConfirmationModal;
