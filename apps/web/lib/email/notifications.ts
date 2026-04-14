/**
 * High-level email notification helpers.
 * Each function loads the relevant data, renders a template, and sends.
 * Non-blocking by design — email failures don't block booking actions.
 */
import { createAdminClient } from '@/lib/supabase/server';
import { resend, FROM_EMAIL } from './client';
import {
  bookingConfirmedTemplate,
  bookingCancelledTemplate,
  bookingCompletedTemplate,
  type BookingEmailParams,
} from './templates';

interface BookingRow {
  id: string;
  start_time: string;
  total_cents: number;
  cancellation_reason: string | null;
  consumer: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  business: { name: string } | null;
  service: { name: string } | null;
}

async function loadBookingForEmail(
  bookingId: string,
): Promise<(BookingRow & { params: BookingEmailParams }) | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('bookings')
    .select(
      `
      id, start_time, total_cents, cancellation_reason,
      consumer:profiles!bookings_consumer_id_fkey(first_name, last_name, email),
      business:businesses(name),
      service:services(name)
    `,
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (!data) return null;
  const b = data as unknown as BookingRow;
  if (!b.consumer || !b.business || !b.service) return null;

  return {
    ...b,
    params: {
      customerName:
        [b.consumer.first_name, b.consumer.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() || '',
      businessName: b.business.name,
      serviceName: b.service.name,
      startTime: b.start_time,
      totalCents: b.total_cents,
      bookingId: b.id,
    },
  };
}

async function send(to: string, template: ReturnType<typeof bookingConfirmedTemplate>) {
  if (!resend) {
    console.log(
      `[email] (stub) would send "${template.subject}" to ${to}`,
    );
    return { ok: true, stub: true };
  }
  try {
    const res = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    return { ok: true, id: res.data?.id, error: res.error };
  } catch (err) {
    console.error('[email] send failed:', err);
    return { ok: false, error: err };
  }
}

export async function sendBookingConfirmedEmail(bookingId: string) {
  const data = await loadBookingForEmail(bookingId);
  if (!data?.consumer?.email) return { ok: false };
  const template = bookingConfirmedTemplate(data.params);
  return send(data.consumer.email, template);
}

export async function sendBookingCancelledEmail(bookingId: string) {
  const data = await loadBookingForEmail(bookingId);
  if (!data?.consumer?.email) return { ok: false };
  const template = bookingCancelledTemplate({
    ...data.params,
    reason: data.cancellation_reason ?? undefined,
  });
  return send(data.consumer.email, template);
}

export async function sendBookingCompletedEmail(bookingId: string) {
  const data = await loadBookingForEmail(bookingId);
  if (!data?.consumer?.email) return { ok: false };
  const template = bookingCompletedTemplate(data.params);
  return send(data.consumer.email, template);
}
