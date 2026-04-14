/**
 * Eat service — fans out a food search across three categories:
 * `delivery` (Uber Eats, DoorDash, Grubhub...),
 * `grocery` (Instacart, Uber Eats Grocery...),
 * `restaurants` (OpenTable, Resy, Tock...).
 *
 * The /eat landing page presents all three verticals in a single
 * results list, so the service returns one flat array of normalized
 * merchants rather than grouping by category. The client groups at
 * render time if needed.
 *
 * `Promise.allSettled` keeps one misbehaving adapter from breaking the
 * whole fan-out.
 */
import { integrationRegistry } from '@/lib/integrations/core';
import type {
  IntegrationCategory,
  NormalizedSearchResult,
} from '@/lib/integrations/core';

const EAT_CATEGORIES: IntegrationCategory[] = [
  'delivery',
  'grocery',
  'restaurants',
];

export async function searchMerchants(
  query: string,
): Promise<NormalizedSearchResult[]> {
  const adapters = integrationRegistry
    .list()
    .filter((a) => EAT_CATEGORIES.includes(a.category));

  const settled = await Promise.allSettled(
    adapters.map((a) => a.search({ text: query })),
  );

  return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
