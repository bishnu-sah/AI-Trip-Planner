import { IPlacesAdapter } from '../../domain/interfaces/adapters';
import { Place } from '../../domain/models';

export class RealPlacesAdapter implements IPlacesAdapter {
  constructor(private readonly apiKey: string = process.env.PLACES_API_KEY || '') {}

  async search(keyword: string): Promise<Place[]> {
    // TODO: Implement real HTTP call (e.g., Google Places, Mapbox).
    // The structure is preserved so swapping from Mock -> Real only requires toggling config.
    console.warn('RealPlacesAdapter invoked without real implementation; returning mock-shaped data.');
    return [
      { id: 'real-1', name: `${keyword} Central`, country: 'Unknown', coordinates: { lat: 0, lng: 0 } }
    ];
  }
}

