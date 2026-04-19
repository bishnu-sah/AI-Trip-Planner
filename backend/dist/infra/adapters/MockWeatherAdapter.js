"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockWeatherAdapter = void 0;
class MockWeatherAdapter {
    async getForecast(placeId) {
        return {
            placeId,
            forecast: 'Sunny with light breeze',
            temperatureC: 22
        };
    }
}
exports.MockWeatherAdapter = MockWeatherAdapter;
