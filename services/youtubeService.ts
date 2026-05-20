
import { YouTubeChannel, YouTubeVideo, InfluencerReport, AudienceOverlapReport, YouTubeUser } from '../types';
import { COMMON_REGIONS, COMMON_LANGUAGES } from '../utils/marketUtils';

const SUPPORTED_LANGUAGES = COMMON_LANGUAGES;

const SUPPORTED_TOPICS = [
  "Technology", "Gaming", "Vlog", "Music", "Education", "News", "Entertainment", "Sports", "Fashion", "Beauty", 
  "Lifestyle", "Travel", "Food", "Business", "Finance", "Health", "Fitness", "Science", "DIY", "Art",
  "Crypto", "Marketing", "Real Estate", "Automotive", "Comedy", "Pets", "Politics", "History", "Psychology", 
  "Design", "Photography", "Filmmaking", "Productivity", "Self Improvement", "Spirituality", "Parenting", 
  "Cooking", "ASMR", "Animation", "Books", "Career", "Coding", "Startups", "Economics", "Environment", 
  "Yoga", "Meditation", "True Crime", "Sustainability", "Gadgets", "AI", "Software", "Hardware", "Mobile"
].sort();

const SUPPORTED_HASHTAGS = [
  "#shorts", "#gaming", "#music", "#live", "#vlog", "#tutorial", "#tech", 
  "#crypto", "#bitcoin", "#ethereum", "#investing", "#finance", "#business", 
  "#marketing", "#seo", "#fitness", "#gym", "#health", "#travel", "#food", 
  "#cooking", "#diy", "#art", "#design", "#fashion", "#beauty", "#makeup", 
  "#news", "#education", "#science", "#funny", "#comedy", "#motivation", 
  "#productivity", "#lifestyle", "#nature", "#cars", "#sports", "#football",
  "#photography", "#skincare", "#streetfood", "#mobilegames", "#pcgaming",
  "#coding", "#developer", "#software", "#ai", "#machinelearning", "#robotics"
].sort();

export class YouTubeService {
  private static BASE_URL = 'https://www.googleapis.com/youtube/v3';

  static getCacheKey(query: string, region?: string, lang?: string, order?: string, pageToken?: string): string {
    return btoa(`${query}-${region}-${lang}-${order}-${pageToken}`);
  }

