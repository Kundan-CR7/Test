export type ProductionSheetsPayload = {
  submittedAt: string;
  productionDate: string;
  shift: string;

  cncOperator: string;

  cncEntryCount: number;
  cncTotalHours: number;
  cncTotalSides: number;

  burma1Operator: string;
  burma1: number | null;

  burma2Operator: string;
  burma2: number | null;

  burma3Operator: string;
  burma3: number | null;

  burmaTotal: number;

  repairPerson: string;
  repairCount: number | null;
  repairNote: string;

  notes: string;
};

export const LOG_SHEET_HEADERS = [
  'Submitted At',
  'Production Date',
  'Shift',
  'CNC Operator',
  'CNC Entries',
  'CNC Total Hours',
  'CNC Total Sides',
  'Burma 1 Operator',
  'Burma 1',
  'Burma 2 Operator',
  'Burma 2',
  'Burma 3 Operator',
  'Burma 3',
  'Burma Total',
  'Repair Person',
  'Repair Count',
  'Repair Note',
  'Notes'
] as const;

export const DAILY_SHEET_HEADERS = [
  'Production Date',
  'Shift',
  'CNC Total Hours',
  'CNC Total Sides',
  'Burma Total',
  'CNC Entries',
  'Submissions',
  'Last Submitted At',
] as const;

function formatNullableNumber(value: number | null): string {
  return value === null ? '' : String(value);
}

function payloadToLogRow(payload: ProductionSheetsPayload): string[] {
  return [
    payload.submittedAt,
    payload.productionDate,
    payload.shift,

    payload.cncOperator,

    String(payload.cncEntryCount),
    String(payload.cncTotalHours),
    String(payload.cncTotalSides),

    payload.burma1Operator,
    formatNullableNumber(payload.burma1),

    payload.burma2Operator,
    formatNullableNumber(payload.burma2),

    payload.burma3Operator,
    formatNullableNumber(payload.burma3),

    String(payload.burmaTotal),

    payload.repairPerson,
    formatNullableNumber(payload.repairCount),

    payload.repairNote,
    payload.notes,
  ];
}

function logTabName(): string {
  return (
    process.env.GOOGLE_SHEET_LOG_TAB_NAME?.trim() ||
    process.env.GOOGLE_SHEET_TAB_NAME?.trim() ||
    'Logs'
  );
}

function dailyTabName(): string {
  return process.env.GOOGLE_SHEET_DAILY_TAB_NAME?.trim() || 'Daily';
}

function spreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_ID?.trim();
  if (!id) {
    throw new Error('GOOGLE_SHEETS_ID is not configured.');
  }

  return id;
}

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

function credentialsFromJsonEnv(): ServiceAccountCredentials | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as { client_email?: unknown }).client_email !== 'string' ||
    typeof (parsed as { private_key?: unknown }).private_key !== 'string'
  ) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key.',
    );
  }

  const record = parsed as { client_email: string; private_key: string };
  return {
    client_email: record.client_email.trim(),
    private_key: normalizePrivateKey(record.private_key),
  };
}

function serviceAccountCredentials(): ServiceAccountCredentials {
  const fromJson = credentialsFromJsonEnv();
  if (fromJson) return fromJson;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Configure GOOGLE_SERVICE_ACCOUNT_JSON, or GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.',
    );
  }

  return {
    client_email: clientEmail,
    private_key: normalizePrivateKey(privateKey),
  };
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

async function getSheetsClient() {
  const { google } = await import('googleapis');

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

type SheetsClient = Awaited<ReturnType<typeof getSheetsClient>>;

function parseSheetNumber(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseSheetCount(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSheetValueForKey(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') {
    const s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return s;
    }
    // Try common date string formats Sheets may return (e.g. '10/5/2025')
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return s;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    // Sheets/Excel serial date (recent dates have serial > ~44000)
    if (v > 30000) {
      // Epoch for Sheets serials is 1899-12-30; adjust for the 1900-02-29 phantom day (Excel bug)
      let adj = v;
      if (v > 60) adj = v - 1;
      const excelEpoch = Date.UTC(1899, 11, 30);
      const ms = Math.round(adj) * 86400000 + excelEpoch;
      const dt = new Date(ms);
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dt.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return String(v);
  }
  if (v instanceof Date && !isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const day = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return String(v).trim();
}

function quoteSheetTab(tabName: string): string {
  return `'${tabName.replace(/'/g, "''")}'`;
}

function columnLetter(columnCount: number): string {
  let index = columnCount;
  let letters = '';

  while (index > 0) {
    const remainder = (index - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    index = Math.floor((index - 1) / 26);
  }

  return letters;
}

async function ensureSheetTab(
  sheets: SheetsClient,
  spreadsheetIdValue: string,
  tabName: string,
) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetIdValue,
    fields: 'sheets.properties.title',
  });

  const exists = metadata.data.sheets?.some(
    (sheet) => sheet.properties?.title === tabName,
  );

  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetIdValue,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: tabName,
            },
          },
        },
      ],
    },
  });
}

