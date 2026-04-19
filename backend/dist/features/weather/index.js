"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWeatherModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const routes_1 = require("./routes");
const registerWeatherModule = (router, container) => {
    const weatherAdapter = container.resolve('WeatherAdapter');
    const weatherService = new service_1.WeatherService(weatherAdapter);
    container.register('WeatherService', weatherService);
    const controller = new controller_1.WeatherController(weatherService);
    router.use('/weather', (0, routes_1.createWeatherRoutes)(controller));
};
exports.registerWeatherModule = registerWeatherModule;
