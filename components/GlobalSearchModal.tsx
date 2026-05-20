
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Target, Users, CheckSquare, ArrowRight, Command, Ghost } from 'lucide-react';
import { Query, Competitor, Task } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  queries: Query[];
  competitors: Competitor[];
  tasks: Task[];
  onNavigate: (type: 'query' | 'competitor' | 'task', id: string) => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ 
  isOpen, 
  onClose, 
  queries, 
  competitors, 
  tasks,
  onNavigate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
        setSearchTerm('');
        setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    
    const lowerTerm = searchTerm.toLowerCase();
    
    return {
        queries: queries.filter(q => q.text.toLowerCase().includes(lowerTerm)).slice(0, 3),
        competitors: competitors.filter(c => c.name.toLowerCase().includes(lowerTerm)).slice(0, 3),
        tasks: tasks.filter(t => t.title.toLowerCase().includes(lowerTerm)).slice(0, 3)
    };
  }, [searchTerm, queries, competitors, tasks]);

  if (!isOpen) return null;

  const hasResults = filteredResults && (filteredResults.queries.length > 0 || filteredResults.competitors.length > 0 || filteredResults.tasks.length > 0);

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="w-full max-w-3xl relative z-10 flex flex-col shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] animate-in slide-in-from-top-4 duration-300">
        
        {/* Main Container */}
        <div className="bg-[#0a0a0b] border border-white/10 rounded-[32px] overflow-hidden ring-1 ring-white/5">
            
            {/* Header / Input */}
            <div className="p-6 border-b border-white/5 flex items-center gap-5">
                <Search className="text-primary-500" size={24} strokeWidth={3} />
                <input 
                    autoFocus
                    className="flex-1 bg-transparent border-none text-xl font-bold text-white focus:outline-none placeholder:text-muted-foreground/50 h-full"
                    placeholder="Search queries, rivals, or strategies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                    onClick={onClose} 
                    className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-white transition-colors"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">ESC</span>
                </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4 space-y-6">
                {!filteredResults ? (
                    <div className="py-16 text-center flex flex-col items-center opacity-50">
                        <Command size={48} className="text-muted-foreground mb-4 opacity-50" strokeWidth={1} />
                        <p className="text-sm font-bold text-foreground">Type to search your workspace</p>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">Questions • Competitors • Tasks</p>
                    </div>
                ) : !hasResults ? (
                    <div className="py-16 text-center flex flex-col items-center opacity-50">
                        <Ghost size={48} className="text-muted-foreground mb-4 opacity-50" strokeWidth={1} />
                        <p className="text-sm font-bold text-foreground">No results found for "{searchTerm}"</p>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">Try a different keyword</p>
                    </div>
                ) : (
                    <>
                        {filteredResults.queries.length > 0 && (
                            <div className="space-y-2">
                                <div className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Target size={12} className="text-primary-500" /> Tracked Questions
                                </div>
                                {filteredResults.queries.map(q => (
                                    <button 
                                        key={q.id}
                                        onClick={() => { onNavigate('query', q.id); onClose(); }}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-primary-500/10 hover:border-primary-500/20 border border-transparent transition-all group text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-sm">
                                            <Target size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-foreground group-hover:text-white truncate">{q.text}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground font-medium">Visibility Score:</span>
                                                <span className={`text-[10px] font-black ${q.overall_score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>{q.overall_score}%</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {filteredResults.competitors.length > 0 && (
                            <div className="space-y-2">
                                <div className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Users size={12} className="text-rose-500" /> Competitors
                                </div>
                                {filteredResults.competitors.map(c => (
                                    <button 
                                        key={c.id}
                                        onClick={() => { onNavigate('competitor', c.id); onClose(); }}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all group text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-sm">
                                            <Users size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-foreground group-hover:text-white truncate">{c.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{c.domains[0]}</div>
                                        </div>
                                        <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {filteredResults.tasks.length > 0 && (
                            <div className="space-y-2">
                                <div className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CheckSquare size={12} className="text-amber-500" /> Strategy Tasks
                                </div>
                                {filteredResults.tasks.map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => { onNavigate('task', t.id); onClose(); }}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-amber-500/10 hover:border-amber-500/20 border border-transparent transition-all group text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-sm">
                                            <CheckSquare size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-foreground group-hover:text-white truncate">{t.title}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-1.5 rounded">{t.status}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-1.5 rounded">{t.impact} Impact</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {filteredResults && (
                <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-6 text-[10px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-foreground font-mono border border-white/10">↑↓</kbd> 
                        Navigate
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-foreground font-mono border border-white/10">↵</kbd> 
                        Select
                    </span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
