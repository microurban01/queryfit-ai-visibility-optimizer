
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  Code, 
  Eye, 
  Settings,
  Mail,
  Globe,
  LayoutTemplate
} from 'lucide-react';
import { ClarityIntegrationSettings } from '../clarityTypes';
import { ClarityDeepLinks } from '../services/ClarityDeepLinks';

interface ClaritySetupWizardProps {
  onComplete: (settings: ClarityIntegrationSettings) => void;
  initialDomain?: string;
}

const ClaritySetupWizard: React.FC<ClaritySetupWizardProps> = ({ onComplete, initialDomain = '' }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [projectId, setProjectId] = useState('');
  const [domain, setDomain] = useState(initialDomain);
  const [consentMode, setConsentMode] = useState(false);
  
  // Expanded install methods
  const [installMethod, setInstallMethod] = useState<'manual' | 'gtm' | 'platform' | 'email'>('manual');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const snippet = `
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${projectId || 'YOUR_PROJECT_ID'}");
</script>`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailDeveloper = () => {
    const subject = encodeURIComponent(`Setup Microsoft Clarity for ${domain || 'our website'}`);
    const body = encodeURIComponent(`Hi,\n\nPlease install Microsoft Clarity on ${domain || 'our website'} to track user heatmaps.\n\nProject ID: ${projectId}\n\nSnippet:\n${snippet}\n\nThanks.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification delay for UX
    setTimeout(() => {
      onComplete({
        enabled: true,
        projectId,
        websiteDomain: domain,
        consentModeEnabled: consentMode,
        embedPreference: 'embed',
        verifiedAt: new Date().toISOString()
      });
    }, 1200);
  };

  const platforms = [
    { id: 'wordpress', name: 'WordPress', instruction: `Install the official "Microsoft Clarity" plugin. In settings, enter Project ID:`, code: projectId },
    { id: 'shopify', name: 'Shopify', instruction: `Go to Online Store > Preferences > Google Analytics > Add Custom JavaScript. Paste the snippet below.` },
    { id: 'wix', name: 'Wix', instruction: `Go to Settings > Advanced > Custom Code. Add Code to "Head". Paste snippet.` },
    { id: 'squarespace', name: 'Squarespace', instruction: `Go to Settings > Advanced > Code Injection > Header. Paste snippet.` },
    { id: 'webflow', name: 'Webflow', instruction: `Go to Project Settings > Custom Code > Head Code. Paste snippet.` },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-10 px-4">
        {[
          { num: 1, label: 'Create Project' },
          { num: 2, label: 'Install Code' },
          { num: 3, label: 'Verify' }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
              step >= s.num 
                ? 'bg-primary-500 text-white shadow-glow' 
                : 'bg-muted text-muted-foreground border border-border'
            }`}>
              {step > s.num ? <Check size={14} strokeWidth={3} /> : s.num}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              step >= s.num ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {s.label}
            </span>
            {s.num < 3 && <div className="w-12 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-[32px] p-8 shadow-soft">
        {/* Step 1: Create Project */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-500">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Connect Microsoft Clarity</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1 leading-relaxed max-w-md">
                  Clarity is a free heatmap tool. Create a project on their site to get your unique <strong>Project ID</strong>.
                </p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Don't have a project yet?</p>
              <a 
                href={ClarityDeepLinks.getProjectsUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-zinc-100 hover:bg-white text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                Go to Clarity <ExternalLink size={14} />
              </a>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Project ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. jx9s8d7f6g"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value.trim())}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-500 font-mono transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Website Domain</label>
                <input 
                  type="text" 
                  placeholder="e.g. techflow.ai"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.trim())}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!projectId || !domain}
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next Step <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Install Code */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                <Code size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Install Tracking Code</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Choose how you want to add Clarity to your site.
                </p>
              </div>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-4 gap-2 bg-muted p-1 rounded-xl border border-border">
              {[
                { id: 'manual', label: 'Manual', icon: <Code size={14} /> },
                { id: 'platform', label: 'Platform', icon: <LayoutTemplate size={14} /> },
                { id: 'gtm', label: 'GTM', icon: <Globe size={14} /> },
                { id: 'email', label: 'Email Dev', icon: <Mail size={14} /> },
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setInstallMethod(m.id as any)}
                  className={`flex flex-col md:flex-row items-center justify-center gap-2 px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    installMethod === m.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.icon} <span className="hidden md:inline">{m.label}</span>
                </button>
              ))}
            </div>

            {/* CONTENT: Manual */}
            {installMethod === 'manual' && (
              <div className="relative group">
                <div className="mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Copy to &lt;head&gt;</div>
                <pre className="bg-[#0f0f11] border border-white/5 rounded-2xl p-5 text-[10px] text-zinc-400 font-mono overflow-x-auto custom-scrollbar leading-relaxed">
                  {snippet}
                </pre>
                <button 
                  onClick={handleCopy}
                  className="absolute top-10 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-white/5"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}

            {/* CONTENT: Platform */}
            {installMethod === 'platform' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedPlatform === p.id 
                          ? 'bg-primary-500/10 border-primary-500 text-primary-500' 
                          : 'bg-card border-border hover:border-foreground/20 text-muted-foreground'
                      }`}
                    >
                      <span className="text-xs font-bold">{p.name}</span>
                    </button>
                  ))}
                </div>
                
                {selectedPlatform && (
                  <div className="bg-muted/30 border border-border rounded-2xl p-5 animate-in fade-in slide-in-from-top-2">
                    <div className="text-[10px] font-black text-foreground uppercase tracking-widest mb-2">
                      Instructions for {platforms.find(p => p.id === selectedPlatform)?.name}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {platforms.find(p => p.id === selectedPlatform)?.instruction}
                    </p>
                    {platforms.find(p => p.id === selectedPlatform)?.code && (
                      <div className="mt-3 flex items-center gap-2 bg-background border border-border p-2 rounded-lg w-fit">
                        <code className="text-xs font-mono font-bold">{platforms.find(p => p.id === selectedPlatform)?.code}</code>
                        <button onClick={() => { navigator.clipboard.writeText(platforms.find(p => p.id === selectedPlatform)?.code || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-muted-foreground hover:text-primary-500">
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                    {!platforms.find(p => p.id === selectedPlatform)?.code && (
                       <div className="mt-3">
                         <button onClick={handleCopy} className="text-[10px] font-black text-primary-500 hover:underline flex items-center gap-1">
                           Copy Full Snippet <Copy size={10} />
                         </button>
                       </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CONTENT: GTM */}
            {installMethod === 'gtm' && (
              <div className="bg-muted/30 border border-border rounded-2xl p-6 text-sm text-muted-foreground leading-relaxed">
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Open Google Tag Manager.</li>
                  <li>Create a new <strong>Custom HTML</strong> tag.</li>
                  <li>Paste the Clarity snippet provided below.</li>
                  <li>Set the trigger to <strong>All Pages</strong>.</li>
                  <li>Publish your container changes.</li>
                </ol>
                <div className="mt-4 pt-4 border-t border-border">
                   <button onClick={handleCopy} className="w-full py-3 bg-background border border-border rounded-xl text-xs font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2">
                     {copied ? <Check size={14} /> : <Copy size={14} />} Copy Snippet Code
                   </button>
                </div>
              </div>
            )}

            {/* CONTENT: Email */}
            {installMethod === 'email' && (
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-2xl p-6 text-sm">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Email Preview</div>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>Subject:</strong> Setup Microsoft Clarity for {domain || 'our website'}</p>
                    <p>Hi,</p>
                    <p>Please install Microsoft Clarity on {domain || 'our website'} to track user heatmaps.</p>
                    <p>Project ID: <strong>{projectId}</strong></p>
                    <p>[Script Snippet Attached]</p>
                    <p>Thanks.</p>
                  </div>
                </div>
                <button 
                  onClick={handleEmailDeveloper}
                  className="w-full py-4 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Mail size={16} /> Open Email Client
                </button>
              </div>
            )}

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Cookie Consent Mode</span>
                  <button 
                    onClick={() => setConsentMode(!consentMode)}
                    className={`w-8 h-4 rounded-full relative transition-all ${consentMode ? 'bg-primary-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${consentMode ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  If enabled, ensure the script only fires after user consent is granted.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
              >
                Next Step <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verify */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <Eye size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Verify Installation</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  We can't automatically check your site, but you can verify it yourself.
                </p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6">
              <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-4">Verification Checklist</h4>
              <ul className="space-y-4">
                {[
                  `Open ${domain || 'your website'} in a new incognito tab.`,
                  'Right-click and select "Inspect" to open DevTools.',
                  'Go to the "Network" tab and type "collect" in the filter box.',
                  'Refresh the page. You should see a request to "clarity.ms/collect".'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button 
                onClick={() => setStep(2)}
                className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70"
              >
                {isVerifying ? 'Saving...' : 'I see the request — Finish Setup'}
                {!isVerifying && <CheckCircle2 size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaritySetupWizard;
