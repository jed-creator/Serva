import { createAdminClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface UserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const admin = createAdminClient();

  let query = admin
    .from('profiles')
    .select('id, email, first_name, last_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (q) {
    query = query.ilike('email', `%${q}%`);
  }

  const { data } = await query;
  const users = (data ?? []) as UserRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
          Users
        </h1>
        <p className="text-zinc-600 mt-1">
          Platform users. Showing {users.length} most recent.
        </p>
      </div>

      <form className="flex gap-2 items-center">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by email…"
          className="h-10 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
        />
      </form>

      {users.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No users found</CardTitle>
            {q && <CardDescription>for &quot;{q}&quot;</CardDescription>}
          </CardHeader>
        </Card>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-500">Name</th>
                <th className="px-4 py-2 font-medium text-zinc-500">Email</th>
                <th className="px-4 py-2 font-medium text-zinc-500">Role</th>
                <th className="px-4 py-2 font-medium text-zinc-500">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const name =
                  [u.first_name, u.last_name]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || '—';
                return (
                  <tr key={u.id} className="border-t border-zinc-200">
                    <td className="px-4 py-2 text-zinc-900">{name}</td>
                    <td className="px-4 py-2 text-zinc-700">{u.email}</td>
                    <td className="px-4 py-2 text-zinc-600 capitalize">
                      {u.role}
                    </td>
                    <td className="px-4 py-2 text-zinc-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
