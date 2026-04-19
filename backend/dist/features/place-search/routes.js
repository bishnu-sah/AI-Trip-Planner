"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaceRoutes = void 0;
const express_1 = require("express");
const createPlaceRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.get('/search', controller.search);
    return router;
};
exports.createPlaceRoutes = createPlaceRoutes;
