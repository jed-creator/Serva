import '@/lib/integrations/bootstrap';
import { searchRideshare } from '@/lib/services/ride.service';
import { SearchResultsGrid } from '@/components/super-app/search-results-grid';

export const metadata = { title: 'Ride' };

/**
 * /ride — text-only landing for rideshare. `quoteRide` requires
 * pickup/dropoff coordinates and belongs behind a real pickup UI;
 * this page uses `searchRideshare(query)` so the landing experience
 * matches the other modules. A future step will add the map-picker +
 * `quoteRide` flow behind a dedicated "Book a ride" button.
 */
export default async function RidePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query ? await searchRideshare(query) : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
        Ride
      </h1>
      <p className="mt-2 text-zinc-600">
        Compare fares across every rideshare network — one tap, one
        ride, no app switching.
      </p>

      <form
        method="get"
        action="/ride"
        className="mt-6 flex max-w-xl gap-2"
        role="search"
        aria-label="Search rideshare"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search UberX, Lyft, Comfort…"
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
          initialPrompt="Search a ride type to see fares across every connected network."
          emptyMessage="No rideshare options matched your search."
        />
      </div>
    </div>
  );
}
