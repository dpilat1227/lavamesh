import { getUsers, getNodes } from '@/lib/headscale';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const [users, allNodes] = await Promise.all([
    getUsers().catch(() => []),
    getNodes().catch(() => []),
  ]);

  // Count nodes per user
  const nodeCounts: Record<string, number> = {};
  for (const node of allNodes) {
    const uname = node.user?.name || 'admin';
    nodeCounts[uname] = (nodeCounts[uname] || 0) + 1;
  }

  return <UsersClient users={users} nodeCounts={nodeCounts} />;
}
