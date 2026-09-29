import { listPreAuthKeys, getUsers } from '@/lib/headscale';
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

  // Per-user key fetches used to swallow failures into `[]`, so a broken API
  // call rendered as a confident "No keys yet" — strictly worse than saying
  // we couldn't load them. Track which users failed and tell the user.
  const keysNested = await Promise.all(
    users.map((u: any) =>
      listPreAuthKeys(u.name).then(
        ks => ({ ok: true as const, user: u.name, keys: ks }),
        (e: any) => ({ ok: false as const, user: u.name, message: e?.message as string | undefined }),
      ),
    ),
  );
  const keys = keysNested.flatMap(r => (r.ok ? r.keys : []));
  const failedUsers = keysNested.filter(r => !r.ok).map(r => r.user);
  const firstKeyError = keysNested.find(r => !r.ok && r.message);

  // Fall back to a literal 'admin' option only when Headscale has no real users
  // yet (fresh install) — injecting it unconditionally used to let people
  // generate a key for a "user" that doesn't actually exist, which Headscale
  // then rejects (or silently mis-attributes) down the line.
  const userNames = users.map((u: any) => u.name).filter(Boolean);
  if (userNames.length === 0) userNames.push('admin');

  return (
    <KeysClient
      keys={keys}
      users={userNames}
      loadError={
        failedUsers.length > 0
          ? {
              message: `Couldn't load keys for ${failedUsers.length} user${failedUsers.length > 1 ? 's' : ''} (${failedUsers.join(', ')}). This list may be incomplete.`,
              detail: firstKeyError && !firstKeyError.ok ? firstKeyError.message : undefined,
            }
          : undefined
      }
    />
  );
}
