import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  X as XIcon, 
  ChevronDown, 
  Loader2, 
  FileText, 
  Search, 
  Link as LinkIcon,
  Cpu,
  Zap,
  Smartphone,
  Monitor,
  Layout,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import FixVariantsPopover from './FixVariantsPopover';

interface ContentAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryText: string;
  url: string;
}

type AuditStatus = 'pass' | 'fail' | 'warn';

interface AuditItem {
  id: string;
  category: 'Structure' | 'Relevance' | 'Technical';
  label: string;
  status: AuditStatus;
  value?: string;
  details?: string;
  fix?: string;
}

const ContentAuditModal: React.FC<ContentAuditModalProps> = ({ isOpen, onClose, queryText, url }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock Audit Data matching the screenshot context
  const auditItems: AuditItem[] = [
    { id: '1', category: 'Structure', label: 'Page Title is set', status: 'pass', value: '65 chars' },
    { id: '2', category: 'Relevance', label: 'H1 contains keyword', status: 'fail', details: 'H1 is "Welcome to the future", missing core terms', fix: 'Change H1 to "The Best CRM for Marketing Agencies".' },
    { id: '3', category: 'Structure', label: 'H2-H6 used properly', status: 'pass', value: 'Good hierarchy' },
    { id: '4', category: 'Structure', label: 'Meta Description is set', status: 'pass', value: '145 chars' },
    { id: '5', category: 'Structure', label: 'Meta Description length is great', status: 'pass', value: '134/160' },
    { id: '6', category: 'Relevance', label: 'Page contains keyword', status: 'warn', value: 'Low Density', details: 'Keyword density is 0.4%, slightly low', fix: 'Add the keyword naturally 2-3 more times in body text.' },
    { id: '7', category: 'Technical', label: 'Img Alt count', status: 'pass', value: '8/13' },
    { id: '8', category: 'Technical', label: 'Canonical Tag', status: 'pass', value: 'Self-referencing' },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'pass': return (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
          <Check size={10} className="text-emerald-500" strokeWidth={3} />
        </div>
      );
      case 'fail': return (
        <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/50">
          <XIcon size={10} className="text-rose-500" strokeWidth={3} />
        </div>
      );
      case 'warn': return (
        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
          <AlertCircle size={10} className="text-amber-500" strokeWidth={3} />
        </div>
      );
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Structure': return <Layout size={14} />;
      case 'Relevance': return <Search size={14} />;
      case 'Technical': return <Cpu size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const score = 67; // Mock score
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-[#09090b] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 pb-6 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-inner">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Content Audit</h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">On-Page Optimization Check</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                   <LinkIcon size={12} /> Target Page
                </div>
                <div className="text-xs font-bold text-white truncate">{url}</div>
             </div>
             <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                   Target Keyword
                </div>
                <div className="text-xs font-bold text-indigo-400 truncate">"{queryText}"</div>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {isScanning ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 size={48} className="text-indigo-500 animate-spin relative z-10" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Scanning Page Elements...</h4>
              <p className="text-xs text-zinc-500 font-medium animate-pulse">Analyzing DOM structure and semantic density</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Optimization Score Card - Updated to Linear Style */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                 <div className="flex justify-between items-end mb-2">
                    <div>
                        <h4 className="font-bold text-white mb-1">Optimization Score</h4>
                        <p className="text-xs text-zinc-400 font-medium">Content readiness for AI indexing.</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`text-4xl font-black tracking-tighter ${scoreColor}`}>{score}</span>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">/ 100</span>
                    </div>
                 </div>
                 
                 <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full ${scoreBg}`} style={{ width: `${score}%` }} />
                 </div>

                 <p className="text-xs text-zinc-400 leading-relaxed font-medium pt-4 border-t border-white/5">
                    Your page structure is good, but <span className="text-rose-500 font-bold">keyword placement</span> in headers needs attention to signal relevance to AI models.
                 </p>
              </div>

              {/* Page Speed Insights Section - Updated to Linear Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Speed */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Smartphone size={16} /></div>
                         <span className="text-xs font-bold text-white">Mobile Speed</span>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">Poor</div>
                   </div>
                   
                   <div className="flex-1 flex flex-col justify-end">
                       <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-3xl font-black text-white tracking-tighter">48</span>
                          <span className="text-[10px] font-bold text-zinc-500">/ 100</span>
                       </div>
                       <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                          <div className="h-full rounded-full bg-rose-500" style={{ width: '48%' }} />
                       </div>
                       
                       <div className="space-y-1.5 pt-3 border-t border-white/5">
                         <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                            <span>Loading (LCP)</span>
                            <span className="text-rose-500 font-bold">3.2s</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                            <span>Stability (CLS)</span>
                            <span className="text-emerald-500 font-bold">0.05</span>
                         </div>
                       </div>
                   </div>
                </div>

                {/* Desktop Speed */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400"><Monitor size={16} /></div>
                         <span className="text-xs font-bold text-white">Desktop Speed</span>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Great</div>
                   </div>
                   
                   <div className="flex-1 flex flex-col justify-end">
                       <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-3xl font-black text-white tracking-tighter">92</span>
                          <span className="text-[10px] font-bold text-zinc-500">/ 100</span>
                       </div>
                       <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: '92%' }} />
                       </div>

                       <div className="space-y-1.5 pt-3 border-t border-white/5">
                         <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                            <span>Loading (LCP)</span>
                            <span className="text-emerald-500 font-bold">0.8s</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                            <span>Stability (CLS)</span>
                            <span className="text-emerald-500 font-bold">0.00</span>
                         </div>
                       </div>
                   </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-6">
                {['Structure', 'Relevance', 'Technical'].map((cat) => {
                  const items = auditItems.filter(i => i.category === cat);
                  if (items.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-3">
                      <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-2">
                        {getCategoryIcon(cat)} {cat}
                      </h5>
                      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                        {items.map((item, idx) => (
                          <div 
                            key={item.id} 
                            className={`border-b border-white/5 last:border-0 transition-colors`}
                          >
                            <div 
                              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all ${expandedId === item.id ? 'bg-white/5' : ''}`}
                              onClick={() => toggleExpand(item.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="shrink-0">{getStatusIcon(item.status)}</div>
                                <div>
                                  <div className={`text-xs font-bold ${item.status === 'pass' ? 'text-zinc-400' : 'text-white'}`}>
                                    {item.label}
                                  </div>
                                  {item.value && (
                                    <div className="text-[10px] font-medium text-zinc-500 mt-0.5 opacity-80">
                                      {item.value}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {item.status !== 'pass' && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">Fix Needed</span>
                                    {/* Stop propagation so clicking dropdown doesn't toggle expand */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <FixVariantsPopover 
                                        auditItemId={item.id}
                                        auditCategory={item.category}
                                        auditLabel={item.label}
                                        url={url}
                                        keyword={queryText}
                                      />
                                    </div>
                                  </div>
                                )}
                                {item.details && (
                                  <ChevronDown size={14} className={`text-zinc-500 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} />
                                )}
                              </div>
                            </div>
                            
                            {expandedId === item.id && item.details && (
                              <div className="px-14 pb-5 pt-1 animate-in slide-in-from-top-1 duration-200">
                                <div className="bg-[#09090b] rounded-xl p-4 space-y-3 border border-white/10">
                                  <div>
                                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Issue Detected</div>
                                    <p className="text-xs text-white font-medium">{item.details}</p>
                                  </div>
                                  {item.fix && (
                                    <div className="pt-3 border-t border-white/10">
                                      <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <Zap size={10} fill="currentColor" /> Recommendation
                                      </div>
                                      <p className="text-xs text-zinc-400 font-medium">{item.fix}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3 shrink-0">
           <button 
             onClick={onClose}
             className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
           >
             Close
           </button>
           <button 
             onClick={onClose}
             className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
           >
             Export Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default ContentAuditModal;