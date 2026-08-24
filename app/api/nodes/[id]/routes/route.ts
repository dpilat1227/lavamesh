import { NextRequest, NextResponse } from "next/server";
import { getMachineRoutes, enableRoute } from "@/lib/headscale";

/**
 * GET /api/nodes/[id]/routes
 * Returns advertised routes for a machine.
 */
export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "Missing machine ID" }, { status: 400 });
        }
        const routes = await getMachineRoutes(id);
        return NextResponse.json({ routes });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to fetch routes" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/nodes/[id]/routes
 * Body: { routeIds: string[] }
 * Enables the specified route IDs for a machine.
 *
 * Note: Headscale v0.22.3 enables routes individually by route ID
 * via POST /api/v1/routes/:routeId/enable, not by CIDR prefix.
 */
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "Missing machine ID" }, { status: 400 });
        }

        const body = await req.json();
        const routeIds: string[] = body?.routeIds ?? body?.routes ?? [];

        if (!Array.isArray(routeIds) || routeIds.length === 0) {
            return NextResponse.json(
                { error: "Body must include a non-empty routeIds array" },
                { status: 400 }
            );
        }

        await Promise.all(routeIds.map((rid) => enableRoute(rid)));
        return NextResponse.json({ success: true, enabled: routeIds });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Failed to enable routes" },
            { status: 500 }
        );
    }
}
