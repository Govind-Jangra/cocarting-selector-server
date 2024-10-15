import fetchHTML from './utils/fetchHTML.js';
import convertToMarkdown from './utils/convertToMarkdown.js';
import extractProductInfo from './utils/extractProductInfo.js';
import locateHTMLElements from './utils/locateHTMLElements.js';
import generateQuerySelectors from './utils/generateQuerySelectors.js';
import storeInMongoDB from './utils/storeInMongoDB.js';
import storeInMongoDBFirst from './utils/storeInMongoDBFirst.js';
import { inputArray } from './utils/inputURL.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import axios from 'axios';
import runHTMLFileSearch from './utils/assistantOpenai.js';
import generateTwoMoreUrl from "./utils/generateTwoMoreUrl.js";
import connectDB from './config/db.js';
import express from 'express';
import cors from "cors"
connectDB();

const app = express();
app.use(cors("*"));
app.use(express.json());

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



async function firstApproach() {
    for (const url of inputArray) {
        const res = [];
        console.log("Processing URL:", url);
        
        // Fetch HTML for the current URL
        const response = await axios.post('http://localhost:5000/html', { url });
        const html = response.data;
        
        // Convert HTML to markdown and generate more URLs
        const markdown = await convertToMarkdown(html);
        let moreUrls = await generateTwoMoreUrl(markdown, url);
        moreUrls = moreUrls.moreUrl;
        
        console.log("moreUrls", moreUrls);
        
        // Use Promise.all() to process both the original URL and the moreUrls in parallel
        const allUrls = [url, ...moreUrls];
        const htmlResponses = await Promise.all(
          allUrls.map(async (tempUrl) => {
            try {
              const response = await axios.post('http://localhost:5000/html', { url: tempUrl });
              const html = response.data;
              if (html) {
                console.log(`Processing HTML for URL: ${tempUrl}`);
                const selector = await runHTMLFileSearch(html);
                return selector; // Return the extracted selector
              }
            } catch (error) {
              console.error(`Error processing URL: ${tempUrl}`, error);
              return null; // In case of error, return null
            }
          })
        );
        
        // Filter out any null results and push valid selectors to `res`
        res.push(...htmlResponses.filter((selector) => selector !== null));
        
        // Process 'res' as needed (e.g., store or log the results)
        console.log("Selectors extracted:", res);
        
        // Initialize productInfo object
        const productInfo = {
          website_name: new URL(url).hostname,
          title: [],
          mrp: [],
          current: [],
          rating: [],
          image: []
        };
        
        // Populate productInfo from the res array
        res.forEach((selectors) => {
          if (selectors.productTitle) {
            productInfo.title.push(selectors.productTitle.toString());
          }
          if (selectors.currentPriceSelector) {
            productInfo.current.push(selectors.currentPriceSelector.toString());
          }
          if (selectors.mrpPriceSelector) {
            productInfo.mrp.push(selectors.mrpPriceSelector.toString());
          }
          if (selectors.imageSelector) {
            productInfo.image.push(selectors.imageSelector.toString());
          }
          if (selectors.ratingSelector) {
            productInfo.rating.push(selectors.ratingSelector.toString());
          }
        });
        console.log("productInfo,",productInfo)
        // Store the productInfo in MongoDB
        await storeInMongoDBFirst(productInfo);
        
    }
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

