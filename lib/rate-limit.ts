type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Process-local rate limiting for local demo routes. Production should use a
 * shared Redis or gateway-based limiter so limits survive horizontal scaling.
 */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
