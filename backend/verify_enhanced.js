const http = require('http');
const fs = require('fs');

const term = 'London';
console.log(`Searching for: ${term}`);

const req = http.get(`http://localhost:4000/api/places/search?q=${term}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        const json = JSON.parse(data);
        console.log('Keys:', Object.keys(json));
        console.log('Nearby Places Count:', json.nearbyPlaces?.length);
        console.log('Hotels Count:', json.hotels?.length);
        fs.writeFileSync('enhanced_result.json', data, 'utf8');
        console.log('Done.');
    });
});
