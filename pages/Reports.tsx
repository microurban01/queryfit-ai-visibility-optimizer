
import React from 'react';
import { FileText, Download, Mail, Share2 } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FileText size={24} className="text-primary-500" />
            Reports & Export
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Configure automated digests and export your visibility data.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 bg-muted hover:bg-border px-4 py-2 rounded-lg text-sm font-bold text-foreground transition-all border border-border">
            <Download size={16} />
            Export PDF
          </button>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors shadow-lg shadow-primary-500/20">
            <Share2 size={16} />
            Share Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
           <h3 className="font-black text-lg tracking-tight mb-6 flex items-center gap-2 text-foreground">
             <Mail size={18} className="text-primary-500" />
             Email Digests
           </h3>
           <div className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border shadow-sm">
               <div>
                 <div className="text-sm font-bold text-foreground">Weekly Visibility Summary</div>
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Every Monday at 9:00 AM • PDF Attached</p>
               </div>
               <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
               </div>
             </div>
             <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border opacity-50">
               <div>
                 <div className="text-sm font-bold text-foreground">Critical Threat Alerts</div>
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Instant notifications for major index drops</p>
               </div>
               <div className="w-10 h-6 bg-muted rounded-full relative cursor-not-allowed border border-border">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
               </div>
             </div>
           </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground/30 mb-6">
              <FileText size={32} />
            </div>
            <h4 className="font-bold text-foreground mb-2">Agency Tier: White Labeling</h4>
            <p className="text-xs text-muted-foreground max-w-[240px] font-medium leading-relaxed">
              Export PDF reports with your own brand colors and logo. 
              <span className="text-primary-500 font-black cursor-pointer block mt-2">Upgrade to Agency</span>
            </p>
        </div>
      </div>

      <div className="bg-muted/10 border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-black text-lg tracking-tight mb-6 text-foreground">Recent Export History</h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border group hover:border-primary-500/30 transition-colors shadow-soft">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground border border-border shadow-inner">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Monthly_Visibility_Report_May_2024.pdf</div>
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">Generated on May {24 + i}, 2024 • 2.4 MB</div>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary-500 transition-colors">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
