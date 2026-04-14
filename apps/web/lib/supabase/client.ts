/**
 * Supabase client for BROWSER use (client components).
 *
 * Use this in any component with "use client" that needs to call Supabase.
 * For server-side (RSC, server actions, route handlers), use ./server.ts instead.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
