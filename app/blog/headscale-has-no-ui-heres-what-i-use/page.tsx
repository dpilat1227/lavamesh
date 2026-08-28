import type { Metadata } from 'next';
import BlogPostLayout from '@/components/blog/BlogPostLayout';
import { Lead, P, H2, UL, LI, Quote, Callout, Code } from '@/components/blog/Prose';
import { getPostBySlug } from '@/lib/blog';

const post = getPostBySlug('headscale-has-no-ui-heres-what-i-use')!;

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
        Headscale is, hands down, one of my favorite pieces of self-hosted software. It's also, out of the box,
        a command-line tool with a YAML file and a grudge against anyone who wanted a button to click.
      </Lead>

      <P>
        If you've gotten this far into researching Headscale, you already know the pitch: it's an open-source,
        self-hosted reimplementation of the Tailscale control server. Same WireGuard mesh, same NAT traversal
        magic, same <Code>tailscale</Code> client on every device — except the coordination server is yours.
        No account that can get suspended, no company that can change the pricing on you next quarter.
      </P>

      <P>
        What nobody quite tells you upfront is that "the control server is yours" also means "the control
        server's interface is a terminal." There's no dashboard in the box. You get a binary, a config file, and
        the <Code>headscale</Code> CLI. That's it. Everything — every node, every user, every pre-auth key, every
        ACL rule — goes through commands like this:
      </P>

      <H2>What running Headscale actually feels like, day to day</H2>

      <P>
        The first week is fine, honestly. You follow the docs, you get a server up, you connect your laptop and
        your phone, you feel like a wizard. Then a friend asks to join your tailnet, and you're SSH'd into your
        VPS at 11pm typing:
      </P>

      <Callout label="What this actually looks like">
        <Code>headscale users create alex</Code>
        <br />
        <Code>headscale preauthkeys create --user alex --expiration 24h</Code>
        <br />
        <Code>headscale nodes list</Code> to make sure it actually connected, because there's no other way to check
      </Callout>

      <P>
        Then three months later you're trying to remember which node was the Raspberry Pi you set up for your
        parents' router, because they're all named things like <Code>raspberrypi</Code> and{' '}
        <Code>raspberrypi-2</Code> and you have to squint at IP addresses and last-seen timestamps in a wall of
        monospace text to figure out which is which. Revoking a lost laptop means finding its node ID first. Writing
        an ACL policy means hand-editing a HuJSON file and hoping you didn't typo a tag name, because the only way
        to find out is to reload the config and see if Headscale complains.
      </P>

      <P>
        None of this is a knock on Headscale itself — the actual networking is rock solid, and I mean that. It's
        the operational layer around it that's missing. You're not just running a VPN anymore; you're running
        infrastructure with zero visibility into its own state unless you're comfortable living in a terminal.
      </P>

      <H2>The community UI projects (and why I still went and built my own)</H2>

      <P>
        To be fair to the ecosystem, you're not the first person to hit this wall — there are a handful of
        community-built UIs floating around for Headscale, and it's worth trying one before you build or buy
        anything. Some are genuinely useful for basic node listing. What I kept running into, across the ones I
        tried, was the same short list of gaps: no real handling for multi-tenant setups, no audit trail of who
        did what, ACL editing that's really just a fancier textarea over the same HuJSON file, and — more than
        once — a project that hadn't been touched in a year and quietly broke against a newer Headscale release.
      </P>

      <P>
        That's not a criticism of the maintainers; it's just the reality of unpaid side projects. I ran into the
        same problem from the other direction, honestly — I wanted this to be a proper tool, actively maintained,
        that I'd trust to run my own network.
      </P>

      <H2>What I actually wanted from a Headscale dashboard</H2>

      <P>
        After enough late nights with <Code>headscale nodes list</Code> piped through <Code>grep</Code>, I sat down
        and wrote out what I actually needed, not what would be cool to have:
      </P>

      <UL>
        <LI>See every node's real status at a glance — online, offline, last-seen, IP — without a CLI command</LI>
        <LI>Click a node to expire or delete it, instead of hunting for its ID first</LI>
        <LI>Generate and revoke pre-auth keys without memorizing flag syntax</LI>
        <LI>Edit the ACL policy visually, with something checking my work before I break my own network</LI>
        <LI>A searchable log of who did what, since "it was probably me" isn't a great audit trail</LI>
        <LI>Manage more than one person's access without giving everyone shell access to the server</LI>
      </UL>

      <P>
        None of that is exotic. It's the stuff any admin panel for any piece of infrastructure would have. Headscale
        just doesn't ship it, because Headscale's job is to be a correct, minimal control server — and it does that
        job well. The dashboard was always going to be someone else's problem.
      </P>

      <Quote>
        I didn't want to fork Headscale or run a patched version of it. I wanted a layer on top that talks to the
        same API everyone else does, so upgrading Headscale itself never becomes a problem.
      </Quote>

      <H2>So that's what LavaMesh is</H2>

      <P>
        It's a dashboard that sits in front of your existing Headscale instance and talks to its API — nodes, users,
        pre-auth keys, ACLs, routes, all in one place, with the kind of visual feedback you'd expect from any modern
        admin tool. You still own the Headscale server. You still own your data. LavaMesh doesn't replace anything
        Headscale does; it just gives you a way to see and manage it that doesn't involve memorizing flags.
      </P>

      <P>
        The Community tier is free and self-hosted, same as Headscale itself — I built this because I needed it,
        not because I wanted to paywall the basic act of seeing your own node list. If you're already running
        Headscale and just want eyes on it, that's genuinely the point.
      </P>

      <P>
        The part I'm still actually figuring out is what changes once it's not just you — a couple of coworkers
        on the same tailnet, or a handful of client networks instead of one homelab. That's a different set of
        problems (who did what, who still has access, proving it to someone who isn't you), and I'd rather hear
        it from someone dealing with it than guess. If that's your situation, email me at{' '}
        <a href="mailto:drew@lavamesh.com" style={{ color: 'inherit', textDecoration: 'underline' }}>drew@lavamesh.com</a>{' '}
        — I'll set you up with Pro free in exchange for telling me honestly what's missing.
      </P>
    </BlogPostLayout>
  );
}
