import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/businesses', label: 'Businesses' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/reviews', label: 'Reviews' },
    { href: '/admin/categories', label: 'Categories' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-brand-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-xl font-semibold tracking-tight text-white"
          >
            Serva <span className="text-zinc-400 font-normal">· Admin</span>
          </Link>
          <nav className="flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-zinc-300 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <span className="text-sm text-zinc-400 hidden md:inline">
              {profile?.first_name ?? user.email}
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
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
