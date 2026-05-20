
import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Market } from '../types';
import { COMMON_LANGUAGES, COMMON_REGIONS } from '../utils/marketUtils';
import CustomSelect from './CustomSelect';

interface AddQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string, market: Market) => void;
}

const AddQueryModal: React.FC<AddQueryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [newQueryText, setNewQueryText] = useState('');
  const [newMarket, setNewMarket] = useState<Market>({ region: 'US', language: 'en' });

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newQueryText.trim()) {
      onAdd(newQueryText, newMarket);
      setNewQueryText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/10">
              <Search size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">Track Global Question</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Configure AI Visibility Monitoring</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Query Text</label>
            <input 
              autoFocus
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-colors font-medium shadow-sm" 
              placeholder="e.g. 'Best CRM for small marketing agencies'"
              value={newQueryText}
              onChange={(e) => setNewQueryText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <CustomSelect
              label="Region / Country"
              value={newMarket.region}
              options={COMMON_REGIONS}
              onChange={(code) => setNewMarket({ ...newMarket, region: code })}
              showFlag
              searchable
              searchPlaceholder="Search regions..."
              placeholder="Select region"
            />
            <CustomSelect
              label="Language"
              value={newMarket.language}
              options={COMMON_LANGUAGES}
              onChange={(code) => setNewMarket({ ...newMarket, language: code })}
              searchable
              searchPlaceholder="Search languages..."
              placeholder="Select language"
            />
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
            <div className="text-amber-500 shrink-0 mt-0.5 shadow-glow shadow-amber-500/20">
              <X size={14} className="rotate-45" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Monitoring global queries consumes <strong className="text-foreground">5 credits</strong> per engine per scan. 
              Results are updated according to your automation schedule.
            </p>
          </div>
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleAdd}
            disabled={!newQueryText.trim()}
            className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
          >
            Start Tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQueryModal;
