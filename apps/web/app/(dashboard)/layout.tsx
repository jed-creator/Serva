import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  // Incomplete profile → redirect to profile completion
  // (except when already on the profile page, to avoid loops)
  const isIncomplete = !profile?.first_name || !profile?.last_name;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-semibold tracking-tight text-brand-primary"
          >
            Serva
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Profile
            </Link>
            <span className="text-sm text-zinc-500 hidden md:inline">
              {profile?.first_name ? `${profile.first_name}` : user.email}
            </span>
            <form action={signoutAction}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {isIncomplete && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-6xl mx-auto px-6 py-3 text-sm text-amber-900">
              Complete your profile to unlock the full Serva experience.{' '}
              <Link
                href="/profile"
                className="font-medium underline"
              >
                Finish now →
              </Link>
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
