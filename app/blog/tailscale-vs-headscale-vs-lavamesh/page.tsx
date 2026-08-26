import type { Metadata } from 'next';
import BlogPostLayout from '@/components/blog/BlogPostLayout';
import { Lead, P, H2, H3, UL, LI, Table, Callout, Code } from '@/components/blog/Prose';
import { getPostBySlug } from '@/lib/blog';

const post = getPostBySlug('tailscale-vs-headscale-vs-lavamesh')!;

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
        People ask me this in roughly the same three sentences every time: "isn't Headscale just free Tailscale?
        And isn't LavaMesh just... Headscale with a coat of paint?" Kind of, and no, in that order. Here's the
        actual breakdown.
      </Lead>

      <P>
        All three of these move your traffic the same way — WireGuard tunnels, direct peer-to-peer connections
        when NAT allows it, relay servers when it doesn't. If you're picking based on "which one has better
        encryption" or "which one is faster," stop — they're functionally the same pipe. The differences are
        entirely about who runs the control plane, what it costs, and how much of the operational work lands on
        you.
      </P>

      <H2>The one-paragraph version of each</H2>

      <P>
        <strong style={{ color: 'white' }}>Tailscale</strong> is the commercial product: a hosted coordination
        server run by Tailscale Inc., a polished app on every platform, and a pricing page with your name on a
        per-seat line item. <strong style={{ color: 'white' }}>Headscale</strong> is an open-source, community-built
        reimplementation of that same coordination server, designed to be self-hosted — same client apps, same
        protocol, but you run the brain yourself, for free, from a terminal.{' '}
        <strong style={{ color: 'white' }}>LavaMesh</strong> is a dashboard that sits in front of a Headscale
        instance you're already running (or spin up fresh) — it doesn't replace Headscale, it's the admin panel
        Headscale never shipped with.
      </P>

      <H2>Where the money goes</H2>

      <P>
        This is the part people actually care about, so let's not bury it. Tailscale bills per user, per month,
        and that number climbs with every seat regardless of how many devices that person adds. Headscale is free
        because you're running the server — your VPS bill is the only cost, and that doesn't move whether you
        have 3 devices or 300. LavaMesh's Community tier is also free; the Pro tier is a flat $19/month (or $149
        once, forever) no matter how large your mesh gets.
      </P>

      <Table
        headers={['', 'Tailscale', 'Headscale', 'LavaMesh Pro']}
        rows={[
          ['Pricing model', 'Per seat', 'Free (self-hosted)', 'Flat rate'],
          ['50-device fleet', '$300–900/mo', '$0 + your VPS', '$19/mo flat'],
          ['Web dashboard', 'Yes', 'None (CLI only)', 'Yes'],
          ['Self-hosted', 'No', 'Yes', 'Yes'],
          ['Open source', 'No', 'Yes', 'Core is open'],
          ['Who runs the server', 'Tailscale Inc.', 'You', 'You'],
        ]}
      />

      <H2>Where each one actually makes sense</H2>

      <H3>Tailscale — when convenience is worth paying for</H3>
      <P>
        If you're at a company that needs SSO, compliance paperwork, a support contract, and zero interest in
        running infrastructure, Tailscale is the right call. You're not paying for the VPN; you're paying for
        someone else to be on-call for it. That's a completely reasonable trade at a certain team size and budget.
      </P>

      <H3>Raw Headscale — when you want it free and don't mind the terminal</H3>
      <P>
        If you're comfortable in a terminal, don't mind hand-editing a HuJSON ACL file, and genuinely don't need
        much more than "list my nodes and revoke one occasionally," raw Headscale with no dashboard at all is a
        perfectly fine way to run a small personal mesh. It's what I did for months before this became a problem
        worth solving.
      </P>

      <H3>LavaMesh — when you want Headscale's economics with a real interface</H3>
      <P>
        This is the gap I built LavaMesh for: you want to own your infrastructure and pay flat instead of per-seat,
        but you don't want to run <Code>headscale nodes list</Code> every time you need to know if your parents'
        router is still online. It's Headscale's cost structure with an actual dashboard on top — node status,
        key management, ACL editing, users, all clickable.
      </P>

      <Callout label="The honest caveat">
        LavaMesh doesn't have Tailscale's polish on every platform, SSO integrations, or a support team on
        standby. If your company needs those, this isn't a replacement — it's built for the self-hoster who
        Tailscale's pricing was never really for in the first place.
      </Callout>

      <H2>What doesn't change no matter which you pick</H2>

      <UL>
        <LI>The client on your devices — same <Code>tailscale</Code> app either way</LI>
        <LI>The transport — WireGuard, direct connections, DERP-style relays as fallback</LI>
        <LI>Your devices can move between coordination servers if you ever change your mind</LI>
      </UL>

      <P>
        That last point matters more than people think. Switching your control plane later isn't a rebuild — it's
        a re-auth. So the actual decision here is lower-stakes than it feels: pick based on who should be paying
        for your VPN and who should be maintaining it, not because you're locking yourself into anything permanent.
      </P>
    </BlogPostLayout>
  );
}
