import { listPreAuthKeys, getUsers } from '@/lib/headscale';
import KeysClient from './KeysClient';

export default async function KeysPage() {
  const [users, keys] = await Promise.all([
    getUsers().catch(() => []),
    // List keys for all users. Start with admin; expand to all users.
    getUsers()
      .then(us => Promise.all(us.map((u: any) => listPreAuthKeys(u.name).catch(() => []))))
      .then(nested => nested.flat())
      .catch(() => listPreAuthKeys('admin').catch(() => [])),
  ]);

  const userNames = users.map((u: any) => u.name).filter(Boolean);
  if (!userNames.includes('admin')) userNames.unshift('admin');

  return <KeysClient keys={keys} users={userNames} />;
}
