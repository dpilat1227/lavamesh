import { NextResponse } from 'next/server';

const REPO = 'dpilat1227/lavamesh';

/**
 * Proxies GitHub's repo API so the landing page can show a live star count
 * without every visitor's browser hitting GitHub directly (rate limits) or
 * the page taking a network round-trip hit before first paint.
 */
export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    return NextResponse.json({
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
    });
  } catch (err) {
    console.error('[github-stats] fetch failed:', err);
    return NextResponse.json({ stars: null, forks: null }, { status: 200 });
  }
}
