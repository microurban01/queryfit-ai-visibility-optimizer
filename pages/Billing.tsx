
import React, { useState } from 'react';
import { 
  Check, 
  CreditCard, 
  Star, 
  Coins, 
  ArrowUpRight, 
  Plus, 
  History, 
  AlertCircle,
  HelpCircle,
  Zap,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { PlanTier } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import InfoTooltip from '../components/InfoTooltip';
import PurchaseConfirmationModal from '../components/PurchaseConfirmationModal';
import PlanUpgradeConfirmationModal from '../components/PlanUpgradeConfirmationModal';

const Billing: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<PlanTier | null>(null);
  
  // Modal states
  const [selectedPack, setSelectedPack] = useState<{ amount: number; price: number; label: string } | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<any | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  if (!workspace) return null;

  const handleRefillClick = (amount: number, price: number, label: string) => {
    setSelectedPack({ amount, price, label });
    setIsPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPack) return;
    
    setLoadingAmount(selectedPack.amount);
    setIsPurchaseModalOpen(false);
    
    try {
      await actions.topUpCredits(selectedPack.amount);
      actions.showToast({
        title: 'Credits Refilled',
        message: `Successfully added ${selectedPack.amount.toLocaleString()} credits to your balance.`,
        type: 'success'
      });
    } catch (error) {
      actions.showToast({
        title: 'Transaction Failed',
        message: 'Could not process your payment. Please check your card.',
        type: 'error'
      });
    } finally {
      setLoadingAmount(null);
      setSelectedPack(null);
    }
  };

  const handleUpgradeClick = (plan: any) => {
    setSelectedPlanToUpgrade(plan);
    setIsPlanModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanToUpgrade) return;

    setIsUpgrading(selectedPlanToUpgrade.tier);
    setIsPlanModalOpen(false);
    
    try {
      await actions.updatePlanTier(selectedPlanToUpgrade.tier);
      actions.showToast({
        title: 'Plan Updated',
        message: `Your workspace is now on the ${selectedPlanToUpgrade.tier} tier. New limits applied.`,
        type: 'success'
      });
    } catch (error) {
      actions.showToast({
        title: 'Upgrade Failed',
        message: 'We could not update your plan. Please try again.',
        type: 'error'
      });
    } finally {
      setIsUpgrading(null);
      setSelectedPlanToUpgrade(null);
    }
  };

  const plans = [
    {
      tier: PlanTier.STARTER,
      price: 99,
      credits: '2,500',
      features: ['50 tracked queries', '3 competitors', 'Weekly scans', '2 engines enabled'],
      current: workspace.plan_tier === PlanTier.STARTER
    },
    {
      tier: PlanTier.PRO,
      price: 249,
      credits: '10,000',
      features: ['200 tracked queries', '10 competitors', 'Daily scans', 'All engines enabled', '5 team seats'],
      current: workspace.plan_tier === PlanTier.PRO
    },
    {
      tier: PlanTier.AGENCY,
      price: 499,
      credits: '25,000',
      features: ['500+ tracked queries', 'Unlimited competitors', 'Real-time scans', 'White-labeling', 'BYOAK Mode'],
      current: workspace.plan_tier === PlanTier.AGENCY
    }
  ];

  const packs = [
    { amount: 1000, price: 49, label: 'Starter Pack' },
    { amount: 5000, price: 149, label: 'Growth Pack', popular: true },
    { amount: 15000, price: 349, label: 'Scale Pack' },
  ];

  const getTierRank = (tier: PlanTier) => {
    const ranks = { [PlanTier.STARTER]: 0, [PlanTier.PRO]: 1, [PlanTier.AGENCY]: 2 };
    return ranks[tier];
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <CreditCard size={24} className="text-primary-500" />
            Plan & Consumption
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Manage your subscription and credit allocation.</p>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground bg-card border border-border px-4 py-2 rounded-xl shadow-sm font-bold text-xs">
          <CreditCard size={18} />
          <span>Card ending in 4242</span>
        </div>
      </div>

      <div className="bg-card border border-primary-500/30 rounded-3xl p-10 relative overflow-hidden shadow-soft">
        <div className="absolute top-0 right-0 p-32 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-xl text-primary-500">
              <Coins size={40} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center">
                Available Credits
                <InfoTooltip content="Credits are consumed per engine per scan. 1 Scan = 5 Credits." />
              </div>
              <div className="text-6xl font-black tracking-tighter leading-none text-foreground">{workspace.credits_balance.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1 max-md:w-full max-w-md">
             <div className="bg-muted/50 p-4 rounded-2xl border border-border flex flex-col justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center">
                  Engines Covered
                  <InfoTooltip content="Your current plan allows monitoring across all supported LLM engines." />
                </div>
                <div className="text-xl font-black text-foreground">All 5 Tools</div>
             </div>
             
             <div className="bg-muted/50 p-4 rounded-2xl border border-border flex flex-col justify-between group hover:border-primary-500/20 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    Auto-Refill
                    <InfoTooltip content="When credits drop below 500, we automatically refill your wallet to ensure scan continuity." />
                  </div>
                  
                  <button 
                    onClick={() => actions.toggleAutoRefill(!workspace.autoRefill)}
                    className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      workspace.autoRefill ? 'bg-primary-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        workspace.autoRefill ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className={`text-xl font-black ${workspace.autoRefill ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {workspace.autoRefill ? 'Enabled' : 'Paused'}
                </div>
             </div>
          </div>

          <div className="flex flex-col items-end gap-3 max-md:items-start max-md:w-full">
            <button 
              onClick={() => handleRefillClick(1000, 49, 'Quick Refill')}
              disabled={loadingAmount !== null}
              className="w-full bg-primary-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingAmount === 1000 ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              Refill Credits
            </button>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-4 py-1.5 rounded-full border border-border">Renews June 28th</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-1">
             <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Subscription Tiers</h3>
             <div className="flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest">
               <ShieldCheck size={14} /> Global Infra Included
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const currentTierRank = getTierRank(workspace.plan_tier);
              const planTierRank = getTierRank(plan.tier);
              const isDowngrade = planTierRank < currentTierRank;
              
              return (
                <div key={plan.tier} className={`relative p-6 rounded-2xl border transition-all shadow-soft flex flex-col ${
                  plan.current ? 'bg-primary-500/5 border-primary-500/30' : 'bg-card border-border hover:border-primary-500/30'
                }`}>
                  {plan.current && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Current Plan</span>}
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{plan.tier}</div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-foreground tracking-tighter">${plan.price}</span>
                    <span className="text-muted-foreground text-[10px] font-bold">/mo</span>
                  </div>
                  <div className="mb-6 flex items-center gap-2 text-primary-500">
                    <Coins size={14} />
                    <span className="text-xs font-black">{plan.credits} Credits /mo</span>
                  </div>
                  <div className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <Check size={12} className="text-primary-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <button 
                    disabled={plan.current || isUpgrading !== null}
                    onClick={() => handleUpgradeClick(plan)}
                    className={`w-full py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 ${
                      plan.current 
                        ? 'bg-muted text-muted-foreground cursor-default border border-border' 
                        : 'bg-primary-600 hover:bg-primary-500 text-white active:scale-95'
                    }`}
                  >
                    {isUpgrading === plan.tier ? <Loader2 size={14} className="animate-spin" /> : plan.current ? 'Active' : isDowngrade ? 'Downgrade' : 'Upgrade'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Recent Consumption</h3>
                <span className="text-[10px] font-black text-primary-500 hover:underline cursor-pointer uppercase tracking-widest">History</span>
             </div>
             <div className="space-y-4">
                {[
                  { action: 'Daily Scan (52 queries)', date: 'Today, 6:00 AM', cost: -260, type: 'Managed' },
                  { action: 'AI Discovery', date: 'Yesterday', cost: -20, type: 'Managed' },
                  { action: 'Annual Top-up', date: 'June 12', cost: 1000, type: 'Credit Pack' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0 group">
                    <div className="flex items-center gap-4">
                       <div className={`p-2.5 rounded-xl transition-colors ${log.cost < 0 ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {log.cost < 0 ? <Zap size={18} /> : <Plus size={18} />}
                       </div>
                       <div>
                          <div className="text-sm font-bold text-foreground">{log.action}</div>
                          <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{log.date} • {log.type}</div>
                       </div>
                    </div>
                    <div className={`text-sm font-black ${log.cost < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                       {log.cost > 0 ? '+' : ''}{log.cost.toLocaleString()}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <Zap size={14} className="text-primary-500" />
              One-Off Refills
            </h3>
            <div className="space-y-4">
              {packs.map((pack) => (
                <div key={pack.amount} className={`p-5 rounded-2xl border transition-all flex flex-col gap-3 relative group ${
                  pack.popular ? 'border-primary-500 bg-primary-500/5' : 'border-border bg-muted/30 hover:border-primary-500/30'
                }`}>
                  {pack.popular && <span className="absolute -top-2 right-4 bg-primary-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Best Value</span>}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{pack.label}</div>
                      <div className="text-xl font-black text-foreground tracking-tight">{pack.amount.toLocaleString()} Credits</div>
                    </div>
                    <div className="text-xl font-black text-primary-500">${pack.price}</div>
                  </div>
                  <button 
                    disabled={loadingAmount !== null}
                    onClick={() => handleRefillClick(pack.amount, pack.price, pack.label)}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      pack.popular 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 active:scale-95' 
                        : 'bg-card border border-border text-foreground hover:bg-muted active:scale-95'
                    } disabled:opacity-50`}
                  >
                    {loadingAmount === pack.amount ? <Loader2 size={14} className="animate-spin" /> : 'Refill Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/10 border border-border rounded-2xl p-6">
             <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <HelpCircle size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Why Credits?</span>
             </div>
             <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
               QueryFit credits cover access to <strong className="text-foreground">all five major AI engines</strong> through our optimized global infrastructure. No individual API keys or complex technical setups required.
             </p>
          </div>
        </div>
      </div>

      <PurchaseConfirmationModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        pack={selectedPack}
        isProcessing={loadingAmount !== null}
      />

      <PlanUpgradeConfirmationModal 
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onConfirm={handleConfirmUpgrade}
        currentPlan={workspace.plan_tier}
        newPlan={selectedPlanToUpgrade}
        isProcessing={isUpgrading !== null}
      />
    </div>
  );
};

export default Billing;
