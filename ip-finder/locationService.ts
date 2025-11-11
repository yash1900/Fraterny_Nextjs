interface LocationData {
  isIndia: boolean;
  country: string;
  countryCode: string;
  ip: string;
}

interface GeoResponse {
  country: string;
  countryCode: string;
  query: string;
}

class LocationService {
  private locationData: LocationData | null = null;
  private isLoading = false;
  private manualOverride: LocationData | null = null;

  // Set manual override for testing
  setManualOverride(isIndia: boolean, country: string = 'Test'): void {
    this.manualOverride = {
      isIndia,
      country,
      countryCode: isIndia ? 'IN' : 'SE',
      ip: 'manual_override'
    };
    console.log('🔧 Manual location override set:', this.manualOverride);
  }

  // Clear manual override
  clearManualOverride(): void {
    this.manualOverride = null;
    console.log('🔧 Manual location override cleared');
  }

  // Get user location from IP
  async getUserLocation(): Promise<LocationData> {
    // Return manual override if set (for testing)
    if (this.manualOverride) {
      console.log('🔧 Using manual override:', this.manualOverride);
      return this.manualOverride;
    }

    if (this.locationData) {
      return this.locationData;
    }

    if (this.isLoading) {
      // Wait for existing request to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getUserLocation();
    }

    this.isLoading = true;

    try {
      // Try multiple IP geolocation services as fallback
      const services = [
        'https://ipapi.co/json/',
        'https://api.ipgeolocation.io/ipgeo?apiKey=free',
        'https://api.ipify.org?format=json' // Fallback for IP only
      ];
      
      //console.log('🌐 Trying location detection services...');
      //console.log('Services to try:', services);

      let locationData: LocationData | null = null;

      for (const service of services) {
        try {
          //console.log('🔍 Trying service:', service);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          
          const response = await fetch(service, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          // console.log('✅ Service responded:', service, 'Status:', response.status);

          if (!response.ok) continue;

          const data = await response.json();
          
          if (service.includes('ip-api.com')) {
            locationData = {
              isIndia: data.countryCode === 'IN' || data.country?.toLowerCase().includes('india'),
              country: data.country || 'Unknown',
              countryCode: data.countryCode || 'Unknown',
              ip: data.query || 'Unknown'
            };
          } else if (service.includes('ipapi.co')) {
            locationData = {
              isIndia: data.country_code === 'IN' || data.country?.toLowerCase().includes('india'),
              country: data.country || 'Unknown',
              countryCode: data.country_code || 'Unknown',
              ip: data.ip || 'Unknown'
            };
          }

          if (locationData) {
            break;
          }
        } catch (error) {
          console.warn(`Failed to get location from ${service}:`, error);
          continue;
        }
      }

      // Fallback: assume non-India if all services fail
      if (!locationData) {
        console.warn('All location services failed, defaulting to non-India');
        locationData = {
          isIndia: false,
          country: 'Unknown',
          countryCode: 'Unknown',
          ip: 'Unknown'
        };
      }

      this.locationData = locationData;
      
      // Cache in localStorage for faster subsequent loads
      try {
        localStorage.setItem('user_location_cache', JSON.stringify({
          ...locationData,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to cache location data:', error);
      }

      // console.log('🌍 Location Detection Results:');
      // console.log('- Country:', locationData.country);
      // console.log('- Country Code:', locationData.countryCode);
      // console.log('- IP Address:', locationData.ip);
      // console.log('- Is India:', locationData.isIndia);
      return locationData;

    } catch (error) {
      console.error('Location detection failed:', error);
      
      // Try to use cached location data
      const cached = this.getCachedLocation();
      if (cached) {
        this.locationData = cached;
        return cached;
      }

      // Ultimate fallback
      const fallbackData: LocationData = {
        isIndia: false,
        country: 'Unknown',
        countryCode: 'Unknown',
        ip: 'Unknown'
      };
      
      this.locationData = fallbackData;
      return fallbackData;
    } finally {
      this.isLoading = false;
    }
  }

  // Get cached location data (valid for 24 hours)
  private getCachedLocation(): LocationData | null {
    try {
      const cached = localStorage.getItem('user_location_cache');
      if (!cached) return null;

      const cachedData = JSON.parse(cached);
      const isExpired = Date.now() - cachedData.timestamp > 24 * 60 * 60 * 1000; // 24 hours

      if (isExpired) {
        localStorage.removeItem('user_location_cache');
        return null;
      }

      return {
        isIndia: cachedData.isIndia,
        country: cachedData.country,
        countryCode: cachedData.countryCode,
        ip: cachedData.ip
      };
    } catch (error) {
      console.warn('Failed to get cached location:', error);
      return null;
    }
  }

  // Check if user is in India (synchronous, uses cache if available)
  isUserInIndia(): boolean {
    const cached = this.getCachedLocation();
    if (cached) {
      return cached.isIndia;
    }

    // If no cache available, assume non-India for safety
    // The async method will update this
    return false;
  }

  // Clear cached location data
  clearLocationCache(): void {
    this.locationData = null;
    try {
      localStorage.removeItem('user_location_cache');
    } catch (error) {
      console.warn('Failed to clear location cache:', error);
    }
  }

  // Force refresh location data
  async refreshLocation(): Promise<LocationData> {
    this.clearLocationCache();
    return this.getUserLocation();
  }

  // Debug function to check current detection
  async debugLocation(): Promise<void> {
    console.log('🔍 Debug: Checking current location detection...');
    const cached = this.getCachedLocation();
    if (cached) {
      console.log('📋 Cached location:', cached);
    } else {
      console.log('📋 No cached location found');
    }
    
    console.log('🌐 Fetching fresh location...');
    const fresh = await this.refreshLocation();
    console.log('🆕 Fresh location:', fresh);
  }
}

// Create singleton instance
export const locationService = new LocationService();

// Utility functions for direct use
export const getUserLocation = async (): Promise<LocationData> => {
  return locationService.getUserLocation();
};

export const isUserInIndia = (): boolean => {
  return locationService.isUserInIndia();
};

export const refreshUserLocation = async (): Promise<LocationData> => {
  return locationService.refreshLocation();
};

export const debugUserLocation = async (): Promise<void> => {
  return locationService.debugLocation();
};

export const setLocationOverride = (isIndia: boolean, country?: string): void => {
  return locationService.setManualOverride(isIndia, country);
};

export const clearLocationOverride = (): void => {
  return locationService.clearManualOverride();
};

export type { LocationData };
