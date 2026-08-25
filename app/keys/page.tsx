import { listPreAuthKeys, getUsers } from '@/lib/headscale';
import { getPlanStatus } from '@/lib/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import KeysClient from './KeysClient';

export default async function KeysPage() {
  const [users, keys, session] = await Promise.all([
    getUsers().catch(() => []),
    // List keys for all users. Start with admin; expand to all users.
    getUsers()
      .then(us => Promise.all(us.map((u: any) => listPreAuthKeys(u.name).catch(() => []))))
      .then(nested => nested.flat())
      .catch(() => listPreAuthKeys('admin').catch(() => [])),
    getServerSession(authOptions),
  ]);

  const userNames = users.map((u: any) => u.name).filter(Boolean);
  if (!userNames.includes('admin')) userNames.unshift('admin');

  const plan = await getPlanStatus((session?.user as any)?.id).catch(() => ({ isPro: false }));

  return <KeysClient keys={keys} users={userNames} isPro={plan.isPro} />;
}
