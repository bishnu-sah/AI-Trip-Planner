const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = "AIzaSyAlu5bg2bV-6Ci6K-AxNkOW0DWXEJBmyYI";
const genAI = new GoogleGenerativeAI(key);

async function run() {
    const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-2.5-flash'];

    for (const modelName of models) {
        console.log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ SUCCESS with ${modelName}`);
        } catch (error) {
            console.log(`❌ FAILED with ${modelName}: ${error.message.split('\n')[0]}`);
        }
        console.log('---');
    }
}

run();
