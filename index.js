import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',  // Development
    'https://recipe-generator-rho.vercel.app/'  // Add your production frontend URL
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "vercel.live", "*.vercel.app"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "*.vercel.app"],
      connectSrc: ["'self'", "*.vercel.app", "vercel.live"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function validatePrompt(prompt) {
  return typeof prompt === 'string' && 
         prompt.length > 0 && 
         prompt.length < 4000;
}

app.post('/api/generate-recipe', async (req, res) => {
  console.log('Received request:', req.body);

  const { prompt } = req.body;

  if (!validatePrompt(prompt)) {
    console.log('Invalid prompt:', prompt);
    return res.status(400).json({ 
      error: 'Invalid prompt',
      details: 'Prompt must be a non-empty string less than 4000 characters'
    });
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;