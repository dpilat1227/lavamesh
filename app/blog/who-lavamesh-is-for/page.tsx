import type { Metadata } from 'next';
import Link from 'next/link';
import BlogPostLayout from '@/components/blog/BlogPostLayout';
import { Lead, P, H2, UL, LI, Callout } from '@/components/blog/Prose';
import { getPostBySlug } from '@/lib/blog';

const post = getPostBySlug('who-lavamesh-is-for')!;

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
        I added my parents&apos; router so I could fix their internet without a four-call phone tree. Then a
        friend&apos;s file box. Then I looked at the bill and thought: I&apos;m paying extra because I know people.
      </Lead>

      <P>
        That&apos;s the product, basically. Your laptop, your phone, the office computer, the thing in the closet
        with the family photos — they talk to each other like they&apos;re on the same Wi-Fi, even when they&apos;re
        not. Coffee shop, kitchen table, someone else&apos;s house. Encrypted. Nobody on that café network walks
        in.
      </P>

      <P>
        A lot of people already have this. A friend said install Tailscale, they did, the icon went green. Fine
        product. I used it for years. It just charges per person, so adding Dad or an intern is a line item.
        LavaMesh is the same idea with a website you can actually look at, and a bill that doesn&apos;t grow when
        you trust one more person.
      </P>

      <H2>What you&apos;re looking at on this site</H2>

      <P>
        LavaMesh is the dashboard for that network. Log in. See every device. See if it&apos;s online. Name them
        like a human — &quot;Parents&apos; living room,&quot; not a serial number. Send someone a link, they
        install the app, they&apos;re on. Laptop stolen at an airport? Kick it off before you go to bed. Someone
        leaves the studio? Same button.
      </P>

      <UL>
        <LI>See what&apos;s connected without calling the one technical person you know</LI>
        <LI>Invite people the way you&apos;d add them to a shared album</LI>
        <LI>Cut a device off in about ten seconds</LI>
        <LI>Own it — your network, not a seat on someone else&apos;s</LI>
      </UL>

      <P>
        You don&apos;t need to know how the tunnels work. You need to know whether the office drive is reachable
        from the kitchen, and whether last intern&apos;s laptop is still on the list.
      </P>

      <H2>If you&apos;re not the one who&apos;d set this up</H2>

      <P>
        If you found this on Product Hunt, or a VC friend forwarded it, or your developer roommate sent a link
        and you&apos;re trying to figure out what they&apos;re excited about: this is it. Private network. Pretty
        admin site. No per-person tax. The technical person in your life handles the first setup (or waits until
        we host it). Everyone else just uses the website.
      </P>

      <P>
        The dashboard is free. Backups, logs, and the rest of the admin tools ship with it. There is no paid tier.
      </P>

      <Callout label="One honest catch">
        Today someone still has to stand the server up once. If that&apos;s not you, send this to the person
        who&apos;d enjoy that. I&apos;m not going to walk you through renting a server in this post.
      </Callout>

      <P>
        I{' '}
        <Link href="/blog/why-i-stopped-paying-for-a-mesh-vpn" style={{ color: 'inherit', textDecoration: 'underline' }}>
          wrote the longer version
        </Link>
        {' '}already — the invoice, the weekend, why I built a dashboard instead of living in a terminal. This
        page is just the pitch: your stuff, talking to each other, a screen that makes sense, nobody charging
        you rent on your dad.
      </P>

      <P>
        Look around the site. If a page still feels written for someone else, email{' '}
        <a href="mailto:drew@lavamesh.com" style={{ color: 'inherit', textDecoration: 'underline' }}>drew@lavamesh.com</a>
        {' '}and tell me which sentence lost you.
      </P>
    </BlogPostLayout>
  );
}
