import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.lavamesh.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Everything past the marketing site is an authenticated app — no
        // reason for crawlers to spend budget on it, and dashboard content
        // shouldn't be indexable anyway.
        disallow: [
          '/dashboard',
          '/nodes',
          '/users',
          '/routes',
          '/keys',
          '/settings',
          '/audit',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
