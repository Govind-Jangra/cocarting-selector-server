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
  const systemPrompt = {
    role: 'system',
    content: `Extract the following details from the markdown content of the product. 
    Provide the exact text for each field as they will be used for searching in the HTML. 
    Extract from the main product of the page that is likely to be present at the top .

    The required details are:
    
    Every field is a single line of text and should be extracted exactly as it appears in the markdown content and i will search it from html directly so take it from one section.
    Price should be extracted as a number with any currency symbols if present.
    - mrp_price 
    - current_price 
    - rating 
    - title .
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
    content: `Extract the following product details from this markdown content:\n\n${markdownContent}`
  };

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: "json_object" },
      messages: [systemPrompt, userPrompt],
    });

    const extractedData = response.choices[0].message.content.trim();
    return JSON.parse(extractedData);

  } catch (error) {
    console.error('Error extracting product information:', error);
    return null; 
  }
}

export default extractProductInfo;
