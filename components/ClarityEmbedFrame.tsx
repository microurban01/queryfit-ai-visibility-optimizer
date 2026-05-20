
import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { ClarityDeepLinks } from '../services/ClarityDeepLinks';

interface ClarityEmbedFrameProps {
  projectId: string;
  className?: string;
}

const ClarityEmbedFrame: React.FC<ClarityEmbedFrameProps> = ({ projectId, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Use heatmaps URL as primary embed target
  const embedUrl = ClarityDeepLinks.getHeatmapsUrl(projectId);

  useEffect(() => {
    // Reset state when projectId changes
    setLoading(true);
    setError(false);
    
    // Safety timeout - if iframe doesn't load in 8 seconds, suggest fallback
    const timeout = setTimeout(() => {
      setLoading(false);
      // We can't definitively know if it failed due to X-Frame-Options without
      // complex hacks, so we just stop the spinner.
    }, 8000);

    return () => clearTimeout(timeout);
  }, [projectId]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden border border-border flex flex-col ${className}`}>
      {/* Overlay for loading/error states */}
      {(loading || error) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm p-6 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="text-primary-500 animate-spin" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Connecting to Microsoft Clarity...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 max-w-md animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                <AlertCircle size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black text-foreground">Content Blocked</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browser security policies (CSP/X-Frame-Options) prevented Clarity from loading inside this window.
              </p>
              <a 
                href={embedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                Open in Clarity <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Actual Iframe */}
      {!error && (
        <iframe
          src={embedUrl}
          title="Clarity Heatmap Embed"
          className="w-full h-full border-0 bg-white"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      )}
      
      {/* Bottom Bar: Always accessible escape hatch */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button 
          onClick={() => { setLoading(true); setError(false); }}
          className="p-2 bg-zinc-900/80 hover:bg-zinc-900 text-muted-foreground hover:text-white rounded-lg backdrop-blur border border-white/10 transition-all"
          title="Reload Frame"
        >
          <RefreshCw size={16} />
        </button>
        <a 
          href={embedUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-4 py-2 bg-zinc-900/90 hover:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur border border-white/10 flex items-center gap-2 transition-all"
        >
          Open External <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default ClarityEmbedFrame;
