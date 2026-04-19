"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealAIAdapter = void 0;
const generative_ai_1 = require("@google/generative-ai");
class RealAIAdapter {
    genAI = null;
    model = null;
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
        console.log('[RealAIAdapter] Initializing with API key length:', this.apiKey.length);
        if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here' || this.apiKey.trim() === '') {
            console.warn('[RealAIAdapter] ⚠️  GEMINI_API_KEY not found or not set.');
            console.warn('[RealAIAdapter] Please set GEMINI_API_KEY in your .env file to enable AI features.');
            this.genAI = null;
            this.model = null;
        }
        else {
            try {
                console.log('[RealAIAdapter] Initializing Google Generative AI...');
                this.genAI = new generative_ai_1.GoogleGenerativeAI(this.apiKey);
                // Use gemini-2.5-flash for fast responses, or gemini-pro-latest for better quality
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                console.log('[RealAIAdapter] ✅ Successfully initialized Gemini model: gemini-2.5-flash');
            }
            catch (error) {
                console.error('[RealAIAdapter] ❌ Error initializing Gemini AI:', error?.message);
                console.error('[RealAIAdapter] Error details:', error);
                this.genAI = null;
                this.model = null;
                throw error; // Re-throw to be caught by bootstrap
            }
        }
    }
    ensureInitialized() {
        if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
            throw new Error('GEMINI_API_KEY is required. Please set it in your .env file.');
        }
        if (!this.genAI || !this.model) {
            throw new Error('AI adapter not properly initialized. Please check your GEMINI_API_KEY.');
        }
    }
    async complete(prompt) {
        this.ensureInitialized();
        try {
            console.log('[RealAIAdapter] Calling Gemini API...');
            console.log('[RealAIAdapter] Prompt length:', prompt.length);
            console.log('[RealAIAdapter] API Key present:', !!this.apiKey);
            console.log('[RealAIAdapter] API Key length:', this.apiKey.length);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            if (!response) {
                throw new Error('Empty response from Gemini API');
            }
            const text = response.text();
            if (!text || text.trim() === '') {
                throw new Error('Empty text response from Gemini API');
            }
            console.log('[RealAIAdapter] ✅ Response received, length:', text.length);
            console.log('[RealAIAdapter] Response preview:', text.substring(0, 300));
            return text;
        }
        catch (error) {
            console.error('[RealAIAdapter] ❌ Error calling Gemini API:', error);
            console.error('[RealAIAdapter] Error type:', error?.constructor?.name);
            console.error('[RealAIAdapter] Error message:', error?.message);
            console.error('[RealAIAdapter] Error code:', error?.code);
            console.error('[RealAIAdapter] Error status:', error?.status);
            console.error('[RealAIAdapter] Full error:', JSON.stringify(error, null, 2));
            // Check for specific Gemini API error codes
            const errorMessage = error?.message || '';
            const errorStatus = error?.status || error?.response?.status;
            // Provide more specific error messages
            if (errorMessage.includes('API_KEY_INVALID') ||
                errorMessage.includes('API key not valid') ||
                errorStatus === 401 ||
                errorStatus === 403) {
                throw new Error('Invalid GEMINI_API_KEY. Please check your API key in .env file and restart the server.');
            }
            if (errorMessage.includes('QUOTA') ||
                errorMessage.includes('quota') ||
                errorStatus === 429) {
                throw new Error('API quota exceeded. Please check your Gemini API usage limits at https://aistudio.google.com/');
            }
            if (errorMessage.includes('network') ||
                errorMessage.includes('ECONNREFUSED') ||
                errorMessage.includes('fetch failed') ||
                error?.code === 'ECONNREFUSED') {
                throw new Error('Network error. Please check your internet connection.');
            }
            if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
                throw new Error('Request timeout. The AI service took too long to respond. Please try again.');
            }
            // Generic error with more context
            const detailedError = errorMessage || 'Unknown error';
            throw new Error(`Failed to generate AI response: ${detailedError}. Please check your API key, internet connection, and try again.`);
        }
    }
    async chat(messages) {
        this.ensureInitialized();
        try {
            // Convert messages to Gemini format
            const chat = this.model.startChat({
                history: messages.slice(0, -1).map((msg) => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }))
            });
            const lastMessage = messages[messages.length - 1];
            const result = await chat.sendMessage(lastMessage.content);
            const response = await result.response;
            return { role: 'assistant', content: response.text() };
        }
        catch (error) {
            console.error('Error in AI chat:', error);
            const errorMessage = error?.message || 'Unknown error';
            throw new Error(`Failed to generate AI chat response: ${errorMessage}`);
        }
    }
}
exports.RealAIAdapter = RealAIAdapter;
