import '@/lib/integrations/bootstrap';
import Link from 'next/link';
import {
  BOOK_SUB_FILTERS,
  searchBookableServices,
} from '@/lib/services/booking.service';
import { SearchResultsGrid } from '@/components/super-app/search-results-grid';

export const metadata = { title: 'Book' };

/**
 * /book — fan-out across beauty-wellness, medspa, fitness,
 * general-booking, shopify-booking, home-services, and pet-care
 * adapters. `?q=` drives the text search; `?filter=<sub-filter key>`
 * narrows by sub-category via the service's `resolveBookFilter`
 * helper. Filter tabs are rendered from `BOOK_SUB_FILTERS` and each
 * tab preserves the current query so switching tabs refines the
 * existing search rather than clearing it.
 */
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  const query = (q ?? '').trim();
  const activeFilter = filter ?? 'all';
  const results = query
    ? await searchBookableServices(query, activeFilter)
    : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
        Book
      </h1>
      <p className="mt-2 text-zinc-600">
        Salons, spas, trainers, therapists, home services, pet care —
        every bookable provider in one search.
      </p>

      <form
        method="get"
        action="/book"
        className="mt-6 flex max-w-xl gap-2"
        role="search"
        aria-label="Search bookable services"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search a service, provider, or category"
          className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
        {/* Preserve active filter across submits. */}
        <input type="hidden" name="filter" value={activeFilter} />
        <button
          type="submit"
          className="h-10 rounded-md bg-brand-primary px-4 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
      </form>

      <nav
        aria-label="Booking sub-filters"
        data-testid="book-sub-filters"
        className="mt-6 flex flex-wrap gap-2"
      >
        {BOOK_SUB_FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          const href = {
            pathname: '/book',
            query: query ? { q: query, filter: f.key } : { filter: f.key },
          };
          return (
            <Link
              key={f.key}
              href={href}
              data-active={isActive}
              className={
                isActive
                  ? 'rounded-full bg-brand-primary px-4 py-1.5 text-xs font-medium text-white'
                  : 'rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
              }
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        <SearchResultsGrid
          results={results}
          hasQuery={Boolean(query)}
          initialPrompt="Search to see bookable providers across every vertical."
          emptyMessage="No providers matched your search in this category."
        />
      </div>
    </div>
  );
}
