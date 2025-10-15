// scripts/webhook-setup.js
const https = require('https');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN || !WEBHOOK_URL) {
  console.error('ERROR: You must set BOT_TOKEN and WEBHOOK_URL environment variables.');
  console.error('Example (PowerShell): $env:BOT_TOKEN="123:ABC"; $env:WEBHOOK_URL="https://abc.ngrok.io/api/your-webhook-path"; npm run webhook:setup');
  process.exit(1);
}

const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(WEBHOOK_URL)}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Telegram response:', data);
    try {
      const parsed = JSON.parse(data);
      if (!parsed.ok) process.exitCode = 2;
    } catch (e) {}
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});
