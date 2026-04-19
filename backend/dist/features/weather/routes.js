"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeatherRoutes = void 0;
const express_1 = require("express");
const createWeatherRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.get('/:placeId', controller.get);
    return router;
};
exports.createWeatherRoutes = createWeatherRoutes;
