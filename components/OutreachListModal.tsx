import React, { useState } from 'react';
import { X, CheckSquare, Square, Globe, Shield, ArrowRight, Loader2 } from 'lucide-react';

interface CitationGap {
  id: string;
  domain: string;
  url: string;
  title: string;
  type: string;
  citing: string;
  authority: number;
}

interface OutreachListModalProps {
  isOpen: boolean;
  onClose: () => void;
  gaps: CitationGap[];
  onConfirm: (selectedGaps: CitationGap[]) => void;
}

const OutreachListModal: React.FC<OutreachListModalProps> = ({ isOpen, onClose, gaps, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(gaps.map(g => g.id)));
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    const selected = gaps.filter(g => selectedIds.has(g.id));
    setTimeout(() => {
      onConfirm(selected);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-inner">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Create Outreach Campaign</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Convert gaps into actionable tasks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between mb-2 px-1">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Opportunities</span>
             <span className="text-[10px] font-bold text-primary-500">{selectedIds.size} Selected</span>
          </div>
          
          {gaps.map(gap => {
            const isSelected = selectedIds.has(gap.id);
            return (
              <div 
                key={gap.id}
                onClick={() => toggleSelection(gap.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected 
                    ? 'bg-indigo-500/5 border-indigo-500/30' 
                    : 'bg-card border-border hover:border-primary-500/20'
                }`}
              >
                <div className={`shrink-0 transition-colors ${isSelected ? 'text-indigo-500' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={12} className="text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground">{gap.domain}</span>
                    <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border uppercase tracking-widest">{gap.type}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate font-medium group-hover:text-foreground/80 transition-colors">
                    {gap.title}
                  </div>
                </div>

                <div className="text-right">
                   <div className={`text-sm font-black ${gap.authority > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{gap.authority}</div>
                   <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">DA Score</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border bg-muted/30 flex gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 || isProcessing}
            className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Adding...
              </>
            ) : (
              <>
                Add {selectedIds.size} to To-Do List <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OutreachListModal;