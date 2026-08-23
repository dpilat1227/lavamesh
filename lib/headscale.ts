const HEADSCALE_API_URL = process.env.HEADSCALE_API_URL || 'https://mesh.lavamesh.com/api/v1';
const HEADSCALE_API_KEY = process.env.HEADSCALE_API_KEY || '';

interface HeadscaleFetchOptions {
    method?: string;
    body?: any;
}

export async function headscaleFetch(path: string, options: HeadscaleFetchOptions = {}) {
    const res = await fetch(`${HEADSCALE_API_URL}${path}`, {
        method: options.method || 'GET',
        headers: {
            'Authorization': `Bearer ${HEADSCALE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: 'no-store',
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Headscale API error (${res.status}): ${errText}`);
    }

    return res.json();
}

/**
 * Ensures a Headscale user/namespace exists. Gracefully ignores 400/409 errors
 * (user already exists) so this is safe to call idempotently before key creation.
 */
export async function createUser(name: string) {
    try {
        return await headscaleFetch('/user', {
            method: 'POST',
            body: { name },
        });
    } catch (err: any) {
        // 400 / 409 both mean the user already exists — not an error for our purposes
        if (/\b(400|409)\b/.test(err?.message ?? '')) {
            return null;
        }
        throw err;
    }
}

export async function createPreAuthKey(user: string = 'admin', reusable: boolean = true, ephemeral: boolean = false) {
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return headscaleFetch('/preauthkey', {
        method: 'POST',
        body: {
            user,
            reusable,
            ephemeral,
            expiration,
        },
    });
}

export async function listNodes(user?: string) {
    const path = user ? `/node?user=${encodeURIComponent(user)}` : '/node';
    const data = await headscaleFetch(path);
    return data.nodes || [];
}

export async function deleteNode(nodeId: string | number) {
    return headscaleFetch(`/node/${nodeId}`, {
        method: 'DELETE',
    });
}

/** Returns the routes advertised by a node (advertised + enabled status). */
export async function getNodeRoutes(nodeId: string | number) {
    return headscaleFetch(`/node/${nodeId}/routes`);
}

/**
 * Enables/approves a list of subnet routes for a node.
 * Headscale expects POST /node/:id/routes with body { routes: string[] }.
 */
export async function enableNodeRoutes(nodeId: string | number, routes: string[]) {
    return headscaleFetch(`/node/${nodeId}/routes`, {
        method: 'POST',
        body: { routes },
    });
}