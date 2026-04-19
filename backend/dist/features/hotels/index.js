"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHotelModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const routes_1 = require("./routes");
const registerHotelModule = (router, container) => {
    const placesAdapter = container.resolve('PlacesAdapter');
    const aiAdapter = container.resolve('AIAdapter');
    const hotelService = new service_1.HotelService(placesAdapter, aiAdapter);
    container.register('HotelService', hotelService);
    const controller = new controller_1.HotelController(hotelService);
    router.use('/hotels', (0, routes_1.createHotelRoutes)(controller));
};
exports.registerHotelModule = registerHotelModule;
