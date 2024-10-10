import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

function locateHTMLElements(html, searchText) {
    const dom = new JSDOM(html);
    const { document } = dom.window;
    
    const element = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === searchText);
    
    if (element) {
        function getSurroundingElements(el, limit = 15) {
            const elementsArray = [];
            let currentElement = el;
            
            for (let i = 0; i < limit && currentElement; i++) {
                elementsArray.push({
                    tagName: currentElement.tagName,
                    attributes: Object.fromEntries([...currentElement.attributes].map(attr => [attr.name, attr.value])),
                    textContent: currentElement.textContent.trim().substring(0, 100)
                });
                currentElement = currentElement.parentElement;
            }
            
            return elementsArray;
        }
        
        return getSurroundingElements(element);
    } else {
        console.log('No matching element found.');
        return null;
    }
}

export default locateHTMLElements;
