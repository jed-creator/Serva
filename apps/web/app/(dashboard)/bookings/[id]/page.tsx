import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  confirmBookingAction,
  completeBookingAction,
  cancelBookingAction,
  markNoShowAction,
} from '@/app/actions/bookings';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BookingStatus } from '@/lib/supabase/types';

interface BookingDetail {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_cents: number;
  deposit_cents: number;
  payment_status: string;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  consumer: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
  } | null;
  service: {
    name: string;
    description: string | null;
    duration_minutes: number;
  } | null;
  business: { id: string; owner_id: string };
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      `
      id, start_time, end_time, status, total_cents, deposit_cents,
      payment_status, notes, cancellation_reason, cancelled_at,
      completed_at, created_at,
      consumer:profiles!bookings_consumer_id_fkey(first_name, last_name, email, phone),
      service:services(name, description, duration_minutes),
      business:businesses(id, owner_id)
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (!booking) notFound();
  const b = booking as unknown as BookingDetail;

  if (b.business.owner_id !== user.id) {
    // Defense in depth — RLS should already block this
    notFound();
  }

  const name =
    [b.consumer?.first_name, b.consumer?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    b.consumer?.email ||
    'Unknown';

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  async function doConfirm() {
    'use server';
    await confirmBookingAction(id);
  }
  async function doComplete() {
    'use server';
    await completeBookingAction(id);
  }
  async function doCancel() {
    'use server';
    await cancelBookingAction(id);
  }
  async function doNoShow() {
    'use server';
    await markNoShowAction(id);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div>
        <Link
          href="/dashboard/bookings"
          className="text-sm text-brand-accent hover:underline"
        >
          ← Back to bookings
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
            Booking detail
          </h1>
          <span className="inline-block px-3 py-1 text-sm rounded bg-zinc-100 text-zinc-700 capitalize">
            {b.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700 space-y-1">
            <div className="font-medium text-zinc-900">{name}</div>
            <div>{b.consumer?.email}</div>
            {b.consumer?.phone && <div>{b.consumer.phone}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service</CardTitle>
            <CardDescription>{b.service?.name}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700 space-y-1">
            {b.service?.description && <div>{b.service.description}</div>}
            <div>
              <span className="text-zinc-500">Duration:</span>{' '}
              {b.service?.duration_minutes} min
            </div>
            <div>
              <span className="text-zinc-500">Scheduled:</span>{' '}
              {fmt(b.start_time)}
            </div>
            <div>
              <span className="text-zinc-500">Ends:</span> {fmt(b.end_time)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700 space-y-1">
            <div>
              <span className="text-zinc-500">Total:</span> $
              {(b.total_cents / 100).toFixed(2)}
            </div>
            {b.deposit_cents > 0 && (
              <div>
                <span className="text-zinc-500">Deposit:</span> $
                {(b.deposit_cents / 100).toFixed(2)}
              </div>
            )}
            <div>
              <span className="text-zinc-500">Status:</span>{' '}
              <span className="capitalize">{b.payment_status}</span>
            </div>
          </CardContent>
        </Card>

        {b.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-700">
              {b.notes}
            </CardContent>
          </Card>
        )}

        {b.cancellation_reason && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cancellation reason</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-700">
              {b.cancellation_reason}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {b.status === 'pending' && (
          <form action={doConfirm}>
            <Button type="submit">Confirm</Button>
          </form>
        )}
        {(b.status === 'confirmed' || b.status === 'in_progress') && (
          <>
            <form action={doComplete}>
              <Button type="submit">Mark completed</Button>
            </form>
            <form action={doNoShow}>
              <Button type="submit" variant="outline">
                Mark no-show
              </Button>
            </form>
          </>
        )}
        {(b.status === 'pending' || b.status === 'confirmed') && (
          <form action={doCancel}>
            <Button type="submit" variant="destructive">
              Cancel booking
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
