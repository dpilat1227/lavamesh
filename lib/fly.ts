/**
 * lib/fly.ts — Thin client for the Fly.io Machines API.
 *
 * This is the real provisioning backend for LavaMesh Cloud: each Cloud tenant
 * gets its own Fly App running a single Machine (the official
 * `headscale/headscale` image) with a persistent volume for its SQLite data.
 *
 * Requires FLY_API_TOKEN (a deploy token scoped to the org — see
 * `fly tokens create org` or the Fly dashboard) and optionally FLY_ORG_SLUG
 * (defaults to "personal"). Without FLY_API_TOKEN, `flyConfigured()` returns
 * false and callers should fail provisioning honestly rather than pretend to
 * succeed — see app/api/provision/route.ts.
 *
 * Reference: https://fly.io/docs/machines/api/
 */

const FLY_API_BASE = 'https://api.machines.dev/v1';

export function flyConfigured(): boolean {
  return !!process.env.FLY_API_TOKEN;
}

function flyHeaders() {
  return {
    Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function flyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${FLY_API_BASE}${path}`, {
    ...options,
    headers: { ...flyHeaders(), ...options.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Fly API error ${res.status} on ${path}: ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface FlyMachine {
  id: string;
  name: string;
  state: string; // 'created' | 'starting' | 'started' | 'stopping' | 'stopped' | 'destroying' | 'destroyed'
  region: string;
  private_ip?: string;
  checks?: { name: string; status: string; output?: string }[];
}

/** Creates a Fly App to hold this tenant's Machine. Idempotent-ish: a 422 for "already taken" is swallowed. */
export async function createFlyApp(appName: string): Promise<void> {
  try {
    await flyFetch('/apps', {
      method: 'POST',
      body: JSON.stringify({ app_name: appName, org_slug: process.env.FLY_ORG_SLUG || 'personal' }),
    });
  } catch (e: any) {
    if (!String(e.message).includes('422')) throw e;
  }
}

/**
 * Machines are closed to the internet until the parent Fly App has an IP.
 * Shared IPv4 is what makes `https://<app>.fly.dev` actually route. This
 * uses Fly's GraphQL API (the Machines REST API doesn't allocate IPs).
 */
export async function allocateSharedIpv4(appName: string): Promise<void> {
  const res = await fetch('https://api.fly.io/graphql', {
    method: 'POST',
    headers: flyHeaders(),
    body: JSON.stringify({
      query: `mutation($input: AllocateIPAddressInput!) {
        allocateIpAddress(input: $input) { ipAddress { address type } }
      }`,
      variables: { input: { appId: appName, type: 'shared_v4' } },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    const msg = json.errors?.[0]?.message || res.statusText;
    // "already allocated" is fine — treat as success so reprovisioning is idempotent.
    if (!/already|taken|exists/i.test(String(msg))) {
      throw new Error(`Fly IP allocate failed for ${appName}: ${msg}`);
    }
  }
}

export async function deleteFlyApp(appName: string): Promise<void> {
  await flyFetch(`/apps/${appName}?force=true`, { method: 'DELETE' }).catch(() => {});
}

export interface CreatedVolume {
  id: string;
}

export async function createVolume(appName: string, name: string, region: string, sizeGb = 1): Promise<CreatedVolume> {
  return flyFetch<CreatedVolume>(`/apps/${appName}/volumes`, {
    method: 'POST',
    body: JSON.stringify({ name, region, size_gb: sizeGb, encrypted: true }),
  });
}

export interface CreateMachineOpts {
  appName: string;
  name: string;
  region: string;
  volumeId: string;
  image?: string;
  env: Record<string, string>;
  /** Files written into the Machine at boot — used to inject config.yaml and the bootstrap entrypoint. */
  files: { guestPath: string; content: string }[];
  /** Overrides the container's entrypoint+cmd (used to run our bootstrap script instead of `headscale serve` directly). */
  entrypoint?: string[];
  cmd?: string[];
}

export async function createMachine(opts: CreateMachineOpts): Promise<FlyMachine> {
  return flyFetch<FlyMachine>(`/apps/${opts.appName}/machines`, {
    method: 'POST',
    body: JSON.stringify({
      name: opts.name,
      region: opts.region,
      config: {
        image: opts.image || 'headscale/headscale:0.22.3',
        env: opts.env,
        init: opts.cmd ? { entrypoint: opts.entrypoint, cmd: opts.cmd } : undefined,
        files: opts.files.map(f => ({ guest_path: f.guestPath, raw_value: Buffer.from(f.content, 'utf-8').toString('base64') })),
        guest: { cpu_kind: 'shared', cpus: 1, memory_mb: 512 },
        mounts: [{ volume: opts.volumeId, path: '/data' }],
        services: [
          {
            protocol: 'tcp',
            internal_port: 8080,
            autostart: true,
            autostop: 'off',
            ports: [
              { port: 443, handlers: ['tls', 'http'] },
              { port: 80, handlers: ['http'], force_https: true },
            ],
          },
        ],
        checks: {
          alive: { type: 'http', port: 8080, method: 'GET', path: '/health', interval: '15s', timeout: '5s', grace_period: '20s' },
        },
        restart: { policy: 'on-failure', max_retries: 3 },
      },
    }),
  });
}

export async function getMachine(appName: string, machineId: string): Promise<FlyMachine> {
  return flyFetch<FlyMachine>(`/apps/${appName}/machines/${machineId}`);
}
