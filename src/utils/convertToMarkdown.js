import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown';
import { JSDOM } from 'jsdom';

function convertToMarkdown(html) {
    const dom = new JSDOM(html);
    const markdown = convertHtmlToMarkdown(html, { overrideDOMParser: new dom.window.DOMParser() });
    return markdown;
}

export default convertToMarkdown;
