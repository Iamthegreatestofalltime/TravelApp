const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: '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' });

app.post('/get-trip-plan', async (req, res) => {
  const { days, location, money } = req.body;

  const prompt = `can you plan some attractions for me to see attractions near or in ${location} over the course of ${days} with a budget of ${money}, return the query in a format by listing the attractions by bullet point back to back here is an example of the possible return you could give me '•big ben •tower bridge •eye of london •buckingham palace'`;

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
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.post('/generate-schedule', async (req, res) => {
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