'use server';
import {
  fetchHeadscale,
  expirePreAuthKey as _expireKey,
  deleteUser as _deleteUser,
  createUser as _createUser,
  renameUser as _renameUser,
  renameMachine as _renameMachine,
  expireMachine as _expireMachine,
  setPolicy as _setPolicy,
  getPolicy,
  getUsers,
  getNodes,
} from '@/lib/headscale';
import { revalidatePath } from 'next/cache';
import { logEvent } from '@/lib/audit';
import { setNodeTags, getNodeTags, getTagsForNodes } from '@/lib/tags';
import { generateApiKey, getCurrentApiKey, revokeApiKey } from '@/lib/apikeys';
import { getPlanStatus, hasLicenseKey, saveLicenseKey } from '@/lib/billing';
import { kvConfigured } from '@/lib/kv';
import { saveNotificationConfig, sendTestAlert, type NotificationConfig } from '@/lib/notifications';
import { getTagGroups, compilePolicy, mergeBuilderIntoExisting, validateRule, type AclRule } from '@/lib/aclBuilder';
import { createBackup, listBackups, getBackup } from '@/lib/backups';
import { policyTextFromResponse, setExtraRecords, validateDnsRecord, type DnsExtraRecord } from '@/lib/policyDns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function requireSession() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new Error('You need to be signed in.');
  return userId;
}

async function requirePro() {
  await requireSession();
  const session = await getServerSession(authOptions);
  const plan = await getPlanStatus((session?.user as any)?.id);
  if (!plan.isPro) {
    throw new Error('This feature requires a Pro or Cloud plan. Upgrade at /#pricing.');
  }
}

// ── Node ──────────────────────────────────────────────────────────────────────

export async function generatePreAuthKey() {
  await requireSession();
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
  await requireSession();
  await fetchHeadscale(`machine/${nodeId}`, { method: 'DELETE' });
  await logEvent('node.revoke', { nodeId });
  revalidatePath('/');
}

export async function renameMachineAction(nodeId: string, newName: string) {
  await requireSession();
  await _renameMachine(nodeId, newName);
  await logEvent('node.rename', { nodeId, newName });
  revalidatePath('/');
}

