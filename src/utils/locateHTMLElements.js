import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

function locateHTMLElements(html, searchText) {
    const dom = new JSDOM(html);
    const { document } = dom.window;
    
    const normalizedSearchText = searchText.trim().toLowerCase();
    
    let elementsArray = [];

    // Check if the searchText is a URL (for img tags)
    const isURL = (str) => {
        try {
            new URL(str);
            return true;
        } catch (error) {
            return false;
        }
    };

    if (isURL(normalizedSearchText)) {
        // Search for img tags with matching src
        const imgElement = document.querySelector(`img[src="${searchText}"]`);
        
        if (imgElement) {
            elementsArray.push({
                tagName: imgElement.tagName,
                attributes: Object.fromEntries([...imgElement.attributes].map(attr => [attr.name, attr.value])),
                textContent: imgElement.textContent.trim().substring(0, 20) || "(no text content)"
            });

            let currentElement = imgElement.parentElement;
            for (let i = 0; i < 15 && currentElement; i++) {
                elementsArray.push({
                    tagName: currentElement.tagName,
                    attributes: Object.fromEntries([...currentElement.attributes].map(attr => [attr.name, attr.value])),
                    textContent: currentElement.textContent.trim().substring(0, 20)
                });
                currentElement = currentElement.parentElement;
            }

            return elementsArray;
        } else {
            console.log('No matching img element found.');
            return null;
        }
    } else {
        // Search for text-based elements
        const element = [...document.querySelectorAll('*')]
            .find(el => el.textContent.trim().toLowerCase() === normalizedSearchText);

        if (element) {
            function findDeepestElement(el) {
                let current = el;
                while (current.children.length > 0 && current.children[0].textContent.trim().toLowerCase() === normalizedSearchText) {
                    current = current.children[0];
                }
                return current;
            }

            const deepestElement = findDeepestElement(element);

            let currentElement = deepestElement;
            for (let i = 0; i < 15 && currentElement; i++) {
                elementsArray.push({
                    tagName: currentElement.tagName,
                    attributes: Object.fromEntries([...currentElement.attributes].map(attr => [attr.name, attr.value])),
                    textContent: currentElement.textContent.trim().substring(0, 20)
                });
                currentElement = currentElement.parentElement;
            }

            return elementsArray;
        } else {
            console.log('No matching element found.');
            return null;
        }
    }
}

export default locateHTMLElements;
