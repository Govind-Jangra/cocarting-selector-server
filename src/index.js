import fetchHTML from './utils/fetchHTML.js';
import convertToMarkdown from './utils/convertToMarkdown.js';
import extractProductInfo from './utils/extractProductInfo.js';
import locateHTMLElements from './utils/locateHTMLElements.js';
import generateQuerySelectors from './utils/generateQuerySelectors.js';
import storeInMongoDB from './utils/storeInMongoDB.js';
import storeInMongoDBFirst from './utils/storeInMongoDBFirst.js';
import generateTwoMoreUrl from "./utils/generateTwoMoreUrl.js";
import connectDB from './config/db.js';
import runHTMLFileSearch from './utils/assistantOpenai.js';

import express from 'express';
import cors from 'cors';
import axios from 'axios';

connectDB();

const app = express();
app.use(cors("*"));
app.use(express.json());

/**
 * Function to process a single URL and extract product info.
 */
async function firstApproach(url) {
    const res = [];
    console.log("Processing URL:", url);
    
    // Fetch HTML for the current URL
    const response = await axios.post(process.env.BACKEND_URL, { url });
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
          const response = await axios.post(process.env.BACKEND_URL, { url: tempUrl });
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
    
    // Store the productInfo in MongoDB
    await storeInMongoDBFirst(productInfo);
    
    // Return the extracted product information
    return productInfo;
}

/**
 * API POST route to handle inputUrl and return product info.
 */
app.post('/product-info', async (req, res) => {
    const { inputUrl } = req.body;

    if (!inputUrl) {
        return res.status(400).json({ error: "inputUrl is required" });
    }

    try {
        const productInfo = await firstApproach(inputUrl);
        return res.json({ success: true, data: productInfo });
    } catch (error) {
        console.error("Error processing inputUrl:", error);
        return res.status(500).json({ error: "Failed to process the input URL" });
    }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
