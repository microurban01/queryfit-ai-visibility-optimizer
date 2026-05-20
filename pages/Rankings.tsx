
import React, { useState, useMemo } from 'react';
import { Trophy, TrendingUp, TrendingDown, HelpCircle, ChevronDown } from 'lucide-react';
import { Engine } from '../types';
import { ENGINE_METADATA } from '../constants';

type FilterType = 'total' | 'tool' | 'topic';

const Rankings: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('total');
  const [selectedTool, setSelectedTool] = useState<Engine>(Engine.CHATGPT);
  const [selectedTopic, setSelectedTopic] = useState<string>('CRM');

  const topics = ['CRM', 'Marketing', 'Workflows', 'Pricing', 'Scaling'];

  const leaders = useMemo(() => {
    const baseLeaders = [
      { id: 'you', name: 'You (TechFlow)', score: 74, status: 'Rising Fast' },
      { id: 'logic', name: 'LogicStream', score: 68, status: 'Steady' },
      { id: 'flux', name: 'FluxDesk', score: 55, status: 'Falling' },
      { id: 'zenith', name: 'Zenith CRM', score: 42, status: 'Steady' },
    ];

    if (activeFilter === 'total') return baseLeaders;

    const seed = activeFilter === 'tool' ? selectedTool : selectedTopic;
    const charCodeSum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return [...baseLeaders].map(item => ({
      ...item,
      score: Math.min(100, Math.max(10, item.score + (charCodeSum % 15) - 7))
    })).sort((a, b) => b.score - a.score);
  }, [activeFilter, selectedTool, selectedTopic]);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition">
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
          <Trophy size={24} className="text-amber-400" />
          How You Compare
        </h1>
        <p className="text-sm text-muted-foreground font-medium">Your current standing against rivals across all AI tools.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
        {/* Filter Navigation */}
        <div className="p-6 border-b border-border bg-muted/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-4 md:gap-6">
            <button 
              onClick={() => setActiveFilter('total')}
              className={`text-xs font-black transition-all pb-2 border-b-2 uppercase tracking-widest ${
                activeFilter === 'total' ? 'text-primary-500 border-primary-500' : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Total Awareness
            </button>
            <button 
              onClick={() => setActiveFilter('tool')}
              className={`text-xs font-black transition-all pb-2 border-b-2 uppercase tracking-widest ${
                activeFilter === 'tool' ? 'text-primary-500 border-primary-500' : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              By Specific Tool
            </button>
            <button 
              onClick={() => setActiveFilter('topic')}
              className={`text-xs font-black transition-all pb-2 border-b-2 uppercase tracking-widest ${
                activeFilter === 'topic' ? 'text-primary-500 border-primary-500' : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              By Topic
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
            <HelpCircle size={12} />
            Updated Daily
          </div>
        </div>

        {/* Sub-Selectors */}
        {(activeFilter === 'tool' || activeFilter === 'topic') && (
          <div className="px-6 py-4 bg-muted/20 border-b border-border flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Filter By:</span>
            <div className="flex flex-wrap gap-2">
              {activeFilter === 'tool' ? (
                Object.values(Engine).map(e => (
                  <button
                    key={e}
                    onClick={() => setSelectedTool(e)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                      selectedTool === e 
                        ? 'bg-card border-border text-foreground shadow-sm' 
                        : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ENGINE_METADATA[e].color }} />
                      {ENGINE_METADATA[e].name}
                    </div>
                  </button>
                ))
              ) : (
                topics.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                      selectedTopic === t 
                        ? 'bg-primary-500/10 border-primary-500/30 text-primary-500' 
                        : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {t}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="divide-y divide-border">
          {leaders.map((item, index) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-muted transition-colors group">
              <div className="flex items-center gap-8">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border border-border shadow-inner ${
                  index === 0 ? 'bg-amber-500/10 text-amber-500' :
                  index === 1 ? 'bg-muted text-muted-foreground' :
                  'bg-muted text-muted-foreground/50'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className={`text-base font-black ${item.id === 'you' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.name}
                    {index === 0 && <span className="ml-3 text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-500/20">Leader</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.status === 'Rising Fast' ? <TrendingUp size={12} className="text-emerald-500" /> : item.status === 'Falling' ? <TrendingDown size={12} className="text-rose-500" /> : null}
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{item.status}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-10">
                 <div className="text-right">
                    <div className="text-3xl font-black tracking-tighter text-foreground">
                      {item.score}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      {activeFilter === 'total' ? 'Awareness' : activeFilter === 'tool' ? 'Visibility' : 'Relevance'}
                    </div>
                 </div>
                 <div className="w-40 bg-muted h-2.5 rounded-full overflow-hidden shadow-inner hidden sm:block border border-border">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-primary-500 shadow-glow' : 'bg-muted-foreground/30'}`} 
                      style={{ width: `${item.score}%` }} 
                    />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-muted/50 border border-border rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 border border-primary-500/10">
          <TrendingUp size={20} />
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          <strong className="text-foreground">Pro Tip:</strong> 
          {activeFilter === 'total' && " You are currently #1 in your workspace. Keep building high-quality citations to stay ahead."}
          {activeFilter === 'tool' && ` You are performing best on ${ENGINE_METADATA[selectedTool].name}. Analyze your rivals' citations to improve elsewhere.`}
          {activeFilter === 'topic' && ` Your presence in ${selectedTopic} is strong, but rival brands are appearing more often in detailed long-form answers.`}
        </p>
      </div>
    </div>
  );
};

export default Rankings;
