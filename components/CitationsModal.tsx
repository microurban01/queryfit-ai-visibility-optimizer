
import React from 'react';
import { X, ExternalLink, Link2, Calendar, Globe, ShieldCheck } from 'lucide-react';

interface Citation {
  domain: string;
  title: string;
  date: string;
  type: string;
  impact: string;
  url: string;
}

interface CitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryText: string;
  citations: Citation[];
}

const CitationsModal: React.FC<CitationsModalProps> = ({ isOpen, onClose, queryText, citations }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/10 shadow-inner">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Source Citations</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Verified AI Proof Links</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 bg-primary-500/5 border-b border-border">
          <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Link2 size={12} /> Target Question
          </div>
          <p className="text-sm font-bold text-foreground italic leading-relaxed">
            "{queryText}"
          </p>
        </div>

        <div className="p-4 max-h-[450px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-3">
            {citations.map((cite, idx) => (
              <a 
                key={idx}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 bg-muted/20 hover:bg-card border border-border/50 hover:border-primary-500/30 rounded-[28px] transition-all flex items-start justify-between shadow-sm"
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/10">
                      {cite.type}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {cite.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-foreground mb-1 group-hover:text-primary-400 transition-colors leading-snug">
                    {cite.title}
                  </h4>
                  <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 mt-2">
                    <Globe size={10} className="text-zinc-500" />
                    {cite.domain}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Impact</div>
                    <div className="text-[10px] font-black text-emerald-500 uppercase">{cite.impact}</div>
                  </div>
                  <div className="p-2 bg-muted rounded-xl text-muted-foreground group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-all border border-transparent group-hover:border-primary-500/20 shadow-inner">
                    <ExternalLink size={14} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <ShieldCheck size={14} />
            Engines Verified: 5/5
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-border"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitationsModal;
