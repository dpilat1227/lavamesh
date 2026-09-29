'use client';
import { CopyableCommand } from '@/components/ui';

/**
 * The roommate test: three steps, no curl lecture on the happy path.
 * loginServer is the tenant's own Headscale URL (Cloud) or HEADSCALE_PUBLIC_URL.
 */
export function AddDeviceCard({
  loginServer,
  authKey,
}: {
  loginServer: string;
  authKey?: string;
}) {
  return (
    <div className="space-y-4 text-left">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-4)' }}>1. Install the Tailscale app</p>
        <p className="text-[13px] leading-relaxed mb-2" style={{ color: 'var(--text-3)' }}>
          Phone or laptop — same app. Don&apos;t create a Tailscale account.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="https://tailscale.com/download" target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-[12px] px-3 py-1.5 rounded-[8px]" style={{ textDecoration: 'none' }}>
            Download Tailscale →
          </a>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-4)' }}>2. Login server</p>
        <p className="text-[12px] mb-2" style={{ color: 'var(--text-4)' }}>
          In the app, choose a custom server (or run the command below) and paste this:
        </p>
        <CopyableCommand command={loginServer} label="Login server" />
      </div>
      {authKey ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-4)' }}>3. Auth key</p>
          <p className="text-[12px] mb-2" style={{ color: 'var(--text-4)' }}>
            Paste this as the auth key. Shown once.
          </p>
          <CopyableCommand command={authKey} label="Auth key" />
        </div>
      ) : (
        <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>
          Generate a key in the next step, then come back here.
        </p>
      )}
    </div>
  );
}
