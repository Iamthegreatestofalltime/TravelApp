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
      'x-rapidapi-key': '85c91089b0msh686addf0b8fc375p1419b1jsnbc1746df1099', // Replace with your actual API key
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

  const { city, attractions, budget } = req.body;
  const checkInDate = "2024-10-16"; // Check-in date
  const checkOutDate = "2024-10-23"; // Check-out date
  const adultsNumber = 2;             // Number of adults
  const roomNumber = 1; 
  const preferences = "none";

  try {
    const destination = await getDestinationId(city);
    
    if (!destination) {
      return res.status(404).json({ error: 'City not found' });
    }

    console.log("doing hotel search");

    const hotelSearchOptions = {
      method: 'GET',
      url: 'https://booking-com.p.rapidapi.com/v2/hotels/search',
      params: {
        dest_id: destination.dest_id,
        order_by: 'popularity',
        checkout_date: checkOutDate,
        filter_by_currency: 'USD',
        locale: 'en-gb',
        dest_type: destination.dest_type,
        checkin_date: checkInDate,
        adults_number: adultsNumber,
        room_number: roomNumber,
        units: 'metric'
      },
      headers: {
        'x-rapidapi-key': '85c91089b0msh686addf0b8fc375p1419b1jsnbc1746df1099', // Replace with your actual API key
        'x-rapidapi-host': 'booking-com.p.rapidapi.com'
      }
    };

    console.log("got response");

    const response = await axios.request(hotelSearchOptions);
    const hotels = response.data.results;

    console.log(hotels);

    if (!hotels || hotels.length === 0) {
      console.log('No hotels found.');
      return res.status(404).json({ error: 'No hotels found' });
    }

    const formattedHotels = hotels.map(hotel => ({
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

    console.log(formattedHotels);

    // Forward the formatted hotels to the main backend for filtering
    const mainBackendResponse = await axios.post('http://192.168.5.45:3000/filter-hotels', {
      hotels: formattedHotels,
      attractions: attractions,
      budget: budget,
      preferences: preferences
    });

    // Send the filtered hotels from the main backend to the frontend
    res.json(mainBackendResponse.data);
  } catch (error) {
    console.error('Error in hotel search or filtering:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(port, () => {
  console.log(`Testing backend running on port ${port}`);
});