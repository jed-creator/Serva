import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}
        </h1>
        <p className="text-zinc-600 mt-1">
          {profile?.role === 'provider'
            ? 'Manage your business, services, and bookings here.'
            : 'Find and book local services across Serva.'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Your current Serva account</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700 space-y-1">
            <div>
              <span className="text-zinc-500">Email:</span> {user!.email}
            </div>
            <div>
              <span className="text-zinc-500">Role:</span>{' '}
              {profile?.role ?? '—'}
            </div>
            <div>
              <span className="text-zinc-500">Verified:</span>{' '}
              {user!.email_confirmed_at ? 'Yes' : 'Pending'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next steps</CardTitle>
            <CardDescription>Coming in Phase 4</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700">
            {profile?.role === 'provider'
              ? 'Business onboarding, services, calendar, and bookings.'
              : 'Search, booking history, and favorites.'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Build progress</CardTitle>
            <CardDescription>Phase 3 — Authentication</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700">
            You&apos;re on Phase 3 of 10. Auth is live. Phase 4 (Business
            Dashboard Core) starts next.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
