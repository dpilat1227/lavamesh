import { NextRequest, NextResponse } from 'next/server';
import { listNodes, createUser, createPreAuthKey } from '@/lib/headscale';

/**
 * Resolves the tenant user from:
 *   1. x-lavamesh-user header
 *   2. ?user= query param
 *   3. falls back to 'admin'
 */
function resolveTenant(req: NextRequest): string {
    const header = req.headers.get('x-lavamesh-user');
    if (header?.trim()) return header.trim();

    const param = req.nextUrl.searchParams.get('user');
    if (param?.trim()) return param.trim();

    return 'admin';
}

export async function GET(req: NextRequest) {
    try {
        const tenantUser = resolveTenant(req);
        const nodes = await listNodes(tenantUser);
        return NextResponse.json({ nodes, tenant: tenantUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const tenantUser = resolveTenant(req);

        // Ensure the namespace exists before creating a key for it
        await createUser(tenantUser);

        const data = await createPreAuthKey(tenantUser, true, false);
        return NextResponse.json({ ...data, tenant: tenantUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}