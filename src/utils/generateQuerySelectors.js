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
            model: "gpt-4o-mini",
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
    return `I want you to extract a unique query selector for each product info item: title, rating, mrp_price, and current_price. 
    The provided object will contain an array where:
    1. The first object is the exact element (e.g., a span with the price).
    2. The second object is the parent of the first element.
    3. The third object is the parent of the second element, and so on.
    
    For each object in the array:
    - Select a unique class, id, or any other reliable attribute from each object to build the most specific query selector possible.
    - Combine this with parent elements to ensure uniqueness in the DOM.

    Provide a query selector for each product info item (title, rating, mrp_price, current_price) so that running it in the DOM console will return the exact text content.

    Return the output in this JSON format:
    {
      "mrp_price": "querySelector_for_mrp_price",
      "current_price": "querySelector_for_current_price",
      "rating": "querySelector_for_rating",
      "title": "querySelector_for_title"
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
        { role: 'user', content: `The following are arrays representing HTML elements for each product info item (title, rating, mrp_price, current_price). Please use this structure to generate unique query selectors for each item: ${JSON.stringify(selectorObject)}` },
    ];
}

export default generateQuerySelectors;
