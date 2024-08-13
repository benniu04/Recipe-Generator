import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

const runPrompt = async () => {
    const prompt = "Give me a recipe based on the ingredients beef, lettuce, and carrots";

    try {
        const response = await openai.completions.create({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 100,  // Adjusted to provide a more meaningful response
            temperature: 1,
        });

        console.log(response.choices[0].text.trim());
    } catch (error) {
        console.error("Error in API call:", error);
    }
};

runPrompt();
