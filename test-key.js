const https = require('https');

const key = 'AIzaSyBH8e2a2o1Li2cg1JVMZbtwdk4AyDS-Ea0';

async function testModel(modelName) {
  return new Promise((resolve) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
    const data = JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] });
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[${modelName}] STATUS: ${res.statusCode}`);
        console.log(`[${modelName}] RESPONSE:`, body.slice(0, 300));
        resolve();
      });
    });
    req.on('error', (e) => resolve());
    req.write(data);
    req.end();
  });
}

(async () => {
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.5-flash');
  await testModel('gemini-1.5-pro');
})();
