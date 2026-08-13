#!/usr/bin/env node
/**
 * Sync production env vars to Vercel (linked project).
 * Public vars from config/vercel.production.env; publishable keys from local .env.
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicPath = join(root, 'config', 'vercel.production.env');
const localEnvPath = join(root, '.env');

const FROM_LOCAL = [
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
];

function parseEnvFile(raw) {
  const out = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function upsert(name, value, sensitive) {
  if (!value) {
    console.warn(`Skipping empty ${name}`);
    return;
  }
  const args = [
    'env',
    'add',
    name,
    'production',
    '--value',
    value,
    '--force',
    '--yes',
  ];
  if (sensitive) args.push('--sensitive');
  const result = spawnSync('npx', ['vercel', ...args], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    const err = result.stderr?.toString() || result.stdout?.toString() || 'failed';
    console.error(`Failed ${name}: ${err.trim()}`);
    process.exit(1);
  }
  process.stdout.write('.');
}

let publicRaw;
try {
  publicRaw = readFileSync(publicPath, 'utf8');
} catch {
  console.error('Missing config/vercel.production.env');
  process.exit(1);
}

const local = existsSync(localEnvPath)
  ? parseEnvFile(readFileSync(localEnvPath, 'utf8'))
  : {};

const pairs = Object.entries(parseEnvFile(publicRaw));
for (const key of FROM_LOCAL) {
  if (local[key]) pairs.push([key, local[key]]);
}

console.log(`Syncing ${pairs.length} Vercel production variable(s)...`);
for (const [key, value] of pairs) {
  const sensitive = key.includes('KEY') || key.includes('SECRET');
  upsert(key, value, sensitive);
}
console.log('\nDone. Deploy: npm run vercel:deploy');
