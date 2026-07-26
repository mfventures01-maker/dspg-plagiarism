import { config } from 'dotenv';
config({ path: '.env.local' });

async function checkOutputs() {
  const url = `https://api.core.ac.uk/v3/search/works?q=machine%20learning&limit=1`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${process.env.CORE_API_KEY}`, 'Content-Type': 'application/json' }});
  const data = await response.json();
  if (data.results && data.results.length > 0 && data.results[0].outputs) {
    console.log('Outputs array length:', data.results[0].outputs.length);
    console.log('Output 0 type:', typeof data.results[0].outputs[0]);
    console.log('Output 0 value:', JSON.stringify(data.results[0].outputs[0], null, 2));
  } else {
    console.log('No outputs found');
  }
}
checkOutputs();
