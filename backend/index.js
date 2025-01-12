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
const AMADEUS_API = 'o4jXgIvXCy7s3YvUgNtrtbMis7vXYeDr'
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

const getDestinationId = async (cityName) => {
    const locationOptions = {
        method: 'GET',
        url: 'https://booking-com.p.rapidapi.com/v1/hotels/locations',
        params: {
            name: cityName,
            locale: 'en-gb'
        },
        headers: {
            'x-rapidapi-key': '85c91089b0msh686addf0b8fc375p1419b1jsnbc1746df1099',
            'x-rapidapi-host': 'booking-com.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(locationOptions);
        console.log('Location search response:', response.data);

        if (response.data && response.data.length > 0) {
            const firstResult = response.data[0];
            return { dest_id: firstResult.dest_id, dest_type: firstResult.dest_type };
        } else {
            console.log('City not found.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching destination ID:', error);
        return null;
    }
};

app.post('/search-hotels', async (req, res) => {
    console.log('Received request:', req.body);

    const { city } = req.body; // Only need the city for this example
    const checkInDate = "2025-03-18"; // Check-in date
    const checkOutDate = "2025-03-19"; // Check-out date
    const adultsNumber = 2; // Number of adults
    const roomNumber = 1;

    try {
        const destination = await getDestinationId(city);

        if (!destination) {
            return res.status(404).json({ error: 'City not found' });
        }

        console.log("Doing hotel search");

        const options = {
          method: 'GET',
          url: 'https://booking-com.p.rapidapi.com/v2/hotels/search',
          params: {
            dest_id: destination.dest_id, // Use the valid destination ID
            order_by: 'popularity',
            checkout_date: checkOutDate,
            filter_by_currency: 'USD',
            locale: 'en-gb',
            dest_type: destination.dest_type,
            checkin_date: checkInDate,
            categories_filter_ids: 'class::2,class::4,free_cancellation::1',
            page_number: '0',
            adults_number: adultsNumber.toString(),
            room_number: roomNumber.toString(),
            units: 'metric'
          },
          headers: {
            'x-rapidapi-key': '85c91089b0msh686addf0b8fc375p1419b1jsnbc1746df1099',
            'x-rapidapi-host': 'booking-com.p.rapidapi.com'
          }
        };

        console.log("Hotel search options:", options.params);

        const response = await axios.request(options);
        const hotels = response.data.results;

        console.log(hotels);

        if (!hotels || hotels.length === 0) {
            console.log('No hotels found.');
            return res.status(404).json({ error: 'No hotels found' });
        }

        // Format the hotels and limit to 3 results
        const formattedHotels = hotels.slice(0, 50).map(hotel => ({
            name: hotel.name,
            price: hotel.priceBreakdown?.grossPrice?.value,
            currency: hotel.priceBreakdown?.currency,
            location: {
                latitude: hotel.latitude,
                longitude: hotel.longitude
            },
            rating: hotel.reviewScore,
            reviewCount: hotel.reviewCount,
            address: hotel.address,
            photoUrl: hotel.photoMainUrl
        }));

        console.log("Filtered Hotels:", formattedHotels);

        // Send the formatted hotels directly to the frontend
        res.json(formattedHotels);
    } catch (error) {
        console.error('Error in hotel search:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

app.post('/search-flights', async (req, res) => {
    const { originLocationCode, destinationLocationCode, departureDate, cabinClass, travelersCount } = req.body;

    // Validate input
    if (!originLocationCode || !destinationLocationCode || !departureDate || !travelersCount) {
        return res.status(400).json({ error: 'Missing required fields: originLocationCode, destinationLocationCode, departureDate, travelersCount.' });
    }

    // Construct the request payload for the Amadeus API
    const amadeusPayload = {
        currencyCode: "USD",
        originDestinations: [
            {
                id: "1",
                originLocationCode,
                destinationLocationCode,
                departureDateTimeRange: {
                    date: departureDate,
                    time: "10:00:00"
                }
            }
        ],
        travelers: Array.from({ length: travelersCount }, (_, i) => ({
            id: (i + 1).toString(),
            travelerType: "ADULT"
        })),
        sources: ["GDS"],
        searchCriteria: {
            maxFlightOffers: 10, // Adjust this as needed
            flightFilters: {
                cabinRestrictions: [
                    {
                        cabin: cabinClass || "ECONOMY",
                        coverage: "MOST_SEGMENTS",
                        originDestinationIds: ["1"]
                    }
                ]
            }
        }
    };

    try {
        const response = await axios.post('https://test.api.amadeus.com/v2/shopping/flight-offers', amadeusPayload, {
            headers: {
                Authorization: `Bearer 7MH5lerLIlIgoFlXc9uBCzjegGx0`, 
                'Content-Type': 'application/json'
            }
        });
        console.log("Amadeus API Response:", response.data);
        const flightOffers = response.data.data;

        if (!flightOffers || flightOffers.length === 0) {
            return res.status(404).json({ error: 'No flight offers found.' });
        }
        flightOffers.forEach(flight => {
            console.log(`Flight ID: ${flight.id}`);
            console.log(`Price:`, flight.price);  // Log the price object
            console.log(`Itineraries:`, flight.itineraries);  // Log the itineraries array
            console.log(`Pricing Options:`, flight.pricingOptions);  // Log the pricing options
        });
        
        // Format and return the flight offers
        const formattedFlights = flightOffers.map(flight => {
            const segments = flight.itineraries[0].segments;
            return {
                id: flight.id,
                price: flight.price.total,  // Total price
                currency: flight.price.currency,  // Currency
                departureTime: segments[0].departure.at,  // Departure time
                arrivalTime: segments[segments.length - 1].arrival.at,  // Arrival time
                airline: segments[0].carrierCode,  // Carrier code (can be used for airline name)
                flightNumber: segments[0].flightNumber,  // Flight number
                duration: segments[0].duration,  // Flight duration
                link: flight.links ? flight.links.self : null  // Flight details link (if available)
            };
        });

        res.status(200).json({ flights: formattedFlights });
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ error: 'An error occurred while fetching flight offers.' });
    }
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});