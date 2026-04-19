require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testKey() {
    const logFile = 'test-result.txt';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    // Clear previous log
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    const apiKey = process.env.GEMINI_API_KEY;
    log('Testing API Key...');
    log('Key length: ' + (apiKey ? apiKey.length : 'undefined'));
    log('Key first 4 chars: ' + (apiKey ? apiKey.substring(0, 4) : 'N/A'));

    if (!apiKey) {
        log('ERROR: GEMINI_API_KEY is not set in .env');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        log('Sending test prompt...');
        const result = await model.generateContent('Say "Hello World" if you work.');
        const response = await result.response;
        const text = response.text();

        log('SUCCESS! API Response: ' + text);
    } catch (error) {
        log('FAILURE: API Call failed.');
        log('Error message: ' + error.message);
        if (error.response) {
            log('Error status: ' + error.response.status);
        }
    }
}

testKey();
