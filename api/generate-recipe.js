import OpenAI from 'openai';
import dotenv from 'dotenv';
import { authenticate } from "$lib/firebase/firebase";

dotenv.config(); // Load environment variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is set in Vercel
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body; // Extract the prompt from the request body

  // Validate the prompt
  if (!validatePrompt(prompt)) {
    return res.status(400).json({
      error: 'Invalid prompt',
      details: 'Prompt must be a non-empty string less than 4000 characters',
    });
  }

  try {
    // Call the OpenAI API to generate a recipe
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Ensure this model is available in your OpenAI account
      messages: [
        {
          role: 'system',
          content: 'You are a culinary expert who provides detailed recipes based on user ingredients and dietary preferences.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.8,
    });

    const recipe = response.choices[0].message.content; // Extract the recipe from the response

    // Set the cookie after generating the recipe
    const user = authenticate.currentUser;
    if (user) {
      const tokenValue = await user.getIdToken(); // Get the user's ID token
      res.cookie('__vercel_live_token', tokenValue, {
        sameSite: 'None',
        secure: true,
      });
    }

    res.status(200).json({ recipe }); // Send the recipe back as a JSON response

  } catch (error) {
    console.error('Error generating recipe:', error); // Log the error for debugging
    res.status(500).json({
      error: 'Failed to generate recipe',
      details: error.message || 'An unknown error occurred',
    });
  }
}

// Function to validate the prompt
function validatePrompt(prompt) {
  return typeof prompt === 'string' && prompt.length > 0 && prompt.length < 4000;
}
