// 1. Enhanced UTM and Platform Detection Utility
// src/utils/platformTracking.ts

export interface PlatformInfo {
  source: string;
  medium?: string;
  campaign?: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'google' | 'direct' | 'referral' | 'other';
  referrer?: string;
  timestamp: number;
}

export const detectPlatform = (): PlatformInfo => {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  
  // 1. Check for UTM parameters first (most reliable)
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const refParam = urlParams.get('ref'); // Alternative to utm_source
  
  if (utmSource || refParam) {
    const source = utmSource || refParam || 'unknown';
    return {
      source,
      medium: utmMedium || undefined,
      campaign: utmCampaign || undefined,
      platform: mapSourceToPlatform(source),
      referrer,
      timestamp: Date.now()
    };
  }
  
  // 2. Fallback to referrer detection
  if (referrer) {
    const referrerDomain = new URL(referrer).hostname.toLowerCase();
    const platform = mapDomainToPlatform(referrerDomain);
    
    return {
      source: referrerDomain,
      platform,
      referrer,
      timestamp: Date.now()
    };
  }
  
  // 3. Direct traffic
  return {
    source: 'direct',
    platform: 'direct',
    timestamp: Date.now()
  };
};

const mapSourceToPlatform = (source: string): PlatformInfo['platform'] => {
  const sourceMap: Record<string, PlatformInfo['platform']> = {
    'facebook': 'facebook',
    'fb': 'facebook',
    'instagram': 'instagram',
    'ig': 'instagram',
    'twitter': 'twitter',
    'x': 'twitter',
    'linkedin': 'linkedin',
    'tiktok': 'tiktok',
    'youtube': 'youtube',
    'google': 'google',
    'search': 'google'
  };
  
  const normalizedSource = source.toLowerCase();
  return sourceMap[normalizedSource] || 'other';
};

const mapDomainToPlatform = (domain: string): PlatformInfo['platform'] => {
  if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'facebook';
  if (domain.includes('instagram.com')) return 'instagram';
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
  if (domain.includes('linkedin.com')) return 'linkedin';
  if (domain.includes('tiktok.com')) return 'tiktok';
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
  if (domain.includes('google.com') || domain.includes('bing.com')) return 'google';
  
  return 'referral';
};

export const storePlatformInfo = (platformInfo: PlatformInfo): void => {
  try {
    sessionStorage.setItem('user_platform_info', JSON.stringify(platformInfo));
    
    // Also store in localStorage as backup (persists longer)
    //const existingInfo = localStorage.getItem('user_platform_history');
    //const history = existingInfo ? JSON.parse(existingInfo) : [];
    //history.unshift(platformInfo); // Add to beginning
    //localStorage.setItem('user_platform_history', JSON.stringify(history.slice(0, 5))); // Keep last 5
  } catch (error) {
    console.error('Error storing platform info:', error);
  }
};

export const getPlatformInfo = (): PlatformInfo | null => {
  try {
    const stored = sessionStorage.getItem('user_platform_info');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error retrieving platform info:', error);
    return null;
  }
};

export const getPlatformAnalytics = () => {
  try {
    // Use the correct storage key that your app actually uses
    const analyticsData = localStorage.getItem('website_analytics_data');
    const analytics = analyticsData ? JSON.parse(analyticsData) : {
      platformSources: {},
      detailedSources: [],
      dailyTraffic: {}
    };
    
    return {
      platformSources: analytics.platformSources || {},
      detailedSources: analytics.detailedSources || [],
      signupsByPlatform: Object.values(analytics.dailyTraffic || {})
        .reduce((acc: Record<string, number>, day: any) => {
          if (day.signupsByPlatform) {
            Object.entries(day.signupsByPlatform).forEach(([platform, count]) => {
              acc[platform] = (acc[platform] || 0) + (count as number);
            });
          }
          return acc;
        }, {})
    };
  } catch (error) {
    console.error('Error getting platform analytics:', error);
    return {
      platformSources: {},
      detailedSources: [],
      signupsByPlatform: {}
    };
  }
};