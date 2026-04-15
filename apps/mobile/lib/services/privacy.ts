/**
 * Privacy dashboard (Phase 8.3) — mobile read/insert helpers.
 *
 * Mirrors `apps/web/lib/services/privacy.service.ts`. RLS allows a
 * user to SELECT their own privacy_requests and INSERT new ones with
 * `user_id = auth.uid()`. Status transitions are still service-role
 * only — they happen in the background worker that processes the
 * export ZIP / deletion run, which is out of scope for the mobile UI.
 *
 * The web service also exposes `buildExportPayload` for an in-page
 * preview of what the export will contain. Mobile keeps the surface
 * smaller — we only show the request list + the two queue actions —
 * so we don't reproduce that helper here.
 */
import { supabase } from '@/lib/supabase';

export type PrivacyRequestKind = 'export' | 'delete';
export type PrivacyRequestStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface PrivacyRequest {
  id: string;
  user_id: string;
  kind: PrivacyRequestKind;
  status: PrivacyRequestStatus;
  result_url: string | null;
  error: string | null;
  requested_at: string;
  completed_at: string | null;
}

async function insertRequest(
  userId: string,
  kind: PrivacyRequestKind,
): Promise<PrivacyRequest> {
  const { data, error } = await supabase
    .from('privacy_requests')
    .insert({ user_id: userId, kind, status: 'pending' })
    .select('*')
    .single();
  if (error || !data) {
    throw error ?? new Error('Failed to create privacy request');
  }
  return data as PrivacyRequest;
}

export function requestExport(userId: string): Promise<PrivacyRequest> {
  return insertRequest(userId, 'export');
}

export function requestDeletion(userId: string): Promise<PrivacyRequest> {
  return insertRequest(userId, 'delete');
}

export async function listUserRequests(
  userId: string,
): Promise<PrivacyRequest[]> {
  const { data } = await supabase
    .from('privacy_requests')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false });
  return (data ?? []) as PrivacyRequest[];
}
