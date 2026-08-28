import type { Metadata } from 'next';
import BlogPostLayout from '@/components/blog/BlogPostLayout';
import { Lead, P, H2, UL, LI, Quote, Callout, Code } from '@/components/blog/Prose';
import { getPostBySlug } from '@/lib/blog';

const post = getPostBySlug('why-i-stopped-paying-for-a-mesh-vpn')!;

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
        I didn't set out to build a company. I set out to stop paying $6 a month per person for something I could
        run, total, for less than that on a box I already owned.
      </Lead>

      <P>
        I'd been on Tailscale for a couple of years — laptop, phone, a couple of home servers, an exit node for
        travel. It's a great product, and I'm not here to talk anyone out of it. But it bills per user. At some
        point I added my parents' router so I could fix their internet remotely without a four-call phone tree,
        then a friend's NAS because I was the only one who knew how to maintain it, and I looked at the invoice
        one month and did the thing you're not supposed to do: worked out the annual number.
      </P>

      <P>
        It wasn't outrageous. It also wasn't nothing, for what amounted to "a private network between machines I
        already own." That's the moment per-seat pricing stops feeling like a SaaS convenience fee and starts
        feeling like a tax on the fact that you know more people than you used to.
      </P>

      <H2>The weekend I went looking for a way out</H2>

      <P>
        I'd known Headscale existed for over a year and always found a reason to put it off. It comes up
        constantly in self-hosting circles as "the free Tailscale" — same protocol, same client apps, same
        WireGuard mesh underneath, just a binary you run yourself instead of a service you pay for. "Run your own
        control plane" sounded like a chore. I already had a control plane. I was just renting it.
      </P>

      <P>
        What changed wasn't the math — I'd known the math for a year. What changed is I'd started a CS master's
        at UChicago a few months earlier: a later-in-life pivot for me, not the usual path into this stuff.
        About a year into it now, and the program moves fast enough that most weeks feel like drinking from a
        fire hose. I liked it more than I expected to, mostly because I've always wanted to understand how
        something works underneath instead of just using it, and grad school turns out to be an efficient way to
        get handed exactly that. So instead of putting Headscale off another month, I opened the docs.
      </P>

      <P>
        Turned out to be less of a chore than I'd built it up to be. A VPS, a config file, a systemd unit, an
        afternoon — not a weekend, really, closer to a long lunch break. By that evening my laptop and phone were
        talking to each other through a server I controlled, for the cost of a $6/month VPS that would've cost
        me that much regardless of how many devices I put on it.
      </P>

      <Callout label="What changed and what didn't">
        Same encryption. Same NAT traversal. Same client app on every device — I didn't have to reinstall
        anything. The only thing that changed was who was running the coordination server, and what happens to my
        bill when I add a fifth device.
      </Callout>

      <H2>The part nobody mentions until you hit it</H2>

      <P>
        Here's the trade nobody spells out when they tell you to "just self-host it": you get the same network
        for free, and in exchange you get a command line and nothing else.
      </P>

      <P>
        To be fair, there are free dashboards for exactly this — headscale-ui, headscale-admin, Headplane, a
        handful of others floating around GitHub. If you're reading this wondering whether you can just grab one
        of those instead of anything below: yes, probably, try one first. I did. Some are fine for basic node
        listing. None of them handled the specific stuff that started mattering to me once this stopped being
        one person's homelab — an audit trail, a policy editor that caught my mistakes before I broke my own
        network, backups I actually trusted. A couple hadn't been touched in a year.
      </P>

      <P>
        That was fine for about a month. Then I added my parents' router again (this keeps happening), and now
        instead of "was this worth the money" I was asking myself "which of these six nodes named{' '}
        <Code>raspberrypi</Code> and <Code>raspberrypi-2</Code> is the one at their house," squinting at
        IP addresses in a terminal to find out.
      </P>

      <UL>
        <LI>Revoking a device meant finding its node ID first, which meant a command, which meant remembering the syntax</LI>
        <LI>Writing an ACL rule meant editing a HuJSON file and reloading it to find out if I'd typo'd a tag</LI>
        <LI>There was no way to look at the whole mesh at once — just a scrollable wall of monospace text</LI>
      </UL>

      <Quote>
        I didn't want to save money by trading a bill for a part-time terminal job. The whole point was that this
        should be less work than paying for it, not a different flavor of work.
      </Quote>

      <H2>So I built the dashboard I wanted</H2>

      <P>
        Not a Headscale fork — a layer that sits in front of a Headscale instance and talks to its existing API,
        so upgrading Headscale itself never becomes a problem I created for myself. Node status, key generation,
        ACL editing with something checking my work, a real log of who did what. The stuff any admin panel for
        any piece of infrastructure has, that Headscale never shipped because Headscale's job is running the
        control server correctly, not looking good doing it.
      </P>

      <P>
        The other thing shaping this, more than any single feature: I have close to zero patience for software
        that makes me feel stupid. Being confused by an interface is close to my least favorite feeling on earth,
        and I'd rather spend three extra hours making something simple than ship the version where the user has
        to stop and think. Apple gets a lot of credit for this, and deserves most of it — not because their
        products do more, but because using them asks less of you. That was the bar for LavaMesh: the
        infrastructure disappears, and you're just looking at your network.
      </P>

      <P>
        That's LavaMesh. The free tier is exactly the setup I'd want if I were back at day one of this — self-host
        it, own it, no seat limit worth mentioning. Pro exists for the stuff that shows up once it's not just your
        own devices anymore: backups, alerts, a few people other than you who need access. I priced it flat
        because the entire reason I went looking for this in the first place was resenting a bill that grew every
        time I trusted one more person.
      </P>

      <P>
        If you're sitting where I was — tired of the invoice, not sure self-hosting is worth the terminal tax —
        that's the trade I'm trying to remove. Same network, same devices, just without either the per-seat math
        or the part where you have to enjoy living in a shell to run it.
      </P>
    </BlogPostLayout>
  );
}
