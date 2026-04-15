import '@/lib/integrations/bootstrap';
import { searchEvents } from '@/lib/services/tickets.service';
import { SearchResultsGrid } from '@/components/super-app/search-results-grid';

export const metadata = { title: 'Tickets' };

/**
 * /tickets — fan-out across Ticketmaster, Eventbrite, StubHub, AXS
 * and every other `tickets` adapter. `?q=` drives `searchEvents`.
 */
export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query ? await searchEvents(query) : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
        Tickets
      </h1>
      <p className="mt-2 text-zinc-600">
        Concerts, sports, theater — every marketplace in one search.
      </p>

      <form
        method="get"
        action="/tickets"
        className="mt-6 flex max-w-xl gap-2"
        role="search"
        aria-label="Search events"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search an artist, team, or venue"
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
          initialPrompt="Search an event to see availability across every ticket marketplace."
          emptyMessage="No events matched your search."
        />
      </div>
    </div>
  );
}
