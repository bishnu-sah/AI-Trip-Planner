"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPdfRoutes = void 0;
const express_1 = require("express");
const createPdfRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.get('/:tripId', controller.export);
    return router;
};
exports.createPdfRoutes = createPdfRoutes;
