import { config } from 'dotenv';
config({ path: '.env.local' });

async function checkPage() {
  const url = `https://api.core.ac.uk/v3/search/works?q=machine%20learning&page=1&limit=1`;
  console.log("Fetching:", url);
  try {
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${process.env.CORE_API_KEY}`, 'Content-Type': 'application/json' }});
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
checkPage();
