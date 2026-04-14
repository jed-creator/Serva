/**
 * Supabase client for SERVER use (RSC, Server Actions, Route Handlers).
 *
 * In Next.js 16 `cookies()` is async, so this factory is also async.
 * Always call as: `const supabase = await createClient()`
 *
 * Session cookies are automatically read from the incoming request and
 * refreshed via the setAll callback. In Server Components you can't
 * actually write cookies (Next.js forbids it after streaming starts), so
 * setAll swallows those errors — the proxy.ts handles session refresh.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware/proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

/**
 * Admin client with the service_role key — BYPASSES row-level security.
 * Use only in trusted server code (route handlers, scheduled tasks). Never
 * expose to the browser.
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
