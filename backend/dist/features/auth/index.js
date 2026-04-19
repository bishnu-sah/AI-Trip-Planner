"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const routes_1 = require("./routes");
const registerAuthModule = (router, container) => {
    const authService = new service_1.AuthService();
    container.register('AuthService', authService);
    const controller = new controller_1.AuthController(authService);
    router.use('/auth', (0, routes_1.createAuthRoutes)(controller));
};
exports.registerAuthModule = registerAuthModule;
