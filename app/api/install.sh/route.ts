import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const isEphemeral = searchParams.get('ephemeral') === 'true';
    const tag = searchParams.get('tag') || 'tag:server';
    const serverUrl = process.env.HEADSCALE_PUBLIC_URL || 'https://mesh.lavamesh.com';

    if (!token) {
        return new NextResponse('#!/bin/sh\necho "Error: Missing token parameter." >&2\nexit 1\n', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    const script = `#!/bin/sh
set -e

echo "==> [LavaMesh] Initializing node deployment..."

if ! command -v tailscale >/dev/null 2>&1; then
  echo "==> Installing official Tailscale client..."
  curl -fsSL https://tailscale.com/install.sh | sh
fi

sudo sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true
sudo sysctl -w net.ipv6.conf.all.forwarding=1 >/dev/null 2>&1 || true

echo "==> Connecting to LavaMesh control plane..."
sudo tailscale up \\
  --login-server="${serverUrl}" \\
  --authkey="${token}" \\
  --advertise-tags="${tag}" \\
  ${isEphemeral ? '--ephemeral' : ''} \\
  --accept-routes \\
  --accept-dns=true \\
  --reset

echo "==> Node connected successfully! Assigned IP:"
tailscale ip -4
`;

    return new NextResponse(script, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}