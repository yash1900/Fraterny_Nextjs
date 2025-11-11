/**
 * Unified User Information Utility
 * 
 * This utility provides a centralized way to collect user information on the frontend including:
 * - IP address
 * - Location (country, isIndia, etc.)
 * - Device info (browser, OS, device type)
 * - Device fingerprint (screen, timezone, browser, etc.)
 * 
 * Usage:
 * ```typescript
 * import { getIP, getLocation, getDeviceInfo, getAllUserInfo } from '@/utils/userInfo';
 * 
 * // Get specific info
 * const ip = await getIP();
 * const location = await getLocation();
 * const device = getDeviceInfo();
 * const fingerprint = getDeviceFingerprint();
 * 
 * // Get everything at once
 * const userInfo = await getAllUserInfo();
 * 
 * // Send to tracking API
 * await fetch('/api/tracking/affiliate/click', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     affiliate_code: 'ABC123',
 *     ip_address: userInfo.ip,
 *     device_info: userInfo.deviceInfo,
 *     location: userInfo.location?.country,
 *   }),
 * });
 * ```
 */

// ===========================
// INTERFACES & TYPES
// ===========================

export interface LocationData {
  isIndia: boolean;
  country: string;
  countryCode: string;
  ip: string;
}

export interface DeviceFingerprint {
  screen: string;
  colorDepth: number | string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  touchSupport: string;
  deviceHash: string;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  user_agent: string;
}

export interface CompleteUserInfo {
  ip: string;
  location: LocationData | null;
  deviceInfo: DeviceInfo;
  fingerprint: DeviceFingerprint;
  timestamp: string;
}

// ===========================
// IP ADDRESS DETECTION
// ===========================

/**
 * Get user's IP address from external API
 * @returns Promise<string> - User's IP address or 'unknown'
 */
export async function getIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
}

/**
 * Legacy function name for compatibility
 * @deprecated Use getIP() instead
 */
export const getUserIP = getIP;

// ===========================
// LOCATION DETECTION
// ===========================

let cachedLocation: LocationData | null = null;
let locationLoading = false;

/**
 * Get user's location based on IP address
 * Uses multiple geolocation services as fallback
 * Caches result in memory for subsequent calls
 * 
 * @param forceRefresh - Force fetch fresh data, bypassing cache
 * @returns Promise<LocationData> - Location information
 */
export async function getLocation(forceRefresh: boolean = false): Promise<LocationData> {
  // Return cached data if available and not forcing refresh
  if (cachedLocation && !forceRefresh) {
    return cachedLocation;
  }

  // Wait if already loading
  if (locationLoading) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getLocation(forceRefresh);
  }

  locationLoading = true;

  try {
    const ip = await getIP();
    
    // Try multiple IP geolocation services
    const services = [
      `https://ipapi.co/json/`,
      `https://ip-api.com/json/`,
    ];

    for (const service of services) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(service, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const data = await response.json();
        let locationData: LocationData | null = null;

        if (service.includes('ip-api.com')) {
          locationData = {
            isIndia: data.countryCode === 'IN' || data.country?.toLowerCase().includes('india'),
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'Unknown',
            ip: data.query || ip,
          };
        } else if (service.includes('ipapi.co')) {
          locationData = {
            isIndia: data.country_code === 'IN' || data.country?.toLowerCase().includes('india'),
            country: data.country_name || data.country || 'Unknown',
            countryCode: data.country_code || 'Unknown',
            ip: data.ip || ip,
          };
        }

        if (locationData) {
          cachedLocation = locationData;
          return locationData;
        }
      } catch (error) {
        console.warn(`Location service ${service} failed:`, error);
        continue;
      }
    }

    // Fallback if all services fail
    const fallbackData: LocationData = {
      isIndia: false,
      country: 'Unknown',
      countryCode: 'Unknown',
      ip: ip,
    };
    
    cachedLocation = fallbackData;
    return fallbackData;

  } catch (error) {
    console.error('Location detection failed:', error);
    
    const fallbackData: LocationData = {
      isIndia: false,
      country: 'Unknown',
      countryCode: 'Unknown',
      ip: 'Unknown',
    };
    
    cachedLocation = fallbackData;
    return fallbackData;
  } finally {
    locationLoading = false;
  }
}

/**
 * Legacy function name for compatibility
 * @deprecated Use getLocation() instead
 */
export const getUserLocation = getLocation;

/**
 * Clear cached location data
 */
export function clearLocationCache(): void {
  cachedLocation = null;
}

// ===========================
// DEVICE INFO DETECTION
// ===========================

