/**
 * lib/audit.ts — Audit log backed by Vercel KV.
 * Events are stored as a Redis list (newest first), capped at 500 entries.
 */

import { kvLpush, kvLrange, kvLtrim } from '@/lib/kv';

export type AuditAction =
  | 'node.revoke'
  | 'node.rename'
  | 'key.generate'
  | 'key.expire'
  | 'user.create'
  | 'user.delete'
  | 'user.rename'
  | 'acl.update'
  | 'tag.set'
  | 'apikey.generate'
  | 'apikey.revoke'
  | 'auth.login';

export interface AuditEvent {
  id: string;
  ts: string;         // ISO timestamp
  action: AuditAction;
  actor: string;      // always 'admin' for now
  meta: Record<string, string>;
}

const KEY = 'audit:events';
const MAX_EVENTS = 500;

export async function logEvent(action: AuditAction, meta: Record<string, string> = {}): Promise<void> {
  const event: AuditEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date().toISOString(),
    action,
    actor: 'admin',
    meta,
  };
  await kvLpush(KEY, JSON.stringify(event));
  await kvLtrim(KEY, 0, MAX_EVENTS - 1);
}

export async function getAuditLog(limit = 100): Promise<AuditEvent[]> {
  const raw = await kvLrange<string>(KEY, 0, limit - 1);
  return raw.map(r => {
    try { return JSON.parse(r) as AuditEvent; }
    catch { return null; }
  }).filter(Boolean) as AuditEvent[];
}
