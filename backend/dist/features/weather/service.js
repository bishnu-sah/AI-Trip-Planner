"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
class WeatherService {
    weatherAdapter;
    constructor(weatherAdapter) {
        this.weatherAdapter = weatherAdapter;
    }
    async getWeather(placeId) {
        return this.weatherAdapter.getForecast(placeId);
    }
}
exports.WeatherService = WeatherService;
