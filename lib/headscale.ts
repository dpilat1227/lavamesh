import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Login-server URL Tailscale clients should use (`tailscale up --login-server=`).
 * Tenant-aware like fetchHeadscale below: a Cloud tenant on its own dedicated
 * Headscale instance must get *that* instance's URL here, or a device runs
 * `tailscale up` against the wrong server entirely — the authkey is only
 * valid on the tenant's own instance, so the node silently never joins (and
 * never appears anywhere, since it's not registered against the server this
 * dashboard queries). Falls back to the single-tenant env config otherwise.
 */
export async function headscaleLoginServer(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (userId) {
      const tenantUser = await prisma.tenantUser.findFirst({
        where: { userId },
        include: { tenant: { include: { headscaleInstance: true } } },
      });
      const instance = tenantUser?.tenant?.headscaleInstance;
      if (instance?.status === 'active' && instance.url) {
        return instance.url.replace(/\/$/, '');
      }
    }
  } catch {}
  if (process.env.HEADSCALE_PUBLIC_URL?.trim()) {
    return process.env.HEADSCALE_PUBLIC_URL.replace(/\/$/, '');
  }
  const api = (process.env.HEADSCALE_API_URL || '').replace(/\/$/, '');
  return api.replace(/\/api\/v1$/i, '') || 'https://mesh.lavamesh.com';
}

function isNotFound(err: unknown): boolean {
  return /Headscale API error \(404\)/.test(String((err as Error)?.message ?? err));
}

function nodeAlias(endpoint: string): string | null {
  if (endpoint === 'machine' || endpoint.startsWith('machine?') || endpoint.startsWith('machine/')) {
    return endpoint.replace(/^machine/, 'node');
  }
  return null;
}

export async function fetchHeadscale(endpoint: string, options: RequestInit = {}) {
  let baseUrl = process.env.HEADSCALE_API_URL || "https://api.lavamesh.com";
  let apiKey = process.env.HEADSCALE_API_KEY || "";

  // Cloud tenants: only route to a dedicated instance that's actually ready.
  // A leftover 'error'/'provisioning' row with an empty apiKey would otherwise
  // shadow the self-hosted ENV and break the whole dashboard.
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.id) {
      const tenantUser = await prisma.tenantUser.findFirst({
        where: { userId: (session?.user as any).id },
        include: { tenant: { include: { headscaleInstance: true } } }
      });

      const instance = tenantUser?.tenant?.headscaleInstance;
      if (instance?.status === 'active' && instance.apiKey && instance.url) {
        baseUrl = instance.url;
        apiKey = instance.apiKey;
      }
    }
  } catch (e) {
    console.warn("Could not fetch dynamic Headscale config, falling back to ENV", e);
  }

  const attempt = async (ep: string) => {
    const url = `${baseUrl}/api/v1/${ep}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Headscale API error (${res.status}): ${errorText}`);
      }

      return res.json();
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        throw new Error(`Headscale API timeout — could not reach ${baseUrl} within 8s`);
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await attempt(endpoint);
  } catch (e) {
    // Headscale 0.23+ renamed /machine → /node. Retry once so both generations work.
    const aliased = nodeAlias(endpoint);
    if (aliased && isNotFound(e)) {
      const data = await attempt(aliased);
      if (data && data.nodes && !data.machines) data.machines = data.nodes;
      if (data && data.node && !data.machine) data.machine = data.node;
      return data;
    }
    throw e;
  }
}

// ── Machines ──────────────────────────────────────────────────────────────────

export async function getNodes(user?: string) {
  const qs = user ? `?user=${encodeURIComponent(user)}` : "";
  const data = await fetchHeadscale(`machine${qs}`);
  return data.machines || data.nodes || [];
}

export async function deleteMachine(machineId: string | number) {
  return fetchHeadscale(`machine/${machineId}`, { method: "DELETE" });
}

export async function renameMachine(machineId: string | number, newName: string) {
  return fetchHeadscale(`machine/${machineId}/rename/${encodeURIComponent(newName)}`, { method: "POST" });
}

/** Force the node to reauthenticate without deleting it from the registry. */
export async function expireMachine(machineId: string | number) {
  return fetchHeadscale(`machine/${machineId}/expire`, { method: "POST" });
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function getRoutes() {
  const data = await fetchHeadscale("routes");
  return data.routes || [];
}

export async function getMachineRoutes(machineId: string | number) {
  const data = await fetchHeadscale(`machine/${machineId}/routes`);
  return data.routes || [];
}

export async function enableRoute(routeId: string | number) {
  return fetchHeadscale(`routes/${routeId}/enable`, { method: "POST" });
}

export async function disableRoute(routeId: string | number) {
  return fetchHeadscale(`routes/${routeId}/enable`, { method: "DELETE" });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers() {
  const data = await fetchHeadscale("user");
  return data.users || [];
}

export async function createUser(name: string) {
  try {
    return await fetchHeadscale("user", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  } catch (err: any) {
    const msg: string = err?.message ?? "";
    if (
      /\b(400|409)\b/.test(msg) ||
      msg.includes("UNIQUE constraint failed") ||
      msg.includes("already exists")
    ) {
      return { user: { name } };
    }
    throw err;
  }
}

export async function deleteUser(name: string) {
  return fetchHeadscale(`user/${encodeURIComponent(name)}`, { method: "DELETE" });
}

export async function renameUser(oldName: string, newName: string) {
  return fetchHeadscale(
    `user/${encodeURIComponent(oldName)}/rename/${encodeURIComponent(newName)}`,
    { method: "POST" }
  );
}

// ── Pre-auth keys ─────────────────────────────────────────────────────────────

export async function createPreAuthKey(
  user: string = "admin",
  reusable: boolean = true,
  ephemeral: boolean = false
) {
  const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return fetchHeadscale("preauthkey", {
    method: "POST",
    body: JSON.stringify({ user, reusable, ephemeral, expiration }),
  });
}

export async function listPreAuthKeys(user: string = "admin") {
  const data = await fetchHeadscale(`preauthkey?user=${encodeURIComponent(user)}`);
  return data.preAuthKeys || data.preauthkeys || [];
}

export async function expirePreAuthKey(user: string, key: string) {
  return fetchHeadscale("preauthkey/expire", {
    method: "POST",
    body: JSON.stringify({ user, key }),
  });
}

// ── ACL / Policy ──────────────────────────────────────────────────────────────

export async function getPolicy() {
  // Headscale v0.22+ exposes policy via /api/v1/policy
  // Falls back gracefully if the endpoint doesn't exist on older builds
  return fetchHeadscale("policy");
}

export async function setPolicy(policy: string) {
  return fetchHeadscale("policy", {
    method: "PUT",
    body: JSON.stringify({ policy }),
  });
}

// ── DNS ───────────────────────────────────────────────────────────────────────

export async function getDnsConfig() {
  return fetchHeadscale("dns/routes");
}

export async function getNameservers() {
  return fetchHeadscale("dns/nameservers");
}
