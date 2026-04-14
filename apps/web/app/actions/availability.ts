'use server';

/**
 * Availability server actions.
 *
 * MVP model: one "default staff" row per business representing the owner.
 * The availability_rules table holds weekly recurring hours per staff.
 * For simplicity we DELETE then INSERT all rules on save (replace semantics).
 */
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseAvailabilityForm } from '@/lib/validations/availability';

export type AvailabilityActionState = {
  errors?: string[];
  success?: boolean;
};

async function getOrCreateDefaultStaff(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  businessId: string,
): Promise<string> {
  // Try existing
  const { data: existing } = await supabase
    .from('staff')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return existing.id;

  // Load profile for display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, phone')
    .eq('id', userId)
    .single();

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
    profile?.email ||
    'Owner';

  const { data: newStaff, error } = await supabase
    .from('staff')
    .insert({
      business_id: businessId,
      user_id: userId,
      name,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Could not create default staff: ${error.message}`);
  return newStaff.id;
}

export async function updateAvailabilityAction(
  _prevState: AvailabilityActionState | undefined,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const { rules, errors } = parseAvailabilityForm(formData);
  if (errors.length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errors: ['Not signed in.'] };

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!business) {
    return { errors: ['Create a business profile first.'] };
  }

  const staffId = await getOrCreateDefaultStaff(supabase, user.id, business.id);

  // Replace: delete then insert
  const { error: deleteError } = await supabase
    .from('availability_rules')
    .delete()
    .eq('staff_id', staffId);
  if (deleteError) return { errors: [deleteError.message] };

  if (rules.length > 0) {
    const { error: insertError } = await supabase
      .from('availability_rules')
      .insert(
        rules.map((r) => ({
          staff_id: staffId,
          day_of_week: r.day_of_week,
          start_time: r.start_time,
          end_time: r.end_time,
          is_active: true,
        })),
      );
    if (insertError) return { errors: [insertError.message] };
  }

  revalidatePath('/dashboard/availability');
  return { success: true };
}
