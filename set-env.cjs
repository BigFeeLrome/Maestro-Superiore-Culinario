const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');

const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';

console.log('=== SET-ENV SCRIPT ===');
console.log('GEMINI_API_KEY from env:', process.env.GEMINI_API_KEY ? 'FOUND' : 'NOT FOUND');
console.log('Using key starting with:', apiKey.substring(0, 8) + '...');
console.log('Key length:', apiKey.length);

const content = `export const environment = {
  production: true,
  geminiApiKey: '${apiKey}'
};
`;

fs.writeFileSync(envFile, content);
console.log('Environment file written to:', envFile);
console.log('======================');
