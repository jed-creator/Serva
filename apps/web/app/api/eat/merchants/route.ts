/**
 * GET /api/eat/merchants?q=<text>
 *
 * Unified food search — delivery + grocery + restaurants in one
 * response. Empty `q` returns an empty array.
 */
import { NextResponse } from 'next/server';
import { searchMerchants } from '@/lib/services/eat.service';
import '@/lib/integrations/bootstrap';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const merchants = q ? await searchMerchants(q) : [];
  return NextResponse.json({ merchants });
}
