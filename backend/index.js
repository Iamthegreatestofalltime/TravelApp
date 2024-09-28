const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const axios = require('axios'); // For image fetching

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: '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' });

const GOOGLE_API_KEY = 'AIzaSyDT_SQPADgsefZIpn8nMXfmrcGgWsqnJ-s'; // Replace with your actual API key
const SEARCH_ENGINE_ID = '9239ca9aba3054f8d'; // Your Search Engine ID from Google

// Function to fetch image using Google Custom Search API
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

// Endpoint to get a trip plan and include images for each attraction
app.post('/get-trip-plan', async (req, res) => {
    console.log('Request body:', req.body);
    const { days, location, money } = req.body;

    const prompt = `Can you plan some attractions for me to see near or in ${location} over the course of ${days} days with a budget of ${money}? 
    Please return the result as a JSON object where each attraction includes the following fields:
    {
      name: "Attraction name",
      location: "Attraction location",
      cost: "Cost to visit the attraction"
    }
    
    NOTE: There should be slightly more attractions than necessary for the days a person is staying somewhere. You should have somewhere between 2-3 attractions per day.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama3-8b-8192",
        });

        let attractions = JSON.parse(chatCompletion.choices[0]?.message?.content || "[]");
        
        // Fetch images for each attraction
        const attractionsWithImages = await Promise.all(
            attractions.map(async (attraction) => {
                const imageUrl = await getImage(attraction.name);
                return {
                    ...attraction,
                    image: imageUrl,
                };
            })
        );

        console.log(attractionsWithImages);
        res.json({ attractions: attractionsWithImages });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.post('/generate-schedule', async (req, res) => {
    console.log("enter");
    const { days, attractions, tripType, ...otherDetails } = req.body;

    console.log(req.body);

    const prompt = `Generate a ${days}-day schedule for a ${tripType} trip, including the following attractions: ${attractions.join(', ')}. 
    Additional details: ${JSON.stringify(otherDetails)}. 
    Please provide a day-by-day itinerary.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama3-8b-8192",
        });

        const schedule = chatCompletion.choices[0]?.message?.content || "";
        console.log(schedule);
        res.json({ schedule });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while generating the schedule.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
