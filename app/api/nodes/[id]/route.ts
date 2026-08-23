import { NextRequest, NextResponse } from 'next/server';
import { deleteNode } from '@/lib/headscale';

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing node ID' }, { status: 400 });
    }

    await deleteNode(id);
    return NextResponse.json({ success: true, message: `Node ${id} removed` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete node' }, { status: 500 });
  }
}
