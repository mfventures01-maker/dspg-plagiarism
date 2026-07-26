import dotenv from 'dotenv';
import { NVIDIAProvider } from '../src/ai/providers/NVIDIAProvider';
import { AIConfig } from '../src/ai/config/AIConfig';

dotenv.config({ path: '.env.local' });

async function main() {
  const provider = new NVIDIAProvider();
  console.log("Config loaded. NVIDIA enabled:", AIConfig.nvidia.enabled);
  console.log("NVIDIA API Key prefix:", AIConfig.nvidia.apiKey.substring(0, 10));

  try {
    const response = await provider.analyzeDocument({
      prompt: "Hello NVIDIA, respond with a valid JSON: { \"message\": \"ok\" }",
      systemPrompt: "You are a JSON assistant.",
      temperature: 0.1,
      maxTokens: 50
    });
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Error calling NVIDIA:", err);
  }
}

main();
