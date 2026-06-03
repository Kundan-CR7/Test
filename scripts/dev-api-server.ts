import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { handleAppendProduction } from '../api/lib/handleAppendProduction';

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
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

    process.env[key] = value.replace(/\\n/g, '\n');
  }
}

const root = resolve(process.cwd());
loadEnvFile(resolve(root, '.env'));
loadEnvFile(resolve(root, 'app/.env'));

const port = Number(process.env.API_PORT ?? 3000);

if (!process.env.SUBMIT_API_KEY?.trim()) {
  console.error('Missing SUBMIT_API_KEY in .env (root) or app/.env');
  process.exit(1);
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`);

  if (url.pathname !== '/api/append-production') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ ok: false, error: 'not_found' }));
    return;
  }

  let body: unknown = null;

  if (request.method === 'POST') {
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
      chunks.push(chunk as Buffer);
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    if (raw.trim() !== '') {
      try {
        body = JSON.parse(raw) as unknown;
      } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ ok: false, error: 'invalid_json' }));
        return;
      }
    }
  }

  const headers: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(request.headers)) {
    headers[key] = value;
  }

  const result = await handleAppendProduction(
    request.method ?? 'GET',
    headers,
    body,
  );

  if (result.status === 204) {
    response.writeHead(204);
    response.end();
    return;
  }

  response.writeHead(result.status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(result.body));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Local API listening on http://127.0.0.1:${port}`);
  console.log('POST http://127.0.0.1:' + port + '/api/append-production');
  console.log('Keep this running while using `npm run dev` in app/');
});