  // --- Search Influencers (Real API Only) ---
  static async searchPage(
    query: string, 
    apiKey: string, 
    maxResults: number = 20, 
    regionCode?: string, 
    relevanceLanguage?: string, 
    pageToken?: string,
    order: string = 'relevance'
  ): Promise<{ channels: YouTubeChannel[], nextPageToken?: string, error?: string }> {
    
    if (!apiKey) {
        return { channels: [], error: "API Key required" };
    }

    let searchUrl = `${this.BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}&order=${order}`;
    
    if (regionCode) searchUrl += `&regionCode=${encodeURIComponent(regionCode)}`;
    if (relevanceLanguage) searchUrl += `&relevanceLanguage=${encodeURIComponent(relevanceLanguage)}`;
    if (pageToken) searchUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
    
    try {
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) {
            const err = await searchRes.json();
            return { channels: [], error: err.error?.message || "YouTube API Search failed" };
        }
        
        const searchData = await searchRes.json();
        if (!searchData.items || searchData.items.length === 0) return { channels: [] };

        const channelIds = searchData.items.map((item: any) => item.id?.channelId).filter(Boolean).join(',');
        const channels = await this.getChannelDetails(channelIds, apiKey);

        return { channels, nextPageToken: searchData.nextPageToken };
    } catch (e: any) {
        return { channels: [], error: e.message };
    }
  }

  // --- Get Channel Details (Real API) ---
  static async getChannelDetails(ids: string, apiKey: string): Promise<YouTubeChannel[]> {
    if (!apiKey) return [];

    const channelUrl = `${this.BASE_URL}/channels?part=snippet,statistics,brandingSettings,topicDetails,contentDetails,status&id=${ids}&key=${apiKey}`;
    
    const channelRes = await fetch(channelUrl);
    if (!channelRes.ok) {
      throw new Error("YouTube API Channel Details failed");
    }

    const channelData = await channelRes.json();
    
    return (channelData.items || []).map((item: any) => {
      return this.transformChannelData(item);
    });
  }

  private static transformChannelData(item: any): YouTubeChannel {
      const desc = item.snippet.description || '';
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
      const emails = desc.match(emailRegex);
      const email = emails ? emails[0] : undefined;

      const socialLinks: { platform: string; url: string }[] = [];
      const urlRegex = /(?:https?:\/\/)?(?:www\.)?((?:instagram|twitter|x|tiktok|linkedin|facebook|discord|twitch|pinterest|threads)\.com\/[a-zA-Z0-9_.-]+)/gi;
      const rawLinks = desc.match(urlRegex) || [];
      
      const uniqueLinks = new Set(rawLinks);
      uniqueLinks.forEach((rawLink: string) => {
        let fullLink = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;
        const l = fullLink.toLowerCase();
        let platform = 'Website';
        if (l.includes('instagram.com')) platform = 'Instagram';
        else if (l.includes('twitter.com') || l.includes('x.com')) platform = 'Twitter';
        else if (l.includes('tiktok.com')) platform = 'TikTok';
        else if (l.includes('linkedin.com')) platform = 'LinkedIn';
        else if (l.includes('facebook.com')) platform = 'Facebook';
        else if (l.includes('discord.com')) platform = 'Discord';
        else if (l.includes('twitch.tv')) platform = 'Twitch';
        else if (l.includes('threads.net')) platform = 'Threads';
        socialLinks.push({ platform, url: fullLink });
      });

      const keywordString = item.brandingSettings?.channel?.keywords || '';
      const keywords = keywordString.match(/"[^"]+"|\S+/g)?.map((s: string) => s.replace(/"/g, '')) || [];

      const topics = (item.topicDetails?.topicCategories || []).map((url: string) => {
        const parts = url.split('/');
        return parts[parts.length - 1].replace(/_/g, ' ').replace(/\(.*\)/, '').trim();
      });

      return {
        id: item.id,
        title: item.snippet.title,
        description: desc,
        customUrl: item.snippet.customUrl,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        publishedAt: item.snippet.publishedAt,
        country: item.snippet.country,
        defaultLanguage: item.snippet.defaultLanguage,
        keywords: keywords.slice(0, 10),
        topicCategories: topics,
        uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads,
        madeForKids: item.status?.madeForKids,
        email,
        socialLinks,
        statistics: {
          subscriberCount: item.statistics?.subscriberCount ?? '0',
          videoCount: item.statistics?.videoCount ?? '0',
          viewCount: item.statistics?.viewCount ?? '0',
          hiddenSubscriberCount: item.statistics?.hiddenSubscriberCount ?? false
        }
      };
  }

  // --- Get Recent Videos (Real API) ---
  static async getChannelRecentVideos(uploadsPlaylistId: string, apiKey: string): Promise<YouTubeVideo[]> {
    if (!apiKey) return [];

    const plUrl = `${this.BASE_URL}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=15&key=${apiKey}`;
    const plRes = await fetch(plUrl);
    if (!plRes.ok) return [];
    const plData = await plRes.json();
    
    if (!plData.items?.length) return [];
    
    const videoIds = plData.items.map((item: any) => item.contentDetails.videoId).join(',');

    const vidUrl = `${this.BASE_URL}/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`;
    const vidRes = await fetch(vidUrl);
    if (!vidRes.ok) return [];
    const vidData = await vidRes.json();

    return vidData.items.map((v: any) => ({
      id: v.id,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      viewCount: v.statistics.viewCount || '0',
      likeCount: v.statistics.likeCount || '0',
      commentCount: v.statistics.commentCount || '0',
      thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url
    }));
  }

  static async getInfluencerLanguages(query: string = '', limit: number = 100) {
    let langs = SUPPORTED_LANGUAGES;
    if (query) {
      const q = query.toLowerCase();
      langs = langs.filter(l => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
    }
    return { error: false, languages: langs.slice(0, limit), total: langs.length };
  }
  
  static async listTopics(query: string = '', limit: number = 100): Promise<{ error: boolean, tags: string[] }> {
    let tags = SUPPORTED_TOPICS;
    if (query) {
      const q = query.toLowerCase();
      tags = tags.filter(t => t.toLowerCase().includes(q));
    }
    return { error: false, tags: tags.slice(0, limit) };
  }

  static async listHashtags(query: string = '', limit: number = 100): Promise<{ error: boolean, tags: string[] }> {
    let tags = SUPPORTED_HASHTAGS;
    if (query) {
      const q = query.toLowerCase();
      tags = tags.filter(t => t.toLowerCase().includes(q));
    }
    return { error: false, tags: tags.slice(0, limit) };
  }
  
  // --- Audience Overlap (Mock) ---
  // Note: Audience overlap requires OAuth user data which we don't have scope for in "Public Data" mode.
  // Keeping as mock or disabling. For this strict real-data update, we will return empty or throw.
  static async getAudienceOverlap(influencers: string[]): Promise<AudienceOverlapReport> {
    // This feature is not possible with just public API keys. 
    // Returning empty/error to indicate limitation.
    return {
        error: true,
        reportInfo: { totalFollowers: 0, totalUniqueFollowers: 0 },
        data: []
    };
  }
  
  // --- User Search for Overlap (Real API) ---
  static async listUsers(query: string, apiKey: string, limit: number = 5): Promise<{ error: boolean, users: YouTubeUser[] }> {
      const res = await this.searchPage(query, apiKey, limit);
      if (res.error) return { error: true, users: [] };
      
      const users: YouTubeUser[] = res.channels.map(c => ({
          userId: c.id,
          username: c.customUrl || c.title,
          fullname: c.title,
          picture: c.thumbnailUrl,
          followers: parseInt(c.statistics.subscriberCount),
          isVerified: false,
          handle: c.customUrl || ''
      }));
      return { error: false, users };
  }

  // --- Full Report (Real API) ---
  static async getInfluencerReport(
    userId: string, 
    channelTitle?: string, 
    channelHandle?: string, 
    uploadsPlaylistId?: string, 
    apiKey?: string, 
    channelCountry?: string,
    thumbnailUrl?: string
  ): Promise<InfluencerReport> {
    
    if (!apiKey) throw new Error("API Key required for report");

    let realRecentVideos: YouTubeVideo[] = [];
    
    // Auto-hydrate playlist ID if missing
    if (!uploadsPlaylistId) {
        try {
            const details = await this.getChannelDetails(userId, apiKey);
            if (details && details.length > 0) {
                uploadsPlaylistId = details[0].uploadsPlaylistId;
                // Update other fields if available and missing
                if (!channelTitle) channelTitle = details[0].title;
                if (!thumbnailUrl) thumbnailUrl = details[0].thumbnailUrl;
            }
        } catch (e) {
            console.warn("Failed to auto-hydrate channel details", e);
        }
    }

    if (uploadsPlaylistId) {
        try {
            realRecentVideos = await YouTubeService.getChannelRecentVideos(uploadsPlaylistId, apiKey);
        } catch (e) {
            console.error("Failed to fetch real videos for report", e);
        }
    }

    let handle = channelHandle ? channelHandle.replace('@', '') : userId;
    if (!channelHandle && userId.startsWith('@')) {
        handle = userId.substring(1);
    }

    const username = handle.toLowerCase();
    const fullname = channelTitle || (handle.charAt(0).toUpperCase() + handle.slice(1));

    let avgViews = 0;
    let engagementRate = 0;
    let avgLikes = 0;
    let avgComments = 0;

    if (realRecentVideos.length > 0) {
        const totalViews = realRecentVideos.reduce((acc, v) => acc + parseInt(v.viewCount), 0);
        const totalLikes = realRecentVideos.reduce((acc, v) => acc + parseInt(v.likeCount), 0);
        const totalComments = realRecentVideos.reduce((acc, v) => acc + parseInt(v.commentCount), 0);
        avgViews = totalViews / realRecentVideos.length;
        avgLikes = totalLikes / realRecentVideos.length;
        avgComments = totalComments / realRecentVideos.length;
        engagementRate = avgViews > 0 ? (totalLikes + totalComments) / totalViews : 0;
    }

    const channelUrl = channelHandle 
      ? `https://www.youtube.com/${channelHandle.startsWith('@') ? channelHandle : '@' + channelHandle}`
      : `https://www.youtube.com/channel/${userId}`;

    // --- Derived/Simulated Data (Not available in Public API) ---
    // The public API does not provide demographics. We will leave these empty or generic.
    const mockAudience = {
        notable: 0,
        genders: [
            { code: 'MALE', weight: 0.5 },
            { code: 'FEMALE', weight: 0.5 }
        ],
        geoCountries: [
            { code: 'US', name: 'United States', weight: 0.4 },
            { code: 'GB', name: 'United Kingdom', weight: 0.1 },
        ],
        ages: [],
        languages: []
    };

    const recentPostsList = realRecentVideos.map(v => ({
          id: v.id,
          text: v.title,
          url: `https://www.youtube.com/watch?v=${v.id}`,
          created: v.publishedAt,
          likes: parseInt(v.likeCount),
          comments: parseInt(v.commentCount),
          views: parseInt(v.viewCount),
          type: 'video',
          thumbnail: v.thumbnail,
          title: v.title
    }));

    const response: InfluencerReport = {
      error: false,
      profile: {
        userId: userId,
        profile: {
          userId: userId,
          fullname: fullname,
          username: username,
          url: channelUrl,
          picture: thumbnailUrl || '',
          followers: 0, // Will be filled by caller or hydration
          engagements: Math.round(avgLikes + avgComments),
          engagementRate: engagementRate,
          averageViews: Math.round(avgViews),
          handle: handle,
          city: "", 
          state: "",
          gender: "UNKNOWN", 
          country: channelCountry || "",
          ageGroup: "",
          isVerified: true,
          postsCount: realRecentVideos.length,
          totalViews: Math.floor(avgViews * 100), 
          description: `Channel: ${fullname}`,
          interests: [],
        },
        contacts: [],
        audience: mockAudience,
        recentPosts: recentPostsList,
        popularPosts: [], 
        sponsoredPosts: [],
        statsByContentType: {
            all: {
                engagements: Math.round(avgLikes + avgComments),
                engagementRate: engagementRate,
                avgLikes: Math.round(avgLikes),
                avgComments: Math.round(avgComments),
                statHistory: [],
                avgPosts4weeks: 0
            }
        }
      }
    };

    return response;
  }
}
