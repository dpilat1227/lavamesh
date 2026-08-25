/**
 * lib/kv.ts — Thin wrapper around @vercel/kv with graceful fallback.
 * If KV env vars aren't configured (local dev without a KV store), all
 * operations become no-ops so the app stays functional.
 */

let _kv: typeof import('@vercel/kv').kv | null = null;

async function getKv() {
  if (_kv) return _kv;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null; // KV not configured
  }
  const { kv } = await import('@vercel/kv');
  _kv = kv;
  return _kv;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const kv = await getKv();
  if (!kv) return null;
  return kv.get<T>(key);
}

export async function kvSet(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  if (opts?.ex) {
    await kv.set(key, value, { ex: opts.ex });
  } else {
    await kv.set(key, value);
  }
}

export async function kvDel(...keys: string[]): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.del(...keys);
}

export async function kvLpush(key: string, ...values: unknown[]): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.lpush(key, ...values);
}

export async function kvLrange<T>(key: string, start: number, stop: number): Promise<T[]> {
  const kv = await getKv();
  if (!kv) return [];
  return kv.lrange<T>(key, start, stop);
}

export async function kvLtrim(key: string, start: number, stop: number): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.ltrim(key, start, stop);
}

export function kvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}
