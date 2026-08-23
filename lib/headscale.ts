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

export async function listNodes() {
    const data = await headscaleFetch('/node');
    return data.nodes || [];
}