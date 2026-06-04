import { createPrivateKey } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { appendProductionRow } from '../api/lib/sheets';

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\n/g, '\n');
    process.env[key] = value;
  }
}

const root = resolve(process.cwd());
loadEnvFile(resolve(root, '.env'));
loadEnvFile(resolve(root, 'app/.env'));

const required = [
  'GOOGLE_SHEETS_ID',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
];

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error('Missing env vars:', missing.join(', '));
  console.error('Add them to .env (repo root) or app/.env');
  process.exit(1);
}

function normalizePrivateKeyForCheck(rawKey: string): string {
  const key = rawKey.replace(/\\n/g, '\n').trim();
  if (key.includes('BEGIN PRIVATE KEY')) return key;
  const body = key.replace(/\s+/g, '');
  const lines = body.match(/.{1,64}/g) ?? [body];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
}

try {
  createPrivateKey(normalizePrivateKeyForCheck(process.env.GOOGLE_PRIVATE_KEY ?? ''));
} catch {
  console.error(
    'GOOGLE_PRIVATE_KEY is invalid or incomplete.\n' +
      'From credentials.json copy the full "private_key" value (with BEGIN/END lines),\n' +
      'as one line using \\n for newlines inside quotes, or run: node scripts/minify-credentials.mjs\n' +
      'and use GOOGLE_SERVICE_ACCOUNT_JSON on Vercel instead.',
  );
  process.exit(1);
}

const now = new Date();
const payload = {
  submittedAt: now.toISOString(),
  productionDate: now.toISOString().slice(0, 10),
  shift: 'morning',
  cncOperator: 'Test',
  cncEntryCount: 1,
  cncTotalHours: 1.5,
  cncTotalSides: 10,
  burma1Operator: 'Test',
  burma1: 5,
  burma2Operator: '',
  burma2: null,
  burma3Operator: '',
  burma3: null,
  burmaTotal: 5,
  repairPerson: '',
  repairCount: null,
  repairNote: '',
  notes: 'API test row — safe to delete',
};

console.log('Writing test row to Google Sheets...');
console.log('Log tab:', process.env.GOOGLE_SHEET_LOG_TAB_NAME || 'Logs');
console.log('Daily tab:', process.env.GOOGLE_SHEET_DAILY_TAB_NAME || 'Daily');

await appendProductionRow(payload);

console.log('Success. Check Logs (new row) and Daily (updated totals) in your spreadsheet.');