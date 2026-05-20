
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Search, 
  Cpu, 
  Globe, 
  Database, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Terminal
} from 'lucide-react';

interface DiscoveryIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, label: 'Accessing Global LLM Mention Logs', icon: <Database size={14} /> },
  { id: 2, label: 'Filtering 7-Day Surge Patterns', icon: <TrendingUp size={14} /> },
  { id: 3, label: 'Cross-Referencing Competitor Citations', icon: <Search size={14} /> },
  { id: 4, label: 'Synthesizing Content Gap Solutions', icon: <Cpu size={14} /> },
];

const DiscoveryIntelligenceModal: React.FC<DiscoveryIntelligenceModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [phase, setPhase] = useState<'inform' | 'analyze' | 'result'>('inform');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (phase === 'analyze') {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < STEPS.length - 1) return prev + 1;
          clearInterval(interval);
          setTimeout(() => setPhase('result'), 800);
          return prev;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [phase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="bg-card border border-border w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
        
        {/* Progress Bar (Global) */}
        {phase !== 'inform' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-muted">
            <div 
              className="h-full bg-primary-500 shadow-glow transition-all duration-1000" 
              style={{ width: phase === 'result' ? '100%' : `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        )}

        {/* Phase 1: Informative State */}
        {phase === 'inform' && (
          <div className="p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/10 shadow-inner">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">AI Discovery Engine</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">Active Market Intelligence Retrieval</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                You are about to initiate a deep-web scan of AI search patterns. Our discovery engine will analyze:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
                  <Terminal size={16} className="text-primary-400" />
                  <span className="text-xs font-bold text-foreground">5 LLM Engine Logs</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
                  <Globe size={16} className="text-accent-400" />
                  <span className="text-xs font-bold text-foreground">Global Citation Shifts</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
                  <TrendingUp size={16} className="text-indigo-400" />
                  <span className="text-xs font-bold text-foreground">Competitor Mentions</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
                  <Zap size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-foreground">Content Gaps</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-black text-primary-500 uppercase tracking-widest mb-2">
                <CheckCircle2 size={14} /> Intelligence Outcome
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This process consumes <strong>20 credits</strong> and provides immediate, actionable questions to track that will expand your brand authority where it's currently invisible.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Not Now
              </button>
              <button 
                onClick={() => setPhase('analyze')}
                className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Initiate Discovery <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Analyzing State */}
        {phase === 'analyze' && (
          <div className="p-10 flex flex-col items-center text-center space-y-10 py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-3xl animate-pulse scale-150" />
              <div className="w-24 h-24 rounded-full border-4 border-muted border-t-primary-500 animate-spin relative z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Cpu size={32} className="text-primary-500" />
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <h3 className="text-xl font-black text-foreground tracking-tight">Processing Market Shift Data...</h3>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">{STEPS[currentStep].label}</p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              {STEPS.map((step, idx) => (
                <div key={step.id} className={`flex items-center gap-3 transition-all duration-500 ${idx === currentStep ? 'opacity-100' : idx < currentStep ? 'opacity-50 grayscale' : 'opacity-20'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${idx <= currentStep ? 'bg-primary-500/10 border-primary-500/30 text-primary-500' : 'bg-muted border-border text-muted-foreground'}`}>
                    {idx < currentStep ? <CheckCircle2 size={14} /> : step.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-left">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: Results State */}
        {phase === 'result' && (
          <div className="p-10 text-center space-y-8 py-16">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 shadow-glow shadow-emerald-500/10">
                <Zap size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">Intelligence Feed Updated</h3>
              <p className="text-sm text-muted-foreground font-medium mt-2">
                We've identified <span className="text-foreground font-black">4 high-growth opportunities</span> that your competitors are currently occupying.
              </p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-soft flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">New Market Potential</div>
                <div className="text-xl font-black text-emerald-500">+18.5% Visibility Lift</div>
              </div>
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-card flex items-center justify-center text-[10px] font-black text-zinc-500">
                    ?
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-muted hover:bg-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => { onComplete(); onClose(); }}
                className="flex-[2] py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                View Opportunities Feed <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryIntelligenceModal;
