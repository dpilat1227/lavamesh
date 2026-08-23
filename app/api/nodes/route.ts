import { NextResponse } from 'next/server';
import { listNodes, createPreAuthKey } from '@/lib/headscale';

export async function GET() {
    try {
        const nodes = await listNodes();
        return NextResponse.json({ nodes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST() {
    try {
        const data = await createPreAuthKey('admin', true, false);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}