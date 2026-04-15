import '@/lib/integrations/bootstrap';
import { searchProducts } from '@/lib/services/shopping.service';
import { SearchResultsGrid } from '@/components/super-app/search-results-grid';

export const metadata = { title: 'Shop' };

/**
 * /shop — fan-out ecommerce search. Reads `?q=` from the URL, calls
 * `searchProducts`, and hands the normalized results to the shared
 * grid. No query = empty-state landing; any query triggers a fan-out
 * across every registered `ecommerce` adapter.
 */
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
        Shop
      </h1>
      <p className="mt-2 text-zinc-600">
        Find the best price on anything — across every store Orvo knows.
      </p>

      <form
        method="get"
        action="/shop"
        className="mt-6 flex max-w-xl gap-2"
        role="search"
        aria-label="Search products"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search for a product"
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
          initialPrompt="Type a product name above to compare prices across every store."
          emptyMessage="No products matched your search. Try a different term."
        />
      </div>
    </div>
  );
}
