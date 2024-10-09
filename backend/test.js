const axios = require('axios');

// Step 1: Get Destination ID for a city or hotel
const getDestinationId = async (cityName) => {
  const locationOptions = {
    method: 'GET',
    url: 'https://booking-com.p.rapidapi.com/v1/hotels/locations',
    params: {
      name: cityName,
      locale: 'en-gb'
    },
    headers: {
        'x-rapidapi-key': '6129e0a6d3mshe48064babebee75p1a26edjsna2d1b57133e1',
        'x-rapidapi-host': 'booking-com.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(locationOptions);
    console.log('Location search response:', response.data);

    if (response.data && response.data.length > 0) {
      const firstResult = response.data[0];
      return { dest_id: firstResult.dest_id, dest_type: firstResult.dest_type };  // Return both dest_id and dest_type
    } else {
      console.log('City not found.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching destination ID:', error);
    return null;
  }
};

// Step 2: Use the destination ID to search for hotels and prices
const getHotelsAndPrices = async (cityName) => {
  const destination = await getDestinationId(cityName);
  
  if (!destination) {
    console.log('No destination data available.');
    return;
  }

  const hotelSearchOptions = {
    method: 'GET',
    url: 'https://booking-com.p.rapidapi.com/v2/hotels/search',
    params: {
      dest_id: destination.dest_id,  // Use the dynamic destination ID
      order_by: 'popularity',
      checkout_date: '2025-01-19',
      filter_by_currency: 'USD',
      locale: 'en-gb',
      dest_type: destination.dest_type,  // Pass the correct destination type
      checkin_date: '2025-01-18',
      adults_number: '2',
      room_number: '1',
      units: 'metric'
    },
    headers: {
        'x-rapidapi-key': '6129e0a6d3mshe48064babebee75p1a26edjsna2d1b57133e1',
        'x-rapidapi-host': 'booking-com.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(hotelSearchOptions);
    const hotels = response.data.results;

    if (hotels && hotels.length > 0) {
      hotels.forEach(hotel => {
        console.log(`Hotel Name: ${hotel.name}`);
        
        if (hotel.priceBreakdown && hotel.priceBreakdown.grossPrice) {
          console.log(`Price: ${hotel.priceBreakdown.grossPrice.value} ${hotel.priceBreakdown.currency}`);
        } else {
          console.log('Price information is not available for this hotel.');
        }
      });
    } else {
      console.log('No hotels found.');
    }
  } catch (error) {
    console.error('Error fetching hotel prices:', error.response ? error.response.data : error.message);
  }
};

// Example: Search for hotels and prices in New York
getHotelsAndPrices('New York');