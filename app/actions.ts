'use server';
import {
  fetchHeadscale,
  expirePreAuthKey as _expireKey,
  deleteUser as _deleteUser,
  createUser as _createUser,
  renameUser as _renameUser,
  renameMachine as _renameMachine,
  setPolicy as _setPolicy,
  getUsers,
  getNodes,
} from '@/lib/headscale';
import { revalidatePath } from 'next/cache';
import { logEvent } from '@/lib/audit';
import { setNodeTags, getNodeTags, getTagsForNodes } from '@/lib/tags';
import { generateApiKey, getCurrentApiKey, revokeApiKey } from '@/lib/apikeys';

// ── Node ──────────────────────────────────────────────────────────────────────

export async function generatePreAuthKey() {
  const exp = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  const res = await fetchHeadscale('preauthkey', {
    method: 'POST',
    body: JSON.stringify({ user: 'admin', reusable: false, ephemeral: false, expiration: exp }),
  });
  revalidatePath('/');
  revalidatePath('/keys');
  return res.preAuthKey?.key || res.key || '';
}

export async function revokeNode(nodeId: string) {
  await fetchHeadscale(`machine/${nodeId}`, { method: 'DELETE' });
  await logEvent('node.revoke', { nodeId });
  revalidatePath('/');
}

export async function renameMachineAction(nodeId: string, newName: string) {
  await _renameMachine(nodeId, newName);
  await logEvent('node.rename', { nodeId, newName });
  revalidatePath('/');
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function enableRoute(routeId: string) {
  await fetchHeadscale(`routes/${routeId}/enable`, { method: 'POST' });
  revalidatePath('/routes');
}

export async function disableRoute(routeId: string) {
  await fetchHeadscale(`routes/${routeId}/enable`, { method: 'DELETE' });
  revalidatePath('/routes');
}

// ── Pre-auth keys ─────────────────────────────────────────────────────────────

export async function expireKeyAction(user: string, key: string) {
  await _expireKey(user, key);
  await logEvent('key.expire', { user, key: key.slice(0, 8) + '…' });
  revalidatePath('/keys');
}

export async function generateKeyForUser(
  user: string,
  reusable: boolean,
  ephemeral: boolean,
  expiryDays: number
) {
  const expiration = new Date(Date.now() + expiryDays * 24 * 3600 * 1000).toISOString();
  const res = await fetchHeadscale('preauthkey', {
    method: 'POST',
    body: JSON.stringify({ user, reusable, ephemeral, expiration }),
  });
  await logEvent('key.generate', { user, ephemeral: String(ephemeral), expiryDays: String(expiryDays) });
  revalidatePath('/keys');
  return res.preAuthKey?.key || res.key || '';
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function createUserAction(name: string) {
  await _createUser(name);
  await logEvent('user.create', { name });
  revalidatePath('/users');
}

export async function deleteUserAction(name: string) {
  await _deleteUser(name);
  await logEvent('user.delete', { name });
  revalidatePath('/users');
}

export async function renameUserAction(oldName: string, newName: string) {
  await _renameUser(oldName, newName);
  await logEvent('user.rename', { oldName, newName });
  revalidatePath('/users');
}

// ── ACL Policy ────────────────────────────────────────────────────────────────

export async function updatePolicyAction(policy: string) {
  await _setPolicy(policy);
  await logEvent('acl.update', {});
  revalidatePath('/settings');
}

// ── Users (read) ──────────────────────────────────────────────────────────────

export async function getUsersAction() {
  return await getUsers();
}

// ── CSV Export ────────────────────────────────────────────────────────────────

export async function exportNodesCsvAction(): Promise<string> {
  const nodes = await getNodes();
  const rows = [
    ['Node Name', 'Hostname', 'User', 'Mesh IPv4', 'Mesh IPv6', 'Status', 'Last Seen', 'Created At', 'Expiry'],
    ...nodes.map((n: any) => {
      const ipv4 = n.ipAddresses?.find((ip: string) => !ip.includes(':')) ?? '';
      const ipv6 = n.ipAddresses?.find((ip: string) => ip.includes(':')) ?? '';
      const online = n.online ? 'Online' : 'Offline';
      const lastSeen = n.lastSeen && !n.lastSeen.startsWith('0001') ? new Date(n.lastSeen).toISOString() : 'Never';
      const created = n.createdAt ? new Date(n.createdAt).toISOString() : '';
      const expiry = n.expiry && !n.expiry.startsWith('0001') ? new Date(n.expiry).toISOString() : 'Never';
      return [n.givenName ?? n.name, n.name, n.user?.name ?? '', ipv4, ipv6, online, lastSeen, created, expiry];
    }),
  ];
  return rows.map(r => r.map((cell: unknown) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

// ── Tags ────────────────────────────────────────────────────────────────

export async function getNodeTagsAction(nodeId: string) {
  return getNodeTags(nodeId);
}

export async function setNodeTagsAction(nodeId: string, tags: string[]) {
  await setNodeTags(nodeId, tags);
  await logEvent('tag.set', { nodeId, tags: tags.join(',') });
  revalidatePath('/dashboard');
}

export async function getTagsForNodesAction(nodeIds: string[]) {
  return getTagsForNodes(nodeIds);
}

// ── API Keys ───────────────────────────────────────────────────────────────

export async function generateApiKeyAction() {
  const record = await generateApiKey();
  await logEvent('apikey.generate', {});
  return record;
}

export async function getCurrentApiKeyAction() {
  return getCurrentApiKey();
}

export async function revokeApiKeyAction() {
  await revokeApiKey();
  await logEvent('apikey.revoke', {});
}

