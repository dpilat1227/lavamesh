/**
 * Blog post registry — single source of truth for the index page, sitemap,
 * and cross-links between posts. Each post's actual content lives in its own
 * route at app/blog/<slug>/page.tsx (hand-written JSX, same pattern as the
 * rest of the marketing site — no CMS, no markdown pipeline).
 */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readTime: string;
  tags: string[];
  /** Only true once app/blog/<slug>/page.tsx actually exists. Planned posts
   * stay listed here so the topic/metadata isn't lost, but they're kept out
   * of the index and sitemap — a listed post with no page is a 404 Google
   * will happily index. */
  published: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'headscale-has-no-ui-heres-what-i-use',
    title: "Headscale Doesn't Ship With a UI. Here's What I Use Instead.",
    description:
      "Headscale is a fantastic self-hosted Tailscale control server — but it hands you a CLI and nothing else. Here's what running it actually feels like, and what I built to fix it.",
    date: '2026-08-05',
    readTime: '7 min read',
    tags: ['Headscale', 'Self-hosted'],
    published: true,
  },
  {
    slug: 'tailscale-vs-headscale-vs-lavamesh',
    title: 'Tailscale vs. Headscale vs. LavaMesh: What Actually Changes',
    description:
      'Same WireGuard mesh under the hood, three very different deals. A straight comparison of the control plane, the pricing, and who each one is actually for.',
    date: '2026-08-12',
    readTime: '9 min read',
    tags: ['Comparison', 'Tailscale'],
    published: true,
  },
  {
    slug: 'why-i-stopped-paying-for-a-mesh-vpn',
    title: 'Why I Stopped Paying for a Mesh VPN and Built My Own',
    description:
      "The math that made me quit a per-seat VPN, the weekend I spent standing up Headscale instead, and the dashboard problem that turned into LavaMesh.",
    date: '2026-08-28',
    readTime: '8 min read',
    tags: ['Story', 'Self-hosted'],
    published: true,
  },
  {
    slug: 'real-cost-of-per-seat-vpn-pricing',
    title: 'The Real Cost of Per-Seat VPN Pricing (A Homelab Breakdown)',
    description:
      "Per-seat pricing feels cheap at 3 devices and insane at 30. Here's the math on where that line is, and why flat-rate self-hosting wins the moment you cross it.",
    date: '2026-08-20',
    readTime: '6 min read',
    tags: ['Pricing', 'Homelab'],
    published: false,
  },
  {
    slug: 'how-to-self-host-headscale',
    title: 'How to Self-Host Headscale Without Losing Your Weekend',
    description:
      "A no-nonsense walkthrough of standing up Headscale on your own VPS or homelab box — the parts the docs gloss over, and the mistakes I made so you don't have to.",
    date: '2026-08-28',
    readTime: '11 min read',
    tags: ['Guide', 'Headscale'],
    published: true,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getPublishedPosts(): BlogPost[] {
  return BLOG_POSTS.filter(p => p.published);
}

export function getAllPostsSorted(): BlogPost[] {
  return getPublishedPosts().sort((a, b) => (a.date < b.date ? 1 : -1));
}
