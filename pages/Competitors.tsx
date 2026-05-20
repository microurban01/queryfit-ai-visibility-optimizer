import React, { useState, useMemo } from 'react';
import { Users, Plus, Globe, ExternalLink, ChevronRight, BarChart3, SortDesc, ChevronDown } from 'lucide-react';
import { Competitor } from '../types';

interface CompetitorsProps {
  competitors: Competitor[];
  onViewCompetitor: (id: string) => void;
}

type SortOption = 'name' | 'visibility' | 'citations';

const Competitors: React.FC<CompetitorsProps> = ({ competitors, onViewCompetitor }) => {
  const [sortBy, setSortBy] = useState<SortOption>('visibility');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortedCompetitors = useMemo(() => {
    return [...competitors].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'visibility') {
        return (b.visibility_score || 0) - (a.visibility_score || 0);
      } else if (sortBy === 'citations') {
        return (b.citation_count || 0) - (a.citation_count || 0);
      }
      return 0;
    });
  }, [competitors, sortBy]);

  const sortLabels: Record<SortOption, string> = {
    name: 'Name',
    visibility: 'Visibility Score',
    citations: 'Citation Count'
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <Users size={24} className="text-primary-400" />
            Market Rivals
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Track how rival brands are positioned in AI answer engines.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Custom Sort Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/50 px-4 py-2.5 rounded-xl text-[10px] font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest"
            >
              <SortDesc size={14} className="text-primary-500" />
              <span>Sort: {sortLabels[sortBy]}</span>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {(['visibility', 'citations', 'name'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold transition-all flex items-center justify-between ${
                        sortBy === option ? 'bg-primary-500/10 text-primary-500' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {sortLabels[option]}
                      {sortBy === option && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-glow shadow-primary-500/50" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 hover:border-primary-500/30 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
            <Plus size={16} />
            Add Competitor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCompetitors.map((comp) => (
          <div key={comp.id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary-500/30 transition-all group shadow-soft flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center font-black text-lg text-muted-foreground group-hover:text-primary-500 transition-colors">
                {comp.name.charAt(0)}
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg">
                <ExternalLink size={16} />
              </button>
            </div>
            <h3 className="font-black text-lg mb-2 text-foreground">{comp.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-medium">
              <Globe size={14} className="text-primary-500/50" />
              {comp.domains[0]}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-muted/30 border border-border rounded-xl shadow-inner group-hover:border-primary-500/10 transition-colors">
                <div className="text-[9px] text-muted-foreground font-black uppercase mb-1 tracking-widest">Visibility</div>
                <div className="text-xl font-black text-foreground">{comp.visibility_score || 0}%</div>
              </div>
              <div className="p-4 bg-muted/30 border border-border rounded-xl shadow-inner group-hover:border-primary-500/10 transition-colors">
                <div className="text-[9px] text-muted-foreground font-black uppercase mb-1 tracking-widest">Citations</div>
                <div className="text-xl font-black text-foreground">{(comp.citation_count || 0).toLocaleString()}</div>
              </div>
            </div>

            <button 
              onClick={() => onViewCompetitor(comp.id)}
              className="w-full mt-auto py-3 bg-muted/20 hover:bg-muted/40 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 shadow-sm group/btn"
            >
              <BarChart3 size={14} />
              View Comparison
            </button>
          </div>
        ))}
      </div>

      {sortedCompetitors.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
          <Users size={48} className="mb-4" />
          <div className="text-xs font-black uppercase tracking-[0.2em]">No competitors tracked</div>
        </div>
      )}
    </div>
  );
};

export default Competitors;