async function ensureHeaders(
  sheets: SheetsClient,
  spreadsheetIdValue: string,
  tabName: string,
  headers: readonly string[],
) {
  const tab = quoteSheetTab(tabName);
  const lastColumn = columnLetter(headers.length);
  const headerRange = `${tab}!A1:${lastColumn}1`;
  // Fetch a bit wider to detect stale extra columns from prior schema (e.g. removed columns)
  const wideRange = `${tab}!A1:Z1`;
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetIdValue,
    range: wideRange,
  });

  const current = existing.data.values?.[0] ?? [];
  const expected = Array.from(headers);
  const prefixMatches = expected.every((h, i) => current[i] === h);
  const noExtraNonEmpty = current.slice(expected.length).every((v) => !v || String(v).trim() === '');
  if (prefixMatches && noExtraNonEmpty) {
    return;
  }

  // Write the current headers (overwrites A1 onward for our count)
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetIdValue,
    range: `${tab}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [expected],
    },
  });

  // Clear any cells beyond our current header length (removes stale labels e.g. after removing a middle column)
  const extraStart = columnLetter(expected.length + 1);
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetIdValue,
    range: `${tab}!${extraStart}1:Z1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [Array.from({ length: 26 - expected.length }, () => '')],
    },
  });
}

async function appendLogRow(
  sheets: SheetsClient,
  spreadsheetIdValue: string,
  tabName: string,
  payload: ProductionSheetsPayload,
) {
  await ensureSheetTab(sheets, spreadsheetIdValue, tabName);
  await ensureHeaders(sheets, spreadsheetIdValue, tabName, LOG_SHEET_HEADERS);

  const tab = quoteSheetTab(tabName);
  const lastColumn = columnLetter(LOG_SHEET_HEADERS.length);

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetIdValue,
    range: `${tab}!A:${lastColumn}`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [payloadToLogRow(payload)],
    },
  });
}

function buildDailyRow(
  payload: ProductionSheetsPayload,
  existing: unknown[] | undefined,
): unknown[] {
  if (!existing) {
    return [
      payload.productionDate,
      payload.shift,
      payload.cncTotalHours,
      payload.cncTotalSides,
      payload.burmaTotal,
      payload.cncEntryCount,
      1,
      payload.submittedAt,
    ];
  }

  return [
    payload.productionDate,
    payload.shift,
    parseSheetNumber(String(existing[2])) + payload.cncTotalHours,
    parseSheetNumber(String(existing[3])) + payload.cncTotalSides,
    parseSheetNumber(String(existing[4])) + payload.burmaTotal,
    parseSheetCount(String(existing[5])) + payload.cncEntryCount,
    parseSheetCount(String(existing[6])) + 1,
    payload.submittedAt,
  ];
}

async function upsertDailyTotals(
  sheets: SheetsClient,
  spreadsheetIdValue: string,
  tabName: string,
  payload: ProductionSheetsPayload,
) {
  await ensureSheetTab(sheets, spreadsheetIdValue, tabName);
  await ensureHeaders(sheets, spreadsheetIdValue, tabName, DAILY_SHEET_HEADERS);

  const tab = quoteSheetTab(tabName);

  const existingRows = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetIdValue,
    range: `${tab}!A2:H`,
  });

  const rows = existingRows.data.values ?? [];
  const matchIndex = rows.findIndex((row) => {
    const dateKey = normalizeSheetValueForKey(row ? row[0] : null);
    const shiftKey = normalizeSheetValueForKey(row ? row[1] : null);
    return dateKey === payload.productionDate && shiftKey === payload.shift;
  });

  const dailyRow = buildDailyRow(
    payload,
    matchIndex >= 0 ? rows[matchIndex] : undefined,
  );

  if (matchIndex >= 0) {
    const sheetRowNumber = matchIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetIdValue,
      range: `${tab}!A${sheetRowNumber}:H${sheetRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [dailyRow],
      },
    });
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetIdValue,
    range: `${tab}!A:H`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [dailyRow],
    },
  });
}

export async function appendProductionRow(payload: ProductionSheetsPayload) {
  const sheets = await getSheetsClient();
  const spreadsheetIdValue = spreadsheetId();
  const logTab = logTabName();
  const dailyTab = dailyTabName();

  await appendLogRow(sheets, spreadsheetIdValue, logTab, payload);
  await upsertDailyTotals(sheets, spreadsheetIdValue, dailyTab, payload);
}