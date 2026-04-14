/**
 * Session-refresh helper for Next.js 16 Proxy (formerly middleware).
 *
 * Called from `proxy.ts` at the app root on every request. It:
 *   1. Reads session cookies from the incoming request
 *   2. Calls supabase.auth.getUser() to refresh the session (rotates JWT if
 *      needed) and populate request cookies with the latest tokens
 *   3. Returns a NextResponse with updated cookies attached
 *   4. Redirects unauthenticated users away from protected routes
 *
 * ⚠️ DO NOT insert code between createServerClient() and getUser() —
 * missing the token refresh here causes random logouts.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Paths that bypass the auth gate. Non-listed routes redirect
 * unauthenticated requests to `/login?redirectTo=<path>`.
 *
 * Matching is exact-or-prefix (see `isPublicPath`), so listing `/shop`
 * also makes `/shop/provider/123` public. Don't add a deep route here
 * unless every nested path should also be anonymous — if a sub-route
 * needs auth, keep it under a non-public root like `/dashboard` or
 * guard it explicitly in the route handler.
 *
 * Exported for unit testing.
 */
export const PUBLIC_PATHS = [
  // Marketing + auth
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',

  // API routes handle their own auth (bearer token, webhook signature, etc.)
  // so the proxy never redirects them. Each route handler decides.
  '/api',

  // Super-app consumer browsing — anonymous-friendly per Feature
  // Outline p. 14 ("Book any merchant without installing their app").
  // Per-user actions (checkout, saved lists, order history) live under
  // /api or authed sub-paths and are unaffected.
  '/shop',
  '/eat',
  '/ride',
  '/trips',
  '/tickets',
  '/market',
  '/book',
  '/compare',
  '/explore',
];

/**
 * Returns true if `pathname` matches any `PUBLIC_PATHS` entry exactly
 * or is a sub-path of one (`/foo` matches `/foo` and `/foo/bar` but
 * not `/foobar`).
 *
 * Exported for unit testing.
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — this is the critical side effect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected areas.
  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages back to dashboard.
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/signup')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
