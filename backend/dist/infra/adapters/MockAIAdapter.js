"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAIAdapter = void 0;
class MockAIAdapter {
    async complete(prompt) {
        console.warn('[MockAIAdapter] ⚠️  MOCK adapter called - returning placeholder data');
        console.warn('[MockAIAdapter] To use real AI, set AI_ADAPTER=real and GEMINI_API_KEY in .env');
        // Return a mock JSON response that looks like real data but is clearly placeholder
        return JSON.stringify({
            title: "Mock Trip - Set AI_ADAPTER=real for real AI data",
            days: Array.from({ length: 3 }).map((_, idx) => ({
                day: idx + 1,
                date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
                places: ["Placeholder Place 1", "Placeholder Place 2"],
                activities: ["Placeholder Activity 1", "Placeholder Activity 2"],
                notes: "This is MOCK data. To get real AI-generated itineraries, please set AI_ADAPTER=real and provide a valid GEMINI_API_KEY in your .env file."
            }))
        });
    }
    async chat(messages) {
        const last = messages[messages.length - 1];
        return { role: 'assistant', content: `Echo: ${last.content}` };
    }
}
exports.MockAIAdapter = MockAIAdapter;
