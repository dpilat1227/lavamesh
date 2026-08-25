import Redis from 'ioredis';

/**
 * lib/kv.ts — Thin wrapper around ioredis for Vercel KV with graceful fallback.
 * If KV env vars aren't configured, all operations become no-ops.
 */

let _kv: Redis | null = null;

function getKv() {
  if (_kv) return _kv;
  
  // Vercel's new Redis integration provides KV_REDIS_URL
  if (process.env.KV_REDIS_URL) {
    _kv = new Redis(process.env.KV_REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't hang on connection failures
    });
    return _kv;
  }
  
  return null;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const kv = getKv();
  if (!kv) return null;
  const val = await kv.get(key).catch(() => null);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return val as unknown as T;
  }
}

export async function kvSet(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (opts?.ex) {
    await kv.set(key, str, 'EX', opts.ex).catch(() => null);
  } else {
    await kv.set(key, str).catch(() => null);
  }
}

export async function kvDel(...keys: string[]): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  if (keys.length > 0) {
    await kv.del(...keys).catch(() => null);
  }
}

export async function kvLpush(key: string, ...values: unknown[]): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  if (values.length > 0) {
    const strs = values.map(v => typeof v === 'string' ? v : JSON.stringify(v));
    await kv.lpush(key, ...strs).catch(() => null);
  }
}

export async function kvLrange<T>(key: string, start: number, stop: number): Promise<T[]> {
  const kv = getKv();
  if (!kv) return [];
  const vals = await kv.lrange(key, start, stop).catch(() => []);
  return vals.map(val => {
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  });
}

export async function kvLtrim(key: string, start: number, stop: number): Promise<void> {
  const kv = getKv();
  if (!kv) return;
  await kv.ltrim(key, start, stop).catch(() => null);
}

export function kvConfigured(): boolean {
  return !!process.env.KV_REDIS_URL;
}
