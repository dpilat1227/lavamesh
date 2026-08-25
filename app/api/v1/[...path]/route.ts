/**
 * app/api/v1/[...path]/route.ts
 * REST proxy that forwards requests to the Headscale API.
 * Requires a valid Bearer token (lm_*) generated from the Settings page.
 *
 * Usage:
 *   curl https://www.lavamesh.com/api/v1/machine \
 *     -H "Authorization: Bearer lm_xxxxxxxxxxxxxxxx"
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/apikeys';

const HEADSCALE_BASE = process.env.HEADSCALE_API_URL || 'https://api.lavamesh.com';
const HEADSCALE_KEY = process.env.HEADSCALE_API_KEY || '';

type Params = { path: string[] };

async function handler(req: NextRequest, { params }: { params: Promise<Params> }) {
  // Validate our custom Bearer token
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const valid = await validateApiKey(token);
  if (!valid) {
    return NextResponse.json(
      { error: 'Invalid or missing API key. Generate one at lavamesh.com/settings.' },
      { status: 401 }
    );
  }

  // Forward to Headscale
  const { path } = await params;
  const headscalePath = path.join('/');
  const qs = req.nextUrl.search;
  const url = `${HEADSCALE_BASE}/api/v1/${headscalePath}${qs}`;

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined;

  const upstream = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${HEADSCALE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body || undefined,
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
