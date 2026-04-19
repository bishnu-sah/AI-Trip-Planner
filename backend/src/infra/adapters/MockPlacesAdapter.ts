import { IPlacesAdapter } from '../../domain/interfaces/adapters';
import { Place } from '../../domain/models';

export class MockPlacesAdapter implements IPlacesAdapter {
  async search(keyword: string): Promise<Place[]> {
    // Indian destinations database
    const indianPlaces: Place[] = [
      { id: 'taj-mahal', name: 'Taj Mahal', country: 'India', coordinates: { lat: 27.1751, lng: 78.0421 } },
      { id: 'golden-temple', name: 'Golden Temple', country: 'India', coordinates: { lat: 31.6200, lng: 74.8765 } },
      { id: 'red-fort', name: 'Red Fort', country: 'India', coordinates: { lat: 28.6562, lng: 77.2410 } },
      { id: 'gateway-india', name: 'Gateway of India', country: 'India', coordinates: { lat: 18.9220, lng: 72.8347 } },
      { id: 'agra-fort', name: 'Agra Fort', country: 'India', coordinates: { lat: 27.1797, lng: 78.0211 } },
      { id: 'fatehpur-sikri', name: 'Fatehpur Sikri', country: 'India', coordinates: { lat: 27.0945, lng: 77.6610 } },
      { id: 'mehtab-bagh', name: 'Mehtab Bagh', country: 'India', coordinates: { lat: 27.1833, lng: 78.0428 } },
      { id: 'delhi', name: 'Delhi', country: 'India', coordinates: { lat: 28.6139, lng: 77.2090 } },
      { id: 'mumbai', name: 'Mumbai', country: 'India', coordinates: { lat: 19.0760, lng: 72.8777 } },
      { id: 'bangalore', name: 'Bangalore', country: 'India', coordinates: { lat: 12.9716, lng: 77.5946 } },
      { id: 'kolkata', name: 'Kolkata', country: 'India', coordinates: { lat: 22.5726, lng: 88.3639 } },
      { id: 'chennai', name: 'Chennai', country: 'India', coordinates: { lat: 13.0827, lng: 80.2707 } },
      { id: 'hyderabad', name: 'Hyderabad', country: 'India', coordinates: { lat: 17.3850, lng: 78.4867 } },
      { id: 'pune', name: 'Pune', country: 'India', coordinates: { lat: 18.5204, lng: 73.8567 } },
      { id: 'jaipur', name: 'Jaipur', country: 'India', coordinates: { lat: 26.9124, lng: 75.7873 } },
      { id: 'udaipur', name: 'Udaipur', country: 'India', coordinates: { lat: 24.5854, lng: 73.7125 } },
      { id: 'varanasi', name: 'Varanasi', country: 'India', coordinates: { lat: 25.3176, lng: 82.9739 } },
      { id: 'goa', name: 'Goa', country: 'India', coordinates: { lat: 15.2993, lng: 74.1240 } },
      { id: 'kerala', name: 'Kerala', country: 'India', coordinates: { lat: 10.8505, lng: 76.2711 } },
      { id: 'agra', name: 'Agra', country: 'India', coordinates: { lat: 27.1767, lng: 78.0081 } },
      { id: 'amritsar', name: 'Amritsar', country: 'India', coordinates: { lat: 31.6340, lng: 74.8723 } }
    ];

    // Try to find matching places
    const keywordLower = keyword.toLowerCase().trim();
    const matches = indianPlaces.filter((p) => 
      p.name.toLowerCase().includes(keywordLower) || 
      keywordLower.includes(p.name.toLowerCase())
    );

    // If no matches found, create a place from the keyword
    if (matches.length === 0) {
      console.log(`[MockPlacesAdapter] No exact match for "${keyword}", creating place from keyword`);
      return [{
        id: keywordLower.replace(/\s+/g, '-'),
        name: keyword,
        country: 'India',
        coordinates: { lat: 0, lng: 0 }
      }];
    }

    console.log(`[MockPlacesAdapter] Found ${matches.length} place(s) for "${keyword}"`);
    return matches;
  }
}

