'use server';

/**
 * Booking management server actions (business-side).
 *
 * Confirm, complete, cancel, mark no-show — all on existing bookings.
 * Actual booking creation happens from the consumer app in Phase 7.
 */
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function confirmBookingAction(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)
    .eq('status', 'pending');
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/bookings');
  revalidatePath(`/dashboard/bookings/${bookingId}`);
}

export async function completeBookingAction(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', bookingId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/bookings');
  revalidatePath(`/dashboard/bookings/${bookingId}`);
}

export async function cancelBookingAction(
  bookingId: string,
  reason?: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: reason || null,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', bookingId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/bookings');
  revalidatePath(`/dashboard/bookings/${bookingId}`);
}

export async function markNoShowAction(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'no_show' })
    .eq('id', bookingId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/bookings');
  revalidatePath(`/dashboard/bookings/${bookingId}`);
}
