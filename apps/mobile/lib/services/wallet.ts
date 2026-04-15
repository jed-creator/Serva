/**
 * Wallet credits (Phase 8.4) — mobile read helpers.
 *
 * Mirrors `apps/web/lib/services/wallet.service.ts`. Mobile is read-only
 * here — wallet entries are written by Orvo's server-side flows
 * (refunds, referral bonuses, goodwill adjustments) using the
 * service-role key. RLS lets a user SELECT their own account and the
 * ledger rows belonging to it.
 */
import { supabase } from '@/lib/supabase';

export interface WalletLedgerEntry {
  id: string;
  account_id: string;
  amount_cents: number;
  reason: string;
  reference_id: string | null;
  reference_kind: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function findAccountId(
  userId: string,
  currency: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('wallet_accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('currency', currency)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export async function getBalance(
  userId: string,
  currency = 'USD',
): Promise<number> {
  const accountId = await findAccountId(userId, currency);
  if (!accountId) return 0;

  const { data } = await supabase
    .from('wallet_ledger')
    .select('amount_cents')
    .eq('account_id', accountId);
  return (data ?? []).reduce(
    (sum, row) => sum + ((row.amount_cents as number | null) ?? 0),
    0,
  );
}

export async function getHistory(
  userId: string,
  currency = 'USD',
  limit = 50,
): Promise<WalletLedgerEntry[]> {
  const accountId = await findAccountId(userId, currency);
  if (!accountId) return [];

  const { data } = await supabase
    .from('wallet_ledger')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as WalletLedgerEntry[];
}
