// Check API key and list available models
require('dotenv/config');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not set');
  process.exit(1);
}

console.log('Checking API key access...\n');
console.log('API Key:', apiKey.substring(0, 20) + '...');

// Try to list models using REST API
const https = require('https');

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const models = JSON.parse(data);
        console.log('\n✅ API Key is valid!');
        console.log('\nAvailable models:');
        if (models.models && models.models.length > 0) {
          models.models.forEach(model => {
            if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
              console.log(`  ✅ ${model.name} - Supports generateContent`);
            }
          });
        } else {
          console.log('  No models found');
        }
      } catch (e) {
        console.log('\nResponse:', data);
      }
    } else {
      console.error(`\n❌ Error ${res.statusCode}:`);
      console.error(data);
      if (res.statusCode === 403) {
        console.error('\n⚠️  API key might not have Generative AI API enabled.');
        console.error('   Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
        console.error('   Enable "Generative Language API" for your project.');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();