export async function expireNodeAction(nodeId: string) {
  await requireSession();
  await _expireMachine(nodeId);
  await logEvent('node.expire', { nodeId });
  revalidatePath('/');
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function enableRoute(routeId: string) {
  await requireSession();
  await fetchHeadscale(`routes/${routeId}/enable`, { method: 'POST' });
  revalidatePath('/routes');
}

export async function disableRoute(routeId: string) {
  await requireSession();
  await fetchHeadscale(`routes/${routeId}/enable`, { method: 'DELETE' });
  revalidatePath('/routes');
}

// ── Pre-auth keys ─────────────────────────────────────────────────────────────

export async function expireKeyAction(user: string, key: string) {
  await requireSession();
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
  await requireSession();
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
  await requireSession();
  await _createUser(name);
  await logEvent('user.create', { name });
  revalidatePath('/users');
}

export async function deleteUserAction(name: string) {
  await requireSession();
  await _deleteUser(name);
  await logEvent('user.delete', { name });
  revalidatePath('/users');
}

export async function renameUserAction(oldName: string, newName: string) {
  await requireSession();
  await _renameUser(oldName, newName);
  await logEvent('user.rename', { oldName, newName });
  revalidatePath('/users');
}

// ── ACL Policy ────────────────────────────────────────────────────────────────

export async function updatePolicyAction(policy: string) {
  await requireSession();
  await _setPolicy(policy);
  await logEvent('acl.update', {});
  revalidatePath('/settings');
}

// ── Visual ACL Builder (Pro) ──────────────────────────────────────────────────

export async function getTagGroupsAction() {
  await requirePro();
  return getTagGroups();
}

async function currentPolicyText(): Promise<string> {
  try {
    return policyTextFromResponse(await getPolicy());
  } catch {
    return '';
  }
}

export async function previewAclBuilderPolicyAction(rules: AclRule[]) {
  await requirePro();
  const groups = await getTagGroups();
  for (const rule of rules) {
    const err = validateRule(rule, groups);
    if (err) throw new Error(err);
  }
  const compiled = compilePolicy(rules, groups);
  const existing = await currentPolicyText();
  return existing.trim() ? mergeBuilderIntoExisting(existing, compiled) : compiled;
}

export async function applyAclBuilderPolicyAction(rules: AclRule[]) {
  await requirePro();
  const groups = await getTagGroups();
  for (const rule of rules) {
    const err = validateRule(rule, groups);
    if (err) throw new Error(err);
  }
  const compiled = compilePolicy(rules, groups);
  const existing = await currentPolicyText();
  const policy = existing.trim() ? mergeBuilderIntoExisting(existing, compiled) : compiled;
  await _setPolicy(policy);
  await logEvent('acl.update', { source: 'visual-builder', rules: String(rules.length), merged: String(!!existing.trim()) });
  revalidatePath('/settings');
  return policy;
}

export async function saveDnsRecordsAction(records: DnsExtraRecord[]) {
  await requireSession();
  for (const rec of records) {
    const err = validateDnsRecord(rec);
    if (err) throw new Error(err);
  }
  const existing = await currentPolicyText();
  if (!existing.trim()) throw new Error('Could not load the current ACL policy.');
  const next = setExtraRecords(existing, records);
  await _setPolicy(next);
  await logEvent('dns.update', { records: String(records.length) });
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
  await requireSession();
  await setNodeTags(nodeId, tags);
  await logEvent('tag.set', { nodeId, tags: tags.join(',') });
  revalidatePath('/dashboard');
}

export async function getTagsForNodesAction(nodeIds: string[]) {
  return getTagsForNodes(nodeIds);
}

// ── API Keys ───────────────────────────────────────────────────────────────

export async function generateApiKeyAction() {
  await requirePro();
  const record = await generateApiKey();
  await logEvent('apikey.generate', {});
  return record;
}

export async function getCurrentApiKeyAction() {
  return getCurrentApiKey();
}

export async function revokeApiKeyAction() {
  await requirePro();
  await revokeApiKey();
  await logEvent('apikey.revoke', {});
}

// ── Config Backups (Pro/Cloud) ───────────────────────────────────────────────

export async function createBackupAction() {
  await requirePro();
  const summary = await createBackup('manual');
  await logEvent('backup.create', { trigger: 'manual', nodes: String(summary.nodeCount), users: String(summary.userCount) });
  revalidatePath('/settings');
  return summary;
}

export async function listBackupsAction() {
  await requirePro();
  return listBackups();
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function saveNotificationConfigAction(patch: Partial<NotificationConfig>) {
  await requireSession();
  // Webhook + failover alerts are a Pro/Cloud perk; email stays free for everyone.
  if (patch.webhookEnabled || patch.failoverAlertsEnabled) {
    await requirePro();
  }
  const next = await saveNotificationConfig(patch);
  await logEvent('notifications.update', {
    emailEnabled: String(next.emailEnabled),
    webhookEnabled: String(next.webhookEnabled),
  });
  revalidatePath('/settings');
  return next;
}

export async function testNotificationAction() {
  await requireSession();
  const result = await sendTestAlert();
  await logEvent('alert.test', {
    email: String(result.email),
    webhook: String(result.webhook),
  });
  return result;
}

export async function activateLicenseAction(key: string) {
  await requireSession();
  const trimmed = key.trim();
  if (trimmed.length < 8) throw new Error('That doesn\'t look like a license key.');
  if (!kvConfigured()) {
    throw new Error('This instance has no KV store. Set KV_REDIS_URL, or set LAVAMESH_LICENSE_KEY in the environment and restart.');
  }
  await saveLicenseKey(trimmed);
  if (!(await hasLicenseKey())) {
    throw new Error('License could not be saved. Check KV_REDIS_URL on this instance.');
  }
  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

export async function restoreBackupPolicyAction(id: string) {
  await requirePro();
  const backup = await getBackup(id);
  if (!backup?.policy) throw new Error('This backup has no ACL policy to restore.');
  await _setPolicy(backup.policy);
  await logEvent('acl.update', { source: 'backup-restore', backupId: id });
  revalidatePath('/settings');
}

