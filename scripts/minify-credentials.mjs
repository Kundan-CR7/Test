#!/usr/bin/env node
/**
 * Reads ./credentials.json (gitignored) and prints one line for
 * Vercel env var GOOGLE_SERVICE_ACCOUNT_JSON.
 *
 * Usage: node scripts/minify-credentials.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.cwd(), 'credentials.json');

try {
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  console.log('Paste this into Vercel → GOOGLE_SERVICE_ACCOUNT_JSON:\n');
  console.log(JSON.stringify(parsed));
} catch (error) {
  console.error(
    'Place credentials.json in the repo root, then run again.',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}