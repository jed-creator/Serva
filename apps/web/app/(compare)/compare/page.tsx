import { createClient } from '@/lib/supabase/server';
import {
  compareFingerprint,
  supabasePricingStore,
  type PriceComparison,
} from '@/lib/services/pricing.service';

export const metadata = { title: 'Compare' };

/**
 * /compare — live price comparison. Takes a `?fingerprint=` query
 * string, calls `compareFingerprint` against the `price_snapshots`
 * table, and renders the per-provider breakdown plus the winner.
 *
 * The fingerprint is the pricing engine's canonical product key (a
 * stable hash used by every adapter when writing snapshots). In
 * day-to-day use, product pages will link here with the fingerprint
 * pre-filled; this page also exposes the raw input so it can be used
 * ad-hoc.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ fingerprint?: string }>;
}) {
  const { fingerprint } = await searchParams;
  const fp = (fingerprint ?? '').trim();

  let comparison: PriceComparison | null = null;
  let error: string | null = null;

  if (fp) {
    try {
      const client = await createClient();
      const store = supabasePricingStore(client);
      comparison = await compareFingerprint(store, fp);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
        Compare
      </h1>
      <p className="mt-2 text-zinc-600">
        See prices side-by-side from every store we&apos;ve checked.
      </p>

      <form
        method="get"
        action="/compare"
        className="mt-6 flex max-w-xl gap-2"
        role="search"
        aria-label="Compare by product fingerprint"
      >
        <input
          type="search"
          name="fingerprint"
          defaultValue={fp}
          placeholder="Product fingerprint (e.g. sha256:abc123…)"
          className="h-10 flex-1 rounded-md border border-zinc-300 px-3 font-mono text-xs shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-brand-primary px-4 text-sm font-medium text-white hover:opacity-90"
        >
          Compare
        </button>
      </form>

      <div className="mt-8">
        {!fp ? (
          <div
            data-testid="compare-empty"
            className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500"
          >
            Enter a product fingerprint above to see price history and
            the current winner across every provider we&apos;ve checked.
          </div>
        ) : error ? (
          <div
            data-testid="compare-error"
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Couldn&apos;t load the comparison ({error}). Price snapshots
            will appear once the pricing engine has captured them.
          </div>
        ) : comparison && comparison.byProvider.length === 0 ? (
          <div
            data-testid="compare-no-snapshots"
            className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500"
          >
            No snapshots captured yet for this fingerprint.
          </div>
        ) : comparison ? (
          <div data-testid="compare-results" className="space-y-6">
            {comparison.best ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Best price
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-4">
                  <p className="text-lg font-semibold text-emerald-900">
                    {comparison.best.provider}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {comparison.best.currency}{' '}
                    {(comparison.best.price_amount / 100).toFixed(2)}
                  </p>
                </div>
                <a
                  href={comparison.best.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-emerald-800 underline"
                >
                  Open listing
                </a>
              </div>
            ) : null}

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
                All providers
              </h2>
              <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
                {comparison.byProvider.map((row) => (
                  <li
                    key={row.provider}
                    className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {row.provider}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Captured{' '}
                        {new Date(row.captured_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-zinc-900">
                        {row.currency} {(row.price_amount / 100).toFixed(2)}
                      </span>
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-primary underline"
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
