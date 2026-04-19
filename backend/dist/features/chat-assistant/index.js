"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatModule = void 0;
const controller_1 = require("./controller");
const service_1 = require("./service");
const routes_1 = require("./routes");
const registerChatModule = (router, container) => {
    const aiAdapter = container.resolve('AIAdapter');
    const chatService = new service_1.ChatAssistantService(aiAdapter);
    container.register('ChatService', chatService);
    const controller = new controller_1.ChatAssistantController(chatService);
    router.use('/chat', (0, routes_1.createChatRoutes)(controller));
};
exports.registerChatModule = registerChatModule;
