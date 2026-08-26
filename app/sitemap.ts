import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog';

const BASE_URL = 'https://www.lavamesh.com';

// Only public marketing routes belong here — /dashboard, /settings, /users, etc.
// are auth-gated app pages with no SEO value and shouldn't be crawled.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...getPublishedPosts().map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
