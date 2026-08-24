const BASE_URL = process.env.HEADSCALE_API_URL || "https://api.lavamesh.com";
const API_KEY = process.env.HEADSCALE_API_KEY || "";

export async function fetchHeadscale(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}/api/v1/${endpoint}`;
  const res = await fetch(url, {
    ...options,
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
}

// ── Machines (Headscale v0.22.3 uses "machine" not "node") ───────────────────

export async function getNodes(user?: string) {
  const qs = user ? `?user=${encodeURIComponent(user)}` : "";
  const data = await fetchHeadscale(`machine${qs}`);
  return data.machines || [];
}

export async function deleteMachine(machineId: string | number) {
  return fetchHeadscale(`machine/${machineId}`, { method: "DELETE" });
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

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers() {
  const data = await fetchHeadscale("user");
  return data.users || [];
}

/**
 * Creates a Headscale user/namespace. Returns cleanly if the user already
 * exists — Headscale may respond with 400, 409, or a 500 UNIQUE constraint
 * error depending on version.
 */
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
