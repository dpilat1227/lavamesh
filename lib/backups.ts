/**
 * lib/backups.ts — Automated config backups (Pro/Cloud perk).
 *
 * This was listed on the pricing page ("Automated config backups") with no
 * implementation behind it anywhere in the codebase — this file is that
 * implementation. Snapshots the things that are actually painful to
 * reconstruct by hand if Headscale's SQLite database is ever lost: the ACL
 * policy, the user list, and the node roster (name/tags/IP, not credentials).
 * Pre-auth keys are deliberately excluded — they're secrets, and re-issuing
 * them is trivial, so backing them up would only add risk for no benefit.
 *
 * Stored in KV as a capped list, same pattern as lib/audit.ts. A daily cron
 * (app/api/cron/config-backup) takes automatic snapshots for Pro/Cloud;
 * users can also trigger one on demand from Settings.
 */

import { kvLpush, kvLrange, kvLtrim } from '@/lib/kv';
import { getPolicy, getUsers, getNodes } from '@/lib/headscale';

const KEY = 'backups:snapshots';
const MAX_BACKUPS = 30;

export interface ConfigBackup {
  id: string;
  ts: string; // ISO timestamp
  trigger: 'manual' | 'scheduled';
  policy: string | null;
  users: { name: string; id: string }[];
  nodes: { id: string; name: string; user: string; ipAddresses: string[] }[];
}

export interface BackupSummary {
  id: string;
  ts: string;
  trigger: 'manual' | 'scheduled';
  userCount: number;
  nodeCount: number;
  hasPolicy: boolean;
}

export async function createBackup(trigger: 'manual' | 'scheduled'): Promise<BackupSummary> {
  const [policyRes, usersRes, nodesRes] = await Promise.allSettled([getPolicy(), getUsers(), getNodes()]);

  const policy = policyRes.status === 'fulfilled' ? (policyRes.value?.policy || policyRes.value?.acl || null) : null;
  const users = usersRes.status === 'fulfilled'
    ? (usersRes.value || []).map((u: any) => ({ name: u.name, id: String(u.id) }))
    : [];
  const nodes = nodesRes.status === 'fulfilled'
    ? (nodesRes.value || []).map((n: any) => ({ id: String(n.id), name: n.givenName || n.name, user: n.user?.name || '', ipAddresses: n.ipAddresses || [] }))
    : [];

  const backup: ConfigBackup = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date().toISOString(),
    trigger,
    policy,
    users,
    nodes,
  };

  await kvLpush(KEY, JSON.stringify(backup));
  await kvLtrim(KEY, 0, MAX_BACKUPS - 1);

  return { id: backup.id, ts: backup.ts, trigger: backup.trigger, userCount: users.length, nodeCount: nodes.length, hasPolicy: !!policy };
}

export async function listBackups(limit = MAX_BACKUPS): Promise<BackupSummary[]> {
  const raw = await kvLrange<string>(KEY, 0, limit - 1);
  return raw.map(r => {
    try {
      const b: ConfigBackup = JSON.parse(r);
      return { id: b.id, ts: b.ts, trigger: b.trigger, userCount: b.users.length, nodeCount: b.nodes.length, hasPolicy: !!b.policy };
    } catch {
      return null;
    }
  }).filter(Boolean) as BackupSummary[];
}

export async function getBackup(id: string): Promise<ConfigBackup | null> {
  const raw = await kvLrange<string>(KEY, 0, MAX_BACKUPS - 1);
  for (const r of raw) {
    try {
      const b: ConfigBackup = JSON.parse(r);
      if (b.id === id) return b;
    } catch { /* skip malformed entry */ }
  }
  return null;
}
