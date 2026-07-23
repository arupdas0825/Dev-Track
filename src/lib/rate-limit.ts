import { NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
  attempts: number;
  lastAttemptTime: number;
}

const memoryStore = new Map<string, RateLimitStore>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime && now - record.lastAttemptTime > 600000) {
        memoryStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  exponentialBackoff?: boolean;
}

export function getRateLimitConfig(type: 'auth' | 'public' | 'authenticated'): RateLimitConfig {
  const env = process.env;

  if (type === 'auth') {
    return {
      limit: parseInt(env.RATE_LIMIT_AUTH_PER_MINUTE || '5', 10),
      windowMs: 60 * 1000,
      exponentialBackoff: true,
    };
  }

  if (type === 'authenticated') {
    return {
      limit: parseInt(env.RATE_LIMIT_AUTHENTICATED_PER_MINUTE || '200', 10),
      windowMs: 60 * 1000,
      exponentialBackoff: false,
    };
  }

  // Default: public
  return {
    limit: parseInt(env.RATE_LIMIT_PUBLIC_PER_MINUTE || '60', 10),
    windowMs: 60 * 1000,
    exponentialBackoff: false,
  };
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  let record = memoryStore.get(identifier);

  if (!record || now > record.resetTime) {
    const attempts = record ? record.attempts + 1 : 1;
    let windowMs = config.windowMs;

    // Apply exponential backoff for failed auth attempts: 1m -> 2m -> 4m -> 8m (max 15m)
    if (config.exponentialBackoff && attempts > 3) {
      const backoffMultiplier = Math.min(Math.pow(2, attempts - 3), 15);
      windowMs = config.windowMs * backoffMultiplier;
    }

    record = {
      count: 1,
      resetTime: now + windowMs,
      attempts: attempts,
      lastAttemptTime: now,
    };
    memoryStore.set(identifier, record);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.ceil(record.resetTime / 1000),
      retryAfterSeconds: 0,
    };
  }

  record.count += 1;
  record.lastAttemptTime = now;

  if (record.count > config.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
      retryAfterSeconds,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - record.count),
    reset: Math.ceil(record.resetTime / 1000),
    retryAfterSeconds: 0,
  };
}

export function createRateLimitResponse(result: {
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
}): NextResponse {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    'Retry-After': result.retryAfterSeconds.toString(),
  });

  return new NextResponse(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again in ${result.retryAfterSeconds} seconds.`,
      statusCode: 429,
    }),
    {
      status: 429,
      headers,
    }
  );
}
