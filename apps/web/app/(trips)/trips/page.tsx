import '@/lib/integrations/bootstrap';
import Link from 'next/link';
import { searchTravel } from '@/lib/services/trip-planner.service';
import { SearchResultsGrid } from '@/components/super-app/search-results-grid';

export const metadata = { title: 'Trips' };

/**
 * /trips — fan-out across travel + hotel-direct + experiences
 * adapters. The "Plan a new trip" affordance stays because itinerary
 * planning is a separate flow under /trips/new; this landing page is
 * now both "explore travel" (search results) and "start a trip" (CTA).
 */
export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query ? await searchTravel(query) : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
        Trips
      </h1>
      <p className="mt-2 text-zinc-600">
        Plan every piece of your trip — flights, hotels, restaurants,
        activities — from one shared itinerary.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/trips/new"
          className="inline-flex items-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Plan a new trip
        </Link>
      </div>

      <form
        method="get"
        action="/trips"
        className="mt-6 flex max-w-xl gap-2"
        role="search"
        aria-label="Search travel"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search flights, hotels, or experiences"
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
          initialPrompt="Search a destination or experience to see flights, hotels, and activities."
          emptyMessage="No travel options matched your search."
        />
      </div>
    </div>
  );
}
