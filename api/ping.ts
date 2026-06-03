import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.status(200).json({
    ok: true,
    apiKeyConfigured: Boolean(process.env.SUBMIT_API_KEY?.trim()),
    sheetsIdConfigured: Boolean(process.env.GOOGLE_SHEETS_ID?.trim()),
    googleEmailConfigured: Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ||
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim(),
    ),
  });
}