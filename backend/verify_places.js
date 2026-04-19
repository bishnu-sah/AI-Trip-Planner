const http = require('http');

const url = 'http://localhost:4000/api/places/search?q=Tokyo';

console.log(`Fetching ${url}...`);

http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('Response JSON:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Raw Data (Not JSON):', data);
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
