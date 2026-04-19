const http = require('http');
const fs = require('fs');

console.log('--- START ---');
const req = http.get('http://localhost:4000/api/places/search?q=Dubai', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        fs.writeFileSync('verification_result.json', data, 'utf8');
        console.log('--- END ---');
    });
});

req.on('error', (e) => {
    console.log('ERROR:', e.message);
    console.log('--- END ---');
});
