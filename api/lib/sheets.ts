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

// =============================================================================
// Raw per-record logging to separate tab (Logs_Raw) + Daily derivation from raw rows
// =============================================================================

export const RAW_LOG_HEADERS = [
  "Date",
  "Month",
  "Shift",
  "MachineID",
  "Operator",
  "Part_ID",
  "PartSide",
  "IdealCycle_sec",
  "MachineCycle_sec",
  "TotalParts",
  "ShiftStart",
  "ShiftEnd",
  "Downtime_PowerCut_min",
  "Downtime_MaterialShortage_min",
  "Downtime_MachineBreakdown/setting_min",
  "Downtime_Others_min",
  "TotalDowntime_min",
  "DowntimeReason",
  "Notes",
  "PlannedTime_min",
  "RunTime_min",
  "MachineRuntime_min",
  "IdealMachineTime_min",
  "CycleDiff_pct",
  "TimeFlag",
  "Availability_pct",
  "Performance_pct",
  "Quality_pct",
  "OEE_like",
  "Parts_per_Hour",
  "TotalProduction_hr"
] as const;

export type ProductionLogRow = {
  [K in typeof RAW_LOG_HEADERS[number]]: string | number | null;
};

function rawLogTabName(): string {
  return (
    process.env.GOOGLE_SHEET_RAW_LOG_TAB_NAME?.trim() ||
    'Logs_Raw'
  );
}

