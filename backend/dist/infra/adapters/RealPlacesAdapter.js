"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealPlacesAdapter = void 0;
class RealPlacesAdapter {
    apiKey;
    constructor(apiKey = process.env.PLACES_API_KEY || '') {
        this.apiKey = apiKey;
    }
    async search(keyword) {
        // TODO: Implement real HTTP call (e.g., Google Places, Mapbox).
        // The structure is preserved so swapping from Mock -> Real only requires toggling config.
        console.warn('RealPlacesAdapter invoked without real implementation; returning mock-shaped data.');
        return [
            { id: 'real-1', name: `${keyword} Central`, country: 'Unknown', coordinates: { lat: 0, lng: 0 } }
        ];
    }
}
exports.RealPlacesAdapter = RealPlacesAdapter;
