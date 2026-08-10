const https = require('https');

const key = Buffer.from('QVEuQWI4Uk42TEkxYzRaTkJ6MWlGQ2tJWnZiTzg3cEpWclZFdHp1a0dJT2Vad0stby1BTnc=', 'base64').toString();
const modelName = 'gemini-3.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

const prompt = `
Role: You are a Dark Fantasy TRPG Game Master and Novelist.
Character: "야스킹 호준" (인간 전사)
Target Enemy: "핏빛 고블린 척후병 A" (HP: 15)

Action Execution Result:
- Player Action: "신라청전"
- Action Category: DIRECT_ATTACK
- Dice Roll: D20 = 14 (Stat Bonus: +2, Total: 16, DC: 10)
- Outcome: SUCCESS
- Damage Dealt: 6 | Heal Amount: 0
- Enemy Counter Attack: MISSED/DODGED

Instructions:
1. Write vivid, dramatic Korean dark-fantasy story paragraphs for BOTH player action and enemy outcome.
Return ONLY valid JSON matching this schema:
{
  "playerNarration": "...",
  "enemyNarration": "..."
}
`;

const body = JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { responseMimeType: "application/json" }
});

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', b));
});

req.write(body);
req.end();
