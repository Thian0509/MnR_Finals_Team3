const cron = require('node-cron');
const axios = require('axios');

const CRON_URL = 'http://localhost:3000/api/cron/check-trips'; // Renamed for clarity

console.log('🕒 Cron job scheduler started. Will call the API every 30 seconds.');

// Schedule a task to run every 30 seconds.
cron.schedule('*/30 * * * * *', async () => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] Running cron job: Calling ${CRON_URL}`);
  
  try {
    const response = await axios.get(CRON_URL);
    console.log(`[CRON] API Response: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error('[CRON] Error calling API endpoint:', error.message);
  }
});