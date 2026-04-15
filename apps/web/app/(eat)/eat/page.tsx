import '@/lib/integrations/bootstrap';
import { searchMerchants } from '@/lib/services/eat.service';
import { SearchResultsGrid } from '@/components/super-app/search-results-grid';

export const metadata = { title: 'Eat' };

/**
 * /eat — fan-out across delivery + grocery + restaurants adapters.
 * `?q=` drives `searchMerchants`. No query = landing-state empty,
 * any query triggers a fan-out.
 */
export default async function EatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query ? await searchMerchants(query) : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
        Eat
      </h1>
      <p className="mt-2 text-zinc-600">
        Delivery, groceries, and restaurant reservations — all in one
        search.
      </p>

      <form
        method="get"
        action="/eat"
        className="mt-6 flex max-w-xl gap-2"
        role="search"
        aria-label="Search merchants"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search restaurants, groceries, delivery…"
          className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-brand-primary px-4 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="mt-8">
        <SearchResultsGrid
          results={results}
          hasQuery={Boolean(query)}
          initialPrompt="Search a cuisine, dish, or store to see delivery, pickup, and reservation options."
          emptyMessage="No merchants matched your search."
        />
      </div>
    </div>
  );
}
