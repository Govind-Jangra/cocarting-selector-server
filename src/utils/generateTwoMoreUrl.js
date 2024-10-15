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
async function generateTwoMoreUrl(markdownContent,url) {
  const systemPrompt = {
    role: 'system',
    content: `You are given the markdown of an e-commerce product page. Based on the product and structure, generate 3 additional URLs similar to the given page ${url}.
    Return in JSON format:
    {
        "moreUrl": ["url1", "url2", "url3"]
    }`,
  };

  const userPrompt = {
    role: 'user',
    content: markdownContent
  };

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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

export default generateTwoMoreUrl;
