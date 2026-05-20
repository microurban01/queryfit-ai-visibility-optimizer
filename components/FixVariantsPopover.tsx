import React, { useState, useEffect } from 'react';
import { Wand2, Loader2, Info, ChevronRight, X, Sparkles } from 'lucide-react';
import { FixVariant } from '../types/contentFixTypes';
import FixVariantCard from './FixVariantCard';
import PasteHtmlFallbackModal from './PasteHtmlFallbackModal';
import { useWorkspace } from '../context/WorkspaceContext';

interface FixVariantsPopoverProps {
  auditItemId: string;
  auditCategory: string;
  auditLabel: string;
  url: string;
  keyword: string;
}

const FixVariantsPopover: React.FC<FixVariantsPopoverProps> = ({
  auditItemId, auditCategory, auditLabel, url, keyword
}) => {
  const { actions } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<FixVariant[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);

  // Load cache if available, but don't auto-trigger to save resources
  useEffect(() => {
    // In a real app we might check cache here.
  }, []);

  const handleOpen = async () => {
    setIsOpen(true);
    if (variants.length === 0) {
      setIsLoading(true);
      try {
        const result = await actions.generateAuditFixes({
          url, keyword, auditItemId, auditCategory, auditLabel
        });
        
        if (result === 'FETCH_BLOCKED') {
          setShowPasteModal(true);
          setIsOpen(false); // Close fix modal, show paste modal
        } else {
          setVariants(result.variants);
        }
      } catch (e) {
        console.error("Failed to gen fixes", e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleManualPaste = async (html: string) => {
    setShowPasteModal(false);
    setIsOpen(true);
    setIsLoading(true);
    const result = await actions.generateAuditFixes({
      url, keyword, auditItemId, auditCategory, auditLabel, manualHtml: html
    });
    if (result !== 'FETCH_BLOCKED') {
      setVariants(result.variants);
    }
    setIsLoading(false);
  };

  const handleUseFix = (variant: FixVariant) => {
    actions.applyAuditFix(variant, url, auditItemId, auditLabel);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
          isOpen 
            ? 'bg-indigo-600 text-white border-indigo-600' 
            : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20'
        }`}
      >
        <Sparkles size={10} /> Generate Fixes
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          <div className="bg-[#09090b] border border-white/10 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden ring-1 ring-white/10">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-zinc-900/50 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-inner">
                  <Wand2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">AI Fix Generator</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Optimizing:</span>
                    <span className="text-[10px] font-bold text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 truncate max-w-[300px]">
                      {auditLabel}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#09090b] custom-scrollbar">
              
              {/* Pro Tip Banner */}
              <div className="mb-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Pro Tip: Use the "80/20" Rule</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    This AI rewrite handles the heavy lifting of SEO and clarity. We recommend a quick human polish to ensure the tone perfectly matches your brand voice before you go live.
                  </p>
                </div>
              </div>

              {/* Variants Grid */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                    <Loader2 size={48} className="text-indigo-500 animate-spin relative z-10" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Analyzing Page Context...</h4>
                    <p className="text-xs text-zinc-500 mt-2 font-medium">Generating semantically optimized variants</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {variants.map(v => (
                    <FixVariantCard key={v.id} variant={v} onUseFix={handleUseFix} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-zinc-900/50 shrink-0 flex justify-between items-center px-8">
               <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <Sparkles size={12} /> Powered by QueryFit AI
               </div>
               <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      <PasteHtmlFallbackModal 
        isOpen={showPasteModal} 
        onClose={() => setShowPasteModal(false)}
        onSubmit={handleManualPaste} 
      />
    </>
  );
};

export default FixVariantsPopover;