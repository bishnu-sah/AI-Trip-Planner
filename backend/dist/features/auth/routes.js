"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const createAuthRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.post('/register', controller.register);
    router.post('/login', controller.login);
    router.get('/me', auth_1.authenticateToken, controller.me);
    router.put('/me', auth_1.authenticateToken, controller.updateProfile);
    return router;
};
exports.createAuthRoutes = createAuthRoutes;
