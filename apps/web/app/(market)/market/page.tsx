import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { supabaseMarketplaceStore } from '@/lib/services/marketplace.service';

export const metadata = { title: 'Marketplace' };

interface MarketplaceListingRow {
  id: string;
  kind: 'item' | 'service';
  title: string;
  description: string | null;
  price_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

/**
 * /market — live listing of `marketplace_listings` where
 * `status = 'active'`. Uses the same store the API route uses, so
 * behavior matches `GET /api/market/listings` exactly.
 *
 * This is the user-facing neighbor-to-neighbor marketplace — separate
 * from the third-party ecommerce fan-out at /shop — so the result
 * shape is internal rows, not `NormalizedSearchResult`. RLS exposes
 * active rows to the anon role so unauthenticated visitors can browse.
 */
export default async function MarketLandingPage() {
  const client = await createClient();
  const store = supabaseMarketplaceStore(client);

  let listings: MarketplaceListingRow[] = [];
  let error: string | null = null;
  try {
    const rows = await store.listActive();
    listings = rows as unknown as MarketplaceListingRow[];
  } catch (err) {
    // Supabase can be unreachable in dev before migrations run. Show
    // the empty-state rather than crashing the page.
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Marketplace
        </h1>
        <p className="mt-2 text-zinc-600">
          Buy, sell, and swap items and services with your neighbors.
        </p>
      </header>

      <Link
        href="/market/new"
        className="inline-block rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
      >
        Create a listing
      </Link>

      {error ? (
        <div
          data-testid="market-error"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Couldn&apos;t reach the marketplace service ({error}). Listings
          will appear once the database is available.
        </div>
      ) : listings.length === 0 ? (
        <div
          data-testid="market-empty"
          className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500"
        >
          No active listings yet. Be the first to{' '}
          <Link href="/market/new" className="underline">
            create one
          </Link>
          .
        </div>
      ) : (
        <ul
          data-testid="market-listings"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {listings.map((listing) => {
            const price = (listing.price_amount / 100).toFixed(2);
            return (
              <li key={listing.id}>
                <article className="flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <header className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-zinc-900">
                      {listing.title}
                    </h2>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {listing.kind}
                    </span>
                  </header>
                  {listing.description ? (
                    <p className="line-clamp-3 text-sm text-zinc-600">
                      {listing.description}
                    </p>
                  ) : null}
                  <footer className="mt-auto text-sm font-semibold text-zinc-900">
                    {listing.currency} {price}
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
