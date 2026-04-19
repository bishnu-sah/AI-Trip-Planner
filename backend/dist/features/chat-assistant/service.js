"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAssistantService = void 0;
class ChatAssistantService {
    aiAdapter;
    constructor(aiAdapter) {
        this.aiAdapter = aiAdapter;
    }
    async converse(messages) {
        return this.aiAdapter.chat(messages);
    }
}
exports.ChatAssistantService = ChatAssistantService;
