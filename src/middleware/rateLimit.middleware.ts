import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

/**
 * Rate limiting middleware
 * Limits requests per IP address
 */
export async function rateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  const now = Date.now();
  const key = `${ip}:${request.nextUrl.pathname}`;

  // Initialize or get rate limit data
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
  }

  // Increment request count
  store[key].count++;

  // Check if limit exceeded
  if (store[key].count > MAX_REQUESTS) {
    const resetIn = Math.ceil((store[key].resetTime - now) / 1000);
    
    return NextResponse.json(
      { 
        error: 'Too many requests',
        retryAfter: resetIn 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(resetIn),
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(store[key].resetTime),
        }
      }
    );
  }

  // Add rate limit headers
  const response = await handler(request);
  
  response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  response.headers.set('X-RateLimit-Remaining', String(MAX_REQUESTS - store[key].count));
  response.headers.set('X-RateLimit-Reset', String(store[key].resetTime));

  return response;
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 300000);
}
