/**
 * Households (Phase 8.2) — mobile read/write helpers.
 *
 * Mirrors `apps/web/lib/services/household.service.ts`. RLS allows
 * the owner to SELECT/INSERT/UPDATE/DELETE their household and
 * household_members rows, so mobile can run the full owner workflow
 * via the anon-key client.
 *
 * `createHousehold` does the same two-step the web service does:
 * insert the household row, then insert the owner's membership row
 * with role = 'owner'. The owner-membership insert is allowed by the
 * `owner writes membership` policy because the owner_user_id check
 * already passes by the time we run it.
 */
import { supabase } from '@/lib/supabase';

export type HouseholdRole = 'owner' | 'adult' | 'child';

export interface Household {
  id: string;
  owner_user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  created_at: string;
}

export async function getOwnedHousehold(
  userId: string,
): Promise<Household | null> {
  const { data } = await supabase
    .from('households')
    .select('*')
    .eq('owner_user_id', userId)
    .maybeSingle();
  return (data ?? null) as Household | null;
}

export async function listMembers(
  householdId: string,
): Promise<HouseholdMember[]> {
  const { data } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });
  return (data ?? []) as HouseholdMember[];
}

export async function createHousehold(
  ownerUserId: string,
  name: string,
): Promise<Household> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Household name is required');

  const { data: household, error } = await supabase
    .from('households')
    .insert({ owner_user_id: ownerUserId, name: trimmed })
    .select('*')
    .single();
  if (error || !household) {
    throw error ?? new Error('Failed to create household');
  }

  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: (household as Household).id,
      user_id: ownerUserId,
      role: 'owner',
    });
  if (memberError) throw memberError;

  return household as Household;
}

export async function addMember(
  householdId: string,
  userId: string,
  role: HouseholdRole = 'adult',
): Promise<void> {
  if (role === 'owner') {
    throw new Error(
      'Only createHousehold can assign the owner role — transfer support is a future feature',
    );
  }
  const { error } = await supabase
    .from('household_members')
    .insert({ household_id: householdId, user_id: userId, role });
  if (error) throw error;
}

export async function removeMember(
  householdId: string,
  userId: string,
): Promise<void> {
  // Guard against orphaning the household — same check as the web service.
  const { data: household } = await supabase
    .from('households')
    .select('owner_user_id')
    .eq('id', householdId)
    .single();
  if ((household as { owner_user_id?: string } | null)?.owner_user_id === userId) {
    throw new Error('Cannot remove the household owner');
  }
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', userId);
  if (error) throw error;
}
