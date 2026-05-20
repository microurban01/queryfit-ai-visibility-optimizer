
import React, { useState } from 'react';
import { X, Trophy, Link2, TrendingUp, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Query } from '../types';

interface CitationLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (queryId: string) => void;
  query: Query | null;
}

const CitationLeaderboardModal: React.FC<CitationLeaderboardModalProps> = ({ isOpen, onClose, onAnalyze, query }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen || !query) return null;

  const leaderboard = query.citationLeaderboard || [];
  const leader = leaderboard[0];
  const userRank = leaderboard.find(r => r.isUser);
  const citationDeficit = leader && userRank ? leader.count - userRank.count : 0;

  const handleAnalyzeClick = async () => {
    setIsAnalyzing(true);
    // Simulate a brief "deep analysis" for UX weight
    await new Promise(resolve => setTimeout(resolve, 600));
    onAnalyze(query.id);
    onClose();
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        {/* Header Section */}
        <div className="p-8 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-400/10 flex items-center justify-center text-primary-400 border border-primary-400/10 shadow-inner">
                <Link2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Citation Leaderboard</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Niche Proof Authority</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-5 bg-card border border-border rounded-2xl shadow-inner">
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Query Analysed</div>
             <div className="text-sm font-bold text-foreground italic">"{query.text}"</div>
          </div>
        </div>

        {/* List Section */}
        <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
          {leaderboard.map((rank, index) => (
            <div 
              key={rank.name} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                rank.isUser 
                  ? 'bg-primary-400/10 border-primary-400/30 shadow-glow shadow-primary-400/5' 
                  : 'bg-muted/20 border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${
                  index === 0 ? 'bg-amber-500 text-white border-amber-600' : 
                  rank.isUser ? 'bg-primary-400 text-black border-primary-500' : 'bg-card text-muted-foreground border-border'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className={`text-sm font-bold ${rank.isUser ? 'text-primary-400' : 'text-foreground'}`}>
                    {rank.name}
                    {rank.isUser && <span className="ml-2 text-[8px] font-black bg-primary-400 text-black px-1.5 py-0.5 rounded uppercase">You</span>}
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {rank.count} Citations Found
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden border border-border/20">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${(rank.count / (leader?.count || 1)) * 100}%`, 
                      backgroundColor: rank.isUser ? '#a78bfa' : (rank.color || '#64748b') 
                    }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Insight */}
        <div className="p-8 border-t border-border bg-muted/30">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-2.5 rounded-xl shrink-0 border ${citationDeficit > 0 ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' : 'bg-accent-400/10 text-accent-400 border-accent-400/10'}`}>
              {citationDeficit > 0 ? <AlertCircle size={20} /> : <Trophy size={20} />}
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground">
                {citationDeficit > 0 ? `Deficit: ${citationDeficit} Proof Links` : "Market Dominance Achieved"}
              </h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1">
                {citationDeficit > 0 
                  ? `Your brand needs to be cited on ${citationDeficit} more high-authority domains to match ${leader?.name}'s influence for this question.`
                  : "You are currently the most cited brand for this query. Maintain your position by updating your source documentation."}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className={`w-full py-4 bg-primary-500 hover:bg-primary-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 group ${isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>Analyze Missing Citations <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitationLeaderboardModal;
