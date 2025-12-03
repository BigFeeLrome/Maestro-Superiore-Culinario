const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');

const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';

const content = `export const environment = {
  production: true,
  geminiApiKey: '${apiKey}'
};
`;

fs.writeFileSync(envFile, content);
console.log('Environment file generated with API key:', apiKey ? 'present' : 'missing');
