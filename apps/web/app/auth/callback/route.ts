/**
 * Auth callback route handler.
 *
 * Called by Supabase after email verification, OAuth sign-in, or password
 * reset. Exchanges the auth code for a session and redirects the user to
 * the `next` query param (defaults to /dashboard).
 *
 * Email verification links look like:
 *   {APP_URL}/auth/callback?code=<auth-code>&next=/dashboard
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
