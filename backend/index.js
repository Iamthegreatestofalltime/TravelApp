const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: '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' });

app.post('/get-trip-plan', async (req, res) => {
  console.log('Request body:', req.body);
  const { days, location, money } = req.body;

  const prompt = `Can you plan some attractions for me to see near or in ${location} over the course of ${days} days with a budget of ${money}? 
  Please return the result as a JSON object where each attraction includes the following fields:
  {
    name: "Attraction name",
    location: "Attraction location",
    cost: "Cost to visit the attraction",
    imageUrl: "A relevant image URL for the attraction."  
    
    NOTE: There should be slightly more attractions than necessary for the days a person is staying somewhere.
  }`;

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

    const result = chatCompletion.choices[0]?.message?.content || "";
    console.log(result);
    res.json({ result });
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
