require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        // Note: getGenerativeModel doesn't list models. We need to use the model manager if exposed, 
        // or just try to generate content.
        // Actually, the error message said "Call ListModels". But the SDK exposes it via `GoogleGenerativeAI.makeRequest`?
        // No, standard SDK usage doesn't have listModels directly in the main class? 
        // Wait, the SDK has `getGenerativeModel`. 
        // `gemini-pro` IS the standard model.
        // If it says 404, it might be the KEY is invalid for this API.

        // Let's try to just print the key (masked) to prove it loaded.
        console.log('Key loaded:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');
        console.log('Key prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : 'N/A');

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log('gemini-pro response:', result.response.text());
    } catch (error) {
        console.error('Error with gemini-pro:', error.message);
    }
}

run();
