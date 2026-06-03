import { appendProductionRow, type ProductionSheetsPayload } from './sheets.js';

export type AppendProductionResult = {
  status: number;
  body: { ok: boolean; error?: string };
};

function readApiKeyFromHeaders(
  headers: Record<string, string | string[] | undefined>,
): string | null {
  const header = headers['x-api-key'];
  if (typeof header === 'string' && header.trim() !== '') {
    return header.trim();
  }

  if (Array.isArray(header) && typeof header[0] === 'string') {
    return header[0].trim();
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function parsePayload(body: unknown): ProductionSheetsPayload | null {
  if (!isRecord(body)) return null;

  const submittedAt = readString(body.submittedAt);
  const productionDate = readString(body.productionDate);
  const shift = readString(body.shift);
  const textSummary = readString(body.textSummary);
  const cncEntriesJson = readString(body.cncEntriesJson);

  if (
    submittedAt === null ||
    productionDate === null ||
    shift === null ||
    textSummary === null ||
    cncEntriesJson === null
  ) {
    return null;
  }

  const cncEntryCount = readNullableNumber(body.cncEntryCount);
  const cncTotalHours = readNullableNumber(body.cncTotalHours);
  const cncTotalSides = readNullableNumber(body.cncTotalSides);
  const burmaTotal = readNullableNumber(body.burmaTotal);

  if (
    cncEntryCount === null ||
    cncTotalHours === null ||
    cncTotalSides === null ||
    burmaTotal === null
  ) {
    return null;
  }

  return {
    submittedAt,
    productionDate,
    shift,
    cncEntryCount,
    cncTotalHours,
    cncTotalSides,
    burma1Operator: readString(body.burma1Operator) ?? '',
    burma1: readNullableNumber(body.burma1),
    burma2Operator: readString(body.burma2Operator) ?? '',
    burma2: readNullableNumber(body.burma2),
    burma3Operator: readString(body.burma3Operator) ?? '',
    burma3: readNullableNumber(body.burma3),
    burmaTotal,
    repairPerson: readString(body.repairPerson) ?? '',
    repairCount: readNullableNumber(body.repairCount),
    repairNote: readString(body.repairNote) ?? '',
    notes: readString(body.notes) ?? '',
    textSummary,
    cncEntriesJson,
  };
}

function expectedApiKey(): string | null {
  const key = process.env.SUBMIT_API_KEY?.trim();
  return key ? key : null;
}

export async function handleAppendProduction(
  method: string,
  headers: Record<string, string | string[] | undefined>,
  body: unknown,
): Promise<AppendProductionResult> {
  if (method === 'OPTIONS') {
    return { status: 204, body: { ok: true } };
  }

  if (method !== 'POST') {
    return { status: 405, body: { ok: false, error: 'method_not_allowed' } };
  }

  const configuredKey = expectedApiKey();
  if (configuredKey === null) {
    return { status: 503, body: { ok: false, error: 'not_configured' } };
  }

  const providedKey =
    readApiKeyFromHeaders(headers) ??
    (isRecord(body) ? readString(body.apiKey) : null);

  if (providedKey === null || providedKey !== configuredKey) {
    return { status: 401, body: { ok: false, error: 'unauthorized' } };
  }

  const payload = parsePayload(body);
  if (payload === null) {
    return { status: 400, body: { ok: false, error: 'invalid_payload' } };
  }

  try {
    await appendProductionRow(payload);
    return { status: 200, body: { ok: true } };
  } catch (error) {
    const errorCode = mapSheetsError(error);
    console.error('append-production failed', errorCode, error);
    return { status: 500, body: { ok: false, error: errorCode } };
  }
}

function mapSheetsError(error: unknown): string {
  const message =
    error instanceof Error
      ? `${error.message} ${error.stack ?? ''}`
      : String(error);

  if (
    message.includes('PERMISSION_DENIED') ||
    message.includes('permission') ||
    message.includes('caller does not have permission')
  ) {
    return 'sheets_permission_denied';
  }

  if (
    message.includes('GOOGLE_SHEETS_ID is not configured') ||
    message.includes('Unable to parse range') ||
    message.includes('Requested entity was not found')
  ) {
    return 'sheet_not_found';
  }

  if (
    message.includes('GOOGLE_SERVICE_ACCOUNT') ||
    message.includes('GOOGLE_PRIVATE_KEY') ||
    message.includes('invalid_grant') ||
    message.includes('DECODER') ||
    message.includes('not valid JSON')
  ) {
    return 'invalid_google_credentials';
  }

  return 'sheets_append_failed';
}