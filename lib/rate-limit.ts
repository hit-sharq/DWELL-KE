import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

let ratelimit: Ratelimit | null = null;

// Initialize rate limiter only if environment variables are present
try {
  const redis = Redis.fromEnv();
  if (redis) {
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit',
    });
  }
} catch (error) {
  console.warn('Failed to initialize rate limiter: Missing or invalid Upstash Redis environment variables');
  // ratelimit remains null
}

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // If rate limiter is not initialized, skip rate limiting
  if (!ratelimit) {
    return handler();
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'anonymous';

  try {
    const result = await ratelimit.limit(ip);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return handler();
  } catch {
    return NextResponse.json(
      { error: 'Rate limit check failed' },
      { status: 503 }
    );
  }
}
