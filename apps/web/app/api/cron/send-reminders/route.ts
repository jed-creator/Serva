/**
 * Cron handler: 24-hour booking reminders.
 *
 * Runs on a schedule (via Vercel Cron, configured in vercel.json) and:
 *   1. Finds confirmed bookings starting 23-24 hours from now that
 *      haven't been reminded yet
 *   2. Sends email + SMS + push reminders
 *   3. Marks reminder_24h_sent = true so each booking reminds once
 *
 * Authentication: Vercel Cron sends a `Authorization: Bearer CRON_SECRET`
 * header when CRON_SECRET is set in env. We verify that.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { resend, FROM_EMAIL } from '@/lib/email/client';
import { sendSms, buildReminderSms } from '@/lib/twilio/server';
import { sendPushToUser } from '@/lib/push/expo';

interface ReminderBooking {
  id: string;
  start_time: string;
  consumer_id: string;
  consumer: {
    email: string;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  business: { name: string } | null;
  service: { name: string } | null;
}

export async function GET(request: Request) {
  // Optional auth check — Vercel Cron sends this header if CRON_SECRET is set
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Look for bookings starting 23-24h from now that haven't been reminded
  const now = new Date();
  const rangeStart = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const rangeEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      `
      id, start_time, consumer_id,
      consumer:profiles!bookings_consumer_id_fkey(email, phone, first_name, last_name),
      business:businesses(name),
      service:services(name)
    `,
    )
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false)
    .gte('start_time', rangeStart)
    .lte('start_time', rangeEnd);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (bookings ?? []) as unknown as ReminderBooking[];
  const results: Array<{ id: string; email: boolean; sms: boolean; push: boolean }> = [];

  for (const b of rows) {
    const customerName =
      [b.consumer?.first_name, b.consumer?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim() || 'there';
    const businessName = b.business?.name ?? 'your provider';
    const serviceName = b.service?.name ?? 'your appointment';
    const when = new Date(b.start_time).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const result = { id: b.id, email: false, sms: false, push: false };

    // Email
    if (resend && b.consumer?.email) {
      const res = await resend.emails.send({
        from: FROM_EMAIL,
        to: b.consumer.email,
        subject: `Reminder: ${serviceName} at ${businessName} tomorrow`,
        html: `<p>Hi ${customerName},</p><p>This is a friendly reminder that you have a booking for <strong>${serviceName}</strong> at <strong>${businessName}</strong> on <strong>${when}</strong>.</p><p>See you then!</p><p>— Orvo</p>`,
        text: `Reminder: ${serviceName} at ${businessName} on ${when}. See you then! — Orvo`,
      });
      result.email = !res.error;
    }

    // SMS
    if (b.consumer?.phone) {
      const smsRes = await sendSms(
        b.consumer.phone,
        buildReminderSms({
          customerName,
          businessName,
          serviceName,
          startTime: b.start_time,
        }),
      );
      result.sms = smsRes.ok;
    }

    // Push
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', b.consumer_id);
    const pushTokens = (tokens ?? []).map((t) => t.token);
    if (pushTokens.length > 0) {
      await sendPushToUser(
        pushTokens,
        'Appointment tomorrow',
        `${serviceName} at ${businessName}, ${when}`,
        { bookingId: b.id },
      );
      result.push = true;
    }

    // Also create an in-app notification
    await supabase.from('notifications').insert({
      user_id: b.consumer_id,
      type: 'booking_reminder',
      title: 'Appointment tomorrow',
      message: `${serviceName} at ${businessName}, ${when}`,
      related_booking_id: b.id,
    });

    // Mark as sent
    await supabase
      .from('bookings')
      .update({ reminder_24h_sent: true })
      .eq('id', b.id);

    results.push(result);
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
