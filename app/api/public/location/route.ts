/**
 * API Route: /api/public/location
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';

type LocationData = {
  isIndia: boolean;
  country: string;
  countryCode: string;
  ip: string;
};

// In-memory cache for server-side caching
interface LocationCache {
  data: LocationData;
  timestamp: number;
}

let locationCache: Map<string, LocationCache> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Manual override for testing
let manualOverride: LocationData | null = null;

// Helper function to get cached location
function getCachedLocation(ip: string): LocationData | null {
  const cached = locationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  if (cached) {
    locationCache.delete(ip); // Remove expired cache
  }
  return null;
}

// Helper function to cache location
function cacheLocation(ip: string, data: LocationData): void {
  locationCache.set(ip, {
    data,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries (keep only last 100)
  if (locationCache.size > 100) {
    const oldestKey = locationCache.keys().next().value;
    if (oldestKey) locationCache.delete(oldestKey);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    
    // Handle cache status check
    if (operation === 'cache-status') {
      return NextResponse.json({
        success: true,
        cacheSize: locationCache.size,
        hasOverride: !!manualOverride
      });
    }
    
    // Handle cache clearing
    if (operation === 'clear-cache') {
      locationCache.clear();
      return NextResponse.json({
        success: true,
        message: 'Location cache cleared'
      });
    }

    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';

    console.log('🌐 Attempting location detection for IP:', ip);
    
    // Return manual override if set (for testing)
    if (manualOverride) {
      console.log('🔧 Using manual override:', manualOverride);
      return NextResponse.json(manualOverride);
    }
    
    // Check cache first
    const cachedData = getCachedLocation(ip);
    if (cachedData) {
      console.log('📋 Using cached location data for IP:', ip);
      return NextResponse.json(cachedData);
    }

    // Try multiple IP geolocation services as fallback
    const services = [
      `https://ipapi.co/${ip}/json/`,
      `https://ip-api.com/json/${ip}`,
    ];

    for (const service of services) {
      try {
        console.log('🔍 Trying service:', service);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(service, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
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
          console.log('✅ Location detected:', locationData);
          // Cache the result
          cacheLocation(ip, locationData);
          return NextResponse.json(locationData);
        }
      } catch (error) {
        console.warn(`Failed to get location from ${service}:`, error);
        continue;
      }
    }

    // Fallback: assume non-India if all services fail
    console.warn('All location services failed, defaulting to non-India');
    const fallbackData: LocationData = {
      isIndia: false,
      country: 'Unknown',
      countryCode: 'Unknown',
      ip: ip,
    };

    // Cache the fallback result too (shorter duration)
    cacheLocation(ip, fallbackData);
    return NextResponse.json(fallbackData);
  } catch (error: any) {
    console.error('Location detection failed:', error);

    // Ultimate fallback
    const fallbackData: LocationData = {
      isIndia: false,
      country: 'Unknown',
      countryCode: 'Unknown',
      ip: 'Unknown',
    };

    return NextResponse.json(fallbackData);
  }
}

// POST - Set manual override or refresh location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation } = body;
    
    // Handle manual override setting
    if (operation === 'set-override') {
      const { isIndia, country = 'Test', countryCode } = body;
      
      if (typeof isIndia !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'isIndia must be a boolean' },
          { status: 400 }
        );
      }
      
      manualOverride = {
        isIndia,
        country,
        countryCode: countryCode || (isIndia ? 'IN' : 'TE'),
        ip: 'manual_override'
      };
      
      console.log('🔧 Manual location override set:', manualOverride);
      return NextResponse.json({
        success: true,
        data: manualOverride,
        message: 'Manual override set successfully'
      });
    }
    
    // Handle override clearing
    if (operation === 'clear-override') {
      manualOverride = null;
      console.log('🔧 Manual location override cleared');
      return NextResponse.json({
        success: true,
        message: 'Manual override cleared successfully'
      });
    }
    
    // Handle refresh location (force new detection)
    if (operation === 'refresh') {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';
      
      // Clear cache for this IP
      locationCache.delete(ip);
      
      // Redirect to GET to fetch fresh data
      return NextResponse.json({
        success: true,
        message: 'Location cache cleared for IP, call GET to fetch fresh data'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid operation' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Location POST error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

