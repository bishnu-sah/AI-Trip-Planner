"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
class AIService {
    adapter;
    constructor(adapter) {
        this.adapter = adapter;
    }
    complete(prompt) {
        return this.adapter.complete(prompt);
    }
}
exports.AIService = AIService;
