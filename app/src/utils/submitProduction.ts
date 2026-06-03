import type { ProductionEntryState } from '../state/types';
import { buildProductionSheetsPayload } from './sheetsPayload';

export type SubmitProductionResult =
  | { status: 'ok' }
  | { status: 'failed'; error?: string; httpStatus?: number }
  | { status: 'disabled' }
  | { status: 'unreachable' };

function submitApiKey(): string | null {
  const key = import.meta.env.VITE_SUBMIT_API_KEY?.trim();
  return key ? key : null;
}

function submitApiUrl(): string {
  const configured = import.meta.env.VITE_SHEETS_SUBMIT_URL?.trim();
  return configured || '/api/append-production';
}

export function sheetsErrorMessage(error?: string, httpStatus?: number): string {
  switch (error) {
    case 'unauthorized':
      return 'Sheet sync failed: API key mismatch. Make VITE_SUBMIT_API_KEY match SUBMIT_API_KEY on Vercel, then redeploy.';
    case 'not_configured':
      return 'Sheet sync failed: SUBMIT_API_KEY is missing on Vercel.';
    case 'invalid_payload':
      return 'Sheet sync failed: invalid data sent to the server.';
    case 'sheets_permission_denied':
      return 'Sheet sync failed: share the Google Sheet with your service account email (Editor).';
    case 'sheet_not_found':
      return 'Sheet sync failed: wrong GOOGLE_SHEETS_ID or tab names (Logs / Daily).';
    case 'invalid_google_credentials':
      return 'Sheet sync failed: fix GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_JSON on Vercel.';
    case 'sheets_append_failed':
      return 'Sheet sync failed: server could not write to Google Sheets. Check Vercel function logs.';
    default:
      if (httpStatus === 404) {
        return 'Sheet sync failed: /api/append-production not found. Deploy from repo root, not app/ only.';
      }
      return 'Sheet sync failed. Check Vercel env vars and function logs.';
  }
}

export function isSheetsSubmitConfigured(): boolean {
  return submitApiKey() !== null;
}

export async function submitProductionToSheets(
  state: ProductionEntryState,
  generatedAt: Date,
): Promise<SubmitProductionResult> {
  const apiKey = submitApiKey();
  if (apiKey === null) {
    return { status: 'disabled' };
  }

  const payload = buildProductionSheetsPayload(state, generatedAt);

  try {
    const response = await fetch(submitApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ apiKey, ...payload }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };

    if (!response.ok) {
      console.error('Sheets submit failed:', response.status, body);
      return {
        status: 'failed',
        error: body.error,
        httpStatus: response.status,
      };
    }

    return body.ok === true
      ? { status: 'ok' }
      : { status: 'failed', error: body.error, httpStatus: response.status };
  } catch (error) {
    console.error('Sheets submit unreachable:', submitApiUrl(), error);
    return { status: 'unreachable' };
  }
}