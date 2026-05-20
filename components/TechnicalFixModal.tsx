
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ChevronDown, 
  Loader2, 
  Zap, 
  Smartphone, 
  Monitor, 
  Code,
  Layout,
  Timer,
  MousePointer2,
  Copy,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { CoreWebVitalsMetrics } from '../types/performanceTypes';
import { getMetricStatus, getStatusColor } from '../constants/coreWebVitalsThresholds';

interface TechnicalFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  metrics: CoreWebVitalsMetrics;
}

type FixCategory = 'LCP' | 'CLS' | 'INP' | 'General';

interface TechnicalFixItem {
  id: string;
  category: FixCategory;
  label: string;
  impact: 'High' | 'Med' | 'Low';
  description: string;
  codeSnippet?: string;
  language?: string;
}

const TechnicalFixModal: React.FC<TechnicalFixModalProps> = ({ isOpen, onClose, url, metrics }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate fixes based on metrics
  const fixes: TechnicalFixItem[] = [];

  // LCP Fixes
  if (metrics.lcp > 2.5) {
    fixes.push({
      id: 'fix-lcp-1',
      category: 'LCP',
      label: 'Preload Hero Image',
      impact: 'High',
      description: 'Your largest content element is an image that loads late. Preload it in the <head> to prioritize fetching.',
      codeSnippet: `<link rel="preload" href="/hero-image.webp" as="image" fetchpriority="high">`,
      language: 'html'
    });
    fixes.push({
      id: 'fix-lcp-2',
      category: 'LCP',
      label: 'Defer Non-Critical JS',
      impact: 'Med',
      description: 'Third-party scripts are blocking the main thread during load. Move them to delayed execution.',
      codeSnippet: `<script src="chat-widget.js" defer></script>\n<!-- or for analytics -->\n<script async src="analytics.js"></script>`,
      language: 'html'
    });
  }

  // CLS Fixes
  if (metrics.cls > 0.1) {
    fixes.push({
      id: 'fix-cls-1',
      category: 'CLS',
      label: 'Explicit Image Dimensions',
      impact: 'High',
      description: 'Images without width/height attributes cause layout shifts when they load. Reserve space explicitly.',
      codeSnippet: `<img src="photo.jpg" width="800" height="600" alt="..." />\n/* CSS Aspect Ratio */\nimg { aspect-ratio: 4 / 3; }`,
      language: 'html'
    });
    fixes.push({
      id: 'fix-cls-2',
      category: 'CLS',
      label: 'Font Display Swap',
      impact: 'Med',
      description: 'Web fonts are causing invisible text flashes (FOIT). Use swap to show fallback text immediately.',
      codeSnippet: `@font-face {\n  font-family: 'Inter';\n  src: url('/inter.woff2') format('woff2');\n  font-display: swap;\n}`,
      language: 'css'
    });
  }

  // INP Fixes
  if (metrics.inp > 200) {
    fixes.push({
      id: 'fix-inp-1',
      category: 'INP',
      label: 'Debounce Event Handlers',
      impact: 'High',
      description: 'Input handlers are running expensive logic on every keystroke. Debounce them to run only after user stops typing.',
      codeSnippet: `function debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), wait);\n  };\n}\n\ninput.addEventListener('input', debounce(updateSearch, 300));`,
      language: 'javascript'
    });
  }

  // General Fallback if everything is good (or add anyway)
  fixes.push({
    id: 'fix-gen-1',
    category: 'General',
    label: 'Enable Text Compression',
    impact: 'Med',
    description: 'Ensure your server is sending assets with Brotli or Gzip compression.',
    codeSnippet: `# Nginx Configuration\ngzip on;\ngzip_types text/plain application/json text/css application/javascript;`,
    language: 'nginx'
  });

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat: FixCategory) => {
    switch (cat) {
      case 'LCP': return <Timer size={14} className="text-amber-500" />;
      case 'CLS': return <Layout size={14} className="text-blue-500" />;
      case 'INP': return <MousePointer2 size={14} className="text-purple-500" />;
      default: return <Zap size={14} className="text-emerald-500" />;
    }
  };

  const score = Math.round(
    ((metrics.lcp <= 2.5 ? 100 : 50) + 
    (metrics.cls <= 0.1 ? 100 : 50) + 
    (metrics.inp <= 200 ? 100 : 50)) / 3
  );
  
  const scoreColor = score >= 90 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = score >= 90 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-[#09090b] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 pb-6 shrink-0 bg-zinc-900/50 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-inner">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Technical Audit</h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Core Web Vitals Optimization</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-black/20 p-3 rounded-xl border border-white/5">
             <ExternalLink size={12} /> Target: <span className="text-white truncate">{url}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar bg-[#09090b]">
          {isScanning ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 size={48} className="text-amber-500 animate-spin relative z-10" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Analyzing Performance Bottlenecks...</h4>
              <p className="text-xs text-zinc-500 font-medium animate-pulse">Tracing critical rendering path & layout shifts</p>
            </div>
          ) : (
            <div className="space-y-8 pt-6">
              
              {/* Score Strip */}
              <div className="grid grid-cols-4 gap-4">
                 <div className="col-span-1 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                    <span className={`text-3xl font-black tracking-tighter ${scoreColor}`}>{score}</span>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Tech Score</span>
                 </div>
                 <div className="col-span-3 grid grid-cols-3 gap-2">
                    <div className="bg-zinc-900/30 rounded-xl border border-white/5 p-3 flex flex-col justify-center items-center">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">LCP</span>
                       <span className={`text-lg font-bold ${getStatusColor(getMetricStatus('lcp', metrics.lcp))}`}>{metrics.lcp.toFixed(2)}s</span>
                    </div>
                    <div className="bg-zinc-900/30 rounded-xl border border-white/5 p-3 flex flex-col justify-center items-center">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">INP</span>
                       <span className={`text-lg font-bold ${getStatusColor(getMetricStatus('inp', metrics.inp))}`}>{Math.round(metrics.inp)}ms</span>
                    </div>
                    <div className="bg-zinc-900/30 rounded-xl border border-white/5 p-3 flex flex-col justify-center items-center">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">CLS</span>
                       <span className={`text-lg font-bold ${getStatusColor(getMetricStatus('cls', metrics.cls))}`}>{metrics.cls.toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              {/* Fix List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <Code size={12} /> Engineering Tasks ({fixes.length})
                </h4>
                
                {fixes.map((fix) => (
                  <div 
                    key={fix.id}
                    className={`border border-white/5 rounded-2xl overflow-hidden transition-all ${expandedId === fix.id ? 'bg-white/5' : 'bg-zinc-900/30 hover:bg-white/[0.02]'}`}
                  >
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(expandedId === fix.id ? null : fix.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 border border-white/5">
                           {getCategoryIcon(fix.category)}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{fix.label}</span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                 fix.impact === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                {fix.impact} Impact
                              </span>
                           </div>
                           <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">{fix.description}</div>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-zinc-500 transition-transform ${expandedId === fix.id ? 'rotate-180' : ''}`} />
                    </div>

                    {expandedId === fix.id && fix.codeSnippet && (
                      <div className="px-14 pb-5 animate-in slide-in-from-top-1 duration-200">
                         <div className="bg-[#0f0f11] rounded-xl border border-white/10 overflow-hidden group relative">
                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
                               <span className="text-[9px] font-bold text-zinc-500 uppercase">{fix.language}</span>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleCopy(fix.codeSnippet!, fix.id); }}
                                 className="text-zinc-400 hover:text-white transition-colors"
                               >
                                 {copiedId === fix.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                               </button>
                            </div>
                            <pre className="p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                               {fix.codeSnippet}
                            </pre>
                         </div>
                         <div className="mt-3 flex justify-end">
                            <button className="text-[10px] font-black uppercase text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                               <Terminal size={12} /> Add to Dev Backlog
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
                ))}
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
             className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95"
           >
             Export Fixes PDF
           </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicalFixModal;
