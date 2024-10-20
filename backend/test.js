const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

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
    const checkInDate = "2025-01-18"; // Check-in date
    const checkOutDate = "2025-01-19"; // Check-out date
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
        const formattedHotels = hotels.slice(0, 3).map(hotel => ({
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

app.listen(port, () => {
    console.log(`Testing backend running on port ${port}`);
});