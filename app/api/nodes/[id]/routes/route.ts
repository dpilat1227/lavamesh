import { NextRequest, NextResponse } from 'next/server';
import { getNodeRoutes, enableNodeRoutes } from '@/lib/headscale';

/**
 * GET /api/nodes/[id]/routes
 * Returns the advertised and enabled routes for a node.
 */
export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: 'Missing node ID' }, { status: 400 });
        }

        const data = await getNodeRoutes(id);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch routes' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/nodes/[id]/routes
 * Body: { routes: string[] }
 * Approves/enables the specified advertised routes for a node.
 */
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: 'Missing node ID' }, { status: 400 });
        }

        const body = await req.json();
        const routes: string[] = body?.routes;

        if (!Array.isArray(routes) || routes.length === 0) {
            return NextResponse.json(
                { error: 'Body must include a non-empty routes array' },
                { status: 400 }
            );
        }

        const data = await enableNodeRoutes(id, routes);
        return NextResponse.json({ success: true, ...data });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Failed to enable routes' },
            { status: 500 }
        );
    }
}
