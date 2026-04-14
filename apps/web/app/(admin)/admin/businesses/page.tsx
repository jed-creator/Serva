import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  approveBusinessAction,
  rejectBusinessAction,
} from '@/app/actions/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface BusinessRow {
  id: string;
  name: string;
  approval_status: string;
  created_at: string;
  description: string | null;
  owner: { email: string; first_name: string | null; last_name: string | null } | null;
  category: { name: string | null } | null;
}

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || 'pending';
  const admin = createAdminClient();

  const { data } = await admin
    .from('businesses')
    .select(
      `
      id, name, approval_status, created_at, description,
      owner:profiles!businesses_owner_id_fkey(email, first_name, last_name),
      category:categories(name)
    `,
    )
    .eq('approval_status', status)
    .order('created_at', { ascending: false });

  const businesses = (data ?? []) as unknown as BusinessRow[];

  const statusTabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  async function approve(id: string) {
    'use server';
    await approveBusinessAction(id);
  }

  async function reject(id: string, formData: FormData) {
    'use server';
    const reason =
      formData.get('reason')?.toString() || 'Does not meet our guidelines';
    await rejectBusinessAction(id, reason);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Business approvals
        </h1>
        <p className="text-zinc-600 mt-1">
          Review and approve new business signups.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200">
        {statusTabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/businesses?status=${t.key}`}
            className={`px-4 py-2 text-sm font-medium ${
              status === t.key
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No {status} businesses</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {businesses.map((b) => {
            const owner =
              [b.owner?.first_name, b.owner?.last_name]
                .filter(Boolean)
                .join(' ')
                .trim() ||
              b.owner?.email ||
              'Unknown';
            return (
              <Card key={b.id}>
                <CardHeader>
                  <CardTitle>{b.name}</CardTitle>
                  <CardDescription>
                    {b.category?.name ?? 'No category'} · Owner: {owner}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {b.description && (
                    <p className="text-sm text-zinc-700">{b.description}</p>
                  )}
                  <p className="text-xs text-zinc-500">
                    Submitted {new Date(b.created_at).toLocaleDateString()}
                  </p>
                  {status === 'pending' && (
                    <div className="flex flex-col gap-2 border-t border-zinc-200 pt-3">
                      <form action={approve.bind(null, b.id)}>
                        <Button type="submit">Approve</Button>
                      </form>
                      <form
                        action={reject.bind(null, b.id)}
                        className="flex flex-col gap-2 mt-2"
                      >
                        <Textarea
                          name="reason"
                          placeholder="Reason for rejection (sent to owner)"
                          rows={2}
                          required
                        />
                        <Button variant="outline" type="submit">
                          Reject
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
