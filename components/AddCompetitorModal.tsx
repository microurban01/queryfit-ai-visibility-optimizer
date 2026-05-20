
import React, { useState } from 'react';
import { X, Users, Globe, Plus } from 'lucide-react';

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, domain: string) => void;
}

const AddCompetitorModal: React.FC<AddCompetitorModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (name.trim() && domain.trim()) {
      onAdd(name.trim(), domain.trim());
      setName('');
      setDomain('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/10">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">Track Rival Brand</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Benchmarking intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Brand Name</label>
            <input 
              autoFocus
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-colors font-bold shadow-inner" 
              placeholder="e.g. LogicStream"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Main Website URL</label>
            <div className="relative">
              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                className="w-full bg-muted/30 border border-border rounded-xl pl-12 pr-4 py-4 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-colors font-bold shadow-inner" 
                placeholder="competitor.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 h-fit">
               <Plus size={14} />
             </div>
             <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
               Adding a competitor allows you to compare <strong className="text-foreground">Visibility Gaps</strong> side-by-side. Our engine will start tracking their mentions for all your global questions.
             </p>
          </div>
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Cancel
          </button>
          <button 
            onClick={handleAdd}
            disabled={!name.trim() || !domain.trim()}
            className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
          >
            Start Tracking Rival
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCompetitorModal;
