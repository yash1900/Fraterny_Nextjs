/**
 * Location detection service
 */

export interface LocationData {
  isIndia: boolean;
  country?: string;
  countryCode?: string;
}

/**
 * Detect user location using public API
 */
export async function getUserLocation(): Promise<LocationData> {
  try {
    // Use ipapi.co for location detection (free tier: 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const isIndia = data.country_code === 'IN';
    
    return {
      isIndia,
      country: data.country_name,
      countryCode: data.country_code,
    };
  } catch (error) {
    console.error('Failed to detect location:', error);
    // Default to international if detection fails
    return {
      isIndia: false,
      country: 'Unknown',
      countryCode: 'XX',
    };
  }
}
