/**
 * lib/tags.ts — Node display tags stored in Vercel KV.
 * Tags are separate from Headscale ACL tags — these are purely cosmetic labels
 * for organizing nodes in the dashboard UI.
 *
 * Storage: KV key `tags:{nodeId}` → JSON string[]
 */

import { kvGet, kvSet, kvDel } from '@/lib/kv';

function key(nodeId: string) {
  return `tags:${nodeId}`;
}

export async function getNodeTags(nodeId: string): Promise<string[]> {
  const tags = await kvGet<string[]>(key(nodeId));
  return tags ?? [];
}

export async function setNodeTags(nodeId: string, tags: string[]): Promise<void> {
  const cleaned = [...new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean))];
  if (cleaned.length === 0) {
    await kvDel(key(nodeId));
  } else {
    await kvSet(key(nodeId), cleaned);
  }
}

export async function addNodeTag(nodeId: string, tag: string): Promise<string[]> {
  const current = await getNodeTags(nodeId);
  const next = [...new Set([...current, tag.trim().toLowerCase()])].filter(Boolean);
  await kvSet(key(nodeId), next);
  return next;
}

export async function removeNodeTag(nodeId: string, tag: string): Promise<string[]> {
  const current = await getNodeTags(nodeId);
  const next = current.filter(t => t !== tag.trim().toLowerCase());
  if (next.length === 0) {
    await kvDel(key(nodeId));
  } else {
    await kvSet(key(nodeId), next);
  }
  return next;
}

/** Fetch tags for multiple nodes at once (returns a map nodeId → tags[]) */
export async function getTagsForNodes(nodeIds: string[]): Promise<Record<string, string[]>> {
  const entries = await Promise.all(
    nodeIds.map(async id => [id, await getNodeTags(id)] as [string, string[]])
  );
  return Object.fromEntries(entries);
}
