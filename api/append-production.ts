import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAppendProduction } from './lib/handleAppendProduction.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 1024,
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  try {
    const result = await handleAppendProduction(
      request.method ?? 'GET',
      request.headers,
      request.body,
    );

    if (result.status === 204) {
      return response.status(204).end();
    }

    return response.status(result.status).json(result.body);
  } catch (error) {
    console.error('append-production crash', error);
    return response.status(500).json({
      ok: false,
      error: 'function_crash',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}