import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.dwell-ke.vercel.app",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://*.cloudfront.net",
  "connect-src 'self' https://*.clerk.accounts.dev https://clerk.dwell-ke.vercel.app https://api.cloudinary.com wss://*.clerk.accounts.dev",
  "frame-src 'self' https://*.clerk.accounts.dev https://clerk.dwell-ke.vercel.app",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/properties/(.*)/:edit',
]);

const isAuthRoute = createRouteMatcher([
  '/auth/signup(.*)',
  '/auth/login(.*)',
  '/auth/verify(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAuthRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

export function securityHeadersMiddleware() {
  return (req: Request) => {
    const headers = new Headers();
    for (const [key, value] of Object.entries(securityHeaders)) {
      headers.set(key, value);
    }
    headers.set('Content-Security-Policy', cspDirectives);
    return new Response(null, { headers });
  };
}
