/**
 * Shared results renderer for every super-app consumer page that
 * fans out across third-party adapters.
 *
 * Every `/shop`, `/eat`, `/ride`, `/trips`, `/tickets`, `/book` page
 * calls its vertical's service (`searchProducts`, `searchMerchants`,
 * etc.), hands the resulting `NormalizedSearchResult[]` to this
 * component, and the component takes care of:
 *
 *   - empty state (prompt user to search or no-results message)
 *   - per-result card: title, provider badge, subtitle, formatted
 *     price, star rating, external link
 *   - responsive grid (1 col mobile → 2 col sm → 3 col lg)
 *
 * Pages stay thin — they own search form markup and layout copy,
 * and defer all result rendering here.
 */
import type { NormalizedSearchResult } from '@/lib/integrations/core';

export interface SearchResultsGridProps {
  results: NormalizedSearchResult[];
  /**
   * Shown when `results` is empty AND the user has typed a query.
   * Defaults to a generic "No results" string.
   */
  emptyMessage?: string;
  /**
   * Shown when `results` is empty AND the user has NOT typed a query
   * (initial landing state). Defaults to a generic prompt.
   */
  initialPrompt?: string;
  /**
   * Was a search actually performed? Controls which empty state to
   * render. Pages pass `hasQuery={Boolean(q)}`.
   */
  hasQuery: boolean;
}

function formatPrice(
  price: NormalizedSearchResult['price'],
): string | null {
  if (!price) return null;
  // `amount` is integer minor units per the shared Money schema.
  const major = price.amount / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${price.currency} ${major.toFixed(2)}`;
  }
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 10) / 10;
  return (
    <span
      aria-label={`Rated ${rounded} out of 5`}
      className="inline-flex items-center gap-1 text-xs text-amber-600"
    >
      <span aria-hidden>★</span>
      {rounded.toFixed(1)}
    </span>
  );
}

export function SearchResultsGrid({
  results,
  emptyMessage = 'No results for your search. Try a different query.',
  initialPrompt = 'Type a search above to see results.',
  hasQuery,
}: SearchResultsGridProps) {
  if (results.length === 0) {
    return (
      <div
        data-testid="search-results-empty"
        className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500"
      >
        {hasQuery ? emptyMessage : initialPrompt}
      </div>
    );
  }

  return (
    <ul
      data-testid="search-results-grid"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {results.map((result) => {
        const price = formatPrice(result.price);
        const card = (
          <article className="flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
            <header className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-zinc-900">
                {result.title}
              </h3>
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {result.provider}
              </span>
            </header>

            {result.subtitle ? (
              <p className="line-clamp-2 text-sm text-zinc-600">
                {result.subtitle}
              </p>
            ) : null}

            <footer className="mt-auto flex items-center justify-between pt-2 text-sm">
              {price ? (
                <span className="font-semibold text-zinc-900">{price}</span>
              ) : (
                <span className="text-xs text-zinc-400">—</span>
              )}
              {typeof result.rating === 'number' ? (
                <StarRating rating={result.rating} />
              ) : null}
            </footer>
          </article>
        );

        const key = `${result.provider}:${result.externalId}`;
        return (
          <li key={key}>
            {result.url ? (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-xl"
              >
                {card}
              </a>
            ) : (
              card
            )}
          </li>
        );
      })}
    </ul>
  );
}
