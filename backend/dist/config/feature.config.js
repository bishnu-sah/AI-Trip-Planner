"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureConfig = void 0;
const types_1 = require("./types");
exports.featureConfig = {
    mockMode: process.env.MOCK_MODE === 'true',
    adapters: {
        places: process.env.PLACES_ADAPTER === 'real' ? types_1.AdapterChoice.Real : types_1.AdapterChoice.Mock,
        // Only use Real AI if explicitly set AND API key is present
        ai: process.env.AI_ADAPTER === 'real' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here'
            ? types_1.AdapterChoice.Real
            : types_1.AdapterChoice.Mock,
        weather: process.env.WEATHER_ADAPTER === 'real' ? types_1.AdapterChoice.Real : types_1.AdapterChoice.Mock,
        distance: process.env.DISTANCE_ADAPTER === 'real' ? types_1.AdapterChoice.Real : types_1.AdapterChoice.Mock
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
