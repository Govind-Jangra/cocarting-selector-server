import axios from "axios"
import dotenv from "dotenv"
dotenv.config();
async function fetchHTML(url) {
    

    try {
        const response = await axios.get(`https://api.scraperapi.com/?api_key=${process.env.SCRAPERAPI}&&url=${url}&&render=true`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HTML:', error);
        return null;
    } 
}

export default fetchHTML;