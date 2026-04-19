import { IPlacesAdapter, IAIAdapter } from '../../domain/interfaces/adapters';
import { IHotelService } from '../../domain/interfaces/services';
import { Place, Hotel } from '../../domain/models';
import { v4 as uuid } from 'uuid';

export class HotelService implements IHotelService {
  constructor(
    private readonly placesAdapter: IPlacesAdapter,
    private readonly aiAdapter?: IAIAdapter
  ) {}

  async recommend(city: string): Promise<Place[]> {
    // For the demo we reuse the places adapter; a dedicated hotels adapter could be injected instead.
    return this.placesAdapter.search(city + ' hotel');
  }

  async recommendHotels(city: string, location?: string): Promise<Hotel[]> {
    // Use AI to generate hotel recommendations
    if (this.aiAdapter) {
      try {
        const searchLocation = location || city;
        const prompt = `Recommend 5-7 good hotels near ${searchLocation}, ${city}, India. 

For each hotel, provide:
- Hotel name (real or realistic name)
- Location/area within ${city}
- Rating (1-5 stars)
- Price range (Budget/Mid-range/Luxury)
- Brief description (1-2 sentences)
- Key amenities (3-5 items like WiFi, Pool, Restaurant, etc.)
- Distance from main attraction (if applicable)

Format as JSON array:
[
  {
    "name": "Hotel Name",
    "location": "Area/Location",
    "city": "${city}",
    "rating": 4.5,
    "priceRange": "Mid-range",
    "description": "Brief description",
    "amenities": ["WiFi", "Pool", "Restaurant"],
    "distance": "2 km from main attraction"
  }
]

Make recommendations realistic and suitable for tourists visiting Indian destinations.`;

        console.log(`[HotelService] Generating hotel recommendations for ${city}...`);
        const aiResponse = await this.aiAdapter.complete(prompt);
        
        // Parse JSON from response
        let hotels: Hotel[] = [];
        try {
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            hotels = parsed.map((h: any, idx: number) => ({
              id: uuid(),
              name: h.name || `Hotel ${idx + 1}`,
              location: h.location || city,
              city: h.city || city,
              rating: h.rating || 4.0,
              priceRange: h.priceRange || 'Mid-range',
              description: h.description || 'Comfortable accommodation',
              amenities: h.amenities || ['WiFi', 'AC', 'Restaurant'],
              distance: h.distance || 'Near city center'
            }));
          }
        } catch (parseError) {
          console.warn('[HotelService] Failed to parse AI response, using fallback');
        }

        if (hotels.length > 0) {
          console.log(`[HotelService] Generated ${hotels.length} hotel recommendations`);
          return hotels;
        }
      } catch (error: any) {
        console.error('[HotelService] AI generation failed:', error?.message);
      }
    }

    // Fallback: Generate basic hotel recommendations
    const fallbackHotels: Hotel[] = [
      {
        id: uuid(),
        name: `${city} Grand Hotel`,
        location: 'City Center',
        city: city,
        rating: 4.5,
        priceRange: 'Luxury',
        description: 'Premium hotel with excellent amenities',
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
        distance: '1 km from main attraction'
      },
      {
        id: uuid(),
        name: `${city} Comfort Inn`,
        location: 'Downtown',
        city: city,
        rating: 4.0,
        priceRange: 'Mid-range',
        description: 'Comfortable accommodation for travelers',
        amenities: ['WiFi', 'AC', 'Restaurant', 'Parking'],
        distance: '2 km from main attraction'
      },
      {
        id: uuid(),
        name: `${city} Budget Stay`,
        location: 'Near Station',
        city: city,
        rating: 3.5,
        priceRange: 'Budget',
        description: 'Affordable option with basic amenities',
        amenities: ['WiFi', 'AC', 'Breakfast'],
        distance: '3 km from main attraction'
      }
    ];

    return fallbackHotels;
  }
}

