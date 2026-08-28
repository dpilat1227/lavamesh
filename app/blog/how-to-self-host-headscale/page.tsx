import type { Metadata } from 'next';
import BlogPostLayout from '@/components/blog/BlogPostLayout';
import { Lead, P, H2, H3, UL, LI, Quote, Callout, Code, Pre } from '@/components/blog/Prose';
import { getPostBySlug } from '@/lib/blog';

const post = getPostBySlug('how-to-self-host-headscale')!;

export const metadata: Metadata = {
  title: `${post.title} · LavaMesh Blog`,
  description: post.description,
  alternates: { canonical: `https://www.lavamesh.com/blog/${post.slug}` },
  openGraph: { title: post.title, description: post.description, url: `https://www.lavamesh.com/blog/${post.slug}`, type: 'article' },
};

export default function Page() {
  return (
    <BlogPostLayout post={post}>
      <Lead>
        This is the setup I actually run, written the way I wish the docs had been laid out the first time — one
        path, start to finish, with the parts that aren't obvious called out instead of buried in a GitHub issue
        from two years ago.
      </Lead>

      <P>
        Headscale is a self-hosted, open-source implementation of the Tailscale coordination server. You install
        it on a box you control, point the normal <Code>tailscale</Code> client at it instead of Tailscale's own
        servers, and you get the same WireGuard mesh — direct peer connections, NAT traversal, the works — with
        zero per-seat billing and zero company that can change your pricing next quarter. The tradeoff is that
        you're now the one keeping it running.
      </P>

      <Callout label="Before you start">
        You'll need a small VPS or home server that's reachable on the internet (a $5–6/mo box is plenty for
        personal use), a domain or subdomain pointed at it, and about 30 minutes. You do not need Kubernetes,
        Docker Swarm, or anything fancy — a single Linux box is the whole stack.
      </Callout>

      <H2>1. Get a server and point a domain at it</H2>

      <P>
        Any small VPS works — Hetzner, DigitalOcean, a spare box at home with a port forwarded, doesn't matter.
        Headscale is light; it's not doing the encryption itself, it's just handing out coordination info so your
        devices can find each other. Point a subdomain at its IP, something like <Code>hs.yourdomain.com</Code>.
        You'll want real TLS on this — Headscale's API and the client both expect HTTPS, not a bare IP.
      </P>

      <H2>2. Install Headscale</H2>

      <P>
        The project ships a single static binary, which is the easiest path if you don't already run everything
        in containers:
      </P>

      <Pre label="On the server">{`curl -LO https://github.com/juanfont/headscale/releases/latest/download/headscale_linux_amd64
sudo mv headscale_linux_amd64 /usr/local/bin/headscale
sudo chmod +x /usr/local/bin/headscale`}</Pre>

      <P>
        If you'd rather run it in Docker, the official image works the same way — mount a config directory and a
        data directory, expose the port, and skip to the config step below. Either path ends up in the same
        place.
      </P>

      <H2>3. Write the config file</H2>

      <P>
        Headscale ships a full example config with every option documented inline — grab it and trim it down. The
        handful of values that actually matter for a basic setup:
      </P>

      <Pre label="config.yaml">{`server_url: https://hs.yourdomain.com
listen_addr: 0.0.0.0:8080
metrics_listen_addr: 127.0.0.1:9090

database:
  type: sqlite
  sqlite:
    path: /var/lib/headscale/db.sqlite

dns:
  magic_dns: true
  base_domain: yourdomain.com`}</Pre>

      <P>
        <Code>server_url</Code> is the one people get wrong most often — it has to be the actual public HTTPS URL
        your devices will reach, not <Code>localhost</Code> and not the bare IP. If this is wrong, clients will
        register and then silently fail to stay connected, which is a genuinely annoying thing to debug at
        midnight.
      </P>

      <Callout label="The part the docs undersell">
        Headscale needs its listen port reachable through your reverse proxy — Caddy or nginx in front, forwarding{' '}
        <Code>hs.yourdomain.com</Code> to <Code>127.0.0.1:8080</Code>, handling the TLS cert. Caddy is the least
        painful option here; it gets you a valid cert with about four lines of Caddyfile and doesn't need you to
        think about renewal.
      </Callout>

      <H2>4. Run it as a service</H2>

      <P>
        Don't run this in a terminal tab and walk away — set up a systemd unit so it survives reboots and restarts
        on its own if it crashes:
      </P>

      <Pre label="/etc/systemd/system/headscale.service">{`[Unit]
Description=Headscale
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/headscale serve
WorkingDirectory=/etc/headscale
Restart=always

[Install]
WantedBy=multi-user.target`}</Pre>

      <Pre label="Enable and start it">{`sudo systemctl enable --now headscale
sudo systemctl status headscale`}</Pre>

      <H2>5. Create a user and connect your first device</H2>

      <P>
        Everything past this point happens through the <Code>headscale</Code> CLI, since there's no UI in the box
        yet:
      </P>

      <Pre label="On the server">{`headscale users create yourname
headscale preauthkeys create --user yourname --expiration 24h`}</Pre>

      <P>
        That last command prints a key. On any device with the normal <Code>tailscale</Code> client installed,
        point it at your server and hand it that key:
      </P>

      <Pre label="On the device">{`tailscale up --login-server https://hs.yourdomain.com --authkey <the key from above>`}</Pre>

      <P>
        If that connects, you're running your own private mesh. Check <Code>headscale nodes list</Code> on the
        server to confirm it registered — that command, and variations of it, are about to become your entire
        interface for anything involving nodes, keys, or users.
      </P>

      <H2>Mistakes worth skipping</H2>

      <UL>
        <LI>
          <strong style={{ color: 'white' }}>Wrong server_url after the fact.</strong> If you change it once
          devices are already registered, they need to re-auth — it's not a live-reloadable setting in practice.
          Get it right before you connect anything real.
        </LI>
        <LI>
          <strong style={{ color: 'white' }}>Forgetting the firewall.</strong> WireGuard needs its UDP port open,
          not just the HTTPS port for the coordination API. Direct connections silently fall back to relay if UDP
          is blocked — it'll still work, just slower, and you won't get an error telling you why.
        </LI>
        <LI>
          <strong style={{ color: 'white' }}>Running it without a reverse proxy.</strong> Serving raw HTTP on the
          coordination port instead of putting TLS in front of it works right up until a client version bump
          starts enforcing HTTPS, at which point everything breaks at once with no warning.
        </LI>
      </UL>

      <Quote>
        Everything above gets you a working mesh. It doesn't get you a way to see it — no dashboard, no node list
        beyond what you can read out of a terminal, no click-to-revoke. That part's a separate problem.
      </Quote>

      <H2>What comes next</H2>

      <P>
        This setup is genuinely solid once it's running — I've had mine up for months without touching the
        config. The part that gets old is everything after "it's running": remembering node IDs to revoke a lost
        device, hand-editing a HuJSON file for ACLs, piping <Code>headscale nodes list</Code> through{' '}
        <Code>grep</Code> to find one machine. That gap is the whole reason LavaMesh exists — same Headscale
        instance you just set up, with an actual dashboard sitting in front of it instead of a wall of monospace
        text.
      </P>
    </BlogPostLayout>
  );
}
