#!/usr/bin/env node
/**
 * Test the deployed Vercel API from your machine.
 *
 * Usage:
 *   node scripts/test-deploy-api.mjs https://YOUR-APP.vercel.app YOUR_SUBMIT_API_KEY
 */

const [baseUrl, apiKey] = process.argv.slice(2);

if (!baseUrl || !apiKey) {
  console.error(
    'Usage: node scripts/test-deploy-api.mjs <vercel-url> <SUBMIT_API_KEY>',
  );
  console.error(
    'Example: node scripts/test-deploy-api.mjs https://production-entry.vercel.app my-secret-key',
  );
  process.exit(1);
}

const url = `${baseUrl.replace(/\/$/, '')}/api/append-production`;
const now = new Date();

const payload = {
  apiKey,
  submittedAt: now.toISOString(),
  productionDate: now.toISOString().slice(0, 10),
  shift: 'morning',
  cncEntryCount: 0,
  cncTotalHours: 0,
  cncTotalSides: 0,
  burma1Operator: '',
  burma1: null,
  burma2Operator: '',
  burma2: null,
  burma3Operator: '',
  burma3: null,
  burmaTotal: 0,
  repairPerson: '',
  repairCount: null,
  repairNote: '',
  notes: 'deploy API test — safe to delete',
  textSummary: 'deploy API connectivity test',
  cncEntriesJson: '[]',
};

console.log('POST', url);

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  },
  body: JSON.stringify(payload),
});

const text = await response.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = { raw: text };
}

console.log('Status:', response.status);
console.log('Body:', JSON.stringify(body, null, 2));

if (response.status === 200 && body.ok === true) {
  console.log('\nOK — check Logs and Daily tabs in Google Sheets.');
  process.exit(0);
}

console.log('\nFailed — see error code above and Vercel → Deployments → Functions → Logs');
process.exit(1);