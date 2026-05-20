
import React, { useState } from 'react';
import { X, Globe, Plus, Loader2 } from 'lucide-react';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string) => void;
}

const AddDomainModal: React.FC<AddDomainModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    // Simulate API delay for UX consistency
    setTimeout(() => {
        onAdd(url.trim());
        setIsSubmitting(false);
        setUrl('');
        onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between rounded-t-[40px]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-glow shadow-primary-500/20">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Add Domain</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Track a new property</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
              <Globe size={12} /> Domain URL
            </label>
            <input
              autoFocus
              required
              className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-all font-bold shadow-inner"
              placeholder="e.g. app.acme.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Domain
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDomainModal;
