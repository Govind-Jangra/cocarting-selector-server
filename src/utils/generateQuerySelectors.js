async function generateQuerySelectors(jsonData) {
    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: `Generate query selectors for the following product details:\n${JSON.stringify(jsonData, null, 2)}`,
            max_tokens: 200,
            temperature: 0.3,
        }, {
            headers: {
                'Authorization': `Bearer YOUR_API_KEY`,
                'Content-Type': 'application/json'
            }
        });

        const selectors = response.data.choices[0].text;
        return JSON.parse(selectors);
    } catch (error) {
        console.error('Error generating query selectors:', error);
        return 'Not Available';
    }
}

export default generateQuerySelectors;
