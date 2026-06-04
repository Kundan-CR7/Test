import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { google } from 'googleapis';
import {
  DAILY_SHEET_HEADERS,
  LOG_SHEET_HEADERS,
} from '../api/lib/sheets';

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

function normalizePrivateKey(rawKey: string): string {
  const key = rawKey.replace(/\\n/g, '\n').trim();

  if (key.includes('BEGIN PRIVATE KEY')) {
    return key;
  }

  const body = key.replace(/\s+/g, '');
  const lines = body.match(/.{1,64}/g) ?? [body];

  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
}

function serviceAccountCredentials() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY ?? '');

  if (!clientEmail || !privateKey) {
    throw new Error('Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in app/.env');
  }

  return { client_email: clientEmail, private_key: privateKey };
}

function quoteSheetTab(tabName: string): string {
  return `'${tabName.replace(/'/g, "''")}'`;
}

function isTestLogRow(row: string[]): boolean {
  const notes = row[17] ?? '';
  return notes.includes('API test row');
}

function isTestDailyRow(row: string[]): boolean {
  const hours = row[2] ?? '';
  const sides = row[3] ?? '';
  const burma = row[4] ?? '';
  const entries = row[5] ?? '';
  const submissions = row[6] ?? '';

  return (
    hours === '1.5' &&
    sides === '10' &&
    burma === '5' &&
    entries === '1'
    // note: submissions may be >1 if the test was run multiple times before clean
  );
}

async function getSheetId(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string,
): Promise<number> {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });

  const sheet = metadata.data.sheets?.find(
    (entry) => entry.properties?.title === tabName,
  );

  if (sheet?.properties?.sheetId === undefined) {
    throw new Error(`Tab not found: ${tabName}`);
  }

  return sheet.properties.sheetId;
}

async function deleteRowsByIndex(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetId: number,
  rowIndexes: number[],
) {
  const sorted = [...rowIndexes].sort((a, b) => b - a);

  if (sorted.length === 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: sorted.map((rowIndex) => ({
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      })),
    },
  });
}

const root = resolve(process.cwd());
loadEnvFile(resolve(root, '.env'));
loadEnvFile(resolve(root, 'app/.env'));

const spreadsheetId = process.env.GOOGLE_SHEETS_ID?.trim();
if (!spreadsheetId) {
  console.error('Missing GOOGLE_SHEETS_ID');
  process.exit(1);
}

const logTab =
  process.env.GOOGLE_SHEET_LOG_TAB_NAME?.trim() ||
  process.env.GOOGLE_SHEET_TAB_NAME?.trim() ||
  'Logs';
const dailyTab = process.env.GOOGLE_SHEET_DAILY_TAB_NAME?.trim() || 'Daily';

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountCredentials(),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

console.log('Scanning for test rows...');
console.log('Log tab:', logTab, `(expects "${LOG_SHEET_HEADERS[0]}" in A1)`);
console.log('Daily tab:', dailyTab);

let logDeleted = 0;
let dailyDeleted = 0;

try {
  const logSheetId = await getSheetId(sheets, spreadsheetId, logTab);
  const logValues = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTab(logTab)}!A2:R`,
  });

  const logRows = logValues.data.values ?? [];
  const logRowIndexes = logRows
    .map((row, index) => (isTestLogRow(row) ? index + 1 : -1))
    .filter((index) => index >= 1);

  await deleteRowsByIndex(sheets, spreadsheetId, logSheetId, logRowIndexes);
  logDeleted = logRowIndexes.length;
} catch (error) {
  console.warn('Log tab cleanup skipped:', error instanceof Error ? error.message : error);
}

try {
  const dailySheetId = await getSheetId(sheets, spreadsheetId, dailyTab);
  const dailyValues = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTab(dailyTab)}!A2:H`,
  });

  const dailyRows = dailyValues.data.values ?? [];
  const dailyRowIndexes = dailyRows
    .map((row, index) => (isTestDailyRow(row) ? index + 1 : -1))
    .filter((index) => index >= 1);

  await deleteRowsByIndex(sheets, spreadsheetId, dailySheetId, dailyRowIndexes);
  dailyDeleted = dailyRowIndexes.length;
} catch (error) {
  console.warn('Daily tab cleanup skipped:', error instanceof Error ? error.message : error);
}

console.log(`Done. Removed ${logDeleted} row(s) from Logs, ${dailyDeleted} row(s) from Daily.`);
if (logDeleted === 0 && dailyDeleted === 0) {
  console.log('No test rows matched. Test logs contain "API test row" in the Notes column.');
}