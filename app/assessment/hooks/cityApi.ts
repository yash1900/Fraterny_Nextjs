// OpenStreetMap Nominatim API - completely FREE, no API key needed!
export interface CityResult {
  id: string;
  name: string;
  country: string;
  displayName: string;
}

export async function searchCities(query: string): Promise<CityResult[]> {
  if (!query.trim() || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&featuretype=city`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0' // Required by Nominatim usage policy
        }
      }
    );
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    
    return data.map((place: any) => ({
      id: place.place_id.toString(),
      name: place.name || place.display_name.split(',')[0],
      country: place.address?.country || 'Unknown',
      displayName: `${place.name || place.display_name.split(',')[0]}, ${place.address?.country || 'Unknown'}`
    }));
    
  } catch (error) {
    console.error('City search error:', error);
    return [];
  }
}