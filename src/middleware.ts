import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getRateLimitConfig, createRateLimitResponse } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract client IP & Account identifier from headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const authHeader = request.headers.get('authorization') || '';
  const accountId = authHeader.replace(/^Bearer\s+/, '').trim() || ip;

  let limitType: 'auth' | 'public' | 'authenticated' = 'public';

  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/login') || pathname.startsWith('/api/register')) {
    limitType = 'auth';
  } else if (authHeader.startsWith('Bearer ')) {
    limitType = 'authenticated';
  }

  const config = getRateLimitConfig(limitType);
  const identifier = `${limitType}:${accountId}:${ip}`;
  const rateLimitResult = checkRateLimit(identifier, config);

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  // Create response and attach Security & RateLimit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

  // Security Hardening Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
