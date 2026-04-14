import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { BookingStatus } from '@/lib/supabase/types';

type FilterValue = 'upcoming' | 'past' | 'cancelled' | 'all';

interface BookingRow {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_cents: number;
  payment_status: string;
  consumer: { first_name: string | null; last_name: string | null; email: string } | null;
  service: { name: string } | null;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusColor(status: BookingStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-900';
    case 'confirmed':
      return 'bg-blue-100 text-blue-900';
    case 'in_progress':
      return 'bg-purple-100 text-purple-900';
    case 'completed':
      return 'bg-green-100 text-green-900';
    case 'cancelled':
    case 'no_show':
      return 'bg-zinc-200 text-zinc-700';
  }
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter: FilterValue = (['upcoming', 'past', 'cancelled', 'all'].includes(
    params.filter ?? '',
  )
    ? params.filter
    : 'upcoming') as FilterValue;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!business) redirect('/dashboard/business/new');

  const now = new Date().toISOString();
  let query = supabase
    .from('bookings')
    .select(
      `
      id, start_time, end_time, status, total_cents, payment_status,
      consumer:profiles!bookings_consumer_id_fkey(first_name, last_name, email),
      service:services(name)
    `,
    )
    .eq('business_id', business.id);

  if (filter === 'upcoming') {
    query = query
      .gte('start_time', now)
      .not('status', 'in', '(cancelled,no_show)')
      .order('start_time', { ascending: true });
  } else if (filter === 'past') {
    query = query
      .lt('start_time', now)
      .not('status', 'in', '(cancelled,no_show)')
      .order('start_time', { ascending: false });
  } else if (filter === 'cancelled') {
    query = query
      .in('status', ['cancelled', 'no_show'])
      .order('start_time', { ascending: false });
  } else {
    query = query.order('start_time', { ascending: false });
  }

  const { data: bookings } = await query;
  const rows = (bookings ?? []) as unknown as BookingRow[];

  const filters: { key: FilterValue; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled / No-show' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Bookings
        </h1>
        <p className="text-zinc-600 mt-1">
          Manage customer bookings at your business.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/dashboard/bookings?filter=${f.key}`}
            className={`px-4 py-2 text-sm font-medium ${
              filter === f.key
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No bookings yet</CardTitle>
            <CardDescription>
              {filter === 'upcoming'
                ? 'When customers book services, they will appear here.'
                : `No ${filter} bookings.`}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((b) => {
            const name =
              [b.consumer?.first_name, b.consumer?.last_name]
                .filter(Boolean)
                .join(' ')
                .trim() ||
              b.consumer?.email ||
              'Unknown customer';
            return (
              <Link
                key={b.id}
                href={`/dashboard/bookings/${b.id}`}
                className="block"
              >
                <Card className="hover:border-brand-accent transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900">{name}</span>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded capitalize ${statusColor(
                            b.status,
                          )}`}
                        >
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-600 mt-1">
                        {b.service?.name ?? 'Service'} ·{' '}
                        {formatDateTime(b.start_time)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-zinc-900">
                        ${(b.total_cents / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-zinc-500 capitalize">
                        {b.payment_status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
