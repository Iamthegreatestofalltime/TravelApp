const axios = require('axios');

const GOOGLE_API_KEY = 'AIzaSyDT_SQPADgsefZIpn8nMXfmrcGgWsqnJ-s'; // Replace with your actual API key
const SEARCH_ENGINE_ID = '9239ca9aba3054f8d'; // Your Search Engine ID from Google

async function getImage(query) {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: SEARCH_ENGINE_ID,
                searchType: 'image', // Ensures you get image results
                q: query, // The search query
            }
        });

        const items = response.data.items;
        if (items && items.length > 0) {
            // Return the first image link
            return items[0].link;
        } else {
            return 'No images found.';
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        return 'Error fetching images.';
    }
}

// Example usage
getImage('plane going on new york building').then(imageUrl => {
    console.log('Image URL:', imageUrl);
});
