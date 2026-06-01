/**
 * In-memory rate limiter for API routes.
 * ─────────────────────────────────────────────────────────────────
 * For production at scale, swap the Map for Upstash Redis:
 *   https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 *
 * Usage:
 *   const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
 *   const { success } = await limiter.check(response, 10, ip);
 *   if (!success) return Response.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimitOptions {
  interval: number;               // window size in ms
  uniqueTokenPerInterval?: number; // max unique IPs tracked
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // unix timestamp ms
}

// Simple token bucket using a Map (works fine up to ~10K users on single server)
const tokenCache = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({ interval, uniqueTokenPerInterval = 500 }: RateLimitOptions) {
  return {
    async check(
      limit: number,
      token: string
    ): Promise<RateLimitResult> {
      const now = Date.now();
      const key = `${token}`;

      // Cleanup stale entries to prevent memory leak
      if (tokenCache.size > uniqueTokenPerInterval) {
        const staleKeys: string[] = [];
        tokenCache.forEach((val, k) => {
          if (val.resetAt < now) staleKeys.push(k);
        });
        staleKeys.forEach((k) => tokenCache.delete(k));
      }

      const entry = tokenCache.get(key);

      if (!entry || entry.resetAt < now) {
        // New window
        tokenCache.set(key, { count: 1, resetAt: now + interval });
        return { success: true, limit, remaining: limit - 1, reset: now + interval };
      }

      entry.count += 1;
      const remaining = Math.max(0, limit - entry.count);
      const success = entry.count <= limit;

      return { success, limit, remaining, reset: entry.resetAt };
    },
  };
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────
export const apiLimiter = rateLimit({
  interval: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  uniqueTokenPerInterval: 1000,
});

export const authLimiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
});

// ─── Helper: extract client IP from Next.js request ───────────────────────────
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

// ─── Helper: apply rate limit to a route handler ──────────────────────────────
export async function withRateLimit(
  request: Request,
  limit: number,
  limiter = apiLimiter
): Promise<Response | null> {
  const ip = getClientIp(request);
  const result = await limiter.check(limit, ip);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null; // no error — proceed normally
}
