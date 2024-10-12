import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract product information from markdown content using OpenAI API.
 *
 * @param {string} markdownContent - The markdown content containing product details.
 * @returns {Promise<object|null>} - A promise that resolves to an object containing the extracted product information, or null if an error occurs.
 */
async function extractProductInfo(markdownContent) {
  // Define the system and user prompts for the OpenAI API call
  const systemPrompt = {
    role: 'system',
    content: `Extract the following details from the markdown content of the product. 
    Provide the exact text for each field as they will be used for searching in the HTML. 
    Focus on the main product section area. The required details are:
    Every field is a single line of text and should be extracted exactly as it appears in the markdown content.
    Price should be extracted as a number with any currency symbols if present.
    - mrp_price 
    - current_price 
    - rating (numeric value only)
    - title (exact title).
    - img_url (url link for main product)
    Return the result in JSON format with the fields: 
    - mrp_price 
    - current_price 
    - rating 
    - img_url
    - title.`,
  };

  const userPrompt = {
    role: 'user',
    content: `Markdown for product page of eCommerce website:\n${markdownContent}`,
  };

  try {
    // Call the OpenAI API for a chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: "json_object" },
      messages: [systemPrompt, userPrompt],
    });

    // Parse and return the JSON result from the response
    const extractedData = response.choices[0].message.content.trim();
    return JSON.parse(extractedData);

  } catch (error) {
    console.error('Error extracting product information:', error);
    return null;  // Return null if an error occurs
  }
}

export default extractProductInfo;
