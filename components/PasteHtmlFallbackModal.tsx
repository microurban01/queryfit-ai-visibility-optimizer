
import React, { useState } from 'react';
import { X, FileCode, Check } from 'lucide-react';

interface PasteHtmlFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (html: string) => void;
}

const PasteHtmlFallbackModal: React.FC<PasteHtmlFallbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [pastedContent, setPastedContent] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-lg rounded-[24px] shadow-2xl relative z-10 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileCode size={20} className="text-amber-500" />
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Automatic Fetch Blocked</h3>
              <p className="text-[10px] text-muted-foreground font-medium">Please paste the page content manually to generate fixes.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground"><X size={16} /></button>
        </div>
        
        <div className="p-6">
          <textarea
            autoFocus
            className="w-full h-48 bg-muted/50 border border-border rounded-xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            placeholder="Paste HTML source or body text here..."
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
          />
        </div>

        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">Cancel</button>
          <button 
            onClick={() => onSubmit(pastedContent)}
            disabled={!pastedContent.trim()}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Check size={14} /> Generate Fixes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasteHtmlFallbackModal;
