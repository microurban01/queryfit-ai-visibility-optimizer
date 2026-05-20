import React, { useState } from 'react';
import { X, Building2, Globe, Briefcase, Plus, Loader2, Trash2 } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { INDUSTRIES } from '../constants';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, domains: string[], industry: string) => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [additionalDomains, setAdditionalDomains] = useState<string[]>([]);
  const [industryCode, setIndustryCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddDomainField = () => {
    setAdditionalDomains([...additionalDomains, '']);
  };

  const handleAdditionalDomainChange = (index: number, value: string) => {
    const newDomains = [...additionalDomains];
    newDomains[index] = value;
    setAdditionalDomains(newDomains);
  };

  const handleRemoveDomainField = (index: number) => {
    const newDomains = additionalDomains.filter((_, i) => i !== index);
    setAdditionalDomains(newDomains);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedIndustry = INDUSTRIES.find(i => i.code === industryCode)?.name;
    if (!name || !primaryDomain || !selectedIndustry) return;

    // Filter empty additional domains
    const validAdditional = additionalDomains.filter(d => d.trim() !== '');
    const allDomains = [primaryDomain, ...validAdditional];

    setIsSubmitting(true);
    onCreate(name, allDomains, selectedIndustry);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 ring-1 ring-white/10 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between rounded-t-[40px] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-glow shadow-primary-500/20">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">New Workspace</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Scale your AI visibility</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
              <Building2 size={12} /> Company Name
            </label>
            <input
              autoFocus
              required
              className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-all font-bold shadow-inner"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                <Globe size={12} /> Primary Domain
              </label>
              <input
                required
                className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-all font-bold shadow-inner"
                placeholder="e.g. acme.com"
                value={primaryDomain}
                onChange={(e) => setPrimaryDomain(e.target.value)}
              />
            </div>

            {additionalDomains.map((d, i) => (
              <div key={i} className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                    Additional Domain #{i+1}
                 </label>
                 <div className="flex gap-2">
                    <input
                      className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-all font-bold shadow-inner"
                      placeholder="e.g. blog.acme.com"
                      value={d}
                      onChange={(e) => handleAdditionalDomainChange(i, e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={() => handleRemoveDomainField(i)}
                        className="shrink-0 w-14 rounded-2xl bg-muted/30 border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all flex items-center justify-center"
                    >
                        <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            ))}

            <button 
                type="button" 
                onClick={handleAddDomainField} 
                className="text-[10px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 transition-colors w-fit"
            >
                <Plus size={12} /> Add Another Domain
            </button>
          </div>

          <div className="space-y-2">
            <CustomSelect
              label="Industry / Sector"
              value={industryCode}
              options={INDUSTRIES}
              onChange={(code) => setIndustryCode(code)}
              searchable
              searchPlaceholder="Search industries..."
              placeholder="Select industry"
            />
          </div>
        </form>

        <div className="p-8 border-t border-border bg-muted/30 flex gap-4 rounded-b-[40px] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !industryCode || !name || !primaryDomain}
              className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} /> Create Workspace
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
