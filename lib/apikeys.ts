/**
 * lib/apikeys.ts — Personal API key management backed by Vercel KV.
 *
 * Keys are prefixed with `lm_` and stored as:
 *   KV key `apikey:{token}` → ApiKeyRecord (with 0 TTL = no expiry)
 *   KV key `apikey:current` → token (the active key; one key per admin)
 *
 * The /api/v1/* route validates Bearer tokens against this store.
 */

import { kvGet, kvSet, kvDel } from '@/lib/kv';

export interface ApiKeyRecord {
  token: string;
  created: string;   // ISO timestamp
  lastUsed: string | null;
}

const CURRENT_KEY = 'apikey:current';

function recordKey(token: string) {
  return `apikey:${token}`;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'lm_';
  // 32 random chars
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function generateApiKey(): Promise<ApiKeyRecord> {
  // Revoke existing key first
  const existing = await kvGet<string>(CURRENT_KEY);
  if (existing) {
    await kvDel(recordKey(existing));
  }

  const token = generateToken();
  const record: ApiKeyRecord = {
    token,
    created: new Date().toISOString(),
    lastUsed: null,
  };
  await kvSet(recordKey(token), record);
  await kvSet(CURRENT_KEY, token);
  return record;
}

export async function getCurrentApiKey(): Promise<ApiKeyRecord | null> {
  const token = await kvGet<string>(CURRENT_KEY);
  if (!token) return null;
  return kvGet<ApiKeyRecord>(recordKey(token));
}

export async function revokeApiKey(): Promise<void> {
  const token = await kvGet<string>(CURRENT_KEY);
  if (token) await kvDel(recordKey(token));
  await kvDel(CURRENT_KEY);
}

/** Called by /api/v1/* to validate a Bearer token. Returns true if valid. */
export async function validateApiKey(token: string): Promise<boolean> {
  if (!token.startsWith('lm_')) return false;
  const record = await kvGet<ApiKeyRecord>(recordKey(token));
  if (!record) return false;
  // Update lastUsed (fire-and-forget, don't block the request)
  kvSet(recordKey(token), { ...record, lastUsed: new Date().toISOString() }).catch(() => {});
  return true;
}
