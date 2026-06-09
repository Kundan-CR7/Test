import { createPrivateKey } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  appendProductionFromRawRecords,
  type ProductionLogRow,
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
const submittedAt = now.toISOString();
const productionDate = now.toISOString().slice(0, 10);
const shift = 'morning';
const notes = 'API raw multi-record test — safe to delete';

// Example: 2 CNC + 2 Burma + 1 Repair → should produce 5 rows in the configured log tab
const formattedDate = '06-06-2026'; // DD-MM-YYYY
const formattedMonth = '2026-06';
const formattedShift = 'Day';

const records: ProductionLogRow[] = [
  // CNC 1
  {
    Date: formattedDate,
    Month: formattedMonth,
    Shift: formattedShift,
    MachineID: 'M1',
    Operator: 'Avinash',
    Part_ID: '',
    PartSide: 'OP1',
    IdealCycle_sec: '',
    MachineCycle_sec: 146,
    TotalParts: 193,
    ShiftStart: formattedDate + ' 8:30',
    ShiftEnd: formattedDate + ' 19:00',
    Downtime_PowerCut_min: 0,
    Downtime_MaterialShortage_min: 0,
    'Downtime_MachineBreakdown/setting_min': 0,
    Downtime_Others_min: 0,
    TotalDowntime_min: 0,
    DowntimeReason: '',
    Notes: notes,
    PlannedTime_min: '',
    RunTime_min: '',
    MachineRuntime_min: '',
    IdealMachineTime_min: '',
    CycleDiff_pct: '',
    TimeFlag: '',
    Availability_pct: '',
    Performance_pct: '',
    Quality_pct: '',
    OEE_like: '',
    Parts_per_Hour: 30.63,
    TotalProduction_hr: 7.83,
  },
  // CNC 2
  {
    Date: formattedDate,
    Month: formattedMonth,
    Shift: formattedShift,
    MachineID: 'M2',
    Operator: 'Sanju',
    Part_ID: '',
    PartSide: 'OP1',
    IdealCycle_sec: '',
    MachineCycle_sec: 110,
    TotalParts: 150,
    ShiftStart: formattedDate + ' 8:30',
    ShiftEnd: formattedDate + ' 19:00',
    Downtime_PowerCut_min: 0,
    Downtime_MaterialShortage_min: 0,
    'Downtime_MachineBreakdown/setting_min': 0,
    Downtime_Others_min: 0,
    TotalDowntime_min: 0,
    DowntimeReason: '',
    Notes: notes,
    PlannedTime_min: '',
    RunTime_min: '',
    MachineRuntime_min: '',
    IdealMachineTime_min: '',
    CycleDiff_pct: '',
    TimeFlag: '',
    Availability_pct: '',
    Performance_pct: '',
    Quality_pct: '',
    OEE_like: '',
    Parts_per_Hour: 32.75,
    TotalProduction_hr: 4.58,
  },
  // Burma B1
  {
    Date: formattedDate,
    Month: formattedMonth,
    Shift: formattedShift,
    MachineID: 'B1',
    Operator: 'Radhe',
    Part_ID: '',
    PartSide: 'OP1',
    IdealCycle_sec: '',
    MachineCycle_sec: '',
    TotalParts: 23,
    ShiftStart: formattedDate + ' 8:30',
    ShiftEnd: formattedDate + ' 19:00',
    Downtime_PowerCut_min: 0,
    Downtime_MaterialShortage_min: 0,
    'Downtime_MachineBreakdown/setting_min': 0,
    Downtime_Others_min: 0,
    TotalDowntime_min: 0,
    DowntimeReason: '',
    Notes: 'Burma production; cycle time not provided.',
    PlannedTime_min: '',
    RunTime_min: '',
    MachineRuntime_min: '',
    IdealMachineTime_min: '',
    CycleDiff_pct: '',
    TimeFlag: '',
    Availability_pct: '',
    Performance_pct: '',
    Quality_pct: '',
    OEE_like: '',
    Parts_per_Hour: '',
    TotalProduction_hr: '',
  },
  // Burma B2
  {
    Date: formattedDate,
    Month: formattedMonth,
    Shift: formattedShift,
    MachineID: 'B2',
    Operator: 'Manish',
    Part_ID: '',
    PartSide: 'OP1',
    IdealCycle_sec: '',
    MachineCycle_sec: '',
    TotalParts: 21,
    ShiftStart: formattedDate + ' 8:30',
    ShiftEnd: formattedDate + ' 19:00',
    Downtime_PowerCut_min: 0,
    Downtime_MaterialShortage_min: 0,
    'Downtime_MachineBreakdown/setting_min': 0,
    Downtime_Others_min: 0,
    TotalDowntime_min: 0,
    DowntimeReason: '',
    Notes: 'Burma production; cycle time not provided.',
    PlannedTime_min: '',
    RunTime_min: '',
    MachineRuntime_min: '',
    IdealMachineTime_min: '',
    CycleDiff_pct: '',
    TimeFlag: '',
    Availability_pct: '',
    Performance_pct: '',
    Quality_pct: '',
    OEE_like: '',
    Parts_per_Hour: '',
    TotalProduction_hr: '',
  },
  // Repair
  {
    Date: formattedDate,
    Month: formattedMonth,
    Shift: formattedShift,
    MachineID: 'Repair',
    Operator: 'Kamal',
    Part_ID: '',
    PartSide: 'OP1',
    IdealCycle_sec: '',
    MachineCycle_sec: '',
    TotalParts: 10,
    ShiftStart: formattedDate + ' 8:30',
    ShiftEnd: formattedDate + ' 19:00',
    Downtime_PowerCut_min: 0,
    Downtime_MaterialShortage_min: 0,
    'Downtime_MachineBreakdown/setting_min': 0,
    Downtime_Others_min: 0,
    TotalDowntime_min: 0,
    DowntimeReason: '',
    Notes: 'Repair work; thread repair; cycle time not provided.',
    PlannedTime_min: '',
    RunTime_min: '',
    MachineRuntime_min: '',
    IdealMachineTime_min: '',
    CycleDiff_pct: '',
    TimeFlag: '',
    Availability_pct: '',
    Performance_pct: '',
    Quality_pct: '',
    OEE_like: '',
    Parts_per_Hour: '',
    TotalProduction_hr: '',
  },
];

console.log('Writing raw multi-record production data to Google Sheets...');
console.log('Raw log tab (new schema):', process.env.GOOGLE_SHEET_RAW_LOG_TAB_NAME || process.env.GOOGLE_SHEET_LOG_TAB_NAME || 'Logs');
console.log('Daily tab (derived from raw rows):', process.env.GOOGLE_SHEET_DAILY_TAB_NAME || 'Daily');
console.log(`Records in this submission: ${records.length} (expect rows in configured log tab)`);

await appendProductionFromRawRecords(records, {
  submittedAt,
  productionDate,
  shift,
});

console.log('Success. Check the configured log tab (raw rows) and Daily (updated aggregates) in your spreadsheet.');