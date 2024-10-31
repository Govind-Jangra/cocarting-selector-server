# Cocarting Query Selector

# Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Endpoints](#endpoints)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Usage](#usage)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Govind-Jangra/cocarting-selector-server
   ```
2. Navigate into the project directory:

   ```bash
   cd cocarting-selector-server
   ```
3. Install dependencies:

   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory and define the following environment variables:

```plaintext
OPENAI_API_KEY=your_openai_api_key
MONGO_URI=your_mongodb_uri
BACKEND_URL=your_backend_url
PORT=5000
SCRAPERAPI=your_scraperapi_key
```

## Scripts

### Start the Development Server

Use `nodemon` to run the server in development mode:

```bash
npm run dev
```

## Endpoints

### POST /product-info

Processes a URL and extracts product information such as title, price, rating, and images.

- **Request Body**:

  ```json
  {
    "inputUrl": "https://example.com/product"
  }
  ```
- **Response**:

  - Success: Returns the extracted product information.
  - Failure: Returns an error message if the processing fails.

### POST /selector

Fetches the product information stored in MongoDB based on the `website_name`.

- **Request Body**:

  ```json
  {
    "website_name": "example.com"
  }
  ```
- **Response**:

  - Success: Returns the product information if found.
  - Not Found: Returns an error if the product for the specified website does not exist.

### GET /

Base route to confirm the API is running.

## Technologies Used

- **Node.js**: JavaScript runtime.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for data storage.
- **Puppeteer**: Headless browser for web scraping.
- **OpenAI API**: For AI-powered text generation.
- **dotenv**: Loads environment variables from `.env` file.
- **CORS**: Handles Cross-Origin Resource Sharing.
- **Multer**: Middleware for handling file uploads.

## Project Structure

```
├── src
│   ├── config              # Database configuration
│   ├── Model               # MongoDB models
│   ├── utils               # Helper functions
│   │   └── convertToMarkdown.js
│   │   └── storeInMongoDBFirst.js
│   │   └── generateTwoMoreUrl.js
│   │   └── assistantOpenai.js
│   │   └── fetchHTML.js
│   └── index.js            # Main server file
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project metadata and dependencies
├── README.md               # Documentation file
```

## Usage

1. Ensure MongoDB is running and the environment variables are properly configured.
2. Start the server:

   ```bash
   npm run dev
   ```
3. Use an API client like Postman to interact with the endpoints.

### Example Workflow

- Send a `POST` request to `/product-info` with a URL to scrape product data.
- Check MongoDB to see if the data is stored.
- Use `/selector` to retrieve stored product data by providing a `website_name`.
