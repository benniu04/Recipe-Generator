import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Make sure this route is properly defined
app.get('/', (req, res) => {
    res.json({ message: 'Recipe Generator API is running!' });
});

// Add some console logging to help debug
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

// Recipe generation endpoint
app.post('/api/generate-recipe', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
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
      temperature: 0.8 // Slightly reduced for more focused responses
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
    console.log('Available routes:');
    console.log('  GET  /');
    console.log('  POST /api/generate-recipe');
});
