import { fileURLToPath } from 'url';
import path from 'path';
import createBrowserless from 'browserless';
import getHTML from 'html-get';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize a single browserless instance
const browserlessFactory = createBrowserless();

// Close the browserless instance when the Node.js process exits
process.on('exit', () => {
    console.log('Closing resources...');
    browserlessFactory.close();
});

async function fetchHTML(url) {
    // Create a browser context inside Chromium process
    const browserContext = browserlessFactory.createContext();
    const getBrowserless = () => browserContext;

    try {
        // Fetch the HTML content using html-get with 'prerender' mode explicitly set
        const { html } = await getHTML(url, {
            getBrowserless,
            prerender: true // Forces the prerendering strategy for JavaScript-heavy sites
        });
        return html;
    } catch (error) {
        console.error('Error fetching HTML:', error);
        return null;
    } finally {
        // Destroy the browser context after use
        await getBrowserless((browser) => browser.destroyContext());
    }
}

export default fetchHTML;