/**
 * Get device information (browser, OS, device type)
 * @returns DeviceInfo - Device information object
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  const detectBrowser = (): string => {
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  };

  const detectOS = (): string => {
    if (userAgent.indexOf('Windows') > -1) return 'Windows';
    if (userAgent.indexOf('Mac') > -1) return 'Mac';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    if (userAgent.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  };

  const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (/mobile|android|iphone|ipod/i.test(userAgent.toLowerCase())) {
      return 'mobile';
    }
    if (/ipad|tablet|kindle/i.test(userAgent.toLowerCase())) {
      return 'tablet';
    }
    return 'desktop';
  };

  return {
    browser: detectBrowser(),
    os: detectOS(),
    device_type: detectDeviceType(),
    user_agent: userAgent,
  };
}

// ===========================
// DEVICE FINGERPRINT
// ===========================

/**
 * Create a hash from fingerprint data
 */
function createHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get device fingerprint for unique identification
 * Uses browser-specific attributes to create a unique device identifier
 * 
 * @returns DeviceFingerprint - Complete fingerprint with hash
 */
export function getDeviceFingerprint(): DeviceFingerprint {
  const fingerprint = {
    screen: (typeof screen !== 'undefined' && screen.width && screen.height)
      ? `${screen.width}x${screen.height}`
      : 'unknown',
    
    colorDepth: (typeof screen !== 'undefined' && screen.colorDepth)
      ? screen.colorDepth
      : 'unknown',
    
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return 'UTC';
      }
    })(),
    
    language: typeof navigator !== 'undefined' ? (navigator.language || 'unknown') : 'unknown',
    platform: typeof navigator !== 'undefined' ? (navigator.platform || 'unknown') : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? (navigator.userAgent || 'unknown') : 'unknown',
    touchSupport: (typeof window !== 'undefined' && 'ontouchstart' in window) ? 'touch' : 'no-touch',
  };

  // Create hash from fingerprint data
  const fingerprintString = Object.entries(fingerprint)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');
  
  const deviceHash = createHash(fingerprintString);

  return {
    ...fingerprint,
    deviceHash,
  };
}

// ===========================
// COMBINED USER INFO
// ===========================

/**
 * Get all user information at once
 * Combines IP, location, device info, and fingerprint
 * 
 * @param options - Optional configuration
 * @param options.includeLocation - Whether to fetch location (default: true)
 * @param options.forceRefresh - Force refresh location data (default: false)
 * @returns Promise<CompleteUserInfo> - Complete user information
 */
