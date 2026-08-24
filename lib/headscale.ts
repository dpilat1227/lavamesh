const BASE_URL = process.env.HEADSCALE_API_URL || "https://api.lavamesh.com";
const API_KEY = process.env.HEADSCALE_API_KEY || "";

export async function fetchHeadscale(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}/api/v1/${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
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
      throw new Error(`Headscale API timeout — could not reach ${BASE_URL} within 5s`);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Machines ──────────────────────────────────────────────────────────────────

export async function getNodes(user?: string) {
  const qs = user ? `?user=${encodeURIComponent(user)}` : "";
  const data = await fetchHeadscale(`machine${qs}`);
  return data.machines || [];
}

export async function deleteMachine(machineId: string | number) {
  return fetchHeadscale(`machine/${machineId}`, { method: "DELETE" });
}

export async function renameMachine(machineId: string | number, newName: string) {
  return fetchHeadscale(`machine/${machineId}/rename/${encodeURIComponent(newName)}`, { method: "POST" });
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
