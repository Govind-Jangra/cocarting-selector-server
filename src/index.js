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

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Set up Multer for temporary storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp'); // Save in the 'temp' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}-${Date.now()}.txt`);
    }
});

const upload = multer({ storage });

// Function to save content to a file using Multer
const saveFile = (filename, content) => {
    return new Promise((resolve, reject) => {
        const req = { body: {} }; // Fake request for multer
        const file = { originalname: filename };
        
        // Create a write stream for multer to handle
        fs.writeFile(path.join('temp', `${filename}-${Date.now()}.txt`), content, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

async function main() {
    for (const url of inputArray) {
        const html = await fetchHTML(url);
        if (html) {
            // Save HTML file
            await saveFile('html', html);

            const markdown = convertToMarkdown(html);
            // Save Markdown file
            await saveFile('markdown', markdown);

            const productInfo = await extractProductInfo(markdown);
            
            if (productInfo) {
                console.log('Extracted Product Info:', productInfo);
                
                // Save Product Info file
                await saveFile('productinfo', JSON.stringify(productInfo, null, 2));
                
                const elements = locateHTMLElements(html, productInfo.title);
                // Save Elements file
                await saveFile('elements', JSON.stringify(elements, null, 2));

                const selectors = await generateQuerySelectors(productInfo);
                console.log('Generated Query Selectors:', selectors);
                
                // Save Selectors file
                await saveFile('selectors', JSON.stringify(selectors, null, 2));
                
                const productData = {
                    website_name: new URL(url).hostname,
                    title: productInfo.title,
                    mrp: productInfo.mrp_price,
                    current: productInfo.current_price,
                    rating: productInfo.rating,
                };

                await storeInMongoDB(productData);
            }
        }
    }
};

setTimeout(() => {
    main();
}, 10);
