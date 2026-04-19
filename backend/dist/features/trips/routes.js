"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTripRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const createTripRoutes = (controller) => {
    const router = (0, express_1.Router)();
    // All trip routes require authentication
    router.use(auth_1.authenticateToken);
    router.post('/generate', controller.generate);
    router.get('/', controller.list);
    router.get('/:id', controller.getById);
    router.post('/save', controller.save);
    router.delete('/:id', controller.delete);
    return router;
};
exports.createTripRoutes = createTripRoutes;
