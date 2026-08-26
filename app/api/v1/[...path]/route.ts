/**
 * app/api/v1/[...path]/route.ts
 * REST proxy that forwards requests to the Headscale API.
 * Requires a valid Bearer token (lm_*) generated from the Settings page.
 *
 * Usage:
 *   curl https://www.lavamesh.com/api/v1/node \
 *     -H "Authorization: Bearer lm_xxxxxxxxxxxxxxxx"
 *
 * Headscale 0.23+ renamed /machine → /node. If /machine 404s we retry /node.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/apikeys';

const HEADSCALE_BASE = process.env.HEADSCALE_API_URL || 'https://api.lavamesh.com';
const HEADSCALE_KEY = process.env.HEADSCALE_API_KEY || '';

type Params = { path: string[] };

function nodeAliasPath(headscalePath: string): string | null {
  if (headscalePath === 'machine' || headscalePath.startsWith('machine/') || headscalePath.startsWith('machine?')) {
    return headscalePath.replace(/^machine/, 'node');
  }
  return null;
}

async function forward(headscalePath: string, qs: string, req: NextRequest, body: string | undefined) {
  const url = `${HEADSCALE_BASE}/api/v1/${headscalePath}${qs}`;
  return fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${HEADSCALE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body || undefined,
  });
}

async function handler(req: NextRequest, { params }: { params: Promise<Params> }) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const valid = await validateApiKey(token);
  if (!valid) {
    return NextResponse.json(
      { error: 'Invalid or missing API key. Generate one at lavamesh.com/settings.' },
      { status: 401 }
    );
  }

  const { path } = await params;
  const headscalePath = path.join('/');
  const qs = req.nextUrl.search;

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined;

  let upstream = await forward(headscalePath, qs, req, body);
  const aliased = nodeAliasPath(headscalePath);
  if (upstream.status === 404 && aliased) {
    upstream = await forward(aliased, qs, req, body);
  }

  const data = await upstream.json().catch(() => ({}));
  if (data && data.nodes && !data.machines) data.machines = data.nodes;
  if (data && data.node && !data.machine) data.machine = data.node;
  return NextResponse.json(data, { status: upstream.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
