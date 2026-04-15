/**
 * Orvo Points (Phase 8.1) — mobile read helpers.
 *
 * Mirrors the web service contract (`apps/web/lib/services/orvo-points.service.ts`)
 * but reads through the user's anon-key Supabase session. RLS only
 * lets us SELECT our own ledger rows; minting points is service-role
 * only and happens server-side after a booking completes, so the
 * mobile UI is intentionally read-only.
 */
import { supabase } from '@/lib/supabase';

export interface PointsLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  reference_id: string | null;
  reference_kind: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function getBalance(userId: string): Promise<number> {
  const { data } = await supabase
    .from('orvo_points_ledger')
    .select('amount')
    .eq('user_id', userId);
  return (data ?? []).reduce(
    (sum, row) => sum + ((row.amount as number | null) ?? 0),
    0,
  );
}

export async function getHistory(
  userId: string,
  limit = 50,
): Promise<PointsLedgerEntry[]> {
  const { data } = await supabase
    .from('orvo_points_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as PointsLedgerEntry[];
}
