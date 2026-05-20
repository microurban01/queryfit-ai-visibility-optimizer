
import React from 'react';
import { X, ExternalLink, Clock, FileText, Link2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Engine, Query } from '../types';
import { ENGINE_METADATA } from '../constants';

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  engine: Engine | null;
  query: Query;
}

const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ open, onClose, engine, query }) => {
  if (!open || !engine) return null;

  const meta = ENGINE_METADATA[engine];
  const score = query.engine_scores[engine] || 0;
  const perception = query.engine_perceptions?.[engine];
  const isLinked = score > 60;
  const isMentioned = score > 0;

  // Mock specific citations for this engine since they aren't in the base type
  const mockEngineCitations = isLinked ? [
    { domain: 'g2.com', url: 'https://g2.com/products/techflow/reviews' },
    { domain: 'techcrunch.com', url: 'https://techcrunch.com/2024/05/top-crm-tools' }
  ] : [];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="w-[500px] bg-card border-l border-border h-full relative z-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: meta.color }}
              >
                {React.cloneElement(meta.icon as React.ReactElement<any>, { size: 20 })}
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Evidence Log</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                  {meta.name} Analysis
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Quick Status */}
          <div className="flex items-center gap-4 bg-background/50 p-4 rounded-xl border border-border">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${isLinked ? 'text-emerald-500' : isMentioned ? 'text-amber-500' : 'text-rose-500'}`}>
                {isLinked ? <CheckCircle2 size={14} /> : isMentioned ? <AlertTriangle size={14} /> : <X size={14} />}
                {isLinked ? 'Linked Source' : isMentioned ? 'Brand Mentioned' : 'Not Present'}
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Score Contribution</span>
              <span className="text-xs font-bold text-foreground">{score}/100</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Last Seen</span>
              <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                <Clock size={12} className="text-muted-foreground" />
                {new Date(query.lastScannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* AI Snippet */}
          <section>
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText size={14} className="text-primary-400" />
              AI Response Snippet
            </h4>
            <div className="bg-muted/30 border border-border rounded-2xl p-5 relative">
              {perception ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                      perception.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      perception.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {perception.sentiment} Sentiment
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground">Label: {perception.label}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground italic leading-relaxed">
                    "{perception.shortSnippet}"
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">No snippet captured during last scan.</p>
              )}
            </div>
          </section>

          {/* Citations */}
          <section>
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Link2 size={14} className="text-amber-400" />
              Captured Citations
            </h4>
            
            {mockEngineCitations.length > 0 ? (
              <div className="space-y-3">
                {mockEngineCitations.map((cite, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl group hover:border-primary-500/30 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border shrink-0">
                        {cite.domain.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{cite.domain}</div>
                        <div className="text-[9px] text-muted-foreground truncate">{cite.url}</div>
                      </div>
                    </div>
                    <a href={cite.url} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary-500 hover:bg-muted rounded-lg transition-all">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center opacity-50">
                <Link2 size={24} className="mb-2" />
                <p className="text-xs font-bold text-foreground">No direct citations found</p>
                <p className="text-[10px] text-muted-foreground">This engine mentioned the brand without linking.</p>
              </div>
            )}
          </section>

          {/* Target URL */}
          {query.targetUrl && (
            <section className="pt-6 border-t border-border">
              <div className="flex justify-between items-center bg-primary-500/5 p-4 rounded-xl border border-primary-500/10">
                <div>
                  <div className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-1">Target Page</div>
                  <div className="text-xs font-bold text-foreground truncate max-w-[250px]">{query.targetUrl}</div>
                </div>
                <a 
                  href={query.targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Open
                </a>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default EvidenceDrawer;
