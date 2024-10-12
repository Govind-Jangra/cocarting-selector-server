import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

function locateHTMLElements(html, searchText) {
    const dom = new JSDOM(html);
    const { document } = dom.window;
    
    const normalizedSearchText = searchText.trim().toLowerCase();

        const element = [...document.querySelectorAll('*')]
            .find(el => el.textContent.trim().toLowerCase() === normalizedSearchText);

    
    if (element) {
        function findDeepestElement(el) {
            let current = el;
            while (current.children.length > 0 &&  Boolean(current.children[0].textContent) && current.children[0].textContent.trim().toLowerCase() === normalizedSearchText) {
                current = current.children[0];
            }
            return current;
        }

        const deepestElement = findDeepestElement(element);

            const elementsArray = [];
            let currentElement = deepestElement;

            for (let i = 0; i < 15; i++) { 
                if (currentElement) {
                    elementsArray.push({
                        tagName: currentElement.tagName,
                        attributes: Object.fromEntries([...currentElement.attributes].map(attr => [attr.name, attr.value])),
                        textContent: currentElement.textContent.trim().substring(0, 20)
                    });
                    currentElement = currentElement.parentElement;
                }
            }
        
        return elementsArray;
    } else {
        console.log('No matching element found.');
        return null;
    }
}

export default locateHTMLElements;
