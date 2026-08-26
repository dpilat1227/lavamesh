/** Client-safe audit display helpers — no KV/prisma imports. */

export interface AuditEventView {
  id: string;
  ts: string;
  action: string;
  meta: Record<string, string>;
}

export const ACTION_LABELS: Record<string, string> = {
  'node.revoke': 'Node Revoked',
  'node.rename': 'Node Renamed',
  'node.expire': 'Node Expired',
  'key.generate': 'Key Generated',
  'key.expire': 'Key Expired',
  'user.create': 'User Created',
  'user.delete': 'User Deleted',
  'user.rename': 'User Renamed',
  'acl.update': 'ACL Updated',
  'tag.set': 'Tags Updated',
  'apikey.generate': 'API Key Generated',
  'apikey.revoke': 'API Key Revoked',
  'notifications.update': 'Notification Settings Updated',
  'route.failover': 'Subnet Route Failover',
  'auth.login': 'Login',
  'backup.create': 'Config Backup Created',
  'dns.update': 'DNS Records Updated',
  'alert.test': 'Test Alert Sent',
};

export const ACTION_COLORS: Record<string, string> = {
  'node.revoke': 'var(--red)',
  'node.expire': 'var(--amber)',
  'key.expire': 'var(--red)',
  'user.delete': 'var(--red)',
  'apikey.revoke': 'var(--red)',
  'node.rename': 'var(--orange)',
  'user.rename': 'var(--orange)',
  'tag.set': 'var(--orange)',
  'acl.update': '#a78bfa',
  'dns.update': '#60a5fa',
  'apikey.generate': '#60a5fa',
  'key.generate': 'var(--green)',
  'user.create': 'var(--green)',
  'notifications.update': '#60a5fa',
  'route.failover': 'var(--amber)',
  'auth.login': 'var(--text-3)',
  'backup.create': 'var(--green)',
  'alert.test': 'var(--orange)',
};

export type AuditFilter = 'all' | 'nodes' | 'keys' | 'users' | 'policy';

const FILTER_PREFIX: Record<Exclude<AuditFilter, 'all'>, string[]> = {
  nodes: ['node.', 'route.failover', 'tag.set'],
  keys: ['key.', 'apikey.'],
  users: ['user.'],
  policy: ['acl.', 'backup.', 'dns.', 'notifications.'],
};

export function matchesAuditFilter(action: string, filter: AuditFilter): boolean {
  if (filter === 'all') return true;
  return FILTER_PREFIX[filter].some(p => action === p || action.startsWith(p));
}

export function formatMeta(meta: Record<string, string>): string {
  return Object.entries(meta)
    .filter(([k]) => k !== 'actor')
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
