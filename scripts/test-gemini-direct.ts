import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { GeminiProvider } from '../src/ai/providers/GeminiProvider';
import { AIConfig } from '../src/ai/config/AIConfig';

async function run() {
  console.log('GEMINI_API_KEY from config:', AIConfig.gemini.apiKey);
  const provider = new GeminiProvider();
  
  try {
    const response = await provider.analyzeDocument({
      prompt: 'Verify if you can read this message. Respond with JSON containing a success property set to true.',
      systemPrompt: 'You are a helpful assistant.',
      temperature: 0.1,
      maxTokens: 100
    });
    console.log('Gemini Success Response:', JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error('Gemini Failed:');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  }
}

run();
