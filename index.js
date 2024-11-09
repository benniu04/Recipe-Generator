import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Make sure this route is properly defined
app.get('/', (req, res) => {
    res.json({ message: 'Recipe Generator API is running!' });
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

function validatePrompt(prompt) {
  return typeof prompt === 'string' && 
         prompt.length > 0 && 
         prompt.length < 1000 &&
         !/[<>]/.test(prompt);
}

// Recipe generation endpoint
app.post('/api/generate-recipe', async (req, res) => {
  const { prompt } = req.body;

  if (!validatePrompt(prompt)) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a culinary expert who provides detailed recipes based on user ingredients and dietary preferences.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4096,
      temperature: 0.8
    });

    const recipe = response.choices[0].message.content;
    res.json({ recipe });
    
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ 
      error: 'Failed to generate recipe',
      details: error.message 
    });
  }
});

// Start server with additional logging
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
