"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherController = void 0;
class WeatherController {
    weatherService;
    constructor(weatherService) {
        this.weatherService = weatherService;
    }
    get = async (req, res) => {
        const { placeId } = req.params;
        if (!placeId) {
            return res.status(400).json({ message: 'placeId required' });
        }
        const summary = await this.weatherService.getWeather(placeId);
        res.json(summary);
    };
}
exports.WeatherController = WeatherController;
