
import React, { useState, useEffect } from 'react';
import { X, Users, RefreshCw, AlertCircle, TrendingUp, Search, Plus } from 'lucide-react';
import { YouTubeChannel, AudienceOverlapReport, YouTubeUser } from '../types';
import { YouTubeService } from '../services/youtubeService';
import { useWorkspace } from '../context/WorkspaceContext';
import InfoTooltip from './InfoTooltip';

interface AudienceOverlapModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: YouTubeChannel[];
}

const AudienceOverlapModal: React.FC<AudienceOverlapModalProps> = ({ isOpen, onClose, channels }) => {
  const { integrationSettings } = useWorkspace();
  const apiKey = integrationSettings.youtube?.apiKey || '';

  const [activeChannels, setActiveChannels] = useState<YouTubeUser[]>([]);
  const [report, setReport] = useState<AudienceOverlapReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize active channels from props
  useEffect(() => {
    if (isOpen) {
      const initialUsers: YouTubeUser[] = channels.map(c => ({
        userId: c.id,
        username: c.customUrl || '',
        fullname: c.title,
        picture: c.thumbnailUrl,
        followers: parseInt(c.statistics.subscriberCount),
        isVerified: false, // Default
        handle: c.customUrl || ''
      }));
      setActiveChannels(initialUsers);
    }
  }, [isOpen, channels]);

  // Load report when active channels change
  useEffect(() => {
    if (isOpen && activeChannels.length > 1) {
      loadReport();
    } else {
      setReport(null);
      setIsLoading(false);
    }
  }, [activeChannels]);

  // Handle Search Input
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await YouTubeService.listUsers(searchQuery, apiKey, 5);
          setSearchResults(res.users);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, apiKey]);

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await YouTubeService.getAudienceOverlap(activeChannels.map(c => c.userId));
      if (result.error) {
        setError('Failed to generate report');
      } else {
        // Hydrate username with local channel titles
        const hydratedData = result.data.map(d => {
            const realChannel = activeChannels.find(c => c.userId === d.userId);
            return {
                ...d,
                username: realChannel ? realChannel.fullname : d.username
            };
        });
        setReport({ ...result, data: hydratedData });
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const addChannel = (user: YouTubeUser) => {
    if (!activeChannels.some(c => c.userId === user.userId)) {
      setActiveChannels(prev => [...prev, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeChannel = (userId: string) => {
    setActiveChannels(prev => prev.filter(c => c.userId !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-card border border-border w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-inner">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Audience Overlap</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Cross-Channel Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Channel Selector / Search */}
          <div className="mb-8 space-y-4">
             <div className="flex flex-wrap gap-2">
                {activeChannels.map(user => (
                  <div key={user.userId} className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl shadow-sm animate-in zoom-in duration-200">
                     <img src={user.picture} className="w-5 h-5 rounded-full" />
                     <span className="text-xs font-bold text-foreground">{user.fullname}</span>
                     <button onClick={() => removeChannel(user.userId)} className="text-muted-foreground hover:text-rose-500 transition-colors ml-1">
                        <X size={12} />
                     </button>
                  </div>
                ))}
             </div>

             <div className="relative z-20">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input 
                  className="w-full bg-muted/30 border border-border rounded-xl pl-9 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-primary-500 transition-all placeholder:text-muted-foreground/50"
                  placeholder="Search to add another influencer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                     {searchResults.map(user => (
                       <button 
                         key={user.userId}
                         onClick={() => addChannel(user)}
                         className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                       >
                          <img src={user.picture} className="w-8 h-8 rounded-full border border-border" />
                          <div className="flex-1 min-w-0">
                             <div className="text-xs font-bold text-foreground truncate">{user.fullname}</div>
                             <div className="text-[10px] text-muted-foreground">{user.followers.toLocaleString()} followers</div>
                          </div>
                          <Plus size={14} className="text-primary-500" />
                       </button>
                     ))}
                  </div>
                )}
             </div>
          </div>

          {activeChannels.length < 2 ? (
             <div className="flex flex-col items-center justify-center h-48 text-center opacity-50 border-2 border-dashed border-border rounded-2xl">
                <Users size={32} className="mb-2 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground">Select at least 2 channels to compare</p>
             </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <RefreshCw size={32} className="animate-spin text-primary-500" />
              <p className="text-xs font-bold text-muted-foreground animate-pulse">Calculating shared audiences...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <AlertCircle size={32} className="text-rose-500" />
              <p className="text-sm font-bold text-foreground">{error}</p>
              <button onClick={loadReport} className="text-xs font-black text-primary-500 hover:underline">Retry</button>
            </div>
          ) : report ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-primary-500/5 border border-primary-500/20 rounded-2xl text-center">
                  <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Total Unique Reach</div>
                  <div className="text-4xl font-black text-foreground tracking-tighter">
                    {report.reportInfo.totalUniqueFollowers.toLocaleString()}
                  </div>
                  <div className="text-[9px] font-bold text-muted-foreground mt-2">
                    Potential Audience Size
                  </div>
                </div>
                <div className="p-6 bg-muted/30 border border-border rounded-2xl text-center">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Overlap Efficiency</div>
                  <div className="text-4xl font-black text-foreground tracking-tighter">
                    {((1 - (report.reportInfo.totalUniqueFollowers / report.reportInfo.totalFollowers)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[9px] font-bold text-muted-foreground mt-2">
                    Shared Audience Rate
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp size={14} className="text-primary-500" /> Channel Breakdown
                </h4>
                {report.data.map(item => (
                  <div key={item.userId} className="p-4 bg-card border border-border rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm text-foreground">{item.username}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {item.followers.toLocaleString()} Followers
                      </span>
                    </div>
                    
                    {/* Bar Chart */}
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                      <InfoTooltip 
                        content={`Unique: ${(item.uniquePercentage * 100).toFixed(1)}%`}
                        className="h-full bg-indigo-500"
                        style={{ width: `${item.uniquePercentage * 100}%` }}
                      >
                        <div className="w-full h-full" />
                      </InfoTooltip>
                      <InfoTooltip 
                        content={`Overlap: ${(item.overlappingPercentage * 100).toFixed(1)}%`}
                        className="h-full bg-amber-400"
                        style={{ width: `${item.overlappingPercentage * 100}%` }}
                      >
                        <div className="w-full h-full" />
                      </InfoTooltip>
                    </div>
                    
                    <div className="flex justify-between mt-2 text-[9px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        Unique: {(item.uniquePercentage * 100).toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        Overlap: {(item.overlappingPercentage * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : null}
        </div>

        <div className="p-6 border-t border-border bg-muted/30 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-muted hover:bg-border text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-border"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};

export default AudienceOverlapModal;
