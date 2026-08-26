import { listPreAuthKeys, getUsers } from '@/lib/headscale';
import { getPlanStatus } from '@/lib/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import KeysClient from './KeysClient';
import HeadscaleUnavailable from '@/components/HeadscaleUnavailable';

export const dynamic = 'force-dynamic';

export default async function KeysPage() {
  let users: any[] = [];
  try {
    users = await getUsers();
  } catch (e: any) {
    return <HeadscaleUnavailable message={e?.message} />;
  }

  const keysNested = await Promise.all(users.map((u: any) => listPreAuthKeys(u.name).catch(() => [])));
  const keys = keysNested.flat();
  const session = await getServerSession(authOptions);

  const userNames = users.map((u: any) => u.name).filter(Boolean);
  if (!userNames.includes('admin')) userNames.unshift('admin');

  const plan = await getPlanStatus((session?.user as any)?.id).catch(() => ({ isPro: false }));

  return <KeysClient keys={keys} users={userNames} isPro={plan.isPro} />;
}
