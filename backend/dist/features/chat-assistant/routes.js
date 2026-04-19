"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatRoutes = void 0;
const express_1 = require("express");
const createChatRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.post('/chat', controller.chat);
    return router;
};
exports.createChatRoutes = createChatRoutes;
