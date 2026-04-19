"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlaceModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const routes_1 = require("./routes");
const registerPlaceModule = (router, container) => {
    const placesAdapter = container.resolve('PlacesAdapter');
    const placeService = new service_1.PlaceService(placesAdapter);
    container.register('PlaceService', placeService);
    const controller = new controller_1.PlaceController(placeService);
    router.use('/places', (0, routes_1.createPlaceRoutes)(controller));
};
exports.registerPlaceModule = registerPlaceModule;
