import { AdapterChoice, FeatureConfig } from './types';

export const featureConfig: FeatureConfig = {
  mockMode: process.env.MOCK_MODE === 'true',
  adapters: {
    places: process.env.PLACES_ADAPTER === 'real' ? AdapterChoice.Real : AdapterChoice.Mock,
    // Only use Real AI if explicitly set AND API key is present
    ai: process.env.AI_ADAPTER === 'real' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here'
      ? AdapterChoice.Real
      : AdapterChoice.Mock,
    weather: process.env.WEATHER_ADAPTER === 'real' ? AdapterChoice.Real : AdapterChoice.Mock,
    distance: process.env.DISTANCE_ADAPTER === 'real' ? AdapterChoice.Real : AdapterChoice.Mock
  },
  features: {
    placeSearch: true,
    trips: true,
    weather: true,
    pdfExport: true,
    chatAssistant: true,
    hotels: true
  }
};

