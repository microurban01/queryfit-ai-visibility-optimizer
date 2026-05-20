import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Lightbulb, 
  Plus, 
  Coins, 
  Zap, 
  CheckSquare, 
  Trophy, 
  Activity,
  ChevronRight,
  Flame,
  Lock,
  Sparkles,
  FlaskConical,
  Gauge,
  TrendingUp,
  Link2,
  Youtube,
  Users,
  Globe
} from 'lucide-react';
import { Workspace, PlanTier } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onAddQueryClick: () => void;
  workspace: Workspace;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  count?: number;
  disabled?: boolean;
}> = ({ icon, label, active, onClick, count, disabled }) => (
  <button
    onClick={!disabled ? onClick : undefined}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
      active 
        ? 'bg-primary-500/10 text-primary-400 shadow-sm border border-primary-500/10' 
        : disabled
          ? 'text-muted-foreground/30 cursor-not-allowed'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-1 rounded-lg transition-colors ${active ? 'text-primary-400' : disabled ? 'text-muted-foreground/30' : 'group-hover:text-primary-400'}`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
      </div>
      <span className="tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
          active ? 'bg-primary-500 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {count}
        </span>
      )}
      {disabled && <Lock size={12} className="text-muted-foreground/40" />}
      {active && <ChevronRight size={14} className="text-primary-400/50" />}
    </div>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onAddQueryClick, workspace }) => {
  const { queries, suggestedQueries } = useWorkspace();
  const creditUsagePercent = (workspace.credits_balance / workspace.credits_limit) * 100;
  
  const isAgency = workspace.plan_tier === PlanTier.AGENCY;

  return (
    <div className="w-64 h-screen flex flex-col bg-zinc-50 dark:bg-black border-r border-border shrink-0 z-50 transition-colors">
      <div className="p-8">
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => setActivePage('overview')}
        >
          <div className="w-11 h-11 bg-primary-600/10 rounded-xl flex items-center justify-center border border-primary-500/30 shadow-lg shadow-primary-500/10 transition-transform group-hover:scale-105">
            <Activity size={28} className="text-primary-400" />
          </div>
          <div>
            <span className="text-xl font-black text-foreground tracking-tighter block leading-none">QueryFit</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Intelligence</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-8 no-scrollbar">
        {/* Group 1: Monitoring */}
        <div>
          <div className="px-4 mb-3 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Monitoring</div>
          <div className="space-y-1">
            <NavItem 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
              active={activePage === 'overview'} 
              onClick={() => setActivePage('overview')} 
            />
            <NavItem 
              icon={<Search />} 
              label="Tracked Queries" 
              active={activePage === 'queries'} 
              onClick={() => setActivePage('queries')} 
              count={queries.length}
            />
            <NavItem 
              icon={<Users />} 
              label="Competitors" 
              active={activePage === 'competitor-hub'} 
              onClick={() => setActivePage('competitor-hub')} 
            />
          </div>
        </div>

        {/* Group 2: Action Plan */}
        <div>
          <div className="px-4 mb-3 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Action Plan</div>
          <div className="space-y-1">
            <NavItem 
              icon={<CheckSquare />} 
              label="To-Do List" 
              active={activePage === 'strategy'} 
              onClick={() => setActivePage('strategy')} 
            />
            <NavItem 
              icon={<Sparkles />} 
              label="Easy SEO Wins" 
              active={activePage === 'ai-recs'} 
              onClick={() => setActivePage('ai-recs')} 
            />
            <NavItem 
              icon={<Gauge />} 
              label="Website Speed" 
              active={activePage === 'performance'} 
              onClick={() => setActivePage('performance')} 
            />
            <NavItem 
              icon={<FlaskConical />} 
              label="SEO Tests" 
              active={activePage === 'experiments'} 
              onClick={() => setActivePage('experiments')} 
            />
            <NavItem 
              icon={<Zap />} 
              label="Auto-Scan" 
              active={activePage === 'automation'} 
              onClick={() => setActivePage('automation')} 
            />
          </div>
        </div>

        {/* Group 3: Growth & Traffic */}
        <div>
          <div className="px-4 mb-3 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Growth & Traffic</div>
          <div className="space-y-1">
            <NavItem 
              icon={<Lightbulb />} 
              label="New Topic Ideas" 
              active={activePage === 'suggested'} 
              onClick={() => setActivePage('suggested')} 
              count={suggestedQueries.length}
            />
            <NavItem 
              icon={<Globe className="text-amber-500" />} 
              label="Organic Search" 
              active={activePage === 'seo-heatmap'} 
              onClick={() => setActivePage('seo-heatmap')} 
            />
            <NavItem 
              icon={<Youtube className="text-red-500" />} 
              label="Find Influencers" 
              active={activePage === 'creators-youtube'} 
              onClick={() => setActivePage('creators-youtube')} 
            />
            <NavItem 
              icon={<Flame />} 
              label="User Behavior" 
              active={activePage === 'heatmaps'} 
              onClick={() => setActivePage('heatmaps')} 
              disabled={!isAgency}
            />
          </div>
        </div>

        {/* Group 4: Results & Settings */}
        <div>
          <div className="px-4 mb-3 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Results</div>
          <div className="space-y-1">
            <NavItem 
              icon={<TrendingUp />} 
              label="Traffic Results" 
              active={activePage === 'results'} 
              onClick={() => setActivePage('results')} 
            />
            <NavItem 
              icon={<Link2 />} 
              label="Connections" 
              active={activePage === 'integrations'} 
              onClick={() => setActivePage('integrations')} 
            />
          </div>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coins size={14} className="text-amber-400" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Credits</span>
            </div>
            <button 
              className="text-[10px] font-black text-primary-500 hover:underline uppercase"
              onClick={() => setActivePage('billing')}
            >
              Top Up
            </button>
          </div>
          
          <div className="w-full bg-muted h-1.5 rounded-full mb-3 overflow-hidden border border-border">
            <div 
              className="bg-primary-500 h-full rounded-full transition-all duration-1000 shadow-glow" 
              style={{ width: `${creditUsagePercent}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-black text-foreground">{workspace.credits_balance.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-muted-foreground">/ {workspace.credits_limit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;