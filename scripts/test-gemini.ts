import dotenv from 'dotenv';
import { GeminiProvider } from '../src/ai/providers/GeminiProvider';
import { AIConfig } from '../src/ai/config/AIConfig';

dotenv.config({ path: '.env.local' });

async function main() {
  const provider = new GeminiProvider();
  console.log("Config loaded. Gemini enabled:", AIConfig.gemini.enabled);
  console.log("Gemini API Key prefix:", AIConfig.gemini.apiKey.substring(0, 10));

  try {
    const response = await provider.analyzeDocument({
      prompt: "Hello Gemini, respond with a valid JSON: { \"message\": \"ok\" }",
      systemPrompt: "You are a JSON assistant.",
      temperature: 0.1,
      maxTokens: 50
    });
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Error calling Gemini:", err);
  }
}

main();
