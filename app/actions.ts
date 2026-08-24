'use server';
import {
  fetchHeadscale,
  expirePreAuthKey as _expireKey,
  deleteUser as _deleteUser,
  createUser as _createUser,
  renameUser as _renameUser,
  renameMachine as _renameMachine,
  setPolicy as _setPolicy,
} from '@/lib/headscale';
import { revalidatePath } from 'next/cache';

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
  revalidatePath('/');
}

export async function renameMachineAction(nodeId: string, newName: string) {
  await _renameMachine(nodeId, newName);
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
  revalidatePath('/keys');
  return res.preAuthKey?.key || res.key || '';
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function createUserAction(name: string) {
  await _createUser(name);
  revalidatePath('/users');
}

export async function deleteUserAction(name: string) {
  await _deleteUser(name);
  revalidatePath('/users');
}

export async function renameUserAction(oldName: string, newName: string) {
  await _renameUser(oldName, newName);
  revalidatePath('/users');
}

// ── ACL Policy ────────────────────────────────────────────────────────────────

export async function updatePolicyAction(policy: string) {
  await _setPolicy(policy);
  revalidatePath('/settings');
}
