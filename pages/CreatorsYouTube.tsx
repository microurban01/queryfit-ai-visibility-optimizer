import React, { useState } from 'react';
import { Search, Loader2, Users, Youtube, ExternalLink, ArrowLeft, Mail, Globe, MapPin, Key, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { YouTubeService } from '../services/youtubeService';
import { YouTubeChannel, InfluencerReport } from '../types';

const CreatorsYouTube: React.FC = () => {
  const { integrationSettings, actions } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null);
  const [reportData, setReportData] = useState<InfluencerReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Safe access to API key
  const apiKey = integrationSettings?.youtube?.apiKey;

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      actions.saveYoutubeKey(apiKeyInput.trim());
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await YouTubeService.searchPage(searchQuery, apiKey, 20);
      if (response.error) throw new Error(response.error);
      setChannels(response.channels);
    } catch (error: any) {
      console.error(error);
      actions.showToast({ title: 'Search Failed', message: error.message || 'Could not fetch YouTube channels.', type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateReport = async (channel: YouTubeChannel) => {
    setSelectedChannel(channel);
    setIsGenerating(true);
    setReportData(null);
    try {
      const report = await YouTubeService.getInfluencerReport(
        channel.id, 
        channel.title, 
        channel.customUrl, 
        channel.uploadsPlaylistId, 
        apiKey,
        channel.country,
        channel.thumbnailUrl
      );
      setReportData(report);
    } catch (error) {
      actions.showToast({ title: 'Report Error', message: 'Failed to generate influencer report.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const closeReport = () => {
    setReportData(null);
    setSelectedChannel(null);
  };

  if (!apiKey) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center bg-background/50">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Youtube size={32} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">YouTube Integration Required</h2>
        <p className="text-muted-foreground mt-2 mb-8 max-w-md font-medium leading-relaxed">
            To discover creators and generate analytics reports, you need to connect your YouTube Data API key.
        </p>
        
        <div className="w-full max-w-md space-y-4">
            <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                    type="password" 
                    placeholder="Enter YouTube Data API Key" 
                    className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                />
            </div>
            <button 
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="w-full bg-foreground text-background hover:bg-foreground/90 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
                Save & Connect
            </button>
            <p className="text-[10px] text-muted-foreground mt-4">
                We do not store your keys on our servers. They are saved locally in your workspace configuration.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full pb-20 page-transition bg-background/50 relative">
        {/* Header */}
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Youtube size={24} className="text-red-600" />
                        Creator Discovery
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">Find and analyze YouTube influencers for your brand.</p>
                </div>
                {/* API Key Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">API Active</span>
                </div>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-3xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                    type="text" 
                    placeholder="Search channels (e.g. 'tech reviews', 'marketing tips', 'fitness')..." 
                    className="w-full bg-card border border-border rounded-xl py-4 pl-12 pr-32 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-red-600 hover:bg-red-500 text-white px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
                </button>
            </form>
        </div>

        {/* Results Grid */}
        {!reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {channels.map(channel => (
                    <div key={channel.id} className="bg-card border border-border rounded-2xl p-6 hover:border-red-500/30 transition-all group shadow-sm flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 bg-red-500/[0.02] rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-red-500/[0.05] transition-all pointer-events-none" />
                        
                        <div className="flex items-start gap-4 mb-4 relative z-10">
                            <img src={channel.thumbnailUrl} alt={channel.title} className="w-14 h-14 rounded-full border border-border object-cover shadow-sm" />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground truncate" title={channel.title}>{channel.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        {parseInt(channel.statistics.subscriberCount).toLocaleString()} Subs
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        {parseInt(channel.statistics.videoCount).toLocaleString()} Vids
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-6 flex-1 relative z-10 font-medium leading-relaxed">
                            {channel.description || 'No description available for this channel.'}
                        </p>
                        
                        <button 
                            onClick={() => handleGenerateReport(channel)}
                            className="w-full py-3 bg-muted hover:bg-foreground hover:text-background rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative z-10 group/btn"
                        >
                            {isGenerating && selectedChannel?.id === channel.id ? (
                                <>Generating <Loader2 size={14} className="animate-spin" /></>
                            ) : (
                                <>View Analytics <ArrowLeft size={14} className="rotate-180 group-hover/btn:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                ))}
                
                {channels.length === 0 && !isSearching && (
                    <div className="col-span-full text-center py-24 opacity-40 border-2 border-dashed border-border rounded-[32px]">
                        <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-black text-foreground uppercase tracking-widest">Find Your Next Partner</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-2">Enter keywords above to search the global YouTube database.</p>
                    </div>
                )}
            </div>
        )}

        {/* Report View Overlay */}
        {reportData && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto animate-in fade-in slide-in-from-bottom-10 duration-300">
                <div className="max-w-6xl mx-auto p-8 min-h-full flex flex-col">
                    <button onClick={closeReport} className="self-start mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-black uppercase tracking-widest bg-card border border-border px-4 py-2 rounded-lg hover:border-foreground/20">
                        <ArrowLeft size={16} /> Back to Search
                    </button>

                    <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-2xl relative">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 p-64 bg-red-500/[0.03] rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

                        {/* Header Profile Section */}
                        <div className="p-10 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-10 items-start relative z-10">
                             <img src={reportData.profile.profile.picture} className="w-32 h-32 rounded-[24px] border-2 border-background shadow-xl" />
                             <div className="flex-1 min-w-0">
                                <h2 className="text-4xl font-black text-foreground tracking-tight leading-none mb-2">{reportData.profile.profile.fullname}</h2>
                                <div className="text-sm font-bold text-muted-foreground mb-6 flex items-center gap-2">
                                    @{reportData.profile.profile.username}
                                    {reportData.profile.profile.isVerified && <CheckCircle2 size={16} className="text-blue-500" />}
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    <a 
                                        href={reportData.profile.profile.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                                    >
                                        <Youtube size={14} fill="currentColor" /> Visit Channel
                                    </a>
                                    {reportData.profile.contacts.map((c, i) => (
                                        <div key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm">
                                            <Mail size={14} /> {c.value}
                                        </div>
                                    ))}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm">
                                        <MapPin size={14} /> {reportData.profile.profile.country || 'Global'}
                                    </div>
                                </div>
                             </div>
                             <div className="text-right hidden md:block">
                                <div className="text-5xl font-black text-foreground tracking-tighter">{(reportData.profile.profile.followers / 1000000).toFixed(2)}M</div>
                                <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">Subscribers</div>
                             </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-b border-border bg-card/50">
                            <div className="p-8 text-center group hover:bg-muted/30 transition-colors">
                                <div className="text-3xl font-black text-foreground tracking-tight group-hover:scale-110 transition-transform duration-300">{(reportData.profile.profile.engagementRate * 100).toFixed(2)}%</div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Engagement Rate</div>
                            </div>
                            <div className="p-8 text-center group hover:bg-muted/30 transition-colors">
                                <div className="text-3xl font-black text-foreground tracking-tight group-hover:scale-110 transition-transform duration-300">
                                    {reportData.profile.profile.averageViews > 1000000 
                                        ? `${(reportData.profile.profile.averageViews / 1000000).toFixed(1)}M` 
                                        : `${(reportData.profile.profile.averageViews / 1000).toFixed(0)}K`
                                    }
                                </div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Avg Views</div>
                            </div>
                            <div className="p-8 text-center group hover:bg-muted/30 transition-colors">
                                <div className="text-3xl font-black text-foreground tracking-tight group-hover:scale-110 transition-transform duration-300">
                                    {reportData.profile.profile.totalViews > 1000000000 
                                        ? `${(reportData.profile.profile.totalViews / 1000000000).toFixed(1)}B` 
                                        : `${(reportData.profile.profile.totalViews / 1000000).toFixed(0)}M`
                                    }
                                </div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Total Views</div>
                            </div>
                            <div className="p-8 text-center group hover:bg-muted/30 transition-colors">
                                <div className="text-3xl font-black text-foreground tracking-tight group-hover:scale-110 transition-transform duration-300">{reportData.profile.profile.postsCount.toLocaleString()}</div>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Uploads</div>
                            </div>
                        </div>

                        <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-background/50">
                            {/* Audience Demographics */}
                            <div className="space-y-8">
                                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Users size={16} className="text-primary-500" /> Audience Demographics
                                    </h4>
                                    
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-3">
                                                <span>Gender Distribution</span>
                                            </div>
                                            <div className="flex h-6 w-full rounded-xl overflow-hidden shadow-inner">
                                                {reportData.profile.audience.genders.map((g, i) => (
                                                    <div 
                                                        key={g.code} 
                                                        className={`${i === 0 ? 'bg-blue-500' : 'bg-pink-500'} flex items-center justify-center text-[9px] font-black text-white`} 
                                                        style={{ width: `${g.weight * 100}%` }} 
                                                        title={`${g.code}: ${(g.weight * 100).toFixed(1)}%`}
                                                    >
                                                        {g.code === 'MALE' ? 'M' : 'F'} {(g.weight * 100).toFixed(0)}%
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-3">
                                                <span>Top Countries</span>
                                            </div>
                                            <div className="space-y-3">
                                                {reportData.profile.audience.geoCountries.map(c => (
                                                    <div key={c.code} className="flex items-center gap-4">
                                                        <div className="w-8 h-6 rounded bg-muted border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground">
                                                            {c.code}
                                                        </div>
                                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-foreground rounded-full" style={{ width: `${c.weight * 100}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold w-8 text-right">{(c.weight * 100).toFixed(0)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Content */}
                            <div className="space-y-8">
                                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm h-full">
                                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Globe size={16} className="text-primary-500" /> Recent Videos
                                    </h4>
                                    <div className="space-y-5">
                                        {reportData.profile.recentPosts.map((post: any) => (
                                            <a href={post.url} target="_blank" rel="noopener noreferrer" key={post.id} className="flex gap-5 group items-start">
                                                <div className="w-32 h-20 bg-muted rounded-xl overflow-hidden shrink-0 border border-border shadow-sm">
                                                    <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1 min-w-0 py-1">
                                                    <div className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">{post.title}</div>
                                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1"><ExternalLink size={10} /> {parseInt(post.views).toLocaleString()} views</span>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <span>{new Date(post.created).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CreatorsYouTube;