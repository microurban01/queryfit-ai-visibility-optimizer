
import React, { useState } from 'react';
import { Copy, Check, CheckSquare } from 'lucide-react';
import { FixVariant } from '../types/contentFixTypes';

interface FixVariantCardProps {
  variant: FixVariant;
  onUseFix: (variant: FixVariant) => void;
}

const FixVariantCard: React.FC<FixVariantCardProps> = ({ variant, onUseFix }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(variant.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTechnical = variant.kind === 'html_snippet' || variant.kind === 'jsonld';

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary-500/30 transition-all flex flex-col h-full group">
      <div className="p-3 bg-muted/30 border-b border-border flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{variant.title}</span>
        <div className="flex gap-2">
          {variant.estimatedKeywordDensity > 0 && variant.estimatedKeywordDensity < 0.02 && (
            <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">
              ~{(variant.estimatedKeywordDensity * 100).toFixed(1)}% Density
            </span>
          )}
          {isTechnical && (
            <span className="text-[8px] font-bold bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">
              Code
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-1 bg-muted/10 relative">
        <div className="text-[9px] font-bold text-muted-foreground mb-2 flex items-center gap-1 uppercase tracking-wider">
          Paste Location: <span className="text-foreground">{variant.whereToPaste}</span>
        </div>
        
        <pre className="text-xs text-foreground font-medium whitespace-pre-wrap font-sans bg-background border border-border rounded-lg p-3 custom-scrollbar max-h-32 overflow-y-auto">
          {isTechnical ? (
            <code className="font-mono text-[10px]">{variant.content}</code>
          ) : (
            variant.content
          )}
        </pre>
      </div>

      <div className="p-3 bg-card border-t border-border flex gap-2">
        <button 
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-border text-foreground text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button 
          onClick={() => onUseFix(variant)}
          className="flex-[2] flex items-center justify-center gap-2 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95"
        >
          <CheckSquare size={12} /> Use this fix
        </button>
      </div>
    </div>
  );
};

export default FixVariantCard;
