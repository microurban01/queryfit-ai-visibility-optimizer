
import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Clock, 
  Trash2,
  ChevronRight,
  Settings
} from 'lucide-react';
import CustomizeAlertRulesModal from '../components/CustomizeAlertRulesModal';
import { useWorkspace } from '../context/WorkspaceContext';
import InfoTooltip from '../components/InfoTooltip';

const Alerts: React.FC = () => {
  const { actions } = useWorkspace();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState(5);
  
  // Notification Toggle State
  const [instantReports, setInstantReports] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const alerts = [
    {
      id: '1',
      type: 'critical',
      title: 'Visibility Drop Detected',
      description: 'Your brand mention rate on Gemini for the query "Best CRM for small marketing agencies" dropped by 15% in the last 24 hours.',
      time: '2 hours ago',
      icon: <TrendingDown size={18} />,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    {
      id: '2',
      type: 'warning',
      title: 'New Competitor Threat',
      description: 'LogicStream was cited on a new high-authority domain (techcrunch.com) for multiple core tracking queries.',
      time: '5 hours ago',
      icon: <ShieldAlert size={18} />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      id: '3',
      type: 'info',
      title: 'Scheduled Scan Completed',
      description: 'Your weekly workspace scan is complete. Overall AI Awareness score is up by 2 points.',
      time: '1 day ago',
      icon: <CheckCircle2 size={18} />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      id: '4',
      type: 'info',
      title: 'New Suggested Question',
      description: 'Our AI found a high-volume question your customers are asking: "How to integrate TechFlow with Slack?"',
      time: '2 days ago',
      icon: <Info size={18} />,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    }
  ];

  const handleSaveRules = (rules: any) => {
    setCurrentThreshold(rules.visibilityDrop);
    actions.showToast({
      title: 'Preferences Updated',
      message: 'Your notification triggers have been successfully recalibrated.',
      type: 'success'
    });
  };

  const toggleInstantReports = () => {
    const newValue = !instantReports;
    setInstantReports(newValue);
    actions.showToast({
      title: newValue ? 'Instant Alerts Enabled' : 'Instant Alerts Disabled',
      message: newValue ? 'You will now receive real-time notifications.' : 'Real-time notifications are now paused.',
      type: newValue ? 'success' : 'info'
    });
  };

  const toggleDailyDigest = () => {
    const newValue = !dailyDigest;
    setDailyDigest(newValue);
    actions.showToast({
      title: newValue ? 'Daily Digest Enabled' : 'Daily Digest Disabled',
      message: newValue ? 'A summary will be sent to your inbox every 24 hours.' : 'Daily summary emails are now paused.',
      type: newValue ? 'success' : 'info'
    });
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <Bell size={24} className="text-primary-400" />
            Alert Center
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Real-time notifications about your AI visibility and competitor moves.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-muted hover:bg-border px-4 py-2 rounded-lg text-sm font-bold text-foreground border border-border transition-colors">
            <Trash2 size={16} />
            Clear All
          </button>
          <button 
            onClick={() => setIsRulesModalOpen(true)}
            className="flex items-center gap-2 bg-muted hover:bg-border px-4 py-2 rounded-lg text-sm font-bold text-foreground border border-border transition-colors"
          >
            <Settings size={16} />
            Alert Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-5 rounded-2xl border ${alert.bg} ${alert.border} group hover:bg-card hover:shadow-soft transition-all cursor-pointer`}
            >
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl bg-card border border-border h-fit shadow-sm ${alert.color}`}>
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-foreground">{alert.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      <Clock size={12} />
                      {alert.time}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-4">
                    {alert.description}
                  </p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-card hover:bg-muted border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-foreground transition-colors shadow-sm">
                      Investigate
                    </button>
                    <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
                <div className="self-center">
                  <ChevronRight size={20} className="text-muted-foreground/30 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground/30 mb-6">
                <Bell size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">You're all caught up!</h3>
              <p className="text-sm text-muted-foreground max-w-xs font-medium">No new alerts or visibility changes detected in the last 48 hours.</p>
            </div>
          )}
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              Thresholds
              <InfoTooltip content="Set how sensitive the AI should be. A higher threshold means you only get alerted for major visibility changes, while a lower one alerts you to every small movement." />
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Sensitivity</span>
                  <span className="text-primary-500 font-black">Normal</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border shadow-inner">
                  <div className="bg-primary-500 h-full w-2/3 shadow-glow" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                We'll notify you when visibility scores for high-priority questions drop by more than <span className="text-foreground font-black">{currentThreshold}%</span>.
              </p>
              <button 
                onClick={() => setIsRulesModalOpen(true)}
                className="w-full py-2.5 bg-muted hover:bg-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border transition-all"
              >
                Customize Rules
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center">
              Email Alerts
              <InfoTooltip content="Choose your update speed. Instant Reports send emails as soon as the AI detects a change. Daily Digest sends one summary email at the end of each day." />
            </h3>
            <div className="space-y-3">
              <button 
                onClick={toggleInstantReports}
                className="w-full flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl shadow-sm hover:border-primary-500/30 transition-all text-left"
              >
                <span className={`text-xs font-black uppercase tracking-tighter ${instantReports ? 'text-foreground' : 'text-muted-foreground'}`}>Instant Reports</span>
                <div className={`w-8 h-4 rounded-full relative shadow-inner transition-all ${instantReports ? 'bg-primary-600' : 'bg-muted border border-border'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${instantReports ? 'right-0.5' : 'left-0.5 bg-muted-foreground/30'}`} />
                </div>
              </button>
              
              <button 
                onClick={toggleDailyDigest}
                className="w-full flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl shadow-sm hover:border-primary-500/30 transition-all text-left"
              >
                <span className={`text-xs font-black uppercase tracking-tighter ${dailyDigest ? 'text-foreground' : 'text-muted-foreground'}`}>Daily Digest</span>
                <div className={`w-8 h-4 rounded-full relative shadow-inner transition-all ${dailyDigest ? 'bg-primary-600' : 'bg-muted border border-border'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${dailyDigest ? 'right-0.5' : 'left-0.5 bg-muted-foreground/30'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CustomizeAlertRulesModal 
        isOpen={isRulesModalOpen} 
        onClose={() => setIsRulesModalOpen(false)} 
        onSave={handleSaveRules} 
      />
    </div>
  );
};

export default Alerts;
