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
  const allNodes = nodesResult.status === 'fulfilled' ? nodesResult.value : [];

  // Count nodes per user
  const nodeCounts: Record<string, number> = {};
  for (const node of allNodes) {
    const uname = node.user?.name || 'admin';
    nodeCounts[uname] = (nodeCounts[uname] || 0) + 1;
  }

  return <UsersClient users={users} nodeCounts={nodeCounts} />;
}
