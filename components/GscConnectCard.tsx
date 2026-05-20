
import React from 'react';
import { Search, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { GscConnection } from '../gscTypes';

interface GscConnectCardProps {
  connection: GscConnection;
  onDisconnect: () => void;
  onSync: (siteUrl: string) => void;
  isSyncing: boolean;
}

const GscConnectCard: React.FC<GscConnectCardProps> = ({ 
  connection, 
  onDisconnect, 
  onSync,
  isSyncing
}) => {
  return (
    <div className="px-8 py-6 border-b border-border bg-card/30 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <Search size={24} className="text-amber-500" />
            SEO Heatmap
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">
              <CheckCircle2 size={10} /> Connected
            </span>
            <span className="text-xs text-muted-foreground font-medium">Property: {connection.selectedSiteUrl || 'Not Selected'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right mr-2">
           <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last Sync</div>
           <div className="text-xs font-bold text-foreground">
             {connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleTimeString() : 'Never'}
           </div>
        </div>
        <button 
          onClick={() => connection.selectedSiteUrl && onSync(connection.selectedSiteUrl)}
          disabled={isSyncing || !connection.selectedSiteUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        <button 
          onClick={onDisconnect}
          className="p-2.5 hover:bg-card rounded-xl text-muted-foreground hover:text-rose-500 transition-all border border-transparent hover:border-border"
          title="Disconnect"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default GscConnectCard;
