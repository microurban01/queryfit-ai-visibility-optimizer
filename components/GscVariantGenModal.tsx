
import React, { useState } from 'react';
import { X, Wand2, Check, Loader2, RefreshCw, Copy } from 'lucide-react';
import { AiRecommendation, TitleMetaVariant } from '../types/gscRecommendationsTypes';
import { mockService } from '../services/mockDataService';

interface GscVariantGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: AiRecommendation | null;
  onDeploy: (variant: TitleMetaVariant) => void;
}

const GscVariantGenModal: React.FC<GscVariantGenModalProps> = ({ isOpen, onClose, recommendation, onDeploy }) => {
  const [variants, setVariants] = useState<TitleMetaVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && recommendation && variants.length === 0) {
      handleGenerate();
    }
  }, [isOpen, recommendation]);

  const handleGenerate = async () => {
    if (!recommendation) return;
    setLoading(true);
    const generated = await mockService.generateTitleMetaVariants(recommendation.id);
    setVariants(generated);
    // Select the first one by default for better UX
    if (generated.length > 0) setSelectedVariantId(generated[0].id);
    setLoading(false);
  };

  const handleDeployClick = () => {
    const v = variants.find(i => i.id === selectedVariantId);
    if (!v) return;
    
    setIsDeploying(true);
    // Add small delay to show feedback
    setTimeout(() => {
      onDeploy(v);
      // Modal will likely unmount or close via parent prop update
      setIsDeploying(false);
    }, 600);
  };

  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-inner">
              <Wand2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">AI Generator</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Title & Meta Description Variants</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={40} className="text-primary-500 animate-spin" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Analyzing SERP intent & generating hooks...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((v) => (
                <div 
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer group relative ${
                    selectedVariantId === v.id 
                      ? 'bg-primary-500/10 border-primary-500 shadow-glow' 
                      : 'bg-card border-border hover:border-primary-500/30'
                  }`}
                >
                  <div className="space-y-3">
                    <div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Title Tag ({v.title.length} chars)</div>
                      <div className="text-sm font-bold text-blue-400 hover:underline truncate">{v.title}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Meta Description ({v.meta.length} chars)</div>
                      <div className="text-xs text-muted-foreground">{v.meta}</div>
                    </div>
                    <div className="pt-3 border-t border-border/50">
                      <div className="text-[10px] font-medium text-emerald-500 italic">
                        <span className="font-black uppercase not-italic text-emerald-600 mr-2">Why:</span>
                        {v.rationale}
                      </div>
                    </div>
                  </div>
                  {selectedVariantId === v.id && (
                    <div className="absolute top-4 right-4 text-primary-500">
                      <Check size={20} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex justify-between items-center shrink-0">
          <button 
            onClick={handleGenerate} 
            disabled={loading || isDeploying}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Regenerate
          </button>
          
          <div className="flex gap-4">
            <button onClick={onClose} disabled={isDeploying} className="px-6 py-3 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button 
              onClick={handleDeployClick}
              disabled={!selectedVariantId || loading || isDeploying}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 disabled:text-white/50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {isDeploying ? (
                <>Deploying <Loader2 size={14} className="animate-spin" /></>
              ) : (
                <>Deploy to Experiment <Check size={14} /></>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GscVariantGenModal;
