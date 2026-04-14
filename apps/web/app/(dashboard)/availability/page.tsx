import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AvailabilityForm } from '@/components/availability/availability-form';

const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default async function AvailabilityPage() {
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

  // Find default staff for this business (owner = user)
  const { data: staff } = await supabase
    .from('staff')
    .select('id')
    .eq('business_id', business.id)
    .eq('user_id', user.id)
    .maybeSingle();

  // Load existing rules (if any)
  const { data: rules } = staff
    ? await supabase
        .from('availability_rules')
        .select('day_of_week, start_time, end_time')
        .eq('staff_id', staff.id)
        .order('day_of_week')
    : { data: null };

  // Build a map from day_of_week -> { start, end } for defaults
  const existing: Record<number, { start: string; end: string } | undefined> =
    {};
  (rules ?? []).forEach((r) => {
    existing[r.day_of_week] = {
      start: r.start_time.slice(0, 5), // trim seconds
      end: r.end_time.slice(0, 5),
    };
  });

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Availability
        </h1>
        <p className="text-zinc-600 mt-1">
          Set your weekly working hours. Customers will only see time slots
          within these windows when booking.
        </p>
      </div>
      <AvailabilityForm dayLabels={DAY_LABELS} existing={existing} />
    </div>
  );
}
