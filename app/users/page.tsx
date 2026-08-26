import { getUsers, getNodes } from '@/lib/headscale';
import UsersClient from './UsersClient';
import HeadscaleUnavailable from '@/components/HeadscaleUnavailable';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const [usersResult, nodesResult] = await Promise.allSettled([getUsers(), getNodes()]);
  if (usersResult.status === 'rejected' && nodesResult.status === 'rejected') {
    return <HeadscaleUnavailable message={usersResult.reason?.message} />;
  }

  const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
  const allNodes: any[] = nodesResult.status === 'fulfilled' ? nodesResult.value : [];

  // Group nodes per user — the inspector pane needs more than a count (which
  // node, is it online) once someone clicks into a user.
  const nodeCounts: Record<string, number> = {};
  const nodesByUser: Record<string, { id: string; givenName: string; online: boolean; lastSeen: string }[]> = {};
  for (const node of allNodes) {
    const uname = node.user?.name || 'admin';
    nodeCounts[uname] = (nodeCounts[uname] || 0) + 1;
    (nodesByUser[uname] ||= []).push({ id: node.id, givenName: node.givenName, online: node.online, lastSeen: node.lastSeen });
  }

  return <UsersClient users={users} nodeCounts={nodeCounts} nodesByUser={nodesByUser} />;
}
