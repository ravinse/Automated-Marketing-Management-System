/**
 * Railway Cron Trigger Script
 * 
 * This script calls the backend cron endpoints to trigger scheduled tasks.
 * 
 * Usage:
 * 1. Set BACKEND_URL and CRON_SECRET in Railway environment variables
 * 2. Create a Railway cron service that runs: node cron-trigger.js
 * 3. Set schedule to every 5 minutes in Railway dashboard
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const CRON_SECRET = process.env.CRON_SECRET || '';

console.log('⏰ Railway Cron Job Starting...');
console.log(`📍 Backend URL: ${BACKEND_URL}`);
console.log(`🔐 Secret configured: ${CRON_SECRET ? 'Yes' : 'No'}`);

const endpoint = `${BACKEND_URL}/api/cron/all`;

// Parse URL
const url = new URL(endpoint);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname + url.search,
  method: 'GET',
  headers: {
    'x-cron-secret': CRON_SECRET
  }
};

console.log(`📞 Calling: ${endpoint}`);

const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Response Status: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      console.log('📦 Response:', JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200) {
        console.log('✅ Cron job completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Cron job failed with status:', res.statusCode);
        process.exit(1);
      }
    } catch (e) {
      console.log('📝 Response:', data);
      process.exit(res.statusCode === 200 ? 0 : 1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error calling cron endpoint:', error.message);
  process.exit(1);
});

// Set timeout
req.setTimeout(30000, () => {
  console.error('❌ Request timeout after 30 seconds');
  req.destroy();
  process.exit(1);
});

req.end();
