"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTripModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const routes_1 = require("./routes");
const diagnostics_1 = require("./diagnostics");
const registerTripModule = (router, container) => {
    const tripDao = container.resolve('TripDAO');
    const aiAdapter = container.resolve('AIAdapter');
    const placesAdapter = container.resolve('PlacesAdapter');
    const distanceAdapter = container.resolve('DistanceAdapter');
    const tripService = new service_1.TripService(tripDao, aiAdapter, placesAdapter, distanceAdapter);
    container.register('TripService', tripService);
    const controller = new controller_1.TripController(tripService, placesAdapter);
    router.use('/trips', (0, routes_1.createTripRoutes)(controller));
    // Add diagnostics route (no auth required for diagnostics)
    const diagnosticsRoutes = (0, diagnostics_1.createDiagnosticsRoutes)(container);
    router.use('/trips-diagnostics', diagnosticsRoutes);
};
exports.registerTripModule = registerTripModule;
