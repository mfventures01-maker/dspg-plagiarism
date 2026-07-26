import { config } from 'dotenv';
config({ path: '.env.local' });
import { CoreSearchService } from '../src/services/core/CoreSearchService';

async function run() {
  console.log("Key:", process.env.CORE_API_KEY?.substring(0, 5) + "...");
  const service = new CoreSearchService();
  try {
    const result = await service.search('machine learning', { limit: 1 });
    console.log("Success! Papers:", result.papers.length);
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
