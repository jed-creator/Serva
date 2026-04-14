import { createAdminClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [
    { count: userCount },
    { count: businessCount },
    { count: pendingBusinesses },
    { count: bookingCount },
    { count: reviewCount },
    bookingsThisMonth,
    revenueRows,
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('businesses').select('*', { count: 'exact', head: true }),
    admin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending'),
    admin.from('bookings').select('*', { count: 'exact', head: true }),
    admin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_flagged', true),
    admin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte(
        'created_at',
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ).toISOString(),
      ),
    admin
      .from('payments')
      .select('amount_cents, platform_fee_cents')
      .eq('status', 'captured'),
  ]);

  const totalRevenue = (revenueRows.data ?? []).reduce(
    (s, r) => s + (r.amount_cents ?? 0),
    0,
  );
  const totalPlatformFees = (revenueRows.data ?? []).reduce(
    (s, r) => s + (r.platform_fee_cents ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Platform overview
        </h1>
        <p className="text-zinc-600 mt-1">Serva marketplace metrics.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Users" value={userCount ?? 0} />
        <StatCard
          label="Businesses"
          value={businessCount ?? 0}
          subtitle={`${pendingBusinesses ?? 0} pending approval`}
        />
        <StatCard
          label="Bookings total"
          value={bookingCount ?? 0}
          subtitle={`${bookingsThisMonth.count ?? 0} this month`}
        />
        <StatCard
          label="Flagged reviews"
          value={reviewCount ?? 0}
          subtitle="Need moderation"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gross platform revenue</CardTitle>
          <CardDescription>
            From all captured Stripe charges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-brand-primary">
            ${(totalRevenue / 100).toFixed(2)}
          </div>
          <div className="text-sm text-zinc-500 mt-1">
            ${(totalPlatformFees / 100).toFixed(2)} platform fees collected
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-500">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-brand-primary">
          {value.toLocaleString()}
        </div>
        {subtitle && (
          <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
