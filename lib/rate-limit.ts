/**
 * In-memory rate limiter using LRU cache
 * Free alternative to @upstash/ratelimit - no external API required
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5;

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 30000);

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'anonymous';

  const now = Date.now();
  const key = `ratelimit:${ip}`;
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    existing.count++;
    if (existing.count > MAX_REQUESTS) {
      const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': String(retryAfter) }
        }
      );
    }
  }

  return handler();
}