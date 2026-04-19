"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAssistantController = void 0;
class ChatAssistantController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    chat = async (req, res) => {
        const messages = req.body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: 'messages array required' });
        }
        const reply = await this.chatService.converse(messages);
        res.json(reply);
    };
}
exports.ChatAssistantController = ChatAssistantController;
