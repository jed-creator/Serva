import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { removeReviewAction, flagReviewAction } from '@/app/actions/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  is_flagged: boolean;
  is_removed: boolean;
  business: { name: string } | null;
  consumer: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || 'flagged';
  const admin = createAdminClient();

  let query = admin
    .from('reviews')
    .select(
      `
      id, rating, comment, created_at, is_flagged, is_removed,
      business:businesses(name),
      consumer:profiles!reviews_consumer_id_fkey(email, first_name, last_name)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (filter === 'flagged') {
    query = query.eq('is_flagged', true).eq('is_removed', false);
  } else if (filter === 'removed') {
    query = query.eq('is_removed', true);
  }

  const { data } = await query;
  const reviews = (data ?? []) as unknown as ReviewRow[];

  const filters = [
    { key: 'flagged', label: 'Flagged' },
    { key: 'removed', label: 'Removed' },
    { key: 'all', label: 'All' },
  ];

  async function remove(id: string) {
    'use server';
    await removeReviewAction(id);
  }
  async function flag(id: string) {
    'use server';
    await flagReviewAction(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Review moderation
        </h1>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/reviews?filter=${f.key}`}
            className={`px-4 py-2 text-sm font-medium ${
              filter === f.key
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No {filter} reviews</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => {
            const name =
              [r.consumer?.first_name, r.consumer?.last_name]
                .filter(Boolean)
                .join(' ')
                .trim() ||
              r.consumer?.email ||
              'Anonymous';
            return (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-amber-500">
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </span>
                    <span className="text-zinc-900">{r.business?.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {name} · {new Date(r.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {r.comment && (
                    <p className="text-sm text-zinc-800">{r.comment}</p>
                  )}
                  <div className="flex gap-2">
                    {!r.is_removed && (
                      <form action={remove.bind(null, r.id)}>
                        <Button variant="destructive" size="sm" type="submit">
                          Remove
                        </Button>
                      </form>
                    )}
                    {!r.is_flagged && !r.is_removed && (
                      <form action={flag.bind(null, r.id)}>
                        <Button variant="outline" size="sm" type="submit">
                          Flag
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
