const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: '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' });

const GOOGLE_API_KEY = 'AIzaSyDT_SQPADgsefZIpn8nMXfmrcGgWsqnJ-s';
const SEARCH_ENGINE_ID = '9239ca9aba3054f8d';
const JWT_SECRET = 'your_jwt_secret_key';

mongoose.connect('mongodb+srv://alexlotkov124:danielaronov@cluster0.q9mza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

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

async function getImage(query) {
    try {
        console.log(`Fetching image for query: ${query}`);
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: SEARCH_ENGINE_ID,
                searchType: 'image',
                q: query,
            }
        });

        console.log('Image fetch response:', response.data);
        const items = response.data.items;
        if (items && items.length > 0) {
            return items[0].link;
        } else {
            return 'No images found.';
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        return 'Error fetching images.';
    }
}

app.post('/get-trip-plan', async (req, res) => {
    console.log('Request body:', req.body);
    const { days, locations, money } = req.body;

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
        
        const rawContent = chatCompletion.choices[0]?.message?.content;
        console.log('Raw AI response:', rawContent);

        const jsonMatch = rawContent.match(/(\[.*?\])/s);
        const jsonString = jsonMatch ? jsonMatch[0] : "[]";

        console.log('Extracted JSON String:', jsonString);

        const cleanJsonString = jsonString.replace(/\/\/.*$/gm, '').trim();

        let attractions = JSON.parse(cleanJsonString || "[]");
        console.log('Parsed attractions:', attractions);
        
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
        
        res.json({ attractions: attractionsWithImages });
    } catch (error) {
        console.error('Error during attraction planning:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

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

app.post('/filter-hotels', async (req, res) => {
    const { hotels, attractions, budget, preferences } = req.body;
  
    const prompt = `Given the following list of hotels and attractions, filter the hotels based on these criteria:
    1. Price should be within the budget of ${budget} USD per night
    2. Proximity to attractions (consider the hotel's location compared to the attractions' locations)
    3. User preferences: ${preferences}
  
    Hotels: ${JSON.stringify(hotels)}
    Attractions: ${JSON.stringify(attractions)}
  
    Return a JSON array of the filtered hotels, including a brief explanation for each hotel on why it was selected. The structure should be:
    [
      {
        "name": "Hotel Name",
        "price": 100,
        "currency": "USD",
        "location": {
          "latitude": 40.7128,
          "longitude": -74.0060
        },
        "rating": 8.5,
        "reviewCount": 1000,
        "address": "123 Main St, City, Country",
        "photoUrl": "https://example.com/hotel-photo.jpg",
        "explanation": "This hotel was selected because..."
      },
      ...
    ]`;
  
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-8b-8192",
      });
      const filteredHotels = JSON.parse(chatCompletion.choices[0]?.message?.content || "[]");
      console.log(filteredHotels);
      res.json(filteredHotels);
    } catch (error) {
      console.error('Error filtering hotels:');
      res.status(500).json({ error: 'An error occurred while filtering hotels' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});