function formatShiftTime(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string') {
    const v = value.trim();
    if (v.includes('-') || v.includes('/')) {
      // Full datetime string (e.g. "09-05-2026 8:30" for Burma/Repair Shift* per historical).
      // Keep as-is (pre-formatted by builder with correct date + non-padded hour for single-digit).
      return v;
    }
    // Pure time normalization for CNC etc: "8:30", "08:30", "19:00:00" -> "08:30" (padded hour)
    const m = v.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (m) {
      const h = m[1].padStart(2, '0');
      const min = m[2];
      return `${h}:${min}`;
    }
    // Try to extract time from a full datetime-like string
    const dt = v.match(/(\d{1,2}):(\d{2})/);
    if (dt) {
      const h = dt[1].padStart(2, '0');
      const min = dt[2];
      return `${h}:${min}`;
    }
    return v;
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    const h = String(value.getHours()).padStart(2, '0');
    const m = String(value.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Handle Excel/Sheets time serial fraction (e.g. 0.7916666667 ≈ 19:00)
    const fraction = value - Math.floor(value);
    const totalMinutes = Math.round(fraction * 24 * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return String(value);
}

function rawRowToValues(row: ProductionLogRow): (string | number | Date)[] {
  const dateLikeFields = new Set([
    'Date', 'Month', 'ShiftStart', 'ShiftEnd'
  ]);
  return RAW_LOG_HEADERS.map((header, index) => {
    let value: any = (row as any)[header];

    if (header === 'Date') {
      value = (row as any).Date || value || '';
    }

    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (dateLikeFields.has(header)) {
      if (header === 'ShiftStart' || header === 'ShiftEnd') {
        value = formatShiftTime(value);
        return "'" + value;  // prefix ' to force text in Google Sheets (prevents auto date parsing to serial)
      } else if (header === 'Date' || header === 'Month') {
        value = String(value);
        return "'" + value;  // prefix ' to force text (prevents serials)
      } else {
        value = String(value);
      }
    }
    return value;
  });
}

async function appendRawLogRows(
  sheets: SheetsClient,
  spreadsheetIdValue: string,
  records: ProductionLogRow[],
) {
  if (!records || records.length === 0) return;

  const tabName = rawLogTabName();
  await ensureSheetTab(sheets, spreadsheetIdValue, tabName);
  await ensureHeaders(sheets, spreadsheetIdValue, tabName, RAW_LOG_HEADERS);

  const tab = quoteSheetTab(tabName);
  const lastColumn = columnLetter(RAW_LOG_HEADERS.length);

  const values = records.map((r) => rawRowToValues(r));

  // Log the final row array(s) and verify formatting (as required)
  console.log('=== Final raw production log row arrays (exact order for Logs_Raw) ===');
  console.log('Number of rows:', values.length);
  if (values.length > 0) {
    console.log('First row array:', values[0]);
    const first = values[0];
    // Verify key fields are strings in expected format (not serial numbers)
    console.log('Verification:');
    console.log('  Date[0]:', first[0], 'typeof:', typeof first[0]);
    console.log('  Month[1]:', first[1], 'typeof:', typeof first[1]);
    console.log('  Shift[2]:', first[2], 'typeof:', typeof first[2]);
    console.log('  ShiftStart[10]:', first[10], 'typeof:', typeof first[10]);
    console.log('  ShiftEnd[11]:', first[11], 'typeof:', typeof first[11]);
    // Expected example check (will log actual)
    console.log('  (Expected example format: Date="06-06-2026", Month="2026-06", Shift="Day", ShiftStart="06-06-2026 8:30", ShiftEnd="06-06-2026 19:00" — consistent DD-MM-YYYY HH:MM for ALL row types)');
  }
  if (values.length > 1) {
    console.log('Second row array (sample):', values[1]);
  }

  // TEMPORARY VERIFICATION LOGGING (requested)
  // Log one CNC, one Burma, one Repair to confirm string types for ShiftStart/ShiftEnd/Date/Month
  // before the append. This shows what the builder produced (and what will be forced to text below).
  let loggedCNC = false;
  let loggedBurma = false;
  let loggedRepair = false;
  records.forEach((rec: any) => {
    const mid = String(rec.MachineID || '');
    const ss = rec.ShiftStart;
    const se = rec.ShiftEnd;
    const d = rec.Date;
    const mo = rec.Month;
    let label = '';
    if (!loggedCNC && mid.startsWith('M')) {
      label = 'CNC'; loggedCNC = true;
    } else if (!loggedBurma && mid.startsWith('B')) {
      label = 'Burma'; loggedBurma = true;
    } else if (!loggedRepair && mid === 'Repair') {
      label = 'Repair'; loggedRepair = true;
    }
    if (label) {
      console.log(`--- TEMP Shift verification for ${label} (machineId=${mid}) ---`);
      console.log({
        machineId: mid,
        shiftStart: ss,
        shiftEnd: se,
        shiftStartType: typeof ss,
        shiftEndType: typeof se
      });
      console.log(`--- TEMP Date/Month verification for ${label} (machineId=${mid}) ---`);
      console.log({
        date: d,
        dateType: typeof d,
        month: mo,
        monthType: typeof mo
      });
    }
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetIdValue,
    range: `${tab}!A:${lastColumn}`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values,
    },
  });
}

type RawDailyMetrics = {
  cncEntryCount: number;
  cncTotalHours: number;
  cncTotalSides: number;
  burmaTotal: number;
};

function computeDailyMetricsFromRawRecords(records: ProductionLogRow[]): RawDailyMetrics {
  let cncEntryCount = 0;
  let cncTotalSides = 0;
  let cncTotalHours = 0;
  let burmaTotal = 0;

  for (const rec of records) {
    const entryType = String((rec as any).EntryType || '').toUpperCase();
    const machineId = String((rec as any).MachineID || '');
    const totalParts = Number((rec as any).TotalParts || 0);
    const prodHours = Number((rec as any).TotalProduction_hr || 0);

    const isCnc = entryType === 'CNC' || /^M[1-8]$/.test(machineId);
    const isBurma = entryType === 'BURMA' || /^B[1-3]$/.test(machineId);

    if (isCnc) {
      cncEntryCount += 1;
      cncTotalSides += totalParts;
      cncTotalHours += prodHours;
    } else if (isBurma) {
      burmaTotal += totalParts;
    }
    // Repair rows contribute to neither main daily rollup (consistent with prior behavior)
  }

  return {
    cncEntryCount,
    cncTotalHours: Math.round(cncTotalHours * 100) / 100,
    cncTotalSides,
    burmaTotal,
  };
}

export async function appendProductionFromRawRecords(
  records: ProductionLogRow[],
  meta: { submittedAt: string; productionDate: string; shift: string },
) {
  const sheets = await getSheetsClient();
  const spreadsheetIdValue = spreadsheetId();
  const dailyTab = dailyTabName();

  // 1. Write raw per-record rows to the dedicated raw tab (never touches current Logs)
  await appendRawLogRows(sheets, spreadsheetIdValue, records);

  // 2. Derive Daily metrics from the expanded raw rows and upsert (keeps Daily behavior)
  const metrics = computeDailyMetricsFromRawRecords(records);

  // Construct a minimal object compatible with existing upsertDailyTotals / buildDailyRow
  const forDaily: ProductionSheetsPayload = {
    submittedAt: meta.submittedAt,
    productionDate: meta.productionDate,
    shift: meta.shift,
    cncOperator: '',
    cncEntryCount: metrics.cncEntryCount,
    cncTotalHours: metrics.cncTotalHours,
    cncTotalSides: metrics.cncTotalSides,
    burma1Operator: '',
    burma1: null,
    burma2Operator: '',
    burma2: null,
    burma3Operator: '',
    burma3: null,
    burmaTotal: metrics.burmaTotal,
    repairPerson: '',
    repairCount: null,
    repairNote: '',
    notes: '',
  };

  await upsertDailyTotals(sheets, spreadsheetIdValue, dailyTab, forDaily);
}