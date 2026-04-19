import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = {
    'tajmahal.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg',
    'kerala.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Kerala_backwater_20080218-11.jpg/1280px-Kerala_backwater_20080218-11.jpg',
    'hawamahal.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hawa_Mahal_2011.jpg/1280px-Hawa_Mahal_2011.jpg',
    'goa.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Palolem_Beach%2C_Goa.jpg/1280px-Palolem_Beach%2C_Goa.jpg',
    'varanasi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Varanasi_Ghats.jpg/640px-Varanasi_Ghats.jpg',
    'qutubminar.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Qutb_Minar_2011.jpg/640px-Qutb_Minar_2011.jpg',
    'gateway.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Mumbai_03-2016_30_Gateway_of_India.jpg/640px-Mumbai_03-2016_30_Gateway_of_India.jpg',
    'mysore.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Mysore_palace_illuminated.jpg/640px-Mysore_palace_illuminated.jpg',
    'goldentemple.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Golden_Temple_India.jpg/640px-Golden_Temple_India.jpg',
    'meenakshi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Meenakshi_Amman_Temple%2C_Madurai.jpg/640px-Meenakshi_Amman_Temple%2C_Madurai.jpg',
    'redfort.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Red_Fort_in_Delhi_03-2016_img3.jpg/640px-Red_Fort_in_Delhi_03-2016_img3.jpg',
    'hampi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Stone_Chariot_Hampi.jpg/640px-Stone_Chariot_Hampi.jpg'
};

const destDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};

async function downloadAll() {
    for (const [filename, url] of Object.entries(images)) {
        console.log(`Downloading ${filename}...`);
        try {
            await downloadImage(url, path.join(destDir, filename));
            console.log(`Success: ${filename}`);
        } catch (err) {
            console.error(`Error downloading ${filename}:`, err.message);
        }
    }
}

downloadAll();
