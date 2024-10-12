import fetchHTML from './utils/fetchHTML.js';
import convertToMarkdown from './utils/convertToMarkdown.js';
import extractProductInfo from './utils/extractProductInfo.js';
import locateHTMLElements from './utils/locateHTMLElements.js';
import generateQuerySelectors from './utils/generateQuerySelectors.js';
import storeInMongoDB from './utils/storeInMongoDB.js';
import { inputArray } from './utils/inputURL.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import axios from 'axios';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}-${Date.now()}.txt`);
    }
});

const upload = multer({ storage });

const saveFile = (filename, content) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(tempDir, `${filename}-${Date.now()}.txt`);
        fs.writeFile(filePath, content, (err) => {
            if (err) reject(err);
            else resolve(filePath);
        });
    });
};

async function main() {
    for (const url of inputArray) {
        const response = await axios.post('http://localhost:5000/html', { url });
        const html = response.data;
        if (html) {
            await saveFile('html', html);

            const markdown = convertToMarkdown(html);
            await saveFile('markdown', markdown);

            const productInfo = await extractProductInfo(markdown);
            
            if (productInfo) {
                console.log('Extracted Product Info:', productInfo);
                
                await saveFile('productinfo', JSON.stringify(productInfo, null, 2));

                const title= productInfo.title;
                const rating= productInfo.rating;
                const mrp_price= productInfo.mrp_price;
                const current_price= productInfo.current_price;

                const titleElement = locateHTMLElements(html, title);
                const ratingElement = locateHTMLElements(html, rating);
                const mrpElement = locateHTMLElements(html, mrp_price);
                const currentElement = locateHTMLElements(html, current_price);

                await saveFile('titleElement', JSON.stringify(titleElement, null, 2));

                await saveFile('ratingElement', JSON.stringify(ratingElement, null, 2));
                await saveFile('mrpElement', JSON.stringify(mrpElement, null, 2));
                await saveFile('currentElement', JSON.stringify(currentElement, null, 2));
                
                const selectorObject={
                    "title": titleElement,
                    "rating": ratingElement,
                    "mrp_price": mrpElement,
                    "current_price": currentElement
                }
                const selectors = await generateQuerySelectors(selectorObject);
                console.log('Generated Query Selectors:', selectors);
                
                
                await saveFile('selectors', JSON.stringify(selectors, null, 2));
                
                const productData = {
                    website_name: new URL(url).hostname,
                    title: selectors.title,
                    mrp: selectors.mrp_price,
                    current: selectors.current_price,
                    rating: selectors.rating,
                };

                await storeInMongoDB(productData);
            }
        }
    }
};

setTimeout(() => {
    main();
}, 10);
