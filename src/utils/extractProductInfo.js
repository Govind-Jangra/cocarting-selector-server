import axios from 'axios';

async function extractProductInfo(markdownContent) {
    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: `Extract the following details from the markdown content:\n - mrp_price\n - current_price\n - rating\n - title\n\nContent:\n${markdownContent}`,
            max_tokens: 500,
            temperature: 0.3,
        }, {
            headers: {
                'Authorization': `Bearer YOUR_API_KEY`,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data.choices[0].text;
        return JSON.parse(data);
    } catch (error) {
        console.error('Error extracting product information:', error);
        return null;
    }
}

export default extractProductInfo;
