import { config } from 'dotenv';
config({ path: '.env.local' });

const API_KEY = process.env.CORE_API_KEY;
if (!API_KEY) {
  console.error("CORE_API_KEY is not set.");
  process.exit(1);
}

async function verifyEndpoint(endpointName: string, path: string) {
  const url = `https://api.core.ac.uk/v3${path}?q=machine%20learning&limit=1`;
  console.log(`\n=== Testing ${endpointName}: ${url} ===`);
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Top-level properties:', Object.keys(data));
      if (data.results && data.results.length > 0) {
        console.log('\nResults[0] properties:', Object.keys(data.results[0]));
        if (data.results[0].outputs) {
          console.log('\nResults[0].outputs property schemas:');
          data.results[0].outputs.forEach((output: any, index: number) => {
            console.log(`Output ${index} properties:`, Object.keys(output));
          });
        }
      } else {
        console.log('No results found.');
      }
    } else {
      console.error(await response.text());
    }
  } catch (err) {
    console.error(`Error querying ${endpointName}:`, err);
  }
}

async function run() {
  await verifyEndpoint('Works', '/search/works');
  await verifyEndpoint('Outputs', '/search/outputs');
}

run();
