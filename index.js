import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

app.post('/api/generate-recipe', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a culinary expert who provides detailed recipes based on user ingredients and dietary preferences." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 1,
    });

    const recipe = response.choices[0].message.content;
    res.json({ recipe });
    console.log("Fetched Recipe", response);
  } catch (error) {
    console.error("Error in API call:", error);
    res.status(500).json({ error: "Error generating recipe" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
