
import React, { useState } from 'react';
import { X, Settings2, Trash2, AlertCircle, Check, Tag } from 'lucide-react';
import { Query, Priority } from '../types';

interface ManageQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: Query;
  onUpdate: (id: string, updates: Partial<Query>) => void;
  onDelete: (id: string) => void;
}

const ManageQueryModal: React.FC<ManageQueryModalProps> = ({ isOpen, onClose, query, onUpdate, onDelete }) => {
  const [priority, setPriority] = useState<Priority>(query.priority);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(query.tags);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(query.id, { priority, tags });
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleDelete = () => {
    onDelete(query.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 flex items-center justify-center text-foreground border border-border shadow-inner">
              <Settings2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Manage Query</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Configure tracking parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Query Info (Read Only for text) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Tracked Question</label>
            <div className="p-4 bg-muted/50 border border-border rounded-2xl text-sm font-bold text-foreground italic">
              "{query.text}"
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Urgency Priority</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.values(Priority)).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    priority === p 
                      ? p === Priority.HIGH ? 'bg-rose-500 text-white border-rose-600' :
                        p === Priority.MEDIUM ? 'bg-amber-500 text-white border-amber-600' :
                        'bg-zinc-500 text-white border-zinc-600'
                      : 'bg-muted/30 border-border text-muted-foreground hover:border-muted-foreground/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
              <Tag size={12} /> Tags & Categories
            </label>
            <div className="bg-muted/30 border border-border rounded-2xl p-3 min-h-[100px] flex flex-wrap gap-2 content-start shadow-inner">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-card border border-border rounded-lg text-[10px] font-black text-foreground flex items-center gap-2 group">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-rose-500"><X size={12} /></button>
                </span>
              ))}
              <input 
                type="text"
                placeholder="Type and press Enter..."
                className="bg-transparent border-none focus:outline-none text-xs font-bold text-foreground flex-1 min-w-[120px]"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Danger Zone */}
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-rose-500 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Trash2 size={14} /> Stop Tracking This Question
            </button>
          ) : (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 animate-in slide-in-from-bottom-2 duration-200">
               <div className="flex items-center gap-3 mb-4 text-rose-500">
                  <AlertCircle size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Are you absolutely sure?</span>
               </div>
               <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mb-6">
                 Deleting this query will permanently remove all historical data and performance tracking. This action cannot be undone.
               </p>
               <div className="flex gap-3">
                  <button 
                    onClick={handleDelete}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Confirm Delete
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 bg-muted border border-border text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </button>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check size={16} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageQueryModal;
