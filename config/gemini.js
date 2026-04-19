const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateContentSuggestion = async (title, content) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Given the following blog post title and content, suggest improvements or additional points to consider:
        Title: ${title}
        Content: ${content}
        
        Please provide specific suggestions for improving the content, maintaining a professional and helpful tone.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating content suggestion:', error);
        return null;
    }
};

module.exports = { generateContentSuggestion }; 