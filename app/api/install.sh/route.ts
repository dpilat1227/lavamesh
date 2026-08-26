import { NextRequest, NextResponse } from 'next/server';
import { headscaleLoginServer } from '@/lib/headscale';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const isEphemeral = searchParams.get('ephemeral') === 'true';
    const tag = searchParams.get('tag');
    const routes = searchParams.get('routes'); // e.g. "192.168.1.0/24,10.0.0.0/16"
    const serverUrl = await headscaleLoginServer();

    if (!token) {
        return new NextResponse('#!/bin/sh\necho "Error: Missing token parameter." >&2\nexit 1\n', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    const tagFlag = tag ? `--advertise-tags="${tag}" \\` : '';
    const ephemeralFlag = isEphemeral ? '--ephemeral \\' : '';
    const routesFlag = routes ? `--advertise-routes="${routes}" \\` : '';

    // When advertising routes on Linux, persist IP forwarding so it survives reboots.
    const linuxIpForwarding = routes
        ? `
  # Persist IP forwarding for subnet routing
  echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf > /dev/null
  echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf > /dev/null
  sudo sysctl -p /etc/sysctl.d/99-tailscale.conf > /dev/null`
        : `
  sudo sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true
  sudo sysctl -w net.ipv6.conf.all.forwarding=1 >/dev/null 2>&1 || true`;

    const script = `#!/bin/sh
set -e

echo "==> [LavaMesh] Initializing node deployment..."

OS="$(uname -s)"
case "$OS" in
  Linux*)
    if ! command -v tailscale >/dev/null 2>&1; then
      echo "==> Installing Tailscale on Linux..."
      curl -fsSL https://tailscale.com/install.sh | sh
    fi${linuxIpForwarding}
    ;;
  Darwin*)
    if ! command -v tailscale >/dev/null 2>&1; then
      echo "==> Installing Tailscale CLI via Homebrew..."
      brew install tailscale
      sudo brew services start tailscale
    fi
    ;;
  *)
    echo "Unsupported OS: $OS" >&2
    exit 1
    ;;
esac

echo "==> Connecting to LavaMesh control plane..."
sudo tailscale up \\
  --login-server="${serverUrl}" \\
  --authkey="${token}" \\
  ${tagFlag}
  ${routesFlag}
  ${ephemeralFlag}
  --accept-routes \\
  --accept-dns=true \\
  --reset

echo "==> Node connected successfully! Assigned IP:"
tailscale ip -4
${routes ? `\necho "==> Advertising subnet routes: ${routes}"` : ''}
`;

    return new NextResponse(script, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}