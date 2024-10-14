import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI with API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates query selectors for product info items.
 *
 * @param {Object} selectorObject - An object containing arrays of product info items.
 * @returns {Promise<Object>} - A promise that resolves to a JSON object containing query selectors.
 */
async function generateQuerySelectors(selectorObject) {
    const prompt = buildPrompt();
    const messages = createMessages(selectorObject, prompt);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: messages,
        });

        const selectors = response.choices[0].message.content.trim();
        return JSON.parse(selectors);
    } catch (error) {
        console.error('Error generating query selectors:', error);
        return 'Not Available';
    }
}

/**
 * Constructs the system prompt for OpenAI.
 *
 * @returns {string} - The formatted prompt string.
 */
function buildPrompt() {
    return `Your task is to generate unique query selectors for HTML product info items such as title, rating, MRP price, current price, and image URL. 

    You will receive an array for each product item where:
    1. The first element is the HTML element representing the product information (e.g., a span with the price).
    2. Each subsequent element is a parent element of the preceding one, moving up the DOM hierarchy.

    For each product info item, you need to:
    - Build the most specific query selector possible using unique attributes such as class, ID, or other reliable attributes.
    - Use parent elements in combination if needed to ensure that the selector is unique within the DOM.
    - **Do not** rely on "textContent" for identifying elements. Instead, use attributes and the DOM structure for reliable querying. For example do not use like a[aria-label='Slim Fit Polo T-Shirt with Logo Print'].
    - The query selector for the image should return the URL of the image (using the 'src' attribute).

    Provide a query selector for each product info item (title, rating, mrp_price, current_price,image) so that running it in the DOM console will return the exact text content.
    

    Your task is to generate unique query selectors only string so that i can put them in document.querySelector(<your_output>).textContent.trim() for each product info to get the content. 

    In case of image if I run the querySelector then I should get the url of the image

    Return the output in this JSON format:
    {
      "mrp_price": "querySelector_for_mrp_price",
      "current_price": "querySelector_for_current_price",
      "rating": "querySelector_for_rating",
      "title": "querySelector_for_title"
      "image": "querySelector_for_image"
    }`;
}

/**
 * Creates messages for the OpenAI API call.
 *
 * @param {Object} selectorObject - An object containing arrays of product info items.
 * @param {string} prompt - The system prompt for OpenAI.
 * @returns {Array<Object>} - An array of message objects.
 */
function createMessages(selectorObject, prompt) {
    return [
        { role: 'system', content: prompt },
        { role: 'user', content: `The following are arrays representing HTML elements for each product info item (title, rating, mrp_price, current_price,image). Please use this structure to generate unique query selectors for each item: ${JSON.stringify(selectorObject)}` },
    ];
}

export default generateQuerySelectors;
