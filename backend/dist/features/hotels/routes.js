"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotelRoutes = void 0;
const express_1 = require("express");
const createHotelRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.get('/sample', controller.sample);
    router.get('/', controller.recommend);
    return router;
};
exports.createHotelRoutes = createHotelRoutes;