export async function getAllUserInfo(options: {
  includeLocation?: boolean;
  forceRefresh?: boolean;
} = {}): Promise<CompleteUserInfo> {
  const { includeLocation = true, forceRefresh = false } = options;

  const [ip, location] = await Promise.all([
    getIP(),
    includeLocation ? getLocation(forceRefresh) : Promise.resolve(null),
  ]);

  const deviceInfo = getDeviceInfo();
  const fingerprint = getDeviceFingerprint();

  return {
    ip,
    location,
    deviceInfo,
    fingerprint,
    timestamp: new Date().toISOString(),
  };
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Check if user is in India (synchronous, uses cached data)
 * @returns boolean - True if user is in India, false otherwise
 */
export function isUserInIndia(): boolean {
  return cachedLocation?.isIndia ?? false;
}

/**
 * Prefetch and cache user location
 * Call this early in your app to have location ready when needed
 */
export async function prefetchUserInfo(): Promise<void> {
  try {
    await getLocation();
  } catch (error) {
    console.error('Failed to prefetch user info:', error);
  }
}

// ===========================
// EXPORTS
// ===========================

export default {
  // IP
  getIP,
  getUserIP,
  
  // Location
  getLocation,
  getUserLocation,
  clearLocationCache,
  isUserInIndia,
  
  // Device
  getDeviceInfo,
  getDeviceFingerprint,
  
  // Combined
  getAllUserInfo,
  
  // Utilities
  prefetchUserInfo,
};

// ===========================
// USAGE EXAMPLES & NOTES
// ===========================

/**
 * BASIC USAGE EXAMPLES:
 * 
 * 1. Get specific information:
 * ```typescript
 * import { getIP, getLocation, getDeviceInfo } from '@/utils/userInfo';
 * 
 * const ip = await getIP();
 * const location = await getLocation();
 * const device = getDeviceInfo();
 * ```
 * 
 * 2. Get all information at once:
 * ```typescript
 * import { getAllUserInfo } from '@/utils/userInfo';
 * 
 * const userInfo = await getAllUserInfo();
 * console.log(userInfo.ip, userInfo.location, userInfo.deviceInfo);
 * ```
 * 
 * 3. Check if user is in India:
 * ```typescript
 * import { getLocation, isUserInIndia } from '@/utils/userInfo';
 * 
 * await getLocation(); // Fetch location first
 * if (isUserInIndia()) {
 *   // Show India-specific content/pricing
 * }
 * ```
 * 
 * 4. Send to tracking API:
 * ```typescript
 * import { getAllUserInfo } from '@/utils/userInfo';
 * 
 * const userInfo = await getAllUserInfo();
 * 
 * // Track affiliate click
 * await fetch('/api/tracking/affiliate/click', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     affiliate_code: 'ABC123',
 *     session_id: sessionStorage.getItem('session_id'),
 *     ip_address: userInfo.ip,
 *     device_info: userInfo.deviceInfo,
 *     location: userInfo.location?.country,
 *     metadata: {
 *       fingerprint: userInfo.fingerprint.deviceHash,
 *     },
 *   }),
 * });
 * ```
 * 
 * 5. Prefetch on app load:
 * ```typescript
 * import { prefetchUserInfo } from '@/utils/userInfo';
 * 
 * // In your main layout or app component
 * useEffect(() => {
 *   prefetchUserInfo(); // Fetches and caches location in background
 * }, []);
 * ```
 */

/**
 * REACT HOOK EXAMPLE:
 * 
 * Create a custom hook for easy usage in React components:
 * 
 * ```typescript
 * // hooks/useUserInfo.ts
 * import { useState, useEffect } from 'react';
 * import { getAllUserInfo, CompleteUserInfo } from '@/utils/userInfo';
 * 
 * export function useUserInfo(options?: { autoFetch?: boolean }) {
 *   const [userInfo, setUserInfo] = useState<CompleteUserInfo | null>(null);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState<Error | null>(null);
 * 
 *   const fetchUserInfo = async () => {
 *     setLoading(true);
 *     try {
 *       const info = await getAllUserInfo();
 *       setUserInfo(info);
 *       setError(null);
 *     } catch (err) {
 *       setError(err as Error);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 * 
 *   useEffect(() => {
 *     if (options?.autoFetch !== false) {
 *       fetchUserInfo();
 *     }
 *   }, []);
 * 
 *   return { userInfo, loading, error, refetch: fetchUserInfo };
 * }
 * 
 * // Usage in component:
 * function MyComponent() {
 *   const { userInfo, loading } = useUserInfo();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   
 *   return (
 *     <div>
 *       <p>Your IP: {userInfo?.ip}</p>
 *       <p>Country: {userInfo?.location?.country}</p>
 *       <p>Device: {userInfo?.deviceInfo.device_type}</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * OR a simpler hook just for location:
 * 
 * ```typescript
 * // hooks/useLocation.ts
 * import { useState, useEffect } from 'react';
 * import { getLocation, LocationData } from '@/utils/userInfo';
 * 
 * export function useLocation() {
 *   const [location, setLocation] = useState<LocationData | null>(null);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     getLocation()
 *       .then(setLocation)
 *       .finally(() => setLoading(false));
 *   }, []);
 * 
 *   return { location, loading, isIndia: location?.isIndia ?? false };
 * }
 * 
 * // Usage:
 * function PricingPage() {
 *   const { isIndia, loading } = useLocation();
 *   
 *   if (loading) return <div>Detecting location...</div>;
 *   
 *   return (
 *     <div>
 *       <h1>Price: {isIndia ? '₹199' : '$20'}</h1>
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * CACHING STRATEGY:
 * 
 * Currently, location data is cached in memory during the session.
 * 
 * To implement localStorage caching (for persistent cache across page reloads):
 * 
 * ```typescript
 * // Add at the top of getLocation() function:
 * const CACHE_KEY = 'user_location_cache';
 * const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
 * 
 * // Check localStorage first
 * if (!forceRefresh) {
 *   try {
 *     const cached = localStorage.getItem(CACHE_KEY);
 *     if (cached) {
 *       const { data, timestamp } = JSON.parse(cached);
 *       if (Date.now() - timestamp < CACHE_DURATION) {
 *         cachedLocation = data;
 *         return data;
 *       }
 *     }
 *   } catch (e) {
 *     console.warn('Failed to read location cache');
 *   }
 * }
 * 
 * // After successful fetch, save to localStorage:
 * try {
 *   localStorage.setItem(CACHE_KEY, JSON.stringify({
 *     data: locationData,
 *     timestamp: Date.now(),
 *   }));
 * } catch (e) {
 *   console.warn('Failed to cache location');
 * }
 * ```
 * 
 * To clear localStorage cache:
 * ```typescript
 * export function clearLocationCache(): void {
 *   cachedLocation = null;
 *   try {
 *     localStorage.removeItem('user_location_cache');
 *   } catch (e) {
 *     console.warn('Failed to clear cache');
 *   }
 * }
 * ```
 */
