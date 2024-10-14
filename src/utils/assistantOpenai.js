import OpenAI from "openai";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "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",
});

async function runHTMLFileSearch(htmlFile) {
  const assistant = await openai.beta.assistants.create({
    name: "Product Info Extractor",
    instructions: `Objective:
The provided HTML file contains product information. Your task is to generate querySelectors to extract the following key details from the product page:

Product Title: Extract the exact title of the main product.
Current Price: Extract the current price with the currency, ensuring no extraction of multiple numbers.
MRP Price: Extract the original MRP price, ensuring no extraction of multiple numbers.
Product Rating: Extract the rating (only the numeric value, e.g., 4.0).
Image URL: Extract the main product image URL.
Instructions:

Analyze the HTML:

Review the HTML structure to identify classes, IDs, or tags related to the required elements.
Ensure the selected identifiers can be generalized across other product pages from the same website.
Identify and Test CSS Selectors:

Create specific CSS selectors (preferably using class names or IDs) for each product attribute.
Ensure the selectors are accurate, resilient to variations in HTML structure, and work across multiple product pages.
Validate the Selectors:

Test each querySelector to ensure it returns the expected values.
If a selector fails or returns null, retry with a different approach, such as inspecting alternative elements.
Output Format:
For each attribute, return a JSON object that includes:

The querySelector used for that element.
A valid flag indicating if the selector accurately extracted the data (true if successful, false if not).
Important Considerations:

Generalization: Avoid using overly specific selectors that may not work across all product pages.
Resilience: Selectors should handle minor changes in the HTML structure.
Verification: Ensure the selectors accurately target the specific data without capturing nested or irrelevant elements.
Example Response:

{
  "productTitle": {
    "value": "document.querySelector('<unique querySelector>').textContent.trim()",
    "valid": true
  },
  "currentPriceSelector": {
    "value": "document.querySelector('<unique querySelector>').textContent.trim()",
    "valid": true
  },
  "mrpPriceSelector": {
    "value": "document.querySelector('<unique querySelector>').textContent.trim()",
    "valid": true
  },
  "ratingSelector": {
    "value": "document.querySelector('<unique querySelector>').textContent.trim()",
    "valid": true
  },
  "imageSelector": {
    "value": "document.querySelector('<unique querySelector>').getAttribute('src')",
    "valid": true
  }
}
Testing and Execution:

Run each querySelector on the provided HTML. If the returned value is correct, set valid: true. If it fails, update the selector and rerun the test until a valid result is obtained.
You do not need to ask for input during this process. Simply rerun until you get the correct result for each element.`,
    model: "gpt-4o-mini", 
    tools: [{ type: "file_search" }],
  });

  
  const filePath = "./test.html";
  const htmlFileStream = fs.createReadStream(filePath);

  const rand=Math.random();
  let vectorStore = await openai.beta.vectorStores.create({
    name: "HTML Product Page Store" + rand.toString(),
  });

  await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, [htmlFileStream]);

  await openai.beta.assistants.update(assistant.id, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
  });

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: "Let's try to extract data from this file.",
      },
    ],
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id,
  });

  const messages = await openai.beta.threads.messages.list(thread.id, {
    run_id: run.id,
  });

  const responseMessage = messages.data.pop();
  console.log("Extracted Data: ", responseMessage.content);
}

runHTMLFileSearch().catch((error) => {
  console.error("Error occurred: ", error);
});
