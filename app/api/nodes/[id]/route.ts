import { NextRequest, NextResponse } from "next/server";
import { deleteMachine } from "@/lib/headscale";

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "Missing machine ID" }, { status: 400 });
        }
        await deleteMachine(id);
        return NextResponse.json({ success: true, message: `Machine ${id} removed` });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to delete machine" }, { status: 500 });
    }
}
