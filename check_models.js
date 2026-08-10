const http = require('http');
const https = require('https');

const key = Buffer.from('QVEuQWI4Uk42TEkxYzRaTkJ6MWlGQ2tJWnZiTzg3cEpWclZFdHp1a0dJT2Vad0stby1BTnc=', 'base64').toString();

async function testModel(modelName) {
  return new Promise((resolve) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: "Write a short 1-line story about a knight." }] }]
    });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ model: modelName, status: res.statusCode, data: data.slice(0, 150) });
      });
    });

    req.on('error', (err) => resolve({ model: modelName, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ model: modelName, error: 'TIMEOUT' }); });
    req.write(body);
    req.end();
  });
}

async function run() {
  const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const m of models) {
    const res = await testModel(m);
    console.log(`[TEST] ${res.model} -> Status: ${res.status || 'ERR'}, Data: ${res.data || res.error}`);
  }
}

run();
