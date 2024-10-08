const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const axios = require('axios'); // For image fetching
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // For token generation
const JWT_SECRET = 'your_jwt_secret_key';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: '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' });

const GOOGLE_API_KEY = 'AIzaSyDT_SQPADgsefZIpn8nMXfmrcGgWsqnJ-s'; // Replace with your actual API key
const SEARCH_ENGINE_ID = '9239ca9aba3054f8d'; // Your Search Engine ID from Google

mongoose.connect('mongodb+srv://alexlotkov124:danielaronov@cluster0.q9mza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Define the User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
        return res.status(400).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        username,
        password: hashedPassword,
        email
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '6h' });

    res.status(201).json({ 
        message: 'User registered.', 
        token,
        userId: user._id
    });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
        message: 'Logged in successfully.',
        token,
        userId: user._id
    });
});

// Function to fetch image using Google Custom Search API
async function getImage(query) {
    try {
        console.log(`Fetching image for query: ${query}`);
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: SEARCH_ENGINE_ID,
                searchType: 'image', // Ensures you get image results
                q: query, // The search query
            }
        });

        console.log('Image fetch response:', response.data);
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
    const { days, locations, money } = req.body;

    // Validate locations array
    if (!Array.isArray(locations) || locations.length === 0) {
        console.error('Invalid locations provided:', locations);
        return res.status(400).json({ error: 'Invalid locations provided.' });
    }

    console.log(`Planning attractions for: ${locations.join(", ")} over ${days} days with a budget of ${money}`);

    const prompt = `Can you plan some attractions for me to see in ${locations.join(", ")} over the course of ${days} days with a budget of ${money}? 
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

        console.log('Chat completion response:', chatCompletion);
        
        // Log the raw message content before parsing
        const rawContent = chatCompletion.choices[0]?.message?.content;
        console.log('Raw AI response:', rawContent); // Log the raw content

        // Use regex to extract the JSON array from the response
        const jsonMatch = rawContent.match(/(\[.*?\])/s);
        const jsonString = jsonMatch ? jsonMatch[0] : "[]"; // Fallback to empty array if no match found

        console.log('Extracted JSON String:', jsonString); // Log the extracted JSON string

        // Remove comments from JSON string if any
        const cleanJsonString = jsonString.replace(/\/\/.*$/gm, '').trim();

        let attractions = JSON.parse(cleanJsonString || "[]");
        console.log('Parsed attractions:', attractions);
        
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

        console.log('Attractions with images:', attractionsWithImages);
        
        // Return the actual attractions in the response
        res.json({ attractions: attractionsWithImages });
    } catch (error) {
        console.error('Error during attraction planning:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});


// Endpoint to generate a schedule based on attractions
app.post('/generate-schedule', async (req, res) => {
    console.log("Generating schedule with request body:", req.body);
    const { days, attractions, tripType, ...otherDetails } = req.body;

    console.log('Received details for schedule generation:', req.body);

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
        console.log('Generated schedule:', schedule);
        res.json({ schedule });
    } catch (error) {
        console.error('Error during schedule generation:', error);
        res.status(500).json({ error: 'An error occurred while generating the schedule.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
